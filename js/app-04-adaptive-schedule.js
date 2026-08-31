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

  function hydrateScheduleSync(schedule) {
    if (!schedule || !Array.isArray(schedule.days)) return schedule;
    let curriculum = [];
    try { curriculum = JSON.parse(localStorage.getItem(CURRICULUM_CACHE_KEY) || "[]"); } catch (_) { curriculum = []; }
    const byDay = new Map((Array.isArray(curriculum) ? curriculum : []).map((item) => [Number(item.day_number), item]));
    schedule.days.forEach((day) => {
      const item = byDay.get(Number(day.day_number));
      if (item) {
        if (!Array.isArray(day.required_tasks) || !day.required_tasks.length) day.required_tasks = core.getMandatoryTaskIds(item);
        day.topic = day.topic || item.topic || "";
        day.week_number = day.week_number || item.week_number || null;
        day.day_type = day.day_type || item.day_type || "new_content";
        day.required_score = 30;
      }
      day.completed_tasks = day.completed_tasks && typeof day.completed_tasks === "object" ? day.completed_tasks : {};
      day.task_events = Array.isArray(day.task_events) ? day.task_events : [];
    });
    const ordered = schedule.days.slice().sort((a, b) => Number(a.sequence_index || 0) - Number(b.sequence_index || 0));
    // Ôn tập/câu sai không phải cổng mở ngày; dọn dữ liệu cũ trước khi đánh giá.
    schedule.days.forEach((day) => {
      day.required_tasks = (Array.isArray(day.required_tasks) ? day.required_tasks : []).filter((id) => String(id) !== "mistake_review");
    });
    // Các buổi tiếp tục đã có đủ bằng chứng chính được xem là hoàn tất,
    // sau đó mở tuần tự ngày kế tiếp thay vì giữ ngày gốc bị khóa.
    for (let index = 0; index < ordered.length; index += 1) {
      const day = ordered[index];
      const next = ordered[index + 1];
      const repeat = !!day.is_repeat_of || day.day_type === "repeat";
      const complete = Array.isArray(day.required_tasks) && day.required_tasks.every((id) => day.completed_tasks[id]);
      if (repeat && complete && day.status !== "completed") {
        day.status = "completed";
        day.completed_at = day.completed_at || todayVietnam();
      }
      if (day.status === "completed" && next && (next.status === "pending_unlock" || next.status === "locked")) {
        next.status = "unlocked";
        next.scheduled_date = todayVietnam();
        delete next.unlock_date;
      }
    }
    // Legacy schedules may have marked a day completed from score alone. Do
    // not let that legacy flag unlock later content: the learner must repeat
    // the first day lacking real task evidence.
    let gateBroken = false;
    ordered.forEach((day) => {
      const isComplete = Array.isArray(day.required_tasks) && day.required_tasks.filter((id) => id !== "mistake_review").every((id) => day.completed_tasks[id]);
      if (!gateBroken && day.status === "completed" && !isComplete) {
        day.status = "unlocked";
        day.completed_at = null;
        gateBroken = true;
      } else if (gateBroken && day.status === "unlocked") {
        day.status = "locked";
        day.scheduled_date = null;
      }
    });
    // Migration cho schedule cũ: các phiên đã hoàn thành đủ task không bị giữ ở pending_unlock.
    const today = core.todayVietnam();
    ordered.forEach((day, index) => {
      const next = ordered[index + 1];
      const complete = day.status === "completed" && Array.isArray(day.required_tasks) && day.required_tasks.every((id) => day.completed_tasks?.[id]) && Number.isFinite(Number(day.last_score));
      if (complete && next && (next.status === "pending_unlock" || next.status === "locked")) {
        next.status = "unlocked";
        next.scheduled_date = today;
        delete next.unlock_date;
      }
    });
    const enforceSingleActiveSession = () => {
      let foundActive = false;
      schedule.days.slice().sort((a, b) => Number(a.sequence_index || 0) - Number(b.sequence_index || 0)).forEach((day) => {
        if (day.status !== "unlocked" && day.status !== "pending_unlock") return;
        if (!foundActive) { foundActive = true; return; }
        day.status = "locked";
        day.scheduled_date = null;
        delete day.unlock_date;
      });
    };
    enforceSingleActiveSession();
    if (typeof core.promoteDueDays === "function") core.promoteDueDays(schedule, core.todayVietnam());
    enforceSingleActiveSession();
    return schedule;
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
    const mission = window.PandaHanMission?.getCurrent?.();
    const isCurrentMission = Number(mission?.dayNumber) === Number(dayNumber);
    const linkedWords = isCurrentMission && Array.isArray(mission?.chainVocabulary) ? mission.chainVocabulary : [];
    const phase = linkedWords.length ? window.PandaHanVocabularyPhase?.get?.(Number(dayNumber)) : null;
    const prerequisiteMissing = linkedWords.length && (!mission?.adaptivePlan?.phoneticsReady || !phase?.introCompleted);
    if (prerequisiteMissing) {
      const schedule = loadLocal() || await initScheduleIfNeeded();
      const missingLinkedSteps = [
        ...(!mission?.adaptivePlan?.phoneticsReady ? ["listening", "speaking"] : []),
        ...(!phase?.introCompleted ? ["vocab-intro"] : [])
      ];
      return {
        schedule,
        result: {
          dayNumber: Number(dayNumber), score: Number(score), threshold: Number(mission?.requiredScore || 30), passed: false,
          action: "linked_chain_incomplete", code: "LINKED_CHAIN_INCOMPLETE", repeatCount: 0,
          missingTaskIds: missingLinkedSteps, requiredTaskIds: schedule?.days?.find((item) => Number(item.day_number) === Number(dayNumber))?.required_tasks || []
        }
      };
    }
    let result = null;
    let submitError = null;
    try {
      result = await submitDayResult(dayNumber, score, { taskId: "quest", source: "pinyin-tone-quest" });
    } catch (error) {
      submitError = error;
      try {
        let local = loadLocal();
        if (!local) local = await initScheduleIfNeeded();
        const active = local?.days?.find((item) => Number(item.day_number) === Number(dayNumber) && item.status === "unlocked");
        if (active) {
          const applied = core.applySubmit(local, dayNumber, score, core.todayVietnam(), { taskId: "quest", source: "pinyin-tone-quest" });
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
      const schedule = hydrateScheduleSync(normalizeSchedule(current) || loadLocal());
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
    recordTaskScore,
    completeTask,
    requireMistakeReview,
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
