/* PandaHán Pro — guided first-learner assistant (offline, no API key) */
(() => {
  "use strict";

  const STORAGE_PREFIX = "pandahan_first_guide_seen_";
  let stepIndex = 0;
  let steps = [];
  let scope = "guest";

  function getScope() {
    try {
      const user = window.firebase?.auth?.().currentUser;
      if (user?.uid) return user.uid;
    } catch (_) {}
    try {
      if (window.CURRENT_USER?.uid) return window.CURRENT_USER.uid;
      if (window.CURRENT_USER?.isGuest) return "guest";
    } catch (_) {}
    return "guest";
  }

  function getScheduleContext() {
    try {
      const schedule = window.PandaHanSchedule?.getSchedule?.();
      const current = Array.isArray(schedule?.days)
        ? schedule.days.filter((day) => day.status === "unlocked").sort((a, b) => Number(a.sequence_index) - Number(b.sequence_index))[0]
        : null;
      if (current) return current;
    } catch (_) {}
    return { sequence_index: 1, day_number: 1, topic: "bài học khởi động" };
  }

  function tx(vi, en) {
    return window.PandaHanI18n?.t ? window.PandaHanI18n.t(vi, en) : vi;
  }

  function buildSteps() {
    const current = getScheduleContext();
    const day = Number(current.day_number || current.sequence_index || 1);
    const topic = current.topic || "nội dung theo lộ trình";
    return [
      {
        kicker: tx("BẮT ĐẦU CÙNG PANDAHÁN", "START WITH PANDAHÁN"),
        title: tx("Chào mừng bạn đến với lớp học", "Welcome to your learning journey"),
        body: tx("Trợ lý sẽ chỉ bạn cách học đúng thứ tự trong lộ trình 120 ngày. Bạn chỉ cần hoàn thành buổi đang mở; những buổi sau sẽ tự khóa để không bị học vượt.", "This guide will show you the correct order for the 120-day programme. Complete the lesson that is open; later lessons stay locked so you do not skip ahead."),
        action: null,
      },
      {
        kicker: tx("BƯỚC 1 · LỘ TRÌNH", "STEP 1 · YOUR PLAN"),
        title: tx(`Hôm nay bắt đầu ở ngày ${day}`, `Today starts at Day ${day}`),
        body: tx(`Buổi đang mở là ngày ${day}: ${topic}. Vào mục Tiến độ để xem bài đang mở, điểm yêu cầu và các ngày review. Khi đạt ngưỡng, buổi kế tiếp mới được mở.`, `Your open lesson is Day ${day}: ${topic}. Open Progress to see the active lesson, required score and review days. The next lesson opens after you meet the threshold.`),
        action: { label: tx("Mở Tiến độ", "Open Progress"), tab: "dashboard" },
      },
      {
        kicker: tx("BƯỚC 2 · NGỮ ÂM", "STEP 2 · PHONETICS"),
        title: tx("Học phát âm trước để nói đúng", "Build correct pronunciation first"),
        body: tx("Mở mục Ngữ âm để luyện thanh điệu, pinyin, nghe mẫu và ghi âm so sánh. Đây là phần nền tảng, nên học theo thứ tự các buổi đang mở.", "Open Phonics to practise tones and Pinyin, listen to models and compare your recording. This is the foundation, so follow the lessons that are open."),
        action: { label: tx("Mở Ngữ âm", "Open Phonics"), tab: "pinyin" },
      },
      {
        kicker: tx("BƯỚC 3 · LUYỆN TẬP", "STEP 3 · PRACTICE"),
        title: tx("Làm bài để hệ thống ghi nhận tiến độ", "Practise so the system can track progress"),
        body: tx("Sau khi học nội dung, vào Luyện tập để làm quiz, nghe và phản xạ. Điểm chưa đạt sẽ tạo bài học lại; không cần tự mở ngày kế tiếp.", "After studying the lesson, open Practice for quizzes, listening and response drills. A score below the threshold creates a repeat lesson; you do not need to unlock the next day yourself."),
        action: { label: tx("Mở Luyện tập", "Open Practice"), tab: "practice" },
      },
      {
        kicker: tx("BƯỚC 4 · QUEST", "STEP 4 · QUEST"),
        title: tx("Quest là phần luyện thêm có khóa tiến độ", "Quest is extra practice with progression gates"),
        body: tx("Trong Luyện tập, Pinyin Tone Quest chỉ mở đúng buổi được phép. Hãy hoàn thành ngày 1 trước; ngày sau sẽ mở theo tiến độ, không mở đồng loạt.", "In Practice, Pinyin Tone Quest opens only for permitted lessons. Complete Day 1 first; later days unlock with progress instead of opening all at once."),
        action: { label: tx("Xem Luyện tập", "View Practice"), tab: "practice" },
      },
      {
        kicker: tx("BƯỚC 5 · NHẮC HỌC", "STEP 5 · REMINDERS"),
        title: tx("Đừng bỏ lỡ kế hoạch hôm nay", "Do not miss today's plan"),
        body: tx("Cuối ngày, nếu buổi học vẫn chưa hoàn thành, hệ thống sẽ gửi nhắc trong chuông Thông báo và tin nhắn Giáo viên. Nếu bỏ lỡ qua 00:00, bài chưa xong sẽ được kéo dài sang ngày tiếp theo.", "At the end of the day, if the lesson is not complete, the system sends a reminder to Notifications and a Teacher message. If it passes 00:00, unfinished work moves to the next day."),
        action: { label: tx("Mở Thông báo", "Open Notifications"), tab: "notifications" },
      },
    ];
  }

  function modal() { return document.getElementById("firstLearnerGuide"); }
  function render() {
    const root = modal();
    if (!root || !steps.length) return;
    const item = steps[stepIndex];
    root.querySelector("[data-guide-kicker]").textContent = item.kicker;
    root.querySelector("[data-guide-title]").textContent = item.title;
    root.querySelector("[data-guide-body]").textContent = item.body;
    root.querySelector("[data-guide-step]").textContent = `${stepIndex + 1}/${steps.length}`;
    const progress = root.querySelector("[data-guide-progress]");
    if (progress) progress.style.width = `${((stepIndex + 1) / steps.length) * 100}%`;
    const action = root.querySelector("[data-guide-action]");
    if (action) {
      action.textContent = item.action?.label || "Đã hiểu";
      action.style.display = item.action ? "inline-flex" : "none";
      action.dataset.tab = item.action?.tab || "";
    }
    const prev = root.querySelector("[data-guide-prev]");
    const next = root.querySelector("[data-guide-next]");
    if (prev) { prev.style.visibility = stepIndex ? "visible" : "hidden"; prev.textContent = tx("Quay lại", "Back"); }
    if (next) next.textContent = stepIndex === steps.length - 1 ? tx("Hoàn tất", "Finish") : tx("Tiếp theo", "Next");
    root.querySelector("[data-guide-close]").textContent = tx("Đóng", "Close");
    root.querySelector("[data-guide-skip]").textContent = tx("Bỏ qua hướng dẫn", "Skip guide");
  }

  function close(markSeen = true) {
    const root = modal();
    if (root) root.style.display = "none";
    if (markSeen) localStorage.setItem(STORAGE_PREFIX + scope, "1");
  }

  function open(force = false) {
    scope = getScope();
    if (!force && localStorage.getItem(STORAGE_PREFIX + scope) === "1") return false;
    steps = buildSteps();
    stepIndex = 0;
    const root = modal();
    if (!root) return false;
    root.style.display = "flex";
    render();
    return true;
  }

  function goToTab(tab) {
    close(true);
    if (tab === "notifications") {
      document.getElementById("notifBellBtn")?.click();
      return;
    }
    if (typeof window.switchTab === "function") window.switchTab(tab);
  }

  function bind() {
    const root = modal();
    if (!root) return;
    root.querySelector("[data-guide-close]")?.addEventListener("click", () => close(true));
    root.querySelector("[data-guide-skip]")?.addEventListener("click", () => close(true));
    root.querySelector("[data-guide-prev]")?.addEventListener("click", () => {
      stepIndex = Math.max(0, stepIndex - 1);
      render();
    });
    root.querySelector("[data-guide-next]")?.addEventListener("click", () => {
      if (stepIndex >= steps.length - 1) close(true);
      else { stepIndex += 1; render(); }
    });
    root.querySelector("[data-guide-action]")?.addEventListener("click", () => {
      const tab = root.querySelector("[data-guide-action]").dataset.tab;
      if (tab) goToTab(tab);
    });
    document.getElementById("openFirstGuideBtn")?.addEventListener("click", () => open(true));
  }

  function userIsEligible(user) {
    if (user) return true;
    try { return Boolean(window.CURRENT_USER?.isGuest); } catch (_) { return false; }
  }

  function scheduleOpen(user) {
    if (!userIsEligible(user)) return;
    window.setTimeout(() => open(false), 900);
  }

  window.PandaHanFirstTimeGuide = {
    open: () => open(true),
    close,
    refreshLanguage: () => { if (modal()?.style.display === "flex") { steps = buildSteps(); render(); } },
  };
  document.addEventListener("DOMContentLoaded", () => {
    bind();
    try {
      const auth = window.firebase?.auth?.();
      if (auth) auth.onAuthStateChanged(scheduleOpen);
    } catch (_) {}
    window.setTimeout(() => {
      try { if (window.CURRENT_USER?.isGuest) scheduleOpen(window.CURRENT_USER); } catch (_) {}
    }, 1400);
  });
})();
