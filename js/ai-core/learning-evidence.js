/* PanTutor AI v57 — unified learning evidence bus */
(function(){
  'use strict';
  const KEY='pandahan_v57_learning_evidence';
  const MAX=5000;
  const uid=()=>String(window.auth?.currentUser?.uid||localStorage.getItem('pandahan_user_id')||'local');
  const clamp=n=>Math.max(0,Math.min(1,Number(n)||0));
  function inferSkill(d={}){
    if(d.skill) return String(d.skill);
    const s=String(d.source||d.rawSource||d.evidenceType||d.taskId||'').toLowerCase();
    if(/pronun|phonetic|pinyin|tone/.test(s)) return 'pronunciation';
    if(/listen/.test(s)) return 'listening';
    if(/speak/.test(s)) return 'speaking';
    if(/write|grammar|reading_writing|unscramble/.test(s)) return 'writing';
    if(/vocab|quiz|flash|srs|match/.test(s)) return 'vocabulary';
    return 'general';
  }
  function inferSubSkill(d={},skill){
    if(d.subSkill) return String(d.subSkill);
    const s=JSON.stringify(d).toLowerCase();
    if(/tone[_ -]?2|thanh 2/.test(s)) return 'tone_2';
    if(/tone[_ -]?3|thanh 3/.test(s)) return 'tone_3';
    if(/tone[_ -]?4|thanh 4/.test(s)) return 'tone_4';
    if(/tone[_ -]?1|thanh 1/.test(s)) return 'tone_1';
    if(/context|semantic.*confus|confusedwith/.test(s)) return 'context_use';
    if(/meaning/.test(s)) return 'meaning';
    if(/collocation/.test(s)) return 'collocation';
    if(/production|free[_ -]?write|sentence/.test(s)) return 'production';
    if(/component|radical/.test(s)) return 'component_reasoning';
    if(/transfer|unseen|novel/.test(s)) return 'transfer';
    if(skill==='vocabulary') return 'recognition';
    return '';
  }
  function reliability(d={}){
    if(Number.isFinite(Number(d.evidenceWeight))) return clamp(d.evidenceWeight);
    let w=.45;
    const t=String(d.taskType||d.evidenceType||d.source||'').toLowerCase();
    if(/self/.test(t)) w=.15;
    if(/multiple|quiz|recognition|match/.test(t)) w=.45;
    if(/recall/.test(t)) w=.65;
    if(/context|contrast/.test(t)) w=.72;
    if(/production|writing|speaking/.test(t)) w=.82;
    if(/transfer|unseen|novel/.test(t)) w=.9;
    const hints=Number(d.hintsUsed??d.hints??0)||0;
    if(hints>0) w*=Math.max(.35,1-hints*.2);
    if(d.answerRevealed) w*=.25;
    return clamp(w);
  }
  function outcome(d={}){
    if(Number.isFinite(Number(d.normalizedOutcome))) return clamp(d.normalizedOutcome);
    if(Number.isFinite(Number(d.scorePercent))) return clamp(Number(d.scorePercent)/100);
    if(Number.isFinite(Number(d.score))){ const n=Number(d.score); return clamp(n>1?n/100:n); }
    if(typeof d.correct==='boolean') return d.correct?1:0;
    if(Number.isFinite(Number(d.correct)) && Number.isFinite(Number(d.total)) && Number(d.total)>0) return clamp(Number(d.correct)/Number(d.total));
    return .5;
  }
  function normalize(d={}){
    const skill=inferSkill(d), subSkill=inferSubSkill(d,skill);
    return {
      evidenceId:d.evidenceId||`EV-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      learnerId:d.learnerId||uid(), conceptId:String(d.conceptId||d.char||d.word||d.targetConcept||''),
      module:String(d.module||d.source||'unknown'), skill, subSkill,
      taskType:String(d.taskType||d.evidenceType||d.taskId||'activity'),
      outcome:outcome(d), evidenceWeight:reliability(d), correct:typeof d.correct==='boolean'?d.correct:null,
      scorePercent:Number.isFinite(Number(d.scorePercent))?Number(d.scorePercent):null,
      attempts:Number(d.attempts||1)||1, hintsUsed:Number(d.hintsUsed??d.hints??0)||0,
      responseTime:Number(d.responseTime||d.responseTimeMs||0)||0,
      errorType:String(d.errorType||''), confusedWith:String(d.confusedWith||''),
      answer:d.answer??null, expected:d.expected??null, dayNumber:Number(d.dayNumber||0)||null,
      verified:d.verified!==false, sourceDetail:String(d.rawSource||d.source||''),
      timestamp:Number(d.timestamp||d.evaluatedAt||Date.now()), meta:d.meta||{}
    };
  }
  function all(){ try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch(_){return[];} }
  function fingerprint(ev){const bucket=Math.floor(Number(ev.timestamp||0)/1500);return [ev.conceptId,ev.skill,ev.subSkill,Number(ev.outcome).toFixed(3),ev.dayNumber||'',bucket].join('|');}
  function save(raw){
    const ev=normalize(raw); const arr=all(); const fp=fingerprint(ev);
    if(arr.slice(-25).some(x=>fingerprint(x)===fp)) return {...ev,deduplicated:true};
    arr.push(ev); if(arr.length>MAX) arr.splice(0,arr.length-MAX);
    try{localStorage.setItem(KEY,JSON.stringify(arr));}catch(_){ }
    window.dispatchEvent(new CustomEvent('pandahan-v57-evidence',{detail:ev}));
    return ev;
  }
  function recent(limit=250){ return all().slice(-Math.max(1,limit)); }
  function byConcept(c,limit=100){ return recent(2000).filter(e=>e.conceptId===String(c)).slice(-limit); }
  window.PandaHanEvidence={save,normalize,all,recent,byConcept,clear:()=>localStorage.removeItem(KEY),version:'57.0'};

  window.addEventListener('pandahan-learning-evaluation',e=>save(e.detail||{}));
  window.addEventListener('pandahan-ai-coach-assessment',e=>save({...e.detail,module:'ai_coach'}));
  window.addEventListener('pandahan-phonetics-evidence-updated',e=>{
    const d=e.detail||{}; save({...d,module:'phonetics'});
    const parts=d.components||d.metrics||{};
    if(parts&&typeof parts==='object'&&!Array.isArray(parts)){
      Object.entries(parts).forEach(([name,value])=>{
        const n=Number(value?.scorePercent ?? value?.score ?? value); if(!Number.isFinite(n))return;
        const key=String(name).toLowerCase().replace(/[^a-z0-9]+/g,'_');
        let sub=key; if(/tone.?1/.test(key))sub='tone_1'; else if(/tone.?2/.test(key))sub='tone_2'; else if(/tone.?3/.test(key))sub='tone_3'; else if(/tone.?4/.test(key))sub='tone_4'; else if(/initial/.test(key))sub='initial'; else if(/final/.test(key))sub='final'; else if(/fluency|rhythm/.test(key))sub='fluency';
        save({...d,module:'phonetics',skill:'pronunciation',subSkill:sub,taskType:'phonetics_component',scorePercent:n<=1?n*100:n,evidenceWeight:.72});
      });
    }
  });
  window.addEventListener('pandahan-phonetics-native-quiz-score',e=>save({...e.detail,module:'phonetics'}));
  window.addEventListener('pandahan-quest-score-saved',e=>save({...e.detail,module:'tone_quest'}));
  window.addEventListener('pandahan-ai-tutor-srs-graded',e=>save({...e.detail,module:'ai_tutor_srs',skill:'vocabulary',subSkill:'retention'}));
})();
