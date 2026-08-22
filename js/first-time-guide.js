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

  function buildSteps() {
    const current = getScheduleContext();
    const day = Number(current.day_number || current.sequence_index || 1);
    const topic = current.topic || "nội dung theo lộ trình";
    return [
      {
        kicker: "BẮT ĐẦU CÙNG PANDAHÁN",
        title: "Chào mừng bạn đến với lớp học",
        body: "Trợ lý sẽ chỉ bạn cách học đúng thứ tự trong lộ trình 120 ngày. Bạn chỉ cần hoàn thành buổi đang mở; những buổi sau sẽ tự khóa để không bị học vượt.",
        action: null,
      },
      {
        kicker: "BƯỚC 1 · LỘ TRÌNH",
        title: `Hôm nay bắt đầu ở ngày ${day}`,
        body: `Buổi đang mở là ngày ${day}: ${topic}. Vào mục Tiến độ để xem bài đang mở, điểm yêu cầu và các ngày review. Khi đạt ngưỡng, buổi kế tiếp mới được mở.`,
        action: { label: "Mở Tiến độ", tab: "dashboard" },
      },
      {
        kicker: "BƯỚC 2 · NGỮ ÂM",
        title: "Học phát âm trước để nói đúng",
        body: "Mở mục Ngữ âm để luyện thanh điệu, pinyin, nghe mẫu và ghi âm so sánh. Đây là phần nền tảng, nên học theo thứ tự các buổi đang mở.",
        action: { label: "Mở Ngữ âm", tab: "pinyin" },
      },
      {
        kicker: "BƯỚC 3 · LUYỆN TẬP",
        title: "Làm bài để hệ thống ghi nhận tiến độ",
        body: "Sau khi học nội dung, vào Luyện tập để làm quiz, nghe và phản xạ. Điểm chưa đạt sẽ tạo bài học lại; không cần tự mở ngày kế tiếp.",
        action: { label: "Mở Luyện tập", tab: "practice" },
      },
      {
        kicker: "BƯỚC 4 · QUEST",
        title: "Quest là phần luyện thêm có khóa tiến độ",
        body: "Trong Luyện tập, Pinyin Tone Quest chỉ mở đúng buổi được phép. Hãy hoàn thành ngày 1 trước; ngày sau sẽ mở theo tiến độ, không mở đồng loạt.",
        action: { label: "Xem Luyện tập", tab: "practice" },
      },
      {
        kicker: "BƯỚC 5 · NHẮC HỌC",
        title: "Đừng bỏ lỡ kế hoạch hôm nay",
        body: "Cuối ngày, nếu buổi học vẫn chưa hoàn thành, hệ thống sẽ gửi nhắc trong chuông Thông báo và tin nhắn Giáo viên. Nếu bỏ lỡ qua 00:00, bài chưa xong sẽ được kéo dài sang ngày tiếp theo.",
        action: { label: "Mở Thông báo", tab: "notifications" },
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
    if (prev) prev.style.visibility = stepIndex ? "visible" : "hidden";
    if (next) next.textContent = stepIndex === steps.length - 1 ? "Hoàn tất" : "Tiếp theo";
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

  window.PandaHanFirstTimeGuide = { open: () => open(true), close };
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
