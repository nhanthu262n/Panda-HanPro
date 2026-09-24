/* Replay verified evidence to derive rubric and SM-2 once per immutable item. */
(() => {
  'use strict';
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
        const recall=item.memoryReview===true&&['FORM','MEANING','SOUND'].includes(dimension);
        let quality=null;
        if(recall&&state.learned&&!item.hintShown){
          quality=item.correct?(item.confidence==='certain'&&Number(item.responseMs)>0&&Number(item.responseMs)<=3500?5:4):2;
          if(quality<3){state.repetitions=0;state.interval=1}else{state.repetitions++;state.interval=state.repetitions===1?1:state.repetitions===2?6:Math.max(1,Math.round(state.interval*state.ef))}
          state.ef=Math.max(1.3,state.ef+(.1-(5-quality)*(.08+(5-quality)*.02)));
          state.lastReview=row.createdAt;state.nextReview=row.createdAt+state.interval*DAY;
        }
        const test={id,at:row.createdAt,correct:item.correct,responseMs:item.responseMs,quality};
        // A displayed model is not a recall test and cannot raise memory mastery.
        if(!item.hintShown)state.tests.push(test);
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
.pm-wrap{color:var(--text,#342b42);font:inherit}.pm-hero{background:linear-gradient(120deg,#fff1f7,#f3eeff);border:1px solid #f5cddd;border-radius:22px;padding:24px;margin:16px 0}.pm-hero h2{margin:0 0 8px;color:var(--pink,#dc4b8f)}.pm-muted{font-size:13px;color:var(--text-light,#746b80);line-height:1.6}.pm-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}.pm-card{padding:18px;background:var(--surface,#fff);border:1px solid #eadfeb;border-radius:17px;margin:10px 0;box-shadow:0 4px 15px #5e385a08}.pm-card h3{margin:0 0 9px}.pm-btn{padding:10px 15px;border:1px solid #e8ccde;border-radius:11px;background:#fff;color:#88366a;font:inherit;cursor:pointer}.pm-btn.primary{background:var(--pink,#e65498);color:white;border-color:transparent}.pm-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:12px}.pm-pill{display:inline-block;background:#f8eefa;color:#8e3d80;border-radius:99px;padding:5px 10px;font-size:12px}.pm-table{width:100%;border-collapse:collapse;font-size:13px}.pm-table td,.pm-table th{padding:10px;border-bottom:1px solid #eee2ed;text-align:left;vertical-align:top}.pm-scroll{overflow:auto}.pm-ok{color:#167649}.pm-wrong{color:#b03755}.pm-filter{padding:10px;border:1px solid #e8ccde;border-radius:10px;font:inherit;max-width:100%;background:white}.pm-count{font-size:28px;font-weight:800;color:var(--pink,#dc4b8f)}@media(max-width:600px){.pm-hero{padding:16px}.pm-card{padding:14px}.pm-grid{grid-template-columns:1fr}.pm-table{min-width:560px}}
`;document.head.appendChild(el)}
  function historyHtml(input){
    const attempts=input.filter(r=>['remediation','teacherDraft','memory_learning'].includes(r.taskId)).slice().sort((a,b)=>b.createdAt-a.createdAt),model=replay(input),map=new Map(model.timeline.map(t=>[t.id,t]));
    if(!attempts.length)return '<p class="pm-muted">Chưa có lượt luyện bổ sung. Kết quả sẽ xuất hiện sau khi bạn làm bài.</p>';
    return attempts.map(r=>`<details class="pm-card"><summary><b>Ngày ${Number(r.dayNumber)} · ${date(r.createdAt)}</b> · ${r.taskId==='teacherDraft'?'Chờ chấm':r.taskId==='memory_learning'?'Đã xem mẫu':r.scorePercent+'/100'} · ${r.synced?'Đã đồng bộ':'Đã lưu trên máy · chờ đồng bộ'}</summary>${r.items.map((i,n)=>{const derived=map.get(r.attemptId+':'+n),result=i.rubricResult?{...derived,...i.rubricResult}:derived;return `<div style="padding-top:12px"><b>${esc(i.target||'')} · ${esc(names[i.dimension]||'')}</b><p>${esc(i.prompt||'Câu hỏi của phiên bản cũ chưa được lưu.')}</p><div>Bạn trả lời: <b>${esc(i.input||'—')}</b></div><div>Đáp án: ${esc(i.expected||'—')}</div><div class="${i.correct?'pm-ok':'pm-wrong'}">${typeof i.correct==='boolean'?(i.correct?'Đúng':'Sai'):'Chưa chấm'}${Number(i.responseMs)>0?' · '+(i.responseMs/1000).toFixed(1)+' giây':''}</div>${result?`<p>${esc(result.before)} → <b>${esc(result.after)}</b><br><small>${esc(result.reason)}</small></p><div>Lịch ôn: ${result.nextReview?date(result.nextReview):'Chưa bắt đầu lịch ghi nhớ cho kỹ năng này'}</div>`:''}</div>`}).join('')}</details>`).join('');
  }
  function resultsHtml(input,showTitle=true){
    style();
    const model=replay(input),states=Object.values(model.states);
    return `<div class="pm-wrap">${showTitle?'<h3>Kết quả ghi nhớ</h3>':''}<p class="pm-muted">Đánh giá riêng từng kỹ năng từ câu trả lời đã kiểm tra. Câu viết chờ chấm chưa được tính điểm.</p><details class="pm-card"><summary>Tiêu chí đánh giá</summary><ul><li>Chưa học: chưa có bước học và câu trả lời đã kiểm tra.</li><li>Đang làm quen: mới xem mẫu hoặc mới có câu đúng; cần kiểm tra lại vào ngày khác.</li><li>Cần ôn thêm: lần gần nhất sai hoặc đúng dưới 60% của tối đa 5 câu gần nhất.</li><li>Nhớ khá chắc: đúng ít nhất 80% của 3–5 câu gần nhất, ở ít nhất 2 ngày.</li><li>Nhớ vững qua nhiều lần ôn: đúng 5 câu gần nhất, ít nhất 3 ngày ôn trải qua 7 ngày, và 3 lần ôn ghi nhớ đạt liên tiếp.</li></ul><p class="pm-muted">Xem đáp án không được tính là nhớ. Thời gian chỉ hỗ trợ đánh giá khi bài có đo thời gian. Bài nhận diện âm không chứng minh khả năng phát âm; điểm dùng từ không thay thế điểm hiểu nghĩa.</p></details>${states.length?`<div class="pm-scroll"><table class="pm-table"><thead><tr><th>Từ / kỹ năng</th><th>Kết quả</th><th>Căn cứ</th><th>Ôn gần nhất / tiếp theo</th></tr></thead><tbody>${states.map(s=>`<tr><td><b>${esc(s.target)}</b><br>${esc(names[s.dimension])}</td><td>${esc(s.assessment.label)}</td><td>${s.tests.filter(t=>t.correct).length}/${s.tests.length} câu đúng<br>${esc(s.assessment.reason)}</td><td>${date(s.lastReview)}<br>${s.nextReview?date(s.nextReview):'Chưa có lịch ôn ghi nhớ'}</td></tr>`).join('')}</tbody></table></div>`:'<p class="pm-muted">Chưa có kết quả theo tiêu chí mới. Bạn có thể bắt đầu trong Ôn tập & ghi nhớ; các lượt cũ vẫn có trong lịch sử bên dưới.</p>'}<details><summary>Xem kết quả từng lượt và thay đổi trước/sau</summary>${historyHtml(input)}</details></div>`;
  }
  function mountDashboard(){
    style();
    const host=document.getElementById('memoryResults');
    if(host)host.innerHTML=resultsHtml(rows(),false);
  }

  let section='today';
  function openPractice(){style();document.querySelectorAll(".nav-tabs button").forEach(b=>b.classList.toggle("active",b.dataset.tab==="memoryPractice"));if(typeof window.showScreen==='function')window.showScreen('memoryPractice');else{window.switchTab?.('dashboard');document.getElementById('dashboardView')?.style&&(document.getElementById('dashboardView').style.display='none')}let host=document.getElementById('memoryPracticeView');if(!host){host=document.createElement('section');host.id='memoryPracticeView';host.className='dashboard-view pm-wrap';document.getElementById('dashboardView').insertAdjacentElement('afterend',host)}host.style.display='block';renderPractice()}
  function renderPractice(){
    const host=document.getElementById('memoryPracticeView');if(!host||host.style.display==='none')return;
    const input=rows(),all=allRecommendations(input),states=Object.values(replay(input).states),due=states.filter(s=>s.nextReview&&s.nextReview<=Date.now()),future=states.filter(s=>s.nextReview>Date.now()).sort((a,b)=>a.nextReview-b.nextReview);
    const skipped=new Set(input.filter(r=>r.taskId==='recommendation_choice').sort((a,b)=>a.createdAt-b.createdAt).reduce((arr,r)=>{const i=r.items?.[0];if(!i)return arr;const old=arr.findIndex(x=>x[0]===i.recommendationId);if(old>=0)arr.splice(old,1);arr.push([i.recommendationId,i.choice]);return arr},[]).filter(x=>x[1]==='skip').map(x=>x[0]));
    const recs=section==='later'?all.filter(r=>skipped.has(r.id)):all.filter(r=>!skipped.has(r.id));
    host.innerHTML=`<div class="pm-hero"><button class="pm-btn" data-back>← Tiến bộ & Rubric</button><h2 style="margin-top:15px">Ôn tập & ghi nhớ</h2><p class="pm-muted">Chọn phần cần luyện, xem lại lỗi và theo dõi lịch ôn của bạn.</p><div class="pm-grid"><div><span class="pm-count">${due.length}</span><br>mục đến hạn</div><div><span class="pm-count">${all.length}</span><br>gợi ý luyện thêm</div><div><span class="pm-count">${future.length}</span><br>mục ôn sắp tới</div></div></div><div class="pm-actions">${[['today','Cần ôn hôm nay'],['schedule','Lịch ôn sắp tới'],['history','Lịch sử làm bài'],['later','Để sau']].map(([id,label])=>`<button class="pm-btn ${section===id?'primary':''}" data-section="${id}">${label}</button>`).join('')}</div><div id="memoryContent"></div>`;
    const content=host.querySelector('#memoryContent');
    if(section==='history')content.innerHTML=historyHtml(input);
    else if(section==='schedule')content.innerHTML=future.length?future.map(s=>`<article class="pm-card"><b>${esc(s.target)} · ${esc(names[s.dimension])}</b><p>Ôn tiếp: ${date(s.nextReview)}</p><small>${s.repetitions} lần ôn đạt liên tiếp · khoảng ôn ${s.interval} ngày</small></article>`).join(''):'<p class="pm-card">Chưa có lịch ôn sắp tới. Học mẫu và hoàn thành câu kiểm tra để bắt đầu.</p>';
    else{
      content.innerHTML=`${section==='today'?due.map((s,i)=>`<article class="pm-card"><span class="pm-pill">Đến hạn ôn</span><h3>${esc(s.target)} · ${esc(names[s.dimension])}</h3><p>${esc(s.assessment.label)} · Ngày học ${Number(s.dayNumber)}</p><p class="pm-muted">Lần ôn gần nhất: ${date(s.lastReview)}. Đã đến thời điểm kiểm tra lại khả năng nhớ.</p><button class="pm-btn primary" data-due="${i}">Ôn ngay</button></article>`).join(''):''}${recs.length?recs.map((r,i)=>`<article class="pm-card"><span class="pm-pill">Ngày ${Number(r.dayNumber)} · ${esc(names[r.dimension])}</span><h3 style="margin-top:10px">${esc(r.target)} · ${esc(r.label)}</h3><p>${esc(r.reason)}</p><p class="pm-muted">Đúng ${r.evidence.correct}/${r.evidence.total} câu gần đây · ${esc(r.action)}</p><div class="pm-actions"><button class="pm-btn primary" data-rec="${i}" data-choice="practice">Luyện ngay</button><button class="pm-btn" data-rec="${i}" data-choice="explain">Xem hướng dẫn</button><button class="pm-btn" data-rec="${i}" data-choice="${section==='later'?'pending':'skip'}">${section==='later'?'Đưa lại danh sách':'Để sau'}</button></div></article>`).join(''):(!due.length||section==='later'?'<p class="pm-card">Chưa có mục cần luyện ở đây. Hãy làm bài trong lộ trình để có kết quả đề xuất.</p>':'')}`;
      content.querySelectorAll('[data-rec]').forEach(b=>b.onclick=async()=>{try{await window.PanTutorTenLayer.choose(recs[Number(b.dataset.rec)],b.dataset.choice);renderPractice()}catch(e){alert('Chưa lưu được lựa chọn: '+e.message)}});
      content.querySelectorAll('[data-due]').forEach(b=>b.onclick=()=>{const s=due[Number(b.dataset.due)];window.PanTutorTenLayer.open({id:'due:'+key(s.target,s.dimension),target:s.target,dimension:s.dimension,dayNumber:s.dayNumber,diagnosisClass:2,label:'Kiểm tra lại khả năng nhớ',attemptId:s.tests.at(-1)?.id||'',reason:'Đã đến lịch ôn của từ này.'})});
    }
    host.querySelector('[data-back]').onclick=()=>window.switchTab?.('dashboard');host.querySelectorAll('[data-section]').forEach(b=>b.onclick=()=>{section=b.dataset.section;renderPractice()});
  }
  function feedback(row){const model=replay(rows()),result=model.timeline.find(x=>x.id===row?.attemptId+':0');if(!result)return '';return `<p><b>Kết quả ghi nhớ:</b> ${esc(result.before)} → ${esc(result.after)}.<br>Trong tối đa 5 câu gần nhất: trước đúng ${result.beforeCorrect}/${result.beforeTotal}, sau đúng ${result.afterCorrect}/${result.afterTotal}.<br>${esc(result.reason)}<br>${result.nextReview?'Ôn tiếp: '+date(result.nextReview):'Tiếp tục luyện kỹ năng này; chưa thay đổi lịch ghi nhớ nghĩa.'}</p><button class="ptt-secondary" type="button" data-memory-results>Xem Kết quả ghi nhớ</button>`}
  function snapshot(row,previous){
    if(row.taskId!=="remediation")return row;
    const results=new Map(replay([...previous,row]).timeline.map(x=>[x.id,x]));
    return {...row,items:row.items.map((item,i)=>{const result=results.get(row.attemptId+':'+i);return result?{...item,rubricVersion:"memory-v1",rubricResult:{before:result.before,after:result.after,reason:result.reason,beforeCorrect:result.beforeCorrect,beforeTotal:result.beforeTotal,afterCorrect:result.afterCorrect,afterTotal:result.afterTotal,quality:result.quality,nextReview:result.nextReview,score:result.score}}:item})};
  }
  window.PanTutorMemory={snapshot,replay,assess,getState,openPractice,renderPractice,mountDashboard,historyHtml,resultsHtml,feedback};
  window.addEventListener('pantutor-attempt-saved',()=>{renderPractice();if(document.getElementById('dashboardView')?.style.display==='block')mountDashboard()});
})();
