(() => {
  "use strict";
  const TASK_META = {
    quiz: {
      titleVi: "Trắc nghiệm", titleEn: "Multiple choice", icon: "📝", minutes: 8,
      instructionVi: "Kiểm tra nghĩa, pinyin, chữ Hán và ngữ cảnh của từ trong ngày.",
      instructionEn: "Check meaning, pinyin, Hanzi and context for today's words."
    },
    unscramble: {
      titleVi: "Sắp xếp câu", titleEn: "Sentence unscramble", icon: "🔀", minutes: 8,
      instructionVi: "Sắp xếp các câu ví dụ thật để luyện trật tự từ và phản xạ.",
      instructionEn: "Arrange real example sentences to practise word order and response speed."
    },
    match: {
      titleVi: "Ghép chữ · nghĩa", titleEn: "Match Hanzi · meaning", icon: "🧩", minutes: 5,
      instructionVi: "Ghép chữ Hán với nghĩa của nhóm từ đang học.",
      instructionEn: "Match Hanzi with the meanings of the current word set."
    },
    write: {
      titleVi: "Viết nghĩa", titleEn: "Write the meaning", icon: "✍️", minutes: 7,
      instructionVi: "Tự nhớ và nhập nghĩa; sau đó đối chiếu câu ví dụ.",
      instructionEn: "Recall and type the meaning, then compare it with the example."
    },
    "tone-race": {
      titleVi: "Đua xe thanh điệu", titleEn: "Tone Race", icon: "🚗", minutes: 6,
      instructionVi: "Nghe và chọn đúng thanh điệu để củng cố phát âm.",
      instructionEn: "Listen and choose the correct tone to reinforce pronunciation."
    },
    flashcards: {
      titleVi: "Flashcard ôn lại", titleEn: "Review flashcards", icon: "🔁", minutes: 6,
      instructionVi: "Ôn lại các mục cần nhớ trước khi làm bài mới.",
      instructionEn: "Review due items before starting new work."
    },
    quest: {
      titleVi: "Pinyin Tone Quest", titleEn: "Pinyin Tone Quest", icon: "🎯", minutes: 12,
      instructionVi: "Làm buổi Quest đang mở; điểm phần trăm sẽ được lưu để xét mở ngày tiếp theo.",
      instructionEn: "Complete the unlocked Quest day; the percentage score is saved for the next-day gate."
    },
    advanced: {
      titleVi: "Đề HSK3 3.0", titleEn: "HSK3 3.0 set", icon: "🚀", minutes: 20,
      instructionVi: "Chỉ mở khi đã có đủ nền tảng; luyện đọc hiểu và sắp xếp hội thoại.",
      instructionEn: "Use after the foundation is ready; practise reading and dialogue ordering."
    }
  };

  let curriculum = [];
  let activeMission = null;
  let activeTask = null;

  function parseVocabulary(raw) {
    if (!raw || raw === "-") return [];
    return String(raw).split(";").map((part) => {
      const match = part.trim().match(/^(.+?)\([^)]*\)-/);
      return match ? match[1].trim() : "";
    }).filter(Boolean);
  }

  function getSchedule() {
    return window.PandaHanSchedule?.getSchedule?.() || null;
  }

  function currentScheduleDay() {
    const schedule = getSchedule();
    const days = Array.isArray(schedule?.days) ? schedule.days : [];
    return days.filter((d) => d.status === "unlocked")
      .sort((a, b) => Number(a.sequence_index) - Number(b.sequence_index))[0] || null;
  }

  function findCurriculumDay() {
    const scheduleDay = currentScheduleDay();
    const dayNumber = Number(scheduleDay?.day_number || 1);
    return curriculum.find((d) => Number(d.day_number) === dayNumber) || {
      day_number: dayNumber,
      week_number: Math.ceil(dayNumber / 7),
      stage_code: dayNumber <= 10 ? "stage_0" : dayNumber <= 35 ? "stage_1" : dayNumber <= 70 ? "stage_2" : "stage_3",
      day_type: "new_content",
      topic: scheduleDay?.topic || "Lộ trình học hiện tại",
      new_vocab_raw: "-",
      required_score: 80,
      listening_task: "Nghe audio mẫu và lặp lại.",
      speaking_task: "Ghi âm và tự kiểm tra.",
      reading_writing_task: "Làm bài luyện đọc và viết.",
      srs_review_task: "Ôn lại từ cần nhớ.",
      notes: ""
    };
  }

  function getVocabulary() {
    try { return typeof VOCAB !== "undefined" && Array.isArray(VOCAB) ? VOCAB : (Array.isArray(window.VOCAB) ? window.VOCAB : []); } catch (_) { return Array.isArray(window.VOCAB) ? window.VOCAB : []; }
  }
  function getVocabularyMap() {
    try { return typeof VOCAB_BY_CHAR !== "undefined" ? VOCAB_BY_CHAR : (window.VOCAB_BY_CHAR || {}); } catch (_) { return window.VOCAB_BY_CHAR || {}; }
  }
  function targetVocabulary(day) {
    const chars = parseVocabulary(day.new_vocab_raw);
    const map = getVocabularyMap();
    const all = getVocabulary();
    const exact = chars.map((char) => map[char]).filter(Boolean);
    const seen = new Set(exact.map((w) => w.char));
    const due = all.filter((w) => {
      try {
        const dueNow = typeof isDue === "function" ? isDue(w.char) : false;
        const tier = typeof getTier === "function" ? getTier(w.char) : 0;
        return !seen.has(w.char) && (dueNow || tier > 0);
      } catch (_) { return !seen.has(w.char); }
    });
    const fallback = all.filter((w) => !seen.has(w.char));
    return [...exact, ...due, ...fallback].slice(0, 12);
  }

  function questModeToTask(mode) {
    const value = String(mode || "");
    if (/Đua thanh điệu|tone/i.test(value)) return "tone-race";
    if (/Ghép từ|match/i.test(value)) return "match";
    if (/Nước rút từ vựng|vocabulary/i.test(value)) return "quiz";
    if (/Boss nghe|boss/i.test(value)) return "quest";
    return "quest";
  }

  function buildTasks(day) {
    const stage = day.stage_code;
    const review = day.day_type === "review";
    const types = stage === "stage_0"
      ? (review ? ["quest", "tone-race", "quiz", "flashcards"] : ["quest", "tone-race", "quiz", "write"])
      : stage === "stage_1"
        ? (review ? ["quest", "flashcards", "quiz", "match", "write"] : ["quest", "quiz", "match", "write", "unscramble"])
        : stage === "stage_2"
          ? (review ? ["quest", "flashcards", "quiz", "unscramble", "tone-race"] : ["quest", "quiz", "unscramble", "match", "write"])
          : (review ? ["quest", "flashcards", "quiz", "unscramble", "advanced"] : ["quest", "quiz", "unscramble", "write", "match", ...(Number(day.day_number) >= 75 ? ["advanced"] : [])]);
    const workbookPrimary = questModeToTask(day.quest_main_mode);
    const ordered = [workbookPrimary, ...types.filter((type) => type !== workbookPrimary)];
    return ordered.map((type, index) => {
      const meta = TASK_META[type];
      const task = { id: `${day.day_number}-${type}-${index}`, type, ...meta, order: index + 1, source: "excel_workbook" };
      if (type === "quest") {
        task.titleVi = day.quest_main_mode && day.quest_main_mode !== "-" ? `Pinyin Quest · ${day.quest_main_mode}` : task.titleVi;
        task.instructionVi = [day.quest_daily_task, day.quest_activity_chain].filter((value) => value && value !== "-").join(" ");
        task.instructionEn = "Follow the workbook Quest sequence and complete the saved checkpoint.";
        task.minutes = Math.max(8, Number(day.xp_target || 60) >= 100 ? 18 : 12);
      }
      return task;
    });
  }

  function buildMission() {
    const day = findCurriculumDay();
    const words = targetVocabulary(day);
    const tasks = buildTasks(day);
    const scheduleDay = currentScheduleDay();
    return {
      dayNumber: Number(day.day_number), sequenceIndex: Number(scheduleDay?.sequence_index || day.day_number),
      weekNumber: Number(day.week_number || Math.ceil(Number(day.day_number) / 7)),
      stageCode: day.stage_code, stage: day.stage, dayType: day.day_type, topic: day.topic || "",
      requiredScore: Number(day.required_score || 80), newVocab: words,
      curriculum: day, tasks,
      questStation: day.quest_station || "-", questMainMode: day.quest_main_mode || "-",
      questActivityChain: day.quest_activity_chain || "-", questDailyTask: day.quest_daily_task || "-",
      questCompletionCondition: day.quest_completion_condition || "-", questCheckpointQuestion: day.quest_checkpoint_question || "-",
      xpTarget: Number(day.xp_target || 0),
      totalMinutes: tasks.reduce((sum, task) => sum + Number(task.minutes || 0), 0)
    };
  }

  function mission() {
    activeMission = buildMission();
    return activeMission;
  }

  function setFilterForMission(m) {
    const filter = document.getElementById("practiceHskFilter");
    if (!filter) return;
    if (m.stageCode === "stage_1") filter.value = "1";
    else if (m.stageCode === "stage_2") filter.value = "2";
    else if (m.stageCode === "stage_3") filter.value = "3";
    else filter.value = "all";
  }

  function getTargetVocabulary() {
    const m = activeMission || mission();
    return activeTask && m.newVocab.length ? m.newVocab : [];
  }

  function startTask(type) {
    const m = activeMission || mission();
    activeTask = m.tasks.find((task) => task.type === type) || { type };
    setFilterForMission(m);
    const level = document.getElementById("practiceHskFilter")?.value || "all";
    if (type === "quiz") window.startQuizLevel?.(level);
    else if (type === "unscramble") window.startUnscrambleLevel?.(level);
    else if (type === "match") window.startMatchGame?.();
    else if (type === "write") window.startWriteGame?.();
    else if (type === "tone-race") window.startToneRaceGame?.();
    else if (type === "quest") {
      window.switchTab?.("practice");
      setTimeout(() => document.getElementById("pCardPinyinQuest")?.click(), 80);
    } else if (type === "advanced") {
      document.getElementById("advancedSetsView")?.style && (document.getElementById("advancedSetsView").style.display = "block");
      window.renderAdvancedSetsList?.();
    } else if (type === "flashcards") {
      const first = m.newVocab[0];
      if (first) window.startReviewForWord?.(first.char);
      else window.switchTab?.("dashboard");
    }
  }

  function esc(value) {
    return String(value || "").replace(/[&<>\"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]));
  }

  function renderCoach(container, compact = false) {
    if (!container) return;
    const m = mission();
    const c = m.curriculum;
    const langEn = window.LANG_MODE === "en";
    const stageLabel = langEn ? (m.stageCode === "stage_0" ? "Pinyin Bootcamp" : m.stageCode === "stage_1" ? "HSK 1 foundation" : m.stageCode === "stage_2" ? "HSK 2 development" : "HSK 3 communication") : (m.stage || m.stageCode);
    const taskRows = m.tasks.map((task) => `<button type="button" data-mission-task="${task.type}" style="display:flex;align-items:center;gap:8px;width:100%;text-align:left;border:1px solid #f3d5e5;border-radius:11px;background:#fff;padding:8px 10px;margin-top:6px;cursor:pointer;"><span style="font-size:20px;">${task.icon}</span><span style="flex:1;min-width:0;"><b>${langEn ? task.titleEn : task.titleVi}</b><br><small style="color:#64748b;overflow-wrap:anywhere;">${esc(langEn ? task.instructionEn : task.instructionVi)}</small></span><small style="color:#a855f7;font-weight:800;white-space:nowrap;">${task.minutes} min</small></button>`).join("");
    const workbookPlan = compact ? "" : `<div style="font-size:12px;margin-top:9px;padding-top:8px;border-top:1px dashed #e9c8dc;"><b>${langEn ? "Workbook tasks for today" : "Nhiệm vụ theo file Excel hôm nay"}</b><div style="margin-top:5px;line-height:1.55;"><div>🎧 ${esc(c.listening_task || "-")}</div><div>🗣️ ${esc(c.speaking_task || "-")}</div><div>📖 ${esc(c.reading_writing_task || "-")}</div><div>🔁 ${esc(c.srs_review_task || "-")}</div></div></div>`;
    const questPlan = compact ? "" : `<div style="margin-top:9px;padding:8px 9px;border-radius:10px;background:#fff;border:1px solid #ddd6fe;font-size:11.5px;line-height:1.5;"><b>🎯 ${esc(m.questStation)} · ${esc(m.questMainMode)}</b><div>${esc(m.questActivityChain)}</div><div>${esc(m.questDailyTask)}</div><div><b>${langEn ? "XP" : "XP mục tiêu"}:</b> ${m.xpTarget} · <b>${langEn ? "Checkpoint" : "Điều kiện"}:</b> ${esc(m.questCompletionCondition)}</div><div><b>${langEn ? "Checkpoint question" : "Câu hỏi chốt"}:</b> ${esc(m.questCheckpointQuestion)}</div></div>`;
    container.innerHTML = `<div style="border:1px solid #f3d5e5;border-radius:14px;background:linear-gradient(135deg,#fff7fb,#f5f3ff);padding:12px;"><div style="font-size:11px;color:#a855f7;font-weight:800;text-transform:uppercase;">${langEn ? "AI learning plan · Excel source" : "Kế hoạch học với AI · Nguồn Excel"}</div><h3 style="margin:3px 0;font-size:16px;">${langEn ? `Day ${m.dayNumber} · Week ${m.weekNumber} · ${stageLabel}` : `Ngày ${m.dayNumber} · Tuần ${m.weekNumber} · ${stageLabel}`}</h3><div style="font-weight:700;overflow-wrap:anywhere;">${esc(c.topic)}</div><div style="font-size:11.5px;color:#64748b;margin-top:5px;">${langEn ? `Target score: ${m.requiredScore}% · XP: ${m.xpTarget} · Estimated time: ${m.totalMinutes} minutes` : `Mục tiêu: ${m.requiredScore}% · XP: ${m.xpTarget} · Thời lượng dự kiến: ${m.totalMinutes} phút`}</div>${workbookPlan}${questPlan}<div style="margin-top:9px;">${taskRows}</div></div>`;
    container.querySelectorAll("[data-mission-task]").forEach((button) => button.addEventListener("click", () => startTask(button.dataset.missionTask)));
  }

  function replyTo(text) {
    const m = activeMission || mission();
    const q = String(text || "").toLowerCase();
    const en = window.LANG_MODE === "en";
    if (/trắc nghiệm|quiz|multiple/.test(q)) return en ? `Start Multiple choice for Day ${m.dayNumber}. Focus on the words and context from: ${m.topic}.` : `Bạn hãy bấm Trắc nghiệm. Nội dung lấy từ ngày ${m.dayNumber}: ${m.topic}.`;
    if (/sắp xếp|unscramble|câu/.test(q)) return en ? `Use Sentence unscramble next. Read the example aloud, then arrange the sentence and review the correction.` : "Tiếp theo hãy làm Sắp xếp câu. Đọc câu mẫu thành tiếng, xếp lại câu rồi xem phần giải thích.";
    if (/ghép|match|nghĩa/.test(q)) return en ? `Use Match Hanzi · meaning for a short warm-up. It covers today's ${m.newVocab.length} target words.` : `Hãy làm Ghép chữ · nghĩa để khởi động. Bài lấy ${m.newVocab.length} từ mục tiêu của ngày hôm nay.`;
    if (/quest|pinyin|thanh điệu|tone/.test(q)) return en ? `Open Pinyin Tone Quest ${m.questStation} for Day ${m.dayNumber}. Main mode: ${m.questMainMode}. Follow: ${m.questActivityChain}. The score is saved and used with the ${m.requiredScore}% gate.` : `Hãy mở Pinyin Tone Quest ${m.questStation} của ngày ${m.dayNumber}. Chế độ chính: ${m.questMainMode}. Làm theo chuỗi: ${m.questActivityChain}. Điểm sẽ được lưu và dùng cùng ngưỡng ${m.requiredScore}% để xét mở ngày tiếp theo.`;
    if (/nghe|listen|nói|speak|đọc|viết|read|write|srs|ôn/.test(q)) return en ? `Today's workbook tasks are: Listen — ${m.curriculum.listening_task}; Speak — ${m.curriculum.speaking_task}; Read/Write — ${m.curriculum.reading_writing_task}; SRS — ${m.curriculum.srs_review_task}.` : `Nhiệm vụ theo file hôm nay gồm: Nghe — ${m.curriculum.listening_task}; Nói — ${m.curriculum.speaking_task}; Đọc/Viết — ${m.curriculum.reading_writing_task}; SRS — ${m.curriculum.srs_review_task}.`;
    if (/viết|write/.test(q)) return en ? "Use Write the meaning after the recognition tasks. Try from memory before revealing the reference answer." : "Hãy làm Viết nghĩa sau các bài nhận diện. Cố nhớ trước rồi mới xem phần đáp án tham khảo.";
    if (/xong|hoàn thành|done|next|tiếp/.test(q)) return en ? `After all tasks, aim for at least ${m.requiredScore}%. If you miss the target, review the same day instead of unlocking new content.` : `Sau khi làm xong, hãy đạt ít nhất ${m.requiredScore}%. Nếu chưa đạt, ôn lại đúng ngày này thay vì mở nội dung mới.`;
    return en ? `Today's plan is Day ${m.dayNumber}: ${m.topic}. Start with ${m.tasks[0]?.titleEn || "the first task"}, then continue in order. Ask me about any task.` : `Kế hoạch hôm nay là ngày ${m.dayNumber}: ${m.topic}. Hãy bắt đầu với ${m.tasks[0]?.titleVi || "bài đầu tiên"}, rồi làm lần lượt. Bạn có thể hỏi tôi về từng bài.`;
  }

  async function load() {
    try {
      const response = await fetch("assets/curriculum_days.json", { cache: "no-store" });
      const data = await response.json();
      curriculum = Array.isArray(data) ? data : (data.curriculum_days || []);
    } catch (error) {
      console.warn("Mission curriculum fallback:", error);
      curriculum = [];
    }
    activeMission = null;
    window.dispatchEvent(new CustomEvent("pandahan-mission-ready"));
  }

  window.PandaHanMission = { load, mission, getCurrent: mission, getTargetVocabulary, startTask, renderCoach, replyTo, getActiveTask: () => activeTask, parseVocabulary };
  window.addEventListener("pandahan-schedule-updated", () => { activeMission = null; });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", load); else load();
})();
