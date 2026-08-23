/*
 * PandaHan Pro — Adaptive Schedule Engine v2
 * RTDB là nguồn sự thật; localStorage chỉ là cache/fallback offline.
 */
(() => {
  "use strict";

  const core = window.PandaHanScheduleCore;
  if (!core) {
    console.error("PandaHanScheduleCore chưa được nạp trước app-04.");
    return;
  }

  const SCHEDULE_PATH = "studentSchedules";
  const REVIEW_LOG_PATH = "reviewLogs";
  const SCHEDULE_KEY = () => "pandahan_schedule_v2_" + storageNamespace();
  const CURRICULUM_CACHE_KEY = "pandahan_curriculum_days_v2";
  let curriculumCache = null;

  function getUid() {
    const authUser = window.firebase?.auth?.().currentUser;
    if (authUser?.uid) return authUser.uid;
    try {
      if (typeof CURRENT_USER !== "undefined" && CURRENT_USER?.uid && !CURRENT_USER.isGuest) return CURRENT_USER.uid;
    } catch (_) {}
    return null;
  }

  function getRtdb() {
    if (!window.firebase || typeof window.firebase.database !== "function") return null;
    return window.firebase.database();
  }

  function loadLocal() {
    try { return JSON.parse(localStorage.getItem(SCHEDULE_KEY())) || null; }
    catch (_) { return null; }
  }

  function saveLocal(schedule) {
    localStorage.setItem(SCHEDULE_KEY(), JSON.stringify(schedule));
    return schedule;
  }

  function normalizeSchedule(raw) {
    if (!raw) return null;
    if (Array.isArray(raw.days)) return raw;
    const days = Object.values(raw).filter((item) => item && typeof item === "object" && item.day_number != null);
    if (!days.length) return null;
    return { _meta: { version: 1, extension_count: 0 }, days };
  }

  async function loadCurriculumDays() {
    if (curriculumCache) return curriculumCache;
    const cached = localStorage.getItem(CURRICULUM_CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length === 120) {
          curriculumCache = parsed;
          return parsed;
        }
      } catch (_) {}
    }
    const response = await fetch("assets/curriculum_days.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Không tải được curriculum (${response.status}).`);
    const payload = await response.json();
    const days = Array.isArray(payload) ? payload : payload.curriculum_days;
    if (!Array.isArray(days) || days.length !== 120) throw new Error("Curriculum phải có đúng 120 ngày.");
    curriculumCache = days.slice().sort((a, b) => Number(a.day_number) - Number(b.day_number));
    localStorage.setItem(CURRICULUM_CACHE_KEY, JSON.stringify(curriculumCache));
    return curriculumCache;
  }

  async function readServerSchedule(uid = getUid()) {
    const rtdb = getRtdb();
    if (!rtdb || !uid) return null;
    const snapshot = await rtdb.ref(`${SCHEDULE_PATH}/${uid}`).once("value");
    const schedule = normalizeSchedule(snapshot.val());
    if (schedule) saveLocal(schedule);
    return schedule;
  }

  async function writeServerSchedule(uid, schedule) {
    const rtdb = getRtdb();
    if (!rtdb || !uid) return { committed: false, snapshot: null };
    const ref = rtdb.ref(`${SCHEDULE_PATH}/${uid}`);
    let committedSchedule = null;
    const transaction = await ref.transaction((current) => {
      const currentSchedule = normalizeSchedule(current);
      const currentVersion = Number(currentSchedule?._meta?.version || 0);
      const requestedVersion = Number(schedule?._meta?.version || 0);
      if (currentSchedule && currentVersion > requestedVersion) {
        committedSchedule = currentSchedule;
        return;
      }
      const next = JSON.parse(JSON.stringify(schedule));
      next._meta = { ...(next._meta || {}), version: Math.max(currentVersion, requestedVersion) + 1, updated_at: Date.now() };
      committedSchedule = next;
      return next;
    });
    if (transaction.committed && committedSchedule) saveLocal(committedSchedule);
    return { committed: transaction.committed, snapshot: transaction.snapshot, schedule: committedSchedule };
  }

  async function initScheduleIfNeeded() {
    const uid = getUid();
    const server = await readServerSchedule(uid).catch(() => null);
    if (server) {
      publishLocalDailyPlan(server);
      return server;
    }
    const local = loadLocal();
    if (local) {
      if (uid) await writeServerSchedule(uid, local).catch(() => {});
      publishLocalDailyPlan(local);
      return local;
    }
    const schedule = core.createInitialSchedule(await loadCurriculumDays(), core.todayVietnam());
    saveLocal(schedule);
    if (uid) {
      const result = await writeServerSchedule(uid, schedule);
      const finalSchedule = result.schedule || schedule;
      publishLocalDailyPlan(finalSchedule);
      return finalSchedule;
    }
    publishLocalDailyPlan(schedule);
    return schedule;
  }

  function deterministicLogKey(type, uid, payload) {
    const raw = [type, uid, payload.dayNumber || payload.day_number || "", payload.score || "", payload.date || payload.today || ""].join("_");
    return raw.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 180);
  }

  async function writeReviewLog(uid, type, payload) {
    const rtdb = getRtdb();
    if (!rtdb || !uid) return;
    const key = deterministicLogKey(type, uid, payload);
    await rtdb.ref(`${REVIEW_LOG_PATH}/${uid}/${key}`).set({
      review_type: type,
      ...payload,
      created_at: firebase.database.ServerValue.TIMESTAMP,
    });
  }

  async function submitWithRtdb(dayNumber, score, today) {
    const uid = getUid();
    const rtdb = getRtdb();
    if (!uid || !rtdb) {
      const local = loadLocal() || await initScheduleIfNeeded();
      const result = core.applySubmit(local, dayNumber, score, today);
      saveLocal(result.schedule);
      return result;
    }
    const ref = rtdb.ref(`${SCHEDULE_PATH}/${uid}`);
    let output = null;
    let error = null;
    const transaction = await ref.transaction((current) => {
      try {
        const schedule = normalizeSchedule(current) || loadLocal();
        if (!schedule) throw new Error("Chưa khởi tạo lộ trình.");
        output = core.applySubmit(schedule, dayNumber, score, today);
        output.schedule._meta = { ...(output.schedule._meta || {}), version: Number(schedule._meta?.version || 0) + 1 };
        return output.schedule;
      } catch (caught) {
        error = caught;
        return;
      }
    });
    if (error) throw error;
    if (!transaction.committed || !output) throw new Error("Không ghi được schedule RTDB.");
    saveLocal(output.schedule);
    await writeReviewLog(uid, output.result.reviewType, {
      dayNumber,
      score: Number(score),
      passed: output.result.passed,
      action: output.result.action,
      repeatCount: output.result.repeatCount,
      date: today,
    });
    return output;
  }

  async function submitDayResult(dayNumber, score) {
    const result = await submitWithRtdb(dayNumber, score, core.todayVietnam());
    window.dispatchEvent(new CustomEvent("pandahan-schedule-updated", { detail: result }));
    return result;
  }

  function saveQuestHistoryLocal(record) {
    const key = "pandahan_quest_results_" + storageNamespace();
    let history = [];
    try { history = JSON.parse(localStorage.getItem(key) || "[]"); } catch (_) { history = []; }
    history = [record, ...history.filter((item) => item.resultToken !== record.resultToken)].slice(0, 60);
    localStorage.setItem(key, JSON.stringify(history));
  }

  function makeExistingQuestResult(schedule, dayNumber, score) {
    const day = schedule?.days?.find((item) => Number(item.day_number) === Number(dayNumber));
    if (!day) return null;
    const threshold = Number(day.required_score || (day.day_type === "review" ? 70 : 80));
    const passed = Number(score) >= threshold;
    const alreadyCompleted = day.status === "completed";
    return {
      schedule,
      result: {
        dayNumber: Number(dayNumber),
        score: Number(score),
        threshold,
        reviewType: day.last_review_type || (day.day_type === "review" ? "weekly" : "daily"),
        passed: alreadyCompleted || passed,
        action: alreadyCompleted ? "already_completed" : (passed ? "advance" : "repeat_assigned"),
        repeatCount: Number(day.repeat_count || 0),
      },
      offlineFallback: true,
      alreadyCompleted,
    };
  }

  async function submitQuestResult(dayNumber, score, resultToken) {
    let result = null;
    let submitError = null;
    try {
      result = await submitDayResult(dayNumber, score);
    } catch (error) {
      submitError = error;
      try {
        let local = loadLocal();
        if (!local) local = await initScheduleIfNeeded();
        const active = local?.days?.find((item) => Number(item.day_number) === Number(dayNumber) && item.status === "unlocked");
        if (active) {
          const applied = core.applySubmit(local, dayNumber, score, core.todayVietnam());
          saveLocal(applied.schedule);
          result = { ...applied, offlineFallback: true };
          window.dispatchEvent(new CustomEvent("pandahan-schedule-updated", { detail: result }));
        } else {
          result = makeExistingQuestResult(local, dayNumber, score);
        }
      } catch (fallbackError) {
        console.warn("Quest local fallback failed:", fallbackError.message || fallbackError);
      }
      if (!result) throw submitError;
    }

    const record = {
      source: "pinyin-tone-quest",
      dayNumber: Number(dayNumber),
      scorePercent: Number(score),
      passed: !!result?.result?.passed,
      threshold: Number(result?.result?.threshold || 80),
      reviewType: result?.result?.reviewType || "daily",
      repeatCount: Number(result?.result?.repeatCount || 0),
      action: result?.result?.action || "advance",
      offlineFallback: !!result?.offlineFallback,
      resultToken: String(resultToken || ""),
      createdAt: new Date().toISOString()
    };
    saveQuestHistoryLocal(record);
    const uid = getUid();
    const rtdb = getRtdb();
    if (uid && rtdb && !result?.offlineFallback) {
      try {
        const key = `quest_${record.dayNumber}_${record.scorePercent}_${String(resultToken || "").replace(/[^a-zA-Z0-9_-]/g, "_")}`;
        await rtdb.ref(`${REVIEW_LOG_PATH}/${uid}/${key}`).set({ review_type: "quest", ...record, created_at: firebase.database.ServerValue.TIMESTAMP });
      } catch (error) {
        console.warn("Quest RTDB review log fallback:", error.message || error);
      }
    }
    return result;
  }

  function publishLocalDailyPlan(schedule) {
    const days = Array.isArray(schedule?.days) ? schedule.days : [];
    const current = days.filter((day) => day.status === "unlocked")
      .sort((a, b) => Number(a.sequence_index) - Number(b.sequence_index))[0];
    if (!current) return;
    const today = core.todayVietnam();
    const uid = getUid() || "guest";
    const key = `pandahan_local_daily_plan_${uid}_${today}_${Number(current.sequence_index)}`;
    localStorage.setItem(key, "1");
    window.dispatchEvent(new CustomEvent("pandahan-daily-plan", {
      detail: {
        dayNumber: Number(current.day_number),
        sequenceIndex: Number(current.sequence_index),
        topic: current.topic || "",
        date: today,
      },
    }));
  }

  async function runCatchUpCheck() {
    const uid = getUid();
    const today = core.todayVietnam();
    const rtdb = getRtdb();
    if (!uid || !rtdb) {
      const local = loadLocal();
      if (!local) return { changed: false, reason: "no_schedule" };
      const result = core.applyDailyExtension(local, today);
      saveLocal(result.schedule);
      if (result.changed) window.dispatchEvent(new CustomEvent("pandahan-schedule-missed", { detail: result }));
      window.dispatchEvent(new CustomEvent("pandahan-schedule-updated", { detail: result }));
      return result;
    }
    const ref = rtdb.ref(`${SCHEDULE_PATH}/${uid}`);
    let extensionResult = null;
    const transaction = await ref.transaction((current) => {
      const schedule = normalizeSchedule(current) || loadLocal();
      if (!schedule) return;
      extensionResult = core.applyDailyExtension(schedule, today);
      extensionResult.schedule._meta = { ...(extensionResult.schedule._meta || {}), version: Number(schedule._meta?.version || 0) + 1 };
      return extensionResult.schedule;
    });
    if (!transaction.committed || !extensionResult) return { changed: false, reason: "not_committed" };
    saveLocal(extensionResult.schedule);
    if (extensionResult.changed) {
      await writeReviewLog(uid, "daily", {
        action: "extended",
        sourceDayNumber: extensionResult.sourceDayNumber,
        newSequenceIndex: extensionResult.newSequenceIndex,
        date: today,
      });
      window.dispatchEvent(new CustomEvent("pandahan-schedule-missed", { detail: extensionResult }));
    }
    window.dispatchEvent(new CustomEvent("pandahan-schedule-updated", { detail: extensionResult }));
    return extensionResult;
  }

  function computeWeeklyReview(schedule) {
    return core.evaluateReview(schedule, "weekly");
  }

  function computeMonthlyReview(schedule) {
    return core.evaluateReview(schedule, "monthly");
  }

  async function syncScheduleFromServer() {
    return readServerSchedule(getUid());
  }

  window.PandaHanSchedule = {
    initScheduleIfNeeded,
    submitDayResult,
    submitQuestResult,
    runCatchUpCheck,
    computeWeeklyReview,
    computeMonthlyReview,
    syncScheduleFromServer,
    getSchedule: loadLocal,
    getScheduleAsync: () => readServerSchedule(getUid()).then((server) => server || loadLocal()),
    todayVietnam: core.todayVietnam,
  };

  if (window.firebase && typeof window.firebase.auth === "function") {
    window.firebase.auth().onAuthStateChanged((user) => {
      if (!user) return;
      initScheduleIfNeeded().then(() => runCatchUpCheck()).then(() => {
        publishLocalDailyPlan(window.PandaHanSchedule.getSchedule?.());
      }).catch((error) => {
        console.warn("PandaHan schedule auth sync:", error);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initScheduleIfNeeded().then(() => runCatchUpCheck()).then(() => {
      publishLocalDailyPlan(window.PandaHanSchedule.getSchedule?.());
    }).catch((error) => {
      console.warn("PandaHan schedule init:", error);
    });
  });
})();
