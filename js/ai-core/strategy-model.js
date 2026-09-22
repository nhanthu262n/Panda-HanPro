/* PanTutor AI v57.1 — interpretable learning-strategy effectiveness model */
(function(){
  'use strict';
  const KEY='pandahan_v57_strategy_model';
  const DEFAULTS=['semantic_component_reasoning','phonetic_family_reasoning','self_generated_reasoning','contrastive_context','retrieval_practice','scaffolded_production','tone_discrimination','transfer_reasoning'];
  const clamp=n=>Math.max(0,Math.min(1,Number(n)||0));
  function empty(){const strategies={};DEFAULTS.forEach(k=>strategies[k]={alpha:1,beta:1,estimate:.5,confidence:0,n:0,lastUpdated:0});return{version:'57.1',strategies,updatedAt:0};}
  function load(){try{const raw=JSON.parse(localStorage.getItem(KEY)||'{}');return{...empty(),...raw,strategies:{...empty().strategies,...(raw.strategies||{})}};}catch(_){return empty();}}
  function save(m){m.updatedAt=Date.now();try{localStorage.setItem(KEY,JSON.stringify(m));}catch(_){}return m;}
  function infer(ev={}){
    const explicit=ev.meta?.strategy||ev.strategy; if(explicit)return String(explicit);
    const task=String(ev.taskType||'').toLowerCase(), sub=String(ev.subSkill||'').toLowerCase(), action=String(ev.meta?.intervention||'').toLowerCase();
    if(/learner_generated_reasoning|self_reason/.test(task))return 'self_generated_reasoning';
    if(/component_reasoning/.test(sub)||/character_reasoning/.test(task))return 'semantic_component_reasoning';
    if(/transfer/.test(sub)||/transfer/.test(task))return 'transfer_reasoning';
    if(/context/.test(sub)||/contrast/.test(task)||/semantic_contrast/.test(action))return 'contrastive_context';
    if(/production|writing|speaking/.test(sub)||/production/.test(task))return 'scaffolded_production';
    if(/tone/.test(sub)||/tone/.test(task))return 'tone_discrimination';
    if(/recall|meaning_match|recognition/.test(task)||/meaning|recognition/.test(sub))return 'retrieval_practice';
    return '';
  }
  function update(ev={}){
    if(ev.meta?.strategyExposureOnly)return load();
    const strategy=infer(ev); if(!strategy)return load();
    const y=clamp(ev.outcome), w=Math.max(.05,clamp(ev.evidenceWeight||.4));
    const m=load(), s=m.strategies[strategy]||(m.strategies[strategy]={alpha:1,beta:1,estimate:.5,confidence:0,n:0,lastUpdated:0});
    s.alpha=(Number(s.alpha)||1)+w*y; s.beta=(Number(s.beta)||1)+w*(1-y); s.estimate=s.alpha/(s.alpha+s.beta); s.n=(s.n||0)+1; s.confidence=Math.min(.98,1-Math.exp(-s.n/6)); s.lastUpdated=ev.timestamp||Date.now();
    save(m); window.dispatchEvent(new CustomEvent('pandahan-v57-strategy-updated',{detail:{strategy,state:s,evidence:ev}})); return m;
  }
  function ranked(minEvidence=2){return Object.entries(load().strategies||{}).map(([strategy,s])=>({strategy,...s})).filter(x=>x.n>=minEvidence).sort((a,b)=>(b.estimate*b.confidence)-(a.estimate*a.confidence));}
  function best(minEvidence=2){return ranked(minEvidence)[0]||null;}
  window.PandaHanStrategyModel={load,save,update,ranked,best,infer,version:'57.1'};
  window.addEventListener('pandahan-v57-evidence',e=>update(e.detail||{}));
})();
