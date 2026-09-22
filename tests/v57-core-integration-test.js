const fs=require('fs'), vm=require('vm');
class LS{constructor(){this.m=new Map()}getItem(k){return this.m.has(k)?this.m.get(k):null}setItem(k,v){this.m.set(k,String(v))}removeItem(k){this.m.delete(k)}}
class CE{constructor(type,opts={}){this.type=type;this.detail=opts.detail}}
const listeners={};
const window={localStorage:new LS(),auth:null,CURRENT_USER:{uid:'test'},addEventListener:(t,f)=>(listeners[t]||(listeners[t]=[])).push(f),dispatchEvent:(e)=>{for(const f of listeners[e.type]||[])f(e);return true},CustomEvent:CE,setTimeout,clearTimeout,console};
window.window=window; window.PANTUTOR_V57_VOCAB_CATALOG=JSON.parse(fs.readFileSync('/mnt/data/PanTutor_AI_V57_FULL/assets/research/vocabulary-intelligence-v57.json','utf8'));
const ctx=vm.createContext({window,localStorage:window.localStorage,CustomEvent:CE,console,setTimeout,clearTimeout,fetch:async()=>{throw new Error('fetch disabled')}});
for(const f of [
'/mnt/data/PanTutor_AI_V57_FULL/js/ai-core/learning-evidence.js',
'/mnt/data/PanTutor_AI_V57_FULL/js/ai-core/learner-model.js',
'/mnt/data/PanTutor_AI_V57_FULL/js/ai-core/strategy-model.js',
'/mnt/data/PanTutor_AI_V57_FULL/js/ai-core/diagnostic-engine.js',
'/mnt/data/PanTutor_AI_V57_FULL/js/ai-core/pedagogical-planner.js',
'/mnt/data/PanTutor_AI_V57_FULL/js/ai-core/teacher-governance.js',
'/mnt/data/PanTutor_AI_V57_FULL/js/vocabulary-intelligence/vocabulary-intelligence.js']) vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
(async()=>{
 await window.PandaHanVocabularyIntelligence.load();
 const cat=window.PandaHanVocabularyIntelligence.catalog;
 console.log('entries',cat.entryCount,'sourceRefs',cat.entries.filter(e=>Array.isArray(e.sourceRefs)&&e.sourceRefs.length>=3).length);
 for(let i=0;i<4;i++) window.PandaHanEvidence.save({conceptId:'情况',module:'test',skill:'vocabulary',subSkill:'meaning',taskType:'meaning_match',correct:true,evidenceWeight:.6,timestamp:Date.now()+i*2000});
 for(let i=0;i<3;i++) window.PandaHanEvidence.save({conceptId:'情况',module:'test',skill:'vocabulary',subSkill:'context_use',taskType:'context_cloze',correct:false,evidenceWeight:.72,errorType:'SEMANTIC_CONFUSION',confusedWith:'心情',timestamp:Date.now()+10000+i*2000});
 const d=window.PandaHanDiagnostic.diagnoseConcept('情况');
 const p=window.PandaHanPedagogy.planForConcept('情况');
 const task=window.PandaHanVocabularyIntelligence.taskFactory('情况');
 console.log('diagnosis',JSON.stringify(d));
 console.log('plan',p.selectedIntervention.action,p.selectedIntervention.targetSkill,p.selectedIntervention.contrastWith);
 console.log('task',task?.type,task?.skill,task?.options?.includes('心情'),task?.prompt);
 if(task){window.PandaHanVocabularyIntelligence.gradeTask(task,task.answer);}
 console.log('strategyBest',window.PandaHanStrategyModel.best(1));
 console.log('auditCount',window.PandaHanPedagogy.allAudits().length);
 const snap=window.PandaHanLearnerModel.snapshot();
 console.log('meaning',snap.summary.meaning,'context',snap.summary.context_use);
 const ok=cat.entryCount===2254 && cat.entries.every(e=>e.sourceRefs?.includes('GF0025_2021')) && p.selectedIntervention.action==='semantic_contrast' && task?.options?.includes('心情');
 console.log('PASS',ok);
 process.exit(ok?0:1);
})().catch(e=>{console.error(e);process.exit(1)});
