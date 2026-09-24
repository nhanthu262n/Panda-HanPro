/* Role-aware navigation; browsing never creates completion evidence. */
(() => {
  "use strict";
  function user(){try{return typeof CURRENT_USER!=="undefined"?CURRENT_USER:window.CURRENT_USER}catch(_){return null}}
  function isTeacher(){const u=user();return !!u&&["teacher","master_teacher"].includes(u.role)}
  function namespace(){const u=user();return String(u?.uid||u?.username||"guest").replace(/[^a-zA-Z0-9_-]/g,"_")}
  function selectedDay(){if(!isTeacher())return 0;try{const n=Number(localStorage.getItem("pantutor_teacher_day_"+namespace()));return Number.isInteger(n)&&n>=1&&n<=120?n:0}catch(_){return 0}}
  function selectDay(n){if(!isTeacher())throw Error("Chỉ giáo viên được chọn ngày bất kỳ.");if(!Number.isInteger(n)||n<1||n>120)throw Error("Nhập ngày từ 1 đến 120.");localStorage.setItem("pantutor_teacher_day_"+namespace(),String(n))}
  function clearDay(){localStorage.removeItem("pantutor_teacher_day_"+namespace())}
  function canOpen(n){if(!Number.isInteger(n)||n<1||n>120)return false;if(isTeacher())return true;try{const progress=JSON.parse(localStorage.getItem("pinyin-tone-quest-offline-progress-v2_"+namespace())||"{}");const gate=window.PandaHanQuestProgression?.gateFor(progress);return gate?gate.unlocked.includes(n)||gate.completed.includes(n):n===1}catch(_){return n===1}}
  let lastAccount="";
  function refresh(){const account=namespace()+":"+String(user()?.role||"student");if(account===lastAccount)return;lastAccount=account;window.PandaHanQuestParts?.resetAccess?.();localStorage.removeItem("pandahan_test_active_day");}
  window.PanTutorLessonAccess={isTeacher,namespace,selectedDay,selectDay,clearDay,canOpen,refresh};
})();
