const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const guide = fs.readFileSync(path.join(root, "js/first-time-guide.js"), "utf8");
const functions = fs.readFileSync(path.join(root, "functions/index.js"), "utf8");

assert(index.includes('id="firstLearnerGuide"'));
assert(index.includes('id="openFirstGuideBtn"'));
assert(index.includes('js/first-time-guide.js'));
assert(guide.includes("STORAGE_PREFIX = \"pandahan_first_guide_seen_\""));
assert(guide.includes("120 ngày"));
assert(guide.includes("Ngữ âm"));
assert(guide.includes("Quest"));
assert(guide.includes("Mở Thông báo"));
assert(guide.includes("localStorage.setItem(STORAGE_PREFIX + scope, \"1\")"));
assert(!guide.includes("OPENAI_API_KEY"));
assert(functions.includes("exports.dailyIncompleteStudyReminder = onSchedule"));
assert(functions.includes('schedule: "0 20 * * *"'));
assert(functions.includes('timeZone: "Asia/Ho_Chi_Minh"'));
assert(functions.includes("study_reminder_${today}_${sequence}"));
assert(functions.includes('type: "study_reminder"'));
assert(functions.includes('reminderDate: today'));
assert(functions.includes('firestore.collection("chats")'));
assert(functions.includes('messageRef = chatRef.collection("messages").doc(messageId)'));

console.log(JSON.stringify({
  status: "PASS",
  checks: [
    "first_learner_guide_markup",
    "guide_covers_120_days_phonetics_quest",
    "guide_seen_state_persists",
    "guide_has_no_client_api_key",
    "20h_vietnam_reminder_cron",
    "rtdb_study_notification",
    "firestore_teacher_reminder",
    "deterministic_reminder_id",
  ],
}, null, 2));
