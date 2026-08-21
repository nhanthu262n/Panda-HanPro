const assert = require("assert");
const fs = require("fs");
const path = require("path");
const core = require("./js/schedule-engine-core.js");
const curriculum = JSON.parse(fs.readFileSync(path.join(__dirname, "assets/curriculum_days.json"), "utf8")).curriculum_days;

const today = "2026-08-21";

// 1) Pass ngày thường: ngày kế tiếp unlock.
let schedule = core.createInitialSchedule(curriculum, today);
let result = core.applySubmit(schedule, 1, 90, today);
assert.equal(result.result.passed, true);
assert.equal(result.schedule.days.find((d) => d.day_number === 2).status, "unlocked");

// 2) Không được submit bài locked.
schedule = core.createInitialSchedule(curriculum, today);
assert.throws(() => core.applySubmit(schedule, 2, 90, today), (error) => error.code === "LOCKED_DAY");

// 3) Fail ngày thường: tạo đúng một ngày repeat và đẩy sequence.
schedule = core.createInitialSchedule(curriculum, today);
result = core.applySubmit(schedule, 1, 50, today);
assert.equal(result.result.reviewType, "daily");
assert.equal(result.result.repeatCount, 1);
assert.equal(result.schedule.days.length, 121);
assert.equal(result.schedule.days.filter((d) => d.is_repeat_of === 1).length, 1);
assert.equal(result.schedule.days.find((d) => d.is_repeat_of === 1).status, "unlocked");

// 4) Fail ngày review: cần 6 ngày trước đó hoàn thành để mở ngày 7.
schedule = core.createInitialSchedule(curriculum, today);
for (let day = 1; day <= 6; day += 1) {
  result = core.applySubmit(schedule, day, 90, today);
  schedule = result.schedule;
}
assert.equal(schedule.days.find((d) => d.day_number === 7).status, "unlocked");
result = core.applySubmit(schedule, 7, 60, today);
assert.equal(result.result.reviewType, "weekly");
assert.equal(result.result.repeatCount, 2);
assert.equal(result.schedule.days.length, 122);

// 5) Monthly review engine: 20 completed original days, threshold 75.
schedule = core.createInitialSchedule(curriculum, today);
for (let day = 1; day <= 20; day += 1) {
  const item = schedule.days.find((d) => d.day_number === day);
  item.status = "completed";
  item.best_score = 80;
  item.completed_at = `2026-08-${String(day).padStart(2, "0")}`;
}
const monthly = core.evaluateReview(schedule, "monthly");
assert.equal(monthly.threshold, 75);
assert.equal(monthly.pass, true);
assert.equal(monthly.recentDays.length, 20);

// 6) Missed day 120: extension tạo day 121 đúng một lần.
schedule = core.createInitialSchedule(curriculum, today);
schedule.days.forEach((d) => { d.status = "completed"; d.completed_at = today; });
schedule.days[119].status = "unlocked";
schedule.days[119].scheduled_date = "2026-08-20";
let extension = core.applyDailyExtension(schedule, today);
assert.equal(extension.changed, true);
assert.equal(extension.schedule.days.length, 121);
assert.equal(extension.newSequenceIndex, 121);
assert.equal(extension.schedule._meta.extension_count, 1);
const secondRun = core.applyDailyExtension(extension.schedule, today);
assert.equal(secondRun.changed, false);
assert.equal(secondRun.idempotent, true);
assert.equal(secondRun.schedule.days.length, 121);

// 7) Giao ngày theo Việt Nam, không dùng UTC date trực tiếp.
assert.equal(core.todayVietnam(new Date("2026-08-20T17:00:00.000Z")), "2026-08-21");

console.log(JSON.stringify({
  status: "PASS",
  tests: 7,
  checks: [
    "pass_unlock",
    "locked_guard",
    "daily_repeat",
    "weekly_review_repeat",
    "monthly_review",
    "missed_day_121_idempotent",
    "asia_ho_chi_minh_timezone",
  ],
}, null, 2));
