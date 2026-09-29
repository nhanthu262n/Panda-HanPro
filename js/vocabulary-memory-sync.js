/* One vocabulary identity across dictionary, Coach and memory review.
 * Only new verified recall evidence updates a word's primary SM-2 schedule.
 * Sound and usage keep separate skill evidence, never lowering meaning retention.
 */
(() => {
  'use strict';
  const names={FORM:'Nhận mặt chữ',SOUND:'Nghe / thanh điệu',MEANING:'Hiểu nghĩa',USAGE:'Dùng từ',PRODUCTION:'Viết câu'};
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const date=t=>t?new Date(t).toLocaleDateString('vi-VN'):'Chưa có';
  const all=()=>window.PanTutorAttemptHistory?.allRows?.()||[];
  function words(){try{return typeof VOCAB!=='undefined'?VOCAB:[]}catch(_){return []}}
  function dictionaryDimension(meta={}){if(meta.dimension)return meta.dimension;const source=String(meta.source||'');if(/unscramble|sentence/.test(source))return 'USAGE';if(/tone|pinyin|listen|sound/.test(source)||/pinyin|thanh điệu|phiên âm/i.test(meta.prompt||''))return 'SOUND';if(/hanzi|character/.test(source))return 'FORM';return 'MEANING'}
  function normalize(input){return input.map(row=>{
    if(['remediation','memory_learning'].includes(row.taskId))return row;
    if(!['dictionary_quiz','vocab-intro','srs','listening','phonetics_core','reading_writing','speaking','mistake_review','hidden_response'].includes(row.taskId))return {...row,items:[]};
    return {...row,sourceTask:row.taskId,taskId:'remediation',items:(row.items||[]).map(item=>{
      const target=String(item.char||item.word||item.target||'');
      const dimension=item.dimension||({dictionary_quiz:dictionaryDimension(item),'vocab-intro':'MEANING',srs:'FORM',listening:'SOUND',phonetics_core:'SOUND',speaking:'SOUND'})[row.taskId]||(item.kind==='pinyin'?'SOUND':item.kind==='writing'?'USAGE':'MEANING');
      let correct=item.correct,verified=item.verified!==false&&typeof correct==='boolean';
      if(row.taskId==='reading_writing'&&item.kind!=='writing'&&item.verified!==false&&Number.isFinite(item.score)){correct=item.score===100;verified=true}
      if(row.taskId==='speaking'){verified=item.verified===true&&typeof item.correct==='boolean';correct=verified?item.correct:null}
      if(row.taskId==='mistake_review'&&!item.dimension){verified=false;correct=null}
      if(item.openEnded||item.kind==='writing'){verified=item.verified===true&&typeof item.correct==='boolean';correct=verified?item.correct:null}
      return {...item,target,dimension,correct,verified,input:item.input??item.chosen??item.typed??'',expected:item.expected??item.answer??'',memoryReview:item.memoryReview!==false&&verified&&['MEANING','FORM','SOUND','USAGE','PRODUCTION'].includes(dimension),learnCompleted:item.learnCompleted===true||item.priorExposure===true,sourceTask:row.taskId};
    })};
  });}
  function validAccount(){try{return typeof STORE_KEY==='string'&&STORE_KEY==='pandahan_pro_stats_v1_'+storageNamespace()}catch(_){return false}}
  let syncing=false;
  function reconcile(){
    if(syncing||!validAccount())return;syncing=true;let changed=false;
    try{
      const known=new Set(words().map(w=>w.char));
      for(const row of normalize(all()).sort((a,b)=>a.createdAt-b.createdAt))for(const [i,item]of(row.items||[]).entries()){
        if(!known.has(item.target)||!names[item.dimension])continue;
        const s=getStat(item.target),id=row.attemptId+':'+i;
        s.sharedEvidenceIds=s.sharedEvidenceIds||{};if(s.sharedEvidenceIds[id])continue;
        if(row.taskId==='memory_learning'){s.learned=true;s.sharedEvidenceIds[id]=true;changed=true;continue}
        if(row.taskId!=='remediation'||item.verified!==true||typeof item.correct!=='boolean'||item.hintShown)continue;
        const learnedBefore=s.learned===true||s.repetitions>0||s.quizAttempts>0||item.learnCompleted===true;
        s.sharedEvidenceIds[id]=true;s.learned=learnedBefore||item.correct===true;s.firstSeen=s.firstSeen||row.createdAt;s.lastSeen=Math.max(s.lastSeen||0,row.createdAt);changed=true;
        const primary=item.dimension==='MEANING'||item.dimension==='FORM'&&s.wordMemoryDimension!=='MEANING';
        const lastApplied=Math.max(Number(s.sharedLastAppliedAt||0),...(s.studyLog||[]).map(x=>Number(x.t)||0));
        const alreadyApplied=item.canonicalApplied===true||Number.isFinite(item.sm2Quality);
        if(primary&&learnedBefore&&item.memoryReview===true&&!item.hintShown&&!alreadyApplied&&row.createdAt>lastApplied){
          const q=item.correct?(item.confidence==='certain'&&item.responseMs>0&&item.responseMs<3000?5:4):2;
          s.ef=Number(s.ef)||2.5;
          if(q<3){s.repetitions=0;s.interval=1}else{s.repetitions=(s.repetitions||0)+1;s.interval=s.repetitions===1?1:s.repetitions===2?6:Math.max(1,Math.round((s.interval||1)*s.ef))}
          s.ef=Math.max(1.3,s.ef+.1-(5-q)*(.08+(5-q)*.02));s.nextReview=row.createdAt+s.interval*86400000;s.sharedLastAppliedAt=row.createdAt;s.wordMemoryDimension=item.dimension;
          s.studyLog=s.studyLog||[];s.studyLog.push({t:row.createdAt,grade:q,source:'shared-evidence',evidenceId:id});s.studyLog=s.studyLog.slice(-60);
        }
      }
      if(changed){saveStats();if(typeof syncData==='function')syncData();window.dispatchEvent(new CustomEvent('pantutor-vocabulary-memory-updated'))}
    }finally{syncing=false}
  }
  async function captureDictionary(char,correct,meta={}){
    const day=Number(meta.dayNumber||window.PandaHanMission?.getCurrent?.()?.dayNumber||1);
    try{await window.PanTutorAttemptHistory.save({dayNumber:Math.max(1,Math.min(120,day)),taskId:'dictionary_quiz',scorePercent:correct?100:0,passed:!!correct,completeSet:true,correct:correct?1:0,total:1,items:[{target:char,input:meta.selected||'',expected:meta.expected||'',prompt:meta.prompt||'Bài từ vựng',correct:!!correct,verified:true,dimension:dictionaryDimension(meta),source:meta.source||'dictionary',canonicalApplied:meta.canonicalApplied===true,memoryReview:meta.memoryReview!==false,sm2Quality:meta.sm2Quality??null,learnCompleted:meta.learnCompleted===true,responseMs:meta.responseMs||null}],scheduleSaved:false})}catch(e){console.warn('Vocabulary evidence save failed',e.message)}
  }
  async function markLearned(char){
    if(!char||!validAccount())return;
    const s=getStat(char);if(s.learned)return;s.learned=true;saveStats();if(typeof syncData==='function')syncData();
    try{await window.PanTutorAttemptHistory.save({dayNumber:Number(window.PandaHanMission?.getCurrent?.()?.dayNumber||1),taskId:'memory_learning',scorePercent:0,passed:false,completeSet:false,correct:0,total:0,items:[{target:char,dimension:'MEANING',input:'Đã xem mẫu từ',expected:'',verified:false,hintShown:true}],scheduleSaved:false})}catch(e){console.warn('Learning exposure pending',e.message)}
  }
  function wordSummary(char){const s=getStat(char);return `<div class="vm-status"><b>${esc(char)} · ${s.learned||s.quizAttempts||s.repetitions?'Đã học':'Chưa học'}</b><br>Lần ôn có điểm gần nhất: ${date(s.studyLog?.at(-1)?.t)} · Ôn tiếp: ${date(s.nextReview)}<br>Xem thẻ không tự tăng điểm hoặc dời lịch. Kết quả từ các bài đã chấm được đồng bộ về cùng từ này.</div>`}
  function wordTable(){
    const queue=window.PandaHanMistakes?.getAllQueue?.()||[],input=all(),byWord=new Map();
    for(const row of normalize(input))for(const item of row.items||[]){if(!item.target||!names[item.dimension])continue;const a=byWord.get(item.target)||[];if(item.verified===true&&!item.hintShown)a.push({...item,at:row.createdAt});byWord.set(item.target,a)}
    const selected=words().filter(w=>{const s=typeof STATS!=='undefined'?(STATS[w.char]||{}):getStat(w.char);return s.learned||s.repetitions||s.quizAttempts||byWord.has(w.char)||queue.some(e=>e.char===w.char)});
    if(!selected.length)return '<p>Chưa có từ đã học hoặc lỗi sai được lưu.</p>';
    return `<h3>Từ vựng & lỗi cần ôn</h3><p>Trạng thái và lịch ôn dưới đây dùng chung với Từ điển. Lỗi nghe, thanh điệu và cách dùng được theo dõi riêng.</p><div class="vm-table-wrap"><table><thead><tr><th>Từ</th><th>Đã học / kết quả</th><th>Lỗi cần ôn</th><th>Lịch ôn từ</th><th>Thao tác</th></tr></thead><tbody>${selected.map(w=>{const s=getStat(w.char),ev=byWord.get(w.char)||[],last=new Map();ev.forEach(e=>last.set(e.dimension,e));const bad=[...last.values()].filter(e=>e.correct===false),errors=queue.filter(e=>e.char===w.char&&(e.wrongCount>e.resolvedCount||e.nextReviewAt&&e.nextReviewAt<=Date.now()));return `<tr><td><b>${esc(w.char)}</b><br>${esc(w.pinyin)}</td><td>${s.learned||s.repetitions||s.quizAttempts?'Đã học':'Chưa học'}<br>${ev.filter(e=>e.correct).length}/${ev.length} câu đúng đã đồng bộ${s.quizAttempts?`<br>Từ điển: ${s.quizCorrect||0}/${s.quizAttempts} đúng`:''}</td><td>${bad.map(e=>esc(names[e.dimension])).join(', ')||'Chưa có lỗi kỹ năng gần nhất'}${errors.length?`<br>${errors.length} mục trong sổ ôn lỗi`:''}</td><td>${date(s.nextReview)}${s.nextReview&&s.nextReview<=Date.now()?' · Đến hạn':''}</td><td><div class="vm-word-actions"><button data-vm-detail="${esc(w.char)}">Từ điển</button><button data-vm-review="${esc(w.char)}">Xem lại từ</button>${bad.length||errors.length?`<button data-vm-error="${esc(w.char)}">Luyện lỗi sai</button>`:''}</div></td></tr>`}).join('')}</tbody></table></div>`;
  }
  document.addEventListener('click',e=>{const button=e.target.closest?.('[data-vm-detail],[data-vm-review],[data-vm-error]');if(!button)return;if(button.dataset.vmDetail){openDetail(button.dataset.vmDetail);return}if(button.dataset.vmReview){startReviewForWord(button.dataset.vmReview);return}const char=button.dataset.vmError,events=window.PanTutorTenLayer?.diagnose(all())||[],event=events.filter(x=>x.target===char&&!x.correct).at(-1);if(event?.diagnosisClass){window.PanTutorTenLayer.open(event);return}window.PandaHanCoachSkills?.openMistakeReview(window.PandaHanMission?.getCurrent?.())});
  window.PanTutorVocabularyMemory={normalize,reconcile,captureDictionary,markLearned,wordSummary,wordTable,dictionaryDimension};
  window.addEventListener('pantutor-attempt-saved',reconcile);
  window.addEventListener('pandahan-progress-hydrated',reconcile);
  window.firebase?.auth?.().onAuthStateChanged(()=>setTimeout(reconcile,100));
  reconcile();
})();
