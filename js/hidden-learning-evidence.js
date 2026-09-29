/* No UI: capture submitted learning responses in the existing account history. */
(()=>{'use strict';
 const seen=new Set();
 function capture(data){
  if(!data||!data.source)return;
  try { if(window.parent!==window&&window.parent.PanTutorHiddenEvidence){window.parent.PanTutorHiddenEvidence.capture(data);return;} } catch(_){}
  const api=window.PanTutorAttemptHistory;if(!api)return;
  const day=Number(data.dayNumber||window.PandaHanMission?.getCurrent?.()?.dayNumber||1);
  if(!Number.isInteger(day)||day<1||day>120)return;
  const key=data.eventId;
  if(key&&seen.has(key))return;if(key)seen.add(key);
  const verified=data.verified===true&&typeof data.correct==='boolean';
  const item={...data,target:String(data.target||''),input:String(data.input??''),expected:String(data.expected??''),verified,correct:verified?data.correct:null,memoryReview:verified&&!!data.target,sourceModule:data.source,recordedAt:Date.now(),validationStatus:verified?'reference_checked':'pending_review'};
  api.save({dayNumber:day,taskId:'hidden_response',scorePercent:verified?(data.correct?100:0):0,passed:verified&&data.correct,completeSet:false,total:1,correct:verified&&data.correct?1:0,items:[item],scheduleSaved:false}).catch(e=>{if(key)seen.delete(key);console.warn('Learning evidence could not be saved',e?.message)});
 }
 window.PanTutorHiddenEvidence={capture};
})();
