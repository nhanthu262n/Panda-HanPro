/* PanTutor AI v58 — bounded agentic learning orchestration.
   This is deliberately not an autonomous swarm. Each role has a fixed boundary and
   every recommendation remains auditable and teacher-overridable. */
(function(){
  'use strict';
  const ROLES={
    analyst:{name:'Learner Analyst',can:['read structured learning evidence','summarize learner state'],cannot:['change verified content','award official proficiency']},
    planner:{name:'Pedagogical Planner',can:['select one bounded learning intervention','explain why it was selected'],cannot:['skip mandatory curriculum prerequisites','silently alter teacher rubrics']},
    tutor:{name:'AI Tutor',can:['scaffold','ask questions','generate practice variation from approved content'],cannot:['replace the learner response','present unverified mnemonic as etymology']},
    evaluator:{name:'Evidence Evaluator',can:['structure task outcomes','update internal learner evidence'],cannot:['certify HSK','hide uncertainty or source status']}
  };
  function run(term,opts={}){
    const concept=String(term||'');
    const diagnosis=window.PandaHanDiagnostic?.diagnoseConcept?.(concept)||{issues:[],confidence:0,evidenceCount:0};
    const plan=window.PandaHanPedagogy?.planForConcept?.(concept,{audit:opts.audit!==false})||null;
    const teaching=window.PandaHanVocabularyIntelligence?.buildTeachingView?.(concept)||null;
    const agenda=teaching?.agendaAlignment||window.PandaHanVocabularyIntelligence?.agendaFor?.(concept)||null;
    const task=window.PandaHanVocabularyIntelligence?.taskFactory?.(concept,{preferredSkill:plan?.selectedIntervention?.targetSkill||'',decision:plan})||null;
    return{concept,roles:ROLES,analyst:{diagnosis,evidenceCount:diagnosis.evidenceCount||0},planner:{decision:plan,agendaAlignment:agenda},tutor:{task,scaffoldingPolicy:'hint-before-answer; preserve learner reasoning'},evaluator:{policy:'store structured evidence; internal estimate only; no official certification'},governance:{teacherOverride:true,contentProvenanceRequired:true,officialScoreClaim:false,boundary:'No self-spawning agents and no unsupervised curriculum rewrite'},generatedAt:Date.now(),version:'58.0'};
  }
  window.PanTutorAgentOrchestrator={ROLES,run,version:'58.0'};
})();
