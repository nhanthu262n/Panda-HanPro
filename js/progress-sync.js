/* PandaHán learning-progress sync — RTDB is durable per-user storage; localStorage remains offline cache. */
(() => {
  "use strict";

  const VERSION = 1;
  const SYNC_DELAY = 700;
  const MAX_VALUE_BYTES = 350000;
  const META_PREFIX = "pandahan_progress_sync_meta_v1_";
  let activeUid = "";
  let hydrated = false;
  let flushTimer = 0;
  let flushing = false;

  function firebaseDb() {
    return window.PandaHanFirebase?.database || (typeof window.firebase?.database === "function" ? window.firebase.database() : null);
  }
  function currentUid() {
    return String(window.firebase?.auth?.().currentUser?.uid || window.CURRENT_USER?.uid || "").trim();
  }
  function safeParse(raw) { try { return JSON.parse(raw); } catch (_) { return raw; } }
  function safeStringify(value) { try { return JSON.stringify(value); } catch (_) { return ""; } }
  function metaKey(uid) { return META_PREFIX + String(uid || "guest").replace(/[^a-zA-Z0-9_-]/g, "_"); }
  function readMeta(uid) { return safeParse(localStorage.getItem(metaKey(uid)) || "{}") || {}; }
  function writeMeta(uid, value) { try { localStorage.setItem(metaKey(uid), JSON.stringify(value)); } catch (_) {} }
  function isLearningKey(key, uid) {
    const suffix = String(uid || "").replace(/[^a-zA-Z0-9_-]/g, "_");
    const owned = !suffix || key.endsWith("_" + suffix);
    if (!owned) return false;
    return /^(pandahan_pro_(stats|log)_v1_|pandahan_(mistake|srs|phonetics|quest|vocab|ai_coach)_|pinyin-tone-quest-offline-progress-v2_|pandahanToneRaceBest)/.test(key);
  }
  function isQuizKey(key) {
    return /(?:phonetics_listening_quiz|quest_results|tone|pinyin-tone-quest)/i.test(key);
  }
  function canonicalKey(key, uid) {
    const safeUid = String(uid || "").replace(/[^a-zA-Z0-9_-]/g, "_");
    return String(key).endsWith("_guest") ? String(key).slice(0, -6) + "_" + safeUid : String(key);
  }
  function collect(uid, includeGuest) {
    const progress = {};
    const quizResults = {};
    const namespaces = includeGuest ? [uid, "guest"] : [uid];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key || !namespaces.some((ns) => isLearningKey(key, ns))) continue;
      const raw = localStorage.getItem(key);
      if (raw == null || raw.length > MAX_VALUE_BYTES) continue;
      const bucket = isQuizKey(key) ? quizResults : progress;
      bucket[canonicalKey(key, uid)] = { value: safeParse(raw), cachedAt: Date.now() };
    }
    return { progress, quizResults };
  }
  function restoreBucket(bucket) {
    if (!bucket || typeof bucket !== "object") return 0;
    let restored = 0;
    Object.entries(bucket).forEach(([key, record]) => {
      if (!key || !record || !Object.prototype.hasOwnProperty.call(record, "value")) return;
      const raw = typeof record.value === "string" ? record.value : safeStringify(record.value);
      if (!raw || raw.length > MAX_VALUE_BYTES) return;
      try { localStorage.setItem(key, raw); restored += 1; } catch (_) {}
    });
    return restored;
  }
  async function hydrate(uid) {
    const db = firebaseDb();
    if (!db || !uid || uid !== currentUid()) return { remote: false, restored: 0 };
    const [progressSnap, quizSnap] = await Promise.all([
      db.ref("studentProgress/" + uid).once("value"),
      db.ref("quizResults/" + uid).once("value")
    ]);
    const progressRemote = progressSnap.val() || null;
    const quizRemote = quizSnap.val() || null;
    const remoteExists = !!(progressRemote?.data || quizRemote?.data);
    let restored = 0;
    if (progressRemote?.data) restored += restoreBucket(progressRemote.data);
    if (quizRemote?.data) restored += restoreBucket(quizRemote.data);
    hydrated = true;
    writeMeta(uid, { hydratedAt: Date.now(), remoteUpdatedAt: Math.max(Number(progressRemote?.updatedAt || 0), Number(quizRemote?.updatedAt || 0)) });
    window.dispatchEvent(new CustomEvent("pandahan-progress-hydrated", { detail: { uid, restored, remote: remoteExists } }));
    window.dispatchEvent(new CustomEvent("pandahan-mistakes-changed", { detail: { source: "firebase-hydrate" } }));
    window.dispatchEvent(new CustomEvent("pandahan-srs-updated", { detail: { source: "firebase-hydrate" } }));
    if (!remoteExists) scheduleFlush("first_account_backup", true);
    return { remote: remoteExists, restored };
  }
  async function flush(reason = "learning_event") {
    const uid = activeUid || currentUid();
    const db = firebaseDb();
    if (!hydrated || flushing || !db || !uid || uid !== currentUid()) return false;
    flushing = true;
    try {
      const firstAccountBackup = !readMeta(uid).remoteUpdatedAt;
      const snapshot = collect(uid, firstAccountBackup);
      const now = Date.now();
      const merge = (bucket) => (current) => ({
        ...(current || {}), schemaVersion: VERSION, uid, updatedAt: now, lastReason: reason,
        data: { ...((current && current.data) || {}), ...bucket }
      });
      await Promise.all([
        db.ref("studentProgress/" + uid).transaction(merge(snapshot.progress)),
        db.ref("quizResults/" + uid).transaction(merge(snapshot.quizResults))
      ]);
      writeMeta(uid, { ...readMeta(uid), syncedAt: now, remoteUpdatedAt: now });
      window.dispatchEvent(new CustomEvent("pandahan-progress-synced", { detail: { uid, reason, at: now } }));
      return true;
    } catch (error) {
      console.warn("Learning progress sync kept local cache:", error?.message || error);
      window.dispatchEvent(new CustomEvent("pandahan-progress-sync-error", { detail: { uid, reason, error: String(error?.message || error) } }));
      return false;
    } finally { flushing = false; }
  }
  function scheduleFlush(reason, immediate = false) {
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(() => { flushTimer = 0; flush(reason); }, immediate ? 0 : SYNC_DELAY);
  }
  async function activate(user) {
    activeUid = String(user?.uid || "");
    hydrated = false;
    if (!activeUid || !firebaseDb()) return;
    try { await hydrate(activeUid); } catch (error) { console.warn("Progress hydration kept local cache:", error?.message || error); }
  }

  window.PanTutorgressSync = { hydrate, flush, scheduleFlush, collect, restoreBucket };
  ["pandahan-learning-evaluation", "pandahan-quest-score-saved", "pandahan-phonetics-listening-quiz", "pandahan-mistakes-changed", "pandahan-srs-updated"].forEach((name) => {
    window.addEventListener(name, () => scheduleFlush(name));
  });
  window.addEventListener("pagehide", () => { if (flushTimer) { clearTimeout(flushTimer); flushTimer = 0; } flush("pagehide"); });
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush("hidden"); });
  window.firebase?.auth?.().onAuthStateChanged(activate);
})();
