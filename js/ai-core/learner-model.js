/* PanTutor AI v57 — interpretable dynamic learner model */
(function(){
  'use strict';
  const KEY='pandahan_v57_learner_model';
  const dims=['recognition','meaning','pronunciation','tone_1','tone_2','tone_3','tone_4','initial','final','fluency','listening','speaking','collocation','context_use','production','component_reasoning','transfer','retention','writing','grammar','word_order'];
  function empty(){const d={};dims.forEach(k=>d[k]={alpha:1,beta:1,estimate:.5,confidence:0,n:0,lastUpdated:0});return {version:'57.0',dimensions:d,concepts:{},strategies:{},patterns:[],updatedAt:0};}
  function load(){try{return {...empty(),...JSON.parse(localStorage.getItem(KEY)||'{}')};}catch(_){return empty();}}
  function save(m){m.updatedAt=Date.now();try{localStorage.setItem(KEY,JSON.stringify(m));}catch(_){}return m;}
  function keyFor(ev){ if(ev.subSkill && dims.includes(ev.subSkill)) return ev.subSkill; if(dims.includes(ev.skill)) return ev.skill; if(ev.skill==='vocabulary') return 'recognition'; return ev.skill||'general'; }
  function upd(state,y,w,t){state=state||{alpha:1,beta:1,estimate:.5,confidence:0,n:0,lastUpdated:0};state.alpha=(Number(state.alpha)||1)+w*y;state.beta=(Number(state.beta)||1)+w*(1-y);state.estimate=state.alpha/(state.alpha+state.beta);state.n=(state.n||0)+1;state.confidence=Math.min(.98,1-Math.exp(-state.n/7));state.lastUpdated=t||Date.now();return state;}
  function update(ev){
    const m=load(), k=keyFor(ev), y=Math.max(0,Math.min(1,Number(ev.outcome)||0)), w=Math.max(.05,Math.min(1,Number(ev.evidenceWeight)||.4));
    if(!m.dimensions[k])m.dimensions[k]={alpha:1,beta:1,estimate:.5,confidence:0,n:0,lastUpdated:0};
    m.dimensions[k]=upd(m.dimensions[k],y,w,ev.timestamp);
    if(ev.conceptId){const c=m.concepts[ev.conceptId]||(m.concepts[ev.conceptId]={dimensions:{},errors:{},lastSeen:0,evidenceCount:0});c.dimensions[k]=upd(c.dimensions[k],y,w,ev.timestamp);c.lastSeen=ev.timestamp;c.evidenceCount++;if(ev.errorType)c.errors[ev.errorType]=(c.errors[ev.errorType]||0)+(y<.65?1:0);if(ev.confusedWith)c.confusedWith=ev.confusedWith;}
    save(m); window.dispatchEvent(new CustomEvent('pandahan-v57-model-updated',{detail:{model:m,evidence:ev}})); return m;
  }
  function label(s){const e=Number(s?.estimate??.5),n=Number(s?.n||0);if(!n)return 'NOT_OBSERVED';if(e>=.82&&n>=4)return 'STABLE';if(e>=.65)return 'DEVELOPING';if(e>=.5)return 'EMERGING';return 'AT_RISK';}
  function snapshot(){const m=load(),summary={};Object.entries(m.dimensions).forEach(([k,v])=>summary[k]={estimate:+v.estimate.toFixed(3),confidence:+v.confidence.toFixed(3),evidenceCount:v.n,state:label(v)});return {version:m.version,summary,patterns:m.patterns||[],conceptCount:Object.keys(m.concepts||{}).length,updatedAt:m.updatedAt};}
  window.PandaHanLearnerModel={load,save,update,snapshot,label,keyFor,version:'57.0'};
  window.addEventListener('pandahan-v57-evidence',e=>update(e.detail||{}));
})();
