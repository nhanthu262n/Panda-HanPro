/* PandaHán learning-flow reminder: this companion keeps the existing Pinyin
   Bootcamp UI/audio intact and adds only verified listening-quiz evidence. */
(() => {
  "use strict";
  const PASS_SCORE = 30;
  const QUIZ_LENGTH = 10;
  const SOURCE = "phonetics-listening-quiz";
  let state = null;

  const TRACKS = [
    { until: 1, vi: "4 thanh điệu và nguyên âm đơn", en: "Four tones and simple finals", items: [["妈", "mā"], ["麻", "má"], ["马", "mǎ"], ["骂", "mà"], ["八", "bā"]] },
    { until: 2, vi: "b/p/m/f và d/t/n/l", en: "b/p/m/f and d/t/n/l", items: [["八", "bā"], ["爸爸", "bàba"], ["妈", "mā"], ["你", "nǐ"], ["六", "liù"]] },
    { until: 4, vi: "j/q/x và zh/ch/sh/r", en: "j/q/x and zh/ch/sh/r", items: [["机", "jī"], ["七", "qī"], ["西", "xī"], ["知", "zhī"], ["吃", "chī"]] },
    { until: 6, vi: "vần và nguyên âm ghép", en: "finals and compound vowels", items: [["爱", "ài"], ["学", "xué"], ["牛", "niú"], ["水", "shuǐ"], ["家", "jiā"]] },
    { until: 8, vi: "âm mũi và biến điệu", en: "nasal finals and tone changes", items: [["很", "hěn"], ["忙", "máng"], ["中国", "Zhōngguó"], ["你好", "nǐ hǎo"], ["不", "bù"]] },
    { until: 10, vi: "tổng hợp Ngữ âm", en: "Phonetics consolidation", items: [["老师", "lǎoshī"], ["朋友", "péngyou"], ["学习", "xuéxí"], ["谢谢", "xièxie"], ["再见", "zàijiàn"]] },
  ];

  function L(vi, en) { return window.LANG_MODE === "en" ? en : vi; }
  function mission() { return window.PandaHanMission?.getCurrent?.() || null; }
  function scheduleDayNumber() { return Number(mission()?.dayNumber || 0); }
  function baseCurriculumDay() {
    const m = mission();
    return Math.max(1, Number(m?.scheduleDay?.is_repeat_of || m?.scheduleDay?.source_day_number || m?.curriculum?.day_number || m?.dayNumber || 1));
  }
  function namespace() {
    try { return String(typeof window.storageNamespace === "function" ? window.storageNamespace() : (window.CURRENT_USER?.uid || "guest")); } catch (_) { return "guest"; }
  }
  function historyKey(dayNumber) { return `pandahan_phonetics_listening_quiz_v1_${namespace().replace(/[^a-zA-Z0-9_-]/g, "_")}_${dayNumber}`; }
  function writeHistory(dayNumber, value) { try { localStorage.setItem(historyKey(dayNumber), JSON.stringify(value)); } catch (_) {} }
  function trackFor(day) { return TRACKS.find((track) => day <= track.until) || TRACKS[TRACKS.length - 1]; }
  function toneOptions(pinyin) {
    const groups = { a: "āáǎà", e: "ēéěè", i: "īíǐì", o: "ōóǒò", u: "ūúǔù", ü: "ǖǘǚǜ" };
    const marked = Object.entries(groups).find(([, values]) => [...values].some((mark) => pinyin.includes(mark)));
    if (!marked) return [pinyin, `${pinyin}1`, `${pinyin}2`, `${pinyin}3`];
    const [vowel, values] = marked;
    return [...values].map((mark) => pinyin.replace(new RegExp(`[${values}]`, "g"), mark)).filter((value, index, all) => all.indexOf(value) === index).concat([pinyin]).slice(0, 4).sort((left, right) => left === pinyin ? -1 : right === pinyin ? 1 : left.localeCompare(right));
  }
  function buildItems(day, sourceItems) {
    const source = sourceItems || trackFor(day).items.map(([char, pinyin]) => ({ char, pinyin }));
    return Array.from({ length: QUIZ_LENGTH }, (_, index) => {
      const raw = source[index % source.length];
      const char = String(raw.char || raw[0] || "");
      const pinyin = String(raw.pinyin || raw.expected || raw[1] || "");
      return { id: `${day}-${index + 1}-${char}`, char, pinyin, options: toneOptions(pinyin) };
    });
  }
  function ensureHost() {
    const root = document.getElementById("pinyinContent");
    const anchor = document.getElementById("pinyin-phonetics-root");
    if (!root || !anchor) return null;
    let host = document.getElementById("pandahan-listening-quiz-host");
    if (!host) {
      host = document.createElement("section");
      host.id = "pandahan-listening-quiz-host";
      host.style.cssText = "max-width:1100px;margin:14px auto 0;padding:0 4px;";
      anchor.insertAdjacentElement("afterend", host);
    }
    return host;
  }
  function playCurrent() {
    const item = state?.items?.[state.index];
    if (!item) return;
    const utterance = new SpeechSynthesisUtterance(item.char);
    utterance.lang = "zh-CN";
    utterance.rate = 0.66;
    utterance.onend = () => { if (state && !state.finished) { state.played = true; state.notice = L("Đã phát âm thanh mẫu. Hãy chọn pinyin bạn nghe được.", "Reference audio played. Choose the pinyin you heard."); render(); } };
    try { speechSynthesis.cancel(); speechSynthesis.speak(utterance); } catch (_) { state.notice = L("Trình duyệt chưa phát được âm thanh; hãy bật âm thanh rồi thử lại.", "The browser could not play audio. Enable audio and try again."); render(); }
  }
  function recordWrong(item, selected) {
    return window.PandaHanMistakes?.record?.(item.char, { source: SOURCE, dayNumber: state.dayNumber, prompt: `${L("Quiz nghe Ngữ âm", "Phonetics listening quiz")}: ${item.char}`, expected: item.pinyin, selected });
  }
  async function finishQuiz() {
    const correct = state.answers.filter((answer) => answer.correct).length;
    const scorePercent = Math.round((correct / state.items.length) * 100);
    const wrongItems = state.answers.filter((answer) => !answer.correct).map((answer) => ({ char: answer.item.char, expected: answer.item.pinyin, selected: answer.selected }));
    const result = { quizId: `phonetics-listening-${state.dayNumber}-${Date.now()}`, dayNumber: state.dayNumber, scorePercent, correct, total: state.items.length, attempts: 1, wrongItems, completedAt: new Date().toISOString() };
    writeHistory(state.dayNumber, result);
    state.finished = true;
    state.result = result;
    await window.PandaHanEvidence?.processListeningQuiz?.(result);
    window.dispatchEvent(new CustomEvent("pandahan-phonetics-listening-quiz", { detail: result }));
    render();
  }
  function choose(index) {
    if (!state || state.finished || state.answered) return;
    if (!state.played) { state.notice = L("Hãy bấm Phát âm thanh mẫu trước khi trả lời.", "Play the reference audio before answering."); render(); return; }
    const item = state.items[state.index];
    const selected = item.options[index];
    const correct = selected === item.pinyin;
    state.answered = true;
    state.answers.push({ item, selected, correct });
    if (!correct && state.mode !== "review") recordWrong(item, selected);
    if (correct && state.mode === "review") window.PandaHanMistakes?.resolveEntry?.(item.queueKey);
    state.notice = correct ? L("Đúng. Chuyển câu tiếp theo…", "Correct. Moving to the next question…") : L(`Chưa đúng. Đáp án là ${item.pinyin}. Câu này đã vào danh sách ôn lại.`, `Not yet. The answer is ${item.pinyin}. This item was added to redo.`);
    render();
    window.setTimeout(async () => {
      if (!state) return;
      state.index += 1; state.played = false; state.answered = false; state.notice = "";
      if (state.index >= state.items.length) {
        if (state.mode === "review") { state.finished = true; await window.PandaHanEvidence?.completeMistakeReviewIfClear?.(); render(); }
        else finishQuiz();
      } else render();
    }, 720);
  }
  function render() {
    const host = ensureHost();
    if (!host || !state) return;
    const en = window.LANG_MODE === "en";
    if (state.finished) {
      const result = state.result || {};
      const passed = Number(result.scorePercent || 0) >= PASS_SCORE;
      host.innerHTML = `<div style="border:1px solid ${passed ? "#a7f3d0" : "#fecaca"};background:#fff;border-radius:16px;padding:15px;box-shadow:0 8px 20px rgba(157,23,77,.08);"><b style="font-size:16px;">${state.mode === "review" ? (en ? "Listening-quiz redo complete" : "Đã hoàn thành ôn quiz nghe") : (en ? "Phonetics listening-quiz result" : "Kết quả quiz nghe Ngữ âm")}</b><div style="margin-top:7px;font-size:14px;">${state.mode === "review" ? (en ? "Wrong listening items were answered again. The schedule gate updates only when every open wrong item is cleared." : "Các câu nghe sai đã được trả lời lại. Schedule chỉ cập nhật khi toàn bộ lỗi đang mở được xử lý.") : (passed ? (en ? `Score ${result.scorePercent}% — Listening evidence is verified. Complete the remaining required tasks and redo wrong items before the next session opens.` : `Điểm ${result.scorePercent}% — evidence Nghe đã được xác minh. Hoàn thành các task bắt buộc còn lại và ôn câu sai trước khi mở buổi mới.`) : (en ? `Score ${result.scorePercent}% — below 30%. Retry the listening quiz; the current session remains open.` : `Điểm ${result.scorePercent}% — chưa đạt 30%. Hãy làm lại quiz nghe; buổi hiện tại vẫn giữ mở.`))}</div>${state.mode !== "review" ? `<button id="plq-retry" type="button" style="margin-top:10px;border:1px solid #c084fc;background:#fff;border-radius:8px;padding:7px 10px;font-weight:800;color:#7e22ce;">${en ? "Retry listening quiz" : "Làm lại quiz nghe"}</button>` : ""}</div>`;
      host.querySelector("#plq-retry")?.addEventListener("click", () => startScheduledQuiz());
      return;
    }
    const item = state.items[state.index];
    const progress = `${state.index + 1}/${state.items.length}`;
    host.innerHTML = `<div style="border:1px solid #ddd6fe;background:linear-gradient(135deg,#fff,#faf5ff);border-radius:16px;padding:15px;box-shadow:0 8px 20px rgba(157,23,77,.08);"><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;"><span><b>${en ? "Phonetics listening quiz" : "Quiz nghe Ngữ âm"}</b><br><small style="color:#64748b;">${en ? state.track.en : state.track.vi} · ${progress}</small></span><span style="font-size:11px;font-weight:800;color:#7e22ce;">${en ? "Pass" : "Đạt"} ≥ ${PASS_SCORE}%</span></div><p style="margin:10px 0 6px;color:#475569;font-size:13px;">${en ? "Listen first, then choose the exact pinyin with tone marks." : "Nghe trước, sau đó chọn đúng pinyin có dấu thanh."}</p><button id="plq-play" type="button" style="border:0;background:#7e22ce;color:#fff;border-radius:9px;padding:8px 11px;font-weight:800;">▶ ${en ? "Play reference audio" : "Phát âm thanh mẫu"}</button><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:10px;">${item.options.map((option, index) => `<button type="button" data-plq-option="${index}" ${state.answered ? "disabled" : ""} style="border:1px solid #e9d5ff;background:#fff;border-radius:9px;padding:9px;font-size:15px;font-weight:800;color:#334155;">${option}</button>`).join("")}</div><small style="display:block;margin-top:9px;color:${state.notice ? "#a16207" : "#64748b"};">${state.notice || (en ? "Audio must play before an answer is accepted." : "Âm thanh phải được phát trước khi hệ thống nhận câu trả lời.")}</small></div>`;
    host.querySelector("#plq-play")?.addEventListener("click", playCurrent);
    host.querySelectorAll("[data-plq-option]").forEach((button) => button.addEventListener("click", () => choose(Number(button.dataset.plqOption))));
  }
  function startScheduledQuiz() {
    const m = mission();
    if (!m || m.stageCode !== "stage_0") { alert(L("Quiz nghe này chỉ là evidence cho các buổi Ngữ âm đang mở.", "This listening quiz is evidence only for the currently unlocked Phonetics session.")); return; }
    const dayNumber = scheduleDayNumber();
    if (!dayNumber) return;
    const baseDay = baseCurriculumDay();
    state = { mode: "scheduled", dayNumber, baseDay, track: trackFor(baseDay), items: buildItems(baseDay), index: 0, answers: [], played: false, answered: false, finished: false, notice: "" };
    ensureHost()?.scrollIntoView({ behavior: "smooth", block: "start" });
    render();
  }
  function hasOpenReview() { return (window.PandaHanMistakes?.getOpenQueue?.() || []).some((item) => item.source === SOURCE); }
  function startReview() {
    const entries = (window.PandaHanMistakes?.getOpenQueue?.() || []).filter((item) => item.source === SOURCE);
    if (!entries.length) return false;
    const dayNumber = scheduleDayNumber();
    state = { mode: "review", dayNumber, baseDay: baseCurriculumDay(), track: { vi: "Ôn các câu nghe sai", en: "Redo wrong listening items" }, items: entries.map((entry, index) => ({ id: `redo-${index}`, char: entry.char, pinyin: entry.expected, options: toneOptions(entry.expected), queueKey: entry.key })), index: 0, answers: [], played: false, answered: false, finished: false, notice: "" };
    ensureHost()?.scrollIntoView({ behavior: "smooth", block: "start" });
    render();
    return true;
  }
  window.PandaHanPhoneticsListeningQuiz = { startScheduledQuiz, startReview, hasOpenReview, passScore: PASS_SCORE };
})();
