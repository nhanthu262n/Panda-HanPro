/*
 * PanTutor — Adaptive Schedule Engine v2
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

  function questEvidenceScores() {
    const scores = new Map();
    const put = (day, score) => {
      const d = Number(day), v = Number(score);
      if (!Number.isInteger(d) || d < 1 || d > 120 || !Number.isFinite(v)) return;
      scores.set(d, Math.max(Number(scores.get(d) || 0), Math.max(0, Math.min(100, v))));
    };
    try {
      const owners = [];
      const addOwner = (v) => { v = String(v || '').replace(/[^a-zA-Z0-9_-]/g, '_'); if (v && !owners.includes(v)) owners.push(v); };
      try { addOwner(storageNamespace()); } catch (_) {}
      try { addOwner(window.CURRENT_USER?.uid); addOwner(window.CURRENT_USER?.username); } catch (_) {}
      addOwner('guest'); // Handles Quest results saved during auth/bootstrap race.
      owners.forEach((ns) => {
        try {
          const progress = JSON.parse(localStorage.getItem(`pinyin-tone-quest-offline-progress-v2_${ns}`) || "{}") || {};
          Object.entries(progress.dayProgress || {}).forEach(([day, row]) => {
            row = row || {};
            const explicit = Number(row.scorePercent);
            const answered = Number(row.answered || 0), correct = Number(row.correct || 0);
            const derived = answered > 0 ? Math.round((Math.max(0, correct) / answered) * 100) : NaN;
            if (Number.isFinite(explicit)) put(day, explicit);
            if (Number.isFinite(derived)) put(day, derived);
          });
          const history = JSON.parse(localStorage.getItem(`pandahan_quest_results_${ns}`) || "[]") || [];
          (Array.isArray(history) ? history : []).forEach((row) => put(row.dayNumber, row.scorePercent));
          const bridge = JSON.parse(localStorage.getItem(`pandahan_quest_bridge_scores_v17_${ns}`) || "{}") || {};
          Object.entries(bridge).forEach(([day, score]) => put(day, score));
        } catch (_) {}
      });
    } catch (_) {}
    return scores;
  }

  function compactLegacyRepeats(schedule) {
    if (!schedule || !Array.isArray(schedule.days)) return schedule;
    const originals = schedule.days.filter((day) => !day.is_repeat_of && day.day_type !== "repeat");
    if (originals.length >= 120) {
      const unique = new Map();
      originals.forEach((day) => {
        const n = Number(day.day_number);
        if (n >= 1 && n <= 120 && !unique.has(n)) unique.set(n, day);
      });
      if (unique.size === 120) {
        schedule.days = Array.from(unique.values()).sort((a,b) => Number(a.day_number)-Number(b.day_number));
        schedule.days.forEach((day, index) => {
          day.sequence_index = index + 1;
          if (day.status === "extended" || day.status === "pending_unlock") day.status = "locked";
          delete day.is_repeat_of;
          delete day.repeat_reason;
          delete day.extension_index;
          delete day.continuation_from_sequence;
          delete day.extended_at;
          delete day.unlock_date;
        });
        schedule._meta = { ...(schedule._meta || {}), extension_count: 0, quest_gate_migrated_v15: true };
      }
    }
    return schedule;
  }

  function applyQuestEvidenceGate(schedule) {
    if (!schedule || !Array.isArray(schedule.days)) return schedule;
    compactLegacyRepeats(schedule);
    const testTarget = Number(schedule?._meta?.test_unlock_day || 0);
    if (Number.isInteger(testTarget) && testTarget >= 1 && testTarget <= 120) {
      const today = core.todayVietnam();
      schedule.days.forEach((day) => {
        const n = Number(day.day_number);
        day.completed_tasks = day.completed_tasks && typeof day.completed_tasks === "object" ? day.completed_tasks : {};
        day.task_scores = day.task_scores && typeof day.task_scores === "object" ? day.task_scores : {};
        if (n < testTarget) {
          day.status = "completed";
          day.completed_at = day.completed_at || today;
          day.completed_tasks.quest = day.completed_tasks.quest || { completed_at: today, source: "TEST_ONLY_CHAT_UNLOCK", score: 100 };
          day.task_scores.quest = Math.max(Number(day.task_scores.quest || 0), 100);
          day.last_score = Math.max(Number(day.last_score || 0), 100);
          day.best_score = Math.max(Number(day.best_score || 0), 100);
        } else if (n === testTarget) {
          day.status = "unlocked";
          day.scheduled_date = today;
        } else day.status = "locked";
      });
      return schedule;
    }
    const scores = questEvidenceScores();
    const ordered = schedule.days.slice().sort((a,b) => Number(a.day_number)-Number(b.day_number));
    const today = core.todayVietnam();
    let firstIncompleteSeen = false;
    ordered.forEach((day, index) => {
      day.required_tasks = ["quest"];
      day.completed_tasks = day.completed_tasks && typeof day.completed_tasks === "object" ? day.completed_tasks : {};
      day.task_scores = day.task_scores && typeof day.task_scores === "object" ? day.task_scores : {};
      const evidenceScore = Number(scores.get(Number(day.day_number)) || 0);
      const storedScore = Math.max(Number(day.last_score || 0), Number(day.best_score || 0), Number(day.task_scores.quest || 0));
      const score = Math.max(evidenceScore, storedScore);
      const passed = Number.isFinite(score) && score > 30;
      if (!firstIncompleteSeen && passed) {
        day.last_score = score;
        day.best_score = Math.max(Number(day.best_score || 0), score);
        day.task_scores.quest = score;
        day.completed_tasks.quest = day.completed_tasks.quest || { completed_at: day.completed_at || today, source: "quest-evidence-reconcile-v15", score };
        day.status = "completed";
        day.completed_at = day.completed_at || today;
        day.scheduled_date = day.scheduled_date || today;
      } else if (!firstIncompleteSeen) {
        firstIncompleteSeen = true;
        day.status = "unlocked";
        day.completed_at = null;
        day.scheduled_date = today;
        delete day.completed_tasks.quest;
      } else if (day.status !== "completed") {
        day.status = "locked";
        day.completed_at = null;
        day.scheduled_date = null;
        delete day.unlock_date;
      }
    });
    return schedule;
  }

  function hydrateScheduleSync(schedule) {
    if (!schedule || !Array.isArray(schedule.days)) return schedule;
    compactLegacyRepeats(schedule);
    let curriculum = [];
    try { curriculum = JSON.parse(localStorage.getItem(CURRICULUM_CACHE_KEY) || "[]"); } catch (_) { curriculum = []; }
    const byDay = new Map((Array.isArray(curriculum) ? curriculum : []).map((item) => [Number(item.day_number), item]));
    schedule.days.forEach((day) => {
      const item = byDay.get(Number(day.day_number));
      if (item) {
        day.required_tasks = ["quest"];
        day.topic = day.topic || item.topic || "";
        day.week_number = day.week_number || item.week_number || null;
        day.day_type = item.day_type || day.day_type || "new_content";
        day.required_score = 30;
      }
      day.completed_tasks = day.completed_tasks && typeof day.completed_tasks === "object" ? day.completed_tasks : {};
      day.task_events = Array.isArray(day.task_events) ? day.task_events : [];
      day.task_scores = day.task_scores && typeof day.task_scores === "object" ? day.task_scores : {};
    });
    return applyQuestEvidenceGate(schedule);
  }

  function loadLocal() {
    try { return hydrateScheduleSync(JSON.parse(localStorage.getItem(SCHEDULE_KEY())) || null); }
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
    const schedule = hydrateScheduleSync(normalizeSchedule(snapshot.val()));
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

  function getRegistrationDate() {
    try {
      const authUser = window.firebase?.auth?.().currentUser;
      const candidate = authUser?.metadata?.creationTime || window.CURRENT_USER?.createdAt || window.CURRENT_USER?.creationTime;
      if (!candidate) return null;
      const date = candidate?.toDate ? candidate.toDate() : new Date(candidate);
      if (Number.isNaN(date.getTime())) return null;
      return core.todayVietnam(date);
    } catch (_) { return null; }
  }

  function applyRegistrationAnchor(schedule) {
    const registrationDate = getRegistrationDate();
    if (!schedule || !registrationDate) return schedule;
    schedule._meta = schedule._meta || { version: 1, extension_count: 0 };
    if (!schedule._meta.registration_date) {
      schedule._meta.registration_date = registrationDate;
      schedule._meta.started_at = schedule._meta.started_at || registrationDate;
      const first = schedule.days?.slice().sort((a, b) => Number(a.sequence_index || 0) - Number(b.sequence_index || 0))[0];
      if (first && Number(first.attempt_count || 0) === 0 && !(first.task_events || []).length) first.scheduled_date = registrationDate;
    }
    return schedule;
  }

  async function initScheduleIfNeeded() {
    await loadCurriculumDays().catch((error) => console.warn("Curriculum preload:", error.message || error));
    const uid = getUid();
    const server = await readServerSchedule(uid).catch(() => null);
    if (server) {
      applyRegistrationAnchor(server);
      saveLocal(server);
      publishLocalDailyPlan(server);
      return server;
    }
    const local = loadLocal();
    if (local) {
      applyRegistrationAnchor(local);
      if (uid) await writeServerSchedule(uid, local).catch(() => {});
      saveLocal(local);
      publishLocalDailyPlan(local);
      return local;
    }
    const today = core.todayVietnam();
    const registrationDate = getRegistrationDate() || today;
    const schedule = core.createInitialSchedule(await loadCurriculumDays(), today);
    schedule._meta = { ...(schedule._meta || {}), registration_date: registrationDate, started_at: registrationDate };
    if (schedule.days?.[0]) schedule.days[0].scheduled_date = registrationDate;
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

  async function submitWithRtdb(dayNumber, score, today, options = {}) {
    const uid = getUid();
    const rtdb = getRtdb();
    if (!uid || !rtdb) {
      const local = loadLocal() || await initScheduleIfNeeded();
      const result = core.applySubmit(local, dayNumber, score, today, options);
      saveLocal(result.schedule);
      return result;
    }
    const ref = rtdb.ref(`${SCHEDULE_PATH}/${uid}`);
    let output = null;
    let error = null;
    const transaction = await ref.transaction((current) => {
      try {
        const schedule = hydrateScheduleSync(normalizeSchedule(current) || loadLocal());
        if (!schedule) throw new Error("Chưa khởi tạo lộ trình.");
        output = core.applySubmit(schedule, dayNumber, score, today, options);
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

  async function submitDayResult(dayNumber, score, options = {}) {
    const result = await submitWithRtdb(dayNumber, score, core.todayVietnam(), options);
    if (result?.schedule) publishLocalDailyPlan(result.schedule);
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
    const threshold = Number(day.required_score || 30);
    const passed = Number(score) > threshold;
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

  function forceQuestAdvanceOnSchedule(schedule, dayNumber, score, today = core.todayVietnam()) {
    schedule = hydrateScheduleSync(schedule);
    compactLegacyRepeats(schedule);
    const numericDay = Math.max(1, Math.min(120, Number(dayNumber) || 0));
    const numericScore = Math.max(0, Math.min(100, Number(score)));
    const day = schedule.days.find((item) => Number(item.day_number) === numericDay && !item.is_repeat_of);
    if (!day) throw new Error(`Không tìm thấy ngày ${numericDay}.`);
    day.required_tasks = ["quest"];
    day.completed_tasks = day.completed_tasks || {};
    day.task_scores = day.task_scores || {};
    day.task_events = Array.isArray(day.task_events) ? day.task_events : [];
    day.attempt_count = Number(day.attempt_count || 0) + 1;
    day.last_score = numericScore;
    day.best_score = Math.max(Number(day.best_score || 0), numericScore);
    day.task_scores.quest = numericScore;
    day.task_events.push({ task_id: "quest", score: numericScore, completed: numericScore > 30, completed_at: today, source: "pinyin-tone-quest-force-v15" });
    if (numericScore > 30) {
      day.completed_tasks.quest = { completed_at: today, source: "pinyin-tone-quest-force-v15", score: numericScore };
      day.status = "completed";
      day.completed_at = today;
      const next = schedule.days.find((item) => Number(item.day_number) === numericDay + 1 && !item.is_repeat_of);
      if (next) {
        next.status = "unlocked";
        next.scheduled_date = today;
        next.completed_at = null;
        delete next.unlock_date;
      }
      schedule.days.forEach((item) => {
        const n = Number(item.day_number);
        if (n > numericDay + 1 && item.status !== "completed") {
          item.status = "locked";
          item.scheduled_date = null;
          delete item.unlock_date;
        }
      });
    } else {
      day.status = "unlocked";
      day.completed_at = null;
      delete day.completed_tasks.quest;
    }
    schedule._meta = { ...(schedule._meta || {}), quest_gate_migrated_v15: true, last_quest_day: numericDay, last_quest_score: numericScore, updated_at: Date.now() };
    return {
      schedule,
      result: { dayNumber: numericDay, score: numericScore, threshold: 30, reviewType: "daily", passed: numericScore > 30, action: numericScore > 30 ? "advance" : "quest_below_threshold", repeatCount: 0, missingTaskIds: numericScore > 30 ? [] : ["quest"], requiredTaskIds: ["quest"] }
    };
  }

  async function forceQuestAdvance(dayNumber, score) {
    const today = core.todayVietnam();
    let local = loadLocal() || await initScheduleIfNeeded();
    let result = forceQuestAdvanceOnSchedule(local, dayNumber, score, today);
    saveLocal(result.schedule);
    publishLocalDailyPlan(result.schedule);
    window.dispatchEvent(new CustomEvent("pandahan-schedule-updated", { detail: result }));

    const uid = getUid(), rtdb = getRtdb();
    if (uid && rtdb) {
      try {
        const ref = rtdb.ref(`${SCHEDULE_PATH}/${uid}`);
        let committedOutput = null;
        const tx = await ref.transaction((current) => {
          try {
            const base = normalizeSchedule(current) || result.schedule;
            committedOutput = forceQuestAdvanceOnSchedule(base, dayNumber, score, today);
            committedOutput.schedule._meta = { ...(committedOutput.schedule._meta || {}), version: Number(base?._meta?.version || 0) + 1 };
            return committedOutput.schedule;
          } catch (error) {
            console.warn("Quest force RTDB transaction:", error?.message || error);
            return;
          }
        });
        if (tx.committed && committedOutput) {
          result = committedOutput;
          saveLocal(result.schedule);
          publishLocalDailyPlan(result.schedule);
          window.dispatchEvent(new CustomEvent("pandahan-schedule-updated", { detail: result }));
        }
      } catch (error) {
        console.warn("Quest force RTDB fallback keeps local progression:", error?.message || error);
      }
    }
    return result;
  }

  async function submitQuestResult(dayNumber, score, resultToken) {
    // Quest is intentionally independent from Listening/Speaking/Vocabulary completion.
    // Those activities still save evidence, but cannot block submitting the Quest score.
    let result = null;
    let submitError = null;
    try {
      result = await forceQuestAdvance(dayNumber, score);
    } catch (error) {
      submitError = error;
      try {
        let local = loadLocal();
        if (!local) local = await initScheduleIfNeeded();
        const active = local?.days?.find((item) => Number(item.day_number) === Number(dayNumber) && item.status === "unlocked");
        if (active) {
          const applied = forceQuestAdvanceOnSchedule(local, dayNumber, score, core.todayVietnam());
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
      threshold: Number(result?.result?.threshold || 30),
      reviewType: result?.result?.reviewType || "daily",
      repeatCount: Number(result?.result?.repeatCount || 0),
      action: result?.result?.action || "advance",
      missingTaskIds: Array.isArray(result?.result?.missingTaskIds) ? result.result.missingTaskIds : [],
      requiredTaskIds: Array.isArray(result?.result?.requiredTaskIds) ? result.result.requiredTaskIds : [],
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

  async function recordTaskScore(dayNumber, taskId, score, source = "unverified:vocabulary-sm2", evidence = {}) {
    if (!/^verified:/.test(String(source || ""))) {
      const error = new Error("Chỉ điểm có evidence xác minh mới được ghi nhận.");
      error.code = "UNVERIFIED_TASK_EVIDENCE";
      throw error;
    }
    const today = core.todayVietnam();
    const uid = getUid();
    const rtdb = getRtdb();
    let output = null;
    if (!uid || !rtdb) {
      const local = loadLocal() || await initScheduleIfNeeded();
      output = core.recordTaskScore(local, dayNumber, taskId, score, today, source, evidence);
      saveLocal(output.schedule);
    } else {
      const ref = rtdb.ref(`${SCHEDULE_PATH}/${uid}`);
      let error = null;
      const transaction = await ref.transaction((current) => {
        try {
          const schedule = hydrateScheduleSync(normalizeSchedule(current) || loadLocal());
          if (!schedule) throw new Error("Chưa khởi tạo lộ trình.");
          output = core.recordTaskScore(schedule, dayNumber, taskId, score, today, source, evidence);
          output.schedule._meta = { ...(output.schedule._meta || {}), version: Number(schedule._meta?.version || 0) + 1 };
          return output.schedule;
        } catch (caught) { error = caught; return; }
      });
      if (error) throw error;
      if (!transaction.committed || !output) throw new Error("Không ghi được điểm vocab-intro vào schedule RTDB.");
      saveLocal(output.schedule);
      await writeReviewLog(uid, "vocabulary-sm2", { dayNumber: Number(dayNumber), score: Number(score), taskId: String(taskId), source, evidence, date: today });
    }
    window.dispatchEvent(new CustomEvent("pandahan-schedule-updated", { detail: output }));
    window.dispatchEvent(new CustomEvent("pandahan-learning-evaluation", { detail: { source: "vocabulary-sm2", evidenceType: "daily_vocabulary_sm2_average", verified: true, dayNumber: Number(dayNumber), taskId: String(taskId), scorePercent: Number(score), threshold: 30, passed: Number(score) >= 30, ...evidence, missingTaskIds: output.result.missingTaskIds || [], requiredTaskIds: output.result.requiredTaskIds || [], evaluatedAt: Date.now() } }));
    return output;
  }

  async function completeTask(dayNumber, taskId, source = "unverified", evidence = {}) {
    if (!/^verified:/.test(String(source || ""))) {
      const error = new Error("Chỉ hoạt động đã xác minh mới được ghi nhận; không dùng xác nhận thủ công.");
      error.code = "UNVERIFIED_TASK_EVIDENCE";
      throw error;
    }
    const today = core.todayVietnam();
    const uid = getUid();
    const rtdb = getRtdb();
    let output = null;
    if (!uid || !rtdb) {
      const local = loadLocal() || await initScheduleIfNeeded();
      output = core.recordTaskCompletion(local, dayNumber, taskId, today, source);
      saveLocal(output.schedule);
    } else {
      const ref = rtdb.ref(`${SCHEDULE_PATH}/${uid}`);
      let error = null;
      const transaction = await ref.transaction((current) => {
        try {
          const schedule = hydrateScheduleSync(normalizeSchedule(current) || loadLocal());
          if (!schedule) throw new Error("Chưa khởi tạo lộ trình.");
          output = core.recordTaskCompletion(schedule, dayNumber, taskId, today, source);
          output.schedule._meta = { ...(output.schedule._meta || {}), version: Number(schedule._meta?.version || 0) + 1 };
          return output.schedule;
        } catch (caught) { error = caught; return; }
      });
      if (error) throw error;
      if (!transaction.committed || !output) throw new Error("Không ghi được completion task vào schedule RTDB.");
      saveLocal(output.schedule);
      await writeReviewLog(uid, output.result.reviewType || "daily", {
        dayNumber: Number(dayNumber), taskId: String(taskId), source, evidence,
        action: output.result.action, missingTaskIds: output.result.missingTaskIds || [], date: today,
      });
    }
    window.dispatchEvent(new CustomEvent("pandahan-schedule-updated", { detail: output }));
    window.dispatchEvent(new CustomEvent("pandahan-learning-evaluation", { detail: {
      source: String(source).replace(/^verified:/, ""), rawSource: source, evidenceType: evidence.evidenceType || "verified_task_evidence", verified: true,
      dayNumber: Number(dayNumber), taskId: String(taskId), action: output.result.action,
      passed: !!output.result.passed, scorePercent: Number.isFinite(Number(evidence.scorePercent)) ? Number(evidence.scorePercent) : output.result.score, threshold: output.result.threshold,
      attempts: evidence.attempts, correct: evidence.correct, total: evidence.total, durationSeconds: evidence.durationSeconds, components: evidence.components, details: evidence.details,
      missingTaskIds: output.result.missingTaskIds || [], requiredTaskIds: output.result.requiredTaskIds || [], evaluatedAt: Date.now(),
    }}));
    return output;
  }

  async function requireMistakeReview(dayNumber) {
    const today = core.todayVietnam();
    const uid = getUid();
    const rtdb = getRtdb();
    let output = null;
    const apply = (schedule) => {
      const day = schedule?.days?.find((item) => Number(item.day_number) === Number(dayNumber) && item.status === "unlocked");
      if (!day) return null;
      // Ôn câu sai chỉ là hoạt động tùy chọn; không thêm vào required_tasks.
      day.required_tasks = (Array.isArray(day.required_tasks) ? day.required_tasks : []).filter((id) => String(id) !== "mistake_review");
      day.mistake_review_required = true;
      day.mistake_review_added_at = day.mistake_review_added_at || today;
      return { schedule, result: { dayNumber: Number(dayNumber), taskId: "mistake_review", action: "review_required", missingTaskIds: core ? day.required_tasks.filter((id) => !day.completed_tasks?.[id]) : [] } };
    };
    if (!uid || !rtdb) {
      const local = loadLocal() || await initScheduleIfNeeded();
      output = apply(local);
      if (output) { saveLocal(output.schedule); window.dispatchEvent(new CustomEvent("pandahan-schedule-updated", { detail: output })); }
      return output;
    }
    const ref = rtdb.ref(`${SCHEDULE_PATH}/${uid}`);
    let error = null;
    const transaction = await ref.transaction((current) => {
      try {
        const schedule = hydrateScheduleSync(normalizeSchedule(current) || loadLocal());
        output = apply(schedule);
        if (!output) throw new Error("Không tìm thấy ngày đang mở để thêm nhiệm vụ ôn lỗi.");
        output.schedule._meta = { ...(output.schedule._meta || {}), version: Number(schedule._meta?.version || 0) + 1 };
        return output.schedule;
      } catch (caught) { error = caught; return; }
    });
    if (error) throw error;
    if (!transaction.committed || !output) return null;
    saveLocal(output.schedule);
    window.dispatchEvent(new CustomEvent("pandahan-schedule-updated", { detail: output }));
    return output;
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
        isRepeat: !!current.is_repeat_of || current.day_type === "repeat",
        repeatReason: current.repeat_reason || null,
        carriedCompletedTasks: Array.isArray(current.carried_completed_tasks) ? current.carried_completed_tasks.slice() : Object.keys(current.completed_tasks || {}),
        missingTaskIds: (current.required_tasks || []).filter((id) => !current.completed_tasks?.[id]),
        topic: current.topic || "",
        date: today,
      },
    }));
  }

  async function runCatchUpCheck() {
    // v15: Calendar gaps must NEVER create repeat Day-N sessions in the 120-day main path.
    // SRS/mistake review remains independent; main progression is only Quest >30%.
    const schedule = loadLocal() || await initScheduleIfNeeded();
    if (schedule) {
      compactLegacyRepeats(schedule);
      applyQuestEvidenceGate(schedule);
      saveLocal(schedule);
      publishLocalDailyPlan(schedule);
    }
    return { schedule, changed: false, reason: "quest_gate_no_calendar_repeat_v15" };
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

  async function reconcileQuestEvidenceV20() {
    let schedule = loadLocal() || await initScheduleIfNeeded();
    if (!schedule) return null;
    applyQuestEvidenceGate(schedule);
    saveLocal(schedule);
    publishLocalDailyPlan(schedule);
    window.dispatchEvent(new CustomEvent("pandahan-schedule-updated", { detail: { schedule, source: "quest-evidence-v20" } }));
    return schedule;
  }

  async function testUnlockToDay(dayNumber) {
    const target = Math.max(1, Math.min(120, Number(dayNumber || 1)));
    if (!Number.isInteger(target)) throw new Error("Test day must be an integer from 1 to 120.");
    let schedule = loadLocal() || await initScheduleIfNeeded();
    if (!schedule) throw new Error("Learning schedule is not ready.");
    compactLegacyRepeats(schedule);
    schedule._meta = { ...(schedule._meta || {}), test_unlock_day: target, test_unlock_local_only: true, test_unlock_at: Date.now() };
    try { localStorage.setItem("pandahan_test_active_day", String(target)); } catch (_) {}
    const today = core.todayVietnam();
    schedule.days.forEach((day) => {
      const n = Number(day.day_number);
      day.completed_tasks = day.completed_tasks && typeof day.completed_tasks === "object" ? day.completed_tasks : {};
      day.task_scores = day.task_scores && typeof day.task_scores === "object" ? day.task_scores : {};
      if (n < target) {
        day.status = "completed";
        day.completed_at = day.completed_at || today;
        day.last_score = Math.max(Number(day.last_score || 0), 100);
        day.best_score = Math.max(Number(day.best_score || 0), 100);
        day.completed_tasks.quest = day.completed_tasks.quest || { completed_at: today, source: "TEST_ONLY_CHAT_UNLOCK", score: 100 };
        day.task_scores.quest = Math.max(Number(day.task_scores.quest || 0), 100);
      } else if (n === target) {
        day.status = "unlocked";
        day.scheduled_date = today;
        delete day.completed_at;
      } else day.status = "locked";
    });
    saveLocal(schedule);
    publishLocalDailyPlan(schedule);
    window.dispatchEvent(new CustomEvent("pandahan-schedule-updated", { detail: { schedule, source: "TEST_ONLY_CHAT_UNLOCK", dayNumber: target } }));
    return schedule;
  }

  async function clearTestUnlock() {
    let schedule = loadLocal() || await initScheduleIfNeeded();
    if (!schedule) return null;
    try { localStorage.removeItem("pandahan_test_active_day"); } catch (_) {}
    if (schedule._meta) { delete schedule._meta.test_unlock_day; delete schedule._meta.test_unlock_local_only; delete schedule._meta.test_unlock_at; }
    applyQuestEvidenceGate(schedule);
    saveLocal(schedule);
    publishLocalDailyPlan(schedule);
    window.dispatchEvent(new CustomEvent("pandahan-schedule-updated", { detail: { schedule, source: "TEST_ONLY_RESET" } }));
    return schedule;
  }

  window.PandaHanSchedule = {
    initScheduleIfNeeded,
    submitDayResult,
    submitQuestResult,
    forceQuestAdvance,
    recordTaskScore,
    completeTask,
    requireMistakeReview,
    runCatchUpCheck,
    computeWeeklyReview,
    computeMonthlyReview,
    syncScheduleFromServer,
    reconcileQuestEvidence: reconcileQuestEvidenceV20,
    testUnlockToDay,
    clearTestUnlock,
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
