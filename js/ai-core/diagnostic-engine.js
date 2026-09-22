/* PanTutor AI v57 — evidence-based diagnostic engine */
(function(){
  'use strict';
  function diagnoseConcept(concept){
    const ev=window.PandaHanEvidence?.byConcept?.(concept,120)||[]; if(!ev.length)return {concept,issues:[],confidence:0,evidenceCount:0};
    const groups={}; for(const e of ev){const k=e.subSkill||e.skill||'general';(groups[k]||(groups[k]=[])).push(e);}
    const issues=[];
    for(const [k,a] of Object.entries(groups)){
      const wt=a.reduce((s,e)=>s+e.evidenceWeight,0)||1; const avg=a.reduce((s,e)=>s+e.outcome*e.evidenceWeight,0)/wt;
      if(a.length>=2&&avg<.62)issues.push({type:'WEAK_SKILL',skill:k,severity:+(1-avg).toFixed(3),evidenceCount:a.length});
    }
    const conf=ev.filter(e=>e.confusedWith&&e.outcome<.7); const by={}; conf.forEach(e=>by[e.confusedWith]=(by[e.confusedWith]||0)+1);
    Object.entries(by).filter(([,n])=>n>=2).forEach(([other,n])=>issues.unshift({type:'SEMANTIC_CONTEXT_CONFUSION',skill:'context_use',confusedWith:other,severity:Math.min(1,.45+n*.12),evidenceCount:n}));
    const errors={};ev.filter(e=>e.errorType&&e.outcome<.7).forEach(e=>errors[e.errorType]=(errors[e.errorType]||0)+1);
    Object.entries(errors).filter(([,n])=>n>=2).forEach(([type,n])=>issues.push({type,skill:'error_pattern',severity:Math.min(1,.4+n*.1),evidenceCount:n}));
    issues.sort((a,b)=>b.severity-a.severity);
    return {concept,issues:issues.slice(0,6),confidence:Math.min(.95,ev.length/12),evidenceCount:ev.length,generatedAt:Date.now()};
  }
  function diagnoseGlobal(){const m=window.PandaHanLearnerModel?.snapshot?.(); if(!m)return {issues:[]}; const issues=[];for(const [k,v] of Object.entries(m.summary||{})){if(v.evidenceCount>=3&&v.estimate<.62)issues.push({type:'WEAK_SKILL',skill:k,severity:+(1-v.estimate).toFixed(3),state:v.state,evidenceCount:v.evidenceCount});}issues.sort((a,b)=>b.severity-a.severity);return {issues:issues.slice(0,8),generatedAt:Date.now()};}
  window.PandaHanDiagnostic={diagnoseConcept,diagnoseGlobal,version:'57.0'};
})();
