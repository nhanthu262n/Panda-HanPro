(() => {
  "use strict";
  function api(){try{return parent!==window?parent.PanTutorLessonAccess:null}catch(_){return null}}
  const namespace=()=>api()?.namespace?.()||"guest";
  function canOpen(day){return api()?.canOpen?.(Number(day))??Number(day)===1}
  window.PanTutorQuestAccess={canOpen,namespace};
})();
