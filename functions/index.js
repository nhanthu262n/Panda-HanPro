const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const core = require("./schedule-engine-core");

admin.initializeApp();
const db = admin.database();
const firestore = admin.firestore();

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
    const eventKey = `schedule_extended_${today}_${result.sourceDayNumber}`;
    const notification = db.ref(`notifications/${uid}/${eventKey}`);
    const log = db.ref(`reviewLogs/${uid}/${eventKey}`);
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

async function publishDailyPlan(uid, today, schedule) {
  const days = Array.isArray(schedule?.days) ? schedule.days : [];
  const current = days.find((day) => day.status === "unlocked" && Number(day.sequence_index) === Math.min(...days.filter((item) => item.status === "unlocked").map((item) => Number(item.sequence_index)))) || days.find((day) => day.status === "unlocked");
  if (!current) return;
  const notificationId = `daily_plan_${today}_${Number(current.sequence_index)}`;
  await db.ref(`notifications/${uid}/${notificationId}`).set({
    type: "daily_plan",
    title: `Kế hoạch học ngày ${current.sequence_index}`,
    body: `Hôm nay học nội dung ngày ${current.day_number}: ${current.topic || "bài học theo lộ trình"}. Hoàn thành và đạt ngưỡng để mở bài tiếp theo.`,
    day_number: Number(current.day_number),
    sequence_index: Number(current.sequence_index),
    date: today,
    read: false,
    created_at: admin.database.ServerValue.TIMESTAMP,
  });
}

function extractTeacherUid(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const first = value.find((item) => item && (item.teacherUid || item.teacher_id || item.teacherId || item.uid));
    return first ? (first.teacherUid || first.teacher_id || first.teacherId || first.uid) : null;
  }
  return value.teacherUid || value.teacher_id || value.teacherId || value.uid || Object.keys(value).find((key) => value[key] === true) || null;
}

async function publishTeacherPlan(uid, today, schedule) {
  const relation = await db.ref(`studentTeachers/${uid}`).once("value");
  const teacherUid = extractTeacherUid(relation.val());
  if (!teacherUid) return { sent: false, reason: "no_teacher_relation" };
  const days = Array.isArray(schedule?.days) ? schedule.days : [];
  const unlocked = days.filter((day) => day.status === "unlocked").sort((a, b) => Number(a.sequence_index) - Number(b.sequence_index))[0];
  if (!unlocked) return { sent: false, reason: "no_unlocked_day" };
  const chatId = [uid, teacherUid].sort().join("_");
  const messageId = `daily_plan_${today}_${Number(unlocked.sequence_index)}`;
  const text = `Kế hoạch hôm nay: học ngày ${Number(unlocked.day_number)}${unlocked.topic ? ` — ${unlocked.topic}` : ""}. Hãy hoàn thành bài và đạt ngưỡng để mở buổi tiếp theo.`;
  const chatRef = firestore.collection("chats").doc(chatId);
  const messageRef = chatRef.collection("messages").doc(messageId);
  const batch = firestore.batch();
  batch.set(chatRef, { participants: [uid, teacherUid], updatedAt: Date.now(), lastMessage: text, lastSenderId: "system" }, { merge: true });
  batch.set(messageRef, { senderId: "system", senderName: "PandaHán Pro", text, isBroadcast: true, planDate: today, createdAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  await batch.commit();
  return { sent: true, teacherUid, chatId, messageId };
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
      Object.keys(schedules).map(async (uid) => {
        const result = await extendOneStudent(uid, today);
        const latest = await db.ref(`studentSchedules/${uid}`).once("value");
        await publishDailyPlan(uid, today, latest.val());
        await publishTeacherPlan(uid, today, latest.val());
        return result;
      })
    );
    console.log("dailyScheduleExtension", { date: today, results });
  }
);

exports.scheduleHealth = onRequest(async (_req, res) => {
  res.json({ ok: true, timezone: "Asia/Ho_Chi_Minh", service: "dailyScheduleExtension" });
});
