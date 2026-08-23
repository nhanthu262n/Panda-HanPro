(() => {
  "use strict";

  const LISTENING_THRESHOLD = 20;
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
      dispatchEvaluation({ source: "phonetics-listening", taskId: "listening", dayNumber: Number(day.day_number), scorePercent: Math.min(100, Math.round(count / LISTENING_THRESHOLD * 100)), threshold: 100, passed: count >= LISTENING_THRESHOLD, action: count >= LISTENING_THRESHOLD ? "evidence_threshold_reached" : "evidence_progress", ...evidence });
    }
    if (count >= LISTENING_THRESHOLD) await completeVerifiedTask(day, "listening", "verified:phonetics-audio", evidence);
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

  function install() {
    installAudioInstrumentation();
    window.addEventListener("pinyin-history-updated", () => processPronunciationRecord(readLatestPronunciation()));
    window.addEventListener("pinyin-mounted", () => {
      installAudioInstrumentation();
      processPronunciationRecord(readLatestPronunciation());
    });
    processPronunciationRecord(readLatestPronunciation());
  }

  window.PandaHanEvidence = {
    processPronunciationRecord,
    processListening: (count) => reportListening(Number(count) || 0, null),
    getListeningCount: () => Number(localStorage.getItem(evidenceKey(`listening_${today()}`)) || 0)
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install); else install();
})();
