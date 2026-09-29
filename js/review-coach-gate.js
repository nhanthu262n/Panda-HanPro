/* Internal prerequisite only. No additional learner-facing UI. */
(() => {
  'use strict';
  const PREFIX='pantutor_review_gate_v82_';
  const pending=new Map(),ready=new Set();
  let redirecting=false,requested=false;
  const day=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const account=()=>window.firebase?.auth?.().currentUser?.uid||window.PanTutorLessonAccess?.namespace?.()||'guest';
  const exempt=()=>window.PanTutorLessonAccess?.isTeacher?.()===true;
  const storageKey=()=>PREFIX+account()+':'+day();
  const rows=()=>window.PanTutorAttemptHistory?.allRows?.()||[];
  const itemKey=(target,dimension,mode='question')=>JSON.stringify([String(target),dimension,mode]);
  function readLocal(){try{return JSON.parse(localStorage.getItem(storageKey())||'null')}catch(_){return null}}
  function persist(s){try{localStorage.setItem(storageKey(),JSON.stringify(s))}catch(_){}}
  function current(){
    const local=readLocal();
    const snapshots=rows().filter(r=>r.taskId==='review_gate_snapshot').map(r=>r.items?.[0]?.reviewGateSnapshot).filter(s=>s?.version===1&&s.account===account()&&s.date===day()&&Array.isArray(s.assignments));
    if(local?.version===1&&local.account===account()&&local.date===day()&&Array.isArray(local.assignments))snapshots.push(local);
    const s=snapshots.sort((a,b)=>a.startedAt-b.startedAt||a.id.localeCompare(b.id))[0];
    if(s)persist(s);return s||null;
  }
  function route(r){return {...r,diagnosisClass:r.diagnosisClass||(['USAGE','PRODUCTION'].includes(r.dimension)?10:r.dimension==='SOUND'?4:r.dimension==='FORM'?5:2)};}
  function candidates(){
    const queue=window.PanTutorMemory?.reviewQueue?.(),api=window.PanTutorTenLayer;
    if(!queue||!api?.practiceQuestions)return [];
    const seen=new Set(),out=[];
    for(const raw of [...queue.due,...queue.recs,...queue.writing.map(i=>({...i,target:i.target||i.char,dimension:'USAGE',diagnosisClass:10}))]){
      const rec=route(raw),key=itemKey(rec.target,rec.dimension);
      if(!rec.target||seen.has(key)||!api.canPractice?.(rec))continue;
      const q=api.practiceQuestions(rec)[0];if(!q||q.audio&&!('speechSynthesis' in window))continue;
      seen.add(key);out.push({key,target:rec.target,dimension:rec.dimension,diagnosisClass:rec.diagnosisClass,mode:'question',dayNumber:Number(rec.dayNumber)||1,questionId:api.questionId(q),question:q});
    }
    // Speaking requires a working capture capability; pending teacher decisions are never blockers.
    if(window.PandaHanCoachSkills?.openSpeaking&&navigator.mediaDevices?.getUserMedia&&(window.AudioContext||window.webkitAudioContext))for(const i of queue.speech){
      const key=itemKey(i.target,'SOUND','speaking');if(!i.target||seen.has(key))continue;seen.add(key);
      out.push({key,target:i.target,dimension:'SOUND',mode:'speaking',dayNumber:Number(i.dayNumber)||1});
    }
    return out;
  }
  function ensure(){
    let s=current();if(s)return s;
    const assignments=candidates();if(!assignments.length)return null;
    s={version:1,id:window.crypto?.randomUUID?.()||String(Date.now())+'_'+Math.random().toString(36).slice(2),account:account(),date:day(),startedAt:Date.now(),assignments};
    persist(s);
    // Persist the frozen denominator through the existing per-account evidence channel.
    window.PanTutorAttemptHistory?.save?.({dayNumber:assignments[0].dayNumber,taskId:'review_gate_snapshot',scorePercent:0,passed:false,completeSet:false,total:0,items:[{reviewGateSnapshot:s}],scheduleSaved:false}).catch(()=>{});
    return s;
  }
  function completed(s){
    const keys=new Set();if(!s)return keys;
    const assigned=new Set(s.assignments.map(a=>a.key));
    for(const row of rows())if(row.createdAt>=s.startedAt)for(const i of row.items||[]){
      const tag=i.reviewGate;if(tag?.date!==s.date||tag.account!==s.account||!assigned.has(tag.key))continue;
      if(row.taskId==='remediation'&&i.verified===true&&typeof i.correct==='boolean'&&!i.hintShown&&String(i.input??'').trim())keys.add(tag.key);
      if(row.taskId==='teacherDraft'&&String(i.input??'').trim())keys.add(tag.key);
      if(row.taskId==='speaking'&&i.reviewRecordingSubmitted===true&&Number.isFinite(Number(i.score)))keys.add(tag.key);
    }
    return keys;
  }
  function status(){
    if(exempt())return {blocked:false,total:0,required:0,completed:0};
    const s=ensure();if(!s)return {blocked:false,total:0,required:0,completed:0};
    const done=completed(s),required=Math.ceil(s.assignments.length*.3);
    return {blocked:done.size<required,total:s.assignments.length,required,completed:done.size,snapshot:s};
  }
  async function prepare(){
    const id=account();if(ready.has(id))return;if(pending.has(id))return pending.get(id);
    const job=(async()=>{
      if(document.readyState==='loading')await new Promise(resolve=>window.addEventListener('DOMContentLoaded',resolve,{once:true}));
      const hydration=window.PanTutorAttemptHistory?.ready?.();
      if(hydration){let timer;await Promise.race([hydration,new Promise(resolve=>{timer=setTimeout(resolve,6000)})]);clearTimeout(timer);}
      if(account()===id)ready.add(id);
    })();pending.set(id,job);try{await job}finally{pending.delete(id)}
  }
  function toReview(){if(redirecting)return;redirecting=true;try{window.PanTutorMemory?.openPractice?.()}finally{redirecting=false}}
  function enterCoach(){
    if(exempt())return true;
    if(!ready.has(account())){
      if(!requested){requested=true;const id=account();prepare().then(()=>{requested=false;if(account()!==id)return;if(status().blocked)toReview();else window.openAiCoachChat?.()}).catch(()=>{requested=false;ready.add(id);if(account()===id){if(status().blocked)toReview();else window.openAiCoachChat?.()}})}
      return false;
    }
    if(status().blocked){toReview();return false;}return true;
  }
  function question(rec){
    if(exempt())return null;const s=current();if(!s||!status().blocked)return null;
    const key=itemKey(rec.target,rec.dimension),a=s.assignments.find(x=>x.key===key);if(!a||completed(s).has(key))return null;
    return window.PanTutorTenLayer.practiceQuestions(rec,{all:true,includeSeen:true}).find(q=>window.PanTutorTenLayer.questionId(q)===a.questionId)||a.question;
  }
  function tagFor(target,dimension,mode='question'){
    if(exempt())return null;const s=current();if(!s)return null;const key=itemKey(target,dimension,mode);
    if(!s.assignments.some(a=>a.key===key))return null;
    return {account:s.account,date:s.date,cycleId:s.id,key};
  }
  function annotate(data){
    if(!['remediation','teacherDraft'].includes(data.taskId))return data;
    return {...data,items:(data.items||[]).map(i=>{const tag=tagFor(i.target,i.dimension);return tag?{...i,reviewGate:tag}:i})};
  }
  function refresh(){
    // Recheck after cloud restore, but do not interrupt the exercise/result being read.
    if(document.getElementById('aiCoachView')?.style.display==='block')enterCoach();
  }
  window.PanTutorReviewGate={enterCoach,status,question,tagFor,annotate,prepare};
  window.addEventListener('pantutor-attempt-saved',e=>{if(e.detail?.restored)refresh()});
  window.addEventListener('pandahan-progress-hydrated',refresh);
  window.firebase?.auth?.().onAuthStateChanged(()=>{ready.clear();requested=false;});
  window.addEventListener('focus',refresh);
  window.addEventListener('DOMContentLoaded',refresh);
})();
