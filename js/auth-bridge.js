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

  async function attachNotifications(uid) {
    if (!rtdb || !uid) return;
    const ref = rtdb.ref("notifications/" + uid).limitToLast(30);
    ref.on("value", (snap) => {
      const raw = snap.val() || {};
      const items = Object.entries(raw).map(([id, value]) => ({ id, ...(value || {}) }))
        .sort((a, b) => Number(b.created_at || b.createdAt || 0) - Number(a.created_at || a.createdAt || 0));
      window.PandaHanNotifications = items;
      const unread = items.filter((item) => item.read !== true && item.is_read !== true).length;
      const badge = document.getElementById("notifBadge");
      if (badge) { badge.textContent = String(unread); badge.style.display = unread ? "inline-block" : "none"; }
      const dropdown = document.getElementById("notifDropdown");
      if (dropdown && dropdown.dataset.rendered !== "open") {
        dropdown.innerHTML = items.length ? items.slice(0, 12).map((item) => `
          <div style="padding:8px 4px;border-bottom:1px solid #f1f5f9;${item.read ? "opacity:.65;" : "font-weight:700;"}">
            <div>${String(window.LANG_MODE === "en" ? (item.title_en || item.title || item.subject || "Study notification") : (item.title_vi || item.title || item.subject || "Thông báo học tập"))}</div>
            <div style="font-size:11px;font-weight:400;margin-top:3px;">${String(window.LANG_MODE === "en" ? (item.body_en || item.body || item.message || "") : (item.body_vi || item.body || item.message || ""))}</div>
          </div>`).join("") : `<div style='padding:10px;color:#64748b;'>${window.LANG_MODE === "en" ? "No new notifications." : "Chưa có thông báo mới."}</div>`;
      }
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
  async function onUserServices(user) {
    if (!user) return;
    try {
      await attachNotifications(user.uid);
      if (window.PandaHanSchedule && typeof window.PandaHanSchedule.initScheduleIfNeeded === "function") {
        await window.PandaHanSchedule.initScheduleIfNeeded();
      }
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
    window.PandaHanNotifications = [item, ...(window.PandaHanNotifications || []).filter((n) => n.id !== item.id)].slice(0, 30);
    const badge = document.getElementById("notifBadge");
    if (badge) { badge.textContent = String(window.PandaHanNotifications.filter((n) => !n.read).length); badge.style.display = "inline-block"; }
    const dropdown = document.getElementById("notifDropdown");
    if (dropdown && dropdown.dataset.rendered !== "open") {
      const title = window.LANG_MODE === "en" ? item.title_en : item.title_vi;
      const body = window.LANG_MODE === "en" ? item.body_en : item.body_vi;
      dropdown.innerHTML = `<div style="padding:8px 4px;border-bottom:1px solid #f1f5f9;font-weight:700;"><div>${title}</div><div style="font-size:11px;font-weight:400;margin-top:3px;">${body}</div></div>` + dropdown.innerHTML;
    }
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
    window.PandaHanNotifications = [item, ...(window.PandaHanNotifications || []).filter((n) => n.id !== item.id)].slice(0, 30);
    const badge = document.getElementById("notifBadge");
    if (badge) { badge.textContent = String(window.PandaHanNotifications.filter((n) => !n.read).length); badge.style.display = "inline-block"; }
    const dropdown = document.getElementById("notifDropdown");
    if (dropdown && dropdown.dataset.rendered !== "open") {
      const title = window.LANG_MODE === "en" ? item.title_en : item.title_vi;
      const body = window.LANG_MODE === "en" ? item.body_en : item.body_vi;
      dropdown.innerHTML = `<div style="padding:8px 4px;border-bottom:1px solid #f1f5f9;font-weight:700;"><div>${title}</div><div style="font-size:11px;font-weight:400;margin-top:3px;">${body}</div></div>` + dropdown.innerHTML;
    }
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
  if (bell) bell.addEventListener("click", () => {
    const uid = auth.currentUser?.uid;
    const dropdown = document.getElementById("notifDropdown");
    if (dropdown) dropdown.dataset.rendered = dropdown.style.display === "block" ? "" : "open";
    if (uid && dropdown?.style.display === "block") markNotificationsRead(uid).catch(() => {});
  });
})();
