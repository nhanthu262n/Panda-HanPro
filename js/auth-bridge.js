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

  function renderNotificationDropdown() {
    const dropdown = document.getElementById("notifDropdown");
    if (!dropdown || dropdown.dataset.rendered === "open") return;
    const items = Array.isArray(window.PandaHanNotifications) ? window.PandaHanNotifications : [];
    const unread = items.filter((item) => item.read !== true && item.is_read !== true).length;
    const summary = unread > 0
      ? (window.LANG_MODE === "en" ? `${unread} learning update${unread === 1 ? "" : "s"} to review` : `${unread} cập nhật học tập đang chờ xem`)
      : (window.LANG_MODE === "en" ? "Your plan and feedback are in AI Coach" : "Kế hoạch và nhận xét nằm trong AI Coach");
    dropdown.innerHTML = `<div style="padding:4px 0 10px;text-align:center;color:#5b4964;line-height:1.45;"><b>🔔 ${summary}</b><div style="font-size:11px;color:#64748b;margin-top:3px;">${window.LANG_MODE === "en" ? "Scores, review items and next steps are kept in one place." : "Điểm, phần cần ôn và bước tiếp theo được lưu trong một nơi."}</div></div><button type="button" id="notifAiCoachBtn" style="display:block;width:100%;border:0;border-radius:9px;padding:8px 10px;background:var(--pink,#ec4899);color:#fff;font-weight:800;cursor:pointer;">💬 ${window.LANG_MODE === "en" ? "Open AI Coach" : "Mở AI Coach"}</button>`;
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
      window.dispatchEvent(new CustomEvent("pandahan-daily-plan", { detail: {
        dayNumber: Number(current.day_number), sequenceIndex: Number(current.sequence_index), topic: current.topic || "", date: today, force: true
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
    const item = {
      id: `local_daily_plan_${detail.date}_${Number(detail.sequenceIndex || day)}`,
      type: "daily_plan",
      title_vi: `Kế hoạch học ngày ${day}`,
      title_en: `Study plan for day ${day}`,
      body_vi: `Hôm nay học ngày ${day}${detail.topic ? `: ${detail.topic}` : ""}. Hoàn thành bài để mở buổi tiếp theo.`,
      body_en: `Today: study day ${day}${detail.topic ? `: ${detail.topic}` : ""}. Complete the lesson to unlock the next session.`,
      read: false,
      created_at: Date.now(),
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
      title_vi: passed ? `Pinyin Tone Quest ngày ${day}: đạt ${score}%` : `Pinyin Tone Quest ngày ${day}: ${score}% — cần ôn lại`,
      title_en: passed ? `Pinyin Tone Quest day ${day}: ${score}% passed` : `Pinyin Tone Quest day ${day}: ${score}% — review required`,
      body_vi: passed ? `Bạn đã đạt ngưỡng ${Number(detail.threshold || 80)}%. Ngày học tiếp theo đã được xét mở theo lộ trình.` : `Bạn chưa đạt ngưỡng ${Number(detail.threshold || 80)}%. Hệ thống giữ gate và tạo ${Number(detail.repeatCount || 1)} buổi ôn trước khi mở nội dung mới.`,
      body_en: passed ? `You met the ${Number(detail.threshold || 80)}% threshold. The next learning day was evaluated for unlock.` : `You did not meet the ${Number(detail.threshold || 80)}% threshold. The gate stays in place and ${Number(detail.repeatCount || 1)} review session(s) were created before new content unlocks.`,
      read: false,
      created_at: Date.now(),
      day_number: day,
      score_percent: score,
      passed,
      threshold: Number(detail.threshold || 80),
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
    const item = {
      id: `local_missed_day_${day}_${seq}`,
      type: "missed_day_after_midnight",
      title_vi: "Bài chưa hoàn thành đã được chuyển sang ngày mới",
      title_en: "Incomplete work moved to the new day",
      body_vi: `Ngày ${day} chưa hoàn thành trước 00:00. Đã tạo buổi ôn ${seq || "tiếp theo"}.`,
      body_en: `Day ${day} was incomplete before midnight. Review sequence ${seq || "the next sequence"} is now available.`,
      read: false,
      created_at: Date.now(),
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
