(() => {
  "use strict";
  const EXCEL_PHONETICS = {
    1: "Four tones + simple vowels a, o, e, i, u, ü",
    2: "Initials b/p/m/f and d/t/n/l",
    3: "Dorsopalatal initials j/q/x",
    4: "Retroflex zh/ch/sh/r vs non-retroflex z/c/s",
    5: "Nasal finals -n vs -ng (an/ang, in/ing, en/eng)",
    6: "Tone sandhi: third-tone sequences, 不 and 一",
    7: "Week 1 cumulative review and assessment",
    8: "Contracted finals iu (iou), ui (uei), un (uen)",
    9: "Neutral tone and basic 儿化 (erhua)",
    10: "Comprehensive phonetics review + reading mock assessment"
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
