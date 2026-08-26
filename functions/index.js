const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const core = require("./schedule-engine-core");

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

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
        title_vi: "Lộ trình được gia hạn",
        title_en: "Learning path extended",
        body: `Ngày ${result.sourceDayNumber} chưa hoàn thành; đã thêm ngày ôn ${result.newSequenceIndex}.`,
        body_vi: `Ngày ${result.sourceDayNumber} chưa hoàn thành; đã thêm ngày ôn ${result.newSequenceIndex}.`,
        body_en: `Day ${result.sourceDayNumber} was not completed; review day ${result.newSequenceIndex} has been added.`,
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
  return {
    uid,
    changed: result.changed,
    reason: result.reason,
    sourceDayNumber: result.sourceDayNumber || null,
    newSequenceIndex: result.newSequenceIndex || null,
  };
}

async function publishPostMidnightMissedNotice(uid, today, extensionResult) {
  if (!extensionResult?.changed || !extensionResult.sourceDayNumber) return { sent: false, reason: "no_extension" };
  const sourceDay = Number(extensionResult.sourceDayNumber);
  const newSequence = Number(extensionResult.newSequenceIndex || 0);
  const notificationId = `missed_day_after_midnight_${today}_${sourceDay}`;
  const carried = Array.isArray(extensionResult.carriedTaskIds) ? extensionResult.carriedTaskIds : [];
  const missing = Array.isArray(extensionResult.missingTaskIds) ? extensionResult.missingTaskIds : [];
  const titleVi = "Nhiệm vụ chưa xong đã chuyển sang buổi tiếp tục";
  const titleEn = "Incomplete work moved to a continuation session";
  const bodyVi = `Ngày ${sourceDay} chưa hoàn thành trước 00:00. Hệ thống tạo Buổi ${newSequence} — tiếp tục Ngày ${sourceDay}; đã giữ ${carried.length ? carried.join(", ") : "chưa có task"}, còn thiếu ${missing.length ? missing.join(", ") : "không còn task"}.`;
  const bodyEn = `Day ${sourceDay} was incomplete at midnight. Session ${newSequence} continues Day ${sourceDay}; carried ${carried.length ? carried.join(", ") : "no tasks"}, still missing ${missing.length ? missing.join(", ") : "none"}.`;
  await db.ref(`notifications/${uid}/${notificationId}`).set({
    type: "missed_day_after_midnight",
    title: titleVi,
    title_vi: titleVi,
    title_en: titleEn,
    body: bodyVi,
    body_vi: bodyVi,
    body_en: bodyEn,
    source_day_number: sourceDay,
    new_sequence_index: newSequence,
    carried_task_ids: carried,
    missing_task_ids: missing,
    date: today,
    read: false,
    created_at: admin.database.ServerValue.TIMESTAMP,
  });

  const relation = await db.ref(`studentTeachers/${uid}`).once("value");
  const teacherUid = extractTeacherUid(relation.val());
  if (!teacherUid) return { sent: true, teacherMessage: false };
  const chatId = [uid, teacherUid].sort().join("_");
  const messageId = notificationId;
  const textVi = `Sau 00:00, hệ thống ghi nhận Ngày ${sourceDay} chưa hoàn thành và chuyển phần còn thiếu sang Buổi ${newSequence} — tiếp tục Ngày ${sourceDay}. Đã giữ: ${carried.length ? carried.join(", ") : "chưa có"}; còn thiếu: ${missing.length ? missing.join(", ") : "không còn"}.`;
  const textEn = `After midnight, Day ${sourceDay} was incomplete; remaining work moved to Session ${newSequence} — continue Day ${sourceDay}. Carried: ${carried.length ? carried.join(", ") : "none"}; still missing: ${missing.length ? missing.join(", ") : "none"}.`;
  const chatRef = firestore.collection("chats").doc(chatId);
  const batch = firestore.batch();
  batch.set(chatRef, { participants: [uid, teacherUid], updatedAt: Date.now(), lastMessage: textVi, lastMessageEn: textEn, lastSenderId: "system" }, { merge: true });
  batch.set(chatRef.collection("messages").doc(messageId), {
    senderId: "system", senderName: "PandaHán Pro", text: textVi, text_vi: textVi, text_en: textEn,
    isBroadcast: true, reminderDate: today, sourceDayNumber: sourceDay, newSequenceIndex: newSequence, carriedTaskIds: carried, missingTaskIds: missing,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  await batch.commit();
  return { sent: true, teacherMessage: true, teacherUid, chatId, messageId };
}

async function publishDailyPlan(uid, today, schedule) {
  const days = Array.isArray(schedule?.days) ? schedule.days : [];
  const current = days.find((day) => day.status === "unlocked" && Number(day.sequence_index) === Math.min(...days.filter((item) => item.status === "unlocked").map((item) => Number(item.sequence_index)))) || days.find((day) => day.status === "unlocked");
  if (!current) return;
  const notificationId = `daily_plan_${today}_${Number(current.sequence_index)}`;
  await db.ref(`notifications/${uid}/${notificationId}`).set({
    type: "daily_plan",
    title: current.is_repeat_of ? `Buổi tiếp tục ${current.sequence_index} — Ngày ${current.day_number}` : `Kế hoạch học ngày ${current.sequence_index}`,
    title_vi: current.is_repeat_of ? `Buổi tiếp tục ${current.sequence_index} — Ngày ${current.day_number}` : `Kế hoạch học ngày ${current.sequence_index}`,
    title_en: current.is_repeat_of ? `Continuation session ${current.sequence_index} — Day ${current.day_number}` : `Study plan for day ${current.sequence_index}`,
    body: current.is_repeat_of ? `Tiếp tục Ngày ${current.day_number}: ${current.topic || "bài học theo lộ trình"}. Hoàn thành phần còn thiếu để mở buổi sau.` : `Hôm nay học nội dung ngày ${current.day_number}: ${current.topic || "bài học theo lộ trình"}. Hoàn thành và đạt ngưỡng để mở bài tiếp theo.`,
    body_vi: current.is_repeat_of ? `Tiếp tục Ngày ${current.day_number}: ${current.topic || "bài học theo lộ trình"}. Hoàn thành phần còn thiếu để mở buổi sau.` : `Hôm nay học nội dung ngày ${current.day_number}: ${current.topic || "bài học theo lộ trình"}. Hoàn thành và đạt ngưỡng để mở bài tiếp theo.`,
    body_en: current.is_repeat_of ? `Continue Day ${current.day_number}: ${current.topic || "the assigned lesson"}. Complete the remaining work to unlock the next session.` : `Today: study curriculum day ${current.day_number}: ${current.topic || "the assigned lesson"}. Complete it and meet the threshold to unlock the next lesson.`,
    day_number: Number(current.day_number),
    sequence_index: Number(current.sequence_index),
    is_repeat: !!current.is_repeat_of || current.day_type === "repeat",
    carried_task_ids: current.carried_completed_tasks || [],
    missing_task_ids: (current.required_tasks || []).filter((id) => !current.completed_tasks?.[id]),
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
  const textEn = `Today's plan: study day ${Number(unlocked.day_number)}${unlocked.topic ? ` — ${unlocked.topic}` : ""}. Complete the lesson and meet the threshold to unlock the next session.`;
  const chatRef = firestore.collection("chats").doc(chatId);
  const messageRef = chatRef.collection("messages").doc(messageId);
  const batch = firestore.batch();
  batch.set(chatRef, { participants: [uid, teacherUid], updatedAt: Date.now(), lastMessage: text, lastMessageEn: textEn, lastSenderId: "system" }, { merge: true });
  batch.set(messageRef, { senderId: "system", senderName: "PandaHán Pro", text, text_vi: text, text_en: textEn, isBroadcast: true, planDate: today, createdAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  await batch.commit();
  return { sent: true, teacherUid, chatId, messageId };
}

function currentUnlockedDay(schedule) {
  const days = Array.isArray(schedule?.days) ? schedule.days : [];
  return days
    .filter((day) => day.status === "unlocked")
    .sort((a, b) => Number(a.sequence_index) - Number(b.sequence_index))[0] || null;
}

async function publishIncompleteReminder(uid, today, schedule) {
  const current = currentUnlockedDay(schedule);
  if (!current) return { notified: false, reason: "no_unlocked_day" };
  const sequence = Number(current.sequence_index);
  const dayNumber = Number(current.day_number);
  const notificationId = `study_reminder_${today}_${sequence}`;
  const body = `Bạn chưa hoàn thành buổi học ngày ${dayNumber}. Hãy quay lại học trước 00:00 để giữ tiến độ; nếu bỏ lỡ, hệ thống sẽ đưa phần chưa xong sang ngày tiếp theo.`;
  await db.ref(`notifications/${uid}/${notificationId}`).set({
    type: "study_reminder",
    title: `Nhắc học: còn buổi ngày ${dayNumber}`,
    title_vi: `Nhắc học: còn buổi ngày ${dayNumber}`,
    title_en: `Study reminder: day ${dayNumber} is incomplete`,
    body,
    body_vi: body,
    body_en: `Day ${dayNumber} is not complete yet. Return to the lesson before midnight; if it is missed, the unfinished work will be moved to the next sequence.`,
    day_number: dayNumber,
    sequence_index: sequence,
    date: today,
    read: false,
    created_at: admin.database.ServerValue.TIMESTAMP,
  });

  const relation = await db.ref(`studentTeachers/${uid}`).once("value");
  const teacherUid = extractTeacherUid(relation.val());
  if (!teacherUid) return { notified: true, teacherMessage: false, reason: "no_teacher_relation" };
  const chatId = [uid, teacherUid].sort().join("_");
  const messageId = `study_reminder_${today}_${sequence}`;
  const text = `Nhắc học: học sinh chưa hoàn thành buổi ngày ${dayNumber}${current.topic ? ` — ${current.topic}` : ""}. Vui lòng hoàn thành trước 00:00 để tránh kéo dài lộ trình.`;
  const textEn = `Study reminder: the learner has not completed day ${dayNumber}${current.topic ? ` — ${current.topic}` : ""}. Please complete it before midnight to avoid extending the learning path.`;
  const chatRef = firestore.collection("chats").doc(chatId);
  const messageRef = chatRef.collection("messages").doc(messageId);
  const batch = firestore.batch();
  batch.set(chatRef, { participants: [uid, teacherUid], updatedAt: Date.now(), lastMessage: text, lastMessageEn: textEn, lastSenderId: "system" }, { merge: true });
  batch.set(messageRef, { senderId: "system", senderName: "PandaHán Pro", text, text_vi: text, text_en: textEn, isBroadcast: true, reminderDate: today, sequenceIndex: sequence, createdAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  await batch.commit();
  return { notified: true, teacherMessage: true, teacherUid, chatId, messageId };
}

exports.dailyIncompleteStudyReminder = onSchedule(
  {
    schedule: "0 20 * * *",
    timeZone: "Asia/Ho_Chi_Minh",
    region: "asia-southeast1",
    retryCount: 3,
    maxInstances: 1,
  },
  async () => {
    const today = todayVietnam();
    const snapshot = await db.ref("studentSchedules").once("value");
    const schedules = snapshot.val() || {};
    const results = await Promise.all(Object.keys(schedules).map((uid) =>
      publishIncompleteReminder(uid, today, schedules[uid])
    ));
    console.log("dailyIncompleteStudyReminder", { date: today, count: results.length, results });
  }
);

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
        if (result.changed) await publishPostMidnightMissedNotice(uid, today, result);
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

function setCors(res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
}
function normaliseChatHistory(history) {
  if (!Array.isArray(history)) return [];
  return history.slice(-12).map((item) => {
    const role = item?.role === "user" ? "user" : "assistant";
    return { role, content: String(item?.text || item?.content || "").slice(0, 2000) };
  }).filter((item) => item.content.trim());
}
function aiSystemPrompt(learner) {
  const safe = learner && typeof learner === "object" ? learner : {};
  return [
    "You are PandaHán AI Coach, a natural conversational Chinese tutor. Continue the conversation coherently and be helpful for open-ended questions, while grounding progress claims in the supplied learner context.",
    "Output language rule: answer in English when learner.lang=en, in Chinese when learner.lang=zh, and otherwise in Vietnamese. If the user writes primarily in English or Chinese, match that language even if learner.lang is absent. For Chinese-learning examples, include Chinese characters, pinyin, and a concise explanation/translation in the output language.",
    "Open-chat scope: support Chinese study questions, HSK 1–6 explanations, vocabulary, grammar, reading, writing, dialogue rehearsal, study habits, feedback on a learner-provided draft, and natural follow-up questions. For unrelated requests, respond politely and redirect toward a useful learning angle without inventing facts.",
    "Progress integrity: never claim that the learner completed a task, earned a score, unlocked a day, or fixed a mistake unless that exact evidence appears in learner context. Free practice never unlocks a scheduled day. Do not bypass a locked sequence.",
    "When a daily task is being discussed, prioritize the first verified-missing task and give an actionable next step. If the user asks for progress and evidence is absent, state that no verified evidence is available instead of guessing.",
    "For a requested HSK 1–6 paragraph, first respect an explicitly chosen level/topic. Create a complete multi-sentence passage suitable to the requested level, with a short title, Chinese text, pinyin, translation, 2–4 grammar patterns, 4–8 target words and one rewrite task. Do not output only one sentence unless the user explicitly asks for one sentence.",
    "For a grammar question, teach as a patient tutor in this order: name and HSK-appropriate pattern; plain-language purpose and when to use it; 1–2 Chinese examples with pinyin and translation; a contrast or common mistake; then one short personalised practice prompt. If the question compares two grammar patterns, state the key contrast with one paired example. Do not merely define a pattern in one sentence.",
    "For vocabulary questions, give meaning, pinyin, word class when useful, a natural example, one collocation or contrast when reliable, and a short invitation to make the learner's own sentence. For sentence correction, quote the learner's original sentence, provide a corrected version only when confident, explain each visible change, and distinguish grammar certainty from optional naturalness improvements.",
    "For conversation practice, give a realistic 2–6 turn dialogue, then ask one relevant follow-up question. For writing feedback, separate observable grammar/wording feedback from semantic/naturalness feedback. Never fabricate a rubric score or verified learning evidence.",
    "Keep replies well structured but concise enough for a chat panel. Use headings only when the response includes a passage, dialogue, plan, or feedback list.",
    "LEARNER_CONTEXT_JSON=" + JSON.stringify(safe).slice(0, 12000),
  ].join("\n");
}
exports.aiChat = onRequest({
  region: "asia-southeast1",
  secrets: [OPENAI_API_KEY],
  timeoutSeconds: 60,
  memory: "256MiB",
}, async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).send("");
  if (req.method !== "POST") return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  try {
    const authHeader = String(req.get("authorization") || "");
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
    if (!token) return res.status(401).json({ error: "AUTH_REQUIRED" });
    const decoded = await admin.auth().verifyIdToken(token);
    const message = String(req.body?.message || "").trim().slice(0, 2000);
    if (!message) return res.status(400).json({ error: "EMPTY_MESSAGE" });
    const apiKey = process.env.OPENAI_API_KEY || OPENAI_API_KEY.value();
    if (!apiKey) return res.status(503).json({ error: "AI_BACKEND_NOT_CONFIGURED" });
    const model = String(process.env.OPENAI_MODEL || "gpt-5-mini");
    const history = normaliseChatHistory(req.body?.history);
    const lang = ["vi", "en", "zh"].includes(req.body?.lang) ? req.body.lang : "vi";
    const learner = { ...(req.body?.learner || {}), uid: decoded.uid, lang };
    const upstream = await fetch(String(process.env.OPENAI_BASE_URL || "https://api.openai.com/v1") + "/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: aiSystemPrompt(learner) }, ...history, { role: "user", content: message }],
        max_completion_tokens: 1400,
      }),
    });
    const payload = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error("AI provider error", { status: upstream.status, code: payload?.error?.code || payload?.error?.message });
      return res.status(502).json({ error: "AI_PROVIDER_ERROR" });
    }
    const content = payload?.choices?.[0]?.message?.content;
    const reply = Array.isArray(content) ? content.map((part) => part?.text || "").join("") : String(content || "");
    if (!reply.trim()) return res.status(502).json({ error: "AI_EMPTY_REPLY" });
    return res.json({ reply: reply.trim().slice(0, 8000), model, mode: "open_ai_coach", uid: decoded.uid });
  } catch (error) {
    console.error("aiChat error", error);
    return res.status(error?.code?.startsWith?.("auth/") ? 401 : 500).json({ error: "AI_CHAT_FAILED" });
  }
});
