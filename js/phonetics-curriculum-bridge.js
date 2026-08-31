(() => {
  "use strict";
  const EXCEL_PHONETICS = {
    1: "4 thanh điệu + nguyên âm đơn a,o,e,i,u,ü",
    2: "Phụ âm đầu b/p/m/f, d/t/n/l",
    3: "Phụ âm j/q/x (mặt lưỡi)",
    4: "Âm uốn lưỡi zh/ch/sh/r vs z/c/s",
    5: "Vận mẫu mũi -n vs -ng (an/ang, in/ing, en/eng)",
    6: "Biến điệu: thanh 3+3, 不 và 一",
    7: "Ôn tập & kiểm tra tổng hợp tuần 1",
    8: "Âm tiết co rút iu(iou), ui(uei), un(uen)",
    9: "Khinh thanh & 儿化 (erhua) cơ bản",
    10: "Tổng ôn ngữ âm + thi thử đọc"
  };
  async function openDay(day, focus="phonetics") {
    const n = Math.max(1, Math.min(10, Number(day)||1));
    window.switchTab?.("pinyin");
    try { await window.loadPinyinPhonetics?.(); } catch (_) {}
    window.dispatchEvent(new CustomEvent("pandahan-open-phonetics-session", { detail:{ sessionId:n, excelDay:n, focus, excelTopic:EXCEL_PHONETICS[n] } }));
    return {dayNumber:n, topic:EXCEL_PHONETICS[n]};
  }
  window.PandaHanPhoneticsCurriculum = { openDay, topics: EXCEL_PHONETICS };
})();
