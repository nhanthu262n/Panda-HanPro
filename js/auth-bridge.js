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
            <div>${String(item.title || item.subject || "Thông báo học tập")}</div>
            <div style="font-size:11px;font-weight:400;margin-top:3px;">${String(item.body || item.message || "")}</div>
          </div>`).join("") : "<div style='padding:10px;color:#64748b;'>Chưa có thông báo mới.</div>";
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
