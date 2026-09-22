/* PanTutor AI v58 — lightweight sequential decision analytics for education.
   Records state → action → later evidence outcome. This is interpretable analytics,
   not reinforcement-learning training and not an autonomous optimizer. */
(function(){
  'use strict';
  const KEY='pantutor_v58_decision_trajectory',MAX=240;let cache=null,timer=0;
  function load(){if(cache)return cache;try{const a=JSON.parse(localStorage.getItem(KEY)||'[]');cache=Array.isArray(a)?a.slice(-MAX):[];}catch(_){cache=[];}return cache;}
  function persist(){clearTimeout(timer);timer=0;try{localStorage.setItem(KEY,JSON.stringify(load().slice(-MAX)));}catch(_){}}
  function soon(){clearTimeout(timer);timer=setTimeout(persist,260);}
  function recordDecision(plan,context={}){if(!plan)return null;const row={trajectoryId:`TRJ-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,decisionId:plan.decisionId||'',concept:String(plan.targetConcept||context.concept||''),state:{diagnosis:plan.diagnosis?.type||plan.issue?.type||'none',targetSkill:plan.selectedIntervention?.targetSkill||plan.intervention?.targetSkill||'general',confidence:Number(plan.confidence||0),evidenceCount:Number(plan.diagnosis?.evidenceCount||plan.issue?.evidenceCount||0),track:window.PanTutorAgendaAlignment?.currentTrack?.()||'education'},action:plan.selectedIntervention?.action||plan.intervention?.action||'normal_curriculum',outcome:null,alignment:{humanAgency:true,teacherOverride:true,noOfficialCertification:true,verifiedContentImmutable:true},createdAt:Date.now()};const a=load();a.push(row);if(a.length>MAX)a.splice(0,a.length-MAX);soon();return row;}
  function attachOutcome(ev){if(!ev)return;const a=load(),concept=String(ev.conceptId||'');for(let i=a.length-1;i>=0;i--){const r=a[i];if(r.outcome||Date.now()-r.createdAt>1000*60*60*24*14)continue;if(r.concept&&concept&&r.concept!==concept)continue;r.outcome={skill:ev.subSkill||ev.skill||'',value:Number(ev.outcome),evidenceWeight:Number(ev.evidenceWeight),timestamp:Number(ev.timestamp||Date.now())};r.rewardSignal=Math.max(-1,Math.min(1,(Number(ev.outcome)-.5)*2*Number(ev.evidenceWeight||.4)));soon();break;}}
  function summary(){const a=load();const done=a.filter(x=>x.outcome),by={};done.forEach(x=>{const k=x.action||'unknown';const b=by[k]||(by[k]={n:0,sum:0});b.n++;b.sum+=Number(x.rewardSignal||0);});return{count:a.length,completed:done.length,actions:Object.fromEntries(Object.entries(by).map(([k,v])=>[k,{n:v.n,meanReward:v.n?v.sum/v.n:0}]))};}
  window.addEventListener('pandahan-v57-evidence',e=>attachOutcome(e.detail||{}));window.addEventListener('pagehide',persist);
  window.PanTutorDecisionAnalytics={recordDecision,attachOutcome,summary,all:()=>load().slice(),version:'58.0'};
})();
