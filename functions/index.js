const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const core = require("./schedule-engine-core");

admin.initializeApp();
const db = admin.database();

function todayVietnam(now = new Date()) {
  return core.todayVietnam(now);
}

async function extendOneStudent(uid, today) {
  const ref = db.ref(`studentSchedules/${uid}`);
  let result = null;
  const transaction = await ref.transaction((current) => {
    if (!current) return;
    result = core.applyDailyExtension(current, today);
    result.schedule._meta = {
      ...(result.schedule._meta || {}),
      version: Number(current?._meta?.version || 0) + 1,
      updated_at: admin.database.ServerValue.TIMESTAMP,
    };
    return result.schedule;
  });

  if (!transaction.committed || !result) {
    return { uid, changed: false, reason: "not_committed" };
  }

  if (result.changed) {
    const notification = db.ref(`notifications/${uid}`).push();
    const log = db.ref(`reviewLogs/${uid}`).push();
    await Promise.all([
      notification.set({
        type: "schedule_extended",
        title: "Lộ trình được gia hạn",
        body: `Ngày ${result.sourceDayNumber} chưa hoàn thành; đã thêm ngày ôn ${result.newSequenceIndex}.`,
        source_day_number: result.sourceDayNumber,
        new_sequence_index: result.newSequenceIndex,
        date: today,
        read: false,
        created_at: admin.database.ServerValue.TIMESTAMP,
      }),
      log.set({
        review_type: "daily",
        action: "schedule_extended",
        source_day_number: result.sourceDayNumber,
        new_sequence_index: result.newSequenceIndex,
        date: today,
        created_at: admin.database.ServerValue.TIMESTAMP,
      }),
    ]);
  }
  return { uid, changed: result.changed, reason: result.reason };
}

exports.dailyScheduleExtension = onSchedule(
  {
    schedule: "0 0 * * *",
    timeZone: "Asia/Ho_Chi_Minh",
    region: "asia-southeast1",
    retryCount: 3,
    maxInstances: 1,
  },
  async () => {
    const today = todayVietnam();
    const snapshot = await db.ref("studentSchedules").once("value");
    const schedules = snapshot.val() || {};
    const results = await Promise.all(
      Object.keys(schedules).map((uid) => extendOneStudent(uid, today))
    );
    console.log("dailyScheduleExtension", { date: today, results });
  }
);

exports.scheduleHealth = onRequest(async (_req, res) => {
  res.json({ ok: true, timezone: "Asia/Ho_Chi_Minh", service: "dailyScheduleExtension" });
});
