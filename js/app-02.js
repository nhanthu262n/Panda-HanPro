
/* ===================== PandaHán Pro — Core App Logic ===================== */
"use strict";

/* ---------- Language display mode: 'vi' (Trung-Việt) or 'en' (Trung-Anh) ---------- */
let LANG_MODE = localStorage.getItem("pandahan_lang") || "vi";
window.LANG_MODE = LANG_MODE;
const LEGACY_UI_EN = {
  "Hệ thống học tập thông minh & đồng bộ": "Smart, synced learning system", "Đăng nhập bằng Google": "Sign in with Google", "Đăng nhập ngay": "Sign in now", "Tiếp tục Offline": "Continue offline", "Mật khẩu": "Password", "hoặc": "or",
  "Từ điển": "Dictionary", "Luyện tập": "Practice", "Tiến độ": "Progress", "Ngữ âm": "Phonetics", "Nhắn tin (Lộ trình)": "Messages (Learning Path)", "Giáo viên": "Teacher", "Ôn tập": "Review", "Cần ôn": "Due for review", "Chưa học": "Not studied", "Mới học": "New", "Đang ôn": "Reinforcing", "Đã nắm": "Familiar", "Thành thạo": "Mastered", "Không có dữ liệu": "No data", "Đóng": "Close", "Quay lại": "Back", "Nghe": "Listen", "Bắt đầu": "Start", "Hoàn thành": "Completed",
  "Làm lại": "Retry", "Thoát": "Exit", "Câu tiếp theo": "Next question", "Kiểm tra": "Check", "Đáp án": "Answer", "Đúng": "Correct", "Sai": "Incorrect", "Điểm": "Score", "Mục tiêu": "Target", "Thời lượng dự kiến": "Estimated time", "Bài luyện": "Practice activity", "Bài tập": "Exercise", "Câu hỏi": "Question", "Kết quả": "Result", "Hướng dẫn": "Guide", "Lưu": "Save", "Đã lưu": "Saved", "Mở bài": "Open task", "Ôn lại câu sai": "Redo wrong items", "Học liên tiếp": "Learning streak", "Tất cả cấp độ": "All levels", "Tất cả mức độ": "All levels", "Tất cả loại từ": "All parts of speech",
  "Động từ": "Verb", "Danh từ": "Noun", "Tính từ": "Adjective", "Trạng từ": "Adverb", "Phó từ": "Adverb", "Số từ": "Numeral", "Lượng từ": "Measure word", "Trợ từ": "Particle", "Trợ động từ": "Modal verb", "Giới từ": "Preposition", "Liên từ": "Conjunction", "Thán từ": "Interjection", "Cụm từ/thành ngữ": "Phrase / idiom", "Danh từ / Tính từ": "Noun / adjective", "Tính từ / Động từ": "Adjective / verb", "Đại từ chỉ định": "Demonstrative pronoun", "Đại từ nghi vấn": "Interrogative pronoun", "Đại từ nhân xưng": "Personal pronoun", "Động từ / Liên từ": "Verb / conjunction", "Hán Việt": "Sino-Vietnamese", "Cụm từ": "Phrases", "Câu ví dụ": "Example sentences", "Mức độ ghi nhớ": "Retention level",
  "Trắc nghiệm": "Multiple choice", "Multiple choice · nghĩa, pinyin, chữ Hán, ngữ cảnh": "Multiple choice · meaning, pinyin, Hanzi, context", "Sắp xếp câu": "Sentence unscramble", "Sentence unscramble · dựa trên câu ví dụ thật": "Sentence unscramble · based on real example sentences", "Ghép chữ · nghĩa": "Match Hanzi · meaning", "Viết nghĩa": "Type the meaning", "Đề HSK3 3.0": "HSK3 3.0 practice", "Đoạn văn điền từ · Đồng/trái nghĩa · Sắp xếp hội thoại": "Cloze paragraph · synonyms/antonyms · dialogue order", "Đua xe thanh điệu": "Tone race", "Chọn đúng thanh điệu để Panda về đích · Video-inspired tone race": "Choose the correct tone to guide Panda to the finish · Video-inspired tone race", "Ôn tập 120 ngày": "120-Day Review", "Luyện nghe, chọn thanh điệu và mở bài mới khi điểm trên 60%": "Listen, choose tones, and unlock the next lesson only above 60%", "Luyện nghe và chọn thanh điệu trong không gian Quest offline": "Listen and choose tones in the offline Quest space",
  "Điểm, phần cần ôn và bước tiếp theo được lưu trong một nơi.": "Scores, review items and next steps are kept in one place.", "💬 Mở AI Coach": "💬 Open AI Coach", "Đến giờ ôn từ vựng rồi!": "Time to review vocabulary!", "🔊 Nghe nhắc nhở": "🔊 Hear reminder", "▶️ Ôn tập ngay": "▶️ Review now", "Streak sắp mất!": "Your streak is at risk!", "⚡ Học ngay!": "⚡ Study now!", "🚪 Thoát / Log out": "🚪 Log out",
  "Đang tải Ngữ âm Pinyin…": "Loading Pinyin Phonetics…", "Lần đầu cần tải dữ liệu âm thanh và flashcard.": "Audio and flashcard data load on first use.", "phần đã tải": "parts loaded", "Không tải được module Ngữ âm.": "Unable to load the Phonetics module.", "Hãy kiểm tra mạng rồi nhấn Ctrl + F5 để thử lại.": "Check your network, then press Ctrl + F5 to retry.", "Nghe mẫu": "Hear model", "Tất cả": "All", "Phát âm đúng": "Correct pronunciation", "Phát âm sai": "Incorrect pronunciation", "Lịch sử phát âm": "Pronunciation history", "Xóa lịch sử": "Clear history", "Chưa có lần thu âm nào.": "No recording attempts yet.", "Thẻ tiếp theo": "Next card", "Thẻ trước": "Previous card",
  "Buổi 1": "Session 1", "Buổi 2": "Session 2", "Buổi 3": "Session 3", "Buổi 4": "Session 4", "Buổi 5": "Session 5", "Buổi 6": "Session 6", "Buổi 7": "Session 7", "Buổi 8": "Session 8", "Buổi 9": "Session 9", "Buổi 10": "Session 10", "Tuần 1": "Week 1", "Tuần 2": "Week 2", "4 Thanh Điệu + Nguyên Âm": "4 Tones + Vowels", "Nền tảng: 4 thanh cơ bản + a o e i u": "Foundation: 4 core tones + a o e i u", "Phụ Âm b/p/m/f · d/t/n/l": "Initials b/p/m/f · d/t/n/l", "Nhóm âm môi + nhóm âm đầu lưỡi": "Labial and tongue-tip initials", "Phụ Âm j / q / x": "Initials j / q / x", "Âm mặt lưỡi — dễ nhầm với zh/ch/sh": "Blade-palatal initials — easily confused with zh/ch/sh", "Âm Cuộn Lưỡi zh/ch/sh/r · z/c/s": "Retroflex initials zh/ch/sh/r · z/c/s", "Phân biệt uốn lưỡi (zh/ch/sh/r) vs không uốn (z/c/s)": "Contrast retroflex zh/ch/sh/r with non-retroflex z/c/s", "Vận Mẫu Mũi -n và -ng": "Nasal finals -n and -ng", "Biến Điệu — Tone Sandhi": "Tone sandhi", "Ôn Tập Tuần 1": "Week 1 review", "Tổng Ôn + Thi Thử Đọc": "Final review + reading mock test",
  "Giai đoạn 0 · Ngữ âm nền tảng · mở từng chữ để nghe đúng mẫu rồi luyện Flashcard → Game → Quiz": "Stage 0 · Phonetics foundation · open each sound to hear the correct model, then practise Flashcards → Game → Quiz", "Luyện nhóm i đặc biệt: zh · ch · sh · r · z · c · s": "Practise the special i group: zh · ch · sh · r · z · c · s", "🎵 Ngữ âm —": "🎵 Phonetics —", "zh + i · [ʐ̩] · không bật hơi": "zh + i · [ʐ̩] · unaspirated", "Gần “trư”; giữ lưỡi cong, không phì hơi.": "Similar to a retroflex ‘zh’; keep the tongue curled and do not release extra air.", "ch + i · [ʈʂʰ̩] · bật hơi": "ch + i · [ʈʂʰ̩] · aspirated", "Gần “trư”; bật một luồng hơi rõ sau âm tắc-xát.": "Similar to an aspirated retroflex ‘ch’; release a clear puff of air after the affricate.", "sh + i · [ʂ̩] · âm xát": "sh + i · [ʂ̩] · fricative", "Gần “sư”; lưỡi cong và hơi đi liên tục.": "Similar to a retroflex ‘sh’; curl the tongue and keep air flowing continuously.", "Tổng sao": "Total stars", "Buổi hoàn thành": "Completed sessions", "Buổi đã mở": "Unlocked sessions", "📈 Lịch sử phát âm": "📈 Pronunciation history", "Theo dõi từng lần thu, điểm gần nhất và mức tiến bộ theo Pinyin/thanh điệu.": "Track each recording, latest score, and progress by Pinyin/tone.", "Chưa có lần thu âm nào. Mở một ô Pinyin, bấm Ghi âm rồi xem kết quả ở đây.": "No recording attempts yet. Open a Pinyin card, tap Record, then view the result here.", "✅ Phát âm đúng": "✅ Correct pronunciation", "❌ Phát âm sai": "❌ Incorrect pronunciation", ", chữ i là nguyên âm cuống lưỡi đặc biệt, gần “ư” nhưng không phải “ư” tiếng Việt và không đọc như “i” dài. Trong": ", the letter i is a special apical-vowel sound, close to ‘ư’ but not Vietnamese ‘ư’ and not a long ‘i’. In", ", chữ i là nguyên âm đầu lưỡi trước; không quặt lưỡi thành “ư”.": ", the letter i is a front apical vowel; do not curl the tongue into ‘ư’.", "Phân biệt kết thúc mũi trước (-n) vs mũi sau (-ng)": "Contrast front nasal ending (-n) with back nasal ending (-ng)", "Thanh 3+3 · 不 biến điệu · 一 biến điệu": "Third-tone pairs · 不 tone change · 一 tone change", "Kiểm tra tổng hợp buổi 1–6": "Integrated review of Sessions 1–6", "Âm Tiết Co Rút iu · ui · un": "Contracted finals iu · ui · un", "Khinh Thanh & Âm Nhi 儿化": "Neutral tone & erhua 儿化", "Trợ từ khinh thanh: 吗 呢 吧 的 — Erhua 儿化": "Neutral-tone particles: 吗 呢 吧 的 — Erhua 儿化", "Kiểm tra toàn bộ Pinyin Bootcamp — Giai đoạn 0": "Review the full Pinyin Bootcamp — Stage 0"
};
function englishFallback(value) {
  const raw = String(value == null ? "" : value).trim();
  if (!raw) return "";
  return LEGACY_UI_EN[raw] || raw;
}
function L(viText, enText) { return LANG_MODE === "vi" ? (viText ?? "") : (enText || englishFallback(viText)); }
const POS_EN = { "Danh từ": "Noun", "Động từ": "Verb", "Tính từ": "Adjective", "Trạng từ": "Adverb", "Phó từ": "Adverb", "Liên từ": "Conjunction", "Giới từ": "Preposition", "Lượng từ": "Measure word", "Trợ từ": "Particle", "Trợ động từ": "Modal verb", "Đại từ nhân xưng": "Personal pronoun", "Đại từ nghi vấn": "Interrogative pronoun", "Đại từ chỉ định": "Demonstrative pronoun", "Cụm từ/thành ngữ": "Phrase / idiom", "Số từ": "Numeral", "Thán từ": "Interjection", "Danh từ / Tính từ": "Noun / adjective", "Tính từ / Động từ": "Adjective / verb", "Động từ / Liên từ": "Verb / conjunction", "Danh từ / Động từ": "Noun / verb", "Tính từ / Phó từ": "Adjective / adverb", "Động từ / Tính từ": "Verb / adjective" };
function localizedPos(pos) { const raw = String(pos || ""); return LANG_MODE === "en" ? (POS_EN[raw] || englishFallback(raw) || raw) : raw; }
function sinoVietnameseLabel() { return L("Hán Việt", "Sino-Vietnamese"); }
function localizedQuizOption(value) { const raw = String(value ?? ""); return POS_EN[raw] ? localizedPos(raw) : biL(raw); }
window.PandaHanLocalizePos = localizedPos;
function collapseBilingualText(root = document.body) {
  // Legacy slash labels are intentionally left untouched: rewriting arbitrary
  // text nodes made vi→en→vi irreversible and could alter examples/Quest data.
  // Only elements with explicit translation attributes are safe to switch.
  if (!root) return;
  root.querySelectorAll("[data-lang-vi][data-lang-en]").forEach((el) => {
    const value = LANG_MODE === "vi" ? el.getAttribute("data-lang-vi") : el.getAttribute("data-lang-en");
    if (el.children.length === 0) el.textContent = value;
  });
}
function applyStaticLanguageUi() {
  window.LANG_MODE = LANG_MODE;
  document.documentElement.lang = LANG_MODE === "vi" ? "vi" : "en";
  document.querySelectorAll("[data-lang-vi][data-lang-en]").forEach((el) => {
    const value = LANG_MODE === "vi" ? el.getAttribute("data-lang-vi") : el.getAttribute("data-lang-en");
    if (el.matches("button") && el.querySelector(".notif-dot")) {
      const textNode = Array.from(el.childNodes).find((node) => node.nodeType === 3);
      if (textNode) textNode.nodeValue = value;
      else el.insertBefore(document.createTextNode(value), el.firstChild);
    } else if (el.children.length === 0) {
      el.textContent = value;
    }
  });
  const label = document.getElementById("langLabel");
  if (label) label.textContent = LANG_MODE === "vi" ? "Tiếng Việt" : "English";
  const toggle = document.getElementById("langToggleBtn");
  if (toggle) toggle.textContent = LANG_MODE === "vi" ? "🌐 中文 - Tiếng Việt ▾" : "🌐 中文 - English ▾";
  const choice = document.getElementById("initialLanguageChoice");
  if (choice) choice.style.display = localStorage.getItem("pandahan_lang") ? "none" : "flex";
  const search = document.getElementById("searchInput");
  if (search) search.placeholder = LANG_MODE === "vi" ? search.dataset.placeholderVi : search.dataset.placeholderEn;
  const streak = document.getElementById("sidebarStreakDays");
  if (streak && /^\d+\s/.test(streak.textContent || "")) {
    const number = String(streak.textContent).match(/^\d+/)[0];
    streak.textContent = LANG_MODE === "vi" ? `${number} ngày` : `${number} days`;
  }
  document.querySelectorAll("[data-placeholder-vi][data-placeholder-en]").forEach((el) => { el.placeholder = LANG_MODE === "vi" ? el.dataset.placeholderVi : el.dataset.placeholderEn; });
  document.querySelectorAll("[data-aria-label-vi][data-aria-label-en]").forEach((el) => { el.setAttribute("aria-label", LANG_MODE === "vi" ? el.dataset.ariaLabelVi : el.dataset.ariaLabelEn); });
  document.querySelectorAll("[data-title-vi][data-title-en]").forEach((el) => { el.title = LANG_MODE === "vi" ? el.dataset.titleVi : el.dataset.titleEn; });
  collapseBilingualText(document.body);
  translateKnownLegacyUi(document.body);
}
function legacyTranslationRoots(root) {
  const roots = [root];
  const seen = new Set(roots);
  if (root?.shadowRoot && !seen.has(root.shadowRoot)) { seen.add(root.shadowRoot); roots.push(root.shadowRoot); }
  const addShadowRoots = (scope) => {
    if (!scope?.querySelectorAll) return;
    scope.querySelectorAll("*").forEach((el) => {
      if (el.shadowRoot && !seen.has(el.shadowRoot)) { seen.add(el.shadowRoot); roots.push(el.shadowRoot); addShadowRoots(el.shadowRoot); }
    });
  };
  roots.slice().forEach(addShadowRoots);
  return roots;
}
function englishLegacyText(original) {
  if (LEGACY_UI_EN[original]) return LEGACY_UI_EN[original];
  const studied = original.match(/^(\d+\s*\/\s*\d+)\s+đã học$/i);
  if (studied) return `${studied[1]} studied`;
  const loaded = original.match(/^(\d+)\s*\/\s*(\d+)\s+phần đã tải$/i);
  if (loaded) return `${loaded[1]}/${loaded[2]} parts loaded`;
  return "";
}
function translateKnownLegacyUi(root = document.body) {
  if (!root) return;
  legacyTranslationRoots(root).forEach((scope) => {
    scope.querySelectorAll("button, label, option, summary, h1, h2, h3, h4, p, small, span, div").forEach((el) => {
      if (el.children.length) return;
      const original = el.dataset.i18nLegacyVi || String(el.textContent || "").trim();
      const english = englishLegacyText(original);
      if (!english) return;
      if (!el.dataset.i18nLegacyVi) el.dataset.i18nLegacyVi = original;
      el.textContent = LANG_MODE === "en" ? english : original;
    });
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const parent = node.parentElement;
      if (parent && !parent.closest("script,style")) {
        const original = node.__pandahanI18nLegacyVi || node.nodeValue || "";
        const plain = String(original).trim();
        const english = englishLegacyText(plain);
        if (english) {
          node.__pandahanI18nLegacyVi = original;
          const lead = String(original).match(/^\s*/)?.[0] || "";
          const trail = String(original).match(/\s*$/)?.[0] || "";
          node.nodeValue = LANG_MODE === "en" ? `${lead}${english}${trail}` : original;
        }
      }
      node = walker.nextNode();
    }
  });
}
function setLangMode(mode) {
  LANG_MODE = mode === "en" ? "en" : "vi";
  window.LANG_MODE = LANG_MODE;
  localStorage.setItem("pandahan_lang", LANG_MODE);
  applyStaticLanguageUi();
  renderGrids();
  window.dispatchEvent(new CustomEvent("pandahan-language-changed", { detail: { lang: LANG_MODE } }));
  setTimeout(() => translateKnownLegacyUi(document.body), 0);
  const detailEl = document.getElementById("detailView");
  if (currentDetailChar && detailEl && detailEl.classList.contains("visible")) openDetail(currentDetailChar);
  if (typeof showStudyReminder === "function" && getDueCount() > 0) showStudyReminder();
}

/* ---------- Gentle "ting" sound effects ---------- */
let _audioCtx = null;
function playTing(type = "tap") {
  try {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (_audioCtx.state === "suspended") _audioCtx.resume();
    const ctx = _audioCtx;
    const t0 = ctx.currentTime;
    if (type === "tap") {
      // Playful cartoon "boop" — a quick upward pitch-bend, punchier and louder
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(520, t0);
      osc.frequency.exponentialRampToValueAtTime(980, t0 + 0.09);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.28, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0); osc.stop(t0 + 0.2);
      return;
    }
    if (type === "tick") {
      // Subtle clock-tick for the quiz countdown timer — quiet, short, non-intrusive
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(1400, t0);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.07, t0 + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.05);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0); osc.stop(t0 + 0.06);
      return;
    }
    const presets = {
      open:    { f1: 784,  f2: 1174, dur: 0.35, vol: 0.16 },
      correct: { f1: 988,  f2: 1568, dur: 0.4,  vol: 0.18 },
      wrong:   { f1: 392,  f2: 330,  dur: 0.3,  vol: 0.13 },
      levelup: { f1: 784,  f2: 1568, dur: 0.55, vol: 0.2  },
    };
    const p = presets[type] || presets.open;
    [p.f1, p.f2].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t0 + i * 0.05);
      gain.gain.setValueAtTime(0.0001, t0 + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(p.vol, t0 + i * 0.05 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.05 + p.dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0 + i * 0.05);
      osc.stop(t0 + i * 0.05 + p.dur + 0.05);
    });
  } catch (e) { /* audio not available, fail silently */ }
}

/* ---------- Flashcard mascot, streak counter & confetti (visual/audio polish) ---------- */
let fcStreak = 0;
const FC_MASCOT_MOOD = {
  idle: "🐼",
  5: "🤩",
  4: "😄",
  3: "🤔",
  2: "😕",
  1: "😢",
};
const FC_MASCOT_MSG = {
  5: () => L(["Xuất sắc!", "Đỉnh quá!", "Quá đỉnh!", "Siêu nhớ!"], ["Amazing!", "Nailed it!", "Perfect!", "Wow!"]),
  4: () => L(["Tốt lắm!", "Giỏi ghê!", "Đúng rồi!"], ["Nice job!", "Well done!", "Good!"]),
  3: () => L(["Gần đúng rồi!", "Cố thêm chút!"], ["Almost there!", "So close!"]),
  2: () => L(["Ôn lại nhé!", "Không sao, cố lên!"], ["Review this one!", "It's okay, keep going!"]),
  1: () => L(["Chưa nhớ, ôn kỹ nha!", "Cố lên nào!"], ["Let's review this!", "You'll get it next time!"]),
};
function pickOne(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function resetMascot() {
  const el = document.getElementById("fcMascot");
  const msg = document.getElementById("fcMascotMsg");
  if (el) { el.textContent = FC_MASCOT_MOOD.idle; el.classList.remove("pop", "shake"); }
  if (msg) msg.classList.remove("show");
}

function reactMascot(grade) {
  const el = document.getElementById("fcMascot");
  const msg = document.getElementById("fcMascotMsg");
  if (el) {
    el.textContent = FC_MASCOT_MOOD[grade] || FC_MASCOT_MOOD.idle;
    el.classList.remove("pop", "shake");
    void el.offsetWidth;
    el.classList.add(grade >= 4 ? "pop" : "shake");
  }
  if (msg) {
    const getter = FC_MASCOT_MSG[grade];
    msg.textContent = getter ? pickOne(getter()) : "";
    msg.classList.remove("show");
    void msg.offsetWidth;
    msg.classList.add("show");
  }
}

function updateStreak(grade) {
  const badge = document.getElementById("fcStreakBadge");
  const count = document.getElementById("fcStreakCount");
  if (grade >= 4) fcStreak++; else fcStreak = 0;
  if (!badge || !count) return;
  if (fcStreak >= 2) {
    count.textContent = fcStreak;
    badge.style.display = "inline-flex";
    badge.classList.remove("pop");
    void badge.offsetWidth;
    badge.classList.add("pop");
  } else {
    badge.style.display = "none";
  }
}

function burstConfetti(container, count = 22) {
  if (!container) return;
  const colors = ["#f59e0b", "#ef4444", "#22c55e", "#3b82f6", "#ec4899", "#a855f7", "#eab308"];
  const rect = container.getBoundingClientRect();
  for (let i = 0; i < count; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * rect.width + "px";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    const duration = 0.7 + Math.random() * 0.6;
    piece.style.animationDuration = duration + "s";
    piece.style.animationDelay = Math.random() * 0.15 + "s";
    container.appendChild(piece);
    setTimeout(() => piece.remove(), (duration + 0.2) * 1000);
  }
}

function playFanfare() {
  // A little extra celebratory flourish on top of the "levelup" ting, for
  // finishing a full review session or a great streak.
  try {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (_audioCtx.state === "suspended") _audioCtx.resume();
    const ctx = _audioCtx;
    const t0 = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C-E-G-C arpeggio
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t0 + i * 0.09);
      gain.gain.setValueAtTime(0.0001, t0 + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.22, t0 + i * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.09 + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0 + i * 0.09);
      osc.stop(t0 + i * 0.09 + 0.4);
    });
  } catch (e) { /* fail silently */ }
}

/* ---------- Playful bounce + click sound on every button press ---------- */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  // Skip the generic tap sound for buttons that already trigger their own distinct sound
  const hasOwnSound = btn.closest(".quiz-options") || btn.className.startsWith("grade-") || btn.id === "uCheckBtn";
  if (!hasOwnSound) playTing("tap");
  btn.classList.remove("btn-pop");
  void btn.offsetWidth; // restart animation
  btn.classList.add("btn-pop");
  setTimeout(() => btn.classList.remove("btn-pop"), 260);
}, true);


/* ---------- Cepeda et al. (2006): Nonmonotonic (Inverse-U) Lag Effect ----------
   Anchor data points from the paper (meta-analysis of 317 experiments, 839 assessments):
   RI (Retention Interval, ngày) -> ISI tối ưu (ngày) -> tỷ lệ ghi nhớ đạt được
     RI=1    -> ISI=1.5   (1-2 ngày)   -> retention ~74%
     RI=30   -> ISI=10.5  (7-14 ngày)  -> retention ~62%
     RI=168  -> ISI=28    (~1 tháng)   -> retention ~56%
   Dùng nội suy log-log giữa các mốc để tính ISI tối ưu cho bất kỳ RI nào. */
const CEPEDA_ANCHORS = [
  { RI: 1, ISI: 1.5 },
  { RI: 30, ISI: 10.5 },
  { RI: 168, ISI: 28 },
];
function optimalISI(RI) {
  const pts = CEPEDA_ANCHORS;
  if (RI <= pts[0].RI) return pts[0].ISI * (RI / pts[0].RI);
  for (let i = 0; i < pts.length - 1; i++) {
    if (RI >= pts[i].RI && RI <= pts[i + 1].RI) {
      const t = (Math.log(RI) - Math.log(pts[i].RI)) / (Math.log(pts[i + 1].RI) - Math.log(pts[i].RI));
      return Math.exp(Math.log(pts[i].ISI) + t * (Math.log(pts[i + 1].ISI) - Math.log(pts[i].ISI)));
    }
  }
  const a = pts[pts.length - 2], b = pts[pts.length - 1];
  const slope = (Math.log(b.ISI) - Math.log(a.ISI)) / (Math.log(b.RI) - Math.log(a.RI));
  return Math.exp(Math.log(b.ISI) + slope * (Math.log(RI) - Math.log(b.RI)));
}
const RI_TARGET_DAYS = 30; // mục tiêu duy trì trí nhớ dài hạn (30 ngày) — mốc có dữ liệu thực nghiệm rõ ràng nhất trong Cepeda et al. (2006)

/* Hiệu suất giãn cách (Spacing Efficiency): so sánh khoảng cách ôn tập thực tế (ISI thực tế của SM-2)
   với ISI tối ưu theo hàm U-ngược. Hiệu suất đạt đỉnh khi tỉ lệ ≈ 1 (ôn đúng lúc), giảm dần nếu ôn
   quá dày (over-encoding, chưa quên nên ôn lại không hiệu quả) hoặc quá thưa (retrieval failure, đã quên hẳn). */
function spacingEfficiency(char) {
  const s = getStat(char);
  if (s.repetitions === 0) return 0;
  const optimal = optimalISI(RI_TARGET_DAYS);
  const ratio = Math.max(s.interval, 0.5) / optimal;
  const logRatio = Math.log(ratio);
  const efficiency = Math.exp(-0.5 * Math.pow(logRatio / 0.9, 2)); // hàm Gauss trong không gian log ~ mô phỏng đường U-ngược
  return Math.max(0, Math.min(1, efficiency));
}

/* ---------- Custom words added by a teacher (shared across this browser — see
   the "Add Vocabulary" feature in the Teacher Dashboard) ---------- */
function loadCustomWords() {
  try { return JSON.parse(localStorage.getItem("pandahan_custom_words_v1")) || []; } catch (e) { return []; }
}
function saveCustomWords(list) { localStorage.setItem("pandahan_custom_words_v1", JSON.stringify(list)); }

/* ---------- Normalize vocab data ---------- */
const VOCAB = VOCAB_RAW.concat(loadCustomWords()).map((w, i) => ({
  id: i,
  char: w.char, pinyin: w.pinyin, hanviet: w.hanviet, pos: w.pos,
  meaning: w.meaning, meaning_en: w.meaning_en, def_zh: w.def_zh, hsk: w.hsk,
  cumtu: w.cumtu || [], examples: w.examples || [],
  mc: w.mc || [], unscramble: w.unscramble || [], fill: w.fill || [],
  chietu_vi: w.chietu_vi || "", chietu_en: w.chietu_en || "", chietu_source: w.chietu_source || "",
  isCustom: !!w.isCustom,
}));
const VOCAB_BY_CHAR = {}; VOCAB.forEach(w => VOCAB_BY_CHAR[w.char] = w);

/* =====================================================================
   DEMO AUTH & ROLE-BASED ACCESS (client-side prototype only)
   ---------------------------------------------------------------------
   NOTE for graders/reviewers: this is a demonstration of the access-
   control flow described in the thesis diagram (login -> authenticate
   -> assign role -> show matching UI). It is NOT a production auth
   system: there is no server, credentials are a hardcoded demo list,
   and all data lives in this browser's localStorage only (so a
   "teacher" only sees "student" progress recorded on this same
   browser/device). A real deployment needs a backend (e.g. Supabase/
   Firebase) for real accounts and cross-device data.
   ===================================================================== */
const DEMO_USERS = [
  { username: "teacher",  password: "teacher123", role: "teacher", name: "Cô Ngọc (Giáo viên)", nameEn: "Ms. Ngoc (Teacher)" },
  { username: "hocvien1", password: "123456",      role: "student", name: "Nguyễn Văn An",       nameEn: "Nguyen Van An" },
  { username: "hocvien2", password: "123456",      role: "student", name: "Trần Thị Bình",        nameEn: "Tran Thi Binh" },
  { username: "hocvien3", password: "123456",      role: "student", name: "Lê Minh Châu",         nameEn: "Le Minh Chau" },
];
function findUser(username) { return DEMO_USERS.find(u => u.username === username) || null; }

function getUserFlags() {
  try { return JSON.parse(localStorage.getItem("pandahan_userflags_v1")) || {}; } catch (e) { return {}; }
}
function saveUserFlags(f) { localStorage.setItem("pandahan_userflags_v1", JSON.stringify(f)); }
function isLocked(username) { return !!(getUserFlags()[username] && getUserFlags()[username].locked); }
function setLocked(username, locked) {
  const f = getUserFlags(); f[username] = f[username] || {}; f[username].locked = locked; saveUserFlags(f);
}

function getSession() {
  try { return JSON.parse(localStorage.getItem("pandahan_session_v1")); } catch (e) { return null; }
}
function setSession(username) { localStorage.setItem("pandahan_session_v1", JSON.stringify({ username })); }
function clearSession() { localStorage.removeItem("pandahan_session_v1"); }

// let CURRENT_USER = null; // Redundant declaration removed
{
  const sess = getSession();
  if (sess && sess.username) {
    let u = findUser(sess.username);
    if (!u && sess.username.startsWith("google_")) {
      try {
        const saved = JSON.parse(localStorage.getItem("pandahan_google_profile_" + sess.username));
        if (saved) { DEMO_USERS.push(saved); u = saved; }
      } catch (e) {}
    }
    if (u && !isLocked(u.username)) CURRENT_USER = u;
  }
}

/* =====================================================================
   GOOGLE SIGN-IN (real OAuth via Google Identity Services)
   ---------------------------------------------------------------------
   SETUP REQUIRED before this works — this cannot be pre-configured for
   you, it must be tied to your own Google Cloud project:
     1. https://console.cloud.google.com/ → create/select a project.
     2. APIs & Services → OAuth consent screen → configure it (External,
        add an app name + your support email).
     3. APIs & Services → Credentials → Create Credentials → OAuth
        client ID → Application type: "Web application".
     4. Under "Authorized JavaScript origins", add the exact URL where
        this file will be hosted (must be http(s), e.g.
        https://your-username.github.io — NOT a local file:// path).
     5. Copy the generated Client ID (ends in .apps.googleusercontent.com)
        and paste it below as GOOGLE_CLIENT_ID.
   Until that's done, the button area shows a setup notice instead.
   Once signed in, the REAL Google name/email from the account is used,
   with Teacher role granted temporarily per current requirements.
   ===================================================================== */
function decodeJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(atob(base64).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
  return JSON.parse(jsonPayload);
}
function handleGoogleCredentialResponse(response) {
  const payload = decodeJwt(response.credential);
  const username = "google_" + payload.sub;
  let u = findUser(username);
  if (!u) {
    const isMaster = MASTER_EMAILS.includes(payload.email);
    u = {
      username, password: null, role: isMaster ? "teacher" : "student",
      name: payload.name || payload.email, nameEn: payload.name || payload.email,
      email: payload.email, picture: payload.picture, isGoogleUser: true,
    };
    DEMO_USERS.push(u);
  }
  localStorage.setItem("pandahan_google_profile_" + username, JSON.stringify(u));
  completeLogin(u); // Test mode: không chờ duyệt, vào thẳng
}
let isGoogleInitialized = false;
// Duplicate initGoogleSignIn removed

/* Per-user namespaced storage: each demo account gets its own stats/log
   slice within localStorage, so a "student" account's progress doesn't
   mix with another's on the same browser. */
function storageNamespace() { 
  if (!CURRENT_USER) return "guest";
  return CURRENT_USER.uid || CURRENT_USER.username || "guest";
}

/* ---------- Persistent storage (localStorage) ---------- */
let STORE_KEY = "pandahan_pro_stats_v1_" + storageNamespace();
let LOG_KEY = "pandahan_pro_log_v1_" + storageNamespace();
function loadStats() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; }
}
function saveStats() { localStorage.setItem(STORE_KEY, JSON.stringify(STATS)); }
function loadLog() {
  try { return JSON.parse(localStorage.getItem(LOG_KEY)) || []; } catch (e) { return []; }
}
function saveLog() { localStorage.setItem(LOG_KEY, JSON.stringify(ACTLOG.slice(-80))); }

let STATS = loadStats();      // { char: { repetitions, ef, interval, nextReview, firstSeen, lastSeen, viewLog:[t], studyLog:[{t,grade}], quizAttempts, quizCorrect } }
let ACTLOG = loadLog();       // [{t, text}]

function getStat(char) {
  if (!STATS[char]) {
    STATS[char] = { repetitions: 0, ef: 2.5, interval: 0, nextReview: 0, firstSeen: 0, lastSeen: 0, viewLog: [], studyLog: [], quizAttempts: 0, quizCorrect: 0, quizLog: [] };
  }
  if (!STATS[char].quizLog) STATS[char].quizLog = []; // backfill for stats saved before this field existed
  return STATS[char];
}

function logActivity(text) {
  ACTLOG.push({ t: Date.now(), text });
  saveLog();
  if (typeof renderMergedHistory === "function") renderMergedHistory();
}

/* ---------- Record a "view" (search/lookup) event — independent of grading ---------- */
function recordView(char) {
  const s = getStat(char);
  const now = Date.now();
  if (!s.firstSeen) s.firstSeen = now;
  s.lastSeen = now;
  s.viewLog.push(now);
  if (s.viewLog.length > 50) s.viewLog = s.viewLog.slice(-50);
  saveStats();
}

/* ---------- SM-2 spaced repetition update ---------- */
/* ---------- Interval fuzz: a small random jitter (±15%) on the scheduling
   date only (never on the stored base interval), so words learned together
   don't all pile up due on the exact same future day — spreads review load
   more evenly, a well-known refinement over vanilla SM-2 (used by Anki etc). */
function applyIntervalFuzz(days) {
  if (days < 2) return days; // keep the 1-day / 6-day steps exact early on
  const fuzz = 1 + (Math.random() * 0.3 - 0.15);
  return Math.max(1, Math.round(days * fuzz));
}
window.gradeWord = function(char, q) {
  // q: 1(very poor) - 5(perfect), matching SM-2 quality scale (we treat q<3 as fail)
  const s = getStat(char);
  const now = Date.now();
  if (!s.firstSeen) s.firstSeen = now;

  // Overdue penalty: SM-2 alone doesn't distinguish "reviewed right on time"
  // from "reviewed 3 weeks late" — but a late review usually means more was
  // actually forgotten than the quiz score alone suggests. Nudge the
  // effective quality down (capped) proportional to how overdue it was,
  // so EF/interval stay realistic instead of over-trusting a lucky guess.
  let effectiveQ = q;
  let overdueDays = 0;
  if (s.nextReview && s.repetitions > 0 && now > s.nextReview) {
    overdueDays = Math.floor((now - s.nextReview) / 86400000);
    const penalty = Math.min(2, Math.floor(overdueDays / 7));
    effectiveQ = Math.max(1, q - penalty);
  }

  s.lastSeen = now;
  if (effectiveQ < 3) {
    s.repetitions = 0;
    s.interval = 1;
  } else {
    s.repetitions += 1;
    if (s.repetitions === 1) s.interval = 1;
    else if (s.repetitions === 2) s.interval = 6;
    else s.interval = Math.round(s.interval * s.ef);
  }
  s.ef = s.ef + (0.1 - (5 - effectiveQ) * (0.08 + (5 - effectiveQ) * 0.02));
  if (s.ef < 1.3) s.ef = 1.3;
  s.nextReview = now + applyIntervalFuzz(s.interval) * 86400000;
  s.studyLog.push({ t: now, grade: q, overdueDays });
  if (s.studyLog.length > 60) s.studyLog = s.studyLog.slice(-60);
  saveStats();
  return s;
};

// ─── SYNC WRAPPER: gọi syncData sau mỗi lần gradeWord ───
(function wrapGradeWord() {
  const realGrade = window.gradeWord;
  window.gradeWord = function(char, grade) {
    realGrade.call(this, char, grade);
    syncData();
  };
})();

/* ---------- Objective SM-2 daily assessment for the flashcard review step ----------
   The learner must not self-rate. Quality is calculated only from this word's
   SM-2 grades recorded during the current Vietnam calendar day. */
function sm2CalendarDay(timestamp) {
  try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(timestamp)); }
  catch (_) { return new Date(timestamp).toISOString().slice(0, 10); }
}
function computeAutoQuality(char) {
  const s = getStat(char);
  const today = sm2CalendarDay(Date.now());
  const dailyGrades = (Array.isArray(s.studyLog) ? s.studyLog : [])
    .filter((entry) => sm2CalendarDay(Number(entry.t)) === today && Number.isFinite(Number(entry.grade)))
    .map((entry) => Math.max(1, Math.min(5, Number(entry.grade))));
  if (!dailyGrades.length) return { quality: null, label: L("Chưa có điểm SM-2 hôm nay", "No SM-2 score today"), ratio: null, dailyAverage: null, dailyCount: 0, source: "sm2-daily" };
  const dailyAverage = dailyGrades.reduce((sum, grade) => sum + grade, 0) / dailyGrades.length;
  let quality, label;
  if (dailyAverage >= 4.5) { quality = 5; label = L("Hoàn hảo", "Perfect"); }
  else if (dailyAverage >= 3.5) { quality = 4; label = L("Tốt", "Good"); }
  else if (dailyAverage >= 2.5) { quality = 3; label = L("Chần chờ", "Hesitant"); }
  else if (dailyAverage >= 1.5) { quality = 2; label = L("Không nhớ", "Forgot"); }
  else { quality = 1; label = L("Rất kém", "Very poor"); }
  return { quality, label, ratio: dailyAverage / 5, dailyAverage, dailyCount: dailyGrades.length, source: "sm2-daily" };
}
/* ---------- Objective wrong-answer queue ----------
   Every objectively wrong vocabulary item is queued for AI Coach review.
   This is learner evidence, not a self-confirmation control. */
function mistakeStorageKey() {
  let owner = "guest";
  try { owner = typeof storageNamespace === "function" ? storageNamespace() : (window.CURRENT_USER?.uid || "guest"); } catch (_) {}
  return `pandahan_mistake_queue_v1_${String(owner).replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}
function readMistakeQueueRaw() {
  try { const value = JSON.parse(localStorage.getItem(mistakeStorageKey()) || "[]"); return Array.isArray(value) ? value : []; } catch (_) { return []; }
}
function writeMistakeQueueRaw(value) { try { localStorage.setItem(mistakeStorageKey(), JSON.stringify(value.slice(0, 120))); } catch (_) {} }
const MISTAKE_RETRY_DAYS = [1, 3, 5, 7, 14, 30, 60];
function mistakeIsOpen(item) { return Number(item?.wrongCount || 0) > Number(item?.resolvedCount || 0); }
function mistakeIsDue(item, now = Date.now()) { return !!item?.nextReviewAt && Number(item.nextReviewAt) <= now; }
function nextMistakeReviewAt(stage, now = Date.now()) {
  const days = MISTAKE_RETRY_DAYS[Math.max(0, Math.min(Number(stage || 0), MISTAKE_RETRY_DAYS.length - 1))];
  return now + days * 86400000;
}
function recordVocabularyMistake(char, meta = {}) {
  const keyChar = String(char || "").trim();
  if (!keyChar) return null;
  const source = String(meta.source || "practice");
  const prompt = String(meta.prompt || "").slice(0, 240);
  const key = `${keyChar}::${source}::${prompt}`;
  const now = Date.now();
  const queue = readMistakeQueueRaw();
  let item = queue.find((entry) => entry.key === key);
  if (!item) {
    item = { key, char: keyChar, dayNumber: Number(meta.dayNumber || window.PandaHanMission?.getCurrent?.()?.dayNumber || 0), source, prompt, expected: String(meta.expected || "").slice(0, 240), selected: String(meta.selected || "").slice(0, 240), wrongCount: 0, resolvedCount: 0, retryStage: 0, nextReviewAt: null, firstWrongAt: now, lastWrongAt: now };
    queue.unshift(item);
  }
  item.wrongCount = Number(item.wrongCount || 0) + 1;
  item.lastWrongAt = now;
  item.retryStage = 0;
  item.nextReviewAt = nextMistakeReviewAt(0, now);
  item.lastStatus = "wrong_requires_redo";
  if (meta.expected) item.expected = String(meta.expected).slice(0, 240);
  if (meta.selected) item.selected = String(meta.selected).slice(0, 240);
  writeMistakeQueueRaw(queue);
  const activeDayNumber = Number(item.dayNumber || meta.dayNumber || window.PandaHanMission?.getCurrent?.()?.dayNumber || 0);
  if (activeDayNumber && window.PandaHanSchedule?.requireMistakeReview) window.PandaHanSchedule.requireMistakeReview(activeDayNumber).catch((error) => console.warn("Require mistake review:", error.message || error));
  window.dispatchEvent(new CustomEvent("pandahan-mistake-recorded", { detail: { ...item, unresolved: Math.max(0, item.wrongCount - item.resolvedCount), nextReviewAt: item.nextReviewAt } }));
  return item;
}
function resolveVocabularyMistake(char, criteria = {}) {
  const keyChar = String(char || "").trim();
  const wantedKey = String(criteria?.key || "").trim();
  if (!keyChar && !wantedKey) return;
  const now = Date.now();
  const queue = readMistakeQueueRaw();
  const item = queue.filter((entry) => (wantedKey ? entry.key === wantedKey : entry.char === keyChar) && (mistakeIsOpen(entry) || mistakeIsDue(entry, now))).sort((a, b) => Number(b.lastWrongAt || 0) - Number(a.lastWrongAt || 0))[0];
  if (!item) return;
  item.resolvedCount = Number(item.wrongCount || 0);
  item.retryStage = Math.min(Number(item.retryStage || 0) + 1, MISTAKE_RETRY_DAYS.length - 1);
  item.lastResolvedAt = now;
  item.lastStatus = "redo_verified_next_review_scheduled";
  item.nextReviewAt = nextMistakeReviewAt(item.retryStage, now);
  writeMistakeQueueRaw(queue);
  window.dispatchEvent(new CustomEvent("pandahan-mistake-resolved", { detail: { ...item, nextReviewAt: item.nextReviewAt, retryDays: MISTAKE_RETRY_DAYS[item.retryStage] } }));
}
function getVocabularyMistakeQueue() {
  const now = Date.now();
  return readMistakeQueueRaw().filter((item) => mistakeIsOpen(item) || mistakeIsDue(item, now)).sort((a, b) => Number(b.lastWrongAt || 0) - Number(a.lastWrongAt || 0));
}
function getOpenVocabularyMistakeQueue() {
  return readMistakeQueueRaw().filter(mistakeIsOpen).sort((a, b) => Number(b.lastWrongAt || 0) - Number(a.lastWrongAt || 0));
}
function getAllVocabularyMistakes() {
  return readMistakeQueueRaw().filter((item) => item && (mistakeIsOpen(item) || item.nextReviewAt)).sort((a, b) => Number(b.lastWrongAt || 0) - Number(a.lastWrongAt || 0));
}
window.PandaHanMistakes = { getQueue: getVocabularyMistakeQueue, getOpenQueue: getOpenVocabularyMistakeQueue, getAllQueue: getAllVocabularyMistakes, record: recordVocabularyMistake, resolve: resolveVocabularyMistake, resolveEntry: (key) => resolveVocabularyMistake("", { key }), retryDays: MISTAKE_RETRY_DAYS.slice() };

/* AI Tutor saved-word SRS is deliberately separate from the mandatory mistake
   queue: saving or practising a free Tutor topic must never change the 120-day
   schedule gate. Reviews below record only an actual answer in the Tutor UI. */
const TUTOR_SRS_RETRY_DAYS = [1, 3, 5, 7, 14, 30, 60];
function tutorSrsState(char) {
  const s = getStat(char);
  if (!s.tutorSrs || typeof s.tutorSrs !== "object") s.tutorSrs = null;
  return s;
}
function addTutorSrsWord(char, meta = {}) {
  const keyChar = String(char || "").trim();
  if (!keyChar) return null;
  recordView(keyChar);
  const s = tutorSrsState(keyChar);
  const now = Date.now();
  if (!s.tutorSrs) {
    s.tutorSrs = {
      source: "ai_tutor",
      savedAt: now,
      stage: 0,
      nextReviewAt: now,
      reviewCount: 0,
      correctCount: 0,
      meaning: String(meta.meaning || "").slice(0, 180),
      pinyin: String(meta.pinyin || "").slice(0, 120),
      topicId: String(meta.topicId || "").slice(0, 80)
    };
  } else {
    s.tutorSrs.meaning = String(meta.meaning || s.tutorSrs.meaning || "").slice(0, 180);
    s.tutorSrs.pinyin = String(meta.pinyin || s.tutorSrs.pinyin || "").slice(0, 120);
    s.tutorSrs.topicId = String(meta.topicId || s.tutorSrs.topicId || "").slice(0, 80);
  }
  s.lastSeen = now;
  saveStats();
  window.dispatchEvent(new CustomEvent("pandahan-ai-tutor-srs-saved", { detail: { char: keyChar, ...s.tutorSrs, retryDays: TUTOR_SRS_RETRY_DAYS.slice() } }));
  return { char: keyChar, ...s.tutorSrs };
}
function getTutorSrsWords(onlyDue = false) {
  const now = Date.now();
  return Object.entries(STATS).map(([char, stat]) => ({ char, ...(stat?.tutorSrs || {}) }))
    .filter((item) => item.source === "ai_tutor" && item.savedAt)
    .filter((item) => !onlyDue || Number(item.nextReviewAt || 0) <= now)
    .sort((a, b) => Number(a.nextReviewAt || 0) - Number(b.nextReviewAt || 0));
}
function gradeTutorSrsWord(char, correct) {
  const keyChar = String(char || "").trim();
  const s = tutorSrsState(keyChar);
  if (!keyChar || !s.tutorSrs) return null;
  const now = Date.now();
  const state = s.tutorSrs;
  state.reviewCount = Number(state.reviewCount || 0) + 1;
  state.lastReviewedAt = now;
  if (correct) {
    state.correctCount = Number(state.correctCount || 0) + 1;
    state.stage = Math.min(Number(state.stage || 0) + 1, TUTOR_SRS_RETRY_DAYS.length - 1);
  } else {
    state.stage = 0;
  }
  const retryDays = TUTOR_SRS_RETRY_DAYS[state.stage];
  state.nextReviewAt = now + retryDays * 86400000;
  s.lastSeen = now;
  s.studyLog.push({ t: now, grade: correct ? 4 : 2, source: "ai_tutor_srs", tutorSrsStage: state.stage });
  if (s.studyLog.length > 60) s.studyLog = s.studyLog.slice(-60);
  saveStats();
  window.dispatchEvent(new CustomEvent("pandahan-ai-tutor-srs-graded", { detail: { char: keyChar, correct: !!correct, ...state, retryDays } }));
  return { char: keyChar, correct: !!correct, ...state, retryDays };
}
window.PandaHanTutorSrs = { add: addTutorSrsWord, getAll: () => getTutorSrsWords(false), getDue: () => getTutorSrsWords(true), grade: gradeTutorSrsWord, retryDays: TUTOR_SRS_RETRY_DAYS.slice() };

function recordQuizResult(char, correct, meta = {}) {
  const s = getStat(char);
  s.quizAttempts += 1;
  if (correct) s.quizCorrect += 1;
  s.quizLog.push({ t: Date.now(), correct });
  if (s.quizLog.length > 30) s.quizLog = s.quizLog.slice(-30);
  if (correct) resolveVocabularyMistake(char);
  else recordVocabularyMistake(char, { ...meta, source: meta.source || "quiz" });
  // Testing effect: quiz performance also feeds the SRS as a graded review
  gradeWord(char, correct ? 4 : 2);
}

/* ---------- Practice completion -> adaptive 120-day schedule ---------- */
let practiceSaveInFlight = null;
let activePracticeMode = "free";
function setPracticeMode(mode) {
  activePracticeMode = mode === "scheduled" ? "scheduled" : "free";
  window.PandaHanPracticeMode = activePracticeMode;
  return activePracticeMode;
}
function beginPracticeSession(options = {}) {
  return setPracticeMode(options && options.practiceMode === "scheduled" ? "scheduled" : "free");
}
window.setPracticeMode = setPracticeMode;
function practiceSaveKey(dayNumber, date) {
  return `pandahan_practice_saved_${storageNamespace()}_${date}_${Number(dayNumber)}`;
}
function setPracticeSaveStatus(message, isError = false) {
  const el = document.getElementById("practiceSaveStatus");
  if (!el) return;
  el.textContent = message;
  el.style.color = isError ? "#b91c1c" : "#166534";
  el.style.display = "block";
  clearTimeout(setPracticeSaveStatus.timer);
  setPracticeSaveStatus.timer = setTimeout(() => { el.style.display = "none"; }, 7000);
}
function practiceTaskId(source) {
  // Chỉ các hoạt động có bằng chứng đúng loại mới hoàn thành task Excel bắt buộc.
  const map = { quest: "quest", "pinyin-tone-quest": "quest", "ai-coach-tone-quest": "quest", speaking: "speaking", srs: "srs", flashcards: "srs", write: "reading_writing" };
  return map[String(source || "").toLowerCase()] || "";
}
function practiceEvidenceTaskId(source) {
  const map = { quiz: "vocabulary", match: "vocabulary", unscramble: "sentence_unscramble", "tone-race": "tone_practice", "ai-coach-tone-quest": "ai_coach_tone_challenge", advanced: "advanced_reading", practice: "practice" };
  return map[String(source || "").toLowerCase()] || practiceTaskId(source) || "practice";
}
function practiceMissingText(result) {
  const missing = Array.isArray(result?.result?.missingTaskIds) ? result.result.missingTaskIds : [];
  const labels = { listening: "Nghe", speaking: "Nói", reading_writing: "Đọc/Viết", srs: "SRS", quest: "Thử thách thanh điệu AI Coach" };
  return missing.map((id) => labels[id] || id).join(", ");
}
async function savePracticeCompletion(score, source = "practice", metadata = {}) {
  const mode = metadata && metadata.practiceMode ? metadata.practiceMode : activePracticeMode;
  const numericScore = Math.max(0, Math.min(100, Number(score) || 0));
  const evidenceTaskId = practiceEvidenceTaskId(source);
  if (mode !== "scheduled") {
    const freeResult = { result: { dayNumber: null, score: numericScore, threshold: null, passed: false, action: "free_study_recorded", missingTaskIds: [], requiredTaskIds: [] }, evidenceOnly: true, freeStudy: true };
    const evaluation = { source: "free-study", taskId: evidenceTaskId, scheduleTaskId: null, rawSource: source, evidenceType: "objective_free_practice_result", verified: true, freeStudy: true, dayNumber: null, scorePercent: numericScore, ...metadata, ...freeResult.result, evaluatedAt: Date.now() };
    setPracticeSaveStatus(L(`✅ Đã lưu học tự do ${evidenceTaskId} (${numericScore}%). Không thay đổi cổng lộ trình bắt buộc.`, `✅ Free study saved: ${evidenceTaskId} (${numericScore}%). The mandatory learning-path gate was not changed.`), false);
    window.dispatchEvent(new CustomEvent("pandahan-practice-saved", { detail: { source, score: numericScore, metadata, result: freeResult, taskId: null, evidenceTaskId, freeStudy: true } }));
    window.dispatchEvent(new CustomEvent("pandahan-learning-evaluation", { detail: evaluation }));
    setPracticeMode("free");
    return { committed: true, source, taskId: null, evidenceTaskId, result: freeResult, freeStudy: true };
  }
  const api = window.PandaHanSchedule;
  if (!api || typeof api.submitDayResult !== "function") {
    setPracticeSaveStatus("⚠️ Chưa sẵn sàng lưu lộ trình; bài luyện vẫn đã lưu ở thiết bị.", true);
    return { committed: false, reason: "schedule_api_unavailable", source };
  }
  if (practiceSaveInFlight) return practiceSaveInFlight;
  practiceSaveInFlight = (async () => {
    try {
      const schedule = typeof api.getScheduleAsync === "function" ? await api.getScheduleAsync() : api.getSchedule?.();
      const days = Array.isArray(schedule?.days) ? schedule.days : [];
      const current = days.filter((d) => d.status === "unlocked")
        .sort((a, b) => Number(a.sequence_index) - Number(b.sequence_index))[0];
      if (!current) {
        setPracticeSaveStatus("⚠️ Không tìm thấy buổi đang mở; bài luyện vẫn đã lưu ở thiết bị.", true);
        return { committed: false, reason: "no_unlocked_day", source };
      }
      const today = typeof api.todayVietnam === "function" ? api.todayVietnam() : new Date().toISOString().slice(0, 10);
      const taskId = practiceTaskId(source);
      const evidenceTaskId = practiceEvidenceTaskId(source);
      const key = practiceSaveKey(current.day_number, today) + "_" + (taskId || evidenceTaskId) + "_" + numericScore;
      if (localStorage.getItem(key) === "1") {
        setPracticeSaveStatus(`✅ Kết quả ${evidenceTaskId} với điểm ${numericScore}% của ngày ${current.day_number} đã được lưu.`, false);
        return { committed: true, idempotent: true, source, dayNumber: Number(current.day_number), taskId, evidenceTaskId, score: numericScore };
      }
      const result = taskId
        ? await api.submitDayResult(Number(current.day_number), numericScore, { taskId, source })
        : { result: { dayNumber: Number(current.day_number), score: numericScore, threshold: null, passed: false, action: "evidence_recorded", missingTaskIds: [], requiredTaskIds: [] }, evidenceOnly: true };
      localStorage.setItem(key, "1");
      const passed = result?.result?.passed === true;
      const missingText = practiceMissingText(result);
      let status = `✅ Đã lưu ${evidenceTaskId} ngày ${current.day_number} (${numericScore}%).`;
      if (passed) status += " Đã đủ điều kiện và mở buổi tiếp theo.";
      else if (missingText) status += ` Còn cần: ${missingText}.`;
      else status += " Điểm chưa đạt, cần ôn lại ngày này.";
      setPracticeSaveStatus(status, false);
      const evaluation = { source: "practice", taskId: evidenceTaskId, scheduleTaskId: taskId || null, rawSource: source, evidenceType: "objective_practice_result", verified: true, dayNumber: Number(current.day_number), scorePercent: numericScore, ...metadata, ...result.result, evaluatedAt: Date.now() };
      window.dispatchEvent(new CustomEvent("pandahan-practice-saved", { detail: { source, score: numericScore, metadata, result, taskId, evidenceTaskId } }));
      window.dispatchEvent(new CustomEvent("pandahan-learning-evaluation", { detail: evaluation }));
      return { committed: true, source, taskId, evidenceTaskId, result };
    } catch (error) {
      console.error("Practice progress save:", error);
      const suffix = error.code === "INCOMPLETE_DAY_REQUIREMENTS" ? " Bài vẫn được lưu; hãy hoàn thành đủ nhiệm vụ Excel trong AI Coach." : "";
      setPracticeSaveStatus("❌ Không lưu được tiến độ lên Firebase." + suffix, true);
      return { committed: false, reason: error.code || error.message || "save_failed", source };
    } finally {
      practiceSaveInFlight = null;
      setPracticeMode("free");
    }
  })();
  return practiceSaveInFlight;
}

/* ---------- Teacher-designed mastery rubric (5 tiers), based on SRS metrics ---------- */
const RUBRIC = [
  { tier: 0, name: "Chưa học", en: "Not studied", color: "var(--t0)", light: "var(--t0-light)",
    desc: "Chưa từng ôn tập / ghi nhớ từ này.", descEn: "Never reviewed yet." },
  { tier: 1, name: "Mới học", en: "New", color: "var(--t1)", light: "var(--t1-light)",
    desc: "1-2 lần ôn đúng (SM-2), khoảng cách ôn còn ngắn (dưới 6 ngày).", descEn: "1-2 correct repetitions (SM-2), short review interval (<6 days)." },
  { tier: 2, name: "Đang ôn luyện", en: "Reinforcing", color: "var(--t2)", light: "var(--t2-light)",
    desc: "≥2 lần ôn đúng liên tiếp, độ dễ nhớ (EF) ≥ 1.8, khoảng cách 6-14 ngày.", descEn: "≥2 consecutive correct reps, ease factor ≥1.8, interval 6-14 days." },
  { tier: 3, name: "Đã nắm vững", en: "Familiar", color: "var(--t3)", light: "var(--t3-light)",
    desc: "≥3 lần ôn đúng liên tiếp, EF ≥ 2.2, VÀ hiệu suất giãn cách (Cepeda) ≥ 35% so với ISI tối ưu.", descEn: "≥3 consecutive correct reps, EF ≥2.2, AND spacing efficiency (Cepeda) ≥35% of optimal ISI." },
  { tier: 4, name: "Thành thạo", en: "Mastered", color: "var(--t4)", light: "var(--t4-light)",
    desc: "≥5 lần ôn đúng liên tiếp, EF ≥ 2.5, VÀ hiệu suất giãn cách (Cepeda) ≥ 50% — khoảng ôn tập gần với ISI tối ưu cho RI = 30 ngày.", descEn: "≥5 consecutive correct reps, EF ≥2.5, AND spacing efficiency (Cepeda) ≥50% — review interval close to optimal ISI for RI = 30 days." },
];

function getTier(char) {
  const s = getStat(char);
  if (s.repetitions === 0) return 0;
  const eff = spacingEfficiency(char);
  if (s.repetitions >= 5 && s.ef >= 2.5 && s.interval >= 30 && eff >= 0.5) return 4;
  if (s.repetitions >= 3 && s.ef >= 2.2 && s.interval >= 15 && eff >= 0.35) return 3;
  if (s.repetitions >= 2 && s.ef >= 1.8 && s.interval >= 6) return 2;
  return 1;
}
function isDue(char) {
  const s = getStat(char);
  return s.repetitions > 0 && Date.now() >= s.nextReview;
}
/* ---------- Student self-add: "save this word into my vocabulary" — this is
   exactly the same "➕ Từ đã thêm" bucket already shown in the Progress stat
   cards (based on firstSeen), so there is only ONE place a saved word lives —
   no separate "flagged" list to keep track of. ---------- */
function isFlagged(char) {
  return !!(STATS[char] && STATS[char].firstSeen > 0);
}
function toggleFlag(char) {
  recordView(char); // marks firstSeen -> now counted under "Từ đã thêm" / "Added"
  return true;
}
function updateFlagBtn(btnId, char) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.dataset.char = char;
  const added = isFlagged(char);
  btn.classList.toggle("flagged", added);
  btn.textContent = added ? "✅" : "➕";
  btn.title = added
    ? "Đã có trong 'Từ đã thêm' / Already in 'Words Added'"
    : "Thêm từ này vào 'Từ đã thêm' / Add this word to 'Words Added'";
}
function wireFlagBtn(btnId) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.addEventListener("click", () => {
    const char = btn.dataset.char;
    if (!char) return;
    toggleFlag(char);
    updateFlagBtn(btnId, char);
    playTing("correct");
  });
}

/* ===================== WORD LIST VIEWER (for the 4 stat-quad cards) ===================== */
const WORD_LIST_CATS = {
  added: {
    title: "➕ Từ đã thêm", titleEn: "➕ Words Added",
    sub: "Tất cả từ bạn đã từng mở xem hoặc học qua.", subEn: "All words you've ever opened or studied.",
    filter: w => STATS[w.char] && STATS[w.char].firstSeen > 0,
  },
  remembered: {
    title: "✅ Đã nhớ", titleEn: "✅ Remembered",
    sub: "Từ đã đạt mức \"Đã nắm vững\" hoặc \"Thành thạo\" theo SM-2.", subEn: "Words at \"Familiar\" or \"Mastered\" tier per SM-2.",
    filter: w => getTier(w.char) >= 3,
  },
  notRemembered: {
    title: "❓ Chưa nhớ", titleEn: "❓ Not Yet Remembered",
    sub: "Từ ở mức \"Mới học\" hoặc \"Đang ôn luyện\" — chưa vững.", subEn: "Words at \"New\" or \"Reinforcing\" tier — not yet solid.",
    filter: w => { const t = getTier(w.char); return t === 1 || t === 2; },
  },
  due: {
    title: "🔁 Cần ôn ngay", titleEn: "🔁 Due For Review Now",
    sub: "Từ đã đến hạn ôn theo lịch SM-2.", subEn: "Words whose SM-2 review date has arrived.",
    filter: w => isDue(w.char),
  },
};
function renderWordListView(cat) {
  const def = WORD_LIST_CATS[cat];
  if (!def) return;
  document.getElementById("wordListTitle").textContent = L(def.title, def.titleEn);
  document.getElementById("wordListSubtitle").textContent = L(def.sub, def.subEn);
  const words = VOCAB.filter(def.filter);
  const el = document.getElementById("wordListContent");
  if (!words.length) {
    el.innerHTML = `<div style="font-size:13px;color:var(--text-light);">${L("Chưa có từ nào trong mục này.", "No words in this category yet.")}</div>`;
    return;
  }
  el.innerHTML = words.map(w => {
    const t = getTier(w.char);
    const tierInfo = RUBRIC[t];
    return `<div class="cert-mini" data-char="${esc(w.char)}">
      <div>
        <div style="font-weight:700;font-size:14px;">${esc(w.char)} <span style="font-size:12px;font-weight:400;color:var(--text-light);">${esc(w.pinyin)} · ${esc(w.hanviet)}</span></div>
        <div style="font-size:12px;color:var(--text-light);">${esc(L(w.meaning, w.meaning_en))} · HSK${w.hsk}</div>
      </div>
      <span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:${tierInfo.light};color:${tierInfo.color};">${esc(L(tierInfo.name, tierInfo.en))}</span>
    </div>`;
  }).join("");
  el.querySelectorAll("[data-char]").forEach(elm => {
    elm.addEventListener("click", () => openDetail(elm.dataset.char));
  });
}

/* ===================== TEXT SELECTION: highlight / strikethrough / dictionary lookup
   (like Pleco / Du Chinese / The IELTS Dictionary's "select text to look up" feature)
   Works inside any element marked class="lookup-text" (quiz reading passages,
   dictionary example sentences). ===================== */
let ttActiveRange = null, ttActiveText = "";
function initTextLookup() {
  document.addEventListener("mouseup", handleTextSelection);
  document.addEventListener("touchend", handleTextSelection);
  document.querySelectorAll("#textToolPopup .swatch").forEach(btn => {
    btn.addEventListener("click", () => applyAnnotation(btn.dataset.color));
  });
  document.getElementById("ttBold").addEventListener("click", () => applyAnnotation("bold"));
  document.getElementById("ttLookup").addEventListener("click", lookupSelectedWord);
  document.getElementById("dictLookupOverlay").addEventListener("click", closeDictLookup);
  document.addEventListener("mousedown", (e) => {
    const popup = document.getElementById("textToolPopup");
    if (popup && !popup.contains(e.target)) hideToolPopup();
  });
}
function handleTextSelection(e) {
  if (e.target.closest && e.target.closest("#textToolPopup")) return;
  setTimeout(() => {
    const sel = window.getSelection();
    const text = sel.toString().trim();
    if (!text || sel.rangeCount === 0) { hideToolPopup(); return; }
    const anchorEl = sel.anchorNode && (sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode);
    const root = anchorEl ? anchorEl.closest(".lookup-text") : null;
    if (!root) { hideToolPopup(); return; }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    ttActiveRange = range;
    ttActiveText = text;
    const popup = document.getElementById("textToolPopup");
    popup.style.display = "flex";
    const top = Math.max(6, rect.top - 42);
    let left = rect.left + rect.width / 2 - 70;
    left = Math.max(6, Math.min(left, window.innerWidth - 180));
    popup.style.top = top + "px";
    popup.style.left = left + "px";
  }, 0);
}
function hideToolPopup() {
  document.getElementById("textToolPopup").style.display = "none";
}
function applyAnnotation(style) {
  if (!ttActiveRange) return;
  const isBold = style === "bold";
  const tagName = isBold ? "span" : "mark";
  const cls = isBold ? "pandahan-bold-hl" : "pandahan-hl-" + style;
  try {
    const span = document.createElement(tagName);
    span.className = cls;
    ttActiveRange.surroundContents(span);
    const root = span.closest && span.closest(".lookup-text");
    const scope = root?.dataset?.highlightScope || (span.closest && span.closest("#detailView") && currentDetailChar) || "";
    if (scope) persistHighlight(scope, ttActiveText, style);
  } catch (e) { /* selection crosses element boundaries — silently skip */ }
  hideToolPopup();
  window.getSelection().removeAllRanges();
}
/* ---------- Persisted personal highlights (dictionary detail and AI Tutor reading/chat) ---------- */
function getHighlightStore() {
  try { return JSON.parse(localStorage.getItem("pandahan_highlights_v1_" + storageNamespace())) || {}; }
  catch (e) { return {}; }
}
function saveHighlightStore(store) {
  localStorage.setItem("pandahan_highlights_v1_" + storageNamespace(), JSON.stringify(store));
}
function persistHighlight(char, text, style) {
  const store = getHighlightStore();
  if (!store[char]) store[char] = [];
  store[char] = store[char].filter(h => h.text !== text);
  store[char].push({ text, style });
  if (store[char].length > 30) store[char] = store[char].slice(-30);
  saveHighlightStore(store);
}
function wrapTextNodeRange(container, searchText, cls, tagName) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (node.parentElement && node.parentElement.closest(".pandahan-hl-yellow,.pandahan-hl-green,.pandahan-hl-pink,.pandahan-bold-hl")) continue;
    const idx = node.nodeValue.indexOf(searchText);
    if (idx !== -1) {
      try {
        const range = document.createRange();
        range.setStart(node, idx);
        range.setEnd(node, idx + searchText.length);
        const span = document.createElement(tagName);
        span.className = cls;
        range.surroundContents(span);
        return true;
      } catch (e) { return false; }
    }
  }
  return false;
}
function applyPersistedHighlights(scope, targetContainer = null) {
  const store = getHighlightStore();
  const list = store[scope];
  const container = targetContainer || document.getElementById("detailView");
  if (!list || !list.length || !container) return;
  list.forEach(({ text, style }) => {
    const isBold = style === "bold";
    wrapTextNodeRange(container, text, isBold ? "pandahan-bold-hl" : "pandahan-hl-" + style, isBold ? "span" : "mark");
  });
}
window.PandaHanTextHighlights = {
  apply: (scope, container) => applyPersistedHighlights(scope, container),
  get: () => getHighlightStore()
};
function lookupSelectedWord() {
  const text = ttActiveText;
  hideToolPopup();
  window.getSelection().removeAllRanges();
  showDictLookupCard(text);
}
function showDictLookupCard(text) {
  const card = document.getElementById("dictLookupPopup");
  const overlay = document.getElementById("dictLookupOverlay");
  // exact match first; otherwise try to find the longest known word contained in the selection
  let w = VOCAB_BY_CHAR[text];
  if (!w) {
    for (let len = text.length; len >= 1 && !w; len--) {
      for (let i = 0; i + len <= text.length; i++) {
        const sub = text.slice(i, i + len);
        if (VOCAB_BY_CHAR[sub]) { w = VOCAB_BY_CHAR[sub]; break; }
      }
    }
  }
  if (!w) {
    generateWordExplanation(text);
    return;
  }
    const flagged = isFlagged(w.char);
    const hskColor = { 1: "var(--hsk1)", 2: "var(--hsk2)", 3: "var(--hsk3)" }[w.hsk];
    card.innerHTML = `<div style="padding:18px;max-width:300px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
        <div style="font-size:24px;font-weight:800;">${esc(w.char)}</div>
        <span class="hsk-tag" style="background:${hskColor};flex:none;">HSK${w.hsk}</span>
      </div>
      <div style="font-size:13px;color:var(--text-light);margin-top:2px;">${esc(w.pinyin)} · ${esc(w.hanviet)} · ${esc(localizedPos(w.pos))}</div>
      <div style="font-size:14px;font-weight:600;margin-top:6px;">${esc(L(w.meaning, w.meaning_en))}</div>
      ${w.chietu_vi ? `<div style="background:#fffbeb;border-radius:8px;padding:9px 11px;margin-top:9px;font-size:12.5px;line-height:1.6;">🎨 ${esc(L(w.chietu_vi, w.chietu_en))}</div>` : ""}
      <div style="display:flex;gap:8px;margin-top:12px;">
        <button id="dictLookupSaveBtn" data-char="${w.char}" class="btn ${flagged ? "btn-outline" : "btn-hsk3"}" style="font-size:11.5px;padding:7px 12px;">${flagged ? "✅ " + L("Đã có trong Từ đã thêm", "Already in Words Added") : "💾 " + L("Lưu vào Từ đã thêm", "Save to Words Added")}</button>
        <button id="dictLookupClose" class="btn btn-outline" style="font-size:11.5px;padding:7px 12px;">${L("Đóng", "Close")}</button>
      </div>
    </div>`;
  card.style.display = "block";
  overlay.style.display = "block";
  document.getElementById("dictLookupClose").addEventListener("click", closeDictLookup);
  const saveBtn = document.getElementById("dictLookupSaveBtn");
  if (saveBtn) saveBtn.addEventListener("click", () => {
    toggleFlag(saveBtn.dataset.char);
    showDictLookupCard(text);
  });
}
function closeDictLookup() {
  document.getElementById("dictLookupPopup").style.display = "none";
  document.getElementById("dictLookupOverlay").style.display = "none";
}

/* ---------- AI-teacher fallback: when a looked-up word isn't in the HSK1-3
   dictionary, ask Claude to author an entry in the SAME style as the app's
   2,254 curated words (radical breakdown + cultural mnemonic story), then let
   the student save it — from there it's a normal word, tracked by SM-2 just
   like everything else. ---------- */
async function generateWordExplanation(text) {
  const card = document.getElementById("dictLookupPopup");
  const overlay = document.getElementById("dictLookupOverlay");
  card.innerHTML = `<div style="padding:22px;text-align:center;min-width:220px;">
    <div style="font-size:22px;font-weight:800;">${esc(text)}</div>
    <div style="margin:14px 0;font-size:26px;">🐼💭</div>
    <p style="font-size:12.5px;color:var(--text-light);">${L("Từ này chưa có trong từ điển — đang nhờ AI đóng vai giáo viên soạn giải thích...", "Not in the dictionary yet — asking the AI to act as a teacher and write an explanation...")}</p>
  </div>`;
  card.style.display = "block";
  overlay.style.display = "block";

  const prompt = `Bạn là một giáo viên tiếng Trung chuyên nghiệp, đang biên soạn từ điển học liệu HSK1-3 theo phương pháp "cultural mnemonics" (chiết tự chữ Hán + câu chuyện văn hóa gần gũi với người Việt để ghi nhớ). Hãy biên soạn 1 mục từ điển cho từ/cụm từ tiếng Trung sau: "${text}". Trả lời NGẮN GỌN, súc tích, không giải thích thừa.

Trả lời DUY NHẤT bằng JSON hợp lệ (minified, không xuống dòng thừa), không kèm text nào khác, không dùng markdown code fence, đúng định dạng:
{"char":"chữ Hán chính xác","pinyin":"pinyin có dấu thanh","hanviet":"âm Hán Việt","pos":"một trong: Danh từ, Động từ, Tính từ, Phó từ, Liên từ, Giới từ, Lượng từ, Trợ từ, Đại từ nhân xưng, Trợ động từ, Đại từ nghi vấn, Đại từ chỉ định, Cụm từ/thành ngữ, Số từ, Thán từ","meaning":"nghĩa tiếng Việt ngắn gọn","meaning_en":"English meaning, concise","hsk":1 hoặc 2 hoặc 3,"chietu_vi":"GIẢI THÍCH CHIẾT TỰ/CÂU CHUYỆN VĂN HÓA bằng tiếng Việt — tách chữ Hán thành bộ thủ quen thuộc, gắn hình ảnh/câu chuyện dễ nhớ. Ngắn gọn 1-2 câu.","chietu_en":"Same breakdown in English, 1-2 sentences."}

Nếu chuỗi này không phải chữ Hán hợp lệ, trả về {"error":"invalid"}.`;

  try {
    const textReply = await callClaudeAI(prompt, 400);
    let clean = textReply.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
    const parsed = JSON.parse(clean);
    if (parsed.error) throw new Error("invalid word");
    renderAiWordCard(text, parsed);
  } catch (e) {
    card.innerHTML = `<div style="padding:20px;text-align:center;">
      <div style="font-size:22px;font-weight:800;">${esc(text)}</div>
      <p style="font-size:12.5px;color:var(--text-light);margin:10px 0;">${L("Không thể tạo giải thích cho từ này lúc này. Có thể đây không phải chữ Hán hợp lệ, hoặc thử lại sau.", "Couldn't generate an explanation for this right now. It may not be valid Chinese, or please try again.")}</p>
      <button id="dictLookupClose" class="btn btn-outline" style="font-size:12px;">${L("Đóng", "Close")}</button>
    </div>`;
    document.getElementById("dictLookupClose").addEventListener("click", closeDictLookup);
  }
}
async function fetchAiExample(text, parsed, char) {
  const btn = document.getElementById("aiExampleBtn");
  if (btn) { btn.disabled = true; btn.textContent = "⏳ " + L("Đang tạo...", "Generating..."); }
  const prompt = `Cho từ tiếng Trung "${char}" (nghĩa: ${parsed.meaning || parsed.meaning_en}), viết 1 câu ví dụ ngắn trình độ HSK1-3. Trả lời DUY NHẤT JSON minified: {"example_zh":"...","example_pinyin":"...","example_vi":"...","example_en":"..."}`;
  try {
    const textReply = await callClaudeAI(prompt, 250);
    const clean = textReply.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
    const ex = JSON.parse(clean);
    Object.assign(parsed, ex);
    renderAiWordCard(text, parsed);
  } catch (e) {
    if (btn) { btn.disabled = false; btn.textContent = "➕ " + L("Thêm câu ví dụ (thử lại)", "Add example (retry)"); }
  }
}
function renderAiWordCard(text, parsed) {
  const card = document.getElementById("dictLookupPopup");
  const char = parsed.char || text;
  const hsk = [1, 2, 3].includes(Number(parsed.hsk)) ? Number(parsed.hsk) : 3;
  const alreadyExists = !!VOCAB_BY_CHAR[char];
  const hskColor = { 1: "var(--hsk1)", 2: "var(--hsk2)", 3: "var(--hsk3)" }[hsk];
  card.innerHTML = `<div style="padding:18px;max-width:320px;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
      <div style="font-size:24px;font-weight:800;">${esc(char)}</div>
      <span class="hsk-tag" style="background:${hskColor};flex:none;">HSK${hsk}</span>
    </div>
    <div style="font-size:13px;color:var(--text-light);margin-top:2px;">${esc(parsed.pinyin || "")} · ${esc(parsed.hanviet || "")} · ${esc(parsed.pos || "")}</div>
    <div style="font-size:14px;font-weight:600;margin-top:6px;">${esc(L(parsed.meaning || "", parsed.meaning_en || ""))}</div>
    ${parsed.example_zh
      ? `<div style="font-size:12px;color:var(--text-light);margin-top:6px;">${esc(parsed.example_zh)}${parsed.example_pinyin ? `<br><span style="color:#a8a29e;">${esc(parsed.example_pinyin)}</span>` : ""}<br>${esc(L(parsed.example_vi || "", parsed.example_en || ""))}</div>`
      : `<button id="aiExampleBtn" class="btn btn-outline" style="font-size:10.5px;padding:4px 9px;margin-top:6px;">➕ ${L("Thêm câu ví dụ", "Add example sentence")}</button>`}
    ${parsed.chietu_vi ? `<div style="background:#fffbeb;border-radius:8px;padding:9px 11px;margin-top:9px;font-size:12.5px;line-height:1.6;">🎨 ${esc(L(parsed.chietu_vi, parsed.chietu_en))}</div>` : ""}
    <div style="font-size:10.5px;color:#b8a074;margin-top:6px;">🤖 ${L("Giải thích do AI biên soạn — nên xem lại trước khi tin tưởng hoàn toàn.", "AI-generated explanation — worth double-checking before fully relying on it.")}</div>
    <div style="display:flex;gap:8px;margin-top:12px;">
      <button id="aiWordSaveBtn" class="btn btn-hsk3" style="font-size:11.5px;padding:7px 12px;" ${alreadyExists ? "disabled" : ""}>${alreadyExists ? "✅ " + L("Đã có", "Already added") : "💾 " + L("Lưu vào Từ đã thêm", "Save to Words Added")}</button>
      <button id="dictLookupClose" class="btn btn-outline" style="font-size:11.5px;padding:7px 12px;">${L("Đóng", "Close")}</button>
    </div>
  </div>`;
  document.getElementById("dictLookupClose").addEventListener("click", closeDictLookup);
  const exampleBtn = document.getElementById("aiExampleBtn");
  if (exampleBtn) exampleBtn.addEventListener("click", () => fetchAiExample(text, parsed, char));
  const saveBtn = document.getElementById("aiWordSaveBtn");
  if (saveBtn && !alreadyExists) {
    saveBtn.addEventListener("click", () => {
      const raw = {
        char, pinyin: parsed.pinyin || "", hanviet: parsed.hanviet || "", pos: parsed.pos || "Danh từ",
        meaning: parsed.meaning || "", meaning_en: parsed.meaning_en || "", hsk,
        examples: parsed.example_zh ? [[parsed.example_zh, parsed.example_pinyin || "", parsed.example_vi || "", parsed.example_en || parsed.example_vi || ""]] : [],
        chietu_vi: parsed.chietu_vi || "", chietu_en: parsed.chietu_en || "", chietu_source: "AI (Claude) biên soạn", isCustom: true,
      };
      const custom = loadCustomWords();
      custom.push(raw);
      saveCustomWords(custom);
      const normalized = normalizeWordEntry(raw, VOCAB.length);
      VOCAB.push(normalized);
      VOCAB_BY_CHAR[char] = normalized;
      recordView(char); // counts under "Từ đã thêm" immediately
      updateHeaderStats();
      renderGrids();
      renderAiWordCard(text, parsed);
    });
  }
}

function daysSince(ts) {
  if (!ts) return null;
  return Math.floor((Date.now() - ts) / 86400000);
}

/* ---------- Text-to-Speech ---------- */
let zhVoice = null;
function pickVoice() {
  const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  zhVoice = voices.find(v => v.lang === "zh-CN") || voices.find(v => v.lang && v.lang.startsWith("zh")) || null;
}
if (window.speechSynthesis) { pickVoice(); window.speechSynthesis.onvoiceschanged = pickVoice; }
function speak(text) {
  if (!window.speechSynthesis) { alert("Trình duyệt không hỗ trợ phát âm / TTS not supported"); return; }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "zh-CN"; if (zhVoice) u.voice = zhVoice; u.rate = 0.72; u.pitch = 1.0;
  window.speechSynthesis.speak(u);
}

/* ---------- Split pre-baked bilingual exercise text by current language mode ---------- */
function splitBi(text) {
  if (!text) return { vi: "", en: "" };
  let m = text.match(/^(.*?)\s\/\s(.*)$/);
  if (m) return { vi: m[1].trim(), en: m[2].trim() };
  m = text.match(/^(.*)\s\(([^()]+)\)$/);
  if (m) return { vi: m[1].trim(), en: m[2].trim() };
  return { vi: text, en: text };
}
function biL(text) { const s = splitBi(text); return L(s.vi, s.en); }
function splitHintWord(text) {
  const m = text.match(/^(.+? \(.+?\)) - (.+?) \(([^()]+)\)$/);
  if (m) return { vi: `${m[1]} - ${m[2]}`, en: `${m[1]} - ${m[3]}` };
  return { vi: text, en: text };
}

/* ---------- Explain the WRONG option the learner picked (contrastive teaching) ---------- */
function explainWrongPick(q, pickedLetter) {
  if (q.explainWrong && q.explainWrong[pickedLetter]) return biL(q.explainWrong[pickedLetter]); // pre-authored per-option explanation
  const picked = q.options.find(o => o[0] === pickedLetter);
  if (!picked) return "";
  const pickedText = biL(picked[1]);
  // Try to find which vocab word this wrong option actually belongs to, for richer contrast
  let ownerWord = null;
  if (/^[\u4e00-\u9fff]+$/.test(picked[1])) ownerWord = VOCAB_BY_CHAR[picked[1]];
  else ownerWord = VOCAB.find(v => v.pinyin === picked[1] || v.meaning === picked[1] || v.meaning_en === picked[1]);

  if (ownerWord) {
    return L(
      `⚠️ Bạn đã chọn "<b>${pickedText}</b>" — đây thực ra là ${ownerWord.pos.toLowerCase()} <b>${ownerWord.char}</b> (${ownerWord.pinyin}), nghĩa là "${ownerWord.meaning}", <u>không phải</u> của từ đang hỏi. Hai từ này dễ nhầm vì cùng loại từ, nhưng nghĩa/cách dùng khác nhau — hãy phân biệt kỹ khi ôn tập.`,
      `⚠️ You picked "<b>${pickedText}</b>" — this actually belongs to the ${ownerWord.pos.toLowerCase()} <b>${ownerWord.char}</b> (${ownerWord.pinyin}), meaning "${ownerWord.meaning_en}", <u>not</u> the word being asked about. These two are easy to mix up since they share the same part of speech, but differ in meaning/usage — review them side by side.`
    );
  }
  const targetWord = VOCAB_BY_CHAR[q.char];
  if (targetWord) {
    return L(
      `⚠️ \"<b>${pickedText}</b>\" không phải nghĩa/đáp án đúng của <b>${targetWord.char}</b> (${targetWord.pinyin}) trong câu này — nghĩa đúng là \"${targetWord.meaning}\" (${targetWord.pos.toLowerCase()}).`,
      `⚠️ \"<b>${pickedText}</b>\" is not the correct meaning/answer for <b>${targetWord.char}</b> (${targetWord.pinyin}) here — the correct meaning is \"${targetWord.meaning_en}\" (${targetWord.pos.toLowerCase()}).`
    );
  }
  return L(
    `⚠️ "<b>${pickedText}</b>" không khớp với chữ đang được hỏi trong câu này — xem lại đáp án đúng bên dưới để phân biệt.`,
    `⚠️ "<b>${pickedText}</b>" does not match the character being asked about here — compare with the correct answer below.`
  );
}

/* ---------- Teacher-style explanations for quiz answers (HSK3-level clarity) ---------- */
function explainAnswer(q) {
  if (q.explain) return biL(q.explain); // pre-authored explanation (curated practice sets)
  const w = VOCAB_BY_CHAR[q.char];
  if (!w) return "";
  const qt = biL(q.question);
  const posLower = localizedPos(w.pos).toLowerCase();
  if (/có nghĩa là gì|mean\?/i.test(q.question)) {
    return L(
      `✅ <b>${w.char}</b> (${w.pinyin}) là <b>${localizedPos(w.pos)}</b>, nghĩa là "<b>${w.meaning}</b>". 释义: ${w.def_zh}. Ba lựa chọn còn lại là nghĩa của những từ ${posLower} <i>khác</i> trong bộ từ vựng — chúng bị đưa vào để gây nhiễu, không liên quan đến chữ ${w.char}.`,
      `✅ <b>${w.char}</b> (${w.pinyin}) is a <b>${localizedPos(w.pos)}</b> meaning "<b>${w.meaning_en}</b>". Chinese definition: ${w.def_zh}. The other three options are meanings belonging to <i>different</i> ${posLower}s in the vocabulary set — added as distractors, unrelated to ${w.char}.`
    );
  }
  if (/Chữ Hán nào|Which character/i.test(q.question)) {
    return L(
      `✅ <b>${w.char}</b> là chữ Hán duy nhất trong 4 lựa chọn mang nghĩa "${w.meaning}". Các chữ còn lại đều là ${posLower} khác, có nghĩa hoàn toàn khác — bị chọn làm nhiễu vì cùng loại từ với ${w.char}, dễ gây nhầm lẫn.`,
      `✅ <b>${w.char}</b> is the only character among the 4 choices meaning "${w.meaning_en}". The other characters are different ${posLower}s with unrelated meanings — chosen as distractors because they share the same part of speech, making them easy to confuse.`
    );
  }
  if (/Pinyin đúng|correct pinyin/i.test(q.question)) {
    return L(
      `✅ Pinyin chuẩn của <b>${w.char}</b> là "<b>${w.pinyin}</b>". Ba pinyin còn lại thuộc về những chữ Hán khác cùng loại từ — hãy chú ý thanh điệu (dấu) vì đây là điểm dễ nhầm nhất khi học pinyin.`,
      `✅ The correct pinyin for <b>${w.char}</b> is "<b>${w.pinyin}</b>". The other three belong to different characters of the same part of speech — pay attention to the tone marks, as tones are the most common source of confusion.`
    );
  }
  if (/điền vào chỗ trống|fill in the blank/i.test(q.question)) {
    const ex = w.examples[0];
    return L(
      `✅ <b>${w.char}</b> là lựa chọn đúng vì vừa hợp nghĩa "${w.meaning}" vừa đúng ngữ pháp (${localizedPos(w.pos)}) trong câu: <i>"${ex ? ex[0] : ''}"</i> (${ex ? ex[2] : ''}). Ba lựa chọn kia tuy cùng loại từ nhưng nghĩa không phù hợp với ngữ cảnh câu này — đây chính là điểm khác biệt giữa "biết nghĩa" và "biết dùng đúng chỗ".`,
      `✅ <b>${w.char}</b> is correct because it fits both the meaning "${w.meaning_en}" and the grammar (${localizedPos(w.pos)}) in the sentence: <i>"${ex ? ex[0] : ''}"</i> (${ex ? ex[3] : ''}). The other options share the part of speech but don't fit this context — this is exactly the difference between "knowing a meaning" and "knowing how to use it correctly".`
    );
  }
  return L(`✅ Đáp án đúng là "${q.answer_text}".`, `✅ The correct answer is "${q.answer_text}".`);
}

/* ---------- Light/Dark theme ---------- */
function initCherryBlossoms() {
  const layer = document.getElementById("petalLayer");
  if (!layer) return;
  let html = "";
  for (let i = 0; i < 18; i++) {
    const x = (i / 18) * 100 + Math.random() * 5;
    const size = 18 + Math.random() * 18;
    const dur = 7 + Math.random() * 9;
    const delay = Math.random() * 14;
    const drift = Math.round((Math.random() - 0.5) * 180);
    const sway = Math.round((Math.random() - 0.5) * 60);
    const spin = Math.round(200 + Math.random() * 360);
    html += `<div class="petal" style="left:${x}%;width:${size}px;height:${size}px;--drift:${drift}px;--sway:${sway}px;--spin:${spin}deg;animation:petal-fall ${dur}s ${delay}s linear infinite;">
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
        <g opacity="0.88">
          <ellipse cx="20" cy="11" rx="6" ry="10" fill="#fda4af" transform="rotate(0 20 20)"/>
          <ellipse cx="20" cy="11" rx="6" ry="10" fill="#fb7185" transform="rotate(72 20 20)"/>
          <ellipse cx="20" cy="11" rx="6" ry="10" fill="#fda4af" transform="rotate(144 20 20)"/>
          <ellipse cx="20" cy="11" rx="6" ry="10" fill="#fb7185" transform="rotate(216 20 20)"/>
          <ellipse cx="20" cy="11" rx="6" ry="10" fill="#fda4af" transform="rotate(288 20 20)"/>
          <circle cx="20" cy="20" r="4.5" fill="#fef3f2"/>
          <circle cx="20" cy="20" r="2" fill="#fbbf24"/>
        </g>
      </svg>
    </div>`;
  }
  layer.innerHTML = html;
}
/* ---------- Utility ---------- */
function esc(s) { return (s == null ? "" : String(s)).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }
function fmtDate(t) { const d = new Date(t); return d.toLocaleDateString(LANG_MODE === "en" ? "en-GB" : "vi-VN"); }

/* ===================== RENDER: Dictionary grid ===================== */
function tierDotHtml(char) {
  const tier = getTier(char);
  return `<span class="tier-badge tier-${tier}" title="Tier ${tier}">${tier > 0 ? "✓" : ""}</span>`;
}
function cardHtml(w) {
  const due = isDue(w.char) ? '<span class="due-flag" title="Cần ôn / Due">⏰</span>' : "";
  const meaning = L(w.meaning, w.meaning_en);
  return `<div class="card" data-char="${esc(w.char)}">
    ${tierDotHtml(w.char)}
    <div class="char-row"><span class="char">${esc(w.char)}</span>
      <button class="audio-mini" data-speak="${esc(w.char)}" title="🔊">🔊</button></div>
    <div class="pinyin">${esc(w.pinyin)}</div>
    <div class="pos-tag">${esc(localizedPos(w.pos))}</div>
    <div class="meaning">${esc(meaning)}</div>
    ${due}
  </div>`;
}

function stripDiacritics(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");
}
function getFilteredVocab() {
  const qRaw = document.getElementById("searchInput").value.trim().toLowerCase();
  const q = stripDiacritics(qRaw);
  const pos = document.getElementById("posFilter").value;
  const tier = document.getElementById("tierFilter").value;
  return VOCAB.filter(w => {
    if (pos !== "all" && w.pos !== pos) return false;
    if (tier === "due" && !isDue(w.char)) return false;
    else if (tier !== "all" && tier !== "due" && String(getTier(w.char)) !== tier) return false;
    if (q) {
      const hay = stripDiacritics((w.char + w.pinyin + w.hanviet + w.meaning + w.meaning_en).toLowerCase());
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function renderGrids() {
  const filtered = getFilteredVocab();
  
  // Async rendering to prevent UI freeze
  const renderLevel = (level) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const list = filtered.filter(w => w.hsk === level);
        const grid = document.getElementById("hsk" + level + "Grid");
        if (grid) {
          grid.innerHTML = list.map(cardHtml).join("") || '<p style="color:var(--text-light);padding:10px;">Không tìm thấy / No results</p>';
        }
        const allLevel = VOCAB.filter(w => w.hsk === level);
        const learnedLevel = allLevel.filter(w => getTier(w.char) > 0).length;
        const countEl = document.getElementById("hsk" + level + "Count");
        if (countEl) countEl.textContent = L(`${learnedLevel}/${allLevel.length} đã học`, `${learnedLevel}/${allLevel.length} studied`);
        resolve();
      }, 0);
    });
  };

  // Run updates sequentially in small batches
  (async () => {
    await renderLevel(1);
    await renderLevel(2);
    await renderLevel(3);
    updateHeaderStats();
  })();
  
  // Only attach handlers once using delegation
  grid_attachHandlers();
}

let isGridHandlerAttached = false;
function grid_attachHandlers() {
  if (isGridHandlerAttached) return;
  
  // Use Event Delegation on the main app or specific grids
  [1, 2, 3].forEach(level => {
    const grid = document.getElementById("hsk" + level + "Grid");
    if (!grid) return;
    
    grid.addEventListener("click", (e) => {
      const audioBtn = e.target.closest(".audio-mini");
      if (audioBtn) {
        e.stopPropagation();
        speak(audioBtn.dataset.speak);
        return;
      }
      
      const card = e.target.closest(".card");
      if (card) {
        playTing("open");
        openDetail(card.dataset.char);
      }
    });
  });
  
  isGridHandlerAttached = true;
}

function populatePosFilter() {
  const sel = document.getElementById("posFilter");
  if (!sel) return;
  const posSet = [...new Set(VOCAB.map(w => w.pos))].sort();
  const posEn = { "Danh từ": "Noun", "Động từ": "Verb", "Tính từ": "Adjective", "Phó từ": "Adverb", "Liên từ": "Conjunction", "Giới từ": "Preposition", "Lượng từ": "Measure word", "Trợ từ": "Particle", "Trợ động từ": "Auxiliary verb", "Đại từ nhân xưng": "Personal pronoun", "Đại từ nghi vấn": "Interrogative pronoun", "Đại từ chỉ định": "Demonstrative pronoun", "Cụm từ/thành ngữ": "Phrase / idiom", "Số từ": "Numeral", "Thán từ": "Interjection", "Danh từ / Tính từ": "Noun / Adjective", "Tính từ / Động từ": "Adjective / Verb", "Động từ / Liên từ": "Verb / Conjunction", "Danh từ / Động từ": "Noun / Verb", "Tính từ / Phó từ": "Adjective / Adverb", "Động từ / Tính từ": "Verb / Adjective" };
  posSet.forEach(p => { const o = document.createElement("option"); o.value = p; o.dataset.langVi = p; o.dataset.langEn = posEn[p] || p; o.textContent = LANG_MODE === "vi" ? p : o.dataset.langEn; sel.appendChild(o); });
}

function updateHeaderStats() {
  const el1 = document.getElementById("hdrHsk1");
  const el2 = document.getElementById("hdrHsk2");
  const el3 = document.getElementById("hdrHsk3");
  const elL = document.getElementById("hdrLearned");
  const elD = document.getElementById("hdrDue");
  
  if (el1) el1.textContent = VOCAB.filter(w => w.hsk === 1 && getTier(w.char) > 0).length + "/" + VOCAB.filter(w => w.hsk === 1).length;
  if (el2) el2.textContent = VOCAB.filter(w => w.hsk === 2 && getTier(w.char) > 0).length + "/" + VOCAB.filter(w => w.hsk === 2).length;
  if (el3) el3.textContent = VOCAB.filter(w => w.hsk === 3 && getTier(w.char) > 0).length + "/" + VOCAB.filter(w => w.hsk === 3).length;
  if (elL) elL.textContent = VOCAB.filter(w => getTier(w.char) > 0).length;
  if (elD) elD.textContent = VOCAB.filter(w => isDue(w.char)).length;
}

/* ---------- Study reminder (voice notification when vocab review is due) ---------- */
function getDueMistakeCount() {
  try { return Number(window.PandaHanMistakes?.getQueue?.().length || 0); } catch (_) { return 0; }
}
function getDueCount() {
  return VOCAB.filter(w => isDue(w.char)).length;
}
function reminderAudioEl() {
  return document.getElementById(LANG_MODE === "vi" ? "reminderAudioVi" : "reminderAudioEn");
}
function playReminderAudio() {
  const el = reminderAudioEl();
  if (!el) return Promise.reject(new Error("no audio element"));
  el.currentTime = 0;
  return el.play();
}
function showStudyReminder() {
  const due = getDueCount();
  const mistakeDue = getDueMistakeCount();
  if (due <= 0 && mistakeDue <= 0) { hideStudyReminder(); return; }
  const banner = document.getElementById("studyReminderBanner");
  const text = document.getElementById("studyReminderText");
  if (!banner || !text) return;
  text.textContent = LANG_MODE === "vi"
    ? `Đến giờ ôn tập! ${due ? `${due} từ SRS` : ""}${due && mistakeDue ? " và " : ""}${mistakeDue ? `${mistakeDue} lỗi cần làm lại` : ""}.`
    : `Review time! ${due ? `${due} SRS word${due === 1 ? "" : "s"}` : ""}${due && mistakeDue ? " and " : ""}${mistakeDue ? `${mistakeDue} wrong item${mistakeDue === 1 ? "" : "s"} to redo` : ""}.`;
  banner.style.display = "flex";
  const playBtn = document.getElementById("studyReminderPlayBtn");
  playBtn.style.display = "inline-block";
  playReminderAudio().catch(() => { /* autoplay blocked; user can tap the play button */ });
}
function hideStudyReminder() {
  const banner = document.getElementById("studyReminderBanner");
  if (banner) banner.style.display = "none";
}

/* ---------- PWA: install SW, ask permission, fire real OS notifications ---------- */
let swRegistration = null;
function initServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("service-worker.js").then((reg) => {
    swRegistration = reg;
    // Best-effort periodic background check (Chromium-only, requires the PWA
    // to be installed with enough site engagement; silently no-ops otherwise).
    if ("periodicSync" in reg) {
      navigator.permissions
        .query({ name: "periodic-background-sync" })
        .then((status) => {
          if (status.state === "granted") {
            reg.periodicSync.register("pandahan-due-check", { minInterval: 60 * 60 * 1000 }).catch(() => {});
          }
        })
        .catch(() => {});
    }
  }).catch(() => {});

  // Answer the service worker when it asks (from a periodicsync event) how many
  // words are currently due, so it can show a real notification.
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data && event.data.type === "REQUEST_DUE_CHECK") {
      sendDueNotificationIfAny();
    }
  });
}

function notificationsEnabled() {
  return "Notification" in window && Notification.permission === "granted";
}

function sendDueNotificationIfAny() {
  const due = getDueCount();
  const mistakeDue = getDueMistakeCount();
  if (due <= 0 && mistakeDue <= 0) return;
  if (!notificationsEnabled() || !navigator.serviceWorker || !navigator.serviceWorker.controller) return;
  navigator.serviceWorker.controller.postMessage({ type: "SHOW_DUE_NOTIFICATION", due, mistakeDue, lang: LANG_MODE });
}

function updateEnableNotifBtn() {
  const btn = document.getElementById("enableNotifBtn");
  if (!btn) return;
  if (!("Notification" in window)) { btn.style.display = "none"; return; }
  if (Notification.permission === "granted") {
    btn.style.display = "none";
  } else if (Notification.permission === "denied") {
    btn.style.display = "none"; // browser will block re-prompting; nothing useful to click
  } else {
    btn.style.display = "inline-block";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const safeAdd = (id, evt, fn) => { const el = document.getElementById(id); if (el) el.addEventListener(evt, fn); };
  applyStaticLanguageUi();
  document.querySelectorAll("[data-language-select]").forEach((button) => {
    button.addEventListener("click", () => setLangMode(button.dataset.languageSelect || "vi"));
  });
  const playBtn = document.getElementById("studyReminderPlayBtn");
  const startBtn = document.getElementById("studyReminderStartBtn");
  const closeBtn = document.getElementById("studyReminderCloseBtn");
  const notifBtn = document.getElementById("enableNotifBtn");
  if (playBtn) playBtn.addEventListener("click", () => { playReminderAudio().catch(() => {}); });
  const testBtn = document.getElementById("testReminderBtn");
  if (testBtn) testBtn.addEventListener("click", () => {
    playReminderAudio().catch(err => alert(L("Không phát được âm thanh: " + err.message, "Could not play audio: " + err.message)));
  });
  if (startBtn) startBtn.addEventListener("click", () => { hideStudyReminder(); startReviewSession({ practiceMode: window.PandaHanPracticeMode === "scheduled" ? "scheduled" : "free" }); });
  if (closeBtn) closeBtn.addEventListener("click", hideStudyReminder);
  const streakStudyBtn = document.getElementById("streakWarningStudyBtn");
  const streakCloseBtn = document.getElementById("streakWarningCloseBtn");
  if (streakStudyBtn) streakStudyBtn.addEventListener("click", () => {
    document.getElementById("streakWarningBanner").style.display = "none";
    switchTab("review");
  });
  if (streakCloseBtn) streakCloseBtn.addEventListener("click", () => {
    document.getElementById("streakWarningBanner").style.display = "none";
  });
  setInterval(checkStreakWarning, 5 * 60 * 1000);
  const treasureBtn = document.getElementById("treasureReviewBtn");
  if (treasureBtn) treasureBtn.addEventListener("click", startTreasureReview);
  safeAdd("certBackBtn", "click", () => switchTab("dashboard"));
  safeAdd("calPrevBtn", "click", () => navigateCalMonth(-1));
  safeAdd("calNextBtn", "click", () => navigateCalMonth(1));
  safeAdd("chatFab", "click", toggleChatPanel);
  safeAdd("chatCloseBtn", "click", toggleChatPanel);
  const aiToolbar = document.getElementById("aiToolbar");
  const aiToolbarToggle = document.getElementById("aiToolbarToggle");
  if (aiToolbar && aiToolbarToggle) {
    aiToolbarToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = aiToolbar.classList.toggle("open");
      aiToolbarToggle.setAttribute("aria-expanded", String(isOpen));
    });
    document.addEventListener("click", (e) => {
      if (!aiToolbar.contains(e.target)) {
        aiToolbar.classList.remove("open");
        aiToolbarToggle.setAttribute("aria-expanded", "false");
      }
    });
  }
  safeAdd("chatSendBtn", "click", () => { sendChatMessage().catch((error) => console.error("AI chat send:", error)); });
  safeAdd("chatInput", "keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); sendChatMessage().catch((error) => console.error("AI chat send:", error)); } });
  document.addEventListener("click", (e) => {
    const button = e.target && e.target.closest ? e.target.closest("#chatSendBtn") : null;
    if (button && !button.dataset.pandaDelegated) {
      button.dataset.pandaDelegated = "true";
      if (!button.disabled) sendChatMessage().catch((error) => console.error("AI chat delegated send:", error));
    }
  });
  safeAdd("chatTopicSelect", "change", onChatTopicChange);
  safeAdd("openAddWordBtn", "click", () => {
    renderAddWordForm();
    renderCustomWordsList();
    showScreen("addWord");
  });
  safeAdd("addWordBack", "click", () => switchTab("teacher"));
  wireFlagBtn("qFlagBtn");
  wireFlagBtn("uFlagBtn");
  wireFlagBtn("fcFlagBtn");
  wireFlagBtn("dFlagBtn");
  document.querySelectorAll(".stat-quad-card[data-cat]").forEach(card => {
    card.addEventListener("click", () => {
      renderWordListView(card.dataset.cat);
      showScreen("wordList");
    });
  });
  safeAdd("wordListBack", "click", () => switchTab("dashboard"));
  initTextLookup();
  if (notifBtn) {
    notifBtn.addEventListener("click", () => {
      if (!("Notification" in window)) { alert(L("Trình duyệt không hỗ trợ thông báo.", "This browser doesn't support notifications.")); return; }
      Notification.requestPermission().then((perm) => {
        updateEnableNotifBtn();
        if (perm === "granted") sendDueNotificationIfAny();
      });
    });
  }
  initServiceWorker();
  updateEnableNotifBtn();
  setTimeout(() => { showStudyReminder(); sendDueNotificationIfAny(); }, 400);
  // Re-check periodically while this tab/app stays open (does not cover a fully closed app).
  setInterval(() => { showStudyReminder(); sendDueNotificationIfAny(); }, 15 * 60 * 1000);
});

/* ===================== DETAIL VIEW ===================== */
let currentDetailChar = null;
function openDetail(char) {
  const w = VOCAB_BY_CHAR[char];
  if (!w) return;
  currentDetailChar = char;
  recordView(char);
  updateFlagBtn("dFlagBtn", char);

  showScreen("detail");

  document.getElementById("dChar").textContent = w.char;
  document.getElementById("dAudioBtn").dataset.speak = w.char;
  document.getElementById("dPinyin").textContent = w.pinyin;
  document.getElementById("dMeaning").textContent = L(w.meaning, w.meaning_en);
  const chietuRaw = L(w.chietu_vi, w.chietu_en) || w.chietu_vi || w.chietu_en || "";
  renderChietu(chietuRaw, w.chietu_source);
  document.getElementById("dDefZh").textContent = w.def_zh;
  document.getElementById("dExLabel").textContent = LANG_MODE === "vi" ? "例句 · CÂU VÍ DỤ" : "例句 · EXAMPLE SENTENCES";
  document.getElementById("dSrsLabel").textContent = LANG_MODE === "vi" ? "📈 MỨC ĐỘ GHI NHỚ (thuật toán SM-2)" : "📈 RETENTION LEVEL (SM-2 algorithm)";

  document.getElementById("dMeta").innerHTML =
    `<span class="tag tag-hsk${w.hsk}">HSK ${w.hsk}</span>` +
    `<span class="tag tag-pos">${esc(localizedPos(w.pos))}</span>` +
    (w.hanviet ? `<span class="tag tag-hanviet">${esc(sinoVietnameseLabel())}: ${esc(w.hanviet)}</span>` : "");

  const cumtuBox = document.getElementById("dCumtuBox");
  if (w.cumtu.length) {
    cumtuBox.style.display = "block";
    document.getElementById("dCumtuList").innerHTML = w.cumtu.map(c =>
      `<div class="cumtu-item lookup-text"><button class="audio-mini" data-speak="${esc(c[0])}">🔊</button><b>${esc(c[0])}</b> <span style="color:var(--pink);">(${esc(c[1])})</span> — ${esc(L(c[2], c[3]))}</div>`
    ).join("");
  } else { cumtuBox.style.display = "none"; }

  document.getElementById("dExamplesList").innerHTML = w.examples.map(ex =>
    `<div class="example-item">
      <div class="ex-zh lookup-text"><button class="audio-mini" data-speak="${esc(ex[0])}">🔊</button>${esc(ex[0])}</div>
      <div class="ex-py">${esc(ex[1])}</div>
      <div class="ex-vi lookup-text">${LANG_MODE === "vi" ? "🇻🇳" : "🇬🇧"} ${esc(L(ex[2], ex[3]))}</div>
    </div>`).join("");

  renderSrsPanel(char);
  applyPersistedHighlights(char);

  document.querySelectorAll("#dAudioBtn,#dCumtuList .audio-mini,#dExamplesList .audio-mini").forEach(b => {
    b.addEventListener("click", () => speak(b.dataset.speak));
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderChietu(raw, source) {
  const box = document.getElementById("dChietuBox");
  const icon = document.getElementById("dChietuIcon");
  const label = document.getElementById("dChietuLabel");
  const sub = document.getElementById("dChietuSub");
  const body = document.getElementById("dChietu");
  const srcEl = document.getElementById("dChietuSource");
  srcEl.innerHTML = source === "verified"
    ? `<span style="color:#1a7d4a;">✅ ${L("Nguồn: tài liệu nghiên cứu gốc (đã xác minh)", "Source: original research document (verified)")}</span>`
    : `<span style="color:#a5824a;">🤖 ${L("Nguồn: hệ thống tự phân tích bộ thủ", "Source: auto radical analysis")}</span>`;

  if (!raw) {
    box.className = "chietu-box type-radical";
    icon.textContent = "🧩";
    label.textContent = LANG_MODE === "vi" ? "Chiết tự / Văn hóa" : "Character breakdown / Culture";
    sub.textContent = "";
    body.innerHTML = `<span class="no-data">${L("Đang cập nhật nội dung cho từ này...", "Content coming soon for this word...")}</span>`;
    return;
  }

  const isCulture = /^(Văn hóa|Cultural story)\s*:/i.test(raw.trim());
  let text = raw.replace(/^(Văn hóa|Chiết tự \(bộ thủ\)|Chiết tự|Cultural story|Character breakdown)\s*:\s*/i, "");

  box.className = "chietu-box " + (isCulture ? "type-culture" : "type-radical");
  icon.textContent = isCulture ? "📜" : "🧩";
  label.textContent = isCulture
    ? (LANG_MODE === "vi" ? "CÂU CHUYỆN VĂN HÓA" : "CULTURAL STORY")
    : (LANG_MODE === "vi" ? "CHIẾT TỰ · BỘ THỦ" : "CHARACTER BREAKDOWN");
  sub.textContent = isCulture ? (LANG_MODE === "vi" ? "nguồn gốc & ý nghĩa" : "origin & meaning") : (LANG_MODE === "vi" ? "phân tích cấu tạo chữ" : "component analysis");

  const highlighted = esc(text).replace(/([\u4e00-\u9fff]+)/g, '<span class="chietu-char">$1</span>');
  body.innerHTML = highlighted;

  const moreBtn = document.getElementById("dChietuMoreBtn");
  const moreTxt = document.getElementById("dChietuMoreTxt");
  const isLong = text.length > 220;
  if (isLong) {
    body.classList.add("clamped");
    moreBtn.style.display = "inline-flex";
    moreTxt.textContent = L("Xem thêm", "Read more");
    moreBtn.onclick = () => {
      const collapsed = body.classList.toggle("clamped");
      moreTxt.textContent = collapsed ? L("Xem thêm", "Read more") : L("Thu gọn", "Show less");
      moreBtn.querySelector ? null : null;
      moreBtn.firstChild.textContent = collapsed ? "▾ " : "▴ ";
    };
  } else {
    body.classList.remove("clamped");
    moreBtn.style.display = "none";
  }
}

/* ---------- Confetti burst for mascot level-ups ---------- */
function burstConfetti(container) {
  const pieces = ["🎉","✨","⭐","🎊","💫"];
  for (let i = 0; i < 8; i++) {
    const el = document.createElement("span");
    el.className = "mascot-confetti";
    el.textContent = pieces[Math.floor(Math.random() * pieces.length)];
    el.style.left = (10 + Math.random() * 80) + "%";
    el.style.animationDelay = (Math.random() * 0.2) + "s";
    container.appendChild(el);
    setTimeout(() => el.remove(), 1300);
  }
  playTing("levelup");
}

function renderSrsPanel(char) {
  const s = getStat(char);
  const tier = getTier(char);
  const r = RUBRIC[tier];
  document.getElementById("dTierBadge").innerHTML =
    `<span class="tier-badge" style="background:${r.light};color:${r.color};">
      <span class="tier-dot tier-${tier}" style="position:static;"></span> ${L(r.name, r.en)}
    </span>
    <p style="font-size:12px;color:var(--text-light);margin-top:6px;">${L(r.desc, r.descEn)}</p>` +
    (isDue(char) ? `<p style="color:#e74c3c;font-weight:700;font-size:12.5px;margin-top:6px;">⏰ ${L('Đến hạn ôn tập!','Review is due!')}</p>` : "");

  const icons = ["🥚", "🐣", "🐥", "🐤", "🐼"];
  document.getElementById("dPowerIcon").textContent = icons[tier];
  document.querySelectorAll("#dPowerBar .power-seg").forEach(seg => {
    const t = Number(seg.dataset.t);
    const wasOn = seg.classList.contains(`on${t}`);
    const nowOn = tier >= t;
    seg.className = "power-seg" + (nowOn ? ` on${t}` : "");
    if (nowOn && !wasOn) { seg.classList.add("filling"); setTimeout(() => seg.classList.remove("filling"), 500); }
  });

  /* ---------- Playful mascot rider: sleepy → stretching → walking → dancing → celebrating ---------- */
  const mascotIcons = ["😴", "🙆", "🚶", "💃", "🐼"];
  const rider = document.getElementById("mascotRider");
  const track = document.getElementById("mascotTrack");
  const pct = Math.round((tier / 4) * 100);
  rider.textContent = mascotIcons[tier];
  rider.className = "mascot-rider tier" + tier;
  rider.style.left = `calc(${2 + tier * 22}% )`;
  document.getElementById("mascotLabel").textContent = pct + "%";
  if (tier === 0) {
    if (!track.querySelector(".mascot-zzz")) {
      const z = document.createElement("span");
      z.className = "mascot-zzz"; z.textContent = "z z z";
      z.style.left = "12%"; z.style.top = "2px";
      track.appendChild(z);
    }
  } else {
    const z = track.querySelector(".mascot-zzz"); if (z) z.remove();
  }
  if (rider.dataset.tier !== undefined && tier > Number(rider.dataset.tier)) {
    burstConfetti(track);
  }
  rider.dataset.tier = tier;


  if (s.repetitions > 0) {
    const eff = Math.round(spacingEfficiency(char) * 100);
    const optimal = Math.round(optimalISI(RI_TARGET_DAYS) * 10) / 10;
    document.getElementById("dSpacingInfo").style.display = "block";
    document.getElementById("dSpacingInfo").innerHTML =
      `🧮 <b>${L("Hiệu suất giãn cách (Cepeda et al. 2006)", "Spacing efficiency (Cepeda et al. 2006)")}: ${eff}%</b><br>
       <span style="font-size:11px;color:var(--text-light);">${L(
         `Khoảng ôn thực tế: ${s.interval} ngày · ISI tối ưu (RI=30 ngày): ${optimal} ngày · Hệ số dễ nhớ EF: ${s.ef.toFixed(2)} · Số lần ôn đúng liên tiếp: ${s.repetitions}`,
         `Actual interval: ${s.interval} days · Optimal ISI (RI=30 days): ${optimal} days · Ease Factor: ${s.ef.toFixed(2)} · Consecutive correct reps: ${s.repetitions}`
       )}</span>`;
  } else {
    document.getElementById("dSpacingInfo").style.display = "none";
  }

  const dFirst = daysSince(s.firstSeen);
  const dLast = daysSince(s.lastSeen);
  document.getElementById("dDaysFirst").textContent = dFirst === null ? "–" : dFirst;
  document.getElementById("dDaysLast").textContent = dLast === null ? "–" : dLast;

  const tbody = document.getElementById("timeBody");
  document.getElementById("dTotalAttempts").textContent = s.studyLog.length;
  if (s.studyLog.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:10px 0;color:var(--text-light);">🐼 Chưa có dữ liệu ôn tập / No graded review yet — hãy vào "Ôn ngay" hoặc "Trắc nghiệm"!</td></tr>`;
  } else {
    // Group by calendar day: several quiz answers/flashcard grades on the
    // same day become ONE summary row (day, avg grade, attempt count)
    // instead of one row per attempt — easier to read than a long list.
    const dayKey = (t) => { const d = new Date(t); return d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate(); };
    const days = [];
    const byKey = {};
    s.studyLog.forEach(log => {
      const k = dayKey(log.t);
      if (!byKey[k]) { byKey[k] = { key: k, t: log.t, grades: [] }; days.push(byKey[k]); }
      byKey[k].grades.push(log.grade);
      byKey[k].t = log.t; // keep the latest timestamp of that day
    });
    let rows = "";
    days.forEach((day, i) => {
      const prev = i > 0 ? days[i - 1].t : s.firstSeen;
      const gap = Math.round((day.t - prev) / 86400000);
      const isLast = i === days.length - 1;
      const avg = day.grades.reduce((a, b) => a + b, 0) / day.grades.length;
      const gradeLabel = day.grades.length > 1
        ? `${avg.toFixed(1)}/5 <span style="color:var(--text-light);font-size:11px;">(${day.grades.length} ${L("lần", "attempts")})</span>`
        : `${day.grades[0]}/5`;
      rows += `<tr class="${isLast ? 'highlight' : ''}"><td>${i + 1}</td><td>${fmtDate(day.t)}</td><td>${i === 0 ? '—' : gap + ' ngày'}</td><td>${gradeLabel}</td></tr>`;
    });
    tbody.innerHTML = rows;
  }
}

/* ===================== QUIZ (multiple choice) — HSK3 阅读理解 (reading comprehension) format ===================== */
let quizQueue = [], quizIdx = 0, quizScore = 0;
let pendingDialogueQueue = null;
let currentAdvancedSetId = null, advancedMcTotal = 0, advancedDlgScore = 0, advancedDlgTotal = 0;
let inAdvancedSetMode = false, advancedSetTimerInterval = null, advancedSetSecondsLeft = 3600;
function updateAdvancedSetTimerDisplay() {
  const m = Math.floor(advancedSetSecondsLeft / 60), s = advancedSetSecondsLeft % 60;
  const txt = `⏱️ ${m}:${String(s).padStart(2, "0")}`;
  document.querySelectorAll(".adv-set-timer").forEach(el => { el.textContent = txt; el.style.background = advancedSetSecondsLeft <= 300 ? "#fecaca" : "#fde68a"; el.style.color = advancedSetSecondsLeft <= 300 ? "#991b1b" : "#92400e"; });
}
function startAdvancedSetTimer() {
  clearInterval(advancedSetTimerInterval);
  advancedSetSecondsLeft = 3600;
  updateAdvancedSetTimerDisplay();
  document.querySelectorAll(".adv-set-timer").forEach(el => el.style.display = "inline-block");
  advancedSetTimerInterval = setInterval(() => {
    advancedSetSecondsLeft--;
    updateAdvancedSetTimerDisplay();
    if (advancedSetSecondsLeft <= 0) {
      stopAdvancedSetTimer();
      alert(L("⏰ Hết 60 phút! Bài làm sẽ được chấm với những câu đã hoàn thành.", "⏰ 60 minutes are up! The set will be graded with whatever you've completed so far."));
      showAdvancedSetCertificate();
    }
  }, 1000);
}
function stopAdvancedSetTimer() {
  clearInterval(advancedSetTimerInterval);
  advancedSetTimerInterval = null;
  document.querySelectorAll(".adv-set-timer").forEach(el => el.style.display = "none");
}

function pickN(arr, n) { return shuffle(arr).slice(0, n); }
function makeMcOptions(correct, distractorTexts) {
  const uniqueDistractors = [...new Set(distractorTexts)].filter(d => d && d !== correct).slice(0, 3);
  if (uniqueDistractors.length < 3) return null;
  const all = shuffle([correct, ...uniqueDistractors]);
  const letters = ["A", "B", "C", "D"];
  const options = all.map((t, i) => [letters[i], t]);
  return { options, answer: letters[all.indexOf(correct)], answer_text: correct };
}

/* Every generated question now carries a short Chinese "reading passage" (a real sentence,
   phrase, or definition) shown above the question — matching HSK3 阅读 exam structure:
   read a short text first, then answer a comprehension question about it. */
function genReadingQuestions(w) {
  const levelPool = VOCAB.filter(v => v.hsk === w.hsk && v.char !== w.char);
  const qs = [];

  // 1) 阅读理解 — read the full example sentence, infer the target word's meaning in context (easy)
  if (w.examples && w.examples.length) {
    const ex = w.examples[0];
    const distractors = pickN(levelPool, 8).map(v => L(v.meaning, v.meaning_en));
    const built = makeMcOptions(L(w.meaning, w.meaning_en), distractors);
    if (built) qs.push({ difficulty: "easy", genre: "comprehension", passage: ex[0], ...built,
      question: L(`Trong câu trên, "${w.char}" (${w.pinyin}) có nghĩa là gì?`, `In the passage above, what does "${w.char}" (${w.pinyin}) mean?`) });
  }

  // 2) 选词填空 — fill in the blank within a real sentence (medium)
  if (w.examples && w.examples.length > 1 ? true : (w.examples && w.examples.length)) {
    const ex = shuffle(w.examples || [])[0];
    if (ex && ex[0].includes(w.char)) {
      const blanked = ex[0].split(w.char).join("____");
      let distractPool = pickN(levelPool.filter(v => v.pos === w.pos), 8);
      if (distractPool.length < 3) distractPool = pickN(levelPool, 8);
      const distractors = distractPool.map(v => v.char);
      const built = makeMcOptions(w.char, distractors);
      if (built) qs.push({ difficulty: "medium", genre: "comprehension", passage: blanked, ...built,
        question: L(`选词填空 — Từ nào điền vào chỗ trống đúng nhất?`, `Fill in the blank — which word best completes the passage?`) });
    }
  }

  // 3) 阅读推断 — read the sentence, infer the correct translation/paraphrase (medium-hard, genuine comprehension)
  if (w.examples && w.examples.length) {
    const ex = shuffle(w.examples)[0];
    const correctPara = L(ex[2], ex[3]);
    const distractPool = pickN(levelPool.filter(v => v.examples && v.examples.length), 8);
    const distractors = distractPool.map(v => { const dex = shuffle(v.examples)[0]; return L(dex[2], dex[3]); });
    const built = makeMcOptions(correctPara, distractors);
    if (built) qs.push({ difficulty: "medium", genre: "comprehension", passage: ex[0], ...built,
      question: L(`根据这句话，下面哪个说法是对的？`, `Based on the passage, which statement is correct?`) });
  }

  // 4) 短语理解 — read a real collocation phrase, choose its meaning (medium-hard)
  if (w.cumtu && w.cumtu.length) {
    const c = shuffle(w.cumtu)[0];
    const correctMeaning = L(c[2], c[3]);
    const distractPool = pickN(levelPool.filter(v => v.cumtu && v.cumtu.length), 8);
    const distractors = distractPool.map(v => { const dc = shuffle(v.cumtu)[0]; return L(dc[2], dc[3]); });
    const built = makeMcOptions(correctMeaning, distractors);
    if (built) qs.push({ difficulty: "medium", genre: "vocab", passage: `${c[0]} (${c[1]})`, ...built,
      question: L(`Cụm từ trên có nghĩa là gì?`, `What does the phrase above mean?`) });
  }

  // 5) 释义匹配 — read a Chinese-only definition, identify which character it describes (hard, no translation crutch)
  if (w.def_zh) {
    const distractors = pickN(levelPool, 8).map(v => v.char);
    const built = makeMcOptions(w.char, distractors);
    if (built) qs.push({ difficulty: "hard", genre: "vocab", passage: w.def_zh, ...built,
      question: L(`释义如上 — Đoạn giải thích trên mô tả chữ Hán nào?`, `The definition above describes which character?`) });
  }

  // 6) 语境词性 — in the context sentence, identify the word class (harder — needs grammatical reading, not just vocab)
  if (w.examples && w.examples.length && w.pos) {
    const ex = w.examples[0];
    const otherPosPool = levelPool.filter(v => v.pos !== w.pos);
    if (otherPosPool.length >= 3) {
      const distractors = pickN(otherPosPool, 8).map(v => v.pos);
      const built = makeMcOptions(w.pos, distractors);
      if (built) qs.push({ difficulty: "hard", genre: "vocab", passage: ex[0], ...built,
        question: L(`Trong câu trên, "${w.char}" thuộc loại từ nào?`, `In the passage above, what part of speech is "${w.char}"?`) });
    }
  }

  // 7) 汉越对照 — Sino-Vietnamese reading recognition (medium, kept as a lighter change-of-pace question)
  if (w.hanviet) {
    const distractors = pickN(levelPool, 8).map(v => v.char);
    const built = makeMcOptions(w.char, distractors);
    if (built) qs.push({ difficulty: "medium", genre: "vocab", passage: L(`Âm Hán Việt: "${w.hanviet}"`, `Sino-Vietnamese reading: "${w.hanviet}"`), ...built,
      question: L(`Chữ Hán nào tương ứng với âm Hán Việt trên?`, `Which character matches the Sino-Vietnamese reading above?`) });
  }

  // 8) 拼音-意思 — pinyin recognition tied to meaning (easy, warm-up/change of pace)
  if (w.pinyin) {
    const distractors = pickN(levelPool, 8).map(v => v.pinyin);
    const built = makeMcOptions(w.pinyin, distractors);
    if (built) qs.push({ difficulty: "easy", genre: "vocab", passage: L(`Nghĩa: ${L(w.meaning, w.meaning_en)}`, `Meaning: ${w.meaning_en}`), ...built,
      question: L(`Từ mang nghĩa trên có pinyin là gì?`, `What is the pinyin for the word with the meaning above?`) });
  }

  // Order from easy → hard so difficulty ramps up through the set (avoid repetitive feel)
  const order = { easy: 0, medium: 1, hard: 2, veryhard: 3 };
  qs.sort((a, b) => order[a.difficulty] - order[b.difficulty]);
  return qs.slice(0, 8);
}

function startQuizForWord(char, options = {}) {
  beginPracticeSession(options);
  const w = VOCAB_BY_CHAR[char];
  if (window.PandaHanAdaptiveLearning && !window.PandaHanAdaptiveLearning.canPracticeWord(char)) {
    alert("Từ này chưa có lượt học/ôn được xác minh. Hãy hoàn thành phần giới thiệu từ liên kết trước / This word is not yet eligible. Complete its linked introduction first.");
    return;
  }
  quizQueue = genReadingQuestions(w).map(q => ({ ...q, char }));
  if (!quizQueue.length) { alert("Từ này chưa có câu trắc nghiệm / No quiz available for this word."); return; }
  runQuiz();
}
function startQuizForWords(words, options = {}) {
  beginPracticeSession(options);
  const pool = Array.from(new Map((Array.isArray(words) ? words : []).filter((w) => w && w.char).map((w) => [w.char, w])).values()).slice(0, 15);
  quizQueue = [];
  pool.forEach((w) => {
    const qs = genReadingQuestions(w);
    if (qs.length) quizQueue.push({ ...shuffle(qs)[0], char: w.char });
  });
  if (!quizQueue.length) { alert(L("Chưa có đủ dữ liệu bài tập từ nhóm từ đã học.", "Not enough evidence-based vocabulary exercises yet.")); return; }
  runQuiz();
}
function startQuizLevel(level, options = {}) {
  beginPracticeSession(options);
  const pool = window.PandaHanAdaptiveLearning ? (window.PandaHanAdaptiveLearning.getPracticePool?.(level) || []) : (window.PandaHanMission?.getTargetVocabulary?.() || []);
  if (!pool.length) { alert(L("Chưa có từ đã học/đến hạn đủ điều kiện để kiểm tra. Hãy hoàn thành Ngữ âm và giới thiệu từ trước.", "No evidence-based practice words are ready yet.")); return; }
  startQuizForWords(shuffle(pool), options);
}

function vocabPhaseStorageKey(dayNumber) {
  const owner = String(typeof storageNamespace === "function" ? storageNamespace() : "guest").replace(/[^a-zA-Z0-9_-]/g, "_");
  return `pandahan_vocab_phase_v1_${owner}_${Number(dayNumber || 0)}`;
}
function readVocabularyPhase(dayNumber) {
  const base = { dayNumber: Number(dayNumber || 0), introCompleted: false, introChars: [], speechRequiredChars: [], speechAttempts: {}, speakingCompleted: false, gameCompleted: false, gameChars: [], gameScorePercent: null, updatedAt: 0 };
  try { const value = JSON.parse(localStorage.getItem(vocabPhaseStorageKey(dayNumber)) || "null"); return value && typeof value === "object" ? { ...base, ...value } : base; } catch (_) { return base; }
}
function writeVocabularyPhase(value) {
  try { localStorage.setItem(vocabPhaseStorageKey(value.dayNumber), JSON.stringify(value)); } catch (_) {}
  window.dispatchEvent(new CustomEvent("pandahan-vocab-phase-updated", { detail: value }));
  return value;
}
function completeVocabularyIntroPhase(dayNumber, chars) {
  const current = readVocabularyPhase(dayNumber);
  current.introCompleted = true;
  current.introChars = Array.from(new Set([...(current.introChars || []), ...(chars || []).map(String)]));
  current.updatedAt = Date.now();
  return writeVocabularyPhase(current);
}
function startVocabularySpeakingPhase(dayNumber, chars) {
  const current = readVocabularyPhase(dayNumber);
  if (!current.introCompleted) return current;
  current.speechRequiredChars = Array.from(new Set((chars || []).map(String)));
  current.speakingCompleted = current.speechRequiredChars.length > 0 && current.speechRequiredChars.every((char) => Number(current.speechAttempts?.[char] || 0) > 0);
  current.updatedAt = Date.now();
  return writeVocabularyPhase(current);
}
function recordVocabularySpeakingAttemptPhase(dayNumber, char) {
  const current = readVocabularyPhase(dayNumber);
  const key = String(char || "");
  current.speechAttempts = current.speechAttempts || {};
  current.speechAttempts[key] = Number(current.speechAttempts[key] || 0) + 1;
  current.speakingCompleted = current.speechRequiredChars.length > 0 && current.speechRequiredChars.every((item) => Number(current.speechAttempts?.[item] || 0) > 0);
  current.updatedAt = Date.now();
  return writeVocabularyPhase(current);
}
function completeVocabularyGamePhase(dayNumber, chars, scorePercent = null) {
  const current = readVocabularyPhase(dayNumber);
  if (!current.introCompleted || !current.speakingCompleted) return current;
  current.gameCompleted = true;
  current.gameChars = Array.from(new Set([...(current.gameChars || []), ...(chars || []).map(String)]));
  current.gameScorePercent = Number.isFinite(Number(scorePercent)) ? Number(scorePercent) : current.gameScorePercent;
  current.updatedAt = Date.now();
  return writeVocabularyPhase(current);
}
window.PandaHanVocabularyPhase = { get: readVocabularyPhase, completeIntro: completeVocabularyIntroPhase, startSpeaking: startVocabularySpeakingPhase, recordSpeakingAttempt: recordVocabularySpeakingAttemptPhase, completeGame: completeVocabularyGamePhase };

function startAdaptiveVocabularyLesson(words, dayNumber) {
  const pool = Array.from(new Map((Array.isArray(words) ? words : []).filter((w) => w && w.char).map((w) => [w.char, w])).values()).slice(0, 6);
  if (!pool.length) { alert("Chưa có nhóm từ mới liên kết với phần Ngữ âm này / No linked new vocabulary is ready yet."); return; }
  document.querySelector("#practiceTab .practice-grid")?.style && (document.querySelector("#practiceTab .practice-grid").style.display = "none");
  const gc = document.getElementById("gameContainer");
  if (!gc) return;
  gc.classList.add("visible"); gc.style.display = "block";
  let index = 0;
  const played = new Set();
  const body = document.getElementById("gameContent");
  const render = () => {
    const w = pool[index];
    if (!w) {
      const chars = pool.map((item) => item.char);
      completeVocabularyIntroPhase(Number(dayNumber), chars);
      window.PandaHanAdaptiveLearning?.completeIntroduction?.(Number(dayNumber), chars);
      body.innerHTML = `<div style="text-align:center;padding:22px 12px;"><div style="font-size:42px;">✅</div><h3>${L("Đã học xong nhóm từ liên kết", "Linked vocabulary exposure completed")}</h3><p style="color:var(--text-light);">${L("Hệ thống đã ghi nhận lượt học thật. Bây giờ bài kiểm tra sẽ chỉ dùng đúng nhóm từ này và kết quả sẽ cập nhật SM-2.", "Real exposure was recorded. The next exercises will use only this word set and update SM-2 from your answers.")}</p><button class="btn btn-hsk2" id="adaptiveStartQuizBtn">📝 ${L("Làm bài kiểm tra nhóm từ này", "Test this word set")}</button></div>`;
      document.getElementById("adaptiveStartQuizBtn")?.addEventListener("click", () => startQuizForWords(pool));
      return;
    }
    recordView(w.char);
    const hasPlayed = played.has(w.char);
    body.innerHTML = `<div style="text-align:center;padding:18px 10px;"><div style="font-size:11px;color:var(--text-light);">${index + 1}/${pool.length} · ${L("Từ mới liên kết với Ngữ âm", "New word linked to phonetics")}</div><div style="font-size:54px;font-weight:800;margin-top:8px;">${esc(w.char)}</div><div style="font-size:17px;color:var(--pink);font-weight:800;">${esc(w.pinyin)}</div><div style="margin:8px 0;color:var(--text-light);">${esc(L(w.meaning, w.meaning_en))}</div><div style="font-size:12px;color:var(--text-light);">${esc(w.examples?.[0]?.[0] || "")}</div><div style="display:flex;justify-content:center;gap:8px;margin-top:15px;"><button class="btn btn-outline" id="adaptivePlayAudio">🔊 ${L("Nghe mẫu", "Play audio")}</button><button class="btn btn-hsk2" id="adaptiveNextWord" ${hasPlayed ? "" : "disabled"}>${index + 1 === pool.length ? L("Hoàn tất nhóm từ", "Finish word set") : L("Từ tiếp theo", "Next word")} →</button></div><div id="adaptiveAudioStatus" style="font-size:11px;color:#64748b;margin-top:9px;">${hasPlayed ? L("Đã có lượt nghe thật cho từ này.", "Real playback recorded for this word.") : L("Hãy nghe audio mẫu trước khi sang từ tiếp theo.", "Play the reference audio before continuing.")}</div></div>`;
    document.getElementById("adaptivePlayAudio")?.addEventListener("click", () => {
      const audioButton = document.getElementById("adaptivePlayAudio");
      const button = document.getElementById("adaptiveNextWord");
      const status = document.getElementById("adaptiveAudioStatus");
      if (audioButton) audioButton.disabled = true;
      if (status) status.textContent = L("Đang phát âm thanh mẫu…", "Playing reference audio…");
      const markPlayed = () => {
        played.add(w.char);
        if (button) button.disabled = false;
        if (audioButton) audioButton.disabled = false;
        if (status) status.textContent = L("Đã ghi nhận lượt nghe thật.", "Real playback completed and recorded.");
      };
      const failPlayed = () => {
        if (audioButton) audioButton.disabled = false;
        if (status) status.textContent = L("Không phát được audio; chưa ghi nhận lượt nghe.", "Audio playback failed; playback was not recorded.");
      };
      try {
        if (!window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") { failPlayed(); return; }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(w.char);
        utterance.lang = "zh-CN";
        utterance.rate = 0.72;
        utterance.pitch = 1;
        utterance.onend = markPlayed;
        utterance.onerror = failPlayed;
        window.speechSynthesis.speak(utterance);
      } catch (_) { failPlayed(); }
    });
    document.getElementById("adaptiveNextWord")?.addEventListener("click", () => { index += 1; render(); });
  };
  render();
}
function startAdaptiveVocabularySpeaking(words, dayNumber) {
  const pool = Array.from(new Map((Array.isArray(words) ? words : []).filter((w) => w && w.char).map((w) => [w.char, w])).values()).slice(0, 10);
  if (!pool.length) { alert("Chưa có nhóm từ đủ điều kiện để luyện nói / No eligible vocabulary is ready for speaking."); return; }
  document.querySelector("#practiceTab .practice-grid")?.style && (document.querySelector("#practiceTab .practice-grid").style.display = "none");
  const gc = document.getElementById("gameContainer"); if (!gc) return;
  gc.classList.add("visible"); gc.style.display = "block";
  const body = document.getElementById("gameContent");
  let index = 0;
  const recognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
  const normalize = (value) => String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\u4e00-\u9fff]/g, "");
  startVocabularySpeakingPhase(Number(dayNumber), pool.map((item) => item.char));
  const saveAttempt = (word, transcript, correct) => {
    const owner = String(typeof storageNamespace === "function" ? storageNamespace() : "guest").replace(/[^a-zA-Z0-9_-]/g, "_");
    const key = `pandahan_vocab_speaking_v1_${owner}`;
    let rows = []; try { rows = JSON.parse(localStorage.getItem(key) || "[]"); } catch (_) {}
    rows.unshift({ char: word.char, pinyin: word.pinyin, transcript: String(transcript || "").slice(0, 120), correct: !!correct, createdAt: Date.now(), dayNumber: Number(dayNumber) });
    localStorage.setItem(key, JSON.stringify(rows.slice(0, 120)));
    recordVocabularySpeakingAttemptPhase(Number(dayNumber), word.char);
    window.dispatchEvent(new CustomEvent("pandahan-learning-evaluation", { detail: { source: "vocabulary-speaking", rawSource: "vocabulary-speaking-recognition", evidenceType: "vocabulary_speech_attempt", verified: true, dayNumber: Number(dayNumber), char: word.char, attempts: 1, correct: correct ? 1 : 0, total: 1, scorePercent: correct ? 100 : 0, transcript: String(transcript || "").slice(0, 120), evaluatedAt: Date.now() } }));
  };
  const render = () => {
    const word = pool[index];
    if (!word) {
      body.innerHTML = `<div style="text-align:center;padding:22px 12px;"><div style="font-size:42px;">🗣️</div><h3>${L("Đã hoàn thành lượt nói từ vựng", "Vocabulary speaking round completed")}</h3><p style="color:var(--text-light);">${L("Hệ thống đã lưu từng lượt nhận diện thật; kết quả này không thay thế điểm Ngữ âm chuyên sâu.", "Each real recognition attempt was saved; this result does not replace the full phonetics score.")}</p><button class="btn btn-outline" id="vocabSpeakBack">← ${L("Về luyện tập", "Back to practice")}</button></div>`;
      document.getElementById("vocabSpeakBack")?.addEventListener("click", () => { if (typeof exitToneRace === "function") exitToneRace(); else switchTab("practice"); });
      return;
    }
    recordView(word.char);
    body.innerHTML = `<div style="text-align:center;padding:18px 10px;"><div style="font-size:11px;color:var(--text-light);">${index + 1}/${pool.length} · 🗣️ ${L("Nói từ vựng", "Vocabulary speaking")}</div><div style="font-size:54px;font-weight:800;margin-top:8px;">${esc(word.char)}</div><div style="font-size:17px;color:var(--pink);font-weight:800;">${esc(word.pinyin)}</div><div style="margin:8px 0;color:var(--text-light);">${esc(L(word.meaning, word.meaning_en))}</div><div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:15px;"><button class="btn btn-outline" id="vocabSpeakPlay">🔊 ${L("Nghe mẫu", "Play model")}</button><button class="btn btn-hsk2" id="vocabSpeakStart">🎙️ ${L("Bắt đầu nói", "Start speaking")}</button></div><div id="vocabSpeakFeedback" style="font-size:12px;color:#64748b;margin-top:12px;min-height:20px;">${L("Hãy nghe mẫu rồi đọc từ này vào micro.", "Play the model, then say the word into the microphone.")}</div></div>`;
    document.getElementById("vocabSpeakPlay")?.addEventListener("click", () => speak(word.char));
    document.getElementById("vocabSpeakStart")?.addEventListener("click", () => {
      const feedback = document.getElementById("vocabSpeakFeedback");
      if (!recognitionCtor) { if (feedback) feedback.textContent = L("Trình duyệt này chưa hỗ trợ nhận diện giọng nói; chưa ghi nhận lượt nói.", "Speech recognition is not supported; no speaking attempt was recorded."); return; }
      const btn = document.getElementById("vocabSpeakStart"); if (btn) btn.disabled = true;
      const recognition = new recognitionCtor(); recognition.lang = "zh-CN"; recognition.interimResults = false; recognition.maxAlternatives = 1;
      if (feedback) feedback.textContent = L("Đang nghe bạn nói…", "Listening to your speech…");
      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript || "";
        const expected = normalize(word.char) + normalize(word.pinyin);
        const heard = normalize(transcript);
        const correct = !!heard && (heard.includes(normalize(word.char)) || heard.includes(normalize(word.pinyin)) || expected.includes(heard));
        saveAttempt(word, transcript, correct);
        if (feedback) feedback.innerHTML = correct ? `✅ ${L("Nhận diện đúng từ", "Word recognized correctly")}: ${esc(transcript)}` : `❌ ${L("Chưa khớp nhận diện", "Recognition did not match")}: ${esc(transcript)} · ${L("Đáp án", "Expected")}: ${esc(word.char)} (${esc(word.pinyin)})`;
        setTimeout(() => { index += 1; render(); }, 1400);
      };
      recognition.onerror = () => { if (feedback) feedback.textContent = L("Không nhận diện được lượt nói; hãy thử lại.", "Speech was not recognized; please try again."); if (btn) btn.disabled = false; };
      recognition.onend = () => { if (btn) btn.disabled = false; };
      try { recognition.start(); } catch (_) { if (feedback) feedback.textContent = L("Micro chưa sẵn sàng; chưa ghi nhận lượt nói.", "Microphone is not ready; no attempt was recorded."); if (btn) btn.disabled = false; }
    });
  };
  render();
}
let mistakeReviewActive = false;
function finishMistakeReviewIfClear() {
  if (!mistakeReviewActive) return;
  const queue = window.PandaHanMistakes?.getOpenQueue?.() || window.PandaHanMistakes?.getQueue?.() || [];
  if (queue.length) return;
  mistakeReviewActive = false;
  const day = window.PandaHanSchedule?.getSchedule?.()?.days?.filter((item) => item.status === "unlocked").sort((a, b) => Number(a.sequence_index) - Number(b.sequence_index))[0];
  if (day && window.PandaHanSchedule?.completeTask) window.PandaHanSchedule.completeTask(Number(day.day_number), "mistake_review", "verified:mistake-redo", { evidenceType: "objective_wrong_item_redo", attempts: 1, total: 1, correct: 1, scorePercent: 100, details: "All unresolved wrong items were answered correctly in the redo session." }).catch((error) => console.warn("Complete mistake review:", error.message || error));
}
function startMistakeReview() {
  if (window.PandaHanPhoneticsListeningQuiz?.startReview?.()) return;
  const queue = window.PandaHanMistakes?.getQueue?.() || [];
  const allQueue = window.PandaHanMistakes?.getAllQueue?.() || queue;
  const words = queue.map((item) => VOCAB_BY_CHAR[item.char]).filter(Boolean);
  if (!words.length) {
    const next = allQueue.map((item) => Number(item.nextReviewAt || 0)).filter(Boolean).sort((a, b) => a - b)[0];
    const dateText = next ? new Date(next).toLocaleDateString(LANG_MODE === "en" ? "en-US" : "vi-VN") : "";
    alert(L(`Các lỗi hiện tại đã làm đúng. Mốc ôn repetition tiếp theo${dateText ? ` là ${dateText}` : ""}.`, `The current wrong items have been redone. The next spaced-review checkpoint${dateText ? ` is ${dateText}` : ""}.`));
    return;
  }
  mistakeReviewActive = true;
  startQuizForWords(words);
}
window.startQuizForWords = startQuizForWords;
window.startAdaptiveVocabularyLesson = startAdaptiveVocabularyLesson;
window.startAdaptiveVocabularySpeaking = startAdaptiveVocabularySpeaking;
window.startMistakeReview = startMistakeReview;
window.getVocabularyPhase = readVocabularyPhase;
window.addEventListener("pandahan-quest-score-saved", (event) => {
  const detail = event.detail || {};
  const mission = window.PandaHanMission?.getCurrent?.();
  if (!mission || Number(detail.dayNumber) !== Number(mission.dayNumber) || !window.PandaHanVocabularyPhase?.completeGame) return;
  const words = mission.chainVocabulary || mission.adaptivePlan?.introWords || mission.newVocab || [];
  window.PandaHanVocabularyPhase.completeGame(Number(mission.dayNumber), words.map((w) => w.char), Number(detail.scorePercent));
});

let quizAttemptRows = [];
function runQuiz() {
  quizIdx = 0; quizScore = 0; quizAttemptRows = [];
  showScreen("quiz");
  document.getElementById("qTotal").textContent = quizQueue.length;
  showQuizQuestion();
}
let quizTimerInterval = null;
const QUIZ_TIME_LIMIT = 15;
function clearQuizTimer() {
  if (quizTimerInterval) { clearInterval(quizTimerInterval); quizTimerInterval = null; }
}
function startQuizTimer(q) {
  clearQuizTimer();
  let timeLeft = QUIZ_TIME_LIMIT;
  const numEl = document.getElementById("qTimerNum");
  const fillEl = document.getElementById("qTimerFill");
  const update = () => {
    numEl.textContent = timeLeft;
    fillEl.style.width = (timeLeft / QUIZ_TIME_LIMIT * 100) + "%";
    fillEl.classList.remove("warn", "danger");
    numEl.classList.remove("danger-text");
    if (timeLeft <= 5) { fillEl.classList.add("danger"); numEl.classList.add("danger-text"); playTing("tick"); }
    else if (timeLeft <= 8) { fillEl.classList.add("warn"); playTing("tick"); }
  };
  update();
  quizTimerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft < 0) {
      clearQuizTimer();
      timeoutQuizQuestion(q);
      return;
    }
    update();
  }, 1000);
}
function timeoutQuizQuestion(q) {
  playTing("wrong");
  document.querySelectorAll("#qContent .quiz-options button").forEach(b => {
    b.classList.add("disabled"); b.disabled = true;
    if (b.dataset.letter === q.answer) b.classList.add("correct");
  });
  recordQuizResult(q.char, false, { source: "quiz-timeout", dayNumber: Number(window.PandaHanMission?.getCurrent?.()?.dayNumber || 0), prompt: q.question, expected: q.options?.find((option) => option[0] === q.answer)?.[1] || q.answer, selected: "timeout" });
  quizAttemptRows.push({ char: q.char, correct: false, expected: q.options?.find((option) => option[0] === q.answer)?.[1] || q.answer, selected: "timeout", explanation: explainAnswer(q) });
  const explainBox = document.createElement("div");
  explainBox.className = "quiz-explain bad";
  explainBox.innerHTML = `
    <div class="quiz-explain-head">⏰ ${L("Hết giờ! Cùng xem giải thích nhé:", "Time's up! Let's see the explanation:")}</div>
    ${explainAnswer(q)}
    <button class="btn btn-hsk2" style="margin-top:12px;width:100%;" id="qNextFromExplain">${L("Câu tiếp theo →", "Next question →")}</button>`;
  document.getElementById("qCard").appendChild(explainBox);
  document.getElementById("qNextFromExplain").addEventListener("click", () => { quizIdx++; showQuizQuestion(); });
}
function showQuizQuestion() {
  const oldExplain = document.querySelector("#qCard .quiz-explain");
  if (oldExplain) oldExplain.remove();
  if (quizIdx >= quizQueue.length) { clearQuizTimer(); showQuizResult(); return; }
  const q = quizQueue[quizIdx];
  updateFlagBtn("qFlagBtn", q.char);
  document.getElementById("qProgress").textContent = quizIdx + 1;
  const opts = shuffle(q.options);
  const diffLabel = { easy: L("Dễ", "Easy"), medium: L("Trung bình", "Medium"), hard: L("Khó", "Hard"), veryhard: L("Rất khó", "Very hard") }[q.difficulty] || "";
  const diffClass = { easy: "easy", medium: "medium", hard: "hard", veryhard: "veryhard" }[q.difficulty] || "medium";
  const passageHtml = q.passage
    ? `<div class="quiz-passage lookup-text"><span class="qp-tag">📖 ${L("Đọc đoạn văn", "Reading passage")}</span>${esc(q.passage)}</div>`
    : "";
  document.getElementById("qContent").innerHTML =
    `${diffLabel ? `<div class="quiz-diff ${diffClass}">${diffLabel}</div>` : ""}
     ${passageHtml}
     <div class="quiz-question lookup-text">${esc(biL(q.question))}</div>
     <div class="quiz-options">${opts.map(o => `<button data-letter="${o[0]}">${esc(localizedQuizOption(o[1]))}</button>`).join("")}</div>`;
  document.querySelectorAll("#qContent .quiz-options button").forEach(b => {
    b.addEventListener("click", () => answerQuiz(b, q));
  });
  const timerWrap = document.getElementById("qTimerWrap");
  if (inAdvancedSetMode) {
    if (timerWrap) timerWrap.style.display = "none";
    clearQuizTimer();
  } else {
    if (timerWrap) timerWrap.style.display = "";
    startQuizTimer(q);
  }
}
function answerQuiz(btn, q) {
  clearQuizTimer();
  const correct = btn.dataset.letter === q.answer;
  playTing(correct ? "correct" : "wrong");
  document.querySelectorAll("#qContent .quiz-options button").forEach(b => {
    b.classList.add("disabled"); b.disabled = true;
    if (b.dataset.letter === q.answer) b.classList.add("correct");
    else if (b === btn) b.classList.add("wrong");
  });
  if (correct) quizScore++;
  recordQuizResult(q.char, correct, { source: "quiz", dayNumber: Number(window.PandaHanMission?.getCurrent?.()?.dayNumber || 0), prompt: q.question, expected: q.options?.find((option) => option[0] === q.answer)?.[1] || q.answer, selected: btn?.textContent || "" });
  quizAttemptRows.push({ char: q.char, correct, expected: q.options?.find((option) => option[0] === q.answer)?.[1] || q.answer, selected: btn?.textContent || "", explanation: explainAnswer(q) });

  const explainBox = document.createElement("div");
  explainBox.className = "quiz-explain " + (correct ? "ok" : "bad");
  const wrongExplainHtml = correct ? "" : `<div class="quiz-explain-body" style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px dashed rgba(0,0,0,0.12);">${explainWrongPick(q, btn.dataset.letter)}</div>`;
  explainBox.innerHTML = `
    <div class="quiz-explain-head">${correct ? "🎉 " + L("Chính xác!", "Correct!") : "📚 " + L("Chưa đúng — cùng xem giải thích nhé:", "Not quite — let's see why:")}</div>
    ${wrongExplainHtml}
    <div class="quiz-explain-body">${explainAnswer(q)}</div>
    <button class="btn btn-hsk2" id="qNextBtn" style="margin-top:10px;">${L("Câu tiếp theo →", "Next question →")}</button>`;
  document.getElementById("qCard").appendChild(explainBox);
  document.getElementById("qNextBtn").addEventListener("click", () => { quizIdx++; showQuizQuestion(); });
  explainBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
function showQuizResult() {
  finishMistakeReviewIfClear();
  const pct = Math.round((quizScore / quizQueue.length) * 100);
  const missionDay = Number(window.PandaHanMission?.getCurrent?.()?.dayNumber || 0);
  const wrongItems = quizAttemptRows.filter((row) => !row.correct).map((row) => ({ char: row.char, expected: row.expected, selected: row.selected, explanation: row.explanation }));
  const feedback = pct >= 80 ? L("Nắm tốt nhóm từ. Hãy ôn ngắt quãng để giữ độ chắc.", "Strong linked-vocabulary result. Use spaced review to retain it.") : pct >= 30 ? L("Đã có điểm, nhưng hãy ôn lại các câu sai trước buổi mới.", "The score is recorded, but redo the wrong items before the next session.") : L("Chưa đạt mục tiêu. Hãy nghe lại audio mẫu và làm lại nhóm từ này.", "Below target. Replay the model audio and retry this linked-vocabulary set.");
  const owner = String(typeof storageNamespace === "function" ? storageNamespace() : (window.CURRENT_USER?.uid || "guest")).replace(/[^a-zA-Z0-9_-]/g, "_");
  const assessment = { source: "linked-vocabulary-quiz", dayNumber: missionDay, scorePercent: pct, correct: quizScore, total: quizQueue.length, wrongItems, feedback, evaluatedAt: Date.now() };
  try {
    const key = `pandahan_ai_coach_assessments_v1_${owner}`;
    const rows = JSON.parse(localStorage.getItem(key) || "[]");
    localStorage.setItem(key, JSON.stringify([assessment, ...rows.filter((row) => !(String(row.source) === assessment.source && Number(row.dayNumber) === missionDay))].slice(0, 40)));
  } catch (_) {}
  window.dispatchEvent(new CustomEvent("pandahan-ai-coach-assessment", { detail: assessment }));
  window.dispatchEvent(new CustomEvent("pandahan-learning-evaluation", { detail: { ...assessment, rawSource: "vocabulary-quiz", evidenceType: "linked_vocabulary_quiz", verified: true } }));
  const goingToReview = postQuizGoToReview && pendingFlashcardQueue && pendingFlashcardQueue.length;
  const goingToDialogue = pendingDialogueQueue && pendingDialogueQueue.length;
  let btnHtml, noteHtml = "";
  if (!inAdvancedSetMode) savePracticeCompletion(pct, "quiz");
  if (goingToDialogue) {
    btnHtml = `<button class="btn btn-hsk3" id="qContinueDialogueBtn" style="margin-top:14px;">➡️ ${L("Tiếp tục: Sắp xếp hội thoại", "Continue: Dialogue Reorder")}</button>`;
    noteHtml = `<p style="font-size:12.5px;color:var(--text-light);">${L("Phần 1 (trắc nghiệm) xong! Còn phần 2: sắp xếp hội thoại.", "Part 1 (multiple choice) done! Part 2: dialogue reordering next.")}</p>`;
  } else if (goingToReview) {
    btnHtml = `<button class="btn btn-hsk2" id="qContinueReviewBtn" style="margin-top:14px;">➡️ ${L("Vào Ôn tập", "Go to Review")}</button>`;
    noteHtml = `<p style="font-size:12.5px;color:var(--text-light);">${L("Đã có dữ liệu quiz — giờ hệ thống có thể đánh giá mức độ nhớ của bạn.", "Quiz data recorded — the system can now assess your recall.")}</p>`;
  } else {
    btnHtml = `<button class="btn btn-hsk2" id="qBackBtn" style="margin-top:14px;">📊 ${L("Xem tiến độ", "View progress")}</button>`;
  }
  document.getElementById("qContent").innerHTML =
    `<div class="quiz-result"><div class="score">${pct}%</div>
     <p>${L(`Đúng ${quizScore}/${quizQueue.length} câu`, `${quizScore}/${quizQueue.length} correct`)}</p>
     <div style="margin:12px auto;max-width:520px;padding:10px 12px;border-radius:10px;background:${pct >= 80 ? '#f0fdf4' : pct >= 30 ? '#fffbeb' : '#fef2f2'};color:${pct >= 80 ? '#166534' : pct >= 30 ? '#92400e' : '#b91c1c'};font-size:13px;line-height:1.5;">🤖 <b>${L("AI Coach nhận xét", "AI Coach feedback")}:</b> ${esc(feedback)}${wrongItems.length ? `<br><span style="font-size:12px;">${L("Cần ôn", "Review")}: ${wrongItems.map((item) => esc(item.char || item.expected)).filter(Boolean).join(" · ")}</span>` : ""}</div>
     ${noteHtml}
     ${btnHtml}</div>`;
  document.getElementById("qProgress").textContent = quizQueue.length;
  logActivity(`📝 Trắc nghiệm: ${quizScore}/${quizQueue.length} đúng (${pct}%)`);
  if (goingToDialogue) {
    document.getElementById("qContinueDialogueBtn").addEventListener("click", () => {
      uQueue = pendingDialogueQueue;
      pendingDialogueQueue = null;
      runUnscramble();
    });
  } else if (goingToReview) {
    document.getElementById("qContinueReviewBtn").addEventListener("click", () => {
      postQuizGoToReview = false;
      fcQueue = pendingFlashcardQueue;
      pendingFlashcardQueue = null;
      runFlashcards();
    });
  } else {
    document.getElementById("qBackBtn").addEventListener("click", () => switchTab("dashboard"));
  }
}

/* ===================== FLASHCARD (SRS review) ===================== */
let fcQueue = [], fcIdx = 0, fcCorrect = 0, fcWrong = 0;
let pendingFlashcardQueue = null, postQuizGoToReview = false;
function startReviewForWord(char, options = {}) {
  beginPracticeSession(options);
  // Step 1: if this exact word has never been quizzed, send the learner to a
  // quiz for it first (SM-2 needs real performance data to grade — see
  // computeAutoQuality). Step 2: if it already has quiz data, skip the quiz
  // and go straight to the flashcard, where they can listen + see the result.
  const s = getStat(char);
  if (s.quizAttempts === 0) {
    const w = VOCAB_BY_CHAR[char];
    const qs = genReadingQuestions(w);
    if (qs.length) {
      // Require the FULL quiz set for this word (all question types), not just one,
      // so the SM-2 auto-assessment is based on real, complete performance data.
      quizQueue = shuffle(qs).map(q => ({ ...q, char }));
      pendingFlashcardQueue = [char];
      postQuizGoToReview = true;
      runQuiz();
      return;
    }
    // no quiz questions authored for this word at all — fall through to flashcard
  }
  fcQueue = [char];
  runFlashcards();
}
function startReviewSession(options = {}) {
  beginPracticeSession(options);
  // Most-overdue-first: with a daily cap, we want the words at real risk of
  // being forgotten to always make the cut, not lose out to a random shuffle.
  // Only review words the student has already learned before (repetitions > 0
  // via isDue). Never pull in fresh/unstudied (tier 0) words here — "Ôn tập"
  // must only cover previously learned vocabulary, not introduce new ones.
  let due = VOCAB.filter(w => isDue(w.char))
    .sort((a, b) => getStat(a.char).nextReview - getStat(b.char).nextReview)
    .map(w => w.char);
  let queue = due.slice(0, 20); // daily review cap — keeps sessions manageable, avoids pile-up burnout
  if (!queue.length) { alert("🎉 Không có từ nào cần ôn lúc này! / Nothing due right now!"); return; }
  hideStudyReminder();
  playReminderAudio().catch(() => {});

  // Words with no quiz attempts yet have no performance data for the auto-assessment
  // (see computeAutoQuality) — send the learner to practice those first.
  const needsQuiz = queue.filter(char => getStat(char).quizAttempts === 0);
  if (needsQuiz.length) {
    let qq = [];
    needsQuiz.forEach(char => {
      const w = VOCAB_BY_CHAR[char];
      const qs = genReadingQuestions(w);
      // Use the FULL question set per word here too, so every word entering
      // the queue gets a complete, real assessment — not just one sample question.
      qs.forEach(q => qq.push({ ...q, char }));
    });
    qq = shuffle(qq);
    if (qq.length) {
      quizQueue = qq;
      pendingFlashcardQueue = queue;
      postQuizGoToReview = true;
      alert(L(
        `Bạn có ${qq.length} từ chưa làm bài luyện tập — hãy làm quiz trước để hệ thống đánh giá đúng mức độ nhớ, sau đó sẽ tự chuyển sang phần Ôn tập.`,
        `You have ${qq.length} word(s) without practice data yet — do the quiz first so the system can assess your recall, then you'll move on to Review.`
      ));
      runQuiz();
      return;
    }
  }
  fcQueue = queue;
  runFlashcards();
}
function runFlashcards() {
  fcIdx = 0; fcCorrect = 0; fcWrong = 0;
  showScreen("flashcard");
  document.getElementById("fcTotal").textContent = fcQueue.length;
  document.getElementById("fcEnd").style.display = "none";
  document.getElementById("fcCard").style.display = "block";
  document.getElementById("fcActions").style.display = "flex";
  showFlashcard();
}
function showFlashcard() {
  if (fcIdx >= fcQueue.length) { endFlashcards(); return; }
  resetMascot();
  const w = VOCAB_BY_CHAR[fcQueue[fcIdx]];
  recordView(w.char);
  updateFlagBtn("fcFlagBtn", w.char);
  document.getElementById("fcProgress").textContent = fcIdx + 1;
  document.getElementById("fcChar").textContent = w.char;
  const iconEl = document.getElementById("fcWordIcon");
  if (WORD_ICONS[w.char]) { iconEl.innerHTML = WORD_ICONS[w.char]; iconEl.style.display = "block"; }
  else { iconEl.innerHTML = ""; iconEl.style.display = "none"; }
  document.getElementById("fcAudioBtn").dataset.speak = w.char;
  document.getElementById("fcPinyin").textContent = w.pinyin + (w.hanviet ? "  ·  " + sinoVietnameseLabel() + ": " + w.hanviet : "");
  document.getElementById("fcMeaning").textContent = L(w.meaning, w.meaning_en) + "  ·  " + localizedPos(w.pos);
  document.getElementById("fcMeaningEn").textContent = w.def_zh;
  document.getElementById("fcExample").innerHTML = w.examples[0] ? `${esc(w.examples[0][0])}<br><span style="color:var(--pink);">${esc(w.examples[0][1])}</span><br>${esc(L(w.examples[0][2], w.examples[0][3]))}` : "";
  document.getElementById("fcHidden").classList.remove("show");
  document.getElementById("fcRevealBtn").style.display = "inline-block";
  document.getElementById("fcActions").style.display = "none";
}
function endFlashcards() {
  document.getElementById("fcCard").style.display = "none";
  document.getElementById("fcActions").style.display = "none";
  document.getElementById("fcEnd").style.display = "block";
  document.getElementById("fcEndCorrect").textContent = fcCorrect;
  document.getElementById("fcEndWrong").textContent = fcWrong;
  logActivity(`🎯 Ôn tập: ${fcCorrect} nhớ tốt, ${fcWrong} cần ôn lại`);
  savePracticeCompletion(fcQueue.length ? Math.round((fcCorrect / fcQueue.length) * 100) : 0, "flashcards");
  fcStreak = 0;
  if (fcCorrect > 0 && fcCorrect >= fcWrong) {
    playFanfare();
    burstConfetti(document.getElementById("fcEnd"), 30);
  }
}

/* ===================== SENTENCE UNSCRAMBLE ===================== */
let uQueue = [], uIdx = 0, uSelected = [], uCurrentQ = null;
let uCorrectCount = 0, uAnsweredCount = 0;
function startUnscrambleForWord(char, options = {}) {
  beginPracticeSession(options);
  const w = VOCAB_BY_CHAR[char];
  if (window.PandaHanAdaptiveLearning && !window.PandaHanAdaptiveLearning.canPracticeWord(char)) {
    alert("Từ này chưa có lượt học/ôn được xác minh. Hãy hoàn thành phần giới thiệu từ liên kết trước / This word is not yet eligible.");
    return;
  }
  uQueue = (w.unscramble || []).map(q => ({ ...q, char }));
  if (!uQueue.length) { alert("Từ này chưa có bài sắp xếp câu / No unscramble exercise available."); return; }
  runUnscramble();
}
function startUnscrambleLevel(level, options = {}) {
  beginPracticeSession(options);
  let pool = Array.isArray(options.words) && options.words.length ? options.words.slice() : (window.PandaHanAdaptiveLearning ? (window.PandaHanAdaptiveLearning.getPracticePool?.(level) || []) : (window.PandaHanMission?.getTargetVocabulary?.() || []));
  if (!pool.length) { alert(L("Chưa có từ đã học/đến hạn đủ điều kiện để sắp xếp câu.", "No evidence-based words are ready for unscramble.")); return; }
  pool = shuffle(pool).slice(0, 10);
  uQueue = [];
  pool.forEach(w => { if (Array.isArray(w.unscramble) && w.unscramble.length) uQueue.push({ ...shuffle(w.unscramble)[0], char: w.char }); });
  if (!uQueue.length) { alert("Không có bài tập / No exercises available."); return; }
  runUnscramble();
}
function runUnscramble() {
  uIdx = 0;
  uCorrectCount = 0;
  uAnsweredCount = 0;
  showScreen("unscramble");
  document.getElementById("uTotal").textContent = uQueue.length;
  showUnscrambleQuestion();
}
function showUnscrambleQuestion() {
  if (uIdx >= uQueue.length) {
    document.getElementById("uHint").textContent = "";
    document.getElementById("uMeaningVi").innerHTML = `🎉 Hoàn thành tất cả câu! / All sentences completed!`;
    document.getElementById("uMeaningEn").textContent = "";
    document.getElementById("uAnswerSlot").innerHTML = "";
    document.getElementById("uTokenPool").innerHTML = "";
    document.getElementById("uCheckBtn").style.display = "none";
    document.getElementById("uNextBtn").style.display = "none";
    document.getElementById("uFeedback").textContent = "";
    logActivity(`🔀 Hoàn thành bài sắp xếp câu (${uQueue.length} câu)`);
    if (currentAdvancedSetId === null) savePracticeCompletion(uQueue.length ? Math.round((uCorrectCount / uQueue.length) * 100) : 0, "unscramble");
    if (currentAdvancedSetId !== null) { showAdvancedSetCertificate(); currentAdvancedSetId = null; }
    return;
  }
  uCurrentQ = uQueue[uIdx];
  uSelected = [];
  updateFlagBtn("uFlagBtn", uCurrentQ.char);
  document.getElementById("uProgress").textContent = uIdx + 1;
  document.getElementById("uHint").textContent = `💡 ${L("Từ gợi ý", "Cue word")}: ${L(splitHintWord(uCurrentQ.hint_word).vi, splitHintWord(uCurrentQ.hint_word).en)}`;
  document.getElementById("uMeaningVi").textContent = (LANG_MODE === "vi" ? "🇻🇳 " : "🇬🇧 ") + L(uCurrentQ.meaning_vn, uCurrentQ.meaning_en);
  document.getElementById("uMeaningEn").textContent = "";
  document.getElementById("uFeedback").textContent = "";
  document.getElementById("uFeedback").className = "unscramble-feedback";
  document.getElementById("uCheckBtn").style.display = "inline-block";
  document.getElementById("uCheckBtn").disabled = false;
  document.getElementById("uNextBtn").style.display = "none";
  renderUnscrambleTokens();
}
function renderUnscrambleTokens() {
  const shuffledTokens = shuffle(uCurrentQ.scrambled.map((t, i) => ({ t, i })));
  const letters = ["A","B","C","D","E","F","G","H"];
  document.getElementById("uTokenPool").innerHTML = shuffledTokens.map((o, pos) =>
    `<span class="tok" data-idx="${o.i}" data-text="${esc(o.t).replace(/"/g, "&quot;")}"><span class="tok-badge">${letters[pos] || (pos+1)}</span>${esc(o.t)}</span>`).join("");
  document.getElementById("uAnswerSlot").innerHTML = "";
  document.querySelectorAll("#uTokenPool .tok").forEach(el => {
    el.addEventListener("click", () => {
      if (el.classList.contains("used")) return;
      el.classList.add("used");
      uSelected.push({ idx: Number(el.dataset.idx), text: el.dataset.text });
      renderAnswerSlot();
    });
  });
}
function renderAnswerSlot() {
  document.getElementById("uAnswerSlot").innerHTML = uSelected.map((s, pos) =>
    `<span class="tok" data-pos="${pos}">${esc(s.text)}</span>`).join("");
  document.querySelectorAll("#uAnswerSlot .tok").forEach(el => {
    el.addEventListener("click", () => {
      const pos = Number(el.dataset.pos);
      const removed = uSelected.splice(pos, 1)[0];
      const poolEl = document.querySelector(`#uTokenPool .tok[data-idx="${removed.idx}"]`);
      if (poolEl) poolEl.classList.remove("used");
      renderAnswerSlot();
    });
  });
}
document.addEventListener("click", (e) => {
  if (e.target.id === "uClearBtn") {
    uSelected = [];
    document.querySelectorAll("#uTokenPool .tok").forEach(el => el.classList.remove("used"));
    renderAnswerSlot();
  }
  if (e.target.id === "uCheckBtn") checkUnscramble();
  if (e.target.id === "uNextBtn") { uIdx++; showUnscrambleQuestion(); }
});
function checkUnscramble() {
  const built = uSelected.map(s => s.text).join("");
  const fb = document.getElementById("uFeedback");
  // The scrambled word tiles never carry punctuation (。！？、，), even when
  // it falls in the middle of the sentence (e.g. "老师，您好！"), so a
  // strict string match marked perfectly-arranged sentences as wrong.
  // Compare with all such punctuation stripped from both sides instead.
  const stripPunct = (s) => s.replace(/[。，！？、]/g, "");
  const correct = built === uCurrentQ.answer || stripPunct(built) === stripPunct(uCurrentQ.answer);
  playTing(correct ? "correct" : "wrong");
  const w = VOCAB_BY_CHAR[uCurrentQ.char];
  const explain = uCurrentQ.explain ? biL(uCurrentQ.explain) : (w ? L(
    `Câu đúng dùng "<b>${w.char}</b>" (${localizedPos(w.pos).toLowerCase()}, nghĩa "${w.meaning}") đúng vị trí ngữ pháp tiếng Trung: Chủ ngữ → Trạng ngữ → Động từ → Tân ngữ.`,
    `The correct sentence places "<b>${w.char}</b>" (${localizedPos(w.pos).toLowerCase()}, meaning "${w.meaning_en}") in proper Chinese word order: Subject → Adverbial → Verb → Object.`
  ) : "");
  if (correct) {
    fb.innerHTML = `✅ ${L("Chính xác!", "Correct!")} <b>${uCurrentQ.answer}</b> (${uCurrentQ.answer_pinyin})<div class="quiz-explain-body" style="margin-top:8px;">${explain}</div>`;
    fb.className = "unscramble-feedback ok";
  } else {
    fb.innerHTML = `❌ ${L("Chưa đúng.", "Not quite.")} ${L("Đáp án đúng", "Correct answer")}: <b>${esc(uCurrentQ.answer)}</b> (${esc(uCurrentQ.answer_pinyin)})<div class="quiz-explain-body" style="margin-top:8px;">${explain}</div>`;
    fb.className = "unscramble-feedback bad";
  }
  recordQuizResult(uCurrentQ.char, correct, { source: "unscramble", prompt: uCurrentQ.meaning_vn || "Sắp xếp câu", expected: uCurrentQ.answer, selected: built });
  uAnsweredCount += 1;
  if (correct) uCorrectCount += 1;
  if (currentAdvancedSetId !== null) {
    advancedDlgTotal++;
    if (correct) advancedDlgScore++;
  }
  document.getElementById("uCheckBtn").style.display = "none";
  document.getElementById("uNextBtn").style.display = "inline-block";
}

/* ===================== DASHBOARD ===================== */
const DASH_RING_CIRC = 2 * Math.PI * 52;
let dashChartRange = 7;

function renderDashboard() {
  const learned = VOCAB.filter(w => getTier(w.char) > 0).length;
  const mastered = VOCAB.filter(w => getTier(w.char) === 4).length;
  const due = VOCAB.filter(w => isDue(w.char)).length;
  const added = VOCAB.filter(w => STATS[w.char] && STATS[w.char].firstSeen > 0).length;
  const remembered = VOCAB.filter(w => getTier(w.char) >= 3).length; // "đã nắm vững" + "thành thạo"
  const notRemembered = VOCAB.filter(w => { const t = getTier(w.char); return t === 1 || t === 2; }).length; // "mới học" + "đang ôn luyện"
  document.getElementById("statAdded").textContent = added;
  document.getElementById("statRemembered").textContent = remembered;
  document.getElementById("statNotRemembered").textContent = notRemembered;
  document.getElementById("dashMastered").textContent = mastered;
  document.getElementById("dashDue").textContent = due;
  renderStreakBadges(); // also sets dashStreak (with current milestone badge)
  const chietuCovered = VOCAB.filter(w => w.chietu_vi && w.chietu_en).length;
  document.getElementById("dashChietuCoverage").textContent = `${chietuCovered}/${VOCAB.length}`;

  const pct = Math.round((learned / VOCAB.length) * 100);
  const ring = document.getElementById("dashRingFill");
  ring.style.strokeDasharray = `${(pct / 100) * DASH_RING_CIRC} ${DASH_RING_CIRC}`;
  document.getElementById("progressLabel").textContent = pct + "%";

  // HSK1-2-3 pill bars (color-coded to match each level's theme color)
  const hskColors = { 1: "var(--hsk1)", 2: "var(--hsk2)", 3: "var(--hsk3)" };
  let hskHtml = "";
  [1, 2, 3].forEach(level => {
    const levelWords = VOCAB.filter(w => w.hsk === level);
    const levelLearned = levelWords.filter(w => getTier(w.char) > 0).length;
    const pctL = levelWords.length ? Math.round((levelLearned / levelWords.length) * 100) : 0;
    hskHtml += `<div class="dash-hsk-row">
      <span class="hsk-tag" style="background:${hskColors[level]};">HSK${level}</span>
      <div class="pill-bg"><div class="pill-fill" style="width:${pctL}%;background:${hskColors[level]};"></div></div>
      <span class="val">${levelLearned}/${levelWords.length}</span>
    </div>`;
  });
  document.getElementById("dashHskBars").innerHTML = hskHtml;

  // Detailed 5-tier breakdown (per HSK level) — kept inside the collapsible "chi tiết" panel
  let barsHtml = "";
  [1, 2, 3].forEach(level => {
    const levelWords = VOCAB.filter(w => w.hsk === level);
    barsHtml += `<h4 style="font-size:12.5px;color:var(--text-light);margin:10px 0 4px;">HSK ${level} (${levelWords.length} từ)</h4>`;
    for (let t = 0; t <= 4; t++) {
      const count = levelWords.filter(w => getTier(w.char) === t).length;
      const pctT = levelWords.length ? Math.round((count / levelWords.length) * 100) : 0;
      barsHtml += `<div class="tier-bar-row"><span class="lbl">${RUBRIC[t].name}</span>
        <div class="bar-bg"><div class="bar-fill" style="width:${pctT}%;background:${RUBRIC[t].color};"></div></div>
        <span class="val">${count}</span></div>`;
    }
  });
  document.getElementById("tierBreakdown").innerHTML = barsHtml;

  document.getElementById("rubricList").innerHTML = RUBRIC.map(r =>
    `<div class="rubric-row"><span class="dot" style="background:${r.color};"></span>
      <div><b>${r.name} / ${r.en}</b>${r.desc}<span class="en">${r.descEn}</span></div></div>`).join("");

  renderActivityChart(dashChartRange);
  renderMonthCalendar();
  renderMergedHistory();
  renderSavedCerts();
}

/* Daily activity bar chart (7-day / 30-day toggle), built from every word's
   studyLog (SM-2 graded reviews) grouped by calendar day. */
function renderActivityChart(days) {
  const el = document.getElementById("dashActivityChart");
  if (!el) return;
  const dayNamesVi = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const counts = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
    counts.push({ date: d, count: 0 });
  }
  const byKey = {};
  counts.forEach(c => { byKey[c.date.toDateString()] = c; });
  Object.values(STATS).forEach(s => {
    (s.studyLog || []).forEach(log => {
      const d = new Date(log.t); d.setHours(0, 0, 0, 0);
      const c = byKey[d.toDateString()];
      if (c) c.count++;
    });
  });
  const maxCount = Math.max(1, ...counts.map(c => c.count));
  const todayKey = new Date().toDateString();
  el.innerHTML = counts.map(c => {
    const h = Math.round((c.count / maxCount) * 100);
    const isToday = c.date.toDateString() === todayKey;
    const label = days === 7 ? dayNamesVi[c.date.getDay()] : (c.date.getDate() % 5 === 0 || isToday ? c.date.getDate() + "/" + (c.date.getMonth() + 1) : "");
    return `<div class="dash-bar-col${isToday ? ' today' : ''}">
      <div class="bar-val">${c.count > 0 ? c.count : ""}</div>
      <div class="bar-track"><div class="bar-fill" style="height:${h}%;"></div></div>
      <div class="bar-day">${label}</div>
    </div>`;
  }).join("");
}

/* ---------- Month calendar heatmap (replaces a plain bar chart with an
   at-a-glance monthly view, similar to typical vocab-app dashboards) ---------- */
let calViewYear = null, calViewMonth = null;
function renderMonthCalendar() {
  const el = document.getElementById("dashMonthCalendar");
  const labelEl = document.getElementById("calMonthLabel");
  if (!el) return;
  const now = new Date();
  if (calViewYear === null) { calViewYear = now.getFullYear(); calViewMonth = now.getMonth(); }
  const year = calViewYear, month = calViewMonth;
  const monthNames = ["1","2","3","4","5","6","7","8","9","10","11","12"];
  if (labelEl) labelEl.textContent = L(`🐼 Tháng ${monthNames[month]}/${year}`, `🐼 Month ${monthNames[month]}/${year}`);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
  const activityByDay = {};
  Object.values(STATS).forEach(s => (s.studyLog || []).forEach(log => {
    const d = new Date(log.t);
    if (d.getFullYear() === year && d.getMonth() === month) {
      activityByDay[d.getDate()] = (activityByDay[d.getDate()] || 0) + 1;
    }
  }));
  const maxCount = Math.max(1, ...Object.values(activityByDay));
  let html = "";
  ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].forEach(d => html += `<div class="cal-dow">${d}</div>`);
  for (let i = 0; i < firstDow; i++) html += `<div class="cal-cell empty"></div>`;
  for (let day = 1; day <= daysInMonth; day++) {
    const count = activityByDay[day] || 0;
    const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
    let bg = "";
    if (count > 0) {
      const ratio = count / maxCount;
      const shades = ["#fbcfe8", "#f472b6", "#ec4899", "#c2650a"];
      const idx = Math.min(3, Math.floor(ratio * 4));
      bg = shades[idx];
    }
    html += `<div class="cal-cell${count > 0 ? " has-activity" : ""}${isToday ? " today" : ""}" style="${bg ? `background:${bg};` : ""}" title="${count} ${L("lượt ôn","reviews")}">${day}</div>`;
  }
  el.innerHTML = `<div class="cal-grid">${html}</div>`;
}
function navigateCalMonth(delta) {
  const now = new Date();
  if (calViewYear === null) { calViewYear = now.getFullYear(); calViewMonth = now.getMonth(); }
  calViewMonth += delta;
  if (calViewMonth < 0) { calViewMonth = 11; calViewYear--; }
  if (calViewMonth > 11) { calViewMonth = 0; calViewYear++; }
  renderMonthCalendar();
}

/* ---------- Session tracking: one entry per continuous visit, from
   login/reopening the page until logout or leaving the page. A static
   client-only app can't detect a real "logout" if the tab is just closed,
   so page-unload is treated as the end of the session — the closest
   honest approximation without a server. ---------- */
function startSessionTracking() {
  if (!CURRENT_USER) return;
  localStorage.setItem("pandahan_active_session_" + storageNamespace(), String(Date.now()));
}
function finalizeSession() {
  if (!CURRENT_USER) return;
  const ns = storageNamespace();
  const activeKey = "pandahan_active_session_" + ns;
  const startStr = localStorage.getItem(activeKey);
  if (!startStr) return;
  const start = Number(startStr);
  const end = Date.now();
  localStorage.removeItem(activeKey);
  if (!start || end - start < 3000) return; // ignore accidental instant reloads
  const sessKey = "pandahan_sessions_v1_" + ns;
  let list = [];
  try { list = JSON.parse(localStorage.getItem(sessKey)) || []; } catch (e) {}
  list.unshift({ start, end, duration: end - start });
  localStorage.setItem(sessKey, JSON.stringify(list.slice(0, 100)));
}
function getSessions() {
  try { return JSON.parse(localStorage.getItem("pandahan_sessions_v1_" + storageNamespace())) || []; }
  catch (e) { return []; }
}
// beforeunload listener moved to DOMContentLoaded (line ~4584) - combined with syncDataNow

/* ═══ Panda conversation chatbox — practices Chinese using ONLY the
   2,254-word HSK1-3 dictionary the student already has, so nothing said
   is beyond what they've actually been taught. ═══ */
let chatHistory = [];
let currentChatTopicId = 0; // 0 = free conversation, no fixed topic
let dialogueStepIndex = 0; // tracks progress through the current topic's scripted dialogue
function populateChatTopicSelect() {
  const sel = document.getElementById("chatTopicSelect");
  if (!sel) return;
  sel.innerHTML = `<option value="0">💬 ${L("Trò chuyện tự do", "Free conversation")}</option>` +
    HSK3_TOPICS.map(t => `<option value="${t.id}">${t.id}. ${esc(t.title_vi)}</option>`).join("");
  sel.value = String(currentChatTopicId);
}
function getCurrentTopic() {
  return HSK3_TOPICS.find(t => t.id === currentChatTopicId) || null;
}
function onChatTopicChange() {
  currentChatTopicId = Number(document.getElementById("chatTopicSelect").value);
  const topic = getCurrentTopic();
  chatHistory = []; // start a fresh guided session for the chosen topic
  dialogueStepIndex = 0;
  if (topic) {
    chatHistory.push({
      role: "bot",
      zh: `我们练习「${topic.title_zh}」吧！`,
      vi: `Cùng luyện chủ đề "${topic.title_vi}" nhé! Mục tiêu: ${topic.goals[0] || ""}`,
      en: `Let's practice the topic "${topic.title_vi}"! Goal: ${topic.goals[0] || ""}`,
    });
    // Kick off with the first line of the topic's real sample dialogue, so
    // the practice conversation follows a genuine, coherent script instead
    // of a random unrelated sentence.
    const firstLine = pickLocalChatReply("");
    if (firstLine) chatHistory.push({ role: "bot", zh: firstLine.zh, vi: firstLine.vi, en: firstLine.en });
  }
  renderChatMessages();
  saveChatHistory();
}
// HSK3 communication grammar points — pulled from real example sentences
// already in the app's own vocabulary, so the chatbot reinforces exactly
// the sentence patterns students are studying, not generic textbook lines.
const HSK3_TOPICS = [{"id": 1, "title_vi": "CHÀO HỎI & GIỚI THIỆU BẢN THÂN (MỞ RỘNG)", "title_zh": "问候与自我介绍", "goals": ["Chào hỏi, giới thiệu bản thân đầy đủ hơn: tên, tuổi, quê quán, nghề nghiệp, tính cách, sở thích, ước mơ.", "Hỏi – đáp thông tin cá nhân của người khác một cách lịch sự, tự nhiên.", "Diễn đạt lý do/mong muốn liên quan đến bản thân bằng câu ghép đơn giản."], "vocab": [["性格", "xìnggé", "personality, character", "tính cách"], ["外向", "wàixiàng", "outgoing, extroverted", "hướng ngoại"], ["内向", "nèixiàng", "introverted", "hướng nội"], ["爱好", "àihào", "hobby", "sở thích"], ["理想", "lǐxiǎng", "ideal, dream", "lý tưởng, ước mơ"], ["职业", "zhíyè", "occupation, profession", "nghề nghiệp"], ["聪明", "cōngming", "smart, clever", "thông minh"], ["认真", "rènzhēn", "serious, conscientious", "nghiêm túc, chăm chỉ"], ["害羞", "hàixiū", "shy", "ngại ngùng"], ["经历", "jīnglì", "experience", "kinh nghiệm, trải qua"]], "sentences": [{"zh": "我来自越南，是一名大学生。", "pinyin": "Wǒ láizì Yuènán, shì yì míng dàxuéshēng.", "en": "I come from Vietnam, I am a university student.", "vi": "Tôi đến từ Việt Nam, là một sinh viên đại học."}, {"zh": "我的性格比较外向，喜欢交朋友。", "pinyin": "Wǒ de xìnggé bǐjiào wàixiàng, xǐhuan jiāo péngyou.", "en": "My personality is quite outgoing, I like making friends.", "vi": "Tính cách của tôi khá hướng ngoại, thích kết bạn."}, {"zh": "我对中国文化很感兴趣。", "pinyin": "Wǒ duì Zhōngguó wénhuà hěn gǎn xìngqù.", "en": "I'm very interested in Chinese culture.", "vi": "Tôi rất hứng thú với văn hóa Trung Quốc."}, {"zh": "我的理想是当一名汉语老师。", "pinyin": "Wǒ de lǐxiǎng shì dāng yì míng Hànyǔ lǎoshī.", "en": "My dream is to become a Chinese teacher.", "vi": "Ước mơ của tôi là trở thành giáo viên tiếng Hán."}, {"zh": "能认识你，我很高兴。", "pinyin": "Néng rènshi nǐ, wǒ hěn gāoxìng.", "en": "I'm very happy to meet you.", "vi": "Được quen biết bạn, tôi rất vui."}, {"zh": "你平时有什么爱好？", "pinyin": "Nǐ píngshí yǒu shénme àihào?", "en": "What hobbies do you usually have?", "vi": "Bình thường bạn có sở thích gì?"}], "dialogue": ["A: 你好，我叫阮氏梅，请多关照。", "B: 你好，我叫王明，很高兴认识你。你是哪国人？", "A: 我是越南人，来这儿学习汉语。", "B: 你的性格怎么样？", "A: 我比较外向，喜欢跟朋友聊天、听音乐。你呢？", "B: 我有点儿内向，但是很爱运动。"]}, {"id": 2, "title_vi": "GIA ĐÌNH & NGƯỜI THÂN", "title_zh": "家庭与亲人", "goals": ["Giới thiệu các thành viên trong gia đình, nghề nghiệp, tuổi tác của họ.", "Miêu tả mối quan hệ, tình cảm giữa các thành viên trong gia đình.", "Kể về một sự việc/kỷ niệm liên quan đến gia đình bằng câu đơn giản."], "vocab": [["亲戚", "qīnqi", "relative", "họ hàng"], ["夫妻", "fūqī", "husband and wife, married couple", "vợ chồng"], ["照顾", "zhàogù", "to take care of", "chăm sóc"], ["长大", "zhǎngdà", "to grow up", "lớn lên"], ["关系", "guānxi", "relationship", "mối quan hệ"], ["严格", "yángé", "strict", "nghiêm khắc"], ["温柔", "wēnróu", "gentle, tender", "dịu dàng"], ["孝顺", "xiàoshùn", "filial, dutiful to parents", "hiếu thảo"], ["互相", "hùxiāng", "each other, mutually", "lẫn nhau"], ["支持", "zhīchí", "to support", "ủng hộ"]], "sentences": [{"zh": "我家一共有五口人。", "pinyin": "Wǒ jiā yígòng yǒu wǔ kǒu rén.", "en": "There are five people in my family altogether.", "vi": "Nhà tôi tổng cộng có 5 người."}, {"zh": "我爸爸对我很严格，但也很关心我。", "pinyin": "Wǒ bàba duì wǒ hěn yángé, dàn yě hěn guānxīn wǒ.", "en": "My father is very strict with me, but he also cares about me a lot.", "vi": "Bố tôi rất nghiêm khắc với tôi, nhưng cũng rất quan tâm tôi."}, {"zh": "妈妈每天都照顾我们的生活。", "pinyin": "Māma měitiān dōu zhàogù wǒmen de shēnghuó.", "en": "My mother takes care of our daily life every day.", "vi": "Mẹ hàng ngày đều chăm sóc cuộc sống của chúng tôi."}, {"zh": "我和哥哥的关系特别好。", "pinyin": "Wǒ hé gēge de guānxi tèbié hǎo.", "en": "My relationship with my older brother is especially good.", "vi": "Quan hệ giữa tôi và anh trai đặc biệt tốt."}, {"zh": "我是在爷爷奶奶身边长大的。", "pinyin": "Wǒ shì zài yéye nǎinai shēnbiān zhǎngdà de.", "en": "I grew up living with my grandparents.", "vi": "Tôi lớn lên bên cạnh ông bà nội."}, {"zh": "周末我们全家常常在一起吃饭。", "pinyin": "Zhōumò wǒmen quánjiā chángcháng zài yìqǐ chīfàn.", "en": "On weekends our whole family often eats together.", "vi": "Cuối tuần cả nhà chúng tôi thường ăn cơm cùng nhau."}], "dialogue": ["A: 你家有几口人？", "B: 我家有四口人：爸爸、妈妈、姐姐和我。", "A: 你爸爸妈妈做什么工作？", "B: 我爸爸是医生，妈妈是老师，他们工作都很忙。", "A: 那你们平时谁做饭？", "B: 一般是妈妈做饭，我周末也会帮忙。"]}, {"id": 3, "title_vi": "TRƯỜNG HỌC – HỌC TẬP – THI CỬ", "title_zh": "学校与学习", "goals": ["Nói về môn học, thời khóa biểu, giáo viên, kết quả học tập.", "Trao đổi ý kiến về phương pháp học tập, chuẩn bị cho kỳ thi.", "Bày tỏ khó khăn/thành tích trong học tập và xin lời khuyên."], "vocab": [["专业", "zhuānyè", "major, field of study", "chuyên ngành"], ["成绩", "chéngjì", "grade, result", "thành tích, điểm số"], ["复习", "fùxí", "to review", "ôn tập"], ["考试", "kǎoshì", "exam, test", "thi cử"], ["及格", "jígé", "to pass (a test)", "đạt (điểm)"], ["努力", "nǔlì", "to work hard, effort", "nỗ lực"], ["请假", "qǐngjià", "to ask for leave", "xin nghỉ phép"], ["同学", "tóngxué", "classmate", "bạn học"], ["提高", "tígāo", "to improve, raise", "nâng cao"], ["压力", "yālì", "pressure, stress", "áp lực"]], "sentences": [{"zh": "这学期我选了汉语和历史两门课。", "pinyin": "Zhè xuéqī wǒ xuǎn le Hànyǔ hé lìshǐ liǎng mén kè.", "en": "This semester I chose two courses: Chinese and history.", "vi": "Học kỳ này tôi chọn hai môn tiếng Hán và lịch sử."}, {"zh": "下星期就要考试了，我得好好复习。", "pinyin": "Xià xīngqī jiù yào kǎoshì le, wǒ děi hǎohǎo fùxí.", "en": "There's an exam next week, I have to review carefully.", "vi": "Tuần sau là thi rồi, tôi phải ôn tập cho kỹ."}, {"zh": "这次考试我考得不太好，有点儿担心。", "pinyin": "Zhè cì kǎoshì wǒ kǎo de bú tài hǎo, yǒudiǎnr dānxīn.", "en": "I didn't do very well on this exam, I'm a bit worried.", "vi": "Kỳ thi lần này tôi thi không tốt lắm, hơi lo lắng."}, {"zh": "老师，我可以请一天假吗？", "pinyin": "Lǎoshī, wǒ kěyǐ qǐng yì tiān jià ma?", "en": "Teacher, may I take a day off?", "vi": "Thưa thầy/cô, em có thể xin nghỉ một ngày được không ạ?"}, {"zh": "只要努力，成绩一定会提高的。", "pinyin": "Zhǐyào nǔlì, chéngjì yídìng huì tígāo de.", "en": "As long as you work hard, your grades will surely improve.", "vi": "Chỉ cần nỗ lực, thành tích chắc chắn sẽ được nâng cao."}, {"zh": "你觉得学汉语难不难？", "pinyin": "Nǐ juéde xué Hànyǔ nán bu nán?", "en": "Do you think learning Chinese is difficult?", "vi": "Bạn thấy học tiếng Hán có khó không?"}], "dialogue": ["A: 快考试了，你复习得怎么样了？", "B: 还没复习完，我觉得压力有点儿大。", "A: 别担心，我们一起复习吧，我可以帮你。", "B: 太好了，谢谢你！我们从语法开始复习吧。", "A: 好，先复习生词，再做练习题。", "B: 希望这次能考及格。"]}, {"id": 4, "title_vi": "CÔNG VIỆC – NGHỀ NGHIỆP", "title_zh": "工作与职业", "goals": ["Giới thiệu nghề nghiệp, nơi làm việc, công việc hàng ngày.", "Trao đổi về dự định nghề nghiệp tương lai, ưu – nhược điểm của công việc.", "Thực hiện hội thoại đơn giản trong tình huống phỏng vấn/xin việc cơ bản."], "vocab": [["公司", "gōngsī", "company", "công ty"], ["经理", "jīnglǐ", "manager", "giám đốc, quản lý"], ["同事", "tóngshì", "colleague", "đồng nghiệp"], ["工资", "gōngzī", "salary, wage", "lương"], ["面试", "miànshì", "interview", "phỏng vấn"], ["招聘", "zhāopìn", "to recruit", "tuyển dụng"], ["加班", "jiābān", "to work overtime", "làm thêm giờ"], ["经验", "jīngyàn", "experience", "kinh nghiệm"], ["辛苦", "xīnkǔ", "hard, toilsome", "vất vả"], ["适合", "shìhé", "to suit, be suitable for", "phù hợp"]], "sentences": [{"zh": "我大学毕业以后想在贸易公司工作。", "pinyin": "Wǒ dàxué bìyè yǐhòu xiǎng zài màoyì gōngsī gōngzuò.", "en": "After graduating from university, I want to work at a trading company.", "vi": "Sau khi tốt nghiệp đại học tôi muốn làm ở công ty thương mại."}, {"zh": "这份工作跟我的专业很适合。", "pinyin": "Zhè fèn gōngzuò gēn wǒ de zhuānyè hěn shìhé.", "en": "This job suits my major very well.", "vi": "Công việc này rất phù hợp với chuyên ngành của tôi."}, {"zh": "我的同事们都很热情，工作气氛很好。", "pinyin": "Wǒ de tóngshìmen dōu hěn rèqíng, gōngzuò qìfēn hěn hǎo.", "en": "My colleagues are all very warm, the working atmosphere is great.", "vi": "Đồng nghiệp của tôi đều rất nhiệt tình, không khí làm việc rất tốt."}, {"zh": "虽然工作很辛苦，但是我觉得很有意思。", "pinyin": "Suīrán gōngzuò hěn xīnkǔ, dànshì wǒ juéde hěn yǒu yìsi.", "en": "Although the work is tiring, I find it very interesting.", "vi": "Tuy công việc vất vả, nhưng tôi thấy rất thú vị."}, {"zh": "你有没有工作经验？", "pinyin": "Nǐ yǒu méiyǒu gōngzuò jīngyàn?", "en": "Do you have any work experience?", "vi": "Bạn có kinh nghiệm làm việc không?"}, {"zh": "我打算下个月去那家公司面试。", "pinyin": "Wǒ dǎsuàn xià ge yuè qù nà jiā gōngsī miànshì.", "en": "I plan to go to that company for an interview next month.", "vi": "Tôi định tháng sau đến công ty đó phỏng vấn."}], "dialogue": ["A: 你现在在哪儿工作？", "B: 我在一家旅行社当导游。", "A: 这份工作忙不忙？", "B: 挺忙的，特别是周末，但是我很喜欢跟不同的游客聊天。", "A: 工资高吗？", "B: 还可以，而且经理对我们都很好。"]}, {"id": 5, "title_vi": "SINH HOẠT HẰNG NGÀY – THÓI QUEN", "title_zh": "日常生活与习惯", "goals": ["Mô tả một ngày sinh hoạt bình thường theo trình tự thời gian.", "So sánh thói quen sinh hoạt giữa các ngày trong tuần/cuối tuần.", "Đưa ra lời khuyên về việc xây dựng thói quen sống lành mạnh."], "vocab": [["习惯", "xíguàn", "habit", "thói quen"], ["起床", "qǐchuáng", "to get up", "thức dậy"], ["按时", "ànshí", "on time", "đúng giờ"], ["一般", "yìbān", "generally, usually", "thông thường"], ["打扫", "dǎsǎo", "to clean, sweep", "dọn dẹp"], ["安排", "ānpái", "to arrange, schedule", "sắp xếp"], ["整理", "zhěnglǐ", "to tidy up, organize", "sắp xếp gọn gàng"], ["经常", "jīngcháng", "often, frequently", "thường xuyên"], ["懒", "lǎn", "lazy", "lười"], ["规律", "guīlǜ", "regular pattern", "điều độ, quy luật"]], "sentences": [{"zh": "我一般早上六点半起床。", "pinyin": "Wǒ yìbān zǎoshang liù diǎn bàn qǐchuáng.", "en": "I usually get up at 6:30 in the morning.", "vi": "Bình thường tôi dậy lúc 6 giờ rưỡi sáng."}, {"zh": "我每天都会安排好自己的时间。", "pinyin": "Wǒ měitiān dōu huì ānpái hǎo zìjǐ de shíjiān.", "en": "I arrange my own time every day.", "vi": "Mỗi ngày tôi đều sắp xếp thời gian cho mình."}, {"zh": "周末我喜欢在家打扫卫生、整理房间。", "pinyin": "Zhōumò wǒ xǐhuan zài jiā dǎsǎo wèishēng, zhěnglǐ fángjiān.", "en": "On weekends I like to clean and tidy up my room at home.", "vi": "Cuối tuần tôi thích dọn vệ sinh, sắp xếp phòng ở nhà."}, {"zh": "我的生活很有规律，很少熬夜。", "pinyin": "Wǒ de shēnghuó hěn yǒu guīlǜ, hěn shǎo áoyè.", "en": "My life is quite regular, I rarely stay up late.", "vi": "Cuộc sống của tôi rất điều độ, ít khi thức khuya."}, {"zh": "你平时几点睡觉？", "pinyin": "Nǐ píngshí jǐ diǎn shuìjiào?", "en": "What time do you usually go to sleep?", "vi": "Bình thường bạn mấy giờ đi ngủ?"}, {"zh": "我应该改掉晚睡的习惯。", "pinyin": "Wǒ yīnggāi gǎidiào wǎn shuì de xíguàn.", "en": "I should quit the habit of sleeping late.", "vi": "Tôi nên bỏ thói quen ngủ muộn."}], "dialogue": ["A: 你平时的生活习惯怎么样？", "B: 我每天六点起床，先跑步，然后吃早饭去上课。", "A: 晚上呢？", "B: 晚上我一般复习功课，十一点前睡觉。", "A: 你的生活真规律！", "B: 是啊，规律的生活让我每天都很有精神。"]}, {"id": 6, "title_vi": "ĂN UỐNG – NHÀ HÀNG – KHẨU VỊ", "title_zh": "饮食与餐厅", "goals": ["Gọi món tại nhà hàng, hỏi giá, yêu cầu đặc biệt (không cay, ít đường...).", "Miêu tả khẩu vị cá nhân và món ăn yêu thích/không thích.", "Nhận xét, đánh giá về một món ăn hoặc nhà hàng."], "vocab": [["味道", "wèidào", "taste, flavor", "hương vị"], ["点菜", "diǎncài", "to order food", "gọi món"], ["服务员", "fúwùyuán", "waiter, waitress", "nhân viên phục vụ"], ["清淡", "qīngdàn", "light (in flavor)", "thanh đạm, ít gia vị"], ["辣", "là", "spicy", "cay"], ["拿手菜", "náshǒucài", "specialty dish", "món tủ, món sở trường"], ["结账", "jiézhàng", "to pay the bill", "thanh toán"], ["新鲜", "xīnxiān", "fresh", "tươi"], ["合适", "héshì", "suitable, appropriate", "phù hợp"], ["营养", "yíngyǎng", "nutrition", "dinh dưỡng"]], "sentences": [{"zh": "服务员，麻烦点一下菜。", "pinyin": "Fúwùyuán, máfan diǎn yíxià cài.", "en": "Waiter, could we order please?", "vi": "Bạn phục vụ ơi, phiền cho tôi gọi món."}, {"zh": "这道菜有点儿辣，能不能不放辣椒？", "pinyin": "Zhè dào cài yǒudiǎnr là, néng bu néng bú fàng làjiāo?", "en": "This dish is a bit spicy, could you leave out the chili?", "vi": "Món này hơi cay, có thể không cho ớt được không?"}, {"zh": "我比较喜欢清淡一点儿的菜。", "pinyin": "Wǒ bǐjiào xǐhuan qīngdàn yìdiǎnr de cài.", "en": "I prefer lighter, less oily dishes.", "vi": "Tôi khá thích món ăn thanh đạm một chút."}, {"zh": "这家饭馆的鱼特别新鲜。", "pinyin": "Zhè jiā fànguǎn de yú tèbié xīnxiān.", "en": "The fish at this restaurant is especially fresh.", "vi": "Món cá của quán ăn này đặc biệt tươi."}, {"zh": "请问，可以结账了吗？", "pinyin": "Qǐngwèn, kěyǐ jiézhàng le ma?", "en": "Excuse me, could we get the bill?", "vi": "Xin hỏi, có thể thanh toán được chưa ạ?"}, {"zh": "你觉得这个味道怎么样？", "pinyin": "Nǐ juéde zhège wèidào zěnmeyàng?", "en": "What do you think of the taste of this dish?", "vi": "Bạn thấy hương vị này thế nào?"}], "dialogue": ["A: 服务员，我们想点菜。", "B: 好的，请问几位？想吃点儿什么？", "A: 来一个鱼香肉丝，一个青菜汤，米饭不要太多。", "B: 好，还需要别的吗？", "A: 不辣的哈，我不太能吃辣。", "B: 没问题，我告诉厨师少放辣椒。"]}, {"id": 7, "title_vi": "MUA SẮM – TIÊU DÙNG – GIÁ CẢ", "title_zh": "购物与消费", "goals": ["Hỏi giá, mặc cả, so sánh giá cả – chất lượng giữa các sản phẩm.", "Yêu cầu đổi/trả hàng, thử size, chọn màu sắc.", "Diễn đạt ý kiến về việc mua sắm hợp lý, tiết kiệm."], "vocab": [["打折", "dǎzhé", "to give a discount", "giảm giá"], ["便宜", "piányi", "cheap", "rẻ"], ["贵", "guì", "expensive", "đắt"], ["价格", "jiàgé", "price", "giá cả"], ["质量", "zhìliàng", "quality", "chất lượng"], ["换", "huàn", "to exchange, change", "đổi"], ["退", "tuì", "to return (goods)", "trả lại"], ["尺码", "chǐmǎ", "size", "kích cỡ"], ["购物", "gòuwù", "to shop", "mua sắm"], ["合算", "hésuàn", "worthwhile, cost-effective", "hời, đáng giá"]], "sentences": [{"zh": "这件衣服打八折，很便宜。", "pinyin": "Zhè jiàn yīfu dǎ bā zhé, hěn piányi.", "en": "This piece of clothing is 20% off, it's very cheap.", "vi": "Chiếc áo này giảm giá 20%, rất rẻ."}, {"zh": "能不能便宜一点儿？", "pinyin": "Néng bu néng piányi yìdiǎnr?", "en": "Could it be a little cheaper?", "vi": "Có thể rẻ hơn một chút được không?"}, {"zh": "这双鞋质量不错，就是有点儿贵。", "pinyin": "Zhè shuāng xié zhìliàng búcuò, jiùshì yǒudiǎnr guì.", "en": "This pair of shoes has good quality, it's just a bit expensive.", "vi": "Đôi giày này chất lượng khá tốt, chỉ là hơi đắt."}, {"zh": "我想换一个大一点儿的尺码。", "pinyin": "Wǒ xiǎng huàn yí ge dà yìdiǎnr de chǐmǎ.", "en": "I'd like to exchange it for a slightly bigger size.", "vi": "Tôi muốn đổi một cỡ to hơn một chút."}, {"zh": "如果不合适，可以退吗？", "pinyin": "Rúguǒ bù héshì, kěyǐ tuì ma?", "en": "If it doesn't fit, can I return it?", "vi": "Nếu không hợp có thể trả lại được không?"}, {"zh": "网上购物有时候更合算。", "pinyin": "Wǎngshàng gòuwù yǒushíhou gèng hésuàn.", "en": "Shopping online is sometimes more worthwhile.", "vi": "Mua sắm online đôi khi hời hơn."}], "dialogue": ["A: 老板，这条裙子多少钱？", "B: 原价三百，现在打七折，二百一。", "A: 能不能再便宜点儿？我很喜欢这个颜色。", "B: 好吧，看你是老顾客，就两百块吧。", "A: 谢谢！对了，如果尺码不合适可以换吗？", "B: 可以，一个星期内都能换。"]}, {"id": 8, "title_vi": "SỨC KHỎE – KHÁM BỆNH – THỂ DỤC", "title_zh": "健康与看病", "goals": ["Miêu tả triệu chứng bệnh, đi khám bác sĩ, hỏi mua thuốc.", "Đưa lời khuyên về giữ gìn sức khỏe, tập thể dục.", "Thể hiện sự quan tâm khi người khác bị ốm."], "vocab": [["感冒", "gǎnmào", "to catch a cold; a cold", "cảm cúm"], ["发烧", "fāshāo", "to have a fever", "sốt"], ["咳嗽", "késou", "to cough", "ho"], ["医院", "yīyuàn", "hospital", "bệnh viện"], ["打针", "dǎzhēn", "to get an injection", "tiêm"], ["吃药", "chīyào", "to take medicine", "uống thuốc"], ["锻炼", "duànliàn", "to exercise", "rèn luyện, tập thể dục"], ["休息", "xiūxi", "to rest", "nghỉ ngơi"], ["身体", "shēntǐ", "body, health", "cơ thể, sức khỏe"], ["恢复", "huīfù", "to recover", "hồi phục"]], "sentences": [{"zh": "我头疼，还有点儿发烧。", "pinyin": "Wǒ tóuténg, hái yǒudiǎnr fāshāo.", "en": "I have a headache, and I'm running a bit of a fever.", "vi": "Tôi bị đau đầu, còn hơi sốt."}, {"zh": "医生说我感冒了，需要多休息。", "pinyin": "Yīshēng shuō wǒ gǎnmào le, xūyào duō xiūxi.", "en": "The doctor said I have a cold and need more rest.", "vi": "Bác sĩ nói tôi bị cảm rồi, cần nghỉ ngơi nhiều."}, {"zh": "你最好按时吃药，多喝水。", "pinyin": "Nǐ zuìhǎo ànshí chīyào, duō hē shuǐ.", "en": "You'd better take your medicine on time and drink plenty of water.", "vi": "Bạn tốt nhất nên uống thuốc đúng giờ, uống nhiều nước."}, {"zh": "我每天早上都去公园锻炼身体。", "pinyin": "Wǒ měitiān zǎoshang dōu qù gōngyuán duànliàn shēntǐ.", "en": "I go to the park to exercise every morning.", "vi": "Mỗi sáng tôi đều ra công viên rèn luyện sức khỏe."}, {"zh": "希望你早点儿恢复健康。", "pinyin": "Xīwàng nǐ zǎodiǎnr huīfù jiànkāng.", "en": "I hope you recover soon.", "vi": "Mong bạn sớm hồi phục sức khỏe."}, {"zh": "你怎么了？脸色不太好。", "pinyin": "Nǐ zěnme le? Liǎnsè bú tài hǎo.", "en": "What's wrong with you? You don't look very well.", "vi": "Bạn sao vậy? Sắc mặt không được tốt lắm."}], "dialogue": ["A: 你脸色不太好，怎么了？", "B: 我从昨天晚上开始头疼、发烧。", "A: 那你去医院看医生了吗？", "B: 去了，医生说我感冒了，给我开了点儿药。", "A: 你要按时吃药，多喝水，好好休息。", "B: 谢谢你的关心，我会照顾好自己的。"]}, {"id": 9, "title_vi": "THỜI TIẾT – CÁC MÙA", "title_zh": "天气与季节", "goals": ["Miêu tả thời tiết hiện tại và dự báo, so sánh thời tiết các mùa.", "Nói về ảnh hưởng của thời tiết đến hoạt động, cảm xúc, trang phục.", "Đưa ra lời khuyên phù hợp với thời tiết (mang ô, mặc ấm...)."], "vocab": [["气温", "qìwēn", "air temperature", "nhiệt độ"], ["刮风", "guāfēng", "to be windy", "có gió"], ["下雪", "xiàxuě", "to snow", "có tuyết rơi"], ["季节", "jìjié", "season", "mùa"], ["凉快", "liángkuai", "cool (weather)", "mát mẻ"], ["暖和", "nuǎnhuo", "warm", "ấm áp"], ["天气预报", "tiānqì yùbào", "weather forecast", "dự báo thời tiết"], ["潮湿", "cháoshī", "damp, humid", "ẩm ướt"], ["温度", "wēndù", "temperature", "nhiệt độ"], ["带", "dài", "to bring, carry", "mang theo"]], "sentences": [{"zh": "今天天气预报说会下雨，你带伞了吗？", "pinyin": "Jīntiān tiānqì yùbào shuō huì xiàyǔ, nǐ dài sǎn le ma?", "en": "The weather forecast says it will rain today, did you bring an umbrella?", "vi": "Dự báo thời tiết hôm nay nói sẽ mưa, bạn mang ô chưa?"}, {"zh": "越南的夏天又热又潮湿。", "pinyin": "Yuènán de xiàtiān yòu rè yòu cháoshī.", "en": "Summer in Vietnam is both hot and humid.", "vi": "Mùa hè ở Việt Nam vừa nóng vừa ẩm."}, {"zh": "北京的冬天很冷，还经常下雪。", "pinyin": "Běijīng de dōngtiān hěn lěng, hái jīngcháng xiàxuě.", "en": "Winter in Beijing is very cold, and it often snows.", "vi": "Mùa đông Bắc Kinh rất lạnh, còn hay có tuyết rơi."}, {"zh": "今天刮大风，气温比昨天低多了。", "pinyin": "Jīntiān guā dàfēng, qìwēn bǐ zuótiān dī duō le.", "en": "It's very windy today, the temperature is much lower than yesterday.", "vi": "Hôm nay gió to, nhiệt độ thấp hơn hôm qua nhiều."}, {"zh": "秋天的天气最舒服，不冷也不热。", "pinyin": "Qiūtiān de tiānqì zuì shūfu, bù lěng yě bú rè.", "en": "Autumn weather is the most comfortable, neither cold nor hot.", "vi": "Thời tiết mùa thu dễ chịu nhất, không lạnh cũng không nóng."}, {"zh": "外面挺凉快的，我们出去走走吧。", "pinyin": "Wàimiàn tǐng liángkuai de, wǒmen chūqù zǒuzou ba.", "en": "It's quite cool outside, let's go for a walk.", "vi": "Bên ngoài khá mát mẻ, chúng ta ra ngoài đi dạo đi."}], "dialogue": ["A: 今天天气怎么样？", "B: 天气预报说下午会下雨，还会刮风。", "A: 那我得带把伞了。你喜欢哪个季节？", "B: 我最喜欢秋天，不冷也不热，很舒服。", "A: 我比较喜欢冬天，可以看雪。", "B: 是啊，可是冬天太冷了，我不太习惯。"]}, {"id": 10, "title_vi": "GIAO THÔNG – HỎI ĐƯỜNG – ĐI LẠI", "title_zh": "交通与问路", "goals": ["Hỏi đường, chỉ đường, miêu tả vị trí bằng phương hướng đơn giản.", "Nói về các phương tiện giao thông và cách di chuyển trong thành phố.", "Xử lý tình huống mua vé, chuyển tuyến, bị lạc đường."], "vocab": [["地铁", "dìtiě", "subway", "tàu điện ngầm"], ["公共汽车", "gōnggòng qìchē", "bus", "xe buýt"], ["堵车", "dǔchē", "traffic jam", "tắc đường"], ["方向", "fāngxiàng", "direction", "phương hướng"], ["拐弯", "guǎiwān", "to turn (a corner)", "rẽ"], ["路口", "lùkǒu", "intersection", "ngã tư, giao lộ"], ["直走", "zhízǒu", "go straight", "đi thẳng"], ["站", "zhàn", "station, stop", "trạm, bến"], ["迷路", "mílù", "to get lost", "lạc đường"], ["方便", "fāngbiàn", "convenient", "tiện lợi"]], "sentences": [{"zh": "请问，去火车站怎么走？", "pinyin": "Qǐngwèn, qù huǒchēzhàn zěnme zǒu?", "en": "Excuse me, how do I get to the train station?", "vi": "Xin hỏi, đến ga tàu đi thế nào?"}, {"zh": "一直往前走，到路口往右拐就到了。", "pinyin": "Yìzhí wǎng qián zǒu, dào lùkǒu wǎng yòu guǎi jiù dào le.", "en": "Go straight ahead, then turn right at the intersection and you're there.", "vi": "Đi thẳng về phía trước, đến ngã tư rẽ phải là tới."}, {"zh": "坐地铁比坐公共汽车方便多了。", "pinyin": "Zuò dìtiě bǐ zuò gōnggòng qìchē fāngbiàn duō le.", "en": "Taking the subway is much more convenient than taking the bus.", "vi": "Đi tàu điện ngầm tiện lợi hơn nhiều so với xe buýt."}, {"zh": "今天路上堵车，我可能要晚一点儿到。", "pinyin": "Jīntiān lùshang dǔchē, wǒ kěnéng yào wǎn yìdiǎnr dào.", "en": "There's a traffic jam today, I might arrive a bit late.", "vi": "Hôm nay đường tắc, tôi có thể sẽ đến muộn một chút."}, {"zh": "不好意思，我好像迷路了。", "pinyin": "Bù hǎoyìsi, wǒ hǎoxiàng mílù le.", "en": "Excuse me, I think I'm lost.", "vi": "Xin lỗi, hình như tôi bị lạc đường rồi."}, {"zh": "从这儿到学校大概要二十分钟。", "pinyin": "Cóng zhèr dào xuéxiào dàgài yào èrshí fēnzhōng.", "en": "It takes about 20 minutes from here to school.", "vi": "Từ đây đến trường khoảng 20 phút."}], "dialogue": ["A: 请问，去图书馆怎么走？", "B: 你先一直往前走，看到路口往左拐。", "A: 走多久能到？", "B: 不远，大概走十分钟就到了。", "A: 太好了，谢谢你！", "B: 不客气，路上小心。"]}, {"id": 11, "title_vi": "DU LỊCH – KHÁCH SẠN – THAM QUAN", "title_zh": "旅游与住宿", "goals": ["Đặt phòng khách sạn, hỏi về tiện nghi, giá phòng.", "Lên kế hoạch du lịch, giới thiệu địa điểm tham quan.", "Kể lại trải nghiệm một chuyến du lịch đã qua."], "vocab": [["旅行", "lǚxíng", "to travel", "du lịch"], ["订", "dìng", "to book, reserve", "đặt (phòng, vé)"], ["房间", "fángjiān", "room", "phòng"], ["景点", "jǐngdiǎn", "tourist attraction", "điểm tham quan"], ["护照", "hùzhào", "passport", "hộ chiếu"], ["签证", "qiānzhèng", "visa", "visa"], ["行李", "xínglǐ", "luggage", "hành lý"], ["导游", "dǎoyóu", "tour guide", "hướng dẫn viên"], ["风景", "fēngjǐng", "scenery", "phong cảnh"], ["难忘", "nánwàng", "unforgettable", "khó quên"]], "sentences": [{"zh": "我想订一个双人房，住三个晚上。", "pinyin": "Wǒ xiǎng dìng yí ge shuāngrénfáng, zhù sān ge wǎnshang.", "en": "I'd like to book a double room for three nights.", "vi": "Tôi muốn đặt một phòng đôi, ở 3 đêm."}, {"zh": "这次旅行我们打算去桂林看风景。", "pinyin": "Zhè cì lǚxíng wǒmen dǎsuàn qù Guìlín kàn fēngjǐng.", "en": "On this trip we plan to go to Guilin to see the scenery.", "vi": "Chuyến du lịch lần này chúng tôi định đi Quế Lâm ngắm cảnh."}, {"zh": "出国旅游要先办护照和签证。", "pinyin": "Chūguó lǚyóu yào xiān bàn hùzhào hé qiānzhèng.", "en": "To travel abroad you need to get a passport and visa first.", "vi": "Đi du lịch nước ngoài phải làm hộ chiếu và visa trước."}, {"zh": "导游给我们介绍了很多有名的景点。", "pinyin": "Dǎoyóu gěi wǒmen jièshào le hěn duō yǒumíng de jǐngdiǎn.", "en": "The tour guide introduced us to many famous attractions.", "vi": "Hướng dẫn viên đã giới thiệu cho chúng tôi rất nhiều điểm tham quan nổi tiếng."}, {"zh": "这次旅行给我留下了难忘的回忆。", "pinyin": "Zhè cì lǚxíng gěi wǒ liúxià le nánwàng de huíyì.", "en": "This trip left me with unforgettable memories.", "vi": "Chuyến du lịch lần này đã để lại cho tôi ký ức khó quên."}, {"zh": "请问酒店附近有没有好吃的餐厅？", "pinyin": "Qǐngwèn jiǔdiàn fùjìn yǒu méiyǒu hǎochī de cāntīng?", "en": "Excuse me, are there any good restaurants near the hotel?", "vi": "Xin hỏi gần khách sạn có nhà hàng ngon không?"}], "dialogue": ["A: 你好，我想订一个房间，这个周末入住。", "B: 好的，您要单人房还是双人房？", "A: 双人房，住两个晚上。附近有什么景点吗？", "B: 有，走路十分钟就能到有名的古镇。", "A: 太好了，那我们订下了。", "B: 好的，请留一下您的姓名和电话。"]}, {"id": 12, "title_vi": "ĐIỆN THOẠI – HẸN GẶP – LỊCH TRÌNH", "title_zh": "打电话与约会", "goals": ["Thực hiện cuộc gọi điện thoại: chào hỏi, để lại lời nhắn, xác nhận thông tin.", "Hẹn gặp, thay đổi/hủy lịch hẹn, sắp xếp thời gian phù hợp.", "Diễn đạt sự đồng ý/từ chối lời mời một cách lịch sự."], "vocab": [["打电话", "dǎ diànhuà", "to make a phone call", "gọi điện thoại"], ["约", "yuē", "to make an appointment, invite", "hẹn"], ["方便", "fāngbiàn", "convenient", "tiện, thuận tiện"], ["改", "gǎi", "to change", "thay đổi"], ["取消", "qǔxiāo", "to cancel", "hủy bỏ"], ["留言", "liúyán", "to leave a message", "để lại lời nhắn"], ["准时", "zhǔnshí", "punctual, on time", "đúng giờ"], ["迟到", "chídào", "to be late", "đến muộn"], ["联系", "liánxì", "to contact", "liên lạc"], ["确认", "quèrèn", "to confirm", "xác nhận"]], "sentences": [{"zh": "喂，请问王老师在吗？", "pinyin": "Wéi, qǐngwèn Wáng lǎoshī zài ma?", "en": "Hello, is Teacher Wang there?", "vi": "A lô, xin hỏi cô Vương có ở đó không?"}, {"zh": "我们约明天下午三点见面，方便吗？", "pinyin": "Wǒmen yuē míngtiān xiàwǔ sān diǎn jiànmiàn, fāngbiàn ma?", "en": "We agreed to meet tomorrow at 3pm, is that convenient?", "vi": "Chúng ta hẹn 3 giờ chiều mai gặp mặt, tiện không?"}, {"zh": "不好意思，我可能要迟到十分钟。", "pinyin": "Bù hǎoyìsi, wǒ kěnéng yào chídào shí fēnzhōng.", "en": "Sorry, I might be about 10 minutes late.", "vi": "Xin lỗi, tôi có thể sẽ đến muộn 10 phút."}, {"zh": "因为有事，我们的约会得改到周末了。", "pinyin": "Yīnwèi yǒu shì, wǒmen de yuēhuì děi gǎidào zhōumò le.", "en": "Because something came up, we had to change our appointment to the weekend.", "vi": "Vì có việc, cuộc hẹn của chúng ta phải đổi sang cuối tuần rồi."}, {"zh": "他不在，需要我帮您留言吗？", "pinyin": "Tā bú zài, xūyào wǒ bāng nín liúyán ma?", "en": "He's not here, would you like me to take a message for you?", "vi": "Anh ấy không có ở đây, có cần tôi giúp anh/chị để lại lời nhắn không?"}, {"zh": "好的，就这么说定了，不见不散。", "pinyin": "Hǎo de, jiù zhème shuōdìng le, bú jiàn bú sàn.", "en": "Okay, it's settled then, see you there for sure.", "vi": "Được, vậy quyết định thế nhé, không gặp không về."}], "dialogue": ["A: 喂，是小李吗？我是小张。", "B: 是我，你好，有什么事吗？", "A: 这周六有空吗？我们一起去看电影吧。", "B: 周六下午可以，上午我要上课。", "A: 好，那我们下午两点在电影院门口见，行吗？", "B: 没问题，到时候见！"]}, {"id": 13, "title_vi": "SỞ THÍCH – GIẢI TRÍ – THỂ THAO", "title_zh": "爱好、娱乐与运动", "goals": ["Nói về sở thích cá nhân, hoạt động giải trí thường làm khi rảnh rỗi.", "Bàn luận về môn thể thao yêu thích, tần suất tập luyện.", "Mời bạn bè cùng tham gia hoạt động giải trí/thể thao."], "vocab": [["运动", "yùndòng", "sport, exercise", "vận động, thể thao"], ["篮球", "lánqiú", "basketball", "bóng rổ"], ["游泳", "yóuyǒng", "to swim", "bơi lội"], ["音乐会", "yīnyuèhuì", "concert", "buổi hòa nhạc"], ["电影院", "diànyǐngyuàn", "cinema", "rạp chiếu phim"], ["空闲", "kòngxián", "free time, spare time", "rảnh rỗi"], ["有意思", "yǒu yìsi", "interesting", "thú vị"], ["表演", "biǎoyǎn", "performance", "biểu diễn"], ["比赛", "bǐsài", "competition, match", "thi đấu"], ["坚持", "jiānchí", "to persist, insist", "kiên trì"]], "sentences": [{"zh": "我周末空闲的时候喜欢打篮球。", "pinyin": "Wǒ zhōumò kòngxián de shíhou xǐhuan dǎ lánqiú.", "en": "When I'm free on weekends, I like playing basketball.", "vi": "Cuối tuần rảnh rỗi tôi thích chơi bóng rổ."}, {"zh": "她每天坚持游泳一个小时。", "pinyin": "Tā měitiān jiānchí yóuyǒng yí ge xiǎoshí.", "en": "She keeps swimming for an hour every day.", "vi": "Cô ấy mỗi ngày kiên trì bơi 1 tiếng."}, {"zh": "这场比赛非常精彩，大家都很兴奋。", "pinyin": "Zhè chǎng bǐsài fēicháng jīngcǎi, dàjiā dōu hěn xīngfèn.", "en": "This match was very exciting, everyone was thrilled.", "vi": "Trận đấu này rất tinh chấp, mọi người đều rất hào hứng."}, {"zh": "晚上我们一起去看音乐会，怎么样？", "pinyin": "Wǎnshang wǒmen yìqǐ qù kàn yīnyuèhuì, zěnmeyàng?", "en": "Shall we go to a concert together tonight?", "vi": "Tối nay chúng ta cùng đi xem hòa nhạc, thế nào?"}, {"zh": "这部电影很有意思，值得一看。", "pinyin": "Zhè bù diànyǐng hěn yǒu yìsi, zhíde yí kàn.", "en": "This movie is very interesting, worth watching.", "vi": "Bộ phim này rất thú vị, đáng xem."}, {"zh": "除了运动，我还喜欢画画儿。", "pinyin": "Chúle yùndòng, wǒ hái xǐhuan huàhuàr.", "en": "Besides sports, I also like painting.", "vi": "Ngoài thể thao, tôi còn thích vẽ tranh."}], "dialogue": ["A: 你平时有什么爱好？", "B: 我喜欢运动，特别是打篮球和游泳。", "A: 那你参加过比赛吗？", "B: 参加过，去年我们班还得了第一名呢！", "A: 太厉害了！这个周末要不要一起打球？", "B: 好啊，我正想找人一起运动呢。"]}, {"id": 14, "title_vi": "CẢM XÚC – TÍNH CÁCH – GIAO TIẾP XÃ HỘI", "title_zh": "情感、性格与社交礼仪", "goals": ["Diễn đạt cảm xúc (vui, buồn, lo lắng, tức giận...) và nguyên nhân.", "Sử dụng các câu khen ngợi, an ủi, xin lỗi, cảm ơn, từ chối phù hợp.", "Giải quyết tình huống bất đồng nhỏ trong giao tiếp một cách lịch sự."], "vocab": [["高兴", "gāoxìng", "happy", "vui vẻ"], ["难过", "nánguò", "sad", "buồn"], ["紧张", "jǐnzhāng", "nervous", "căng thẳng, hồi hộp"], ["生气", "shēngqì", "angry", "tức giận"], ["安慰", "ānwèi", "to comfort", "an ủi"], ["道歉", "dàoqiàn", "to apologize", "xin lỗi"], ["原谅", "yuánliàng", "to forgive", "tha thứ"], ["拒绝", "jùjué", "to refuse", "từ chối"], ["羡慕", "xiànmù", "to envy, admire", "ngưỡng mộ"], ["理解", "lǐjiě", "to understand", "thấu hiểu"]], "sentences": [{"zh": "听到这个消息，我特别高兴。", "pinyin": "Tīngdào zhège xiāoxi, wǒ tèbié gāoxìng.", "en": "Hearing this news, I was especially happy.", "vi": "Nghe được tin này, tôi đặc biệt vui."}, {"zh": "别难过了，事情会好起来的。", "pinyin": "Bié nánguò le, shìqing huì hǎo qǐlai de.", "en": "Don't be sad, things will get better.", "vi": "Đừng buồn nữa, mọi chuyện sẽ tốt lên thôi."}, {"zh": "真对不起，是我不小心弄错了。", "pinyin": "Zhēn duìbuqǐ, shì wǒ bù xiǎoxīn nòngcuò le.", "en": "I'm really sorry, it was my carelessness that caused the mistake.", "vi": "Thật xin lỗi, là do tôi bất cẩn làm sai."}, {"zh": "没关系，我理解你的想法。", "pinyin": "Méi guānxi, wǒ lǐjiě nǐ de xiǎngfǎ.", "en": "It's okay, I understand how you feel.", "vi": "Không sao, tôi hiểu suy nghĩ của bạn."}, {"zh": "谢谢你一直支持我，我很感动。", "pinyin": "Xièxie nǐ yìzhí zhīchí wǒ, wǒ hěn gǎndòng.", "en": "Thank you for always supporting me, I'm very touched.", "vi": "Cảm ơn bạn luôn ủng hộ tôi, tôi rất cảm động."}, {"zh": "不好意思，这次我可能要拒绝你了。", "pinyin": "Bù hǎoyìsi, zhè cì wǒ kěnéng yào jùjué nǐ le.", "en": "I'm sorry, I might have to turn you down this time.", "vi": "Xin lỗi, lần này tôi có lẽ phải từ chối bạn rồi."}], "dialogue": ["A: 你怎么了？看起来不太开心。", "B: 今天考试没考好，我有点儿难过。", "A: 别难过，一次考试说明不了什么，下次努力就好了。", "B: 谢谢你安慰我，我心里好受多了。", "A: 晚上要不要一起出去走走，放松一下？", "B: 好啊，谢谢你的关心。"]}, {"id": 15, "title_vi": "NHÀ Ở – MÔI TRƯỜNG SỐNG – HÀNG XÓM", "title_zh": "住房与生活环境", "goals": ["Miêu tả nhà/phòng ở, nội thất, khu vực xung quanh.", "Trao đổi về việc thuê nhà, tìm nhà ở phù hợp.", "Nói về mối quan hệ với hàng xóm, môi trường sống."], "vocab": [["房租", "fángzū", "rent", "tiền thuê nhà"], ["家具", "jiājù", "furniture", "đồ nội thất"], ["安静", "ānjìng", "quiet", "yên tĩnh"], ["附近", "fùjìn", "nearby", "gần đây"], ["邻居", "línjū", "neighbor", "hàng xóm"], ["搬家", "bānjiā", "to move house", "chuyển nhà"], ["方便", "fāngbiàn", "convenient", "thuận tiện"], ["楼", "lóu", "building, floor", "tầng, tòa nhà"], ["环境", "huánjìng", "environment", "môi trường"], ["宽敞", "kuānchang", "spacious", "rộng rãi"]], "sentences": [{"zh": "我现在租的房子离学校很近。", "pinyin": "Wǒ xiànzài zū de fángzi lí xuéxiào hěn jìn.", "en": "The house I'm renting now is very close to school.", "vi": "Nhà tôi đang thuê rất gần trường."}, {"zh": "这套房子的家具都是新的，很干净。", "pinyin": "Zhè tào fángzi de jiājù dōu shì xīn de, hěn gānjìng.", "en": "The furniture in this apartment is all new, very clean.", "vi": "Đồ nội thất của căn nhà này đều mới, rất sạch sẽ."}, {"zh": "附近有超市和公园，生活很方便。", "pinyin": "Fùjìn yǒu chāoshì hé gōngyuán, shēnghuó hěn fāngbiàn.", "en": "There's a supermarket and a park nearby, life is very convenient.", "vi": "Gần đây có siêu thị và công viên, cuộc sống rất thuận tiện."}, {"zh": "我的邻居人很好，经常互相帮助。", "pinyin": "Wǒ de línjū rén hěn hǎo, jīngcháng hùxiāng bāngzhù.", "en": "My neighbors are very nice, we often help each other.", "vi": "Hàng xóm của tôi rất tốt, thường giúp đỡ lẫn nhau."}, {"zh": "下个月我打算搬到市中心去住。", "pinyin": "Xià ge yuè wǒ dǎsuàn bāndào shì zhōngxīn qù zhù.", "en": "Next month I plan to move to live downtown.", "vi": "Tháng sau tôi định chuyển vào trung tâm thành phố ở."}, {"zh": "这个房间虽然不大，但是很宽敞舒适。", "pinyin": "Zhège fángjiān suīrán bú dà, dànshì hěn kuānchang shūshì.", "en": "Although this room isn't big, it's spacious and comfortable.", "vi": "Căn phòng này tuy không lớn, nhưng rất rộng rãi thoải mái."}], "dialogue": ["A: 听说你要搬家了？", "B: 是啊，我找到了一个离公司更近的房子。", "A: 房租贵不贵？", "B: 不算贵，而且家具都已经准备好了，很方便。", "A: 附近环境怎么样？", "B: 挺安静的，邻居也都很友好。"]}, {"id": 16, "title_vi": "LỄ HỘI – PHONG TỤC – VĂN HÓA TRUNG QUỐC", "title_zh": "节日、风俗与中国文化", "goals": ["Giới thiệu các ngày lễ, tết truyền thống của Trung Quốc và Việt Nam.", "So sánh phong tục, tập quán giữa hai nền văn hóa.", "Diễn đạt cảm nhận, chúc mừng nhân dịp lễ tết."], "vocab": [["春节", "Chūnjié", "Spring Festival (Lunar New Year)", "Tết Nguyên đán"], ["中秋节", "Zhōngqiūjié", "Mid-Autumn Festival", "Tết Trung thu"], ["习俗", "xísú", "custom", "phong tục"], ["传统", "chuántǒng", "tradition", "truyền thống"], ["庆祝", "qìngzhù", "to celebrate", "chúc mừng, ăn mừng"], ["红包", "hóngbāo", "red envelope (lucky money)", "phong bao lì xì"], ["团圆", "tuányuán", "reunion", "đoàn viên"], ["祝福", "zhùfú", "blessing", "chúc phúc"], ["热闹", "rènao", "lively, bustling", "náo nhiệt"], ["文化", "wénhuà", "culture", "văn hóa"]], "sentences": [{"zh": "春节是中国最重要的传统节日。", "pinyin": "Chūnjié shì Zhōngguó zuì zhòngyào de chuántǒng jiéri.", "en": "Spring Festival is China's most important traditional holiday.", "vi": "Tết Nguyên đán là ngày lễ truyền thống quan trọng nhất của Trung Quốc."}, {"zh": "过年的时候，家人们会团聚在一起吃年夜饭。", "pinyin": "Guònián de shíhou, jiārénmen huì tuánjù zài yìqǐ chī niányèfàn.", "en": "During the New Year, family members reunite to eat the New Year's Eve dinner together.", "vi": "Vào dịp Tết, người thân sẽ đoàn tụ cùng nhau ăn cơm tất niên."}, {"zh": "长辈常常会给孩子们发红包。", "pinyin": "Zhǎngbèi chángcháng huì gěi háizimen fā hóngbāo.", "en": "Elders often give red envelopes to children.", "vi": "Người lớn thường phát phong bao lì xì cho trẻ con."}, {"zh": "中秋节的时候，人们喜欢一边赏月一边吃月饭。", "pinyin": "Zhōngqiūjié de shíhou, rénmen xǐhuan yìbiān shǎngyuè yìbiān chī yuèbǐng.", "en": "During the Mid-Autumn Festival, people like to enjoy the moon while eating mooncakes.", "vi": "Vào Tết Trung thu, mọi người thích vừa ngắm trăng vừa ăn bánh trung thu."}, {"zh": "越南和中国的节日习俗有不少相似的地方。", "pinyin": "Yuènán hé Zhōngguó de jiérì xísú yǒu bùshǎo xiāngsì de dìfang.", "en": "There are quite a few similarities between the holiday customs of Vietnam and China.", "vi": "Phong tục ngày lễ của Việt Nam và Trung Quốc có nhiều điểm tương đồng."}, {"zh": "祝你新年快乐，万事如意！", "pinyin": "Zhù nǐ xīnnián kuàilè, wànshì rúyì!", "en": "Happy New Year, may everything go well for you!", "vi": "Chúc bạn năm mới vui vẻ, vạn sự như ý!"}], "dialogue": ["A: 越南也过春节吗？", "B: 过，我们叫“元旦节”，跟中国的春节很像。", "A: 你们过节的时候有什么习俗？", "B: 家人会团聚吃饭，长辈也会给孩子红包。", "A: 听起来跟中国的习俗差不多。", "B: 是啊，不过我们的饮食和装饰有一些不同。"]}, {"id": 17, "title_vi": "THÀNH PHỐ – PHƯƠNG HƯỚNG – MÔ TẢ ĐỊA ĐIỂM", "title_zh": "城市与方位描述", "goals": ["Miêu tả một thành phố/địa điểm: vị trí, đặc điểm nổi bật.", "So sánh giữa thành phố và nông thôn, giữa các thành phố.", "Sử dụng từ chỉ phương hướng để mô tả vị trí sự vật."], "vocab": [["城市", "chéngshì", "city", "thành phố"], ["农村", "nóngcūn", "countryside, rural area", "nông thôn"], ["安静", "ānjìng", "quiet", "yên tĩnh"], ["热闹", "rènao", "lively, bustling", "náo nhiệt"], ["人口", "rénkǒu", "population", "dân số"], ["位于", "wèiyú", "located at", "nằm ở, tọa lạc"], ["附近", "fùjìn", "nearby", "gần đó"], ["特点", "tèdiǎn", "characteristic, feature", "đặc điểm"], ["中心", "zhōngxīn", "center", "trung tâm"], ["方便", "fāngbiàn", "convenient", "tiện lợi"]], "sentences": [{"zh": "胡志明市是越南最大的城市。", "pinyin": "Húzhìmíng Shì shì Yuènán zuì dà de chéngshì.", "en": "Ho Chi Minh City is the largest city in Vietnam.", "vi": "Thành phố Hồ Chí Minh là thành phố lớn nhất Việt Nam."}, {"zh": "这个城市位于河边，风景很美。", "pinyin": "Zhège chéngshì wèiyú hébiān, fēngjǐng hěn měi.", "en": "This city is located by the river, the scenery is very beautiful.", "vi": "Thành phố này nằm bên bờ sông, phong cảnh rất đẹp."}, {"zh": "城市生活很方便，但是有点儿吵。", "pinyin": "Chéngshì shēnghuó hěn fāngbiàn, dànshì yǒudiǎnr chǎo.", "en": "City life is very convenient, but a bit noisy.", "vi": "Cuộc sống thành phố rất tiện lợi, nhưng hơi ồn."}, {"zh": "农村的空气比城市新鲜多了。", "pinyin": "Nóngcūn de kōngqì bǐ chéngshì xīnxian duō le.", "en": "The air in the countryside is much fresher than in the city.", "vi": "Không khí ở nông thôn trong lành hơn thành phố nhiều."}, {"zh": "图书馆就在体育馆的旁边。", "pinyin": "Túshūguǎn jiù zài tǐyùguǎn de pángbiān.", "en": "The library is right next to the stadium.", "vi": "Thư viện nằm ngay cạnh nhà thi đấu."}, {"zh": "市中心到处都很热闹。", "pinyin": "Shì zhōngxīn dàochù dōu hěn rènao.", "en": "Downtown is bustling everywhere.", "vi": "Trung tâm thành phố ở đâu cũng náo nhiệt."}], "dialogue": ["A: 你觉得住在城市好还是农村好？", "B: 各有各的好处。城市方便，但是农村更安静。", "A: 你家附近的环境怎么样？", "B: 我家附近有公园和商场，生活很方便。", "A: 那你喜欢现在住的地方吗？", "B: 挺喜欢的，虽然有点儿热闹，但是很方便。"]}, {"id": 18, "title_vi": "CÔNG NGHỆ – MẠNG – ĐỜI SỐNG SỐ CƠ BẢN", "title_zh": "科技与网络生活", "goals": ["Nói về việc sử dụng điện thoại thông minh, mạng xã hội trong cuộc sống.", "Trao đổi ý kiến về lợi ích/tác hại của công nghệ, internet.", "Thực hiện các thao tác giao tiếp cơ bản qua ứng dụng nhắn tin, mua sắm online."], "vocab": [["手机", "shǒujī", "mobile phone", "điện thoại di động"], ["网络", "wǎngluò", "internet, network", "mạng internet"], ["软件", "ruǎnjiàn", "software, app", "phần mềm, ứng dụng"], ["下载", "xiàzài", "to download", "tải xuống"], ["发消息", "fā xiāoxi", "to send a message", "gửi tin nhắn"], ["视频", "shìpín", "video", "video, gọi video"], ["上网", "shàngwǎng", "to go online", "lên mạng"], ["密码", "mìmǎ", "password", "mật khẩu"], ["联系人", "liánxìrén", "contact (person)", "danh bạ"], ["方便", "fāngbiàn", "convenient", "tiện lợi"]], "sentences": [{"zh": "现在我们可以用手机在网上买东西。", "pinyin": "Xiànzài wǒmen kěyǐ yòng shǒujī zài wǎngshàng mǎi dōngxi.", "en": "Now we can use our phones to buy things online.", "vi": "Bây giờ chúng ta có thể dùng điện thoại mua đồ trên mạng."}, {"zh": "我经常用手机跟国外的朋友视频聊天。", "pinyin": "Wǒ jīngcháng yòng shǒujī gēn guówài de péngyou shìpín liáotiān.", "en": "I often video chat with friends abroad using my phone.", "vi": "Tôi thường dùng điện thoại gọi video trò chuyện với bạn bè ở nước ngoài."}, {"zh": "这个软件下载以后，需要注册账号。", "pinyin": "Zhège ruǎnjiàn xiàzài yǐhòu, xūyào zhùcè zhànghào.", "en": "After downloading this app, you need to register an account.", "vi": "Sau khi tải phần mềm này về, cần đăng ký tài khoản."}, {"zh": "长时间上网对身体不太好。", "pinyin": "Cháng shíjiān shàngwǎng duì shēntǐ bú tài hǎo.", "en": "Being online for a long time isn't very good for your health.", "vi": "Lên mạng thời gian dài không tốt cho sức khỏe lắm."}, {"zh": "我忘了密码，登录不了了。", "pinyin": "Wǒ wàng le mìmǎ, dēnglù bù liǎo le.", "en": "I forgot my password, I can't log in.", "vi": "Tôi quên mật khẩu rồi, không đăng nhập được."}, {"zh": "有了网络，跟朋友联系方便多了。", "pinyin": "Yǒu le wǎngluò, gēn péngyou liánxì fāngbiàn duō le.", "en": "With the internet, staying in touch with friends is much more convenient.", "vi": "Có mạng internet, liên lạc với bạn bè tiện hơn nhiều."}], "dialogue": ["A: 你平时用什么软件跟朋友联系？", "B: 我一般用微信，可以发消息也可以视频聊天。", "A: 你觉得手机对生活的影响大吗？", "B: 很大，现在买东西、查资料都离不开手机。", "A: 不过用得太多好像也不太好。", "B: 是的，所以我尽量控制上网的时间。"]}];
const HSK3_GRAMMAR_POINTS = [
  { pattern: "虽然...但是 (tuy...nhưng)", example: "虽然很远，但是他每天走路。" },
  { pattern: "因为...所以 (vì...nên)", example: "因为堵车，所以他来晚了。" },
  { pattern: "如果...就 (nếu...thì)", example: "如果明天下雨，我们就不去了。" },
  { pattern: "不但...而且 (không những...mà còn)", example: "他不但聪明，而且努力。" },
  { pattern: "先...再 (trước...rồi sau đó)", example: "我们先吃饭，然后再看电影。" },
  { pattern: "一边...一边 (vừa...vừa)", example: "他一边吃饭一边看电视。" },
  { pattern: "越来越 / 越...越 (càng ngày càng / càng...càng)", example: "天气越来越冷了。他越努力，成绩越好。" },
  { pattern: "只有...才 (chỉ có...mới)", example: "只有努力，才能成功。" },
  { pattern: "一...就 (vừa...là/liền)", example: "这道题很容易，我一下就会了。" },
  { pattern: "除了...还 (ngoài...còn)", example: "除了学习，他还喜欢运动。" },
  { pattern: "为了 (để, vì mục đích)", example: "为了健康，他每天锻炼。" },
  { pattern: "把字句 (câu chữ 把 — nhấn mạnh tác động lên vật)", example: "请把杯子放在桌子上。" },
  { pattern: "被字句 (câu chữ 被 — bị động)", example: "我的手机被弟弟拿走了。" },
];
function getChatGrammarPoints() {
  return HSK3_GRAMMAR_POINTS.map(g => `${g.pattern} — ví dụ: "${g.example}"`).join("\n");
}
function getChatVocabList() {
  // Compact "char (pinyin) meaning" list keeps the system prompt small
  // while still constraining the model to known vocabulary.
  return VOCAB.map(w => `${w.char}(${w.pinyin})`).join("、");
}
function loadChatHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem("pandahan_chat_v1_" + storageNamespace())) || {};
    if (Array.isArray(saved)) return saved; // backward compat with older format
    currentChatTopicId = saved.topicId || 0;
    return saved.messages || [];
  } catch (e) { return []; }
}
function saveChatHistory() {
  localStorage.setItem("pandahan_chat_v1_" + storageNamespace(), JSON.stringify({ topicId: currentChatTopicId, messages: chatHistory.slice(-40) }));
}
function renderChatMessages() {
  const el = document.getElementById("chatMessages");
  if (!el) return;
  if (!Array.isArray(chatHistory)) chatHistory = [];
  if (!chatHistory.length) {
    el.innerHTML = `<div class="chat-bubble bot"><div class="zh">你好！我是熊猫老师 🐼</div><div class="vi">${L("Xin chào! Mình là gấu trúc giáo viên. Cùng trò chuyện bằng tiếng Trung nhé — mình chỉ dùng đúng những từ bạn đã học trong từ điển thôi! (Bạn có thể gõ bằng tiếng Việt, tiếng Anh, hoặc tiếng Trung.)", "Hi! I'm the panda teacher. Let's practice chatting in Chinese — I'll only use words you've already learned in the dictionary! (You can type in Vietnamese, English, or Chinese.)")}</div></div>`;
    return;
  }
  el.innerHTML = chatHistory.map(m => {
    const translation = m.role === "user" ? "" : (LANG_MODE === "en" ? (m.en || m.vi) : (m.vi || m.en));
    return `<div class="chat-bubble ${m.role === "user" ? "user" : "bot"}">
      <div class="zh">${esc(m.zh || m.text || "")}</div>
      ${translation ? `<div class="vi">${esc(translation)}</div>` : ""}
    </div>`;
  }).join("");
  el.scrollTop = el.scrollHeight;
}
function openAiTeacherScreen() {
  const mount = document.getElementById("aiChatMount");
  const panel = document.getElementById("chatPanel");
  if (!mount || !panel) return;
  if (panel.parentElement !== mount) mount.appendChild(panel);
  panel.classList.add("open");
  chatHistory = loadChatHistory();
  populateChatTopicSelect();
  renderChatMessages();
  const input = document.getElementById("chatInput");
  if (input) input.focus();
}
function toggleChatPanel() {
  const panel = document.getElementById("chatPanel");
  const toolbar = document.getElementById("aiToolbar");
  const opening = !panel.classList.contains("open");
  if (toolbar) toolbar.classList.remove("open");
  const toolbarToggle = document.getElementById("aiToolbarToggle");
  if (toolbarToggle) toolbarToggle.setAttribute("aria-expanded", "false");
  panel.classList.toggle("open");
  if (opening) {
    chatHistory = loadChatHistory();
    populateChatTopicSelect();
    renderChatMessages();
    document.getElementById("chatInput").focus();
  }
}
async function sendChatMessage() {
  const input = document.getElementById("chatInput");
  const sendBtn = document.getElementById("chatSendBtn");
  const typing = document.getElementById("chatTyping");
  if (!input) return { sent: false, reason: "input_missing" };
  const text = String(input.value || "").trim();
  if (!text) return { sent: false, reason: "empty_message" };
  input.value = "";
  if (!Array.isArray(chatHistory)) chatHistory = [];
  chatHistory.push({ role: "user", zh: text, text });
  renderChatMessages();
  saveChatHistory();
  if (typing) typing.style.display = "block";
  if (sendBtn) { sendBtn.disabled = true; sendBtn.setAttribute("aria-busy", "true"); }

  // Offline-first AI practice: the reply is generated from the curated HSK
  // dialogue bank, so the feature works without exposing an API key or
  // requiring a backend. The adapter below keeps the interaction reliable even
  // if a topic has incomplete translation data.
  await new Promise((resolve) => setTimeout(resolve, 350));
  try {
    const reply = pickLocalChatReply(text) || {
      zh: "我们继续练习吧！",
      vi: "Mình tiếp tục luyện tập nhé!",
      en: "Let's keep practicing!",
    };
    chatHistory.push({ role: "bot", zh: reply.zh || "我们继续练习吧！", vi: reply.vi || "Mình tiếp tục luyện tập nhé!", en: reply.en || "Let's keep practicing!" });
  } catch (error) {
    console.warn("AI chat reply fallback:", error);
    chatHistory.push({ role: "bot", zh: "我们继续练习吧！", vi: "Mình tiếp tục luyện tập nhé!", en: "Let's keep practicing!" });
  } finally {
    if (typing) typing.style.display = "none";
    if (sendBtn) { sendBtn.disabled = false; sendBtn.removeAttribute("aria-busy"); }
    renderChatMessages();
    saveChatHistory();
    input.focus();
  }
  return { sent: true };
}

// ── Free, local reply picker (no AI / no API key needed) ──────────────────
// Instead of picking a random unrelated sentence each turn (which felt like
// spam, not a real conversation), the bot now walks through the selected
// topic's own curated sample dialogue IN ORDER — a coherent, real exchange
// — advancing one line per student turn. In free-chat mode (no topic
// picked) it just handles greetings and nudges the student toward picking
// a topic, since genuine open-domain understanding needs real AI.
const CHAT_GREETING_REPLIES = [
  { zh: "你好！很高兴认识你。", vi: "Xin chào! Rất vui được quen bạn.", en: "Hello! Nice to meet you." },
  { zh: "你好！我们开始聊天吧。", vi: "Xin chào! Chúng ta bắt đầu trò chuyện nhé.", en: "Hi! Let's start chatting." },
];
function isGreetingText(t) {
  return /你好|嗨|hello|hi\b|chào|xin chào/i.test(t);
}
function pickLocalChatReply(userText) {
  const topic = getCurrentTopic();
  if (topic && topic.dialogue && topic.dialogue.length) {
    if (dialogueStepIndex < topic.dialogue.length) {
      const rawLine = topic.dialogue[dialogueStepIndex];
      dialogueStepIndex++;
      const zh = rawLine.replace(/^[AB]:\s*/, "").trim();
      // Try to find the matching translation from this topic's own curated
      // sentence list (reusing real, human-written translations) rather
      // than guessing.
      const match = (topic.sentences || []).find(s => s.zh === zh);
      return {
        zh,
        vi: match ? match.vi : "",
        en: match ? match.en : "",
      };
    }
    // Reached the end of the scripted dialogue for this topic.
    return {
      zh: "我们练习完这段对话了！你可以换一个话题继续练习。",
      vi: "Chúng ta đã luyện xong đoạn hội thoại mẫu của chủ đề này rồi! Bạn có thể chọn chủ đề khác ở trên để tiếp tục luyện nhé.",
      en: "We've finished practicing this dialogue! Pick another topic above to keep practicing.",
    };
  }
  // Free-chat mode (no topic selected): only handle simple greetings —
  // anything else gets nudged toward picking a topic, since without a real
  // AI backend the bot can't genuinely understand open-ended input.
  if (!userText || isGreetingText(userText)) {
    return CHAT_GREETING_REPLIES[Math.floor(Math.random() * CHAT_GREETING_REPLIES.length)];
  }
  return {
    zh: "这是自由聊天，建议你先选一个话题，我们可以练习真正的对话！",
    vi: "Đây là chế độ trò chuyện tự do — gợi ý bạn chọn 1 chủ đề ở ô phía trên để luyện đúng theo mạch hội thoại thật nhé!",
    en: "This is free-chat mode — try picking a topic in the dropdown above so we can practice a real, structured conversation!",
  };
}

/* ---------- Streak milestone badges + panda "level-up" + Treasure Review ---------- */
const STREAK_MILESTONES = [
  { days: 3,   badge: "🌱", title: "Mầm non chăm chỉ",     titleEn: "Budding Learner",
    reward: "Mở khóa Ôn tập Kho báu (15 từ dễ quên nhất)", rewardEn: "Unlocks Treasure Review (15 weakest words)" },
  { days: 7,   badge: "🔥", title: "Tuần lễ vàng",          titleEn: "Golden Week",
    reward: "+1 ❄️ Streak Freeze — tự bảo vệ chuỗi nếu bạn lỡ quên 1 ngày", rewardEn: "+1 ❄️ Streak Freeze — auto-protects your streak if you miss a day",
    freezeToken: true },
  { days: 14,  badge: "⭐", title: "Ngôi sao kiên trì",     titleEn: "Persistent Star",
    reward: "Kho báu nâng cấp: 25 từ mỗi lượt", rewardEn: "Treasure Review upgraded: 25 words per round",
    treasureSize: 25 },
  { days: 30,  badge: "🏆", title: "Nhà vô địch tháng",     titleEn: "Monthly Champion",
    reward: "+1 ❄️ Streak Freeze", rewardEn: "+1 ❄️ Streak Freeze",
    freezeToken: true },
  { days: 50,  badge: "💎", title: "Kim cương bền bỉ",      titleEn: "Diamond Dedication",
    reward: "Kho báu nâng cấp: 40 từ mỗi lượt", rewardEn: "Treasure Review upgraded: 40 words per round",
    treasureSize: 40 },
  { days: 100, badge: "👑", title: "Huyền thoại PandaHán",  titleEn: "PandaHan Legend",
    reward: "+1 ❄️ Streak Freeze — vĩnh viễn không sợ mất chuỗi", rewardEn: "+1 ❄️ Streak Freeze — never fear losing your streak",
    freezeToken: true },
];

/* ---------- Streak Freeze: a token earned at 7/30/100-day milestones that
   auto-protects the streak the ONE time it would otherwise break. ---------- */
function getFreezeData() {
  try { return JSON.parse(localStorage.getItem("pandahan_freeze_v1_" + storageNamespace())) || { tokens: 0, used: [], granted: [] }; }
  catch (e) { return { tokens: 0, used: [], granted: [] }; }
}
function saveFreezeData(d) { localStorage.setItem("pandahan_freeze_v1_" + storageNamespace(), JSON.stringify(d)); }

function rawStreakFromActLog(asOf) {
  const days = new Set();
  ACTLOG.forEach(l => days.add(new Date(l.t).toDateString()));
  let streak = 0, d = new Date(asOf);
  while (days.has(d.toDateString())) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
}
function grantFreezeTokensIfNewMilestone() {
  const streak = rawStreakFromActLog(new Date());
  const data = getFreezeData();
  data.granted = data.granted || [];
  let newlyGranted = null;
  STREAK_MILESTONES.forEach(m => {
    if (m.freezeToken && streak >= m.days && !data.granted.includes(m.days)) {
      data.granted.push(m.days);
      data.tokens = (data.tokens || 0) + 1;
      newlyGranted = m;
    }
  });
  saveFreezeData(data);
  return newlyGranted;
}
function tryAutoApplyFreeze() {
  const data = getFreezeData();
  if (!data.tokens || data.tokens <= 0) return false;
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  const yKey = yesterday.toDateString();
  data.used = data.used || [];
  if (data.used.includes(yKey)) return false;
  const daysSet = new Set();
  ACTLOG.forEach(l => daysSet.add(new Date(l.t).toDateString()));
  if (daysSet.has(yKey)) return false; // yesterday wasn't actually missed, nothing to freeze
  const dayBefore = new Date(yesterday); dayBefore.setDate(dayBefore.getDate() - 1);
  if (rawStreakFromActLog(dayBefore) <= 0) return false; // no chain to protect
  data.used.push(yKey);
  data.tokens -= 1;
  saveFreezeData(data);
  return true;
}
function currentTreasureSize() {
  const streak = computeStreak();
  const upgrades = STREAK_MILESTONES.filter(m => m.treasureSize && streak >= m.days);
  return upgrades.length ? Math.max(...upgrades.map(m => m.treasureSize)) : 15;
}
function computeStreak(asOf) {
  const days = new Set();
  ACTLOG.forEach(l => days.add(new Date(l.t).toDateString()));
  const freeze = getFreezeData();
  (freeze.used || []).forEach(k => days.add(k));
  let streak = 0, d = asOf ? new Date(asOf) : new Date();
  while (days.has(d.toDateString())) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
}
function renderStreakBadges() {
  const justFroze = tryAutoApplyFreeze();
  const newMilestone = grantFreezeTokensIfNewMilestone();
  const streak = computeStreak();
  const freeze = getFreezeData();
  const el = document.getElementById("dashBadges");
  if (el) {
    el.innerHTML = STREAK_MILESTONES.map(m => {
      const unlocked = streak >= m.days;
      return `<div class="badge-pill ${unlocked ? "unlocked" : "locked"}" title="${esc(L(m.title, m.titleEn))} — ${m.days} ${L("ngày", "days")} · 🎁 ${esc(L(m.reward, m.rewardEn))}">
        <span class="badge-icon">${unlocked ? m.badge : "🔒"}</span>
        <span class="badge-days">${m.days}${L("ng", "d")}</span>
      </div>`;
    }).join("");
  }
  const freezeEl = document.getElementById("dashFreezeTokens");
  if (freezeEl) {
    freezeEl.textContent = freeze.tokens > 0
      ? `❄️ ${freeze.tokens} ${L("lượt bảo vệ streak", "streak-freeze tokens")}`
      : "";
    freezeEl.style.display = freeze.tokens > 0 ? "inline-block" : "none";
  }
  const achieved = STREAK_MILESTONES.filter(m => streak >= m.days);
  const currentBadge = achieved.length ? achieved[achieved.length - 1].badge : "";
  document.getElementById("dashStreak").textContent = "🔥" + streak + (currentBadge ? " " + currentBadge : "");
  const sbStreak = document.getElementById("sidebarStreakDays");
  if (sbStreak) sbStreak.textContent = `${streak} ${L("ngày", "days")}`;

  const treasureBtn = document.getElementById("treasureReviewBtn");
  if (treasureBtn) {
    treasureBtn.style.display = streak >= 3 ? "flex" : "none";
    treasureBtn.querySelector("span").textContent = `— ${currentTreasureSize()} ${L("từ dễ quên nhất", "weakest words")}`;
  }
  if (justFroze) {
    alert(L("❄️ Streak Freeze đã tự động kích hoạt — bạn lỡ quên hôm qua nhưng chuỗi vẫn được giữ nguyên!", "❄️ Streak Freeze auto-activated — you missed yesterday but your streak was preserved!"));
  }
  if (newMilestone) {
    alert(L(`🎉 Đạt mốc ${newMilestone.days} ngày! Phần thưởng: ${newMilestone.reward}`, `🎉 Reached the ${newMilestone.days}-day milestone! Reward: ${newMilestone.rewardEn}`));
  }
}
function startTreasureReview() {
  const learned = VOCAB.filter(w => getTier(w.char) > 0).map(w => w.char);
  if (!learned.length) { alert(L("Bạn chưa học từ nào để ôn kho báu!", "No learned words to treasure-review yet!")); return; }
  // weakest retention first: lowest ease-factor, then longest since last seen
  const size = currentTreasureSize();
  const queue = learned.sort((a, b) => {
    const sa = getStat(a), sb = getStat(b);
    if (sa.ef !== sb.ef) return sa.ef - sb.ef;
    return (sa.lastSeen || 0) - (sb.lastSeen || 0);
  }).slice(0, size);
  hideStudyReminder();
  const needsQuiz = queue.filter(char => getStat(char).quizAttempts === 0);
  if (needsQuiz.length) {
    let qq = [];
    needsQuiz.forEach(char => { const w = VOCAB_BY_CHAR[char]; genReadingQuestions(w).forEach(q => qq.push({ ...q, char })); });
    if (qq.length) {
      quizQueue = shuffle(qq);
      pendingFlashcardQueue = queue;
      postQuizGoToReview = true;
      alert(L("Một số từ kho báu chưa có dữ liệu quiz — làm quiz trước rồi sẽ tự chuyển sang Ôn tập Kho báu nhé!", "Some treasure words have no quiz data yet — do the quiz first, then it'll take you to the Treasure Review!"));
      runQuiz();
      return;
    }
  }
  fcQueue = queue;
  alert(L(`🎁 Ôn tập Kho báu: ${queue.length} từ bạn dễ quên nhất! Cùng cứu lấy trí nhớ nào 🐼`, `🎁 Treasure Review: ${queue.length} of your most-forgettable words! Let's rescue your memory 🐼`));
  runFlashcards();
}

function hasActivityToday() {
  const today = new Date().toDateString();
  return ACTLOG.some(l => new Date(l.t).toDateString() === today);
}
/* Streak-at-risk: the chain built through YESTERDAY, which is still intact
   right now but will break at midnight if nothing is studied today. Shown
   late in the day (after 20:00) as an urgent banner + voice nudge, reusing
   the same reminder audio recorded for the regular study reminder. */
const STREAK_WARNING_HOUR = 20;
function checkStreakWarning() {
  const banner = document.getElementById("streakWarningBanner");
  if (!banner || !CURRENT_USER) return;
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  const pendingStreak = computeStreak(yesterday);
  const hour = new Date().getHours();
  if (pendingStreak > 0 && !hasActivityToday() && hour >= STREAK_WARNING_HOUR) {
    document.getElementById("streakWarningText").innerHTML = L(
      `Chuỗi <b>${pendingStreak} ngày</b> sắp mất! Học nhanh vài từ trước nửa đêm để giữ streak nhé!`,
      `Your <b>${pendingStreak}-day</b> streak is about to break! Study a few words before midnight to keep it!`
    );
    banner.style.display = "flex";
    playReminderAudio().catch(() => {});
  } else {
    banner.style.display = "none";
  }
  updateNotifBell();
}
/* ---------- 🔔 Notification bell: same due-count / streak-warning data that
   drives the reminder banners, surfaced as a persistent header icon (badge +
   dropdown) — a more standard, professional notification pattern. ---------- */
function updateNotifBell() {
  if (!CURRENT_USER) return;
  const due = typeof getDueCount === "function" ? Number(getDueCount() || 0) : 0;
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  const pendingStreak = typeof computeStreak === "function" ? computeStreak(yesterday) : 0;
  const hour = new Date().getHours();
  const streakAtRisk = pendingStreak > 0 && !hasActivityToday() && hour >= STREAK_WARNING_HOUR;
  const notices = Array.isArray(window.PandaHanNotifications) ? window.PandaHanNotifications : [];
  const unread = notices.filter((item) => item && item.read !== true && item.is_read !== true).length;
  const count = Math.max(unread, due + (streakAtRisk ? 1 : 0));
  const badge = document.getElementById("notifBadge");
  if (badge) {
    badge.style.display = count > 0 ? "inline-block" : "none";
    badge.textContent = count > 9 ? "9+" : String(count);
  }
  const dd = document.getElementById("notifDropdown");
  if (!dd || dd.dataset.rendered === "open") return;
  const summary = count > 0
    ? L(`${count} cập nhật học tập đang chờ xem`, `${count} learning update${count === 1 ? "" : "s"} to review`)
    : L("Kế hoạch và nhận xét nằm trong AI Coach", "Your plan and feedback are in AI Coach");
  dd.innerHTML = `<div style="padding:4px 0 10px;text-align:center;color:#5b4964;line-height:1.45;">🔔 <b>${summary}</b><div style="font-size:11px;color:#64748b;margin-top:3px;">${L("Xem kế hoạch, điểm và phần cần ôn trong một nơi.", "View your plan, scores and review items in one place.")}</div></div><button type="button" id="notifAiCoachBtn" style="display:block;width:100%;border:0;border-radius:9px;padding:8px 10px;background:var(--pink,#ec4899);color:#fff;font-weight:800;cursor:pointer;">💬 ${L("Mở AI Coach", "Open AI Coach")}</button>`;
  const coachBtn = document.getElementById("notifAiCoachBtn");
  if (coachBtn) coachBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    dd.style.display = "none";
    dd.dataset.rendered = "";
    if (typeof switchTab === "function") switchTab("chat");
    setTimeout(() => {
      if (typeof window.openAiCoachChat === "function") window.openAiCoachChat();
      else document.querySelector('.chat-contact[data-ai="true"]')?.click();
    }, 60);
  });
}
function renderMergedHistory() {
  const el = document.getElementById("mergedHistoryList");
  if (!el) return;
  const sessions = getSessions().slice();
  const activeStr = localStorage.getItem("pandahan_active_session_" + storageNamespace());
  const activeStart = activeStr ? Number(activeStr) : null;
  const allSessions = [];
  if (activeStart) allSessions.push({ start: activeStart, end: Date.now(), duration: Date.now() - activeStart, ongoing: true });
  allSessions.push(...sessions);
  if (!allSessions.length) {
    el.innerHTML = L("Chưa có hoạt động nào.", "No activity yet.");
    return;
  }
  const fmtTime = d => d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  let html = "";
  allSessions.slice(0, 15).forEach(s => {
    const startD = new Date(s.start), endD = new Date(s.end);
    const mins = Math.max(1, Math.round(s.duration / 60000));
    const acts = ACTLOG.filter(l => l.t >= s.start && l.t <= s.end).sort((a, b) => b.t - a.t);
    html += `<div style="border:1px solid var(--hsk2-light);border-radius:10px;padding:8px 10px;margin-bottom:8px;">
      <div style="font-weight:700;font-size:12px;">⏱️ ${startD.toLocaleDateString("vi-VN")} · ${fmtTime(startD)} → ${s.ongoing ? L("đang mở", "ongoing") : fmtTime(endD)} <span style="color:var(--text-light);font-weight:400;">(${mins} ${L("phút", "min")})</span></div>
      ${acts.length
        ? `<ul style="list-style:none;padding:0;margin-top:5px;">` + acts.map(a => `<li style="padding:2px 0 2px 14px;font-size:12px;color:var(--text-light);">• ${esc(a.text)}</li>`).join("") + `</ul>`
        : `<div style="font-size:11.5px;color:var(--text-light);margin-top:3px;padding-left:14px;">${L("Không có hoạt động ghi nhận", "No recorded activity")}</div>`}
    </div>`;
  });
  el.innerHTML = html || L("Chưa có hoạt động nào.", "No activity yet.");
}

/* ===================== TAB / SCREEN NAVIGATION ===================== */
  function switchTab(tab) {
  document.querySelectorAll(".nav-tabs button").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  if (tab === "chat") {
    const dot = document.getElementById("chatNotifDot");
    if (dot) dot.style.display = "none";
  }
  showScreen(tab === "browse" ? "browse" : tab === "review" ? "reviewIntro" : tab === "practice" ? "practice" : tab === "teacher" ? "teacher" : tab === "chat" ? "chat" : tab === "ai" ? "aiTeacher" : tab === "pinyin" ? "pinyin" : "dashboard");
}
function showScreen(name) {
  // Move the floating AI assistant away from the direct-message composer.
  document.body.classList.toggle("direct-chat-open", name === "chat");
  ["browseTab", "detailView", "quizView", "flashcardView", "unscrambleView", "practiceTab", "dashboardView", "teacherView", "aiTeacherView", "chatView", "teacherStudentDetail", "certificateView", "addWordView", "wordListView", "pinyinView"].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.style.display = "none"; el.classList.remove("visible"); }
  });
  const el = (id) => document.getElementById(id);
  if (name === "browse") { if (el("browseTab")) el("browseTab").style.display = "block"; if (typeof renderGrids === "function") renderGrids(); }
  else if (name === "detail") { if (el("detailView")) { el("detailView").classList.add("visible"); el("detailView").style.display = "block"; } }
  else if (name === "quiz") { if (el("quizView")) { el("quizView").classList.add("visible"); el("quizView").style.display = "block"; } }
  else if (name === "flashcard") { if (el("flashcardView")) { el("flashcardView").classList.add("visible"); el("flashcardView").style.display = "block"; } }
  else if (name === "unscramble") { if (el("unscrambleView")) { el("unscrambleView").classList.add("visible"); el("unscrambleView").style.display = "block"; } }
  else if (name === "practice") { 
    if (el("practiceTab")) { el("practiceTab").classList.add("visible"); el("practiceTab").style.display = "block"; }
    if (el("gameContainer")) { el("gameContainer").classList.remove("visible"); el("gameContainer").style.display = "none"; }
    const pg = document.querySelector("#practiceTab .practice-grid"); if (pg) pg.style.display = "";
    const asv = el("advancedSetsView"); if (asv) asv.style.display = "none";
  }
  else if (name === "dashboard") { if (el("dashboardView")) { el("dashboardView").classList.add("visible"); el("dashboardView").style.display = "block"; if (typeof renderDashboard === "function") renderDashboard(); } }
  else if (name === "reviewIntro") { if (el("browseTab")) el("browseTab").style.display = "block"; if (typeof renderGrids === "function") renderGrids(); if (typeof startReviewSession === "function") startReviewSession({ practiceMode: window.PandaHanPracticeMode === "scheduled" ? "scheduled" : "free" }); }
  else if (name === "teacher") { if (el("teacherView")) { el("teacherView").classList.add("visible"); el("teacherView").style.display = "block"; if (typeof renderTeacherDashboard === "function") renderTeacherDashboard(); } }
  else if (name === "aiTeacher") { if (el("aiTeacherView")) { el("aiTeacherView").classList.add("visible"); el("aiTeacherView").style.display = "block"; if (typeof window.openAiTutorWorkspace === "function") window.openAiTutorWorkspace(); else openAiTeacherScreen(); } }
  else if (name === "chat") { if (el("chatView")) { el("chatView").classList.add("visible"); el("chatView").style.display = "block"; if (typeof initChatSystem === "function") initChatSystem(); } }
  else if (name === "teacherDetail") { if (el("teacherStudentDetail")) { el("teacherStudentDetail").classList.add("visible"); el("teacherStudentDetail").style.display = "block"; } }
  else if (name === "certificate") { if (el("certificateView")) { el("certificateView").classList.add("visible"); el("certificateView").style.display = "block"; } }
  else if (name === "addWord") { if (el("addWordView")) { el("addWordView").classList.add("visible"); el("addWordView").style.display = "block"; } }
  else if (name === "wordList") { if (el("wordListView")) { el("wordListView").classList.add("visible"); el("wordListView").style.display = "block"; } }
  else if (name === "pinyin") { if (el("pinyinView")) { el("pinyinView").classList.add("visible"); el("pinyinView").style.display = "block"; if (typeof renderPinyinView === "function") renderPinyinView(); } }
}

/* ===================== TEACHER DASHBOARD (reads other users' namespaced data) ===================== */
function readUserStats(username) {
  try { return JSON.parse(localStorage.getItem("pandahan_pro_stats_v1_" + username)) || {}; } catch (e) { return {}; }
}
function clearUserData(username) {
  localStorage.removeItem("pandahan_pro_stats_v1_" + username);
  localStorage.removeItem("pandahan_pro_log_v1_" + username);
}
function tierFromStat(s) {
  if (!s || !s.repetitions) return 0;
  if (s.repetitions >= 5 && s.ef >= 2.5 && s.interval >= 30) return 4;
  if (s.repetitions >= 3 && s.ef >= 2.2 && s.interval >= 15) return 3;
  if (s.repetitions >= 2 && s.ef >= 1.8 && s.interval >= 6) return 2;
  return 1;
}
function studentSummary(username) {
  const stats = readUserStats(username);
  const chars = Object.keys(stats);
  let learned = 0, mastered = 0, quizAttempts = 0, quizCorrect = 0, lastSeen = 0;
  chars.forEach(c => {
    const s = stats[c];
    const t = tierFromStat(s);
    if (t > 0) learned++;
    if (t === 4) mastered++;
    quizAttempts += s.quizAttempts || 0;
    quizCorrect += s.quizCorrect || 0;
    if (s.lastSeen > lastSeen) lastSeen = s.lastSeen;
  });
  return { learned, mastered, quizAttempts, quizCorrect, lastSeen, total: chars.length };
}
async function renderTeacherDashboard() {
  const list = document.getElementById("teacherStudentList");
  if (!list) return;
  
  list.innerHTML = `<div style="text-align:center;padding:20px;">⌛ Đang tải danh sách người dùng...</div>`;
  
  const isMaster = (USER_ROLE === "master_teacher") || MASTER_EMAILS.includes(CURRENT_USER.email);
  
  try {
      const snap = await db.collection("users").get();
      const allUsers = snap.docs.map(doc => doc.data());
      
      let html = "";
      
      // ─── HEADER: Phân cấp vai trò ───
      html += `<div style="background:linear-gradient(135deg,#667eea,#764ba2);border-radius:14px;padding:14px 18px;margin-bottom:14px;color:#fff;">
        <div style="font-weight:700;font-size:15px;">${isMaster ? '🏛️ Trung tâm quản lý' : '👨‍🏫 Bảng điều khiển Giáo viên'}</div>
        <div style="font-size:12px;opacity:.9;margin-top:3px;">${isMaster ? 'Quản lý lớp học, giáo viên và dữ liệu học viên' : 'Xem tiến độ và quản lý học viên'}</div>
      </div>`;
      
      // ─── Đọc progress từ Firestore cho từng học sinh ───
      const progressDocs = await db.collection("progress").get();
      const progressMap = {};
      progressDocs.forEach(doc => {
        progressMap[doc.id] = doc.data();
      });
      
      // ─── Phân loại users ───
      const students = allUsers.filter(u => u.role === "student" && u.uid !== CURRENT_USER.uid);
      const teachers = allUsers.filter(u => u.role === "teacher" && u.uid !== CURRENT_USER.uid);
      const masters = allUsers.filter(u => u.role === "master_teacher" && u.uid !== CURRENT_USER.uid);
      
      // ─── HỌC SINH (Giáo viên và Master đều thấy) ───
      if (students.length > 0 || (isMaster && (teachers.length > 0 || masters.length > 0))) {
        html += `<h3 style="font-size:15px;margin:14px 0 10px;color:var(--hsk2);">🎓 Học viên (${students.length})</h3>`;
        
        if (students.length === 0 && isMaster) {
            html += `<p style="font-size:12.5px;color:#888;padding:8px;">Chưa có học viên nào.</p>`;
        }
        
        html += students.map(u => {
            let learnedCount = 0;
            let lastSeenLabel = "–";
            if (progressMap[u.uid]) {
                const stats = progressMap[u.uid].stats || {};
                Object.values(stats).forEach(s => {
                    if ((s.repetitions || 0) > 0 || (s.quizAttempts || 0) > 0) learnedCount++;
                });
                if (progressMap[u.uid].lastUpdated) {
                    const d = progressMap[u.uid].lastUpdated.toDate ? progressMap[u.uid].lastUpdated.toDate() : new Date(progressMap[u.uid].lastUpdated);
                    lastSeenLabel = d.toLocaleDateString("vi-VN");
                }
            }
            
            // Nút đổi role: Master thấy tất cả, GV chỉ thấy đổi student↔teacher
            const changeRoleBtns = isMaster ? `
              <button class="btn btn-outline" onclick="changeUserRole('${u.uid}','teacher')" style="font-size:11px;padding:5px 9px;background:#3b82f6;color:#fff;border:none;border-radius:8px;">↗ GV</button>
              <button class="btn btn-outline" onclick="changeUserRole('${u.uid}','master_teacher')" style="font-size:11px;padding:5px 9px;background:#7c3aed;color:#fff;border:none;border-radius:8px;">↗ TC</button>
            ` : `
              <button class="btn btn-outline" onclick="changeUserRole('${u.uid}','teacher')" style="font-size:11px;padding:5px 9px;background:#3b82f6;color:#fff;border:none;border-radius:8px;">↗ GV</button>
            `;
            
            return `<div style="background:#fafcfe;border-radius:12px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;border:1px solid #eef2f7;margin-bottom:8px;">
              <div>
                <div style="font-weight:700;">${esc(u.name)} <span class="role-badge role-student" style="background:#dbeafe;color:#1d4ed8;padding:2px 8px;border-radius:6px;font-size:11px;">🎓 HS</span></div>
                <div style="font-size:12px;color:var(--text-light);">${u.email}</div>
                <div style="font-size:11px;color:var(--pink);margin-top:3px;">📚 ${L(`${learnedCount} từ đã học${lastSeenLabel !== "–" ? " · Cập nhật: " + lastSeenLabel : ""}`, `${learnedCount} words studied${lastSeenLabel !== "–" ? " · Updated: " + lastSeenLabel : ""}`)}</div>
              </div>
              <div style="display:flex;gap:6px;align-items:center;">
                <button class="btn btn-outline" onclick="viewStudentProgress('${u.uid}', '${esc(u.name)}')" style="font-size:11px;padding:6px 10px;">📊 Chi tiết</button>
                <button class="btn btn-outline" onclick="confirmRemoveRole('${u.uid}')" style="font-size:11px;padding:5px 9px;color:#dc2626;border-color:#dc2626;">Xóa</button>
                ${changeRoleBtns}
              </div>
            </div>`;
        }).join("");
      }
      
      // ─── GIÁO VIÊN (Chỉ Master thấy) ───
      if (isMaster && teachers.length > 0) {
          html += `<h3 style="font-size:15px;margin:20px 0 10px;color:var(--hsk3);">👨‍🏫 Giáo viên (${teachers.length})</h3>`;
          html += teachers.map(u => {
            // Đếm số học sinh của giáo viên này (dựa vào shared data)
            return `<div style="background:#fffbeb;border-radius:12px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;border:1px solid #fde68a;margin-bottom:8px;">
              <div>
                <div style="font-weight:700;">${esc(u.name)} <span class="role-badge" style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:6px;font-size:11px;">👨‍🏫 GV</span></div>
                <div style="font-size:12px;color:var(--text-light);">${u.email}</div>
              </div>
              <div style="display:flex;gap:6px;align-items:center;">
                <button class="btn btn-outline" onclick="changeUserRole('${u.uid}','student')" style="font-size:11px;padding:5px 9px;background:#ef4444;color:#fff;border:none;border-radius:8px;">↘ HS</button>
                <button class="btn btn-outline" onclick="confirmRemoveRole('${u.uid}')" style="font-size:11px;padding:5px 9px;color:#dc2626;border-color:#dc2626;">Xóa</button>
              </div>
            </div>`;
          }).join("");
      }
      
      // ─── MASTER / TRUNG TÂM (Chỉ Master thấy) ───
      if (isMaster && masters.length > 0) {
          html += `<h3 style="font-size:15px;margin:20px 0 10px;color:#7c3aed;">🏛️ Trung tâm / Master (${masters.length})</h3>`;
          html += masters.map(u => {
            return `<div style="background:#f5f3ff;border-radius:12px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;border:1px solid #e0d4fc;margin-bottom:8px;">
              <div>
                <div style="font-weight:700;">${esc(u.name)} <span class="role-badge" style="background:#ede9fe;color:#6d28d9;padding:2px 8px;border-radius:6px;font-size:11px;">🏛️ TC</span></div>
                <div style="font-size:12px;color:var(--text-light);">${u.email}</div>
              </div>
              <div style="display:flex;gap:6px;align-items:center;">
                <button class="btn btn-outline" onclick="changeUserRole('${u.uid}','teacher')" style="font-size:11px;padding:5px 9px;background:#3b82f6;color:#fff;border:none;border-radius:8px;">↘ GV</button>
                <button class="btn btn-outline" onclick="confirmRemoveRole('${u.uid}')" style="font-size:11px;padding:5px 9px;color:#dc2626;border-color:#dc2626;">Xóa</button>
              </div>
            </div>`;
          }).join("");
      }
      
      if (students.length === 0 && (!isMaster || (teachers.length === 0 && masters.length === 0))) {
          html += `<p style="font-size:12.5px;color:#888;padding:10px;">Chưa có thành viên nào.</p>`;
      }
      
      list.innerHTML = html;
  } catch(e) {
      list.innerHTML = `<div style="color:red;">Lỗi khi tải dữ liệu: ${e.message}</div>`;
      console.error("renderTeacherDashboard error:", e);
  }
}

async function viewStudentProgress(uid, name) {
    try {
        const prog = await db.collection("progress").doc(uid).get();
        const stats = prog.exists ? prog.data().stats : {};
        
        // Tổng số từ HSK 1-3 lấy trực tiếp từ payload VOCAB đang chạy.
        const totalWords = typeof VOCAB !== "undefined" && Array.isArray(VOCAB) ? VOCAB.length : 0;
        
        // Chỉ đếm những từ có repetitions > 0 mới tính là "đã học"
        let learned = 0;
        let mastered = 0;
        const tierCounts = [0, 0, 0, 0, 0]; // 0: chưa học, 1-4: các cấp độ
        let totalQuizAttempts = 0, totalQuizCorrect = 0;
        
        Object.entries(stats).forEach(([char, s]) => {
            // Chỉ xét những từ có hoạt động học (repetitions > 0 hoặc quizAttempts > 0)
            const hasActivity = (s.repetitions || 0) > 0 || (s.quizAttempts || 0) > 0;
            if (hasActivity) learned++;
            
            const tier = tierFromStat(s);
            if (tier >= 1 && tier <= 4) {
                tierCounts[tier]++;
            }
            if (tier === 4) mastered++;
            totalQuizAttempts += (s.quizAttempts || 0);
            totalQuizCorrect += (s.quizCorrect || 0);
        });
        tierCounts[0] = Math.max(0, totalWords - learned);
        const quizAccuracy = totalQuizAttempts > 0 ? Math.round(totalQuizCorrect / totalQuizAttempts * 100) : 0;
        const pct = Math.min(100, Math.round((learned / totalWords) * 100));
        
        let lastUpdatedStr = "–";
        if (prog.exists && prog.data().lastUpdated) {
            const d = prog.data().lastUpdated.toDate ? prog.data().lastUpdated.toDate() : new Date(prog.data().lastUpdated);
            lastUpdatedStr = d.toLocaleString("vi-VN");
        }

        document.getElementById("teacherDetailName").textContent = `Tiến độ của ${name}`;
        document.getElementById("teacherDetailStats").innerHTML = `
            <div style="margin-bottom:14px;font-size:11px;color:var(--text-light);">Cập nhật lần cuối: ${lastUpdatedStr}</div>
            <div class="time-grid" style="grid-template-columns:1fr 1fr;">
              <div class="time-box"><div class="num">${learned}</div><div class="lbl">${L("Từ đã học", "Words studied")}</div></div>
              <div class="time-box"><div class="num">${mastered}</div><div class="lbl">Từ thành thạo</div></div>
              <div class="time-box"><div class="num">${quizAccuracy}%</div><div class="lbl">Tỉ lệ đúng quiz</div></div>
              <div class="time-box"><div class="num">${totalQuizAttempts}</div><div class="lbl">Tổng lượt quiz</div></div>
            </div>
            <div style="margin-top:14px;">
              <div style="font-size:12px;font-weight:700;margin-bottom:4px;">Tiến độ tổng: ${pct}%</div>
              <div style="background:var(--hsk2-light);border-radius:30px;height:9px;overflow:hidden;">
                <div class="fill" style="height:100%;border-radius:30px;width:${pct}%;background:linear-gradient(90deg,var(--hsk1),var(--pink));transition:width 0.6s ease;"></div>
              </div>
            </div>
            <table class="time-table" style="margin-top:14px;">
              <thead><tr><th>Mức độ</th><th>Số từ</th></tr></thead>
              <tbody>
                <tr><td>⚪ Chưa học</td><td>${tierCounts[0]}</td></tr>
                <tr><td>🔴 Mới học</td><td>${tierCounts[1]}</td></tr>
                <tr><td>🟡 Đang ôn luyện</td><td>${tierCounts[2]}</td></tr>
                <tr><td>🟢 Đã nắm vững</td><td>${tierCounts[3]}</td></tr>
                <tr><td>🐼 Thành thạo</td><td>${tierCounts[4]}</td></tr>
              </tbody>
            </table>
            <div style="margin-top:20px; font-size:13px; color:var(--text-light);">
                <i>Dữ liệu được lấy trực tiếp từ Firebase Firestore.</i>
            </div>
        `;
        showScreen("teacherDetail");
    } catch(e) {
        alert("Lỗi khi tải tiến độ: " + e.message);
        console.error("viewStudentProgress error:", e);
    }
}

// Đổi role người dùng - Master đổi thành bất kỳ role nào; GV chỉ đổi student↔teacher
async function changeUserRole(uid, newRole) {
    const isMaster = (USER_ROLE === "master_teacher") || MASTER_EMAILS.includes(CURRENT_USER.email);
    // Giáo viên thường không được đổi role thành master_teacher
    if (!isMaster && newRole === "master_teacher") {
        alert("Chỉ Trung tâm (Master) mới có quyền cấp role Trung tâm!");
        return;
    }
    const roleLabels = { student: "Học sinh", teacher: "Giáo viên", master_teacher: "Trung tâm/Master" };
    if (!confirm(`Xác nhận đổi role người dùng này thành: ${roleLabels[newRole] || newRole}?`)) return;
    try {
        await db.collection("users").doc(uid).update({ 
            role: newRole,
            status: "approved"
        });
        alert(`Đã cập nhật thành công! Role mới: ${roleLabels[newRole] || newRole}`);
        renderTeacherDashboard();
    } catch(e) {
        if (e.message.includes("permissions")) {
            alert("Lỗi: Bạn không có quyền sửa đổi người dùng này. Vui lòng cập nhật Security Rules trên Firebase Console.");
        } else {
            alert("Lỗi: " + e.message);
        }
    }
}

// Xác nhận xóa user khỏi hệ thống - chỉ Master mới xóa được
async function confirmRemoveRole(uid) {
    const isMaster = (USER_ROLE === "master_teacher") || MASTER_EMAILS.includes(CURRENT_USER.email);
    if (!isMaster) {
        alert("Chỉ Trung tâm (Master) mới có quyền xóa người dùng!");
        return;
    }
    const userDoc = await db.collection("users").doc(uid).get();
    const u = userDoc.data();
    if (!u) return;
    if (!confirm(`Xác nhận xóa người dùng "${u.name}" (${u.email}) khỏi hệ thống?\nHành động này sẽ xóa dữ liệu user và tiến độ của họ.`)) return;
    try {
        // Xóa user và progress
        await db.collection("users").doc(uid).delete();
        await db.collection("progress").doc(uid).delete();
        alert("Đã xóa người dùng thành công!");
        renderTeacherDashboard();
    } catch(e) {
        alert("Lỗi khi xóa người dùng: " + e.message);
    }
}

// Hàm cũ updateUserRole giữ lại để tương thích
function updateUserRole(uid, newRole) { changeUserRole(uid, newRole); }
function showTeacherStudentDetail(username) {
  const u = findUser(username);
  const sum = studentSummary(username);
  const stats = readUserStats(username);
  document.getElementById("teacherDetailName").textContent = (u ? L(u.name, u.nameEn) : username) + ` (@${username})`;
  const quizPct = sum.quizAttempts ? Math.round(sum.quizCorrect / sum.quizAttempts * 100) : null;
  const tierCounts = [0, 0, 0, 0, 0];
  Object.values(stats).forEach(s => tierCounts[tierFromStat(s)]++);
  document.getElementById("teacherDetailStats").innerHTML = `
    <div class="time-grid" style="grid-template-columns:1fr 1fr;">
      <div class="time-box"><div class="num">${sum.learned}</div><div class="lbl">${L('Từ đã học', 'Words studied')}</div></div>
      <div class="time-box"><div class="num">${sum.mastered}</div><div class="lbl">${L('Từ thành thạo', 'Words mastered')}</div></div>
      <div class="time-box"><div class="num">${quizPct === null ? '–' : quizPct + '%'}</div><div class="lbl">${L('Tỉ lệ đúng quiz', 'Quiz accuracy')}</div></div>
      <div class="time-box"><div class="num">${sum.quizAttempts}</div><div class="lbl">${L('Tổng lượt làm quiz', 'Total quiz attempts')}</div></div>
    </div>
    <table class="time-table" style="margin-top:14px;">
      <thead><tr><th>${L('Mức độ', 'Tier')}</th><th>${L('Số từ', 'Word count')}</th></tr></thead>
      <tbody>
        <tr><td>⚪ ${L('Chưa học', 'Not studied')}</td><td>${tierCounts[0]}</td></tr>
        <tr><td>🔴 ${L('Mới học', 'New')}</td><td>${tierCounts[1]}</td></tr>
        <tr><td>🟡 ${L('Đang ôn luyện', 'Reinforcing')}</td><td>${tierCounts[2]}</td></tr>
        <tr><td>🟢 ${L('Đã nắm vững', 'Familiar')}</td><td>${tierCounts[3]}</td></tr>
        <tr><td>🐼 ${L('Thành thạo', 'Mastered')}</td><td>${tierCounts[4]}</td></tr>
      </tbody>
    </table>`;
  showScreen("teacherDetail");
}

/* ===================== ADD VOCABULARY (Teacher content-authoring) ===================== */
const POS_OPTIONS = ["Danh từ","Động từ","Tính từ","Phó từ","Liên từ","Giới từ","Lượng từ","Trợ từ",
  "Đại từ nhân xưng","Trợ động từ","Đại từ nghi vấn","Đại từ chỉ định","Cụm từ/thành ngữ","Số từ","Thán từ"];
function renderAddWordForm() {
  const el = document.getElementById("addWordForm");
  if (!el) return;
  el.innerHTML = `
    <label>${L("Chữ Hán *","Chinese character *")}<input id="nwChar" type="text" placeholder="例：勇敢" style="width:100%;padding:8px;border-radius:8px;border:1px solid #e5e7eb;margin-top:3px;"></label>
    <label>Pinyin *<input id="nwPinyin" type="text" placeholder="yǒnggǎn" style="width:100%;padding:8px;border-radius:8px;border:1px solid #e5e7eb;margin-top:3px;"></label>
    <label>${L("Hán Việt *","Sino-Vietnamese reading *")}<input id="nwHanviet" type="text" placeholder="dũng cảm" style="width:100%;padding:8px;border-radius:8px;border:1px solid #e5e7eb;margin-top:3px;"></label>
    <label>${L("Loại từ *","Part of speech *")}<select id="nwPos" style="width:100%;padding:8px;border-radius:8px;border:1px solid #e5e7eb;margin-top:3px;">${POS_OPTIONS.map(p => `<option value="${p}">${p}</option>`).join("")}</select></label>
    <label>${L("Cấp độ HSK *","HSK level *")}<select id="nwHsk" style="width:100%;padding:8px;border-radius:8px;border:1px solid #e5e7eb;margin-top:3px;"><option value="1">HSK 1</option><option value="2">HSK 2</option><option value="3" selected>HSK 3</option></select></label>
    <label>${L("Nghĩa tiếng Việt *","Vietnamese meaning *")}<input id="nwMeaningVi" type="text" placeholder="dũng cảm" style="width:100%;padding:8px;border-radius:8px;border:1px solid #e5e7eb;margin-top:3px;"></label>
    <label>${L("Nghĩa tiếng Anh *","English meaning *")}<input id="nwMeaningEn" type="text" placeholder="brave" style="width:100%;padding:8px;border-radius:8px;border:1px solid #e5e7eb;margin-top:3px;"></label>
    <label>${L("Câu ví dụ tiếng Trung (khuyến khích)","Example sentence in Chinese (recommended)")}<input id="nwExZh" type="text" placeholder="他是一个勇敢的人。" style="width:100%;padding:8px;border-radius:8px;border:1px solid #e5e7eb;margin-top:3px;"></label>
    <label>${L("Pinyin của câu ví dụ","Pinyin of the example sentence")}<input id="nwExPinyin" type="text" placeholder="Tā shì yí ge yǒnggǎn de rén." style="width:100%;padding:8px;border-radius:8px;border:1px solid #e5e7eb;margin-top:3px;"></label>
    <label>${L("Dịch nghĩa câu ví dụ (VI / EN, cách nhau bởi /)","Example translation (VI / EN, separated by /)")}<input id="nwExTr" type="text" placeholder="Anh ấy là người dũng cảm. / He is a brave person." style="width:100%;padding:8px;border-radius:8px;border:1px solid #e5e7eb;margin-top:3px;"></label>
    <label>🎨 ${L("Chiết tự / Câu chuyện văn hóa (Tiếng Việt) *","Radical breakdown / Cultural story (Vietnamese) *")}<textarea id="nwChietuVi" rows="3" placeholder="勇 (dũng) + 敢 (dám) = dám xông lên, không sợ hãi..." style="width:100%;padding:8px;border-radius:8px;border:1px solid #e5e7eb;margin-top:3px;"></textarea></label>
    <label>🎨 ${L("Chiết tự / Câu chuyện văn hóa (Tiếng Anh) *","Radical breakdown / Cultural story (English) *")}<textarea id="nwChietuEn" rows="3" placeholder="勇 (brave) + 敢 (dare) = daring to step forward without fear..." style="width:100%;padding:8px;border-radius:8px;border:1px solid #e5e7eb;margin-top:3px;"></textarea></label>
    <button id="nwSubmitBtn" class="btn btn-hsk3">💾 ${L("Lưu từ vựng", "Save word")}</button>
  `;
  document.getElementById("nwSubmitBtn").addEventListener("click", submitNewWord);
}
function normalizeWordEntry(w, id) {
  return {
    id, char: w.char, pinyin: w.pinyin, hanviet: w.hanviet, pos: w.pos,
    meaning: w.meaning, meaning_en: w.meaning_en, def_zh: w.def_zh || w.meaning, hsk: w.hsk,
    cumtu: w.cumtu || [], examples: w.examples || [],
    mc: w.mc || [], unscramble: w.unscramble || [], fill: w.fill || [],
    chietu_vi: w.chietu_vi || "", chietu_en: w.chietu_en || "", chietu_source: w.chietu_source || "Giáo viên biên soạn",
    isCustom: true,
  };
}
function submitNewWord() {
  const msg = document.getElementById("addWordMsg");
  const val = id => document.getElementById(id).value.trim();
  const char = val("nwChar"), pinyin = val("nwPinyin"), hanviet = val("nwHanviet"),
    pos = val("nwPos"), hsk = Number(val("nwHsk")), meaning = val("nwMeaningVi"), meaning_en = val("nwMeaningEn"),
    exZh = val("nwExZh"), exPinyin = val("nwExPinyin"), exTr = val("nwExTr"), chietuVi = val("nwChietuVi"), chietuEn = val("nwChietuEn");
  if (!char || !pinyin || !hanviet || !meaning || !meaning_en || !chietuVi || !chietuEn) {
    msg.style.color = "#dc2626";
    msg.textContent = L("⚠️ Vui lòng điền đủ các trường có dấu *.", "⚠️ Please fill in all fields marked *.");
    return;
  }
  if (VOCAB_BY_CHAR[char]) {
    msg.style.color = "#dc2626";
    msg.textContent = L(`⚠️ Từ "${char}" đã tồn tại trong từ điển.`, `⚠️ "${char}" already exists in the dictionary.`);
    return;
  }
  let examples = [];
  if (exZh) {
    const parts = exTr.split("/").map(s => s.trim());
    examples = [[exZh, exPinyin || "", parts[0] || "", parts[1] || parts[0] || ""]];
  }
  const raw = { char, pinyin, hanviet, pos, meaning, meaning_en, hsk, examples,
    chietu_vi: chietuVi, chietu_en: chietuEn, chietu_source: "Giáo viên biên soạn", isCustom: true };
  const custom = loadCustomWords();
  custom.push(raw);
  saveCustomWords(custom);
  const normalized = normalizeWordEntry(raw, VOCAB.length);
  VOCAB.push(normalized);
  VOCAB_BY_CHAR[char] = normalized;
  msg.style.color = "#16a34a";
  msg.textContent = L(`✅ Đã thêm "${char}" vào từ điển HSK${hsk}!`, `✅ "${char}" added to the HSK${hsk} dictionary!`);
  ["nwChar","nwPinyin","nwHanviet","nwMeaningVi","nwMeaningEn","nwExZh","nwExPinyin","nwExTr","nwChietuVi","nwChietuEn"].forEach(id => document.getElementById(id).value = "");
  renderCustomWordsList();
  updateHeaderStats();
  renderGrids();
}
function renderCustomWordsList() {
  const el = document.getElementById("customWordsList");
  if (!el) return;
  const custom = loadCustomWords();
  if (!custom.length) {
    el.innerHTML = `<div style="font-size:12.5px;color:var(--text-light);">${L("Chưa có từ nào được giáo viên thêm.","No teacher-added words yet.")}</div>`;
    return;
  }
  el.innerHTML = custom.map((w, i) => `<div style="display:flex;justify-content:space-between;align-items:center;background:#fafcfe;border:1px solid var(--hsk2-light);border-radius:10px;padding:8px 12px;">
    <div><b>${esc(w.char)}</b> · ${esc(w.pinyin)} · ${esc(L(w.meaning, w.meaning_en))} <span style="color:var(--text-light);font-size:11px;">(HSK${w.hsk})</span></div>
    <button data-idx="${i}" class="del-custom-word" style="background:#fee2e2;color:#991b1b;border:none;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:11px;">🗑️</button>
  </div>`).join("");
  el.querySelectorAll(".del-custom-word").forEach(b => {
    b.addEventListener("click", () => {
      const idx = Number(b.dataset.idx);
      const list = loadCustomWords();
      const removed = list.splice(idx, 1)[0];
      saveCustomWords(list);
      delete VOCAB_BY_CHAR[removed.char];
      const pos = VOCAB.findIndex(w => w.char === removed.char);
      if (pos !== -1) VOCAB.splice(pos, 1);
      renderCustomWordsList();
      updateHeaderStats();
      renderGrids();
    });
  });
}

/* ===================== AUTH: login / logout ===================== */
function applyRoleUI() {
  if (!CURRENT_USER) return;
  const teacherTab = document.getElementById("teacherTabBtn");
  const sbName = document.getElementById("sidebarUserName");
  const sbAvatar = document.getElementById("sidebarUserAvatar");
  
  const name = CURRENT_USER.name || CURRENT_USER.displayName || "Học viên";
  const photo = CURRENT_USER.photoURL || CURRENT_USER.picture || "";

  if (sbName) {
    let roleText = "";
    if (USER_ROLE === "teacher") roleText = " (Giáo viên)";
    else if (USER_ROLE === "master_teacher") roleText = " (Trung tâm)";
    sbName.textContent = name + roleText;
  }
  if (sbAvatar) {
    if (photo) sbAvatar.innerHTML = `<img src="${photo}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;">`;
    else sbAvatar.textContent = name.charAt(0).toUpperCase();
  }
  if (teacherTab) teacherTab.style.display = (USER_ROLE === "teacher" || USER_ROLE === "master_teacher") ? "flex" : "none";
  // Nút thêm từ chỉ Master (Trung tâm) mới thấy
  const addWordBtn = document.getElementById("openAddWordBtn");
  if (addWordBtn) addWordBtn.style.display = USER_ROLE === "master_teacher" ? "block" : "none";
  // Cập nhật title dashboard theo role
  const teacherTitle = document.querySelector("#teacherView h2");
  if (teacherTitle) {
    teacherTitle.textContent = USER_ROLE === "master_teacher" 
      ? "🏛️ Trung tâm quản lý / Center Dashboard" 
      : "👨‍🏫 Bảng điều khiển Giáo viên / Teacher Dashboard";
  }
}

function toggleHsk(level) {
  const grid = document.getElementById("hsk" + level + "Grid");
  if (grid) {
    const isHidden = grid.style.display === "none" || !grid.style.display;
    grid.style.display = isHidden ? "grid" : "none";
  }
}
function reloadUserData() {
  STORE_KEY = "pandahan_pro_stats_v1_" + storageNamespace();
  LOG_KEY = "pandahan_pro_log_v1_" + storageNamespace();
  STATS = loadStats();
  ACTLOG = loadLog();
}
function completeLogin(user) {
  if (!user) return;
  CURRENT_USER = user;
  USER_ROLE = user.role || "student"; // Cập nhật role toàn cục
  setSession(user.username || user.uid);
  reloadUserData();
  if (typeof loadData === "function") loadData(); // Fetch cloud data immediately
  startSessionTracking();
  const loginScr = document.getElementById("loginScreen");
  if (loginScr) loginScr.style.display = "none";
  const proAuth = document.getElementById("proAuthOverlay");
  if (proAuth) proAuth.style.display = "none";
  const appEl = document.getElementById("app");
  if (appEl) appEl.style.display = "block";
  applyRoleUI();
  updateHeaderStats();
  renderGrids();
  if (typeof renderMergedHistory === "function") renderMergedHistory();
  if (USER_ROLE === "teacher" || USER_ROLE === "master_teacher") switchTab("teacher"); else switchTab("browse");
  if (typeof checkStreakWarning === "function") checkStreakWarning();
  if (typeof updateNotifBell === "function") updateNotifBell();
}
function consumePendingFirebaseAuth() {
  const pending = window.__PANDAHAN_PENDING_AUTH_USER;
  if (!pending || typeof completeLogin !== "function") return;
  try { delete window.__PANDAHAN_PENDING_AUTH_USER; } catch (_) { window.__PANDAHAN_PENDING_AUTH_USER = null; }
  completeLogin(pending);
}
window.addEventListener("pandahan-auth-pending", consumePendingFirebaseAuth);
consumePendingFirebaseAuth();
function attemptLogin() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  const errEl = document.getElementById("loginError");
  const u = findUser(username);
  if (!u || u.password !== password) {
    errEl.textContent = L("Sai tên đăng nhập hoặc mật khẩu.", "Wrong username or password.");
    errEl.style.display = "block";
    return;
  }
  if (isLocked(u.username)) {
    errEl.textContent = L("Tài khoản này đã bị khóa. Liên hệ giáo viên.", "This account has been locked. Contact your teacher.");
    errEl.style.display = "block";
    return;
  }
  errEl.style.display = "none";
  completeLogin(u);
}
async function doLogout() {
  // Force sync trước khi logout
  finalizeSession();
  clearSession();
  if (auth) {
      try {
          await auth.signOut();
      } catch(e) { console.error("SignOut error:", e); }
  }
  CURRENT_USER = null;
  location.reload();
}

/* ===================== INIT / EVENT WIRING ===================== */
document.addEventListener("DOMContentLoaded", () => {
  const safeAdd = (id, evt, fn) => { const el = document.getElementById(id); if (el) el.addEventListener(evt, fn); };
  const appEl = document.getElementById("app");
  const loginScr = document.getElementById("loginScreen");
  const proAuth = document.getElementById("proAuthOverlay");

  // ─── F5 FIX: KHÔNG show overlay ngay, đợi onAuthStateChanged quyết định ───
  // Khi F5, Firebase restore session async → CURRENT_USER null tạm thời
  // → onAuthStateChanged sẽ hiện overlay hoặc show app sau khi auth resolve
  if (CURRENT_USER) {
    if (loginScr) loginScr.style.display = "none";
    if (proAuth) proAuth.style.display = "none";
    if (appEl) appEl.style.display = "block";
    applyRoleUI();
    startSessionTracking();
  } else if (typeof TEST_OPEN_ACCESS !== "undefined" && TEST_OPEN_ACCESS) {
    // Bản test mở: không chờ Firebase và không hiển thị màn hình đăng nhập.
    if (proAuth) proAuth.style.display = "none";
    if (appEl) appEl.style.display = "block";
  } else {
    if (appEl) appEl.style.display = "none";
    // Trạng thái chưa xác thực: hiển thị Auth overlay, không để trang chỉ còn nền hoa.
    if (proAuth) proAuth.style.display = "flex";
  }
  
  const loginBtn = document.getElementById("loginSubmitBtn");
  if (loginBtn) loginBtn.addEventListener("click", attemptLogin);
  
  const loginPass = document.getElementById("loginPassword");
  if (loginPass) loginPass.addEventListener("keydown", (e) => { if (e.key === "Enter") attemptLogin(); });
  
  const loginUser = document.getElementById("loginUsername");
  if (loginUser) loginUser.addEventListener("keydown", (e) => { if (e.key === "Enter") attemptLogin(); });
  
  // Chỉ khởi tạo Google Sign-In khi bật lại chế độ xác thực.
  if (typeof TEST_OPEN_ACCESS !== "undefined" && !TEST_OPEN_ACCESS && typeof initGoogleSignIn === "function" && !CURRENT_USER) initGoogleSignIn();
  safeAdd("notifBellBtn", "click", (e) => {
    e.stopPropagation();
    if (typeof updateNotifBell === "function") updateNotifBell();
    const dd = document.getElementById("notifDropdown");
    if (dd) dd.style.display = dd.style.display === "block" ? "none" : "block";
  });
  document.addEventListener("click", () => {
    const ndd = document.getElementById("notifDropdown"); if (ndd) ndd.style.display = "none";
    const sdd = document.getElementById("sidebarUserDropdown"); if (sdd) sdd.style.display = "none";
  });
  safeAdd("sidebarUserBadge", "click", (e) => {
    e.stopPropagation();
    const dd = document.getElementById("sidebarUserDropdown");
    if (dd) dd.style.display = dd.style.display === "block" ? "none" : "block";
  });
  safeAdd("sidebarLogoutBtnReal", "click", (e) => {
    e.stopPropagation();
    if (confirm(L("Đăng xuất khỏi tài khoản hiện tại?", "Log out of the current account?"))) {
      if (typeof doLogout === "function") doLogout();
    }
  });
  const teacherBackBtn = document.getElementById("teacherDetailBack");
  if (teacherBackBtn) teacherBackBtn.addEventListener("click", () => showScreen("teacher"));

  safeAdd("range7Btn", "click", () => {
    dashChartRange = 7;
    const b7 = document.getElementById("range7Btn"), b30 = document.getElementById("range30Btn");
    if (b7) b7.classList.add("active"); if (b30) b30.classList.remove("active");
    if (typeof renderActivityChart === "function") renderActivityChart(7);
  });
  safeAdd("range30Btn", "click", () => {
    dashChartRange = 30;
    const b7 = document.getElementById("range7Btn"), b30 = document.getElementById("range30Btn");
    if (b30) b30.classList.add("active"); if (b7) b7.classList.remove("active");
    if (typeof renderActivityChart === "function") renderActivityChart(30);
  });

  if (typeof populatePosFilter === "function") populatePosFilter();
  const ll = document.getElementById("langLabel"); if (ll) ll.textContent = LANG_MODE === "vi" ? "Tiếng Việt" : "English";
  const ltb = document.getElementById("langToggleBtn");
  if (ltb) {
    ltb.textContent = LANG_MODE === "vi" ? "🌐 中文 - Tiếng Việt ▾" : "🌐 中文 - English ▾";
    ltb.addEventListener("click", () => { if (typeof setLangMode === "function") setLangMode(LANG_MODE === "vi" ? "en" : "vi"); });
  }
  // ─── Sync khi user quay lại tab ───
  // Chỉ loadData (tải từ cloud), KHÔNG syncDataNow (tránh ghi đè data mới của mình)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && CURRENT_USER) {
      if (typeof loadData === "function") loadData();
    }
  });

  // Sync khi tab đóng hoặc reload
  window.addEventListener("beforeunload", () => {
    if (CURRENT_USER) {
      if (typeof finalizeSession === "function") finalizeSession();
    }
  });

  setTimeout(() => { if (typeof initCherryBlossoms === "function") initCherryBlossoms(); }, 1000);
  // F5 FIX: chỉ renderGrids khi có user (completeLogin sẽ render lại khi auth xong)
  if (CURRENT_USER && typeof renderGrids === "function") renderGrids();

  document.querySelectorAll(".nav-tabs button").forEach(b => b.addEventListener("click", () => switchTab(b.dataset.tab)));
  safeAdd("searchInput", "input", renderGrids);
  safeAdd("posFilter", "change", renderGrids);
  safeAdd("tierFilter", "change", renderGrids);

  safeAdd("detailBack", "click", () => { currentDetailChar = null; showScreen("browse"); });
  safeAdd("dReviewBtn", "click", () => { if (typeof startReviewForWord === "function") startReviewForWord(currentDetailChar); });
  safeAdd("dQuizBtn", "click", () => { if (typeof startQuizForWord === "function") startQuizForWord(currentDetailChar); });
  safeAdd("dUnscrambleBtn", "click", () => { if (typeof startUnscrambleForWord === "function") startUnscrambleForWord(currentDetailChar); });

  safeAdd("qExitBtn", "click", () => { 
    if (typeof clearQuizTimer === "function") clearQuizTimer(); 
    if (typeof stopAdvancedSetTimer === "function") stopAdvancedSetTimer(); 
    inAdvancedSetMode = false; switchTab("browse"); 
  });
  safeAdd("fcExitBtn", "click", () => switchTab("browse"));
  safeAdd("uExitBtn", "click", () => { 
    if (typeof stopAdvancedSetTimer === "function") stopAdvancedSetTimer(); 
    inAdvancedSetMode = false; switchTab("browse"); 
  });

  safeAdd("fcAudioBtn", "click", (e) => { if (typeof speak === "function") speak(e.target.dataset.speak); });
  safeAdd("fcRevealBtn", "click", () => {
    const fch = document.getElementById("fcHidden"); if (fch) fch.classList.add("show");
    const frb = document.getElementById("fcRevealBtn"); if (frb) frb.style.display = "none";
    const fac = document.getElementById("fcActions"); if (fac) fac.style.display = "flex";
    if (typeof computeAutoQuality === "function") {
      const auto = computeAutoQuality(fcQueue[fcIdx]);
      const assessEl = document.getElementById("fcAutoAssess");
      if (assessEl) {
        if (auto.quality === null) {
          assessEl.innerHTML = L(
            `📊 Chưa thể chấm tự động: <b>${auto.label}</b> (hãy làm bài có chấm điểm hôm nay; hệ thống không dùng tự đánh giá)`,
            `📊 Cannot grade automatically: <b>${auto.label}</b> (complete a scored activity today; self-assessment is not used)`
          );
        } else {
          assessEl.innerHTML = L(
            `📊 Điểm SM-2 hôm nay: <b>${auto.label}</b> · ${auto.dailyAverage.toFixed(1)}/5 · ${auto.dailyCount} lượt`,
            `📊 Today's SM-2 score: <b>${auto.label}</b> · ${auto.dailyAverage.toFixed(1)}/5 · ${auto.dailyCount} attempt(s)`
          );
        }
      }
      const fcb = document.getElementById("fcContinueBtn");
      if (fcb) {
        fcb.dataset.grade = auto.quality === null ? "" : String(auto.quality);
        fcb.disabled = auto.quality === null;
      }
    }
  });
  safeAdd("fcContinueBtn", "click", (e) => {
    const grade = Number(e.currentTarget.dataset.grade);
    if (!Number.isFinite(grade) || grade < 1 || grade > 5) {
      alert(L("Chưa có điểm SM-2 hôm nay cho từ này. Hãy làm bài có chấm điểm trước; hệ thống không dùng tự đánh giá.", "There is no SM-2 score for this word today. Complete a scored activity first; self-assessment is not used."));
      return;
    }
    const char = fcQueue[fcIdx];
    const prevTier = getTier(char);
    if (typeof gradeWord === "function") gradeWord(char, grade);
    const newTier = getTier(char);
    const leveledUp = newTier > prevTier;
    if (typeof playTing === "function") playTing(leveledUp ? "levelup" : (grade >= 4 ? "correct" : "wrong"));
    if (typeof reactMascot === "function") reactMascot(grade);
    if (typeof updateStreak === "function") updateStreak(grade);
    if (grade >= 4) fcCorrect++; else fcWrong++;
    if (grade === 5 || leveledUp || (typeof fcStreak !== "undefined" && fcStreak > 0 && fcStreak % 5 === 0)) {
      const fcc = document.getElementById("fcCard"); if (fcc && typeof burstConfetti === "function") burstConfetti(fcc);
      if (leveledUp && typeof playFanfare === "function") playFanfare();
    }
    fcIdx++;
    setTimeout(() => { if (typeof showFlashcard === "function") showFlashcard(); }, grade >= 4 ? 550 : 300);
  });
  safeAdd("fcEndBtn", "click", () => switchTab("dashboard"));

  safeAdd("pCardMc", "click", () => {
    const filter = document.getElementById("practiceHskFilter");
    if (typeof startQuizLevel === "function") startQuizLevel(filter ? filter.value : "all");
  });
  safeAdd("pCardUnscramble", "click", () => {
    const filter = document.getElementById("practiceHskFilter");
    if (typeof startUnscrambleLevel === "function") startUnscrambleLevel(filter ? filter.value : "all");
  });
  safeAdd("pCardMatch", "click", () => { if (typeof startMatchGame === "function") startMatchGame(); });
  safeAdd("pCardWrite", "click", () => { if (typeof startWriteGame === "function") startWriteGame(); });
  safeAdd("uAudioBtn", "click", (e) => { if (typeof speak === "function") speak(e.target.dataset.speak); });
  safeAdd("uSubmitBtn", "click", () => { if (typeof checkUnscramble === "function") checkUnscramble(); });
  safeAdd("uNextBtn", "click", () => { if (typeof nextUnscramble === "function") nextUnscramble(); });

  safeAdd("pCardAdvanced", "click", () => {
    const pg = document.querySelector("#practiceTab .practice-grid"); if (pg) pg.style.display = "none";
    const gc = document.getElementById("gameContainer"); if (gc) gc.style.display = "none";
    const asv = document.getElementById("advancedSetsView"); if (asv) asv.style.display = "block";
    if (typeof renderAdvancedSetsList === "function") renderAdvancedSetsList();
  });
  safeAdd("pCardToneRace", "click", () => { if (typeof startToneRaceGame === "function") startToneRaceGame(); });
  safeAdd("advancedSetsBack", "click", () => {
    const asv = document.getElementById("advancedSetsView"); if (asv) asv.style.display = "none";
    const pg = document.querySelector("#practiceTab .practice-grid"); if (pg) pg.style.display = "";
    const gc = document.getElementById("gameContainer"); if (gc) gc.style.display = "";
  });

  // HSK section toggle logic
  document.querySelectorAll(".hsk-section").forEach(section => {
    section.addEventListener("click", () => {
      const grid = section.nextElementSibling;
      if (grid && grid.classList.contains("grid")) {
        const isHidden = grid.style.display === "none" || !grid.style.display;
        grid.style.display = isHidden ? "grid" : "none";
        section.classList.toggle("collapsed", !isHidden);
      }
    });
  });

  if (typeof logActivity === "function") logActivity("🐼 Chào mừng đến với PandaHán Pro! / Welcome to PandaHán Pro!");
});

/* ===================== ADVANCED PRACTICE SETS (HSK3+) ===================== */
function renderAdvancedSetsList() {
  const el = document.getElementById("advancedSetsList");
  if (!el) return;
  el.innerHTML = ADVANCED_SETS.map(s => {
    return `<div style="background:#fafcfe;border:2px solid var(--hsk3-light);border-radius:14px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
      <div>
        <div style="font-weight:700;">${esc(L(s.title, s.titleEn))}</div>
        <div style="font-size:12px;color:var(--text-light);margin-top:2px;">📝 ${L("~40 câu (trắc nghiệm/điền từ + hội thoại sắp xếp)", "~40 questions (MC/cloze + dialogue reorder)")} · ⏱️ ${L("60 phút, không giới hạn thời gian từng câu", "60 min total, no per-question timer")}</div>
      </div>
      <button class="btn btn-hsk3" data-set="${s.id}" style="font-size:12.5px;">▶️ ${L("Bắt đầu", "Start")}</button>
    </div>`;
  }).join("");
  el.querySelectorAll("button[data-set]").forEach(b => {
    b.addEventListener("click", () => startAdvancedSet(Number(b.dataset.set)));
  });
}
function startAdvancedSet(setId) {
  const set = ADVANCED_SETS.find(s => s.id === setId);
  if (!set) return;
  // Mirrors real HSK4 阅读 (Reading) section proportions: ~30 cloze/comprehension
  // MC questions (选词填空 + 阅读理解) + ~10 sentence-ordering questions (排序) = 40 total.
  quizQueue = buildFullAdvancedMcQueue(set, 30);
  pendingDialogueQueue = buildFullAdvancedDialogueQueue(set, 10);
  postQuizGoToReview = false;
  pendingFlashcardQueue = null;
  quizScore = 0;
  currentAdvancedSetId = setId;
  advancedMcTotal = quizQueue.length;
  advancedDlgScore = 0;
  advancedDlgTotal = 0;
  inAdvancedSetMode = true;
  document.getElementById("advancedSetsView").style.display = "none";
  runQuiz();
  startAdvancedSetTimer();
}
/* Pads a set's hand-authored MC questions up to targetMc using the same dynamic
   question generator (genReadingQuestions) used elsewhere in the app, sourced
   from other words at the set's HSK level — so growing to 40 questions/set
   doesn't require hand-authoring hundreds of new items, while every question
   still gets a real explanation (via explainAnswer's existing logic). */
function buildFullAdvancedMcQueue(set, targetMc) {
  targetMc = targetMc || 30;
  const authored = set.mcQuestions.slice();
  const usedChars = new Set(authored.map(q => q.char));
  const setHskLevels = [...new Set(set.mcQuestions.map(q => VOCAB_BY_CHAR[q.char] ? VOCAB_BY_CHAR[q.char].hsk : 3))];
  const pool = shuffle(VOCAB.filter(w => setHskLevels.includes(w.hsk) && !usedChars.has(w.char)));
  const padded = [];
  for (const w of pool) {
    if (authored.length + padded.length >= targetMc) break;
    const qs = genReadingQuestions(w).filter(q => q.genre === "comprehension");
    if (qs.length) { padded.push({ ...shuffle(qs)[0], char: w.char }); usedChars.add(w.char); }
  }
  return authored.concat(padded);
}
/* Pads a set's 2 hand-authored dialogues up to targetCount using every word's
   own pre-authored unscramble sentence bank (all 604 words already have this —
   see w.unscramble), matching HSK4's 排序 (sentence-ordering) section. */
function buildFullAdvancedDialogueQueue(set, targetCount) {
  targetCount = targetCount || 10;
  const authored = set.dialogueQuestions.slice();
  const usedChars = new Set(authored.map(d => d.char));
  const setHskLevels = [...new Set(set.mcQuestions.map(q => VOCAB_BY_CHAR[q.char] ? VOCAB_BY_CHAR[q.char].hsk : 3))];
  const pool = shuffle(VOCAB.filter(w => setHskLevels.includes(w.hsk) && !usedChars.has(w.char) && w.unscramble && w.unscramble.length));
  const padded = [];
  for (const w of pool) {
    if (authored.length + padded.length >= targetCount) break;
    padded.push({ ...shuffle(w.unscramble)[0], char: w.char });
    usedChars.add(w.char);
  }
  return shuffle(authored.concat(padded));
}

/* ===================== CERTIFICATE: teacher-style grading for a completed advanced set ===================== */
function gradeBandFromPct(pct) {
  if (pct >= 90) return { grade: "A+", label: "Xuất sắc", labelEn: "Excellent", color: "#f59e0b",
    vi: "Tư duy xuất sắc, sáng tạo và không có sai sót.", en: "Excellent work. Outstanding understanding and highly creative." };
  if (pct >= 80) return { grade: "A / A-", label: "Giỏi", labelEn: "Very Good", color: "#16a34a",
    vi: "Học tốt, hiểu bài sâu và làm bài chắc chắn. Thiếu một chút đột phá để đạt điểm tối đa.", en: "Very good. Strong understanding, with minor room for improvement." };
  if (pct >= 70) return { grade: "B+ / B", label: "Khá", labelEn: "Good", color: "#3498db",
    vi: "Khá tốt, nắm vững kiến thức cơ bản. Cần đầu tư sâu hơn vào phần phân tích.", en: "Good effort. Core concepts are clear, but needs deeper analysis." };
  if (pct >= 50) return { grade: "C / D", label: "Trung bình", labelEn: "Average", color: "#f97316",
    vi: "Đạt yêu cầu tối thiểu. Bài làm còn sơ sài, cần tập trung và cố gắng nhiều hơn.", en: "Average. Meets minimum requirements. More effort needed." };
  return { grade: "F", label: "Kém / Trượt", labelEn: "Fail", color: "#dc2626",
    vi: "Chưa đạt. Hổng kiến thức nghiêm trọng, cần học lại hoặc phụ đạo thêm.", en: "Failed. Insufficient understanding. Requires a retake or extra help." };
}
function certRingStyle(pct, color) {
  return `background:conic-gradient(${color} ${pct * 3.6}deg, #f1f2f6 0deg); border-radius:50%; display:flex; align-items:center; justify-content:center;`;
}
function buildCertificateHtml(rec) {
  const band = gradeBandFromPct(rec.pct);
  const studentName = CURRENT_USER ? L(CURRENT_USER.name, CURRENT_USER.nameEn) : "—";
  const birdSvg = `<svg class="cert-deco tl" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg"><path d="M5 40 Q20 20 35 30 Q45 15 60 22" stroke="#e8a2c4" stroke-width="1.4" fill="none"/><path d="M62 20 l6 -3 l-2 6 l6 1 l-6 3 l1 6 l-5 -4 l-4 5 l-1 -6 l-6 -1 l5 -4 l-3 -5 z" fill="#f6d3e4"/></svg>`;
  const pandaSeal = `<svg width="24" height="24" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#fff"/><ellipse cx="15" cy="14" rx="6" ry="6" fill="#2d3448"/><ellipse cx="33" cy="14" rx="6" ry="6" fill="#2d3448"/><circle cx="24" cy="26" r="15" fill="#fff" stroke="#2d3448" stroke-width="1.5"/><ellipse cx="17" cy="25" rx="4" ry="5.5" fill="#2d3448"/><ellipse cx="31" cy="25" rx="4" ry="5.5" fill="#2d3448"/><circle cx="24" cy="30" r="2.4" fill="#2d3448"/></svg>`;
  return `<div class="cert-wrap"><div class="cert-card">
    ${birdSvg}${birdSvg.replace('class="cert-deco tl"', 'class="cert-deco tr"')}
    <div class="cert-brand">熊猫语言</div>
    <div class="cert-brand-sub">PandaHán Pro</div>
    <div class="cert-rule"></div>
    <div class="cert-mascot">${pandaSeal.replace('width="24" height="24"', 'width="42" height="42"')}</div>
    <div class="cert-ribbon">获奖证书</div>
    <div class="cert-title">${L("Chứng chỉ hoàn thành", "Certificate of Completion")}</div>
    <div class="cert-subtitle">《${esc(L(rec.setTitle, rec.setTitleEn))}》</div>
    <div class="cert-subtitle-en">${L("Đề HSK3 3.0", "HSK3 3.0")}</div>
    <div class="cert-name-lbl">${L("Học viên · Student", "Học viên · Student")}</div>
    <div class="cert-name">${esc(studentName)}</div>
    <div class="cert-setname">${L("đã hoàn thành bài luyện tập trên với kết quả sau", "has completed the above exercise with the following result")}</div>
    <div class="cert-score-ring" style="${certRingStyle(rec.pct, band.color)}">
      <span><span class="pct" style="color:${band.color};">${rec.pct}%</span><span class="grade">${band.grade}</span></span>
    </div>
    <div class="cert-label" style="color:${band.color};">${L(band.label, band.labelEn)}</div>
    <div style="font-size:11px;color:#a9899a;">${L(`Đúng ${rec.mcScore}/${rec.mcTotal} câu trắc nghiệm/điền từ · ${rec.dlgScore}/${rec.dlgTotal} hội thoại sắp xếp`, `${rec.mcScore}/${rec.mcTotal} MC/cloze correct · ${rec.dlgScore}/${rec.dlgTotal} dialogue reorders correct`)}</div>
    <div class="cert-feedback">📝 ${L(band.vi, band.en)}</div>
    <div class="cert-seal">
      <div class="cert-seal-icon">${pandaSeal}</div>
      <div class="cert-seal-text">PandaHán Pro<br>HSK 1-2-3 Cultural Mnemonics</div>
    </div>
    <div class="cert-date">${new Date(rec.date).toLocaleDateString("vi-VN")}</div>
  </div></div>`;
}
function showAdvancedSetCertificate() {
  stopAdvancedSetTimer();
  inAdvancedSetMode = false;
  const set = ADVANCED_SETS.find(s => s.id === currentAdvancedSetId);
  const mcTotal = advancedMcTotal, dlgTotal = advancedDlgTotal;
  const totalQ = mcTotal + dlgTotal;
  const pct = totalQ ? Math.round(((quizScore + advancedDlgScore) / totalQ) * 100) : 0;
  const rec = {
    setId: currentAdvancedSetId,
    setTitle: set ? set.title : "",
    setTitleEn: set ? set.titleEn : "",
    pct, mcScore: quizScore, mcTotal, dlgScore: advancedDlgScore, dlgTotal,
    date: Date.now()
  };
  const container = document.getElementById("certContainer");
  container.innerHTML = buildCertificateHtml(rec) +
    `<div class="cert-actions">
      <button class="btn btn-hsk3" id="certSaveBtn">💾 ${L("Lưu vào Tiến độ", "Save to Progress")}</button>
      <button class="btn btn-outline" id="certDoneBtn">${L("Xong", "Done")}</button>
    </div>`;
  document.getElementById("advancedSetsView").style.display = "none";
  showScreen("certificate");
  document.getElementById("certSaveBtn").addEventListener("click", () => {
    saveCertificate(rec);
    document.getElementById("certSaveBtn").textContent = "✅ " + L("Đã lưu!", "Saved!");
    document.getElementById("certSaveBtn").disabled = true;
  });
  document.getElementById("certDoneBtn").addEventListener("click", () => switchTab("practice"));
  logActivity(`🎓 Hoàn thành ${L(rec.setTitle, rec.setTitleEn)} — ${pct}% (${gradeBandFromPct(pct).grade})`);
  savePracticeCompletion(pct, "advanced-set");
}
function getSavedCertificates() {
  try { return JSON.parse(localStorage.getItem("pandahan_certs_v1_" + storageNamespace())) || []; }
  catch (e) { return []; }
}
function saveCertificate(rec) {
  const list = getSavedCertificates();
  list.unshift(rec);
  localStorage.setItem("pandahan_certs_v1_" + storageNamespace(), JSON.stringify(list.slice(0, 50)));
  renderSavedCerts();
}
function renderSavedCerts() {
  const el = document.getElementById("savedCertsList");
  if (!el) return;
  const list = getSavedCertificates();
  if (!list.length) {
    el.innerHTML = `<div style="font-size:12.5px;color:var(--text-light);">${L("Chưa có chứng chỉ nào được lưu. Hoàn thành 1 Đề nâng cao ở tab Luyện tập để nhận chứng chỉ!", "No certificates saved yet. Complete an Advanced Set in the Practice tab to earn one!")}</div>`;
    return;
  }
  el.innerHTML = list.map((rec, i) => {
    const band = gradeBandFromPct(rec.pct);
    return `<div class="cert-mini" data-idx="${i}">
      <div>
        <div style="font-weight:700;font-size:13px;">${esc(L(rec.setTitle, rec.setTitleEn))}</div>
        <div style="font-size:11px;color:var(--text-light);">${new Date(rec.date).toLocaleDateString("vi-VN")}</div>
      </div>
      <div style="font-weight:800;color:${band.color};">${rec.pct}% · ${band.grade}</div>
    </div>`;
  }).join("");
  el.querySelectorAll(".cert-mini").forEach(elm => {
    elm.addEventListener("click", () => {
      const rec = list[Number(elm.dataset.idx)];
      document.getElementById("certContainer").innerHTML = buildCertificateHtml(rec) +
        `<div class="cert-actions"><button class="btn btn-outline" id="certDoneBtn2">${L("Đóng", "Close")}</button></div>`;
      showScreen("certificate");
      document.getElementById("certDoneBtn2").addEventListener("click", () => {
        switchTab("dashboard");
      });
    });
  });
}

/* ===================== MINI GAMES: Tone Race ===================== */
let toneRaceState = null;
const TONE_MARKS = { a:"āáǎà", e:"ēéěè", i:"īíǐì", o:"ōóǒò", u:"ūúǔù", ü:"ǖǘǚǜ" };
const TONE_INDEX = {"ā":1,"á":2,"ǎ":3,"à":4,"ē":1,"é":2,"ě":3,"è":4,"ī":1,"í":2,"ǐ":3,"ì":4,"ō":1,"ó":2,"ǒ":3,"ò":4,"ū":1,"ú":2,"ǔ":3,"ù":4,"ǖ":1,"ǘ":2,"ǚ":3,"ǜ":4};
function toneNumberFromPinyin(value) { const mark = String(value || "").split("").find((c) => TONE_INDEX[c]); if (mark) return TONE_INDEX[mark]; const digit = String(value || "").match(/[1-4]/); return digit ? Number(digit[0]) : 0; }
function stripPinyinTone(value) { return String(value || "").replace(/[āáǎà]/g,"a").replace(/[ēéěè]/g,"e").replace(/[īíǐì]/g,"i").replace(/[ōóǒò]/g,"o").replace(/[ūúǔù]/g,"u").replace(/[ǖǘǚǜ]/g,"ü").replace(/[1-5]/g,""); }
function markPinyinTone(base, tone) {
  const clean = stripPinyinTone(base); if (!tone || tone === 5) return clean;
  let idx = clean.indexOf("a"); if (idx < 0) idx = clean.indexOf("e"); if (idx < 0) { const ou = clean.indexOf("ou"); idx = ou >= 0 ? ou + 1 : -1; }
  if (idx < 0) { for (let i = clean.length - 1; i >= 0; i -= 1) if ("aeiouü".includes(clean[i])) { idx = i; break; } }
  if (idx < 0) return clean;
  const vowel = clean[idx]; return clean.slice(0, idx) + (TONE_MARKS[vowel]?.[tone - 1] || vowel) + clean.slice(idx + 1);
}
function makeMissionToneQuestion(word) {
  const tone = toneNumberFromPinyin(word?.pinyin); if (!tone || !word?.char) return null;
  const syllable = stripPinyinTone(word.pinyin);
  return { char: word.char, meaning: word.meaning || "", meaningEn: word.meaning_en || "", syllable, pinyin: word.pinyin, tone, hsk: word.hsk, emoji: "🀄", options: [1,2,3,4].map((n) => markPinyinTone(syllable, n)) };
}
const TONE_RACE_BANK = [
  { char:"妈", meaning:"mẹ", meaningEn:"mother", syllable:"ma", pinyin:"mā", tone:1, hsk:1, emoji:"👩", options:["mā","má","mǎ","mà"] },
  { char:"麻", meaning:"cây gai / tê", meaningEn:"hemp / numb", syllable:"ma", pinyin:"má", tone:2, hsk:3, emoji:"🌿", options:["mā","má","mǎ","mà"] },
  { char:"马", meaning:"ngựa", meaningEn:"horse", syllable:"ma", pinyin:"mǎ", tone:3, hsk:1, emoji:"🐴", options:["mā","má","mǎ","mà"] },
  { char:"骂", meaning:"mắng", meaningEn:"scold", syllable:"ma", pinyin:"mà", tone:4, hsk:3, emoji:"😤", options:["mā","má","mǎ","mà"] },
  { char:"书", meaning:"sách", meaningEn:"book", syllable:"shu", pinyin:"shū", tone:1, hsk:1, emoji:"📖", options:["shū","shú","shǔ","shù"] },
  { char:"学", meaning:"học", meaningEn:"study", syllable:"xue", pinyin:"xué", tone:2, hsk:1, emoji:"📚", options:["xuē","xué","xuě","xuè"] },
  { char:"你", meaning:"bạn", meaningEn:"you", syllable:"ni", pinyin:"nǐ", tone:3, hsk:1, emoji:"👋", options:["nī","ní","nǐ","nì"] },
  { char:"大", meaning:"lớn", meaningEn:"big", syllable:"da", pinyin:"dà", tone:4, hsk:1, emoji:"🐘", options:["dā","dá","dǎ","dà"] },
  { char:"水", meaning:"nước", meaningEn:"water", syllable:"shui", pinyin:"shuǐ", tone:3, hsk:1, emoji:"💧", options:["shuī","shuí","shuǐ","shuì"] },
  { char:"人", meaning:"người", meaningEn:"person", syllable:"ren", pinyin:"rén", tone:2, hsk:1, emoji:"🧑", options:["rēn","rén","rěn","rèn"] },
  { char:"去", meaning:"đi", meaningEn:"go", syllable:"qu", pinyin:"qù", tone:4, hsk:1, emoji:"🚶", options:["qū","qú","qǔ","qù"] },
  { char:"吃", meaning:"ăn", meaningEn:"eat", syllable:"chi", pinyin:"chī", tone:1, hsk:1, emoji:"🍜", options:["chī","chí","chǐ","chì"] }
];
function toneRacePath(tone){
  return ({1:"8,46 25,46 42,46 59,46 76,46 94,46",2:"8,70 25,70 42,52 59,34 76,22 94,16",3:"8,26 25,26 42,68 59,68 76,36 94,36",4:"8,18 25,22 42,38 59,58 76,76 94,86"})[tone] || "8,46 94,46";
}
function startToneRaceGame(options = {}){
  beginPracticeSession(options);
  const grid=document.querySelector("#practiceTab .practice-grid"); if(grid) grid.style.display="none";
  const gc=document.getElementById("gameContainer"); if(!gc) return;
  gc.classList.add("visible"); gc.style.display="block"; window.scrollTo({top:0,behavior:"instant"});
  const level=document.getElementById("practiceHskFilter");
  const selected=level ? level.value : "all";
  const currentMission = window.PandaHanMission?.getCurrent?.();
  const coachQuest = options.coachQuest === true;
  const explicitPool = Array.isArray(options.words) && options.words.length ? options.words.slice() : [];
  const missionPool = explicitPool.length ? explicitPool : (currentMission?.chainVocabulary?.length ? currentMission.chainVocabulary : (window.PandaHanMission?.getTargetVocabulary?.() || []));
  const chainLaunch = coachQuest || explicitPool.length > 0 || window.PandaHanMission?.getActiveTask?.()?.type === "tone-race";
  let pool = chainLaunch ? missionPool.map(makeMissionToneQuestion).filter(Boolean) : [];
  if (chainLaunch && !pool.length) { alert(L("Chưa có từ vựng đúng theo chuỗi Ngữ âm của ngày này.", "No exact phonetics-linked words are ready for this day's chain.")); return; }
  if (!chainLaunch) {
    const missionChars = new Set(missionPool.map(w => w.char));
    pool = missionChars.size ? TONE_RACE_BANK.filter(q => missionChars.has(q.char)) : [];
    if(pool.length < 4) pool = TONE_RACE_BANK.filter(q=>selected==="all" || q.hsk===Number(selected));
    if(pool.length<4) pool=TONE_RACE_BANK.slice();
  }
  toneRaceState={queue:shuffle(pool).slice(0,Math.min(8,pool.length)),index:0,score:0,correctCount:0,streak:0,answered:false,coachQuest,runOptions:{...options}};
  renderToneRaceQuestion();
}
function renderToneRaceQuestion(){
  const gc=document.getElementById("gameContent"); if(!gc || !toneRaceState) return;
  if(toneRaceState.index>=toneRaceState.queue.length){ renderToneRaceResult(); return; }
  const q=toneRaceState.queue[toneRaceState.index]; toneRaceState.answered=false;
  const coachLabel = toneRaceState.coachQuest ? L("AI Coach · Thử thách thanh điệu", "AI Coach · Tone challenge") : L("Đua xe thanh điệu", "Tone race");
  const coachIntro = toneRaceState.coachQuest ? L("Game riêng của AI Coach dùng đúng nhóm từ theo kế hoạch; không thay đổi tiến độ Ôn tập 120 ngày.", "A separate AI Coach game using this plan's vocabulary; it does not change 120-Day Review progress.") : L("Chọn đúng đường cao độ để chiếc xe vượt qua biển báo và về đích.", "Choose the correct pitch path to drive past the signs and reach the finish.");
  gc.innerHTML=`<div class="tone-race-shell">
    <div class="tone-race-head"><div><h2>🚗 ${coachLabel}</h2><p>${coachIntro}</p></div><div class="tone-race-hud"><span class="tone-race-chip">${L("Câu", "Question")} ${toneRaceState.index+1}/${toneRaceState.queue.length}</span><span class="tone-race-chip">⭐ <b id="toneRaceScore">${toneRaceState.score}</b></span><span class="tone-race-chip">🔥 <b id="toneRaceStreak">${toneRaceState.streak}</b></span></div></div>
    <div class="tone-race-scene"><div class="tone-race-sun">☀️</div><div class="tone-race-cloud one">☁️</div><div class="tone-race-cloud two">☁️</div><div class="tone-race-hill"></div><div class="tone-race-sign">${esc(q.syllable)} + ?</div><div class="tone-race-finish">🏁</div><div class="tone-race-road"><svg id="toneRaceTonePath" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points="${toneRacePath(q.tone)}"></polyline></svg><div id="toneRaceCar">🚗</div></div></div>
    <div class="tone-race-question"><div class="tone-race-character">${q.emoji}</div><div class="tone-race-prompt"><strong>${esc(q.char)}</strong> · ${esc(L(q.meaning,q.meaningEn))}<small>${L("Âm tiết", "Syllable")}: <b>${esc(q.syllable)}</b> · ${L("Chọn thanh điệu đúng", "Choose the correct tone")}</small></div><button class="tone-race-speak" id="toneRaceSpeak" title="${L("Nghe phát âm", "Listen to pronunciation")}">🔊</button></div>
    <div class="tone-race-options">${q.options.map((opt,i)=>`<button class="tone-race-option" data-tone="${i+1}" type="button"><span class="tone-symbol">${["—","↗","∨","↘"][i]}</span><span>${esc(opt)}</span><span class="tone-label">${L("Thanh", "Tone")} ${i+1}</span></button>`).join("")}</div>
    <div class="tone-race-feedback" id="toneRaceFeedback">${L("Chọn một thẻ thanh điệu để xe bắt đầu chạy.", "Choose a tone card to start the car.")}</div>
    <div class="tone-race-actions"><button class="btn btn-outline" id="toneRaceExit" type="button">✕ ${L("Thoát", "Exit")}</button><button class="btn btn-pink" id="toneRaceNext" type="button" style="display:none;">${L("Câu tiếp theo", "Next question")} →</button></div>
  </div>`;
  document.getElementById("toneRaceSpeak").addEventListener("click",()=>speak(q.pinyin));
  document.querySelectorAll(".tone-race-option").forEach(btn=>btn.addEventListener("click",()=>answerToneRace(Number(btn.dataset.tone),btn,q)));
  document.getElementById("toneRaceNext").addEventListener("click",()=>{toneRaceState.index++;renderToneRaceQuestion();});
  document.getElementById("toneRaceExit").addEventListener("click",exitToneRace);
}
function answerToneRace(tone,button,q){
  if(!toneRaceState || toneRaceState.answered) return;
  toneRaceState.answered=true;
  const correct=tone===q.tone;
  document.querySelectorAll(".tone-race-option").forEach(b=>{b.disabled=true;if(Number(b.dataset.tone)===q.tone)b.classList.add("correct");});
  const car=document.getElementById("toneRaceCar"); const feedback=document.getElementById("toneRaceFeedback");
  if(correct){toneRaceState.score+=10+toneRaceState.streak*2;toneRaceState.correctCount++;toneRaceState.streak++;button.classList.add("correct");if(car)car.classList.add("drive");feedback.className="tone-race-feedback ok";feedback.textContent=L(`✅ Chính xác! ${q.pinyin} là thanh ${q.tone}. Xe tăng tốc về đích!`,`✅ Correct! ${q.pinyin} is Tone ${q.tone}. The car speeds to the finish!`);}else{toneRaceState.streak=0;button.classList.add("wrong");if(car)car.classList.add("bump");feedback.className="tone-race-feedback bad";feedback.textContent=L(`💡 Chưa đúng. Đáp án là ${q.pinyin} — thanh ${q.tone}. Hãy nghe lại và ghi nhớ đường cao độ.`,`💡 Not quite. The answer is ${q.pinyin} — Tone ${q.tone}. Listen again and remember the pitch path.`);}
  const s=document.getElementById("toneRaceScore");if(s)s.textContent=toneRaceState.score;const st=document.getElementById("toneRaceStreak");if(st)st.textContent=toneRaceState.streak;
  if(typeof recordQuizResult==="function" && VOCAB_BY_CHAR[q.char]) recordQuizResult(q.char,correct,{ source:toneRaceState.coachQuest ? "ai-coach-tone-quest" : "tone-race", prompt:`${q.char} · ${q.syllable}`, expected:q.pinyin, selected:button?.textContent || "" });
  const next=document.getElementById("toneRaceNext");if(next)next.style.display="inline-flex";
}
function renderToneRaceResult(){
  const gc=document.getElementById("gameContent"); if(!gc || !toneRaceState)return;
  const total=toneRaceState.queue.length; const correct=toneRaceState.correctCount; const bestKey=toneRaceState.coachQuest ? "pandahanCoachToneQuestBest" : "pandahanToneRaceBest"; const best=Math.max(Number(localStorage.getItem(bestKey)||0),toneRaceState.score);localStorage.setItem(bestKey,String(best));
  const scorePercent = total ? Math.round((correct / total) * 100) : 0;
  const chainMission = window.PandaHanMission?.getCurrent?.();
  if (!toneRaceState.coachQuest && chainMission && window.PandaHanVocabularyPhase?.completeGame) window.PandaHanVocabularyPhase.completeGame(Number(chainMission.dayNumber), (chainMission.chainVocabulary || chainMission.adaptivePlan?.introWords || chainMission.newVocab || []).map((w) => w.char), scorePercent);
  savePracticeCompletion(scorePercent, toneRaceState.coachQuest ? "ai-coach-tone-quest" : "tone-race", toneRaceState.runOptions || {});
  const resultTitle = toneRaceState.coachQuest ? L("Hoàn thành thử thách AI Coach!", "AI Coach challenge complete!") : L("Hoàn thành đường đua!", "Race complete!");
  const resultNote = toneRaceState.coachQuest ? L("Kết quả này là evidence riêng của AI Coach; tiến độ Ôn tập 120 ngày không thay đổi.", "This result is AI Coach evidence only; 120-Day Review progress does not change.") : (correct>=Math.ceil(total*.8)?L("Tuyệt vời! Bạn đã kiểm soát thanh điệu rất tốt.", "Excellent! You controlled the tones very well."):L("Hãy chơi lại một lượt để củng cố các thanh điệu còn nhầm lẫn.", "Play once more to strengthen the tones that are still confusing."));
  gc.innerHTML=`<div class="tone-race-shell"><div class="tone-race-result"><div class="result-emoji">🏆🚗</div><h3>${resultTitle}</h3><p>${L("Bạn đạt", "You scored")} <b>${toneRaceState.score} ${L("điểm", "points")}</b> ${L("trong", "in")} ${total} ${L("câu", "questions")}. ${L("Kỷ lục hiện tại", "Current best")}: <b>${best} ${L("điểm", "points")}</b>.<br>${resultNote}</p><div class="tone-race-actions"><button class="btn btn-outline" id="toneRaceBack" type="button">← ${L("Về luyện tập", "Back to practice")}</button><button class="btn btn-pink" id="toneRaceReplay" type="button">🚗 ${L("Chơi lại", "Play again")}</button></div></div></div>`;
  const replayOptions={...(toneRaceState.runOptions||{})};document.getElementById("toneRaceBack").addEventListener("click",exitToneRace);document.getElementById("toneRaceReplay").addEventListener("click",()=>startToneRaceGame(replayOptions));
}
function exitToneRace(){
  const gc=document.getElementById("gameContainer");if(gc){gc.classList.remove("visible");gc.style.display="none";}
  const grid=document.querySelector("#practiceTab .practice-grid");if(grid)grid.style.display="";
  const gameContent=document.getElementById("gameContent");if(gameContent)gameContent.innerHTML="";
  toneRaceState=null;window.scrollTo({top:0,behavior:"instant"});
}

/* ===================== MINI GAMES: Match & Write ===================== */
function startMatchGame(options = {}) {
  beginPracticeSession(options);
  document.querySelector("#practiceTab .practice-grid").style.display = "none";
  const gc = document.getElementById("gameContainer"); gc.classList.add("visible"); gc.style.display = "block";
  window.scrollTo({ top: 0, behavior: "instant" });
  const level = document.getElementById("practiceHskFilter").value;
  const missionPool = Array.isArray(options.words) && options.words.length ? options.words.slice() : (window.PandaHanAdaptiveLearning ? (window.PandaHanAdaptiveLearning.getPracticePool?.(level) || []) : (window.PandaHanMission?.getTargetVocabulary?.() || []));
  if (!missionPool.length) { alert(L("Chưa có nhóm từ đã học/đến hạn đủ điều kiện để ghép nghĩa.", "No evidence-based words are ready for matching.")); return; }
  let pool = shuffle(missionPool).slice(0, 6);
  let matched = 0, selectedChar = null, selectedMeaning = null;
  const chars = shuffle(pool.map(w => ({ char: w.char, id: w.id })));
  const meanings = shuffle(pool.map(w => ({ meaning: L(w.meaning, w.meaning_en), id: w.id })));
  document.getElementById("gameContent").innerHTML = `
    <h3 style="margin-bottom:10px;">🧩 Ghép chữ Hán với nghĩa / Match Hanzi with meaning</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:600px;margin:0 auto;">
      <div id="matchChars" style="display:flex;flex-direction:column;gap:8px;"></div>
      <div id="matchMeanings" style="display:flex;flex-direction:column;gap:8px;"></div>
    </div>
    <p id="matchStatus" style="text-align:center;margin-top:14px;font-weight:600;"></p>`;
  const charBox = document.getElementById("matchChars"), meanBox = document.getElementById("matchMeanings");
  charBox.innerHTML = chars.map(c => `<button class="btn btn-outline" data-id="${c.id}" data-type="char" style="font-size:22px;">${esc(c.char)}</button>`).join("");
  meanBox.innerHTML = meanings.map(m => `<button class="btn btn-outline" data-id="${m.id}" data-type="meaning" style="font-size:12px;text-align:left;">${esc(m.meaning)}</button>`).join("");
  function tryMatch(el) {
    if (el.classList.contains("btn-hsk1")) return;
    const type = el.dataset.type, id = el.dataset.id;
    if (type === "char") { if (selectedChar) selectedChar.classList.remove("btn-pink"); selectedChar = el; el.classList.add("btn-pink"); }
    else { if (selectedMeaning) selectedMeaning.classList.remove("btn-pink"); selectedMeaning = el; el.classList.add("btn-pink"); }
    if (selectedChar && selectedMeaning) {
      if (selectedChar.dataset.id === selectedMeaning.dataset.id) {
        selectedChar.classList.remove("btn-pink"); selectedMeaning.classList.remove("btn-pink");
        selectedChar.classList.add("btn-hsk1"); selectedMeaning.classList.add("btn-hsk1");
        selectedChar.disabled = true; selectedMeaning.disabled = true;
        recordQuizResult(pool.find(w => String(w.id) === selectedChar.dataset.id).char, true);
        matched++;
        if (matched === pool.length) {
          document.getElementById("matchStatus").textContent = "🎉 Hoàn thành! / Completed!";
          savePracticeCompletion(100, "match");
        }
      } else {
        selectedChar.classList.add("wrong"); selectedMeaning.classList.add("wrong");
        const wrongWord = pool.find((w) => String(w.id) === selectedChar.dataset.id);
        if (wrongWord) recordQuizResult(wrongWord.char, false, { source: "match", prompt: "Ghép chữ Hán với nghĩa", expected: L(wrongWord.meaning, wrongWord.meaning_en), selected: selectedMeaning.textContent || "" });
        setTimeout(() => { selectedChar.classList.remove("btn-pink", "wrong"); selectedMeaning.classList.remove("btn-pink", "wrong"); }, 500);
      }
      selectedChar = null; selectedMeaning = null;
    }
  }
  charBox.querySelectorAll("button").forEach(b => b.addEventListener("click", () => tryMatch(b)));
  meanBox.querySelectorAll("button").forEach(b => b.addEventListener("click", () => tryMatch(b)));
}

function startWriteGame(options = {}) {
  beginPracticeSession(options);
  document.querySelector("#practiceTab .practice-grid").style.display = "none";
  const gc = document.getElementById("gameContainer"); gc.classList.add("visible"); gc.style.display = "block";
  window.scrollTo({ top: 0, behavior: "instant" });
  renderWriteGameShell(options);
}
/* Rubric grammar có thể kiểm chứng ở client. Điểm chỉ phản ánh cấu trúc quan sát
   được (độ đầy đủ, dấu câu, từ đích, mẫu ngữ pháp, chủ-vị); không tuyên bố hiểu
   đúng nghĩa ngữ cảnh — phần semantic cần AI Coach/giáo viên khi backend hoạt động. */
const GRAMMAR_RUBRIC = [
  { id: "complete", vi: "Độ đầy đủ câu", en: "Sentence completeness", max: 20 },
  { id: "punctuation", vi: "Dấu câu tiếng Trung", en: "Chinese punctuation", max: 15 },
  { id: "target", vi: "Dùng từ mục tiêu", en: "Uses target word", max: 20 },
  { id: "pattern", vi: "Mẫu ngữ pháp HSK", en: "HSK grammar pattern", max: 25 },
  { id: "structure", vi: "Khung chủ ngữ + vị ngữ", en: "Subject + predicate frame", max: 20 },
];
const HSK_GRAMMAR_MARKERS = {
  1: ["是", "有", "在", "很", "也", "都", "不", "没", "的"],
  2: ["因为", "所以", "但是", "虽然", "已经", "正在", "先", "再", "过"],
  3: ["把", "被", "如果", "只要", "除了", "不但", "而且", "既然", "虽然"],
};
function evaluateGrammarDraft(draft, word, level) {
  const text = String(draft || "").trim();
  const hanziCount = (text.match(/[\u3400-\u9fff]/g) || []).length;
  const markers = [...(HSK_GRAMMAR_MARKERS[Math.min(3, Math.max(1, Number(level) || 1))] || []), ...HSK_GRAMMAR_MARKERS[1]];
  const matchedMarkers = [...new Set(markers.filter((marker) => text.includes(marker)))];
  const hasSubject = /[我你他她它我们你们他们大家学生老师朋友]/.test(text);
  const hasPredicate = /[是有在去来学习喜欢想要会能看吃喝做写说住工作]/.test(text);
  const scores = {
    complete: hanziCount >= 8 ? 20 : hanziCount >= 4 ? 10 : 0,
    punctuation: /[。！？]/.test(text) ? 15 : /[，、]/.test(text) ? 8 : 0,
    target: word?.char && text.includes(word.char) ? 20 : 0,
    pattern: matchedMarkers.length >= 2 ? 25 : matchedMarkers.length === 1 ? 15 : 0,
    structure: hasSubject && hasPredicate ? 20 : (hasSubject || hasPredicate ? 10 : 0),
  };
  const total = Object.values(scores).reduce((sum, value) => sum + value, 0);
  return { total, scores, matchedMarkers, hanziCount, semanticChecked: false };
}

/* "Viết nghĩa" — a single shuffled set of ~10 questions mixing two skills:
   recalling a single word's meaning, and translating a full example
   sentence (direction VI<->ZH or EN<->ZH follows the app's global 🌐
   language toggle). Sentence items are reflection-only: the learner may type
   a translation and compare it with the reference, but the sentence is never
   self-scored and never contributes to SM-2 or the schedule gate. */
function renderWriteGameShell(options = {}) {
  const level = document.getElementById("practiceHskFilter").value;
  const missionPool = window.PandaHanMission?.getTargetVocabulary?.() || [];
  const requestedPool = Array.from(new Map((Array.isArray(options.words) ? options.words : []).filter((w) => w && w.char).map((w) => [w.char, w])).values());
  const sourcePool = requestedPool.length ? requestedPool : (window.PandaHanAdaptiveLearning ? (window.PandaHanAdaptiveLearning.getPracticePool?.(level) || []) : missionPool);
  if (!sourcePool.length) {
    document.getElementById("gameContent").innerHTML = `<p style="text-align:center;padding:20px;">${L("Chưa có từ đã học/đến hạn đủ điều kiện để viết nghĩa. Hãy theo lộ trình AI Teacher trước.", "No evidence-based words are ready for writing. Follow the AI Teacher route first.")}</p>`;
    return;
  }
  const wordPool = shuffle(sourcePool);
  const sentencePool = shuffle(sourcePool.filter(w => w.examples && w.examples.length));
  const queue = [];
  const wordCount = Math.min(5, wordPool.length);
  const sentCount = Math.min(5, sentencePool.length);
  for (let i = 0; i < wordCount; i++) queue.push({ type: "word", w: wordPool[i] });
  for (let i = 0; i < sentCount; i++) queue.push({ type: "sentence", w: sentencePool[i] });
  const finalQueue = shuffle(queue).slice(0, 10);
  let idx = 0, correct = 0, grammarScores = [];
  const gradedTotal = finalQueue.filter(item => item.type === "word").length;
  const reflectionTotal = finalQueue.filter(item => item.type === "sentence").length;

  const gc = document.getElementById("gameContent");
  gc.innerHTML = `<div id="wgBody"></div>`;

  function render() {
    const body = document.getElementById("wgBody");
    if (idx >= finalQueue.length) {
      const wordPct = gradedTotal ? Math.round((correct / gradedTotal) * 100) : 0;
      const grammarPct = grammarScores.length ? Math.round(grammarScores.reduce((sum, value) => sum + value, 0) / grammarScores.length) : 0;
      const pct = gradedTotal && grammarScores.length ? Math.round(wordPct * 0.6 + grammarPct * 0.4) : (wordPct || grammarPct);
      body.innerHTML = `<h3 style="text-align:center;">🎉 ${L("Hoàn thành!", "Done!")}</h3><p style="text-align:center;">${gradedTotal ? `${correct}/${gradedTotal} ${L("từ đơn đúng", "graded words correct")}` : L("Không có câu tự động chấm", "No auto-graded word items")} · ${L("Rubric grammar", "Grammar rubric")}: ${grammarPct}% · ${L("Điểm Reading/Writing tổng hợp", "Combined Reading/Writing score")}: <b>${pct}%</b></p><p style="text-align:center;font-size:11px;color:var(--text-light);">${L("Rubric tự động chỉ kiểm tra tín hiệu cấu trúc; AI Coach/Giáo viên mới đánh giá được nghĩa và độ tự nhiên hoàn toàn.", "The automatic rubric checks structural signals only; AI Coach/teacher is required for semantic accuracy and naturalness.")}</p>`;
      if (gradedTotal || grammarScores.length) savePracticeCompletion(pct, "write", { gradedItems: gradedTotal, grammarItems: grammarScores.length, wordScore: wordPct, grammarScore: grammarPct, score: pct, scoring: "objective_words_plus_transparent_grammar_rubric" });
      return;
    }
    const item = finalQueue[idx];
    if (item.type === "word") renderWordItem(body, item.w); else renderSentenceItem(body, item.w);
  }

  function renderWordItem(body, w) {
    body.innerHTML = `
      <div style="text-align:center;">
        <div style="font-size:11px;color:var(--text-light);margin-bottom:4px;">${idx + 1}/${finalQueue.length} · ✍️ ${L("Từ đơn", "Word")}</div>
        <div style="font-size:48px;font-weight:700;">${esc(w.char)}</div>
        <div style="color:var(--pink);font-weight:700;">${esc(w.pinyin)}</div>
        <input type="text" id="writeInput" placeholder="${L('Nhập nghĩa...', 'Type meaning...')}" style="margin-top:14px;padding:10px 18px;border-radius:30px;border:2px solid var(--hsk2-light);font-size:14px;width:280px;">
        <br><button class="btn btn-hsk2" id="writeSubmit" style="margin-top:10px;">${L("Kiểm tra", "Check")}</button>
        <p id="writeFeedback" style="margin-top:10px;font-weight:600;"></p>
      </div>`;
    document.getElementById("writeSubmit").addEventListener("click", () => {
      const val = document.getElementById("writeInput").value.trim().toLowerCase();
      const ok = val && (w.meaning.toLowerCase().includes(val) || val.includes(w.meaning.toLowerCase()) || w.meaning_en.toLowerCase().includes(val) || val.includes(w.meaning_en.toLowerCase()));
      playTing(ok ? "correct" : "wrong");
      document.getElementById("writeFeedback").innerHTML = ok
        ? `✅ ${L("Đúng!", "Correct!")} <span style="color:var(--hsk1);">${esc(L(w.meaning, w.meaning_en))}</span>`
        : `❌ ${L("Đáp án", "Answer")}: <span style="color:var(--pink);">${esc(L(w.meaning, w.meaning_en))}</span>`;
      recordQuizResult(w.char, ok, { source: "write", prompt: `Viết nghĩa: ${w.char}`, expected: L(w.meaning, w.meaning_en), selected: val });
      if (ok) correct++;
      setTimeout(() => { idx++; render(); }, 1400);
    });
  }

  function renderSentenceItem(body, w) {
    const ex = shuffle(w.examples)[0]; // [zh, pinyin, vi, en]
    const toZh = Math.random() < 0.5;
    let sourceText, sourceLabel, answerLabel;
    if (LANG_MODE === "vi") {
      if (toZh) { sourceText = ex[2]; sourceLabel = "🇻🇳"; answerLabel = L("Đáp án tham khảo (chữ Hán + pinyin)", "Reference answer"); }
      else { sourceText = ex[0]; sourceLabel = "🇨🇳"; answerLabel = L("Đáp án tham khảo (tiếng Việt)", "Reference answer"); }
    } else {
      if (toZh) { sourceText = ex[3]; sourceLabel = "🇬🇧"; answerLabel = L("Đáp án tham khảo (chữ Hán + pinyin)", "Reference answer"); }
      else { sourceText = ex[0]; sourceLabel = "🇨🇳"; answerLabel = L("Đáp án tham khảo (tiếng Anh)", "Reference answer"); }
    }
    body.innerHTML = `
      <div style="text-align:center;">
        <div style="font-size:11px;color:var(--text-light);margin-bottom:4px;">${idx + 1}/${finalQueue.length} · 📝 ${L("Dịch câu", "Sentence")}</div>
        <div style="font-size:20px;font-weight:700;background:var(--card-bg,#fafcfe);border-radius:12px;padding:12px 16px;display:inline-block;max-width:340px;">${sourceLabel} ${esc(sourceText)}</div>
        <br>
        <textarea id="wgSentInput" rows="2" placeholder="${L('Gõ bản dịch của bạn...', 'Type your translation...')}" style="margin-top:14px;padding:10px 14px;border-radius:16px;border:2px solid var(--hsk2-light);font-size:14px;width:320px;max-width:90%;font-family:inherit;"></textarea>
        <br><button class="btn btn-hsk2" id="wgCheckBtn" style="margin-top:10px;">${L("Chấm rubric & so đáp án", "Score rubric & compare")}</button>
        <div style="margin-top:8px;font-size:11px;color:var(--text-light);max-width:340px;margin-left:auto;margin-right:auto;">${L("Rubric: độ đầy đủ 20 · dấu câu 15 · từ mục tiêu 20 · mẫu ngữ pháp 25 · chủ-vị 20.", "Rubric: completeness 20 · punctuation 15 · target word 20 · grammar pattern 25 · subject-predicate 20.")}</div>
        <div id="wgGrammarReport" style="display:none;margin-top:10px;border:1px solid #f3d5e5;background:#fff7fb;border-radius:10px;padding:9px 11px;text-align:left;max-width:340px;margin-left:auto;margin-right:auto;"></div>
        <div id="wgAnswerBox" style="display:none;margin-top:12px;background:#fffbeb;border-radius:10px;padding:10px 14px;text-align:left;max-width:340px;margin-left:auto;margin-right:auto;">
          <div style="font-size:11px;color:var(--text-light);margin-bottom:3px;">${answerLabel}</div>
          <div style="font-weight:700;">${esc(ex[0])}</div>
          <div style="color:var(--pink);font-size:12.5px;">${esc(ex[1])}</div>
          <div style="font-size:13px;margin-top:3px;">🇻🇳 ${esc(ex[2])}</div>
          <div style="font-size:13px;color:var(--text-light);">🇬🇧 ${esc(ex[3])}</div>
          <div style="display:flex;gap:8px;margin-top:10px;">
            <div style="font-size:11px;color:var(--text-light);">${L("Câu dịch này chỉ để tự luyện và không được dùng làm điểm hay bằng chứng hoàn thành.", "This translation is for reflection only and is not used as a score or completion evidence.")}</div>
          </div>
        </div>
      </div>`;
    document.getElementById("wgCheckBtn").addEventListener("click", () => {
      const report = evaluateGrammarDraft(document.getElementById("wgSentInput").value, w, Number(w.hsk || 1));
      grammarScores.push(report.total);
      const labels = Object.fromEntries(GRAMMAR_RUBRIC.map((item) => [item.id, LANG_MODE === "en" ? item.en : item.vi]));
      const detail = GRAMMAR_RUBRIC.map((item) => `<div style="display:flex;justify-content:space-between;gap:10px;padding:2px 0;"><span>${labels[item.id]}</span><b>${report.scores[item.id]}/${item.max}</b></div>`).join("");
      const reportBox = document.getElementById("wgGrammarReport");
      reportBox.innerHTML = `<b>${L("Điểm grammar có thể kiểm chứng", "Verifiable grammar score")}: ${report.total}/100</b>${detail}<div style="font-size:10.5px;color:var(--text-light);margin-top:5px;">${report.matchedMarkers.length ? `${L("Mẫu phát hiện", "Detected patterns")}: ${esc(report.matchedMarkers.join(" · "))}.` : L("Chưa phát hiện mẫu ngữ pháp mục tiêu; hãy thử dùng một cấu trúc HSK phù hợp.", "No target HSK pattern detected; try adding a suitable HSK structure.")}</div>`;
      reportBox.style.display = "block";
      document.getElementById("wgAnswerBox").style.display = "block";
      window.setTimeout(() => { idx++; render(); }, 2800);
    });
  }

  render();
}
