/* PanTutor — Quest main-path gate: a lesson unlocks only above 30%. */
(() => {
  "use strict";
  const PASS_PERCENT = 30;
  const MAX_DAYS = 120;
  const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const percentage = (correct, answered) => {
    const total = Math.max(0, number(answered));
    return total ? Math.round((Math.max(0, number(correct)) / total) * 100) : 0;
  };
  const isPassing = (scorePercent) => number(scorePercent) > PASS_PERCENT;
  function normalize(progress) {
    const source = progress && typeof progress === "object" ? progress : {};
    const dayProgress = source.dayProgress && typeof source.dayProgress === "object" ? source.dayProgress : {};
    const next = { ...source, dayProgress: { ...dayProgress } };
    Object.keys(next.dayProgress).forEach((day) => {
      const row = next.dayProgress[day] || {};
      const answered = number(row.answered, 0);
      const explicit = Number(row.scorePercent);
      const derived = answered > 0 ? percentage(row.correct, answered) : NaN;
      const scorePercent = Math.max(Number.isFinite(explicit) ? explicit : 0, Number.isFinite(derived) ? derived : 0);
      next.dayProgress[day] = { ...row, scorePercent, completed: isPassing(scorePercent), threshold: PASS_PERCENT };
    });
    return next;
  }
  function gateFor(progress) {
    const normalized = normalize(progress);
    const completed = [];
    for (let day = 1; day <= MAX_DAYS; day += 1) {
      if (normalized.dayProgress[String(day)]?.completed) completed.push(day);
      else return { unlocked: [day], completed, progress: normalized };
    }
    return { unlocked: [], completed, progress: normalized };
  }
  function recordResult(progress, day, correct, answered, metadata = {}) {
    const numericDay = Math.max(1, Math.min(MAX_DAYS, Math.floor(number(day, 1))));
    const gate = gateFor(progress);
    if (!gate.unlocked.includes(numericDay) && !gate.completed.includes(numericDay)) {
      const error = new Error("Quest lesson is locked until the preceding lesson is passed above 30%.");
      error.code = "QUEST_LESSON_LOCKED";
      throw error;
    }
    const previous = gate.progress.dayProgress[String(numericDay)] || {};
    const scorePercent = percentage(correct, answered);
    const shouldKeepPreviousPass = previous.completed && number(previous.scorePercent) > scorePercent;
    const row = shouldKeepPreviousPass ? previous : { ...previous, correct: Math.max(0, number(correct)), answered: Math.max(0, number(answered)), scorePercent, completed: isPassing(scorePercent), threshold: PASS_PERCENT, updatedAt: Date.now(), ...metadata };
    const next = normalize({ ...gate.progress, dayProgress: { ...gate.progress.dayProgress, [String(numericDay)]: row } });
    return { progress: next, result: { day: numericDay, scorePercent: row.scorePercent, passed: !!row.completed, threshold: PASS_PERCENT }, gate: gateFor(next) };
  }
  const api = { PASS_PERCENT, MAX_DAYS, percentage, isPassing, normalize, gateFor, recordResult };
  if (typeof window !== "undefined") window.PandaHanQuestProgression = api;
  if (typeof globalThis !== "undefined") globalThis.PandaHanQuestProgression = api;
})();
