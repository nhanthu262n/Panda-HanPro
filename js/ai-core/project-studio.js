/* PanTutor AI v58 — lightweight AI Industry Project Studio.
   Learner-generated project records aligned to professor agenda. No autonomous approval:
   teacher review and human judgment remain explicit. */
(function(){
  'use strict';
  const KEY='pantutor_v58_industry_projects',MAX=60;let cache=null,timer=0;
  function load(){if(cache)return cache;try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');cache=Array.isArray(x)?x.slice(-MAX):[];}catch(_){cache=[];}return cache;}
  function persist(){clearTimeout(timer);timer=0;try{localStorage.setItem(KEY,JSON.stringify(load().slice(-MAX)));}catch(_){}}
  function soon(){clearTimeout(timer);timer=setTimeout(persist,220);}
  function clean(v,n=1800){return String(v||'').trim().slice(0,n);}
  function save(raw={}){
    const track=String(raw.track||window.PanTutorAgendaAlignment?.currentTrack?.()||'education');
    const row={projectId:raw.projectId||`PRJ-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,title:clean(raw.title,180),track,problem:clean(raw.problem),aiRole:clean(raw.aiRole),humanContribution:clean(raw.humanContribution),governance:clean(raw.governance),evidencePlan:clean(raw.evidencePlan),interdisciplinary:clean(raw.interdisciplinary),pitch:clean(raw.pitch),linkedVocabulary:Array.isArray(raw.linkedVocabulary)?raw.linkedVocabulary.map(x=>clean(x,40)).filter(Boolean).slice(0,20):[],status:String(raw.status||'PENDING_TEACHER_REVIEW'),teacherReview:raw.teacherReview||null,createdAt:Number(raw.createdAt||Date.now()),updatedAt:Date.now(),agendaItems:[1,2,3,4,5,6,7,8,9],humanAuthored:true,aiBoundary:'AI may scaffold structure and surface evidence; it does not certify project validity, ethics, domain correctness or research quality.'};
    const a=load(),i=a.findIndex(x=>x.projectId===row.projectId);if(i>=0)a[i]=row;else a.push(row);if(a.length>MAX)a.splice(0,a.length-MAX);soon();window.dispatchEvent(new CustomEvent('pantutor-v58-project-updated',{detail:row}));return row;
  }
  function review(id,status,note=''){const a=load(),r=a.find(x=>x.projectId===id);if(!r)return null;r.status=['ACCEPTED','MODIFIED','REJECTED','PENDING_TEACHER_REVIEW'].includes(status)?status:'PENDING_TEACHER_REVIEW';r.teacherReview={status:r.status,note:clean(note,700),reviewedAt:Date.now()};r.updatedAt=Date.now();soon();return r;}
  function summary(){const a=load(),byTrack={},byStatus={};for(const r of a){byTrack[r.track]=(byTrack[r.track]||0)+1;byStatus[r.status]=(byStatus[r.status]||0)+1;}return{count:a.length,pending:byStatus.PENDING_TEACHER_REVIEW||0,byTrack,byStatus};}
  window.addEventListener('pagehide',persist);
  window.PanTutorProjectStudio={load:()=>load().slice(),save,review,summary,flush:persist,version:'58.0'};
})();
