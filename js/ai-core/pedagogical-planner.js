/* PanTutor AI v57.2 — explainable pedagogical planner + research decision audit */
(function(){
 'use strict';
 const AUDIT_KEY='pandahan_v57_ai_decisions';
 function allAudits(){try{return JSON.parse(localStorage.getItem(AUDIT_KEY)||'[]')}catch(_){return[]}}
 function audit(row){
   try{
     const a=allAudits(); const fp=[row.targetConcept||'GLOBAL',row.selectedIntervention?.action||row.intervention?.action||'',row.diagnosis?.type||row.issue?.type||'',row.diagnosis?.evidenceCount||row.issue?.evidenceCount||0].join('|');
     const last=a[a.length-1]; if(last?.fingerprint===fp && Date.now()-Number(last.generatedAt||0)<30000)return last;
     const out={...row,fingerprint:fp};a.push(out);localStorage.setItem(AUDIT_KEY,JSON.stringify(a.slice(-2000)));return out;
   }catch(_){return row;}
 }
 function intervention(issue,concept){
   if(!issue)return {action:'normal_curriculum',targetSkill:'general'};
   if(issue.type==='SEMANTIC_CONTEXT_CONFUSION')return {action:'semantic_contrast',targetSkill:'context_use',contrastWith:issue.confusedWith};
   const s=issue.skill||'';
   if(/tone|pronunciation/.test(s))return {action:'tone_clinic',targetSkill:s};
   if(s==='context_use')return {action:'context_discrimination_then_production',targetSkill:s};
   if(s==='production'||s==='writing')return {action:'scaffolded_production',targetSkill:s};
   if(s==='component_reasoning')return {action:'character_reasoning',targetSkill:s};
   if(s==='transfer')return {action:'novel_character_transfer',targetSkill:s};
   if(s==='meaning'||s==='recognition')return {action:'retrieval_practice',targetSkill:s};
   return {action:'targeted_review',targetSkill:s||'general'};
 }
 function strategyFor(it){
   const best=window.PandaHanStrategyModel?.best?.(2)||null; if(!best)return null;
   const compatible={
     semantic_contrast:['contrastive_context','retrieval_practice'],
     context_discrimination_then_production:['contrastive_context','scaffolded_production'],
     scaffolded_production:['scaffolded_production'],
     tone_clinic:['tone_discrimination'],
     character_reasoning:['semantic_component_reasoning','self_generated_reasoning'],
     novel_character_transfer:['transfer_reasoning','semantic_component_reasoning'],
     retrieval_practice:['retrieval_practice']
   }[it?.action]||[];
   return compatible.includes(best.strategy)?best:null;
 }
 function planForConcept(concept){
   const d=window.PandaHanDiagnostic?.diagnoseConcept?.(concept)||{issues:[]}; const issue=(d.issues||[]).find(x=>x.type==='SEMANTIC_CONTEXT_CONFUSION') || d.issues?.[0] || null; const it=intervention(issue,concept); const strategy=strategyFor(it);
   const reason=[]; if(issue){reason.push(`${issue.type}${issue.skill?` · ${issue.skill}`:''}`);if(issue.confusedWith)reason.push(`recent confusion with ${issue.confusedWith}`);reason.push(`${issue.evidenceCount||d.evidenceCount} supporting evidence item(s)`);} else reason.push('no persistent weakness detected; continue curriculum');
   if(strategy)reason.push(`learner outcome history also supports ${strategy.strategy}`);
   const row={decisionId:`DEC-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,targetConcept:String(concept||''),diagnosis:issue,selectedIntervention:it,strategySuggestion:strategy?{strategy:strategy.strategy,utility:strategy.estimate,confidence:strategy.confidence,evidenceCount:strategy.n}:null,whyConcept:issue?'Recent evidence indicates this concept needs targeted support.':'This concept follows the current learning/review path.',whyActivity:issue?`The selected activity targets ${it.targetSkill||'the observed weakness'} instead of repeating unrelated practice.`:'No targeted intervention is needed.',whyNow:d.evidenceCount?`Decision is based on ${d.evidenceCount} recent evidence item(s).`:'Not enough evidence for a stronger adaptation.',confidence:d.confidence||0,reason,generatedAt:Date.now(),modelVersion:'PanTutor-PED-57.2'};
   audit(row);return row;
 }
 function nextGlobal(){
   const g=window.PandaHanDiagnostic?.diagnoseGlobal?.()||{issues:[]};const issue=g.issues?.[0];const it=issue?intervention(issue,''):{action:'normal_curriculum',targetSkill:'general'};const strategy=strategyFor(it);
   const row=issue?{decisionId:`GLOBAL-${Date.now()}`,focus:issue.skill,intervention:it,strategySuggestion:strategy?{strategy:strategy.strategy,utility:strategy.estimate,confidence:strategy.confidence,evidenceCount:strategy.n}:null,why:`${issue.skill} is currently the weakest repeatedly observed skill.`,issue,generatedAt:Date.now(),modelVersion:'PanTutor-PED-57.2'}:{decisionId:`GLOBAL-${Date.now()}`,focus:'core_curriculum',intervention:{action:'normal_curriculum'},why:'No repeated weakness has enough evidence yet.',generatedAt:Date.now(),modelVersion:'PanTutor-PED-57.2'};
   audit({targetConcept:'',selectedIntervention:row.intervention,diagnosis:row.issue||null,...row});return row;
 }
 window.PandaHanPedagogy={planForConcept,nextGlobal,intervention,allAudits,version:'57.2'};
})();
