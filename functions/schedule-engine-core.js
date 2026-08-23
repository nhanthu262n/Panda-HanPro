/* PandaHan Pro — Pure adaptive schedule state machine */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.PandaHanScheduleCore = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const clone = (value) => JSON.parse(JSON.stringify(value));

  function hasCurriculumTask(value) {
    const text = String(value == null ? "" : value).trim();
    return text !== "" && text !== "-" && !/^n\/a$/i.test(text);
  }

  // These IDs mirror the authoritative Excel columns. A learner may only
  // advance after every non-empty important column has a real completion event.
  function getMandatoryTaskIds(item = {}) {
    const ids = ["quest"];
    if (hasCurriculumTask(item.listening_task)) ids.push("listening");
    if (hasCurriculumTask(item.speaking_task)) ids.push("speaking");
    if (hasCurriculumTask(item.reading_writing_task)) ids.push("reading_writing");
    if (hasCurriculumTask(item.srs_review_task)) ids.push("srs");
    return ids;
  }

  function ensureDayRequirements(day, curriculumItem) {
    const derived = getMandatoryTaskIds(curriculumItem || day || {});
    const existing = Array.isArray(day.required_tasks) && day.required_tasks.length ? day.required_tasks : derived;
    day.required_tasks = Array.from(new Set(existing.map(String)));
    day.completed_tasks = day.completed_tasks && typeof day.completed_tasks === "object" ? day.completed_tasks : {};
    day.task_events = Array.isArray(day.task_events) ? day.task_events : [];
    day.task_scores = day.task_scores && typeof day.task_scores === "object" ? day.task_scores : {};
    return day;
  }

  function missingRequiredTasks(day) {
    ensureDayRequirements(day);
    return day.required_tasks.filter((id) => !day.completed_tasks[id]);
  }

  function todayVietnam(now = new Date()) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
  }

  function createInitialSchedule(curriculum, today = todayVietnam()) {
    if (!Array.isArray(curriculum) || curriculum.length !== 120) {
      throw new Error("Curriculum phải có đúng 120 ngày.");
    }
    return {
      _meta: {
        version: 1,
        started_at: today,
        last_checked_date: today,
        last_extension_date: null,
        extension_count: 0,
      },
      days: curriculum.map((item, index) => ({
        day_number: Number(item.day_number),
        sequence_index: Number(item.day_number),
        day_type: item.day_type || "new_content",
        week_number: item.week_number || null,
        topic: item.topic || "",
        required_score: Number(item.required_score || (item.day_type === "review" ? 70 : 80)),
        status: index === 0 ? "unlocked" : "locked",
        attempt_count: 0,
        best_score: null,
        scheduled_date: index === 0 ? today : null,
        completed_at: null,
        required_tasks: getMandatoryTaskIds(item),
        completed_tasks: {},
        task_events: [],
        task_scores: {},
      })),
    };
  }

  function nextSequence(schedule) {
    return Math.max(0, ...schedule.days.map((day) => Number(day.sequence_index || 0))) + 1;
  }

  function unlockNextDay(schedule, currentSequence, today = todayVietnam()) {
    const ordered = schedule.days.slice().sort((a, b) => a.sequence_index - b.sequence_index);
    const currentIndex = ordered.findIndex((day) => day.sequence_index === currentSequence);
    const next = ordered[currentIndex + 1];
    if (!next) return null;
    if (next.status === "locked") {
      next.status = "unlocked";
      next.scheduled_date = today;
    }
    return next;
  }

  function insertRepeatsAfter(schedule, failedDay, count, reason, today = todayVietnam()) {
    const repeats = [];
    const baseSequence = Number(failedDay.sequence_index);
    schedule.days.forEach((day) => {
      if (day.sequence_index > baseSequence) day.sequence_index += count;
    });
    for (let index = 0; index < count; index += 1) {
      repeats.push({
        day_number: failedDay.day_number,
        sequence_index: baseSequence + index + 1,
        day_type: "repeat",
        week_number: failedDay.week_number || null,
        topic: failedDay.topic || "",
        required_score: failedDay.required_score,
        status: index === 0 ? "unlocked" : "locked",
        attempt_count: 0,
        best_score: null,
        scheduled_date: index === 0 ? today : null,
        is_repeat_of: failedDay.day_number,
        repeat_reason: reason,
        required_tasks: Array.isArray(failedDay.required_tasks) ? failedDay.required_tasks.slice() : ["quest"],
        completed_tasks: {},
        task_events: [],
        task_scores: {},
      });
    }
    schedule.days.push(...repeats);
    return repeats;
  }

  function completedOriginalDays(schedule) {
    return schedule.days
      .filter((day) => day.status === "completed" && !day.is_repeat_of)
      .sort((a, b) => (a.completed_at || "").localeCompare(b.completed_at || ""));
  }

  function reviewTypeFor(day, schedule) {
    if (day.day_type === "review") {
      const weekNumber = Number(day.week_number || 0);
      return weekNumber > 0 && weekNumber % 4 === 0 ? "monthly" : "weekly";
    }
    return "daily";
  }

  function reviewThreshold(reviewType, day) {
    if (reviewType === "monthly") return 75;
    if (reviewType === "weekly") return 70;
    return Number(day.required_score || 80);
  }

  function evaluateReview(schedule, reviewType) {
    const limit = reviewType === "monthly" ? 28 : 7;
    const threshold = reviewType === "monthly" ? 75 : 70;
    const recent = completedOriginalDays(schedule).slice(-limit);
    if (!recent.length) return { reviewType, threshold, average: 0, pass: false, recentDays: [] };
    const average = recent.reduce((sum, day) => sum + Number(day.best_score || 0), 0) / recent.length;
    return {
      reviewType,
      threshold,
      average: Math.round(average * 100) / 100,
      pass: average >= threshold,
      recentDays: recent.map((day) => day.day_number),
    };
  }

  function finishDayIfReady(schedule, day, today) {
    const reviewType = reviewTypeFor(day, schedule);
    const threshold = reviewThreshold(reviewType, day);
    const missingTaskIds = missingRequiredTasks(day);
    const score = Number(day.last_score);
    if (missingTaskIds.length) {
      return { passed: false, action: "incomplete_day_requirements", repeatCount: 0, missingTaskIds, reviewType, threshold, score: Number.isFinite(score) ? score : null };
    }
    if (!Number.isFinite(score)) {
      return { passed: false, action: "awaiting_score", repeatCount: 0, missingTaskIds: [], reviewType, threshold, score: null };
    }
    if (score >= threshold) {
      day.status = "completed";
      day.completed_at = today;
      unlockNextDay(schedule, day.sequence_index, today);
      return { passed: true, action: "advance", repeatCount: 0, missingTaskIds: [], reviewType, threshold, score };
    }
    day.status = "failed_review";
    const repeatCount = reviewType === "monthly" ? 3 : reviewType === "weekly" ? 2 : 1;
    const repeats = insertRepeatsAfter(schedule, day, repeatCount, `${reviewType}_failed`, today);
    return { passed: false, action: "repeat_assigned", repeatCount: repeats.length, missingTaskIds: [], reviewType, threshold, score };
  }

  function applySubmit(scheduleInput, dayNumber, score, today = todayVietnam(), options = {}) {
    const schedule = clone(scheduleInput);
    const numericScore = Number(score);
    if (!Number.isFinite(numericScore) || numericScore < 0 || numericScore > 100) {
      throw new Error("Điểm phải nằm trong khoảng 0–100.");
    }
    const day = schedule.days.find((item) => Number(item.day_number) === Number(dayNumber) && item.status === "unlocked");
    if (!day) {
      const exists = schedule.days.some((item) => Number(item.day_number) === Number(dayNumber));
      const error = new Error(exists ? "Bài chưa được mở khóa." : `Không tìm thấy ngày ${dayNumber}.`);
      error.code = exists ? "LOCKED_DAY" : "DAY_NOT_FOUND";
      throw error;
    }
    ensureDayRequirements(day);
    const taskId = options && options.taskId ? String(options.taskId) : "";
    if (taskId) {
      if (!day.required_tasks.includes(taskId)) {
        const error = new Error(`Nhiệm vụ ${taskId} không thuộc yêu cầu của ngày ${dayNumber}.`);
        error.code = "UNKNOWN_REQUIRED_TASK";
        throw error;
      }
      day.completed_tasks[taskId] = { completed_at: today, source: options.source || "submitted" };
      day.task_events.push({ task_id: taskId, completed_at: today, source: options.source || "submitted" });
    }
    const reviewType = reviewTypeFor(day, schedule);
    const threshold = reviewThreshold(reviewType, day);
    day.task_scores[taskId || "overall"] = numericScore;
    if (!taskId || taskId === "quest") {
      day.attempt_count = Number(day.attempt_count || 0) + 1;
      day.best_score = Math.max(Number(day.best_score || 0), numericScore);
      day.last_score = numericScore;
      day.last_review_type = reviewType;
    }
    const evaluation = finishDayIfReady(schedule, day, today);
    return {
      schedule,
      result: {
        dayNumber: Number(dayNumber), score: numericScore, threshold, reviewType,
        passed: evaluation.passed, action: evaluation.action,
        repeatCount: evaluation.repeatCount, missingTaskIds: evaluation.missingTaskIds,
        requiredTaskIds: day.required_tasks.slice(), code: evaluation.action === "incomplete_day_requirements" ? "INCOMPLETE_DAY_REQUIREMENTS" : undefined,
      },
    };
  }

  function recordTaskCompletion(scheduleInput, dayNumber, taskId, today = todayVietnam(), source = "unverified") {
    const schedule = clone(scheduleInput);
    const day = schedule.days.find((item) => Number(item.day_number) === Number(dayNumber) && item.status === "unlocked");
    if (!day) {
      const exists = schedule.days.some((item) => Number(item.day_number) === Number(dayNumber));
      const error = new Error(exists ? "Bài chưa được mở khóa." : `Không tìm thấy ngày ${dayNumber}.`);
      error.code = exists ? "LOCKED_DAY" : "DAY_NOT_FOUND";
      throw error;
    }
    ensureDayRequirements(day);
    const id = String(taskId || "");
    if (!day.required_tasks.includes(id)) {
      const error = new Error(`Nhiệm vụ ${id || "trống"} không thuộc yêu cầu của ngày ${dayNumber}.`);
      error.code = "UNKNOWN_REQUIRED_TASK";
      throw error;
    }
    if (!day.completed_tasks[id]) {
      day.completed_tasks[id] = { completed_at: today, source };
      day.task_events.push({ task_id: id, completed_at: today, source });
    }
    const evaluation = finishDayIfReady(schedule, day, today);
    return {
      schedule,
      result: {
        dayNumber: Number(dayNumber), taskId: id, score: Number.isFinite(Number(day.last_score)) ? Number(day.last_score) : null,
        threshold: evaluation.threshold, reviewType: evaluation.reviewType, passed: evaluation.passed,
        action: evaluation.action, repeatCount: evaluation.repeatCount,
        missingTaskIds: evaluation.missingTaskIds, requiredTaskIds: day.required_tasks.slice(),
        code: evaluation.action === "incomplete_day_requirements" ? "INCOMPLETE_DAY_REQUIREMENTS" : undefined,
      },
    };
  }

  function applyDailyExtension(scheduleInput, today = todayVietnam()) {
    const schedule = clone(scheduleInput);
    schedule._meta = schedule._meta || { version: 1, extension_count: 0 };
    if (schedule._meta.last_extension_date === today) {
      return { schedule, changed: false, idempotent: true, reason: "already_processed" };
    }

    const overdue = schedule.days
      .filter((day) => day.status === "unlocked" && day.scheduled_date && day.scheduled_date < today)
      .sort((a, b) => a.sequence_index - b.sequence_index)[0];
    schedule._meta.last_checked_date = today;
    schedule._meta.last_extension_date = today;
    if (!overdue) return { schedule, changed: false, idempotent: false, reason: "nothing_overdue" };

    overdue.status = "extended";
    overdue.extended_at = today;
    const repeats = insertRepeatsAfter(schedule, overdue, 1, "missed_day", today);
    schedule._meta.extension_count = Number(schedule._meta.extension_count || 0) + 1;
    return {
      schedule,
      changed: true,
      idempotent: false,
      reason: "missed_day_extended",
      sourceDayNumber: overdue.day_number,
      newSequenceIndex: repeats[0].sequence_index,
    };
  }

  return {
    todayVietnam,
    createInitialSchedule,
    unlockNextDay,
    insertRepeatsAfter,
    evaluateReview,
    applySubmit,
    recordTaskCompletion,
    getMandatoryTaskIds,
    applyDailyExtension,
  };
});
