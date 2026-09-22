/* PanTutor AI v57.1 — session/day learning mirror with pre/post deltas */
(function(){
 'use strict';
 const date=()=>{try{return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh'}).format(new Date());}catch(_){return new Date().toISOString().slice(0,10)}};
 const key=()=>`pandahan_v57_daily_baseline_${date()}`;
 function snap(){return window.PandaHanLearnerModel?.snapshot?.()||{summary:{},conceptCount:0};}
 function ensure(){try{let b=JSON.parse(localStorage.getItem(key())||'null');if(!b){b=snap();b.capturedAt=Date.now();localStorage.setItem(key(),JSON.stringify(b));}return b;}catch(_){return snap();}}
 function mirror(){const b=ensure(),n=snap(),rows=[];const keys=new Set([...Object.keys(b.summary||{}),...Object.keys(n.summary||{})]);for(const k of keys){const bv=b.summary?.[k],nv=n.summary?.[k];if(!nv?.evidenceCount)continue;const before=Number(bv?.estimate??.5),after=Number(nv.estimate??.5);rows.push({skill:k,before,after,delta:after-before,evidenceCount:nv.evidenceCount-(Number(bv?.evidenceCount)||0)});}rows.sort((a,b)=>b.delta-a.delta);return{date:date(),capturedAt:b.capturedAt,rows,improved:rows.filter(x=>x.delta>.005).slice(0,3),needsSupport:rows.slice().sort((a,b)=>a.after-b.after).slice(0,3),newEvidence:rows.reduce((s,x)=>s+Math.max(0,x.evidenceCount),0)};}
 window.PandaHanSessionReflection={ensure,mirror,reset:()=>localStorage.removeItem(key()),version:'57.1'};
 document.addEventListener('DOMContentLoaded',()=>setTimeout(ensure,400));
})();
