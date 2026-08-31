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
    listening: {
      titleVi: "Nghe", titleEn: "Listening", icon: "🎧", minutes: 8,
      instructionVi: "Làm Quiz nghe Ngữ âm 10 câu; đạt từ 30% mới có evidence Nghe. Câu sai bắt buộc vào phần ôn.",
      instructionEn: "Complete the 10-item Phonetics listening quiz; a score of 30% or more creates Listening evidence. Wrong items must be redone."
    },
    speaking: {
      titleVi: "Nói", titleEn: "Speaking", icon: "🗣️", minutes: 8,
      instructionVi: "Ghi âm câu/đoạn trong Ngữ âm; hệ thống dùng điểm phát âm thật theo âm vị, thanh điệu và độ trôi chảy.",
      instructionEn: "Record a sentence/passage in Phonetics; the system uses the real phoneme, tone and fluency score."
    },
    reading_writing: {
      titleVi: "Đọc / Viết", titleEn: "Reading / Writing", icon: "📖", minutes: 8,
      instructionVi: "Làm bài đọc/viết và chấm theo kết quả thực tế.",
      instructionEn: "Complete reading/writing practice and use the actual result."
    },
    srs: {
      titleVi: "Ôn SRS", titleEn: "SRS review", icon: "🔁", minutes: 6,
      instructionVi: "Ôn các từ đến hạn bằng Flashcard SRS; kết quả được ghi từ thao tác thật.",
      instructionEn: "Review due words with SRS flashcards; completion comes from real actions."
    },
    "vocab-intro": {
      titleVi: "Nghe từ vựng liên kết Ngữ âm", titleEn: "Listen to phonetics-linked vocabulary", icon: "🎧", minutes: 8,
      instructionVi: "Nghe từng từ mới có âm đầu/thanh điệu liên quan; chỉ sau lượt nghe thật mới sang từ tiếp theo.",
      instructionEn: "Play each new word linked to the phonetics focus; only real playback unlocks the next word."
    },
    "vocab-writing": {
      titleVi: "Viết nghĩa từ vựng", titleEn: "Write vocabulary meanings", icon: "✍️", minutes: 7,
      instructionVi: "Sau khi nghe/nói, tự nhập nghĩa các từ đã mở; câu trả lời từ đơn được chấm tự động.",
      instructionEn: "After listening/speaking, type meanings for unlocked words; single-word answers are auto-graded."
    },
    "wrong-review": {
      titleVi: "Ôn lại câu sai", titleEn: "Redo wrong items", icon: "🔄", minutes: 6,
      instructionVi: "Làm lại các từ/câu đã trả lời sai gần đây; không bỏ qua lỗi đang tồn đọng.",
      instructionEn: "Redo words/items answered incorrectly recently; unresolved mistakes stay in the queue."
    },
    quest: {
      titleVi: "Thử thách thanh điệu AI Coach", titleEn: "AI Coach Tone Challenge", icon: "🎯", minutes: 12,
      instructionVi: "Game riêng của AI Coach theo nhóm từ trong kế hoạch; không thay đổi mở khóa Pinyin Tone Quest chính.",
      instructionEn: "A dedicated AI Coach game using planned vocabulary; it never changes main Pinyin Tone Quest unlocking."
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
      required_score: 30,
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
    const adaptive = window.PandaHanAdaptiveLearning?.buildPlan?.(day, getSchedule());
    if (adaptive) return adaptive.practiceWords || [];
    const all = getVocabulary();
    return all.filter((word) => { try { return typeof isDue === "function" && isDue(word.char); } catch (_) { return false; } }).slice(0, 10);
  }

  function questModeToTask(mode) {
    const value = String(mode || "");
    if (/Đua thanh điệu|tone/i.test(value)) return "tone-race";
    if (/Ghép từ|match/i.test(value)) return "match";
    if (/Nước rút từ vựng|vocabulary/i.test(value)) return "quiz";
    if (/Boss nghe|boss/i.test(value)) return "quest";
    return "quest";
  }

  function readingWritingUnlockedForCoach(day) {
    const core = window.PandaHanScheduleCore;
    if (typeof core?.isReadingWritingUnlocked === "function") return core.isReadingWritingUnlocked(day || {});
    return Number(day?.day_number || day?.original_day_number || 0) >= 31;
  }

  function buildTasks(day, adaptivePlan = null, vocabPhase = {}) {
    const stage = day.stage_code;
    const review = day.day_type === "review";
    const hasPracticeWords = !!adaptivePlan?.practiceWords?.length;
    const hasNewIntro = !!adaptivePlan?.vocabIntroReady && !!adaptivePlan?.introWords?.length;
    const practiceTypes = stage === "stage_0"
      ? (review ? ["quest", "tone-race", "quiz", "flashcards"] : ["quest", "tone-race", "quiz", "write"])
      : stage === "stage_1"
        ? (review ? ["quest", "flashcards", "quiz", "match", "write"] : ["quest", "quiz", "match", "write", "unscramble"])
        : stage === "stage_2"
          ? (review ? ["quest", "flashcards", "quiz", "unscramble", "tone-race"] : ["quest", "quiz", "unscramble", "match", "write"])
          : (review ? ["quest", "flashcards", "quiz", "unscramble", "advanced"] : ["quest", "quiz", "unscramble", "write", "match", ...(Number(day.day_number) >= 75 ? ["advanced"] : [])]);
    const adaptivePracticeTypes = hasPracticeWords ? practiceTypes.filter((type) => ["quiz", "unscramble", "match", "write", "flashcards", "tone-race", "advanced"].includes(type) && !(type === "write" && adaptivePlan?.introCompleted)) : [];
    const mistakeCount = window.PandaHanMistakes?.getQueue?.().length || 0;
    if (mistakeCount && window.PandaHanSchedule?.requireMistakeReview) window.PandaHanSchedule.requireMistakeReview(Number(day.day_number)).catch((error) => console.warn("Require mistake review from plan:", error.message || error));
    const readingWritingUnlocked = readingWritingUnlockedForCoach(day);
    const workbookTypes = [
      ["listening", day.listening_task],
      ["speaking", day.speaking_task],
      ["reading_writing", day.reading_writing_task],
      ["srs", day.srs_review_task],
    ].filter(([type, value]) => value && value !== "-" && (type !== "reading_writing" || readingWritingUnlocked)).map(([type]) => type);
    const phoneticsTypes = workbookTypes.filter((type) => type === "listening" || type === "speaking");
    const introComplete = !!(vocabPhase?.introCompleted || adaptivePlan?.introCompleted);
    const speakingComplete = !!vocabPhase?.speakingCompleted;
    const gameComplete = !!vocabPhase?.gameCompleted;
    const hasPendingLinkedIntro = hasNewIntro && !introComplete;
    // Mục 4 "Từ vựng liên kết nói" đã được loại bỏ; AI Coach chuyển thẳng sang game sau khi hoàn tất Ngữ âm và bước nghe từ vựng.
    const canOpenGame = introComplete;
    const canOpenVocabWriting = canOpenGame && gameComplete;
    const vocabFollowups = [
      ...(canOpenGame ? ["tone-race", "quest"] : []),
      ...(canOpenVocabWriting ? ["vocab-writing"] : [])
    ];
    const workbookAfterPractice = workbookTypes.filter((type) => !phoneticsTypes.includes(type) && type !== "reading_writing");
    const workbookPrimary = questModeToTask(day.quest_main_mode);
    const allowedAdaptivePractice = canOpenVocabWriting ? adaptivePracticeTypes : [];
    const chainMode = !!(adaptivePlan?.linkedNewWords?.length || adaptivePlan?.introWords?.length || hasNewIntro);
    const preChain = [...phoneticsTypes, ...(hasPendingLinkedIntro ? ["vocab-intro"] : [])];
    const postChain = [...(canOpenGame ? ["tone-race", "quest"] : []), ...(canOpenVocabWriting ? ["vocab-writing"] : []), ...allowedAdaptivePractice, ...(canOpenVocabWriting && workbookTypes.includes("reading_writing") ? ["reading_writing"] : []), ...workbookAfterPractice, ...(canOpenGame ? [workbookPrimary] : [])];
    const ordered = [...new Set([...(mistakeCount ? ["wrong-review"] : []), ...(chainMode ? [...preChain, ...postChain] : [...phoneticsTypes, ...(hasPendingLinkedIntro ? ["vocab-intro"] : []), ...vocabFollowups, ...allowedAdaptivePractice, ...(readingWritingUnlocked ? ["reading_writing"] : []), ...workbookAfterPractice, ...(canOpenGame ? ["quest"] : []), workbookPrimary])])];
    return ordered.map((type, index) => {
      const meta = TASK_META[type] || TASK_META.reading_writing;
      const chainWords = adaptivePlan?.linkedNewWords?.length ? adaptivePlan.linkedNewWords : (adaptivePlan?.introWords?.length ? adaptivePlan.introWords : (adaptivePlan?.practiceWords || []));
      const task = { id: `${day.day_number}-${type}-${index}`, type, ...meta, order: index + 1, source: "excel_workbook", evidenceType: type === "speaking" ? "phonetics_sentence_pronunciation" : type, lessonId: Number(day.day_number), vocabularyIds: chainWords.map((word) => word.id), vocabularyChars: chainWords.map((word) => word.char) };
      const workbookText = { listening: day.listening_task, speaking: day.speaking_task, reading_writing: day.reading_writing_task, srs: day.srs_review_task }[type];
      if (workbookText && workbookText !== "-") {
        task.instructionVi = workbookText;
        task.instructionEn = meta.instructionEn;
      }
      if (type === "quest") {
        const workbookQuest = [day.quest_daily_task, day.quest_activity_chain].filter((value) => value && value !== "-").join(" ");
        task.instructionVi = [task.instructionVi, workbookQuest].filter(Boolean).join(" ");
        task.instructionEn = `${task.instructionEn} Follow the workbook tone-practice focus for this session.`;
        task.minutes = Math.max(8, Number(day.xp_target || 60) >= 100 ? 18 : 12);
      }
      if (type === "vocab-intro") {
        task.instructionVi = adaptivePlan?.focusLabel ? `Sau Ngữ âm (${adaptivePlan.focusLabel}), học ${adaptivePlan.introWords.length} từ mới liên quan rồi làm bài kiểm tra.` : task.instructionVi;
        task.instructionEn = adaptivePlan?.focusLabel ? `After phonetics (${adaptivePlan.focusLabel}), learn ${adaptivePlan.introWords.length} linked new words, then test them.` : task.instructionEn;
        task.minutes = Math.max(6, Math.min(12, Number(adaptivePlan?.introWords.length || 4) + 3));
      }
      if (["quiz", "unscramble", "match", "write", "flashcards"].includes(type) && adaptivePlan) {
        const reviewCount = adaptivePlan.reviewWords.length;
        const newCount = adaptivePlan.introCompleted ? adaptivePlan.newWords.length : 0;
        task.instructionVi += ` Dữ liệu hiện tại: ${reviewCount} từ cần ôn${newCount ? `, ${newCount} từ mới đã học` : ""}.`;
        task.instructionEn += ` Current evidence: ${reviewCount} review words${newCount ? `, ${newCount} introduced words` : ""}.`;
      }
      return task;
    });
  }

  function buildMission() {
    const day = findCurriculumDay();
    const scheduleDay = currentScheduleDay();
    const schedule = getSchedule();
    const adaptivePlan = window.PandaHanAdaptiveLearning?.buildPlan?.(day, getSchedule()) || null;
    const words = adaptivePlan?.practiceWords || targetVocabulary(day);
    const chainVocabulary = adaptivePlan?.linkedNewWords?.length ? adaptivePlan.linkedNewWords : (adaptivePlan?.introWords?.length ? adaptivePlan.introWords : []);
    const vocabPhase = window.PandaHanVocabularyPhase?.get?.(Number(day.day_number)) || { introCompleted: !!adaptivePlan?.introCompleted, speakingCompleted: false, gameCompleted: false };
    const tasks = buildTasks(day, adaptivePlan, vocabPhase);
    const sequenceIndex = Number(scheduleDay?.sequence_index || day.day_number);
    const isRepeat = !!scheduleDay?.is_repeat_of || scheduleDay?.day_type === "repeat";
    const sessionLabelVi = isRepeat ? `Buổi ${sequenceIndex} — tiếp tục Ngày ${Number(day.day_number)}` : `Ngày ${Number(day.day_number)}`;
    const sessionLabelEn = isRepeat ? `Session ${sequenceIndex} — continue Day ${Number(day.day_number)}` : `Day ${Number(day.day_number)}`;
    const carriedTaskIds = Array.isArray(scheduleDay?.carried_completed_tasks) ? scheduleDay.carried_completed_tasks.slice() : Object.keys(scheduleDay?.completed_tasks || {});
    const requiredTaskIds = Array.isArray(scheduleDay?.required_tasks) ? scheduleDay.required_tasks.slice() : [];
    const missingTaskIds = requiredTaskIds.filter((id) => !scheduleDay?.completed_tasks?.[id]);
    const plannedDays = Math.max(120, ...(Array.isArray(schedule?.days) ? schedule.days.map((entry) => Number(entry.sequence_index || 0)) : [0]));
    const extensionCount = Math.max(0, Number(schedule?._meta?.extension_count || 0), plannedDays - 120);
    const startedAt = String(schedule?._meta?.started_at || scheduleDay?.scheduled_date || "");
    return {
      dayNumber: Number(day.day_number), sequenceIndex, isRepeat, sessionLabelVi, sessionLabelEn, plannedDays, extensionCount, startedAt,
      carriedTaskIds, requiredTaskIds, missingTaskIds, scheduleDay,
      weekNumber: Number(day.week_number || Math.ceil(Number(day.day_number) / 7)),
      stageCode: day.stage_code, stage: day.stage, dayType: day.day_type, topic: day.topic || "",
      requiredScore: Number(scheduleDay?.required_score || day.required_score || 30), newVocab: words,
      curriculum: day, workbook: day.workbook_row || null, tasks, adaptivePlan, vocabPhase,
      chain: { lessonId: Number(day.day_number), vocabularyIds: chainVocabulary.map((word) => word.id), vocabularyChars: chainVocabulary.map((word) => word.char), vocabulary: chainVocabulary.map((word) => ({ id: word.id, char: word.char, pinyin: word.pinyin, meaning: word.meaning, meaningEn: word.meaning_en })), phoneticFocus: adaptivePlan?.focusGroups || [], focusLabel: adaptivePlan?.focusLabel || "" },
      chainVocabulary,
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
    return activeTask && m.adaptivePlan ? (m.adaptivePlan.practiceWords || []) : [];
  }

  function startTask(type) {
    const m = activeMission || mission();
    if (type === "reading_writing" && !readingWritingUnlockedForCoach(m.curriculum || { day_number: m.dayNumber })) {
      alert(L("Đọc / Viết trong AI Coach mở từ Ngày 31, sau khi hoàn thành 30 ngày đầu.", "AI Coach Reading / Writing opens on Day 31, after the first 30 days are complete."));
      return;
    }
    activeTask = m.tasks.find((task) => task.type === type) || { type };
    const phase = m.vocabPhase || {};
    if (["vocab-intro", "tone-race", "quest", "vocab-writing"].includes(type) && m.chainVocabulary?.length && !m.adaptivePlan?.phoneticsReady) { alert(L("Hãy hoàn thành Nghe và Nói Ngữ âm có evidence thật trước khi học nhóm từ liên kết.", "Complete the verified Phonetics listening and speaking steps before linked vocabulary.")); return; }
    if ((type === "tone-race" || type === "quest") && m.chainVocabulary?.length && !m.adaptivePlan?.phoneticsReady) { alert(L("Hãy hoàn thành Ngữ âm có điểm thật trước khi vào game thanh điệu.", "Complete Phonetics with an objective score before the tone game.")); return; }
    if (type === "vocab-writing" && !phase.gameCompleted) { alert(L("Hãy hoàn thành nghe → game trước khi viết nghĩa.", "Complete listening → game before vocabulary writing.")); return; }
    if (["quiz", "match", "unscramble", "write"].includes(type) && m.chainVocabulary?.length && !phase.gameCompleted) { alert(L("Bài này chỉ mở sau game của đúng nhóm từ trong ngày.", "This exercise opens only after the game for the exact day word set.")); return; }
    setFilterForMission(m);
    const scheduledContext = { practiceMode: "scheduled", scheduleDayNumber: m.dayNumber, sequenceIndex: m.sequenceIndex };
    const level = document.getElementById("practiceHskFilter")?.value || "all";
    if (type === "vocab-intro") { window.switchTab?.("practice"); setTimeout(() => window.startAdaptiveVocabularyLesson?.(m.adaptivePlan?.introWords || [], m.dayNumber), 80); }
    else if (type === "vocab-writing") { window.switchTab?.("practice"); setTimeout(() => window.startWriteGame?.({ words: m.chainVocabulary || [], ...scheduledContext }), 80); }
    else if (type === "wrong-review") window.startMistakeReview?.();
    else if (type === "quiz") {
      if (typeof window.startQuizForWords === "function") window.startQuizForWords(m.chainVocabulary?.length ? m.chainVocabulary : (m.adaptivePlan?.practiceWords || []), scheduledContext);
      else window.startQuizLevel?.(level, scheduledContext);
    } else if (type === "unscramble") window.startUnscrambleLevel?.(level, { words: m.chainVocabulary?.length ? m.chainVocabulary : (m.adaptivePlan?.practiceWords || []), ...scheduledContext });
    else if (type === "match") window.startMatchGame?.({ words: m.chainVocabulary?.length ? m.chainVocabulary : (m.adaptivePlan?.practiceWords || []), ...scheduledContext });
    else if (type === "write") window.startWriteGame?.(scheduledContext);
    else if (type === "tone-race") window.startToneRaceGame?.({ words: m.chainVocabulary?.length ? m.chainVocabulary : (m.adaptivePlan?.practiceWords || []), ...scheduledContext });
    else if (type === "quest") {
      // AI Coach dùng trực tiếp bài Ôn tập 120 ngày để điểm Quest cập nhật schedule và mở ngày kế tiếp.
      window.switchTab?.("practice");
      setTimeout(async () => {
        document.getElementById("pCardPinyinQuest")?.click();
        try { await window.PandaHanQuestParts?.loadQuestOffline?.(); } catch (_) {}
        const input = document.getElementById("questDaySearch");
        if (input) input.value = String(m.dayNumber || 1);
        await window.PandaHanFeatureUpdates?.jumpToReviewDay?.(m.dayNumber || 1);
      }, 120);
    } else if (type === "listening") {
      try { localStorage.setItem("pandahan_phonetics_focus", type); } catch (_) {}
      window.switchTab?.("pinyin");
      setTimeout(() => {
        document.getElementById("pinyin-phonetics-root")?.scrollIntoView({ behavior: "smooth", block: "start" });
        window.PandaHanPhoneticsListeningQuiz?.startScheduledQuiz?.();
      }, 180);
    } else if (type === "speaking") {
      try { localStorage.setItem("pandahan_phonetics_focus", type); } catch (_) {}
      window.switchTab?.("pinyin");
      setTimeout(() => document.getElementById("pinyin-phonetics-root")?.scrollIntoView({ behavior: "smooth", block: "start" }), 160);
    } else if (type === "reading_writing") {
      window.switchTab?.("practice");
      setTimeout(() => window.startWriteGame?.(scheduledContext), 80);
    } else if (type === "srs") {
      window.setPracticeMode?.("scheduled");
      window.switchTab?.("reviewIntro");
    } else if (type === "advanced") {
      document.getElementById("advancedSetsView")?.style && (document.getElementById("advancedSetsView").style.display = "block");
      window.renderAdvancedSetsList?.();
    } else if (type === "flashcards") {
      const first = m.newVocab[0];
      if (first) window.startReviewForWord?.(first.char, scheduledContext);
      else window.switchTab?.("dashboard");
    }
  }

  function esc(value) {
    return String(value || "").replace(/[&<>\"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]));
  }

  function requiredTaskLabel(taskId, langEn) {
    const labels = { mistake_review: langEn ? "Redo wrong items" : "Ôn lại câu sai", quest: langEn ? "AI Coach Tone Challenge" : "Thử thách thanh điệu AI Coach", listening: langEn ? "Listening" : "Nghe", speaking: langEn ? "Speaking" : "Nói", reading_writing: langEn ? "Reading / Writing" : "Đọc / Viết", srs: "SRS", "vocab-intro": langEn ? "Linked vocabulary" : "Từ vựng liên kết" };
    return labels[taskId] || taskId;
  }
  function workbookTaskDescription(taskId, curriculum, langEn) {
    if (!langEn) return ({ listening: "Làm Quiz nghe Ngữ âm 10 câu; đạt từ 30%. Câu sai phải ôn lại trước buổi mới.", speaking: curriculum.speaking_task, reading_writing: curriculum.reading_writing_task, srs: curriculum.srs_review_task })[taskId] || "";
    return ({
      listening: "Complete the 10-item Phonetics listening quiz with a score of at least 30%; redo wrong items before the next session.",
      speaking: "Complete a recorded speaking attempt in Phonetics for this session.",
      reading_writing: "Complete the assigned reading/writing activity using this session’s linked material.",
      srs: "Complete the scheduled spaced review for this session."
    })[taskId] || "";
  }
  function renderLearningSequence(m, langEn) {
    const c = m.curriculum || {};
    const completed = m.scheduleDay?.completed_tasks || {};
    const phase = m.vocabPhase || {};
    const linkedWords = Array.isArray(m.chainVocabulary) ? m.chainVocabulary : [];
    const hasLinkedVocabulary = linkedWords.length > 0;
    const phoneticsReady = !!m.adaptivePlan?.phoneticsReady;
    const sequence = [];
    if (c.listening_task && c.listening_task !== "-") sequence.push({ type: "listening", title: langEn ? "1. Phonetics — Listening" : "1. Ngữ âm — Nghe", description: workbookTaskDescription("listening", c, langEn), done: !!completed.listening });
    if (c.speaking_task && c.speaking_task !== "-") sequence.push({ type: "speaking", title: langEn ? "2. Phonetics — Speaking" : "2. Ngữ âm — Nói", description: workbookTaskDescription("speaking", c, langEn), done: !!completed.speaking });
    if (hasLinkedVocabulary) {
      sequence.push({ type: "vocab-intro", title: langEn ? "3. Linked vocabulary — listen" : "3. Từ vựng liên kết — nghe", description: langEn ? `${linkedWords.length} words use the phonetics focus of this session.` : `${linkedWords.length} từ dùng đúng âm/thanh điệu trọng tâm của buổi này.`, done: !!phase.introCompleted, locked: !phoneticsReady, lockText: langEn ? "Complete verified Phonetics first." : "Hoàn thành evidence Ngữ âm trước." });
    }
    sequence.push({ type: "quest", title: hasLinkedVocabulary ? (langEn ? "4. AI Coach Tone Challenge" : "4. Thử thách thanh điệu AI Coach") : (langEn ? "3. AI Coach Tone Challenge" : "3. Thử thách thanh điệu AI Coach"), description: hasLinkedVocabulary ? (langEn ? "A dedicated Coach game uses this session’s linked words. Its verified score supplies Coach evidence only and never changes the restored Pinyin Tone Quest source game." : "Game riêng của AI Coach dùng đúng nhóm từ liên kết. Điểm thật chỉ là evidence AI Coach và không thay đổi Pinyin Tone Quest gốc vừa khôi phục.") : (langEn ? "Complete the dedicated Coach tone game. The restored main Pinyin Tone Quest remains on its own schedule-linked source flow." : "Hoàn thành game thanh điệu riêng của AI Coach. Pinyin Tone Quest chính đã khôi phục theo luồng nguồn liên kết schedule riêng."), done: !!completed.quest, locked: hasLinkedVocabulary && (!phoneticsReady || !phase.introCompleted), lockText: langEn ? "Finish verified Phonetics and linked vocabulary listening first." : "Hoàn thành Ngữ âm đã xác minh và nghe từ vựng liên kết trước." });
    if (c.reading_writing_task && c.reading_writing_task !== "-") {
      const readingWritingUnlocked = readingWritingUnlockedForCoach(c);
      sequence.push({ type: "reading_writing", title: hasLinkedVocabulary ? (langEn ? "5. Reading / Writing" : "5. Đọc / Viết") : (langEn ? "4. Reading / Writing" : "4. Đọc / Viết"), description: readingWritingUnlocked ? workbookTaskDescription("reading_writing", c, langEn) : (langEn ? "Unlocks on Day 31, after the first 30 learning days." : "Mở từ Ngày 31, sau khi hoàn thành 30 ngày học đầu."), done: !!completed.reading_writing, locked: !readingWritingUnlocked, lockText: langEn ? "Reading / Writing opens on Day 31." : "Đọc / Viết mở từ Ngày 31." });
    }
    const mistakes = window.PandaHanMistakes?.getQueue?.().length || 0;
    if (mistakes) sequence.push({ type: "wrong-review", title: langEn ? "Redo wrong items" : "Ôn lại câu sai", description: langEn ? `${mistakes} unresolved item(s) must be redone before the next day unlocks.` : `${mistakes} câu/từ sai còn tồn đọng phải được làm lại trước khi mở ngày mới.`, done: !!completed.mistake_review });
    const rows = sequence.map((step) => {
      const blocked = !step.done && !!step.locked;
      const action = step.done ? `<small style="color:#15803d;font-weight:800;white-space:nowrap;">${langEn ? "verified" : "đã xác minh"}</small>` : blocked ? `<small style="color:#b45309;font-weight:800;white-space:nowrap;">${langEn ? "locked" : "đang khóa"}</small>` : `<button type="button" data-mission-task="${step.type}" style="border:1px solid #c084fc;background:#fff;border-radius:7px;padding:4px 7px;color:#7e22ce;font-size:10.5px;font-weight:800;white-space:nowrap;">${langEn ? "Open step" : "Vào học"}</button>`;
      return `<div style="display:flex;align-items:flex-start;gap:8px;padding:7px 0;border-top:1px solid #f1e8f5;"><span style="font-size:16px;">${step.done ? "✅" : blocked ? "🔒" : "⬜"}</span><span style="flex:1;min-width:0;"><b>${esc(step.title)}</b><br><small style="color:#64748b;line-height:1.4;">${esc(blocked ? step.lockText : step.description)}</small></span>${action}</div>`;
    }).join("");
    return `<div style="margin-top:10px;padding:9px 10px;border:1px solid #ddd6fe;border-radius:11px;background:#fbfaff;"><b>${langEn ? "Follow this session in order" : "Học đúng thứ tự của buổi này"}</b><div style="font-size:11px;color:#64748b;margin-top:3px;">${langEn ? "Each button opens the matching learning screen. The Quest score is accepted only after its preceding linked-vocabulary steps are complete." : "Mỗi nút mở đúng trang học tương ứng. Điểm Quest chỉ được nhận vào schedule sau khi đã xong các bước từ vựng liên kết phía trước."}</div>${rows}</div>`;
  }
  function localizedCurriculumTopic(m, langEn) {
    if (!langEn) return m.curriculum?.topic || m.topic || "";
    const day = Number(m.dayNumber || 1);
    if (day <= 10) return `Phonetics foundation · Day ${day}`;
    if (day <= 35) return `HSK 1 foundation · Day ${day}`;
    if (day <= 70) return `HSK 2 development · Day ${day}`;
    return `HSK 3 integration · Day ${day}`;
  }
  function renderRequiredChecklist(m, langEn) {
    const c = m.curriculum || {};
    const core = window.PandaHanScheduleCore;
    const mandatory = core?.getMandatoryTaskIds ? core.getMandatoryTaskIds(c) : ["quest", "listening", "speaking", "reading_writing"].filter((id) => id === "quest" || (id === "listening" && c.listening_task && c.listening_task !== "-") || (id === "speaking" && c.speaking_task && c.speaking_task !== "-") || (id === "reading_writing" && c.reading_writing_task && c.reading_writing_task !== "-") || (id === "srs" && c.srs_review_task && c.srs_review_task !== "-"));
    const scheduleDay = currentScheduleDay();
    const completed = scheduleDay?.completed_tasks || {};
    const phase = m.vocabPhase || {};
    const hasLinkedVocabulary = Array.isArray(m.chainVocabulary) && m.chainVocabulary.length > 0;
    const phoneticsReady = !!m.adaptivePlan?.phoneticsReady;
    const entries = [];
    if (mandatory.includes("listening")) entries.push({ id: "listening", done: !!completed.listening, schedule: true, description: workbookTaskDescription("listening", c, langEn) });
    if (mandatory.includes("speaking")) entries.push({ id: "speaking", done: !!completed.speaking, schedule: true, description: workbookTaskDescription("speaking", c, langEn) });
    if (hasLinkedVocabulary) entries.push({ id: "vocab-intro", done: !!phase.introCompleted, chain: true, locked: !phoneticsReady, description: langEn ? "Learn the exact phonetics-linked word set for this session." : "Học đúng nhóm từ liên kết với Ngữ âm của buổi này." });
    if (mandatory.includes("quest")) entries.push({ id: "quest", done: !!completed.quest, schedule: true, locked: hasLinkedVocabulary && (!phoneticsReady || !phase.introCompleted), description: langEn ? "Open only the currently unlocked Quest day; its real score is submitted to schedule." : "Chỉ mở đúng ngày Quest đang unlock; điểm thật mới được nộp vào schedule." });
    const readingWritingUnlocked = readingWritingUnlockedForCoach(c);
    if (mandatory.includes("reading_writing") || (c.reading_writing_task && c.reading_writing_task !== "-")) entries.push({ id: "reading_writing", done: !!completed.reading_writing, schedule: readingWritingUnlocked, deferred: !readingWritingUnlocked, locked: !readingWritingUnlocked, description: readingWritingUnlocked ? workbookTaskDescription("reading_writing", c, langEn) : (langEn ? "Unlocks on Day 31, after the first 30 learning days." : "Mở từ Ngày 31, sau khi hoàn thành 30 ngày học đầu.") });
    if (mandatory.includes("srs")) entries.push({ id: "srs", done: !!completed.srs, schedule: true, description: workbookTaskDescription("srs", c, langEn) });
    const hasMistakes = (window.PandaHanMistakes?.getQueue?.().length || 0) > 0;
    if (hasMistakes || mandatory.includes("mistake_review")) entries.push({ id: "mistake_review", done: !hasMistakes && !!completed.mistake_review, schedule: true, description: langEn ? "Redo every unresolved wrong item before the next session can unlock." : "Làm lại toàn bộ câu/từ sai còn tồn đọng trước khi mở buổi mới." });
    const labels = { "vocab-intro": langEn ? "Linked vocabulary — learn" : "Từ vựng liên kết — học" };
    const launchType = { mistake_review: "wrong-review", quest: "quest", listening: "listening", speaking: "speaking", reading_writing: "reading_writing", srs: "srs", "vocab-intro": "vocab-intro" };
    const rows = entries.map((entry, index) => {
      const title = labels[entry.id] || requiredTaskLabel(entry.id, langEn);
      const action = entry.done ? `<small style="color:#15803d;font-weight:800;white-space:nowrap;">${langEn ? "verified" : "đã xác minh"}</small>` : entry.locked ? `<small style="color:#b45309;font-weight:800;white-space:nowrap;">${langEn ? "locked" : "đang khóa"}</small>` : `<button type="button" data-mission-task="${launchType[entry.id]}" style="border:1px solid #c084fc;background:#fff;border-radius:7px;padding:4px 7px;color:#7e22ce;font-size:10.5px;font-weight:800;white-space:nowrap;">${langEn ? "Open step" : "Vào học"}</button>`;
      const stateText = entry.chain ? (langEn ? "Chain prerequisite" : "Bước bắt buộc trong chuỗi") : entry.deferred ? (langEn ? "Available from Day 31" : "Mở từ Ngày 31") : (langEn ? "Schedule evidence" : "Evidence schedule");
      return `<div style="display:flex;align-items:flex-start;gap:8px;padding:7px 0;border-top:1px solid #f1e8f5;"><span style="font-size:16px;">${entry.done ? "✅" : entry.locked ? "🔒" : "⬜"}</span><span style="flex:1;min-width:0;"><b>${index + 1}. ${esc(title)}</b><br><small style="color:#64748b;line-height:1.4;">${esc(entry.description)} · ${stateText}</small></span>${action}</div>`;
    }).join("");
    return `<div style="margin-top:10px;padding:9px 10px;border:1px solid #e9d5ff;border-radius:11px;background:#fff;"><b>${langEn ? "One synced chain before the next session" : "Một chuỗi đồng bộ trước khi mở buổi mới"}</b><div style="font-size:11px;color:#64748b;margin-top:3px;">${langEn ? "Each button opens its matching screen. Quiz score, verified tasks and unresolved wrong items are the only inputs to the schedule; there is no manual confirmation." : "Mỗi nút mở đúng trang học tương ứng. Điểm quiz, evidence thật và câu sai chưa ôn là dữ liệu duy nhất của schedule; không có nút xác nhận thủ công."}</div>${rows}</div>`;
  }

  function coachAssessmentKey() {
    const owner = String(typeof window.storageNamespace === "function" ? window.storageNamespace() : (window.CURRENT_USER?.uid || "guest"));
    return "pandahan_ai_coach_assessments_v1_" + owner.replace(/[^a-zA-Z0-9_-]/g, "_");
  }
  function latestCoachAssessment(dayNumber) {
    try {
      const rows = JSON.parse(localStorage.getItem(coachAssessmentKey()) || "[]");
      return rows.find((row) => Number(row.dayNumber || 0) === Number(dayNumber || 0)) || rows[0] || null;
    } catch (_) { return null; }
  }
  function renderCoachAssessment(m, langEn) {
    const report = latestCoachAssessment(m.dayNumber);
    if (!report) return "";
    const score = Math.max(0, Math.min(100, Number(report.scorePercent || 0)));
    const wrongItems = Array.isArray(report.wrongItems) ? report.wrongItems : [];
    const tone = score >= 80 ? "#15803d" : score >= 30 ? "#b45309" : "#b91c1c";
    const comment = score >= 80
      ? (langEn ? "Strong result. Keep the linked words active with one short spaced review." : "Kết quả tốt. Hãy ôn ngắt quãng ngắn để giữ vững nhóm từ liên kết.")
      : score >= 30
        ? (langEn ? "The score is recorded, but redo the listed wrong items before the next session." : "Điểm đã được ghi nhận, nhưng cần làm lại các mục sai dưới đây trước buổi mới.")
        : (langEn ? "Below the target. Reopen this linked-vocabulary quiz and practise the listed items." : "Chưa đạt mục tiêu. Hãy làm lại quiz Từ vựng liên kết và ôn các mục dưới đây.");
    const wrongText = wrongItems.length ? wrongItems.slice(0, 6).map((item) => esc(String(item.char || item.word || item.expected || ""))).filter(Boolean).join(" · ") : (langEn ? "None" : "Không có");
    return `<div data-ai-coach-assessment="true" style="margin-top:10px;padding:9px 10px;border:1px solid ${tone}44;border-radius:11px;background:#fff;"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center;"><b>${langEn ? "Latest verified learning report" : "Nhận xét bài làm mới nhất"}</b><span style="color:${tone};font-weight:900;">${score}%</span></div><div style="font-size:11px;color:#475569;margin-top:4px;line-height:1.45;">${esc(comment)}</div><div style="font-size:11px;color:#64748b;margin-top:5px;">${langEn ? "Review items" : "Mục cần ôn"}: ${wrongText}</div></div>`;
  }
  function formatScheduleStart(date) {
    const parts = String(date || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    return parts ? `${parts[3]}/${parts[2]}/${parts[1]}` : "—";
  }
  function renderCoachRouteStatus(m, langEn) {
    const missing = (m.missingTaskIds || []).map((id) => requiredTaskLabel(id, langEn)).join(" · ");
    const start = formatScheduleStart(m.startedAt);
    const hasExtension = Number(m.plannedDays || 120) > 120 || Number(m.extensionCount || 0) > 0;
    const title = hasExtension
      ? (langEn ? `Learning path extended: 120 → ${m.plannedDays} days` : `Lộ trình đã kéo dài: 120 → ${m.plannedDays} ngày`)
      : (langEn ? "120-day learning path" : "Lộ trình học 120 ngày");
    const body = hasExtension
      ? (langEn
        ? `Started ${start}. Scheduled session ${m.sequenceIndex} continues curriculum Day ${m.dayNumber}; ${m.extensionCount || (m.plannedDays - 120)} extra session(s) were added because required evidence was not completed before the deadline.`
        : `Bắt đầu từ ${start}. Buổi lịch ${m.sequenceIndex} đang tiếp tục Ngày giáo trình ${m.dayNumber}; đã tăng ${m.extensionCount || (m.plannedDays - 120)} ngày vì evidence bắt buộc chưa hoàn thành đúng hạn.`)
      : (langEn
        ? `Started ${start}. You are on curriculum Day ${m.dayNumber}/120, scheduled session ${m.sequenceIndex}. Complete today’s verified tasks before the next curriculum day can be evaluated.`
        : `Bắt đầu từ ${start}. Bạn đang ở Ngày giáo trình ${m.dayNumber}/120, buổi lịch ${m.sequenceIndex}. Hoàn thành các nhiệm vụ có evidence hôm nay trước khi xét mở ngày giáo trình tiếp theo.`);
    const pending = missing
      ? (langEn ? `Still required: ${missing}.` : `Còn phải hoàn thành: ${missing}.`)
      : (langEn ? "All required task evidence for this session is recorded; score and wrong-item gates still apply." : "Đã ghi nhận evidence của các nhiệm vụ; điều kiện điểm và câu sai cần ôn vẫn được kiểm tra.");
    const color = hasExtension ? "#b45309" : "#0f766e";
    const bg = hasExtension ? "#fffbeb" : "#f0fdfa";
    return `<div data-ai-coach-route-status="true" style="margin-top:10px;padding:9px 10px;border:1px solid ${color}44;border-radius:11px;background:${bg};"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center;"><b>${title}</b><span style="color:${color};font-weight:900;white-space:nowrap;">${m.plannedDays} ${langEn ? "days" : "ngày"}</span></div><div style="font-size:11px;color:#475569;margin-top:4px;line-height:1.45;">${esc(body)}</div><div style="font-size:11px;color:${color};margin-top:5px;font-weight:700;line-height:1.4;">${esc(pending)}</div></div>`;
  }
  function routeStatusChatText(m, language = "vi") {
    const hasExtension = Number(m?.plannedDays || 120) > 120 || Number(m?.extensionCount || 0) > 0;
    const start = formatScheduleStart(m?.startedAt);
    if (language === "zh") return hasExtension
      ? `路径更新：120天课程已延长到${m.plannedDays}天。开始日期：${start}；第${m.sequenceIndex}节继续第${m.dayNumber}天，未完成的必做 evidence 将继续保留。`
      : `课程从${start}开始，共120天；当前为第${m?.dayNumber || 1}/120天。完成今天所有已验证任务后，才会评估下一天。`;
    if (language === "en") return hasExtension
      ? `Path update: the 120-day course is now ${m.plannedDays} days. Started ${start}; session ${m.sequenceIndex} continues curriculum Day ${m.dayNumber}, and unfinished required evidence remains assigned.`
      : `The 120-day course started ${start}; you are on curriculum Day ${m?.dayNumber || 1}/120. The next day is evaluated only after today’s verified tasks are complete.`;
    return hasExtension
      ? `Cập nhật lộ trình: khóa 120 ngày đã tăng lên ${m.plannedDays} ngày. Bắt đầu từ ${start}; Buổi ${m.sequenceIndex} tiếp tục Ngày giáo trình ${m.dayNumber}, các evidence bắt buộc chưa hoàn thành vẫn được giữ lại.`
      : `Lộ trình 120 ngày bắt đầu từ ${start}; bạn đang ở Ngày giáo trình ${m?.dayNumber || 1}/120. Ngày tiếp theo chỉ được xét sau khi nhiệm vụ hôm nay có evidence đầy đủ.`;
  }
  function renderCoach(container, compact = false) {
    if (!container) return;
    const m = mission();
    const c = m.curriculum;
    const adaptive = m.adaptivePlan;
    const langEn = window.LANG_MODE === "en";
    const stageLabel = langEn ? (m.stageCode === "stage_0" ? "Pinyin Bootcamp" : m.stageCode === "stage_1" ? "HSK 1 foundation" : m.stageCode === "stage_2" ? "HSK 2 development" : "HSK 3 communication") : (m.stage || m.stageCode);
    const phase = m.vocabPhase || {};
    const learningSequence = renderLearningSequence(m, langEn);
    const workbookPlan = "";
    const questPlan = "";
    const mistakeCount = window.PandaHanMistakes?.getAllQueue?.().length || window.PandaHanMistakes?.getQueue?.().length || 0;
    const adaptiveNote = adaptive ? `<div style="font-size:11.5px;color:#475569;margin-top:7px;padding:8px 9px;border-radius:9px;background:#fff;border:1px dashed #c4b5fd;">${langEn ? `Adaptive source: ${adaptive.reviewWords.length} due/weak review words${adaptive.introCompleted ? ` + ${adaptive.newWords.length} introduced words` : adaptive.vocabIntroReady ? ` · ${adaptive.introWords.length} phonetics-linked new words ready` : " · finish phonetics before new vocabulary"}${mistakeCount ? ` · ${mistakeCount} wrong items to redo` : ""}.` : `Nguồn thích ứng: ${adaptive.reviewWords.length} từ đến hạn/yếu cần ôn${adaptive.introCompleted ? ` + ${adaptive.newWords.length} từ mới đã học` : adaptive.vocabIntroReady ? ` · sẵn sàng ${adaptive.introWords.length} từ mới liên kết Ngữ âm` : " · hoàn thành Ngữ âm trước khi học từ mới"}${mistakeCount ? ` · ${mistakeCount} câu sai cần làm lại` : ""}.`}</div>` : "";
    const nextOriginalTextVi = m.dayNumber < 120 ? `Ngày gốc ${m.dayNumber + 1} vẫn khóa cho đến khi buổi này đạt.` : "Đây là phần kéo dài sau ngày 120; không có ngày giáo trình mới bị mở sớm.";
    const nextOriginalTextEn = m.dayNumber < 120 ? `Original Day ${m.dayNumber + 1} remains locked until this session passes.` : "This is an extension after Day 120; no new curriculum day is unlocked early.";
    const carryNote = m.isRepeat ? `<div style="font-size:11.5px;color:#92400e;margin-top:7px;padding:8px 9px;border-radius:9px;background:#fffbeb;border:1px solid #fcd34d;">${langEn ? `Continuation session: verified work carried from Day ${m.dayNumber}: ${m.carriedTaskIds.length ? m.carriedTaskIds.join(", ") : "none"}. Still required: ${m.missingTaskIds.length ? m.missingTaskIds.join(", ") : "none"}. ${nextOriginalTextEn}` : `Buổi tiếp tục: đã giữ bằng chứng từ Ngày ${m.dayNumber}: ${m.carriedTaskIds.length ? m.carriedTaskIds.join(", ") : "chưa có"}. Còn phải làm: ${m.missingTaskIds.length ? m.missingTaskIds.join(", ") : "không còn"}. ${nextOriginalTextVi}`}</div>` : "";
    const excelDetails = langEn ? [] : [
      c.grammar_focus ? `${langEn ? "Grammar/reference" : "Ngữ pháp/tài liệu"}: ${c.grammar_focus}` : "",
      c.notes ? `${langEn ? "Note" : "Ghi chú"}: ${c.notes}` : "",
      m.questStation !== "-" ? `${langEn ? "Quest station" : "Trạm Quest"}: ${m.questStation}` : "",
      m.questCompletionCondition !== "-" ? `${langEn ? "Stamp condition" : "Điều kiện đóng dấu"}: ${m.questCompletionCondition}` : "",
      m.questCheckpointQuestion !== "-" ? `${langEn ? "Checkpoint" : "Câu hỏi chốt"}: ${m.questCheckpointQuestion}` : ""
    ].filter(Boolean);
    const excelNote = excelDetails.length ? `<details style="margin-top:8px;background:#fff;border:1px solid #e2e8f0;border-radius:9px;padding:7px 9px;font-size:11px;color:#475569;"><summary style="cursor:pointer;font-weight:800;color:#7e22ce;">Xem đầy đủ nội dung ngày từ Excel</summary><div style="margin-top:6px;line-height:1.5;overflow-wrap:anywhere;">${excelDetails.map(esc).join("<br>")}</div></details>` : "";
    container.innerHTML = `<div data-ai-coach-plan="true" style="border:1px solid #f3d5e5;border-radius:14px;background:linear-gradient(135deg,#fff7fb,#f5f3ff);padding:12px;"><div style="font-size:11px;color:#a855f7;font-weight:800;text-transform:uppercase;">${langEn ? "AI learning plan · Excel + real learner data" : "Kế hoạch học với AI · Excel + dữ liệu học thật"}</div><h3 style="margin:3px 0;font-size:16px;">${langEn ? `${m.sessionLabelEn} · Week ${m.weekNumber} · ${stageLabel}` : `${m.sessionLabelVi} · Tuần ${m.weekNumber} · ${stageLabel}`}</h3><div style="font-weight:700;overflow-wrap:anywhere;">${esc(localizedCurriculumTopic(m, langEn))}</div><div style="font-size:11.5px;color:#64748b;margin-top:5px;">${langEn ? `Target score: ${m.requiredScore}% · XP: ${m.xpTarget} · Estimated time: ${m.totalMinutes} minutes` : `Mục tiêu: ${m.requiredScore}% · XP: ${m.xpTarget} · Thời lượng dự kiến: ${m.totalMinutes} phút`}</div>${renderCoachRouteStatus(m, langEn)}${adaptiveNote}${carryNote}${excelNote}${renderCoachAssessment(m, langEn)}${learningSequence}${renderRequiredChecklist(m, langEn)}</div>`;
    container.querySelectorAll("[data-mission-task]").forEach((button) => button.addEventListener("click", () => startTask(button.dataset.missionTask)));
  }

  function coachUsesEnglish(text) {
    const raw = String(text || "").toLowerCase();
    const englishSignals = /\b(please|can you|could you|write|paragraph|topic|english|explain|help|what|how|why|weekend|family|school|food|travel|doctor|work|city|environment)\b/;
    const vietnameseSignals = /\b(tôi|bạn|mình|viết|đoạn|chủ đề|giúp|là gì|như thế nào|cuối tuần|gia đình|trường học|giải thích|dùng|ví dụ|lỗi|thường|cách)\b/;
    return englishSignals.test(raw) && !vietnameseSignals.test(raw);
  }
  function coachUsesVietnamese(text) {
    const raw = String(text || "").toLowerCase();
    return /\b(tôi|bạn|mình|viết|đoạn|chủ đề|giúp|là gì|như thế nào|cuối tuần|gia đình|trường học|giải thích|dùng|ví dụ|lỗi|thường|cách|ngữ pháp|từ vựng)\b/.test(raw);
  }
  function coachResponseLanguage(text, preferred = "auto") {
    if (["zh", "en", "vi"].includes(preferred)) return preferred;
    const raw = String(text || "");
    if (coachUsesVietnamese(raw)) return "vi";
    if (coachUsesEnglish(raw)) return "en";
    if (/[\u3400-\u9fff]/.test(raw)) return "zh";
    return window.LANG_MODE === "en" ? "en" : "vi";
  }
  function topicLengthProfile(level, selected = "adaptive") {
    const base = Number(level || 1);
    if (selected === "short" || selected === "medium" || selected === "long") return selected;
    return base <= 2 ? "short" : base <= 4 ? "medium" : "long";
  }
  function hanziCount(text) { return (String(text || "").match(/[\u3400-\u9fff]/g) || []).length; }
  function takeSentences(text, targetHanzi) {
    const sentences = String(text || "").match(/[^。！？]+[。！？]?/g) || [String(text || "")];
    const selected = [];
    sentences.forEach((sentence) => {
      if (!selected.length || hanziCount(selected.join("")) + hanziCount(sentence) <= targetHanzi) selected.push(sentence);
    });
    return selected.join("");
  }
  function longReadingExtensions(level) {
    const extensions = {
      4: [
        ["从这个角度来看，了解具体情况非常重要。", "Cóng zhège jiǎodù lái kàn, liǎojiě jùtǐ qíngkuàng fēicháng zhòngyào.", "Nhìn từ góc độ này, việc hiểu rõ tình hình cụ thể là rất quan trọng.", "From this perspective, understanding the specific situation is very important."],
        ["同时，我们也应该听取不同人的经验。", "Tóngshí, wǒmen yě yīnggāi tīngqǔ bùtóng rén de jīngyàn.", "Đồng thời, chúng ta cũng nên lắng nghe kinh nghiệm của những người khác nhau.", "At the same time, we should also listen to the experiences of different people."],
        ["如果能把想法变成每天可做的小行动，效果会更明显。", "Rúguǒ néng bǎ xiǎngfǎ biàn chéng měitiān kě zuò de xiǎo xíngdòng, xiàoguǒ huì gèng míngxiǎn.", "Nếu có thể biến ý tưởng thành những hành động nhỏ mỗi ngày, hiệu quả sẽ rõ rệt hơn.", "If we can turn ideas into small daily actions, the results will be more noticeable."],
        ["因此，学习者可以先观察，再作出合适的选择。", "Yīncǐ, xuéxízhě kěyǐ xiān guānchá, zài zuòchū héshì de xuǎnzé.", "Vì vậy, người học có thể quan sát trước rồi đưa ra lựa chọn phù hợp.", "Therefore, learners can observe first and then make an appropriate choice."],
        ["最后，定期复盘能帮助我们发现需要改进的地方。", "Zuìhòu, dìngqī fùpán néng bāngzhù wǒmen fāxiàn xūyào gǎijìn de dìfang.", "Cuối cùng, việc nhìn lại định kỳ giúp chúng ta nhận ra những điểm cần cải thiện.", "Finally, regular review helps us identify areas that need improvement."]
      ],
      5: [
        ["值得注意的是，问题往往不能只从单一角度来理解。", "Zhíde zhùyì de shì, wèntí wǎngwǎng bù néng zhǐ cóng dānyī jiǎodù lái lǐjiě."],
        ["在作出判断之前，人们需要比较不同方案带来的影响。", "Zài zuòchū pànduàn zhīqián, rénmen xūyào bǐjiào bùtóng fāng'àn dàilái de yǐngxiǎng."],
        ["个人经验固然重要，但可靠的信息同样不可缺少。", "Gèrén jīngyàn gùrán zhòngyào, dàn kěkào de xìnxī tóngyàng bùkě quēshǎo."],
        ["如果能够提出具体例子，观点会更清楚，也更容易交流。", "Rúguǒ nénggòu tíchū jùtǐ lìzi, guāndiǎn huì gèng qīngchu, yě gèng róngyì jiāoliú."],
        ["长期来看，持续反思比一次性的结论更有价值。", "Chángqī lái kàn, chíxù fǎnsī bǐ yí cìxìng de jiélùn gèng yǒu jiàzhí."],
        ["因此，我们应该把学习到的知识和真实情境结合起来。", "Yīncǐ, wǒmen yīnggāi bǎ xuéxí dào de zhīshi hé zhēnshí qíngjìng jiéhé qǐlái."],
        ["这也是提高表达能力和分析能力的有效方式。", "Zhè yě shì tígāo biǎodá nénglì hé fēnxī nénglì de yǒuxiào fāngshì."],
        ["当不同利益之间出现冲突时，清楚说明依据往往比急于表态更有帮助。", "Dāng bùtóng lìyì zhījiān chūxiàn chōngtū shí, qīngchu shuōmíng yījù wǎngwǎng bǐ jíyú biǎotài gèng yǒu bāngzhù."],
        ["通过反复讨论和修正，人们才能逐渐形成较为全面的认识。", "Tōngguò fǎnfù tǎolùn hé xiūzhèng, rénmen cái néng zhújiàn xíngchéng jiàowéi quánmiàn de rènshi."]
      ],
      6: [
        ["进一步说，复杂议题通常同时涉及个人经验、公共责任与长期影响。", "Jìnyíbù shuō, fùzá yìtí tōngcháng tóngshí shèjí gèrén jīngyàn, gōnggòng zérèn yǔ chángqī yǐngxiǎng."],
        ["面对不同意见时，先澄清概念和证据，能够避免把讨论变成简单的对立。", "Miànduì bùtóng yìjiàn shí, xiān chéngqīng gàiniàn hé zhèngjù, nénggòu bìmiǎn bǎ tǎolùn biàn chéng jiǎndān de duìlì."],
        ["有说服力的观点不仅要表达立场，也要说明形成这一立场的推理过程。", "Yǒu shuōfúlì de guāndiǎn bùjǐn yào biǎodá lìchǎng, yě yào shuōmíng xíngchéng zhè yì lìchǎng de tuīlǐ guòchéng."],
        ["此外，具体案例可以帮助听者理解抽象原则在现实中的作用。", "Cǐwài, jùtǐ ànlì kěyǐ bāngzhù tīngzhě lǐjiě chōuxiàng yuánzé zài xiànshí zhōng de zuòyòng."],
        ["即使暂时无法达成一致，理性的交流仍然能够扩大彼此的理解范围。", "Jíshǐ zànshí wúfǎ dáchéng yízhì, lǐxìng de jiāoliú réngrán nénggòu kuòdà bǐcǐ de lǐjiě fànwéi."],
        ["在信息快速传播的环境里，核实来源和区分事实、推测与价值判断尤其重要。", "Zài xìnxī kuàisù chuánbō de huánjìng lǐ, héshí láiyuán hé qūfēn shìshí, tuīcè yǔ jiàzhí pànduàn yóuqí zhòngyào."],
        ["因此，学习者应当练习用准确、克制且清晰的语言组织论证。", "Yīncǐ, xuéxízhě yīngdāng liànxí yòng zhǔnquè, kèzhì qiě qīngxī de yǔyán zǔzhī lùnzhèng."],
        ["这样的训练不仅有助于中文表达，也有助于形成更成熟的思考习惯。", "Zhèyàng de xùnliàn bùjǐn yǒuzhù yú Zhōngwén biǎodá, yě yǒuzhù yú xíngchéng gèng chéngshú de sīkǎo xíguàn."],
        ["如果结论需要随着新资料而调整，承认不确定性并不代表观点没有价值。", "Rúguǒ jiélùn xūyào suízhe xīn zīliào ér tiáozhěng, chéngrèn bù quèdìngxìng bìng bù dàibiǎo guāndiǎn méiyǒu jiàzhí."],
        ["相反，这种开放的态度能让后续的合作和判断建立在更可靠的基础上。", "Xiāngfǎn, zhè zhǒng kāifàng de tàidu néng ràng hòuxù de hézuò hé pànduàn jiànlì zài gèng kěkào de jīchǔ shàng."]
      ]
    };
    return (extensions[Number(level)] || []).map(([zh, py, vi, en]) => {
      const translation = window.PandaHanTutorExtensionTranslations?.[zh] || {};
      return [zh, py, vi || translation.vi || "", en || translation.en || ""];
    });
  }
  function paragraphForLength(topic, length) {
    const level = Number(topic?.level || 1);
    if (level <= 3) return { zh: String(topic?.zh || ""), pinyin: String(topic?.pinyin || ""), vi: String(topic?.vi || ""), en: String(topic?.en || "") };
    const targets = {
      4: { short: 90, medium: 145, long: 200 },
      5: { short: 130, medium: 230, long: 340 },
      6: { short: 160, medium: 270, long: 400 }
    };
    const target = (targets[level] || targets[4])[length] || (targets[level] || targets[4]).medium;
    const base = String(topic.zh || "");
    const added = [];
    const pinyin = [String(topic.pinyin || "")];
    const vietnamese = [String(topic.vi || "")];
    const english = [String(topic.en || "")];
    for (const [zh, py, vi, en] of longReadingExtensions(level)) {
      if (hanziCount(base + added.join("")) >= target) break;
      added.push(zh);
      pinyin.push(py);
      vietnamese.push(vi || "");
      english.push(en || "");
    }
    return { zh: base + added.join(""), pinyin: pinyin.filter(Boolean).join(" "), vi: vietnamese.filter(Boolean).join(" "), en: english.filter(Boolean).join(" ") };
  }
  function hskTopicResponse(topic, language = "vi", requestedLength = "adaptive") {
    const en = language === "en";
    const zh = language === "zh";
    const length = topicLengthProfile(topic.level, requestedLength);
    const paragraph = paragraphForLength(topic, length);
    const title = en ? topic.topicEn : topic.topicVi;
    const meaning = en ? topic.en : topic.vi;
    const task = en ? topic.taskEn : topic.taskVi;
    const vocabulary = topic.vocabulary.map((item) => `• ${item}`).join("\n");
    const grammar = topic.grammar.map((item) => `• ${item}`).join("\n");
    const dialogue = topic.dialogue.map((item) => `• ${item}`).join("\n");
    const lengthLabel = { short: zh ? "短篇（适合入门）" : en ? "Short practice" : "Đoạn ngắn", medium: zh ? "中篇（适合进阶）" : en ? "Standard practice" : "Đoạn vừa", long: zh ? "长篇（适合高阶）" : en ? "Long practice" : "Đoạn dài" }[length];
    const longHint = length === "long" && Number(topic.level) >= 4 ? (zh ? `\n\n篇幅参考\nHSK ${topic.level === 4 ? "4 约200字" : "5–6 约300–400字"}；段落已按所选主题扩展。` : en ? `\n\nLength reference\nHSK ${topic.level === 4 ? "4: about 200 Chinese characters" : "5–6: about 300–400 Chinese characters"}; this passage is expanded for the selected topic.` : `\n\nTham chiếu độ dài\nHSK ${topic.level === 4 ? "4: khoảng 200 chữ Hán" : "5–6: khoảng 300–400 chữ Hán"}; đoạn đã được mở rộng theo đúng chủ đề.`) : "";
    if (zh) return `HSK ${topic.level} · ${topic.topicEn}\n\n练习长度\n${lengthLabel}\n\n中文短文\n${paragraph.zh}\n\n拼音\n${paragraph.pinyin}\n\n重点词汇\n${vocabulary}\n\n语法点\n${grammar}\n\n小对话\n${dialogue}\n\n练习任务\n请围绕这个主题写一段中文，并至少使用一个上面的语法点。${longHint}\n\n写完后发给我。我会检查可观察的结构、目标词和 HSK 句型；完整的语义与自然度反馈需要已部署的 AI Coach 或老师。`;
    return en
      ? `HSK ${topic.level} · ${title}\n\nPractice length\n${lengthLabel}\n\nChinese paragraph\n${paragraph.zh}\n\nPinyin\n${paragraph.pinyin}\n\nMeaning\n${meaning}\n\nTarget vocabulary\n${vocabulary}\n\nGrammar patterns\n${grammar}\n\nMini dialogue\n${dialogue}\n\nYour task\n${task}${longHint}\n\nSend your version when ready. I will check observable structure, target words and HSK patterns; semantic naturalness needs the deployed AI Coach or a teacher.`
      : `HSK ${topic.level} · ${title}\n\nĐộ dài luyện tập\n${lengthLabel}\n\nĐoạn văn tiếng Trung\n${paragraph.zh}\n\nPinyin\n${paragraph.pinyin}\n\nNghĩa\n${meaning}\n\nTừ mục tiêu\n${vocabulary}\n\nMẫu ngữ pháp\n${grammar}\n\nHội thoại ngắn\n${dialogue}\n\nNhiệm vụ của bạn\n${task}${longHint}\n\nKhi viết xong hãy gửi lại. Mình sẽ kiểm tra cấu trúc, từ mục tiêu và mẫu HSK; việc chấm ngữ nghĩa/độ tự nhiên đầy đủ cần AI Coach backend đã deploy hoặc giáo viên.`;
  }
  function hskTopicMenu(level, language = "vi") {
    const en = language === "en";
    const zh = language === "zh";
    const library = window.PandaHanHskLibrary;
    const selected = Number(level || 0);
    const items = library?.items?.filter((item) => !selected || Number(item.level) === selected) || [];
    const byLevel = [1, 2, 3, 4, 5, 6].map((n) => {
      const choices = items.filter((item) => Number(item.level) === n).map((item) => en || zh ? item.topicEn : item.topicVi);
      return choices.length ? `HSK ${n}: ${choices.join(" · ")}` : "";
    }).filter(Boolean).join("\n");
    if (zh) return `请从 Offline 题库中选择 HSK ${selected || "1–6"} 主题：\n${byLevel}\n\n你可以输入主题名称或点击 AI Tutor 里的主题卡。系统会给出中文短文、拼音、词汇、语法和小对话。`;
    return en
      ? `Choose one structured HSK ${selected || "1–3"} topic from the Offline library:\n${byLevel}\n\nType a topic name (for example “HSK 2 weekend” or “travel”) or select a topic card above. I will then send a multi-sentence Chinese paragraph, pinyin, meaning, vocabulary, grammar and a mini dialogue.`
      : `Hãy chọn một chủ đề HSK ${selected || "1–3"} có sẵn trong thư viện Offline:\n${byLevel}\n\nBạn có thể gõ tên chủ đề (ví dụ “HSK 2 cuối tuần” hoặc “du lịch”) hoặc bấm thẻ chủ đề ở phía trên. Sau đó mình sẽ gửi đoạn tiếng Trung nhiều câu, pinyin, nghĩa, từ mục tiêu, ngữ pháp và hội thoại ngắn.`;
  }
  function grammarLessonResponse(entry, language) {
    if (language === "zh") return `**${entry.name} · HSK ${entry.hsk}**\n\n**结构**\n${entry.form}\n\n**怎么用**\n${entry.zh}\n\n**例句**\n${entry.ex}\nPinyin: ${entry.py}\n\n**常见错误**\n${entry.cautionZh}\n\n**现在练习**\n${entry.taskZh}\n\n把你的句子发给我；离线模式可以提示结构，完整的自然度与语义反馈需要已部署的 Cloud AI 或老师。`;
    if (language === "en") return `**${entry.name} · HSK ${entry.hsk}**\n\n**Pattern**\n${entry.form}\n\n**How to use it**\n${entry.en}\n\n**Example**\n${entry.ex}\nPinyin: ${entry.py}\nMeaning: ${entry.exEn}\n\n**Common pitfall**\n${entry.cautionEn}\n\n**Try it now**\n${entry.taskEn}\n\nSend your sentence. Offline mode can point out observable structure; full naturalness and meaning feedback needs deployed Cloud AI or a teacher.`;
    return `**${entry.name} · HSK ${entry.hsk}**\n\n**Cấu trúc**\n${entry.form}\n\n**Cách dùng**\n${entry.vi}\n\n**Ví dụ**\n${entry.ex}\nPinyin: ${entry.py}\nNghĩa: ${entry.exVi}\n\n**Lỗi thường gặp**\n${entry.cautionVi}\n\n**Luyện ngay**\n${entry.taskVi}\n\nGửi câu của bạn. Offline có thể nhắc lỗi cấu trúc quan sát được; phản hồi đầy đủ về độ tự nhiên/ngữ nghĩa cần Cloud AI đã deploy hoặc giáo viên.`;
  }
  function grammarMenuResponse(language) {
    const pack = window.PandaHanGrammarPack?.all?.() || [];
    const menu = [1, 2, 3, 4, 5, 6].map((level) => {
      const names = pack.filter((entry) => entry.hsk === level).map((entry) => entry.name).join(" · ");
      return names ? `HSK ${level}: ${names}` : "";
    }).filter(Boolean).join("\n");
    if (language === "zh") return `我可以用“结构 → 用法 → 例句 → 常见错误 → 小练习”的方式解释这些语法：\n${menu}\n\n请直接问一个句式，例如：“把字句怎么用？” 或 “解释 无论…都…”。`;
    if (language === "en") return `I can explain these grammar patterns as “pattern → use → example → common pitfall → short practice”:\n${menu}\n\nAsk directly, for example: “How do I use 把?” or “Explain 无论…都…”.`;
    return `Mình có thể giải thích theo cấu trúc: “công thức → cách dùng → ví dụ → lỗi thường gặp → luyện ngắn” cho các mẫu:\n${menu}\n\nHãy hỏi trực tiếp, ví dụ: “把 dùng thế nào?” hoặc “Giải thích 无论…都…”.`;
  }
  function offlineTutorCapabilityResponse(language) {
    if (language === "zh") return "离线 AI Tutor 可以解释已收录的 HSK 语法、提供主题短文、查看词汇和检查可观察的句子结构。对于开放式、复杂或课外问题，需要部署 Cloud AI 后才能得到完整回答。";
    if (language === "en") return "Offline AI Tutor can explain included HSK grammar, provide topic passages, look up vocabulary, and check observable sentence structure. For open-ended, complex, or non-course questions, deploy Cloud AI for a full answer.";
    return "AI Tutor Offline có thể giải thích ngữ pháp HSK đã có, tạo đoạn theo chủ đề, tra từ vựng và kiểm tra cấu trúc câu quan sát được. Với câu hỏi mở, phức tạp hoặc ngoài nội dung học, cần deploy Cloud AI để nhận câu trả lời đầy đủ.";
  }
  function vocabularyTutorResponse(text, language) {
    const word = getVocabulary().find((item) => item.char && String(text || "").includes(item.char));
    if (!word) return "";
    const meaning = language === "en" ? (word.meaning_en || word.meaning || "") : (word.meaning || word.meaning_en || "");
    const sample = Array.isArray(word.examples) ? word.examples[0] : null;
    const exampleZh = Array.isArray(sample) ? sample[0] : "";
    const exampleMeaning = Array.isArray(sample) ? sample[1] : "";
    if (language === "zh") return `**${word.char}**\nPinyin: ${word.pinyin || "—"}\n释义: ${meaning || "请打开词典卡查看释义。"}\n词性: ${word.pos || "—"}\n\n**例句**\n${exampleZh || `请用“${word.char}”写一句和你有关的话。`}\n${exampleMeaning ? `提示: ${exampleMeaning}` : ""}\n\n请用这个词写一句。离线模式可检查目标词是否出现；更细的搭配与自然度需要 Cloud AI。`;
    if (language === "en") { const pos = typeof window.PandaHanLocalizePos === "function" ? window.PandaHanLocalizePos(word.pos) : (word.pos || "—"); return `**${word.char}**\nPinyin: ${word.pinyin || "—"}\nMeaning: ${meaning || "Open the dictionary card to view the saved meaning."}\nPart of speech: ${pos}\n\n**Example**\n${exampleZh || `Write one sentence about yourself using “${word.char}”.`}\n${exampleMeaning ? `Meaning cue: ${exampleMeaning}` : ""}\n\nWrite your own sentence with this word. Offline can verify visible target-word use; detailed collocation and naturalness need Cloud AI.`; }
    return `**${word.char}**\nPinyin: ${word.pinyin || "—"}\nNghĩa: ${meaning || "Hãy mở thẻ từ điển để xem nghĩa đã lưu."}\nTừ loại: ${word.pos || "—"}\n\n**Ví dụ**\n${exampleZh || `Hãy viết một câu về bản thân với “${word.char}”.`}\n${exampleMeaning ? `Gợi nghĩa: ${exampleMeaning}` : ""}\n\nHãy dùng từ này viết một câu. Offline kiểm tra được việc xuất hiện từ mục tiêu; giải thích kết hợp từ và độ tự nhiên chi tiết cần Cloud AI.`;
  }
  /* AI Tutor only: learner-provided HSK 1–6 document. Never feed this into the daily schedule, Quest manifest or default dictionary. */
  function completeHskSourceResponse(text, language) {
    const library = window.PandaHanTutorHskCompleteLibrary;
    const entry = library?.find?.(text);
    if (!entry) return "";
    const source = library.snippet?.(entry, language);
    if (!source) return "";
    const prompt = language === "zh"
      ? "\n\n练习建议\n先读中文，再核对拼音和词汇；最后用自己的话回答阅读问题。你可以继续问这个主题中的词汇、语法或句子。"
      : language === "en"
        ? "\n\nPractice suggestion\nRead the Chinese first, then check pinyin and vocabulary; finally answer the reading questions in your own words. You can continue by asking about a word, grammar point, or sentence from this topic."
        : "\n\nGợi ý luyện tập\nHãy đọc phần tiếng Trung trước, sau đó đối chiếu pinyin và từ vựng; cuối cùng tự trả lời câu hỏi đọc hiểu. Bạn có thể hỏi tiếp về một từ, mẫu ngữ pháp hoặc câu trong chủ đề này.";
    return `${source}${prompt}`;
  }
  function missionAssignmentResponse(m, language, mistakeCount) {
    const zh = language === "zh";
    const en = language === "en";
    const title = zh ? (m.isRepeat ? `第 ${m.sequenceIndex} 节：继续第 ${m.dayNumber} 天` : `第 ${m.dayNumber} 天学习任务`) : en ? m.sessionLabelEn : m.sessionLabelVi;
    const taskRows = (m.tasks || []).map((task) => {
      const taskTitle = zh ? (task.titleEn || task.titleVi) : en ? task.titleEn : task.titleVi;
      return `${task.order}. ${task.icon || "•"} ${taskTitle} · ${task.minutes || 0} ${zh ? "分钟" : en ? "min" : "phút"}`;
    }).join("\n");
    const carry = m.isRepeat
      ? (zh ? `这是延续课程：已保留 ${m.carriedTaskIds?.length || 0} 项已验证任务；仍需完成 ${m.missingTaskIds?.length || 0} 项。` : en ? `This is a continuation session: ${m.carriedTaskIds?.length || 0} verified task(s) are carried; ${m.missingTaskIds?.length || 0} still need completion.` : `Đây là buổi tiếp tục: đã giữ ${m.carriedTaskIds?.length || 0} nhiệm vụ có evidence; còn ${m.missingTaskIds?.length || 0} nhiệm vụ phải hoàn thành.`)
      : (zh ? "请按下方顺序学习；自由练习不会提前解锁下一天。" : en ? "Follow this order; free practice never unlocks the next day early." : "Hãy làm theo đúng thứ tự dưới đây; học tự do không mở khóa ngày tiếp theo sớm.");
    const gate = zh ? `解锁条件：必做任务必须有真实 evidence，且分数达到 ${m.requiredScore}%；错题仍需复习。` : en ? `Unlock rule: required tasks need real evidence and the score must reach ${m.requiredScore}%; wrong items still require review.` : `Điều kiện mở khóa: nhiệm vụ bắt buộc cần evidence thật và điểm phải đạt ${m.requiredScore}%; câu sai vẫn phải ôn lại.`;
    const mistakes = mistakeCount ? (zh ? `当前有 ${mistakeCount} 个错题待复习。` : en ? `${mistakeCount} wrong item(s) are still queued for redo.` : `Hiện có ${mistakeCount} câu/từ sai đang chờ ôn lại.`) : "";
    const pathUpdate = routeStatusChatText(m, zh ? "zh" : en ? "en" : "vi");
    const action = zh ? "请直接点击 khung kế hoạch中的任务按钮开始。" : en ? "Tap an Open task button in the plan card to start." : "Hãy bấm nút nhiệm vụ trong khung kế hoạch để bắt đầu.";
    return `${title}\n${pathUpdate}\n${zh ? "主题" : en ? "Topic" : "Chủ đề"}: ${m.topic || "—"}\n\n${taskRows}\n\n${carry}\n${gate}${mistakes ? `\n${mistakes}` : ""}\n${action}`;
  }
  function replyTo(text, options = {}) {
    const m = activeMission || mission();
    const q = String(text || "").toLowerCase();
    const language = coachResponseLanguage(text, options.language || "auto");
    const en = language === "en";
    const zh = language === "zh";
    const mistakeCount = window.PandaHanMistakes?.getAllQueue?.().length || window.PandaHanMistakes?.getQueue?.().length || 0;
    const writingRequest = /(viết|write|đoạn văn|paragraph|作文|article)/.test(q);
    if (/(nhiệm vụ|kế hoạch|lộ trình|hôm nay học|học gì|plan|learning path|today.*learn|today.*task|任务|计划|今天.*学|学习路径)/i.test(q)) return missionAssignmentResponse(m, language, mistakeCount);
    const grammarEntry = window.PandaHanGrammarPack?.find?.(text);
    if (grammarEntry) return grammarLessonResponse(grammarEntry, language);
    if (/(ngữ pháp|grammar|语法|cách dùng|dùng.*thế nào|how.*use|giải thích.*mẫu|explain.*pattern|句式)/i.test(q)) return grammarMenuResponse(language);
    const completeSourceAnswer = options.context === "ai-tutor" && !options.selectedStandardTopic ? completeHskSourceResponse(text, language) : "";
    if (completeSourceAnswer) return completeSourceAnswer;
    const vocabularyAnswer = vocabularyTutorResponse(text, language);
    if (vocabularyAnswer) return vocabularyAnswer;
    const hskMatch = q.match(/hsk\s*([1-6])/i);
    const topic = window.PandaHanHskLibrary?.find?.(text);
    if (topic) return hskTopicResponse(topic, language, options.length || "adaptive");
    if (writingRequest || /(topic|chủ đề|theme|作文|主题)/.test(q)) return hskTopicMenu(hskMatch?.[1], language);
    if (writingRequest && hskMatch) {
      const level = Number(hskMatch[1]);
      const models = {
        1: { zh: "我叫安娜。我是学生。我学习汉语。今天我在家看书，也喝茶。我很高兴。", py: "Wǒ jiào Ānnà. Wǒ shì xuéshēng. Wǒ xuéxí Hànyǔ. Jīntiān wǒ zài jiā kàn shū, yě hē chá. Wǒ hěn gāoxìng.", vi: "Tôi tên là Anna. Tôi là học sinh. Tôi học tiếng Trung. Hôm nay tôi ở nhà đọc sách và uống trà. Tôi rất vui.", en: "My name is Anna. I am a student. I study Chinese. Today I read at home and drink tea. I am very happy.", noteVi: "Mẫu HSK1: chủ ngữ + 是; chủ ngữ + động từ; 在 + nơi chốn; 也; 很 + tính từ.", noteEn: "HSK1 patterns: subject + 是; subject + verb; 在 + place; 也; 很 + adjective." },
        2: { zh: "上个周末，我和朋友去学校附近的饭店吃饭。因为天气很好，所以我们走路去。吃完饭以后，我们一起看电影，还聊了很多学习汉语的方法。", py: "Shàng ge zhōumò, wǒ hé péngyou qù xuéxiào fùjìn de fàndiàn chīfàn. Yīnwèi tiānqì hěn hǎo, suǒyǐ wǒmen zǒulù qù. Chī wán fàn yǐhòu, wǒmen yìqǐ kàn diànyǐng, hái liáo le hěn duō xuéxí Hànyǔ de fāngfǎ.", vi: "Cuối tuần trước, tôi và bạn đến nhà hàng gần trường ăn cơm. Vì thời tiết đẹp nên chúng tôi đi bộ. Ăn xong, chúng tôi cùng xem phim và nói nhiều về cách học tiếng Trung.", en: "Last weekend, my friend and I ate at a restaurant near school. Because the weather was good, we walked there. After eating, we watched a film and discussed ways to learn Chinese.", noteVi: "Mẫu HSK2: 因为…所以…; động từ + 完 + tân ngữ; 以后; 一起; 还.", noteEn: "HSK2 patterns: 因为…所以…; verb + 完 + object; 以后; 一起; 还." },
        3: { zh: "为了准备下个月的中文考试，我给自己做了一个学习计划。如果每天能按时复习，我相信成绩会提高。除了背新单词以外，我还把常常说错的句子写下来，请老师帮助我修改。", py: "Wèile zhǔnbèi xià ge yuè de Zhōngwén kǎoshì, wǒ gěi zìjǐ zuò le yí ge xuéxí jìhuà. Rúguǒ měitiān néng ànshí fùxí, wǒ xiāngxìn chéngjì huì tígāo. Chúle bèi xīn dāncí yǐwài, wǒ hái bǎ chángcháng shuō cuò de jùzi xiě xiàlái, qǐng lǎoshī bāngzhù wǒ xiūgǎi.", vi: "Để chuẩn bị cho kỳ thi tiếng Trung tháng sau, tôi lập một kế hoạch học. Nếu có thể ôn đúng giờ mỗi ngày, tôi tin kết quả sẽ tiến bộ. Ngoài việc học từ mới, tôi còn viết lại các câu mình thường nói sai và nhờ giáo viên sửa.", en: "To prepare for next month's Chinese exam, I made a study plan. If I review on time every day, I believe my result will improve. Besides learning new words, I write down sentences I often say incorrectly and ask my teacher to correct them.", noteVi: "Mẫu HSK3: 为了…; 如果…; 除了…以外，还…; 把 + tân ngữ + động từ; 请 + người + động từ.", noteEn: "HSK3 patterns: 为了…; 如果…; 除了…以外，还…; 把 + object + verb; 请 + person + verb." }
      };
      const model = models[level];
      return en ? `HSK ${level} model paragraph\n中文：${model.zh}\nPinyin: ${model.py}\nMeaning: ${model.en}\nGrammar: ${model.noteEn}\n\nTry changing one detail about yourself, then send your version. I can check structure, target words and HSK patterns; semantic naturalness needs the deployed AI Coach or a teacher.` : `Đoạn văn mẫu HSK ${level}\n中文：${model.zh}\nPinyin: ${model.py}\nNghĩa: ${model.vi}\nNgữ pháp: ${model.noteVi}\n\nBạn hãy đổi một chi tiết thành thông tin của mình rồi gửi lại. Mình có thể kiểm tra cấu trúc, từ mục tiêu và mẫu HSK; muốn chấm độ tự nhiên/ngữ nghĩa đầy đủ thì cần AI Coach backend đã deploy hoặc giáo viên.`;
    }
    if (/(rubric|ngữ pháp|grammar|chấm viết|score writing)/.test(q)) return en ? "The Writing rubric is transparent: completeness 20, Chinese punctuation 15, target word 20, HSK grammar pattern 25, and subject–predicate frame 20. This browser score checks observable structure only; it does not pretend to judge meaning or naturalness." : "Rubric Viết/Ngữ pháp có 5 phần: độ đầy đủ câu 20, dấu câu tiếng Trung 15, từ mục tiêu 20, mẫu ngữ pháp HSK 25 và khung chủ ngữ–vị ngữ 20. Điểm trên trình duyệt chỉ kiểm tra cấu trúc có thể xác minh; không giả là đã chấm đúng nghĩa hay độ tự nhiên.";
    if (/sai|làm lại|redo|mistake|ôn lại/.test(q)) return en ? `${mistakeCount ? `You have ${mistakeCount} unresolved wrong item(s).` : "There are no unresolved wrong items."} Start the redo task; a correct retry removes one outstanding mistake.` : `${mistakeCount ? `Hiện có ${mistakeCount} câu/từ sai cần làm lại.` : "Hiện chưa có câu sai tồn đọng."} Hãy mở Ôn lại câu sai; trả lời đúng sẽ gỡ từng lỗi khỏi hàng đợi.`;
    if (/nghe từ|vocab.*listen|từ vựng.*nghe/.test(q)) return en ? `Start with the ${m.adaptivePlan?.introWords?.length || 0} phonetics-linked vocabulary words. Real playback must finish before each next word.` : `Bắt đầu với ${m.adaptivePlan?.introWords?.length || 0} từ mới liên kết Ngữ âm. Phải nghe mẫu thật xong mới sang từ tiếp theo.`;
    if (/nói từ|vocab.*speak|từ vựng.*nói/.test(q)) return en ? `After vocabulary listening, speak the same practice set into the microphone. Recognition attempts are saved separately from the full phonetics rubric.` : "Sau khi nghe từ vựng, hãy nói lại đúng nhóm từ đó vào micro. Lượt nhận diện được lưu riêng, không giả làm điểm rubric Ngữ âm.";
    if (/trắc nghiệm|quiz|multiple/.test(q)) return en ? `Start Multiple choice for ${m.sessionLabelEn}. The set contains only introduced or due/weak words; current redo queue: ${mistakeCount}.` : `Hãy bấm Trắc nghiệm ${m.sessionLabelVi}. Đề chỉ lấy từ đã giới thiệu hoặc đến hạn/yếu; hiện hàng đợi câu sai là ${mistakeCount}.`;
    if (/(sửa câu|sửa.*câu|correct.*sentence|check.*sentence|改.*句|修改.*句|đúng không|correct this)/i.test(q)) return zh ? "请发送一条完整的中文句子。离线 AI Tutor 会先检查可观察的要素：主语、动词、语法标记、标点和目标词。语义、搭配与自然度的完整修改需要已部署的 Cloud AI 或老师。" : en ? "Send one complete Chinese sentence. Offline AI Tutor will first check observable elements: subject, verb, grammar markers, punctuation, and target words. Full meaning, collocation, and naturalness correction needs deployed Cloud AI or a teacher." : "Hãy gửi một câu tiếng Trung hoàn chỉnh. AI Tutor Offline sẽ kiểm tra trước các yếu tố quan sát được: chủ ngữ, động từ, dấu hiệu ngữ pháp, dấu câu và từ mục tiêu. Sửa trọn vẹn nghĩa, kết hợp từ và độ tự nhiên cần Cloud AI đã deploy hoặc giáo viên.";
    if (/sắp xếp|unscramble|xếp câu/.test(q)) return en ? `Use Sentence unscramble next. It uses the same evidence-based practice pool and sends wrong items to redo.` : zh ? "下一步可以做“句子排序”。练习使用同一套基于学习证据的词汇池，答错会进入复习队列。" : "Tiếp theo hãy làm Sắp xếp câu. Bài dùng cùng practice pool theo evidence và tự đưa câu sai vào hàng đợi làm lại.";
    if (/ghép|match|nghĩa/.test(q)) return en ? `Use Match Hanzi · meaning for a short warm-up. It uses only eligible words, not the whole HSK bank.` : `Hãy làm Ghép chữ · nghĩa để khởi động. Bài chỉ lấy từ đủ điều kiện, không lấy toàn bộ kho HSK.`;
    if (/quest|pinyin|thanh điệu|tone/.test(q)) return en ? `Open Pinyin Tone Quest ${m.questStation} for ${m.sessionLabelEn}. Main mode: ${m.questMainMode}. Follow: ${m.questActivityChain}. The score is saved and used with the ${m.requiredScore}% gate.` : `Hãy mở Pinyin Tone Quest ${m.questStation} của ${m.sessionLabelVi}. Chế độ chính: ${m.questMainMode}. Làm theo chuỗi: ${m.questActivityChain}. Điểm sẽ được lưu và dùng cùng ngưỡng ${m.requiredScore}% để xét mở ngày tiếp theo.`;
    if (/nghe|listen|nói|speak|đọc|viết|read|write|srs|ôn/.test(q)) return en ? `Today's workbook tasks are: Listen — ${workbookTaskDescription("listening", m.curriculum, true)} Speak — ${workbookTaskDescription("speaking", m.curriculum, true)} Read/Write — ${workbookTaskDescription("reading_writing", m.curriculum, true)} SRS — ${workbookTaskDescription("srs", m.curriculum, true)}` : `Nhiệm vụ theo file hôm nay gồm: Nghe — ${m.curriculum.listening_task}; Nói — ${m.curriculum.speaking_task}; Đọc/Viết — ${m.curriculum.reading_writing_task}; SRS — ${m.curriculum.srs_review_task}.`;
    if (/viết|write/.test(q)) return en ? "Use Write the meaning after the recognition tasks. Try from memory before revealing the reference answer." : "Hãy làm Viết nghĩa sau các bài nhận diện. Cố nhớ trước rồi mới xem phần đáp án tham khảo.";
    if (/xong|hoàn thành|done|next|tiếp/.test(q)) return en ? `A new day unlocks only after the current registered-day sequence has all verified required tasks and reaches ${m.requiredScore}%. Wrong items remain assigned for redo. If the day is missed, the schedule inserts a repeat extension after midnight.` : `Ngày mới chỉ mở khi ngày hiện tại theo mốc đăng ký đã đủ nhiệm vụ bắt buộc có evidence và đạt ${m.requiredScore}%. Câu sai vẫn được giao làm lại. Nếu bỏ lỡ qua 24:00, hệ thống chèn ngày repeat nối tiếp.`;
    return offlineTutorCapabilityResponse(language);
  }

  async function load() {
    try {
      const [response, fullResponse] = await Promise.all([
        fetch("assets/curriculum_days.json", { cache: "no-store" }),
        fetch("assets/curriculum_excel_full.json", { cache: "no-store" }).catch(() => null)
      ]);
      const data = await response.json();
      const base = Array.isArray(data) ? data : (data.curriculum_days || []);
      let workbookDays = [];
      if (fullResponse && fullResponse.ok) {
        const workbook = await fullResponse.json();
        workbookDays = Array.isArray(workbook) ? workbook : (workbook.days || []);
      }
      const rawByDay = new Map(workbookDays.map((row) => [Number(row["Ngày"]), row]));
      curriculum = base.map((day) => {
        const raw = rawByDay.get(Number(day.day_number));
        if (!raw) return day;
        const weekLabel = raw["Tuần"] || day.week_number;
        const stageLabel = raw["Giai đoạn"] || day.stage;
        const typeLabel = raw["Loại ngày"] || day.day_type;
        return {
          ...day,
          week_label: String(weekLabel),
          stage_label: String(stageLabel),
          day_type_label: String(typeLabel),
          completion_excel: raw["Hoàn thành"] ?? day.completion_marker ?? "-",
          notes_excel: raw["Ghi chú"] ?? day.notes ?? "",
          workbook_row: raw,
          workbook_source: "KeHoach_PandaHan_120Ngay_HSK3_v2_TichHop_PinyinToneQuest.xlsx"
        };
      });
    } catch (error) {
      console.warn("Mission curriculum fallback:", error);
      curriculum = [];
    }
    if (curriculum.length !== 120) console.warn("Mission curriculum expected 120 days, received:", curriculum.length);
    activeMission = null;
    window.dispatchEvent(new CustomEvent("pandahan-mission-ready"));
  }

  function formatTopicForTutor(topicId, requestedLength = "adaptive") {
    const topic = (window.PandaHanHskLibrary?.items || []).find((item) => item.id === String(topicId || ""));
    if (!topic) return null;
    const length = topicLengthProfile(topic.level, requestedLength);
    const paragraph = paragraphForLength(topic, length);
    return { id: topic.id, level: topic.level, length, zh: paragraph.zh, pinyin: paragraph.pinyin, vi: paragraph.vi, en: paragraph.en, topicVi: topic.topicVi, topicEn: topic.topicEn };
  }
  window.PandaHanMission = { load, mission, getCurrent: mission, getTargetVocabulary, startTask, renderCoach, replyTo, getRouteStatusText: (language) => routeStatusChatText(mission(), language || "vi"), detectResponseLanguage: (text, preferred) => coachResponseLanguage(text, preferred || "auto"), topicLengthProfile, formatTopicForTutor, getTopicLibrary: () => window.PandaHanHskLibrary?.items || [], getActiveTask: () => activeTask, parseVocabulary, getCurriculumDay: findCurriculumDay };
  let coachPlanRefreshQueued = false;
  function refreshCoachPlanSoon() {
    if (coachPlanRefreshQueued) return;
    coachPlanRefreshQueued = true;
    const flush = () => {
      coachPlanRefreshQueued = false;
      activeMission = null;
      const area = document.getElementById("chatMessagesArea");
      const host = area?.querySelector("[data-ai-coach-plan-host]");
      if (host) renderCoach(host);
      else if (area?.querySelector("[data-ai-coach-plan]")) renderCoach(area);
    };
    if (typeof window.requestAnimationFrame === "function") window.requestAnimationFrame(flush);
    else window.setTimeout(flush, 0);
  }
  ["pandahan-vocab-phase-updated", "pandahan-schedule-updated", "pandahan-mistake-recorded", "pandahan-mistake-resolved", "pandahan-learning-evaluation", "pandahan-ai-coach-assessment", "pandahan-language-changed"].forEach((eventName) => window.addEventListener(eventName, refreshCoachPlanSoon));
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", load); else load();
})();
