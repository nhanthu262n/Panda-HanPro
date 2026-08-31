/* PandaHan Pro — Auth/profile/notification bridge. */
(function () {
  "use strict";

  const firebase = window.firebase;
  if (!firebase || typeof firebase.auth !== "function") {
    console.warn("Auth bridge: Firebase Auth SDK chưa sẵn sàng.");
    return;
  }

  const auth = firebase.auth();
  const db = typeof firebase.firestore === "function" ? firebase.firestore() : null;
  const rtdb = typeof firebase.database === "function" ? firebase.database() : null;
  const MASTER_EMAILS = ["teacher@gmail.com", "nhanthu262n@gmail.com"];

  function setAuthVisible(isVisible) {
    const overlay = document.getElementById("proAuthOverlay");
    const app = document.getElementById("app");
    if (overlay) overlay.style.display = isVisible ? "flex" : "none";
    if (app && isVisible) app.style.display = "none";
  }

  function showError(message) {
    const el = document.getElementById("proError");
    if (el) { el.textContent = message; el.style.display = "block"; }
  }

  async function ensureStudentProfile(user) {
    if (!db || !user) return {
      uid: user.uid, email: user.email || "", name: user.displayName || "Học viên",
      displayName: user.displayName || "Học viên", role: "student", status: "approved"
    };
    const ref = db.collection("users").doc(user.uid);
    const snap = await ref.get();
    const existing = snap.exists ? snap.data() : {};
    const role = existing.role || (MASTER_EMAILS.includes((user.email || "").toLowerCase()) ? "teacher" : "student");
    const profile = {
      uid: user.uid,
      email: user.email || existing.email || "",
      name: existing.name || user.displayName || "Học viên",
      displayName: existing.displayName || user.displayName || "Học viên",
      role,
      status: existing.status || "approved",
      createdAt: existing.createdAt || firebase.firestore.FieldValue.serverTimestamp(),
      lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await ref.set(profile, { merge: true });
    return { ...existing, ...profile, uid: user.uid, email: profile.email, role };
  }

  function localNotificationKey() {
    const uid = window.CURRENT_USER?.uid || window.CURRENT_USER?.username || "guest";
    return `pandahan_local_notifications_${uid}`;
  }
  function readLocalNotifications() {
    try { return JSON.parse(localStorage.getItem(localNotificationKey()) || "[]"); } catch (_) { return []; }
  }
  function saveLocalNotification(item) {
    const list = [item, ...readLocalNotifications().filter((n) => n.id !== item.id)].slice(0, 30);
    localStorage.setItem(localNotificationKey(), JSON.stringify(list));
    return list;
  }
  function mergeLocalNotifications(remote) {
    const remoteIds = new Set(remote.map((item) => item.id));
    return [...remote, ...readLocalNotifications().filter((item) => !remoteIds.has(item.id))]
      .sort((a, b) => Number(b.created_at || b.createdAt || 0) - Number(a.created_at || a.createdAt || 0)).slice(0, 30);
  }
  function scheduleRouteSnapshot(schedule, current) {
    const days = Array.isArray(schedule?.days) ? schedule.days : [];
    const plannedDays = Math.max(120, ...days.map((day) => Number(day.sequence_index || 0)));
    const extensionCount = Math.max(0, Number(schedule?._meta?.extension_count || 0), plannedDays - 120);
    return { startedAt: String(schedule?._meta?.started_at || current?.scheduled_date || ""), plannedDays, extensionCount };
  }
  function formatRouteStart(date) {
    const parts = String(date || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    return parts ? `${parts[3]}/${parts[2]}/${parts[1]}` : "—";
  }

  function renderNotificationDropdown() {
    const dropdown = document.getElementById("notifDropdown");
    if (!dropdown || dropdown.dataset.rendered === "open") return;
    const items = Array.isArray(window.PandaHanNotifications) ? window.PandaHanNotifications : [];
    const unread = items.filter((item) => item.read !== true && item.is_read !== true).length;
    const route = items.filter((item) => Number(item.route_total_days || 0) >= 120 || Number(item.sequence_index || 0) > 120)
      .sort((a, b) => Number(b.route_total_days || b.sequence_index || 0) - Number(a.route_total_days || a.sequence_index || 0) || Number(b.created_at || 0) - Number(a.created_at || 0))[0];
    const routeDays = Math.max(120, Number(route?.route_total_days || 120));
    const routeStatus = routeDays > 120
      ? (window.LANG_MODE === "en" ? `Path extended: 120 → ${routeDays} days` : `Lộ trình đã kéo dài: 120 → ${routeDays} ngày`)
      : (window.LANG_MODE === "en" ? `120-day path · started ${formatRouteStart(route?.started_at)}` : `Lộ trình 120 ngày · bắt đầu ${formatRouteStart(route?.started_at)}`);
    const summary = unread > 0
      ? (window.LANG_MODE === "en" ? `${unread} learning update${unread === 1 ? "" : "s"} to review` : `${unread} cập nhật học tập đang chờ xem`)
      : (window.LANG_MODE === "en" ? "Your plan and feedback are in AI Coach" : "Kế hoạch và nhận xét nằm trong AI Coach");
    dropdown.innerHTML = `<div style="padding:4px 0 10px;text-align:center;color:#5b4964;line-height:1.45;"><b>🔔 ${summary}</b><div style="margin-top:6px;padding:6px 8px;border-radius:8px;background:${routeDays > 120 ? "#fffbeb" : "#f0fdfa"};color:${routeDays > 120 ? "#92400e" : "#0f766e"};font-size:11px;font-weight:800;">${routeStatus}</div><div style="font-size:11px;color:#64748b;margin-top:4px;">${window.LANG_MODE === "en" ? "Scores, unfinished tasks and next steps are in AI Coach." : "Điểm, việc chưa hoàn thành và bước tiếp theo nằm trong AI Coach."}</div></div><button type="button" id="notifAiCoachBtn" style="display:block;width:100%;border:0;border-radius:9px;padding:8px 10px;background:var(--pink,#ec4899);color:#fff;font-weight:800;cursor:pointer;">💬 ${window.LANG_MODE === "en" ? "Open AI Coach" : "Mở AI Coach"}</button>`;
    const coachBtn = document.getElementById("notifAiCoachBtn");
    if (coachBtn) coachBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      dropdown.style.display = "none";
      dropdown.dataset.rendered = "";
      if (typeof window.switchTab === "function") window.switchTab("chat");
      setTimeout(() => {
        if (typeof window.openAiCoachChat === "function") window.openAiCoachChat();
        else document.querySelector('.chat-contact[data-ai="true"]')?.click();
      }, 60);
    });
  }

  async function attachNotifications(uid) {
    if (!rtdb || !uid) return;
    const ref = rtdb.ref("notifications/" + uid).limitToLast(30);
    ref.on("value", (snap) => {
      const raw = snap.val() || {};
      const items = Object.entries(raw).map(([id, value]) => ({ id, ...(value || {}) }))
        .sort((a, b) => Number(b.created_at || b.createdAt || 0) - Number(a.created_at || a.createdAt || 0));
      window.PandaHanNotifications = mergeLocalNotifications(items);
      const unread = window.PandaHanNotifications.filter((item) => item.read !== true && item.is_read !== true).length;
      const badge = document.getElementById("notifBadge");
      if (badge) { badge.textContent = String(unread); badge.style.display = unread ? "inline-block" : "none"; }
      renderNotificationDropdown();
    }, (error) => console.warn("Notification listener:", error.message || error));
  }

  async function markNotificationsRead(uid) {
    if (!rtdb || !uid) return;
    const snap = await rtdb.ref("notifications/" + uid).once("value");
    const updates = {};
    Object.entries(snap.val() || {}).forEach(([id, item]) => {
      if (item && item.read !== true) updates[id + "/read"] = true;
    });
    if (Object.keys(updates).length) await rtdb.ref("notifications/" + uid).update(updates);
  }

  // app-01.js owns the single profile/completeLogin Auth listener.
  // This bridge only attaches notifications and schedule services, preventing
  // duplicate Firestore writes and competing overlay state changes.
  async function ensureDailyPlanNotification() {
    try {
      const schedule = window.PandaHanSchedule?.getScheduleAsync ? await window.PandaHanSchedule.getScheduleAsync() : window.PandaHanSchedule?.getSchedule?.();
      const days = Array.isArray(schedule?.days) ? schedule.days : [];
      const current = days.filter((day) => day.status === "unlocked").sort((a, b) => Number(a.sequence_index) - Number(b.sequence_index))[0];
      if (!current) return;
      const today = window.PandaHanSchedule?.todayVietnam?.() || new Date().toISOString().slice(0, 10);
      const route = scheduleRouteSnapshot(schedule, current);
      window.dispatchEvent(new CustomEvent("pandahan-daily-plan", { detail: {
        dayNumber: Number(current.day_number), sequenceIndex: Number(current.sequence_index), isRepeat: !!current.is_repeat_of || current.day_type === "repeat", repeatReason: current.repeat_reason || null, carriedCompletedTasks: Array.isArray(current.carried_completed_tasks) ? current.carried_completed_tasks.slice() : Object.keys(current.completed_tasks || {}), missingTaskIds: (current.required_tasks || []).filter((id) => !current.completed_tasks?.[id]), topic: current.topic || "", date: today, startedAt: route.startedAt, routeTotalDays: route.plannedDays, extensionCount: route.extensionCount, force: true
      }}));
    } catch (error) { console.warn("Daily plan notification fallback:", error.message || error); }
  }

  async function onUserServices(user) {
    if (!user) return;
    try {
      await attachNotifications(user.uid);
      if (window.PandaHanSchedule && typeof window.PandaHanSchedule.initScheduleIfNeeded === "function") {
        await window.PandaHanSchedule.initScheduleIfNeeded();
      }
      await ensureDailyPlanNotification();
    } catch (error) {
      console.warn("Auth service bootstrap:", error.message || error);
    }
  }

  window.addEventListener("pandahan-daily-plan", (event) => {
    const detail = event.detail || {};
    const day = Number(detail.dayNumber || 0);
    if (!day) return;
    const seq = Number(detail.sequenceIndex || day);
    const repeat = !!detail.isRepeat;
    const carried = Array.isArray(detail.carriedCompletedTasks) ? detail.carriedCompletedTasks : [];
    const missing = Array.isArray(detail.missingTaskIds) ? detail.missingTaskIds : [];
    const routeDays = Math.max(120, Number(detail.routeTotalDays || seq || 120));
    const extensionCount = Math.max(0, Number(detail.extensionCount || 0), routeDays - 120);
    const startedAt = String(detail.startedAt || "");
    const pathExtended = routeDays > 120 || repeat;
    const item = {
      id: `local_daily_plan_${detail.date}_${seq}`,
      type: "daily_plan",
      title_vi: pathExtended ? `Lộ trình 120 → ${routeDays} ngày · Buổi ${seq}` : `Kế hoạch học Ngày ${day}/120`,
      title_en: pathExtended ? `Path 120 → ${routeDays} days · Session ${seq}` : `Study plan · Day ${day}/120`,
      body_vi: pathExtended ? `Bắt đầu từ ${formatRouteStart(startedAt)}. Buổi ${seq} tiếp tục Ngày giáo trình ${day}${detail.topic ? `: ${detail.topic}` : ""}; đã thêm ${extensionCount} ngày do nhiệm vụ có evidence chưa hoàn thành đúng hạn. Còn thiếu: ${missing.length ? missing.join(", ") : "không còn"}.` : `Bắt đầu từ ${formatRouteStart(startedAt)}. Hôm nay học nội dung Ngày ${day}/120${detail.topic ? `: ${detail.topic}` : ""}. Cần hoàn thành: ${missing.length ? missing.join(", ") : "tất cả evidence đã có"}.`,
      body_en: pathExtended ? `Started ${formatRouteStart(startedAt)}. Session ${seq} continues curriculum Day ${day}${detail.topic ? `: ${detail.topic}` : ""}; ${extensionCount} day(s) were added because required evidence was not finished on time. Still required: ${missing.length ? missing.join(", ") : "none"}.` : `Started ${formatRouteStart(startedAt)}. Today: curriculum Day ${day}/120${detail.topic ? `: ${detail.topic}` : ""}. Required: ${missing.length ? missing.join(", ") : "all evidence recorded"}.`,
      read: false,
      created_at: Date.now(),
      day_number: day,
      sequence_index: seq,
      is_repeat: repeat,
      started_at: startedAt,
      route_total_days: routeDays,
      extension_count: extensionCount,
      carried_task_ids: carried,
      missing_task_ids: missing,
    };
    saveLocalNotification(item);
    window.PandaHanNotifications = [item, ...(window.PandaHanNotifications || []).filter((n) => n.id !== item.id)].slice(0, 30);
    const badge = document.getElementById("notifBadge");
    if (badge) { badge.textContent = String(window.PandaHanNotifications.filter((n) => !n.read).length); badge.style.display = "inline-block"; }
    renderNotificationDropdown();
  });

  window.addEventListener("pandahan-quest-score-saved", (event) => {
    const detail = event.detail || {};
    const day = Number(detail.dayNumber || 0);
    const score = Number(detail.scorePercent || 0);
    if (!day) return;
    const passed = !!detail.passed;
    const item = {
      id: `quest_score_${day}_${score}`,
      type: "quest_score_saved",
      title_vi: passed ? `Ôn tập 120 ngày · Bài ${day}: đạt ${score}%` : `Ôn tập 120 ngày · Bài ${day}: ${score}% — cần ôn lại`,
      title_en: passed ? `120-Day Review · Lesson ${day}: ${score}% passed` : `120-Day Review · Lesson ${day}: ${score}% — review required`,
      body_vi: passed ? `Bạn đã đạt trên 30%. Bài tiếp theo đã được mở.` : `Bạn cần đạt trên 30% để mở bài mới. Hãy ôn lại bài hiện tại và các câu sai.`,
      body_en: passed ? `You scored above 30%. The next lesson is now unlocked.` : `You need a score above 30% to unlock the next lesson. Review this lesson and its wrong items.`,
      read: false,
      created_at: Date.now(),
      day_number: day,
      score_percent: score,
      passed,
      threshold: Number(detail.threshold || 30),
      repeat_count: Number(detail.repeatCount || 0)
    };
    saveLocalNotification(item);
    window.PandaHanNotifications = [item, ...(window.PandaHanNotifications || []).filter((n) => n.id !== item.id)].slice(0, 30);
    const badge = document.getElementById("notifBadge");
    if (badge) { badge.textContent = String(window.PandaHanNotifications.filter((n) => !n.read).length); badge.style.display = "inline-block"; }
  });

  window.addEventListener("pandahan-schedule-missed", (event) => {
    const detail = event.detail || {};
    const day = Number(detail.sourceDayNumber || 0);
    const seq = Number(detail.newSequenceIndex || 0);
    if (!day) return;
    const route = scheduleRouteSnapshot(detail.schedule, null);
    const routeDays = Math.max(121, Number(route.plannedDays || seq || 121));
    const item = {
      id: `local_missed_day_${day}_${seq}`,
      type: "missed_day_after_midnight",
      title_vi: `Lộ trình đã kéo dài: 120 → ${routeDays} ngày`,
      title_en: `Learning path extended: 120 → ${routeDays} days`,
      body_vi: `Ngày ${day} chưa hoàn thành trước 00:00. Đã tạo Buổi ${seq || "tiếp theo"} — tiếp tục Ngày ${day}; lộ trình bắt đầu ${formatRouteStart(route.startedAt)} đã tăng lên ${routeDays} ngày. Đã giữ ${(detail.carriedTaskIds || []).join(", ") || "chưa có"}, còn thiếu ${(detail.missingTaskIds || []).join(", ") || "không còn"}.`,
      body_en: `Day ${day} was incomplete before midnight. Session ${seq || "the next"} continues Day ${day}; the path started ${formatRouteStart(route.startedAt)} and has increased to ${routeDays} days. Carried ${(detail.carriedTaskIds || []).join(", ") || "none"}, still missing ${(detail.missingTaskIds || []).join(", ") || "none"}.`,
      read: false,
      created_at: Date.now(),
      day_number: day,
      sequence_index: seq,
      carried_task_ids: Array.isArray(detail.carriedTaskIds) ? detail.carriedTaskIds : [],
      missing_task_ids: Array.isArray(detail.missingTaskIds) ? detail.missingTaskIds : [],
      started_at: route.startedAt,
      route_total_days: routeDays,
      extension_count: Math.max(1, Number(route.extensionCount || 0), routeDays - 120),
    };
    saveLocalNotification(item);
    window.PandaHanNotifications = [item, ...(window.PandaHanNotifications || []).filter((n) => n.id !== item.id)].slice(0, 30);
    const badge = document.getElementById("notifBadge");
    if (badge) { badge.textContent = String(window.PandaHanNotifications.filter((n) => !n.read).length); badge.style.display = "inline-block"; }
    renderNotificationDropdown();
  });

  window.PandaHanAuth = {
    auth,
    db,
    rtdb,
    ensureStudentProfile,
    attachNotifications,
    markNotificationsRead,
    showError
  };

  auth.onAuthStateChanged(onUserServices);
  const bell = document.getElementById("notifBellBtn");
  if (bell) bell.addEventListener("click", async () => {
    const uid = auth.currentUser?.uid;
    const dropdown = document.getElementById("notifDropdown");
    const opening = !dropdown || dropdown.style.display !== "block";
    if (dropdown) dropdown.dataset.rendered = opening ? "" : "open";
    if (opening) {
      await ensureDailyPlanNotification();
      if (dropdown) dropdown.dataset.rendered = "";
      renderNotificationDropdown();
    }
    if (uid && dropdown?.style.display === "block") markNotificationsRead(uid).catch(() => {});
  });
})();
