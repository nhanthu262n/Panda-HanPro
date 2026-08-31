(() => {
  "use strict";

  const DAY_MS = 86400000;
  const INTRO_LIMIT = 24;
  const PRACTICE_LIMIT = 24;

  function ns() {
    try {
      return String(typeof window.storageNamespace === "function" ? window.storageNamespace() : window.CURRENT_USER?.uid || window.CURRENT_USER?.username || "guest");
    } catch (_) { return "guest"; }
  }
  function safeNs() { return ns().replace(/[^a-zA-Z0-9_-]/g, "_"); }
  function today() {
    try { return window.PandaHanSchedule?.todayVietnam?.() || new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date()); }
    catch (_) { return new Date().toISOString().slice(0, 10); }
  }
  function readJson(key, fallback) {
    try { const value = JSON.parse(localStorage.getItem(key) || "null"); return value == null ? fallback : value; } catch (_) { return fallback; }
  }
  function writeJson(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} }
  function getVocab() { try { return Array.isArray(window.VOCAB) ? window.VOCAB : (typeof VOCAB !== "undefined" ? VOCAB : []); } catch (_) { return []; } }
  function getMap() { try { return window.VOCAB_BY_CHAR || (typeof VOCAB_BY_CHAR !== "undefined" ? VOCAB_BY_CHAR : {}); } catch (_) { return {}; } }
  function getStatFor(char) { try { return typeof getStat === "function" ? getStat(char) : {}; } catch (_) { return {}; } }
  function hasRecallEvidence(stat) { return Number(stat?.quizAttempts || 0) > 0 || Number(stat?.repetitions || 0) > 0; }
  function accuracy(stat) {
    const log = Array.isArray(stat?.quizLog) ? stat.quizLog : [];
    if (log.length) {
      let score = 0, weight = 0;
      log.slice(-12).forEach((entry, index, arr) => { const w = 1 + index / Math.max(1, arr.length); score += entry.correct ? w : 0; weight += w; });
      return weight ? score / weight : 0;
    }
    return Number(stat?.quizAttempts || 0) ? Number(stat.quizCorrect || 0) / Number(stat.quizAttempts) : 0;
  }
  function lastQuality(stat) { const log = Array.isArray(stat?.studyLog) ? stat.studyLog : []; return log.length ? Number(log[log.length - 1].grade || 0) : 0; }

  function parseNewVocab(raw) {
    if (!raw || raw === "-") return [];
    return String(raw).split(";").map((part) => {
      const match = part.trim().match(/^(.+?)\(([^)]*)\)-(.+)$/);
      return match ? { char: match[1].trim(), pinyinHint: match[2].trim(), meaningHint: match[3].trim() } : null;
    }).filter(Boolean);
  }
  function normalizePinyin(value) { return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
  function focusGroups(day) {
    const text = `${day?.topic || ""} ${day?.notes || ""}`.toLowerCase();
    const groups = [];
    const hasToken = (token) => new RegExp(`(?:^|[\\s,/·+()\\[\\]-])${String(token).replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}(?=$|[\\s,/·+()\\[\\]-])`, "i").test(text);
    const initialSets = [
      ["b", "p", "m", "f"], ["d", "t", "n", "l"], ["j", "q", "x"], ["zh", "ch", "sh", "r"], ["z", "c", "s"], ["g", "k", "h"]
    ];
    const finalSets = [["a", "o", "e", "i", "u", "ü"], ["iu", "ui", "un"], ["-n", "-ng"]];
    initialSets.forEach((set) => { if (set.some((token) => hasToken(token))) groups.push({ type: "initial", tokens: set, label: set.join("/") }); });
    finalSets.forEach((set) => { if (set.some((token) => hasToken(token.replace("-", "")))) groups.push({ type: "final", tokens: set, label: set.join("/") }); });
    if (/4 thanh|thanh điệu|tone|tone sandhi/i.test(text)) groups.push({ type: "tone", tokens: [], label: "4 thanh điệu" });
    return groups.slice(0, 3);
  }
  function matchesFocus(word, groups) {
    if (!groups.length) return true;
    const syllables = normalizePinyin(word.pinyin).split(/[\s-]+/).filter(Boolean);
    return groups.some((group) => {
      if (group.type === "tone") return true;
      return syllables.some((syllable) => group.tokens.some((token) => {
        const normalized = normalizePinyin(token.replace("-", ""));
        return group.type === "initial" ? syllable.startsWith(normalized) : syllable.includes(normalized);
      }));
    });
  }
  function scheduleDay() {
    const schedule = window.PandaHanSchedule?.getSchedule?.() || null;
    const days = Array.isArray(schedule?.days) ? schedule.days : [];
    return { schedule, day: days.filter((item) => item.status === "unlocked").sort((a, b) => Number(a.sequence_index) - Number(b.sequence_index))[0] || null };
  }
  function introKey(dayNumber, date = today()) { return `pandahan_vocab_intro_${safeNs()}_${date}_${Number(dayNumber)}`; }
  function getIntroState(dayNumber, date = today()) { return readJson(introKey(dayNumber, date), { completed: false, chars: [], completedAt: null }); }
  function isPhoneticsReady(day, scheduleDay) {
    const tasks = day ? [day.listening_task, day.speaking_task].filter((v) => v && v !== "-") : [];
    if (!tasks.length) return true;
    const completed = scheduleDay?.completed_tasks || {};
    return (!day.listening_task || day.listening_task === "-" || !!completed.listening) && (!day.speaking_task || day.speaking_task === "-" || !!completed.speaking);
  }
  function scoreWord(word) {
    const stat = getStatFor(word.char);
    const due = (() => { try { return typeof isDue === "function" && isDue(word.char); } catch (_) { return false; } })();
    const tier = (() => { try { return typeof getTier === "function" ? getTier(word.char) : 0; } catch (_) { return 0; } })();
    const age = Number(stat.nextReview || 0) ? Math.max(0, Date.now() - Number(stat.nextReview)) / DAY_MS : 0;
    const weak = hasRecallEvidence(stat) && (tier <= 2 || accuracy(stat) < 0.7 || lastQuality(stat) < 3);
    return { word, stat, due, tier, accuracy: accuracy(stat), weak, hasRecall: hasRecallEvidence(stat), priority: (due ? 1000 : 0) + (weak ? 300 : 0) + Math.min(120, age * 5) + (5 - tier) * 10 };
  }
  function buildPlan(dayInput = null, scheduleInput = null) {
    const { schedule, day: activeDay } = scheduleDay();
    const scheduleDayValue = scheduleInput || schedule;
    const scheduleItem = activeDay;
    const day = dayInput || window.PandaHanMission?.getCurriculumDay?.() || null;
    const curriculum = day || {};
    const dayNumber = Number(curriculum.day_number || scheduleItem?.day_number || 1);
    const all = getVocab();
    const map = getMap();
    const groups = focusGroups(curriculum);
    const isPinyinBootcamp = dayNumber <= 10 || curriculum.stage_code === "stage_0";
    // Days 1-10 are exclusively Pinyin/phonetics training. The Excel vocab cells there
    // are pronunciation examples, not a vocabulary-learning queue. Vocabulary starts Day 11.
    const raw = isPinyinBootcamp ? [] : parseNewVocab(curriculum.new_vocab_raw);
    const linkedNew = raw.map((item) => map[item.char]).filter(Boolean).filter((word) => matchesFocus(word, groups));
    // Strict chain rule: when a phonetics focus exists, never inject a raw day word
    // that does not match that focus merely to fill the intro quota.
    // Teach the complete daily Excel word set (normally 8-11 words), not an arbitrary 6-word slice.
    const exactNew = linkedNew.slice(0, INTRO_LIMIT);
    const introState = getIntroState(dayNumber);
    const introducedChars = new Set(Array.isArray(introState.chars) ? introState.chars : []);
    const introWords = exactNew.filter((word) => !introducedChars.has(word.char) && !hasRecallEvidence(getStatFor(word.char))).slice(0, INTRO_LIMIT);
    const learned = all.map(scoreWord).filter((item) => item.hasRecall);
    // SRS is cumulative from Day 11 onward: due/weak words from ANY prior learned day are eligible.
    const reviewPool = isPinyinBootcamp ? [] : learned.filter((item) => item.due || item.weak).sort((a, b) => b.priority - a.priority).map((item) => item.word);
    const introducedToday = all.filter((word) => introducedChars.has(word.char)).map(scoreWord).sort((a, b) => b.priority - a.priority).map((item) => item.word);
    const practiceWords = [...new Map([...reviewPool, ...(introState.completed ? introducedToday : [])].map((word) => [word.char, word])).values()].slice(0, PRACTICE_LIMIT);
    const phoneticsReady = isPhoneticsReady(curriculum, scheduleItem);
    const vocabIntroReady = phoneticsReady && introWords.length > 0;
    const canPracticeNew = introState.completed || !introWords.length;
    const eligible = canPracticeNew ? practiceWords : practiceWords.filter((word) => !exactNew.some((newWord) => newWord.char === word.char));
    return {
      dayNumber, date: today(), isPinyinBootcamp, vocabularyMode: isPinyinBootcamp ? "phonetics_only" : "daily_vocab_plus_cumulative_srs", focusGroups: groups, focusLabel: groups.map((group) => group.label).join(" · ") || "theo chủ đề ngày",
      phoneticsReady, vocabIntroReady, introCompleted: !!introState.completed, introWords, newWords: exactNew,
      practiceWords: eligible, reviewWords: reviewPool, linkedNewWords: exactNew,
      counts: { new: exactNew.length, intro: introWords.length, review: reviewPool.length, practice: eligible.length },
      schedule: scheduleItem, curriculum, source: "real_vocab_stats_and_excel_day"
    };
  }
  // `canPracticeWord` is intentionally permissive for the public Dictionary/
  // Practice screens: a learner may open any word already present in the local
  // 2,254-word data set at any time. The AI Coach chain remains strict because
  // its launchers pass an explicit `options.words` manifest from the current day.
  function canPracticeWord(char) {
    const key = String(char || "").trim();
    if (!key) return false;
    return !!getMap()[key];
  }
  function getPracticePool(level = "all") {
    return getVocab()
      .filter((word) => level === "all" || word.hsk === Number(level))
      .filter((word) => word && word.char && (word.examples?.length || word.unscramble?.length || word.meaning || word.meaning_en));
  }
  function completeIntroduction(dayNumber, chars) {
    const values = Array.from(new Set((chars || []).map(String).filter(Boolean)));
    writeJson(introKey(dayNumber), { completed: true, chars: values, completedAt: Date.now(), source: "real_vocabulary_introduction" });
    window.dispatchEvent(new CustomEvent("pandahan-vocabulary-lesson-completed", { detail: { verified: true, source: "vocabulary", rawSource: "adaptive-vocabulary-introduction", evidenceType: "vocabulary_introduction", dayNumber: Number(dayNumber), chars: values, total: values.length, completedAt: Date.now() } }));
  }
  window.PandaHanAdaptiveLearning = { buildPlan, parseNewVocab, focusGroups, completeIntroduction, getIntroState, hasRecallEvidence, accuracy, getStatFor, canPracticeWord, getPracticePool };
})();
