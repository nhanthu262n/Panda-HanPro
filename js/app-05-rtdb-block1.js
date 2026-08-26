/*
 * PandaHan Pro — Khối 1: Realtime Database curriculum + student schedule
 *
 * Không sửa app-01/app-02/app-03. File này cần nạp sau Firebase SDK và sau
 * khi firebase.initializeApp(...) đã chạy. Khối 2 (review/cron) và Khối 3
 * (chat realtime) chưa nằm trong module này.
 *
 * RTDB paths:
 *   curriculumDays/{day_number}
 *   studentSchedules/{student_uid}/{day_number}
 *   reviewLogs/{student_uid}/{log_id}
 *   studentTeachers/{student_uid}/{teacher_uid}
 *   notifications/{student_uid}/{notification_id}
 */
(() => {
  "use strict";

  if (!window.firebase || typeof window.firebase.database !== "function") {
    console.error("PandaHan RTDB: Firebase Realtime Database SDK chưa được nạp.");
    return;
  }

  const rtdb = window.firebase.database();
  const CURRICULUM_PATH = "curriculumDays";
  const SCHEDULE_PATH = "studentSchedules";
  const CURRICULUM_ASSET = "assets/curriculum_days.json";
  let curriculumCache = null;

  function currentUid() {
    const authUser = window.firebase.auth && window.firebase.auth().currentUser;
    if (authUser && authUser.uid) return authUser.uid;
    try {
      if (typeof CURRENT_USER !== "undefined" && CURRENT_USER && CURRENT_USER.uid && !CURRENT_USER.isGuest) return CURRENT_USER.uid;
    } catch (_) {}
    return null;
  }

  function timestamp() {
    return window.firebase.database.ServerValue.TIMESTAMP;
  }

  async function loadCurriculumAsset() {
    if (curriculumCache) return curriculumCache;
    const response = await fetch(CURRICULUM_ASSET, { cache: "no-store" });
    if (!response.ok) throw new Error(`Không tải được ${CURRICULUM_ASSET}: ${response.status}`);
    const payload = await response.json();
    const days = Array.isArray(payload) ? payload : payload.curriculum_days;
    if (!Array.isArray(days) || days.length !== 120) {
      throw new Error("curriculum_days.json phải chứa đúng 120 ngày.");
    }
    const sorted = days.slice().sort((a, b) => Number(a.day_number) - Number(b.day_number));
    if (sorted.some((day, index) => Number(day.day_number) !== index + 1)) {
      throw new Error("day_number phải liên tục từ 1 đến 120.");
    }
    curriculumCache = sorted;
    return sorted;
  }

  async function importCurriculum() {
    const days = await loadCurriculumAsset();
    const updates = {};
    days.forEach((day) => {
      updates[`${CURRICULUM_PATH}/${day.day_number}`] = day;
    });
    await rtdb.ref().update(updates);
    return { imported: days.length, path: CURRICULUM_PATH };
  }

  function scheduleEntry(day, index, uid) {
    const first = index === 0;
    return {
      student_id: uid,
      curriculum_day_id: String(day.day_number),
      day_number: Number(day.day_number),
      sequence_index: Number(day.day_number),
      scheduled_date: first ? window.PandaHanScheduleCore.todayVietnam() : null,
      status: first ? "unlocked" : "locked",
      attempt_count: 0,
      best_score: null,
      unlocked_at: first ? timestamp() : null,
      completed_at: null,
      day_type: day.day_type || "new_content",
      required_score: 30,
    };
  }

  async function initStudentSchedule(uid = currentUid()) {
    if (!uid) throw new Error("Chưa có tài khoản Firebase đang đăng nhập.");
    if (window.PandaHanSchedule && typeof window.PandaHanSchedule.initScheduleIfNeeded === "function") {
      const schedule = await window.PandaHanSchedule.initScheduleIfNeeded();
      return { created: true, uid, count: schedule.days.length, firstStatus: schedule.days[0]?.status || null, schedule };
    }
    throw new Error("app-04/state machine chưa được nạp trước app-05.");
  }

  async function getStudentSchedule(uid = currentUid()) {
    if (!uid) throw new Error("Chưa có tài khoản Firebase đang đăng nhập.");
    if (window.PandaHanSchedule && typeof window.PandaHanSchedule.getScheduleAsync === "function") {
      return await window.PandaHanSchedule.getScheduleAsync();
    }
    const snapshot = await rtdb.ref(`${SCHEDULE_PATH}/${uid}`).once("value");
    return snapshot.val() || {};
  }

  function watchStudentSchedule(callback, uid = currentUid()) {
    if (!uid) throw new Error("Chưa có tài khoản Firebase đang đăng nhập.");
    const ref = rtdb.ref(`${SCHEDULE_PATH}/${uid}`);
    const listener = (snapshot) => callback(snapshot.val() || {});
    ref.on("value", listener);
    return () => ref.off("value", listener);
  }

  async function appendReviewLog(uid, log) {
    if (!uid) throw new Error("Thiếu student uid.");
    const ref = rtdb.ref(`reviewLogs/${uid}`).push();
    await ref.set({ ...log, created_at: timestamp() });
    return ref.key;
  }

  window.PandaHanRtdbSchedule = {
    importCurriculum,
    initStudentSchedule,
    getStudentSchedule,
    watchStudentSchedule,
    appendReviewLog,
    loadCurriculumAsset,
    paths: { CURRICULUM_PATH, SCHEDULE_PATH },
  };

  // Không tự ghi dữ liệu khi trang vừa mở. Việc import và tạo lịch phải được
  // gọi sau khi rules đã khóa đúng và người dùng/admin đã xác nhận.
  window.dispatchEvent(new CustomEvent("pandahan-rtdb-block1-ready"));
})();
