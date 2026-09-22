/* PanTutor AI v57 — human-in-the-loop governance log */
(function(){
 'use strict'; const KEY='pandahan_v57_teacher_governance';
 function all(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(_){return[]}}
 function review(decisionId,status,note=''){const row={decisionId:String(decisionId||''),status:String(status||'pending').toUpperCase(),note:String(note||''),reviewedAt:Date.now(),reviewer:String(window.auth?.currentUser?.email||'teacher/local')};const a=all();a.push(row);localStorage.setItem(KEY,JSON.stringify(a.slice(-1500)));window.dispatchEvent(new CustomEvent('pandahan-v57-teacher-review',{detail:row}));return row;}
 window.PandaHanTeacherGovernance={all,review,accept:(id,n)=>review(id,'ACCEPTED',n),modify:(id,n)=>review(id,'MODIFIED',n),reject:(id,n)=>review(id,'REJECTED',n),version:'57.0'};
})();
