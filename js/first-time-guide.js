/* PanTutor — guided first-learner assistant (offline, no API key) */
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
    const en = window.LANG_MODE === "en";
    const topic = current.topic || (en ? "your assigned curriculum content" : "nội dung theo lộ trình");
    return [
      {
        kicker: en ? "START WITH PANDAHÁN" : "BẮT ĐẦU CÙNG PANDAHÁN",
        title: en ? "Welcome to your learning space" : "Chào mừng bạn đến với lớp học",
        body: en ? "This guide shows the 120-day sequence. Complete the session that is currently unlocked; later sessions remain locked so you do not skip foundations." : "Trợ lý sẽ chỉ bạn cách học đúng thứ tự trong lộ trình 120 ngày. Bạn chỉ cần hoàn thành buổi đang mở; những buổi sau sẽ tự khóa để không bị học vượt.",
        action: null,
      },
      {
        kicker: en ? "STEP 1 · LEARNING PATH" : "BƯỚC 1 · LỘ TRÌNH",
        title: en ? `Today starts at Day ${day}` : `Hôm nay bắt đầu ở ngày ${day}`,
        body: en ? `Your open session is Day ${day}: ${topic}. Open Progress to see the active lesson, required score, and review sessions. The next session is evaluated only after this one meets its requirements.` : `Buổi đang mở là ngày ${day}: ${topic}. Vào mục Tiến độ để xem bài đang mở, điểm yêu cầu và các ngày review. Khi đạt ngưỡng, buổi kế tiếp mới được mở.`,
        action: { label: en ? "Open Progress" : "Mở Tiến độ", tab: "dashboard" },
      },
      {
        kicker: en ? "STEP 2 · PHONETICS" : "BƯỚC 2 · NGỮ ÂM",
        title: en ? "Build pronunciation before speaking" : "Học phát âm trước để nói đúng",
        body: en ? "Open Phonetics for tones, pinyin, model audio and recording comparison. This foundation follows the unlocked-session order." : "Mở mục Ngữ âm để luyện thanh điệu, pinyin, nghe mẫu và ghi âm so sánh. Đây là phần nền tảng, nên học theo thứ tự các buổi đang mở.",
        action: { label: en ? "Open Phonetics" : "Mở Ngữ âm", tab: "pinyin" },
      },
      {
        kicker: en ? "STEP 3 · PRACTICE" : "BƯỚC 3 · LUYỆN TẬP",
        title: en ? "Practice creates verified progress" : "Làm bài để hệ thống ghi nhận tiến độ",
        body: en ? "After learning, open Practice for quizzes, listening and recall. A low score assigns review work; you never need to manually open the next day." : "Sau khi học nội dung, vào Luyện tập để làm quiz, nghe và phản xạ. Điểm chưa đạt sẽ tạo bài học lại; không cần tự mở ngày kế tiếp.",
        action: { label: en ? "Open Practice" : "Mở Luyện tập", tab: "practice" },
      },
      {
        kicker: en ? "STEP 4 · QUEST" : "BƯỚC 4 · QUEST",
        title: en ? "Quest uses progression locks" : "Quest là phần luyện thêm có khóa tiến độ",
        body: en ? "Inside Practice, Pinyin Tone Quest opens only the permitted session. Complete Day 1 first; later days unlock through progress rather than all at once." : "Trong Luyện tập, Pinyin Tone Quest chỉ mở đúng buổi được phép. Hãy hoàn thành ngày 1 trước; ngày sau sẽ mở theo tiến độ, không mở đồng loạt.",
        action: { label: en ? "View Practice" : "Xem Luyện tập", tab: "practice" },
      },
      {
        kicker: en ? "STEP 5 · REMINDERS" : "BƯỚC 5 · NHẮC HỌC",
        title: en ? "Keep today’s plan visible" : "Đừng bỏ lỡ kế hoạch hôm nay",
        body: en ? "If the session remains unfinished at the end of the day, reminders appear in Notifications and Messages. After midnight, unfinished work continues into the next continuation session." : "Cuối ngày, nếu buổi học vẫn chưa hoàn thành, hệ thống sẽ gửi nhắc trong chuông Thông báo và tin nhắn Giáo viên. Nếu bỏ lỡ qua 00:00, bài chưa xong sẽ được kéo dài sang ngày tiếp theo.",
        action: { label: en ? "Open Notifications" : "Mở Thông báo", tab: "notifications" },
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
      action.textContent = item.action?.label || (window.LANG_MODE === "en" ? "Got it" : "Đã hiểu");
      action.style.display = item.action ? "inline-flex" : "none";
      action.dataset.tab = item.action?.tab || "";
    }
    const prev = root.querySelector("[data-guide-prev]");
    const next = root.querySelector("[data-guide-next]");
    if (prev) prev.style.visibility = stepIndex ? "visible" : "hidden";
    if (next) next.textContent = stepIndex === steps.length - 1 ? (window.LANG_MODE === "en" ? "Finish" : "Hoàn tất") : (window.LANG_MODE === "en" ? "Next" : "Tiếp theo");
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
    root.querySelector("[data-guide-close]").textContent = window.LANG_MODE === "en" ? "Close" : "Đóng";
    root.querySelector("[data-guide-skip]").textContent = window.LANG_MODE === "en" ? "Skip guide" : "Bỏ qua hướng dẫn";
    root.querySelector("[data-guide-prev]").textContent = window.LANG_MODE === "en" ? "Back" : "Quay lại";
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
