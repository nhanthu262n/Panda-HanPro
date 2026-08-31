(() => {
  "use strict";

  const LISTENING_THRESHOLD = 20;
  const LISTENING_QUIZ_PASS_SCORE = 30; // native Ngữ âm quiz evidence threshold for AI Coach tracking only
  const REPORT_STEP = 5;
  let completionInFlight = {};
  let lastPronunciationId = "";

  function ns() {
    try {
      if (typeof window.storageNamespace === "function") return String(window.storageNamespace() || "guest");
      return String(window.CURRENT_USER?.uid || window.CURRENT_USER?.username || "guest");
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
  function evidenceKey(suffix) { return `pandahan_verified_evidence_${safeNs()}_${suffix}`; }
  function currentSchedule() {
    return window.PandaHanSchedule?.getScheduleAsync ? window.PandaHanSchedule.getScheduleAsync() : Promise.resolve(window.PandaHanSchedule?.getSchedule?.() || null);
  }
  async function currentDay() {
    const schedule = await currentSchedule();
    return (Array.isArray(schedule?.days) ? schedule.days : [])
      .filter((day) => day.status === "unlocked")
      .sort((a, b) => Number(a.sequence_index) - Number(b.sequence_index))[0] || null;
  }
  function taskIsDone(day, taskId) { return !!day?.completed_tasks && !!day.completed_tasks[taskId]; }
  function dispatchEvaluation(detail) {
    window.dispatchEvent(new CustomEvent("pandahan-learning-evaluation", { detail: {
      ...detail, verified: true, evaluatedAt: Number(detail.evaluatedAt || Date.now())
    }}));
  }
  function dispatchObservation(detail) {
    window.dispatchEvent(new CustomEvent("pandahan-learning-evaluation", { detail: {
      ...detail, verified: false, evaluatedAt: Number(detail.evaluatedAt || Date.now())
    }}));
  }
  async function completeVerifiedTask(day, taskId, source, evidence) {
    if (!day || taskIsDone(day, taskId) || completionInFlight[`${day.day_number}:${taskId}`]) return null;
    const api = window.PandaHanSchedule;
    if (!api?.completeTask) return null;
    const key = `${day.day_number}:${taskId}`;
    completionInFlight[key] = true;
    try {
      return await api.completeTask(Number(day.day_number), taskId, source, evidence);
    } catch (error) {
      console.warn("Verified evidence chưa đồng bộ được task:", error.code || error.message || error);
      return null;
    } finally {
      delete completionInFlight[key];
    }
  }

  async function processPronunciationRecord(record) {
    if (!record || !record.id || !Number.isFinite(Number(record.score))) return;
    const id = String(record.id);
    const seen = readJson(evidenceKey("pronunciation_ids"), []);
    if (seen.includes(id) || id === lastPronunciationId) return;
    lastPronunciationId = id;
    writeJson(evidenceKey("pronunciation_ids"), [id, ...seen.filter((item) => item !== id)].slice(0, 100));
    const day = await currentDay();
    if (!day) return;
    const components = {
      toneScore: Number(record.toneScore || 0),
      segmentalScore: Number(record.segmentalScore || 0),
      articulationScore: Number(record.articulationScore || 0),
      fluencyScore: Number(record.fluencyScore || 0)
    };
    const evidence = {
      evidenceType: "pronunciation_recording_score",
      pronunciationId: id,
      scorePercent: Number(record.score),
      threshold: 75,
      passed: Number(record.score) >= 75,
      attempts: 1,
      total: 1,
      correct: Number(record.score) >= 75 ? 1 : 0,
      components,
      details: Array.isArray(record.details) ? record.details.slice(0, 6) : [],
      date: String(record.createdAt || new Date().toISOString()),
      rawSource: "pinyin-recording-history"
    };
    const result = await completeVerifiedTask(day, "speaking", "verified:phonetics-recording", evidence);
    if (!result && taskIsDone(day, "speaking")) dispatchEvaluation({ source: "phonetics-pronunciation", taskId: "speaking", dayNumber: Number(day.day_number), ...evidence, action: "evidence_recorded" });
  }

  function readLatestPronunciation() {
    const history = readJson(`pinyin-recording-history_${safeNs()}`, []);
    return Array.isArray(history) && history.length ? history[0] : null;
  }

  async function reportListening(count, media) {
    const day = await currentDay();
    if (!day) return;
    const evidence = {
      evidenceType: "reference_audio_playback",
      audioPlayCount: count,
      attempts: count,
      total: LISTENING_THRESHOLD,
      correct: count >= LISTENING_THRESHOLD ? LISTENING_THRESHOLD : count,
      durationSeconds: Number.isFinite(Number(media?.duration)) ? Number(media.duration) : null,
      date: new Date().toISOString(),
      rawSource: "pinyin-phonetics-audio"
    };
    if (count % REPORT_STEP === 0 || count >= LISTENING_THRESHOLD) {
      dispatchObservation({ source: "phonetics-listening", taskId: "listening", dayNumber: Number(day.day_number), scorePercent: null, threshold: LISTENING_QUIZ_PASS_SCORE, passed: false, action: "audio_playback_observed", ...evidence });
    }
  }

  async function processListeningQuiz(result) {
    const day = await currentDay();
    if (!day || !result) return null;
    const score = Math.max(0, Math.min(100, Number(result.scorePercent) || 0));
    const correct = Math.max(0, Number(result.correct) || 0);
    const total = Math.max(1, Number(result.total) || 1);
    const wrongItems = Array.isArray(result.wrongItems) ? result.wrongItems.slice(0, total) : [];
    const passed = score >= LISTENING_QUIZ_PASS_SCORE;
    const evidence = {
      evidenceType: "phonetics_listening_quiz_score",
      quizId: String(result.quizId || ""),
      scorePercent: score,
      threshold: LISTENING_QUIZ_PASS_SCORE,
      passed,
      correct,
      total,
      attempts: Math.max(1, Number(result.attempts) || 1),
      wrongItems,
      date: String(result.completedAt || new Date().toISOString()),
      rawSource: "phonetics-listening-quiz"
    };
    if (wrongItems.length) await window.PandaHanSchedule?.requireMistakeReview?.(Number(day.day_number));
    const output = passed ? await completeVerifiedTask(day, "listening", "verified:phonetics-listening-quiz", evidence) : null;
    const action = passed ? "quiz_passed_pending_other_evidence" : "quiz_below_threshold";
    dispatchEvaluation({ source: "phonetics-listening-quiz", taskId: "listening", dayNumber: Number(day.day_number), action, ...evidence });
    return { completed: !!output, passed, action, result: output?.result || null, evidence };
  }

  async function processNativePhoneticsQuiz(result) {
    const day = await currentDay();
    if (!day || !result) return null;
    const excelDay = Number(day.day_number || 0);
    const sessionId = Number(result.sessionId || 0);
    if (excelDay < 1 || excelDay > 10 || sessionId !== excelDay) return null;
    const score = Math.max(0, Math.min(100, Number(result.scorePercent) || 0));
    const correct = Math.max(0, Number(result.correct) || 0);
    const total = Math.max(1, Number(result.total) || 20);
    const evidence = {
      evidenceType: "phonetics_native_quiz_score",
      quizId: `native-phonetics-day-${sessionId}`,
      sessionId, excelDay, scorePercent: score, threshold: 30, passed: score >= 30,
      correct, total, attempts: 1, date: String(result.completedAt || new Date().toISOString()),
      rawSource: "pinyin-phonetics-native-quiz", completeSet: true
    };
    // User requirement: ONE real score from Ngữ âm quiz supplies AI Coach Listening and Reading/Writing evidence.
    const outputs = [];
    for (const taskId of ["listening", "reading_writing"]) {
      try {
        const out = await window.PandaHanSchedule?.recordTaskScore?.(excelDay, taskId, score, "verified:pinyin-phonetics-native-quiz", evidence);
        outputs.push(out || null);
      } catch (error) { console.warn("Native phonetics quiz evidence sync:", taskId, error?.code || error?.message || error); }
      dispatchEvaluation({ source: "pinyin-phonetics-native-quiz", taskId, dayNumber: excelDay, action: score >= 30 ? "native_quiz_score_recorded" : "native_quiz_below_tracking_threshold", ...evidence });
    }
    return { scorePercent: score, dayNumber: excelDay, outputs };
  }

  function nextListeningCount(media) {
    if (!media || String(media.src || media.currentSrc || "").match(/^(blob:|data:)/i)) return;
    const key = evidenceKey(`listening_${today()}`);
    const count = Number(localStorage.getItem(key) || 0) + 1;
    try { localStorage.setItem(key, String(count)); } catch (_) {}
    reportListening(count, media).catch((error) => console.warn("Listening evidence error:", error));
  }

  function installAudioInstrumentation() {
    if (window.__PANDAHAN_AUDIO_EVIDENCE_INSTALLED || typeof HTMLMediaElement === "undefined") return;
    const originalPlay = HTMLMediaElement.prototype.play;
    if (typeof originalPlay !== "function") return;
    HTMLMediaElement.prototype.play = function (...args) {
      const media = this;
      const result = originalPlay.apply(this, args);
      Promise.resolve(result).then(() => nextListeningCount(media)).catch(() => {});
      return result;
    };
    window.__PANDAHAN_AUDIO_EVIDENCE_INSTALLED = true;
  }

  async function syncStoredNativeQuizForCurrentDay() {
    const day = await currentDay();
    const n = Number(day?.day_number || 0);
    if (n < 1 || n > 10) return;
    const progress = readJson("pandahan_phonics_v2", {});
    const row = progress?.[n] || progress?.[String(n)] || null;
    const bestCorrect = Number(row?.bestScore || 0);
    if (!Number.isFinite(bestCorrect) || bestCorrect <= 0) return;
    const scorePercent = Math.max(0, Math.min(100, Math.round(bestCorrect / 20 * 100)));
    const key = evidenceKey(`native_phonetics_synced_day_${n}`);
    const previous = Number(localStorage.getItem(key) || -1);
    if (previous >= scorePercent) return;
    try { localStorage.setItem(key, String(scorePercent)); } catch (_) {}
    await processNativePhoneticsQuiz({ sessionId:n, correct:bestCorrect, total:20, scorePercent, completedAt:new Date().toISOString(), source:"pinyin-phonetics-native-quiz-storage" });
  }

  function install() {
    installAudioInstrumentation();
    window.addEventListener("pinyin-history-updated", () => processPronunciationRecord(readLatestPronunciation()));
    window.addEventListener("pinyin-mounted", () => {
      installAudioInstrumentation();
      processPronunciationRecord(readLatestPronunciation());
      syncStoredNativeQuizForCurrentDay();
    });
    window.addEventListener("pandahan-phonetics-native-quiz-score", (event) => processNativePhoneticsQuiz(event.detail));
    window.addEventListener("pandahan-schedule-updated", () => syncStoredNativeQuizForCurrentDay());
    processPronunciationRecord(readLatestPronunciation());
    syncStoredNativeQuizForCurrentDay();
  }

  window.PandaHanEvidence = {
    processPronunciationRecord,
    processListeningQuiz,
    processNativePhoneticsQuiz,
    syncStoredNativeQuizForCurrentDay,
    processListening: (count) => reportListening(Number(count) || 0, null),
    getListeningCount: () => Number(localStorage.getItem(evidenceKey(`listening_${today()}`)) || 0)
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install); else install();
})();
