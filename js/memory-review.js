/* Replay verified evidence to derive rubric and SM-2 once per immutable item. */
(() => {
  'use strict';
  const en=()=> (typeof LANG_MODE!=='undefined'?LANG_MODE:localStorage.getItem('pandahan_lang'))==='en';
  const tr=(vi,english)=>en()?english:vi;
  const skill=d=>en()?({FORM:'Character recognition',SOUND:'Listening and sound recognition',MEANING:'Word meaning',USAGE:'Word use in sentences',PRODUCTION:'Sentence writing'}[d]||d):names[d];
  const DAY=86400000, names={FORM:'Nhận mặt chữ',SOUND:'Nghe và nhận diện âm',MEANING:'Hiểu nghĩa',USAGE:'Dùng từ trong câu',PRODUCTION:'Tự viết câu'};
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const date=t=>t?new Date(t).toLocaleString('vi-VN'):'Chưa có';
  const rows=()=>window.PanTutorAttemptHistory?.allRows?.()||[];
  const key=(target,dimension)=>JSON.stringify([target,dimension]);
  const dayKey=t=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh'}).format(new Date(t));
  function assess(state){
    const tests=state.tests,last=tests.slice(-5),success=last.filter(x=>x.correct).length;
    if(!state.learned&&!tests.length)return {level:0,label:'Chưa học',reason:'Chưa có bài học và câu trả lời đã kiểm tra.'};
    if(!tests.length)return {level:1,label:'Đang làm quen',reason:'Đã xem mẫu; cần trả lời không nhìn gợi ý.'};
    if(!tests.at(-1).correct||last.length>=3&&success/last.length<.6)return {level:2,label:'Cần ôn thêm',reason:'Lần gần nhất sai hoặc chưa đúng 60% trong tối đa 5 câu gần nhất.'};
    const dates=new Set(tests.filter(x=>x.correct).map(x=>dayKey(x.at))),elapsed=tests.at(-1).at-tests[0].at;
    if(last.length===5&&success===5&&dates.size>=3&&elapsed>=7*DAY&&state.repetitions>=3)return {level:4,label:'Nhớ vững qua nhiều lần ôn',reason:'Đúng 5 câu gần nhất, ít nhất 3 ngày ôn, trải qua ít nhất 7 ngày và 3 lần ôn đạt liên tiếp.'};
    if(last.length>=3&&success/last.length>=.8&&dates.size>=2)return {level:3,label:'Nhớ khá chắc',reason:'Đúng ít nhất 80% của 3–5 câu gần nhất và có câu đúng ở ít nhất 2 ngày.'};
    return {level:1,label:'Đang làm quen',reason:'Đã trả lời đúng nhưng cần kiểm tra thêm ở ngày khác.'};
  }
  function replay(input){
    input=window.PanTutorVocabularyMemory?.normalize(input)||input;
    const states={},seen=new Set(),timeline=[];
    for(const row of [...input].sort((a,b)=>a.createdAt-b.createdAt||String(a.attemptId).localeCompare(String(b.attemptId)))){
      for(const [index,item] of (row.items||[]).entries()){
        const id=row.attemptId+':'+index;if(seen.has(id))continue;seen.add(id);
        if(row.taskId!=='remediation'&&row.taskId!=='memory_learning')continue;
        const target=String(item.target||''),dimension=item.dimension;if(!target||!names[dimension])continue;
        const k=key(target,dimension),state=states[k]||(states[k]={target,dimension,dayNumber:row.dayNumber,learned:false,repetitions:0,interval:0,ef:2.5,nextReview:0,lastReview:0,tests:[],history:[]});
        if(row.taskId==='memory_learning'){state.learned=true;state.learnedAt=row.createdAt;continue}
        if(item.verified!==true||typeof item.correct!=='boolean')continue;
        const before=assess(state),beforeTests=state.tests.slice(-5);if(item.learnCompleted===true)state.learned=true;
        const recall=item.memoryReview===true&&['FORM','MEANING','SOUND','USAGE','PRODUCTION'].includes(dimension);
        let quality=null;
        if(recall&&state.learned&&!item.hintShown){
          quality=item.correct?(item.confidence==='certain'&&Number(item.responseMs)>0&&Number(item.responseMs)<3000?5:4):2;
          if(quality<3){state.repetitions=0;state.interval=1}else{state.repetitions++;state.interval=state.repetitions===1?1:state.repetitions===2?6:Math.max(1,Math.round(state.interval*state.ef))}
          state.ef=Math.max(1.3,state.ef+(.1-(5-quality)*(.08+(5-quality)*.02)));
          state.lastReview=row.createdAt;state.nextReview=row.createdAt+state.interval*DAY;
        }
        if(!item.correct&&!item.hintShown&&!state.nextReview)state.nextReview=row.createdAt+DAY;
        const test={id,at:row.createdAt,correct:item.correct,responseMs:item.responseMs,quality};
        // A displayed model is not a recall test and cannot raise memory mastery.
        if(!item.hintShown){state.tests.push(test);if(item.correct)state.learned=true;}
        const after=assess(state),result={id,target,dimension,dayNumber:row.dayNumber,at:row.createdAt,input:item.input,expected:item.expected,prompt:item.prompt||'',correct:item.correct,score:item.correct?100:0,responseMs:item.responseMs,quality,before:before.label,after:after.label,beforeCorrect:beforeTests.filter(t=>t.correct).length,beforeTotal:beforeTests.length,afterCorrect:state.tests.slice(-5).filter(t=>t.correct).length,afterTotal:state.tests.slice(-5).length,reason:after.reason,nextReview:state.nextReview,synced:row.synced,recall};
        state.history.push(result);timeline.push(result);
      }
    }
    Object.values(states).forEach(s=>s.assessment=assess(s));return {states,timeline};
  }
  function getState(target,dimension){return replay(rows()).states[key(target,dimension)]}
  function allRecommendations(input){
    const api=window.PanTutorTenLayer;if(!api)return [];
    const events=api.diagnose(input),days=[...new Set(events.map(x=>x.dayNumber))];
    const unique=new Map();days.forEach(day=>api.recommendations(day,input,events).forEach(r=>{const k=key(r.target,r.dimension),old=unique.get(k);if(!old||old.createdAt<r.createdAt)unique.set(k,r)}));
    return [...unique.values()].sort((a,b)=>b.priority-a.priority);
  }
  function style(){if(document.getElementById('memoryReviewStyle'))return;const el=document.createElement('style');el.id='memoryReviewStyle';el.textContent=`
.pm-wrap{color:var(--text,#342b42);font:inherit}.pm-hero{background:linear-gradient(120deg,#fff1f7,#f3eeff);border:1px solid #f5cddd;border-radius:22px;padding:24px;margin:16px 0}.pm-hero h2{margin:0 0 8px;color:var(--pink,#dc4b8f)}.pm-muted{font-size:15px;color:var(--text-light,#746b80);line-height:1.6}.pm-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}.pm-card{padding:18px;background:var(--surface,#fff);border:1px solid #eadfeb;border-radius:17px;margin:10px 0;box-shadow:0 4px 15px #5e385a08}.pm-card h3{margin:0 0 9px}.pm-btn{padding:10px 15px;border:1px solid #e8ccde;border-radius:11px;background:#fff;color:#88366a;font:inherit;cursor:pointer}.pm-btn.primary{background:var(--pink,#e65498);color:white;border-color:transparent}.pm-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:12px}.pm-pill{display:inline-block;background:#f8eefa;color:#8e3d80;border-radius:99px;padding:5px 10px;font-size:14px}.pm-table{width:100%;border-collapse:collapse;font-size:15px}.pm-table td,.pm-table th{padding:10px;border-bottom:1px solid #eee2ed;text-align:left;vertical-align:top}.pm-scroll{overflow:auto}.pm-ok{color:#167649}.pm-wrong{color:#b03755}.pm-filter{padding:10px;border:1px solid #e8ccde;border-radius:10px;font:inherit;max-width:100%;background:white}.pm-count{font-size:28px;font-weight:800;color:var(--pink,#dc4b8f)}@media(max-width:600px){.pm-hero{padding:16px}.pm-card{padding:14px}.pm-grid{grid-template-columns:1fr}.pm-table{min-width:560px}}
#memoryContent{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;align-items:start}#memoryContent .pm-card{margin:0;padding:20px;border:1px solid #dfd8ef;border-top:4px solid var(--pink,#e65498);box-shadow:0 5px 18px #5333650a;font:inherit;font-size:18px;line-height:1.55}#memoryContent h3{font-size:22px;line-height:1.35;margin:12px 0}#memoryContent .pm-error-analysis p{margin:10px 0}#memoryContent .pm-error-analysis b{color:var(--pink,#b6397b)}#memoryContent .pm-btn{font:inherit;font-weight:700;min-height:46px}#memoryContent .pm-pill{font-size:15px;font-weight:700}#memoryDueReminder{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px 18px;margin:14px 0;border:1px solid #f59e0b;border-radius:14px;background:linear-gradient(100deg,#fff7d1,#ffe996);color:#92400e;font:inherit;font-size:18px}#memoryDueReminder>div{display:flex;gap:8px;flex-wrap:wrap}#memoryDueReminder button{font:inherit;font-weight:700;min-height:44px;padding:8px 14px;border:0;border-radius:9px;background:#f59e0b;color:white;cursor:pointer}#memoryDueReminder [data-review]{background:#16a34a}#memoryDueReminder [data-dismiss]{background:transparent;color:#92400e;border:1px solid #dba142}@media(max-width:760px){#memoryContent{grid-template-columns:1fr}#memoryDueReminder{font-size:16px}}
`;document.head.appendChild(el)}
  function historyHtml(input){
    const attempts=(window.PanTutorVocabularyMemory?.normalize(input)||input).filter(r=>['remediation','teacherDraft','memory_learning'].includes(r.taskId)&&r.items?.length).slice().sort((a,b)=>b.createdAt-a.createdAt),model=replay(input),map=new Map(model.timeline.map(t=>[t.id,t]));
    if(!attempts.length)return '<p class="pm-muted">Chưa có lượt luyện bổ sung. Kết quả sẽ xuất hiện sau khi bạn làm bài.</p>';
    return attempts.map(r=>`<details class="pm-card"><summary><b>Ngày ${Number(r.dayNumber)} · ${date(r.createdAt)}</b> · ${r.taskId==='teacherDraft'?'Chờ chấm':r.taskId==='memory_learning'?'Đã xem mẫu':r.scorePercent+'/100'} · ${r.synced?'Đã đồng bộ':'Đã lưu trên máy · chờ đồng bộ'}</summary>${r.items.map((i,n)=>{const derived=map.get(r.attemptId+':'+n),result=i.rubricResult?{...derived,...i.rubricResult}:derived;return `<div style="padding-top:12px"><b>${esc(i.target||'')} · ${esc(names[i.dimension]||'')}</b><p>${esc(i.prompt||'Câu hỏi của phiên bản cũ chưa được lưu.')}</p><div>Bạn trả lời: <b>${esc(i.input||'—')}</b></div><div>Đáp án: ${esc(i.expected||'—')}</div><div class="${i.correct?'pm-ok':'pm-wrong'}">${typeof i.correct==='boolean'?(i.correct?'Đúng':'Sai'):'Chưa chấm'}${Number(i.responseMs)>0?' · '+(i.responseMs/1000).toFixed(1)+' giây':''}</div>${result?`<p>${esc(result.before)} → <b>${esc(result.after)}</b><br><small>${esc(result.reason)}</small></p><div>Lịch ôn: ${result.nextReview?date(result.nextReview):'Chưa bắt đầu lịch ghi nhớ cho kỹ năng này'}</div>`:''}</div>`}).join('')}</details>`).join('');
  }
  function resultsHtml(input,showTitle=true,wordStats=null){
    style();
    const model=replay(input),states=Object.values(model.states);
    if(wordStats)states.forEach(s=>{const word=wordStats[s.target];if(word&&(s.dimension==='MEANING'||s.dimension===word.wordMemoryDimension)){s.nextReview=word.nextReview||0;s.lastReview=word.studyLog?.at(-1)?.t||0}});
    return `<div class="pm-wrap">${showTitle?'<h3>Kết quả ghi nhớ</h3>':''}<p class="pm-muted">Đánh giá riêng từng kỹ năng từ câu trả lời đã kiểm tra. Câu viết chờ chấm chưa được tính điểm.</p><details class="pm-card"><summary>Tiêu chí đánh giá</summary><ul><li>Chưa học: chưa có bước học và câu trả lời đã kiểm tra.</li><li>Đang làm quen: mới xem mẫu hoặc mới có câu đúng; cần kiểm tra lại vào ngày khác.</li><li>Cần ôn thêm: lần gần nhất sai hoặc đúng dưới 60% của tối đa 5 câu gần nhất.</li><li>Nhớ khá chắc: đúng ít nhất 80% của 3–5 câu gần nhất, ở ít nhất 2 ngày.</li><li>Nhớ vững qua nhiều lần ôn: đúng 5 câu gần nhất, ít nhất 3 ngày ôn trải qua 7 ngày, và 3 lần ôn ghi nhớ đạt liên tiếp.</li></ul><p class="pm-muted">Xem đáp án không được tính là nhớ. Thời gian chỉ hỗ trợ đánh giá khi bài có đo thời gian. Bài nhận diện âm không chứng minh khả năng phát âm; điểm dùng từ không thay thế điểm hiểu nghĩa.</p></details>${states.length?`<div class="pm-scroll"><table class="pm-table"><thead><tr><th>Từ / kỹ năng</th><th>Kết quả</th><th>Căn cứ</th><th>Ôn gần nhất / tiếp theo</th></tr></thead><tbody>${states.map(s=>`<tr><td><b>${esc(s.target)}</b><br>${esc(names[s.dimension])}</td><td>${esc(s.assessment.label)}</td><td>${s.tests.filter(t=>t.correct).length}/${s.tests.length} câu đúng<br>${esc(s.assessment.reason)}</td><td>${date(s.lastReview)}<br>${s.nextReview?date(s.nextReview):'Chưa có lịch ôn ghi nhớ'}</td></tr>`).join('')}</tbody></table></div>`:'<p class="pm-muted">Chưa có kết quả theo tiêu chí mới. Bạn có thể bắt đầu trong Ôn tập & ghi nhớ; các lượt cũ vẫn có trong lịch sử bên dưới.</p>'}<details><summary>Xem kết quả từng lượt và thay đổi trước/sau</summary>${historyHtml(input)}</details></div>`;
  }
  function mountDashboard(){
    // Keep evidence and assessment APIs active; hide the learner-facing detail panel.
    if(document.getElementById('memoryResultsPanel')?.hidden)return;
    style();
    const host=document.getElementById('memoryResults');
    if(host)host.innerHTML=(window.PanTutorVocabularyMemory?.wordTable()||'')+resultsHtml(rows(),false,typeof STATS!=='undefined'?STATS:null);
  }

  let section='today';
  function openPractice(){style();document.querySelectorAll(".nav-tabs button").forEach(b=>b.classList.toggle("active",b.dataset.tab==="memoryPractice"));if(typeof window.showScreen==='function')window.showScreen('memoryPractice');else{window.switchTab?.('dashboard');document.getElementById('dashboardView')?.style&&(document.getElementById('dashboardView').style.display='none')}let host=document.getElementById('memoryPracticeView');if(!host){host=document.createElement('section');host.id='memoryPracticeView';host.className='dashboard-view pm-wrap';document.getElementById('dashboardView').insertAdjacentElement('afterend',host)}host.style.display='block';renderPractice()}
  function reviewQueue(){
    const input=rows(),states=Object.values(replay(input).states),now=Date.now();
    const due=states.filter(s=>s.nextReview&&s.nextReview<=now);
    const details=(target,dimension)=>window.PanTutorTenLayer?.errorDetails?.(target,dimension,input)||"";
    const dueKeys=new Set(due.map(s=>key(s.target,s.dimension)));
    const recs=allRecommendations(input).filter(r=>{const state=states.find(s=>s.target===r.target&&s.dimension===r.dimension);return !dueKeys.has(key(r.target,r.dimension))&&(!state?.tests.at(-1)?.correct||!state.nextReview||state.nextReview<=now)});
    // Unverified free writing is a practice reminder, never a memory grade.
    const pending=new Map();for(const row of input)for(const item of row.items||[]){if((row.taskId==='teacherDraft'||row.taskId==='reading_writing'&&item.kind==='writing')&&!(item.verified===true&&typeof item.correct==='boolean'))pending.set(item.target||item.char,{...item,dayNumber:row.dayNumber,attemptId:row.attemptId,createdAt:row.createdAt});}
    const writing=[...pending.values()].filter(i=>(i.target||i.char)&&!states.some(s=>s.target===(i.target||i.char)&&['USAGE','PRODUCTION'].includes(s.dimension)&&s.tests.some(t=>t.at>i.createdAt&&t.correct)));
    const speechLatest=new Map();
    for(const row of [...input].sort((a,b)=>a.createdAt-b.createdAt))if(row.taskId==='speaking')for(const item of row.items||[]){const target=item.word||item.target;if(target)speechLatest.set(target,{...item,target,dayNumber:row.dayNumber,at:row.createdAt});}
    const speech=[...speechLatest.values()].filter(i=>i.audioOnly||Number(i.score)<75||i.correct===false);
    return {input,due,recs,writing,speech};
  }
  function renderPractice(){
    const host=document.getElementById('memoryPracticeView');if(!host||host.style.display==='none')return;
    const {input,due,recs,writing,speech}=reviewQueue();
    const details=(target,dimension)=>window.PanTutorTenLayer?.errorDetails?.(target,dimension,input)||'';
    const card=(badge,title,body,buttons)=>`<article class="pm-card"><span class="pm-pill">${badge}</span><h3>${title}</h3>${body}<div class="pm-actions">${buttons}</div></article>`;
    const btn=(attrs,vi,eng,primary=true)=>`<button class="pm-btn ${primary?'primary':''}" ${attrs}>${tr(vi,eng)}</button>`;
    host.innerHTML=`<div class="pm-hero"><button class="pm-btn" data-back>${tr('← Tiến độ & Rubric','← Progress & Rubric')}</button><h2>🧠 ${tr('Ôn tập & ghi nhớ','Review & memory')}</h2></div><h3>${tr('Cần ôn hôm nay','Review today')}</h3><div id="memoryContent">`+
    due.map((s,i)=>card(tr('⏰ Đến hạn ôn','⏰ Review due'),esc(s.target)+' · '+esc(skill(s.dimension)),details(s.target,s.dimension),btn(`data-due="${i}"`,'Ôn ngay','Review now'))).join('')+
    recs.map((r,i)=>card(tr('📌 Ngày ','📌 Day ')+Number(r.dayNumber),esc(r.target)+' · '+esc(skill(r.dimension)),details(r.target,r.dimension),btn(`data-rec="${i}" data-choice="practice"`,'Luyện ngay','Practise now')+btn(`data-rec="${i}" data-choice="explain"`,'Xem hướng dẫn','View guidance',false))).join('')+
    writing.map((i,n)=>card(tr('✍️ Bài viết cần kiểm tra','✍️ Writing awaiting review'),esc(i.target||i.char),`<p>${esc(i.input)}</p><p class="pm-muted">${tr('Câu viết chưa được xác minh; chưa tính điểm ghi nhớ.','This sentence awaits verification and has not been graded for memory.')}</p>`,btn(`data-writing="${n}"`,'Viết lại câu','Rewrite sentence'))).join('')+
    speech.map((i,n)=>card(tr('🎙️ Phát âm cần kiểm tra','🎙️ Pronunciation to check'),esc(i.target)+' · '+esc(i.pinyin||''),`<p><b>${tr('Mẫu:','Model:')}</b> ${esc(i.expected||i.target)}<br><b>${tr('Máy nghe:','Recognized:')}</b> ${esc(i.recognized||i.input||tr('Chưa nhận diện được','Not recognized'))}</p><p class="pm-muted">${tr('Nghe mẫu và thu âm lại ở nơi yên tĩnh. Kết quả nhận diện chưa phải kết luận chắc chắn về phát âm.','Listen to the model and record again in a quiet place. Recognition alone does not establish a pronunciation error.')}</p>`,btn(`data-speech="${n}"`,'Luyện đọc lại','Practise speaking'))).join('')+
    (!due.length&&!recs.length&&!writing.length&&!speech.length?`<p class="pm-card">${tr('Chưa có mục cần ôn hôm nay.','No review items are due today.')}</p>`:'')+'</div>';
    host.querySelector('[data-back]').onclick=()=>window.switchTab?.('dashboard');
    host.querySelectorAll('[data-speech]').forEach(b=>b.onclick=()=>{const i=speech[Number(b.dataset.speech)];window.PandaHanCoachSkills?.openSpeaking?.({...window.PandaHanMission?.getCurrent?.(),dayNumber:i.dayNumber,reviewGate:window.PanTutorReviewGate?.tagFor?.(i.target,'SOUND','speaking'),reviewTarget:{char:i.target,pinyin:i.pinyin||'',meaning:''}})});
    host.querySelectorAll('[data-rec]').forEach(b=>b.onclick=async()=>{await window.PanTutorTenLayer.choose(recs[Number(b.dataset.rec)],b.dataset.choice);renderPractice()});
    host.querySelectorAll('[data-due]').forEach(b=>b.onclick=()=>{const s=due[Number(b.dataset.due)];window.PanTutorTenLayer.open({id:'due:'+key(s.target,s.dimension),target:s.target,dimension:s.dimension,dayNumber:s.dayNumber,diagnosisClass:['USAGE','PRODUCTION'].includes(s.dimension)?10:s.dimension==='SOUND'?4:s.dimension==='FORM'?5:2,label:tr('Ôn lại kỹ năng','Skill review'),attemptId:s.tests.at(-1)?.id||'',reason:tr('Đã đến lịch ôn.','Review is due.')})});
    host.querySelectorAll('[data-writing]').forEach(b=>b.onclick=()=>{const i=writing[Number(b.dataset.writing)];window.PanTutorTenLayer.open({target:i.target||i.char,dimension:'USAGE',dayNumber:i.dayNumber,diagnosisClass:10,input:i.input,attemptId:i.attemptId})});
  }
  let dismissed='';
  function refreshReminder(){
    const host=document.getElementById('aiCoachView');if(!host)return;
    const {due,recs,writing,speech}=reviewQueue(),ids=[...due,...recs,...writing,...speech].map(i=>[i.target||i.char,i.dimension||'pending',i.createdAt||i.at||i.nextReview||'']);
    const signature=(window.firebase?.auth?.().currentUser?.uid||'guest')+JSON.stringify(ids);
    let banner=document.getElementById('memoryDueReminder');
    if(!ids.length||dismissed===signature){banner?.remove();return;}
    if(!banner){banner=document.createElement('aside');banner.id='memoryDueReminder';banner.setAttribute('aria-label','Review reminder');host.prepend(banner)}
    banner.innerHTML=`<strong>🔔 ${tr('Bạn có '+ids.length+' mục cần ôn lại!','You have '+ids.length+' items to review!')}</strong><div><button data-hear>🔊 ${tr('Nghe nhắc nhở','Hear reminder')}</button><button data-review>▶ ${tr('Ôn tập ngay','Review now')}</button><button data-dismiss aria-label="${tr('Đóng nhắc nhở','Dismiss reminder')}">×</button></div>`;
    banner.querySelector('[data-review]').onclick=openPractice;
    banner.querySelector('[data-dismiss]').onclick=()=>{dismissed=signature;banner.remove()};
    banner.querySelector('[data-hear]').onclick=()=>{if(!window.speechSynthesis)return;const u=new SpeechSynthesisUtterance(tr('Bạn có '+ids.length+' mục cần ôn lại. Hãy mở Ôn tập và ghi nhớ.','You have '+ids.length+' review items. Open Review and memory to practise.'));u.lang=en()?'en-US':'vi-VN';speechSynthesis.cancel();speechSynthesis.speak(u)};
  }
  function feedback(row){const model=replay(rows()),result=model.timeline.find(x=>x.id===row?.attemptId+':0');if(!result)return '';if(en())return `<p><b>Review result:</b> ${result.correct?'Correct':'Needs more practice'}.<br>Recent answers: ${result.beforeCorrect}/${result.beforeTotal} before → ${result.afterCorrect}/${result.afterTotal} now.<br>${result.nextReview?'Next review: '+new Date(result.nextReview).toLocaleString('en-US'):'Continue practising this skill; the meaning schedule is unchanged.'}</p>`;return `<p><b>Kết quả ghi nhớ:</b> ${esc(result.before)} → ${esc(result.after)}.<br>Trong tối đa 5 câu gần nhất: trước đúng ${result.beforeCorrect}/${result.beforeTotal}, sau đúng ${result.afterCorrect}/${result.afterTotal}.<br>${esc(result.reason)}<br>${result.nextReview?'Ôn tiếp: '+date(result.nextReview):'Tiếp tục luyện kỹ năng này; chưa thay đổi lịch ghi nhớ nghĩa.'}</p>`}
  function snapshot(row,previous){
    if(row.taskId!=="remediation")return row;
    const results=new Map(replay([...previous,row]).timeline.map(x=>[x.id,x]));
    return {...row,items:row.items.map((item,i)=>{const result=results.get(row.attemptId+':'+i);return result?{...item,rubricVersion:"memory-v1",rubricResult:{before:result.before,after:result.after,reason:result.reason,beforeCorrect:result.beforeCorrect,beforeTotal:result.beforeTotal,afterCorrect:result.afterCorrect,afterTotal:result.afterTotal,quality:result.quality,nextReview:result.nextReview,score:result.score}}:item})};
  }
  window.addEventListener('pandahan-language-changed',()=>{renderPractice();refreshReminder()});
  window.addEventListener('DOMContentLoaded',()=>{style();refreshReminder()});
  window.addEventListener('focus',refreshReminder);
  window.firebase?.auth?.().onAuthStateChanged(()=>{dismissed='';setTimeout(()=>{refreshReminder();renderPractice()},0)});
  setInterval(()=>{if(!document.hidden)refreshReminder()},60000);
  window.PanTutorMemory={reviewQueue,refreshReminder,snapshot,replay,assess,getState,openPractice,renderPractice,mountDashboard,historyHtml,resultsHtml,feedback};
  window.addEventListener('pantutor-vocabulary-memory-updated',()=>{if(document.getElementById('dashboardView')?.style.display==='block')mountDashboard()});
  window.addEventListener('pantutor-attempt-saved',()=>{refreshReminder();renderPractice();if(document.getElementById('dashboardView')?.style.display==='block')mountDashboard()});
})();
