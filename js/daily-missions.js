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
      instructionVi: "Nghe audio mẫu; hệ thống chỉ ghi nhận khi có lượt phát âm thanh thực tế.",
      instructionEn: "Play the reference audio; only real playback evidence is recorded."
    },
    speaking: {
      titleVi: "Nói", titleEn: "Speaking", icon: "🗣️", minutes: 8,
      instructionVi: "Ghi âm trong Ngữ âm; hệ thống dùng điểm chấm phát âm thật.",
      instructionEn: "Record in Phonetics; the system uses the real pronunciation score."
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
    "vocab-speaking": {
      titleVi: "Nói từ vựng", titleEn: "Speak the vocabulary", icon: "🗣️", minutes: 8,
      instructionVi: "Nghe mẫu rồi nói từng từ vào micro; hệ thống lưu kết quả nhận diện thật.",
      instructionEn: "Play the model and say each word into the microphone; real recognition attempts are saved."
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
    const workbookTypes = [
      ["listening", day.listening_task],
      ["speaking", day.speaking_task],
      ["reading_writing", day.reading_writing_task],
      ["srs", day.srs_review_task],
    ].filter(([, value]) => value && value !== "-").map(([type]) => type);
    const phoneticsTypes = workbookTypes.filter((type) => type === "listening" || type === "speaking");
    const introComplete = !!(vocabPhase?.introCompleted || adaptivePlan?.introCompleted);
    const speakingComplete = !!vocabPhase?.speakingCompleted;
    const gameComplete = !!vocabPhase?.gameCompleted;
    const hasPendingLinkedIntro = hasNewIntro && !introComplete;
    const canOpenVocabSpeaking = introComplete && hasPracticeWords;
    const canOpenGame = canOpenVocabSpeaking && speakingComplete;
    const canOpenVocabWriting = canOpenGame && gameComplete;
    const vocabFollowups = [
      ...(canOpenVocabSpeaking ? ["vocab-speaking"] : []),
      ...(canOpenGame ? ["tone-race", "quest"] : []),
      ...(canOpenVocabWriting ? ["vocab-writing"] : [])
    ];
    const workbookAfterPractice = workbookTypes.filter((type) => !phoneticsTypes.includes(type) && type !== "reading_writing");
    const workbookPrimary = questModeToTask(day.quest_main_mode);
    const allowedAdaptivePractice = canOpenVocabWriting ? adaptivePracticeTypes : [];
    const chainMode = !!(adaptivePlan?.linkedNewWords?.length || adaptivePlan?.introWords?.length || hasNewIntro);
    const preChain = [...phoneticsTypes, ...(hasPendingLinkedIntro ? ["vocab-intro"] : []), ...(canOpenVocabSpeaking ? ["vocab-speaking"] : [])];
    const postChain = [...(canOpenGame ? ["tone-race", "quest"] : []), ...(canOpenVocabWriting ? ["vocab-writing"] : []), ...allowedAdaptivePractice, ...(canOpenVocabWriting && workbookTypes.includes("reading_writing") ? ["reading_writing"] : []), ...workbookAfterPractice, ...(canOpenGame ? [workbookPrimary] : [])];
    const ordered = [...new Set([...(mistakeCount ? ["wrong-review"] : []), ...(chainMode ? [...preChain, ...postChain] : [...phoneticsTypes, ...(hasPendingLinkedIntro ? ["vocab-intro"] : []), ...vocabFollowups, ...allowedAdaptivePractice, "reading_writing", ...workbookAfterPractice, ...(canOpenGame ? ["quest"] : []), workbookPrimary])])];
    return ordered.map((type, index) => {
      const meta = TASK_META[type] || TASK_META.reading_writing;
      const chainWords = adaptivePlan?.linkedNewWords?.length ? adaptivePlan.linkedNewWords : (adaptivePlan?.introWords?.length ? adaptivePlan.introWords : (adaptivePlan?.practiceWords || []));
      const task = { id: `${day.day_number}-${type}-${index}`, type, ...meta, order: index + 1, source: "excel_workbook", lessonId: Number(day.day_number), vocabularyIds: chainWords.map((word) => word.id), vocabularyChars: chainWords.map((word) => word.char) };
      const workbookText = { listening: day.listening_task, speaking: day.speaking_task, reading_writing: day.reading_writing_task, srs: day.srs_review_task }[type];
      if (workbookText && workbookText !== "-") {
        task.instructionVi = workbookText;
        task.instructionEn = `${meta.instructionEn} (Excel task: ${workbookText})`;
      }
      if (type === "quest") {
        task.titleVi = day.quest_main_mode && day.quest_main_mode !== "-" ? `Pinyin Quest · ${day.quest_main_mode}` : task.titleVi;
        task.instructionVi = [day.quest_daily_task, day.quest_activity_chain].filter((value) => value && value !== "-").join(" ");
        task.instructionEn = "Follow the workbook Quest sequence and complete the saved checkpoint.";
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
    const adaptivePlan = window.PandaHanAdaptiveLearning?.buildPlan?.(day, getSchedule()) || null;
    const words = adaptivePlan?.practiceWords || targetVocabulary(day);
    const chainVocabulary = adaptivePlan?.linkedNewWords?.length ? adaptivePlan.linkedNewWords : (adaptivePlan?.introWords?.length ? adaptivePlan.introWords : []);
    const vocabPhase = window.PandaHanVocabularyPhase?.get?.(Number(day.day_number)) || { introCompleted: !!adaptivePlan?.introCompleted, speakingCompleted: false, gameCompleted: false };
    const tasks = buildTasks(day, adaptivePlan, vocabPhase);
    return {
      dayNumber: Number(day.day_number), sequenceIndex: Number(scheduleDay?.sequence_index || day.day_number),
      weekNumber: Number(day.week_number || Math.ceil(Number(day.day_number) / 7)),
      stageCode: day.stage_code, stage: day.stage, dayType: day.day_type, topic: day.topic || "",
      requiredScore: day.day_type === "review" ? Number(day.required_score || 70) : 60, newVocab: words,
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
    activeTask = m.tasks.find((task) => task.type === type) || { type };
    const phase = m.vocabPhase || {};
    if (type === "vocab-speaking" && !phase.introCompleted) { alert(L("Hãy hoàn thành phần nghe giới thiệu từ trước.", "Complete the vocabulary listening introduction first.")); return; }
    if ((type === "tone-race" || type === "quest") && m.chainVocabulary?.length && !phase.speakingCompleted) { alert(L("Hãy hoàn thành lượt nói từng từ trước khi vào game thanh điệu.", "Complete one real speaking attempt for each linked word before the tone game.")); return; }
    if (type === "vocab-writing" && (!phase.speakingCompleted || !phase.gameCompleted)) { alert(L("Hãy hoàn thành nghe → nói → game trước khi viết nghĩa.", "Complete listening → speaking → game before vocabulary writing.")); return; }
    if (["quiz", "match", "unscramble", "write"].includes(type) && m.chainVocabulary?.length && !phase.gameCompleted) { alert(L("Bài này chỉ mở sau game của đúng nhóm từ trong ngày.", "This exercise opens only after the game for the exact day word set.")); return; }
    setFilterForMission(m);
    const level = document.getElementById("practiceHskFilter")?.value || "all";
    if (type === "vocab-intro") window.startAdaptiveVocabularyLesson?.(m.adaptivePlan?.introWords || [], m.dayNumber);
    else if (type === "vocab-speaking") window.startAdaptiveVocabularySpeaking?.(m.chainVocabulary?.length ? m.chainVocabulary : (m.adaptivePlan?.practiceWords || []), m.dayNumber);
    else if (type === "vocab-writing") { window.switchTab?.("practice"); setTimeout(() => window.startWriteGame?.({ words: m.chainVocabulary || [] }), 80); }
    else if (type === "wrong-review") window.startMistakeReview?.();
    else if (type === "quiz") {
      if (typeof window.startQuizForWords === "function") window.startQuizForWords(m.chainVocabulary?.length ? m.chainVocabulary : (m.adaptivePlan?.practiceWords || []));
      else window.startQuizLevel?.(level);
    } else if (type === "unscramble") window.startUnscrambleLevel?.(level, { words: m.chainVocabulary?.length ? m.chainVocabulary : (m.adaptivePlan?.practiceWords || []) });
    else if (type === "match") window.startMatchGame?.({ words: m.chainVocabulary?.length ? m.chainVocabulary : (m.adaptivePlan?.practiceWords || []) });
    else if (type === "write") window.startWriteGame?.();
    else if (type === "tone-race") window.startToneRaceGame?.();
    else if (type === "quest") {
      window.switchTab?.("practice");
      setTimeout(() => document.getElementById("pCardPinyinQuest")?.click(), 80);
    } else if (type === "listening" || type === "speaking") {
      try { localStorage.setItem("pandahan_phonetics_focus", type); } catch (_) {}
      window.switchTab?.("pinyin");
      setTimeout(() => document.getElementById("pinyin-phonetics-root")?.scrollIntoView({ behavior: "smooth", block: "start" }), 160);
    } else if (type === "reading_writing") {
      window.switchTab?.("practice");
      setTimeout(() => window.startWriteGame?.(), 80);
    } else if (type === "srs") {
      window.switchTab?.("reviewIntro");
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

  function requiredTaskLabel(taskId, langEn) {
    const labels = { mistake_review: langEn ? "Redo wrong items" : "Ôn lại câu sai", quest: "Pinyin Tone Quest", listening: langEn ? "Listening" : "Nghe", speaking: langEn ? "Speaking" : "Nói", reading_writing: langEn ? "Reading / Writing" : "Đọc / Viết", srs: "SRS", "vocab-intro": langEn ? "Linked vocabulary" : "Từ vựng liên kết" };
    return labels[taskId] || taskId;
  }
  function renderRequiredChecklist(m, langEn) {
    const c = m.curriculum || {};
    const core = window.PandaHanScheduleCore;
    const required = core?.getMandatoryTaskIds ? [...core.getMandatoryTaskIds(c), ...((window.PandaHanMistakes?.getQueue?.().length || 0) ? ["mistake_review"] : [])] : ["quest", "listening", "speaking", "reading_writing"].filter((id) => id === "quest" || (id === "listening" && c.listening_task && c.listening_task !== "-") || (id === "speaking" && c.speaking_task && c.speaking_task !== "-") || (id === "reading_writing" && c.reading_writing_task && c.reading_writing_task !== "-") || (id === "srs" && c.srs_review_task && c.srs_review_task !== "-"));
    const scheduleDay = currentScheduleDay();
    const completed = scheduleDay?.completed_tasks || {};
    const descriptions = { mistake_review: langEn ? "Redo every unresolved wrong item before the next day can unlock." : "Làm lại toàn bộ câu/từ sai còn tồn đọng trước khi mở ngày mới.", quest: langEn ? "The Quest result is recorded automatically after the real Quest result." : "Kết quả được ghi tự động sau khi Quest trả kết quả thật.", listening: c.listening_task, speaking: c.speaking_task, reading_writing: c.reading_writing_task, srs: c.srs_review_task };
    const launchType = { mistake_review: "wrong-review", quest: "quest", listening: "listening", speaking: "speaking", reading_writing: "reading_writing", srs: "srs" };
    const rows = required.map((id) => {
      const done = !!completed[id];
      const action = done ? `<small style="color:#15803d;font-weight:800;white-space:nowrap;">${langEn ? "verified" : "đã xác minh"}</small>` : `<button type="button" data-mission-task="${launchType[id] || id}" style="border:1px solid #c084fc;background:#fff;border-radius:7px;padding:4px 7px;color:#7e22ce;font-size:10.5px;font-weight:800;white-space:nowrap;">${langEn ? "Open task" : "Mở bài"}</button>`;
      return `<div style="display:flex;align-items:flex-start;gap:8px;padding:7px 0;border-top:1px solid #f1e8f5;"><span style="font-size:16px;">${done ? "✅" : "⬜"}</span><span style="flex:1;min-width:0;"><b>${esc(requiredTaskLabel(id, langEn))}</b><br><small style="color:#64748b;line-height:1.4;">${esc(descriptions[id] || "")}</small></span>${action}</div>`;
    }).join("");
    return `<div style="margin-top:10px;padding:9px 10px;border:1px solid #e9d5ff;border-radius:11px;background:#fff;"><b>${langEn ? "Required before next day unlock" : "Bắt buộc trước khi mở ngày tiếp theo"}</b><div style="font-size:11px;color:#64748b;margin-top:3px;">${langEn ? "Only verified activity and real scores count; there is no manual completion button." : "Chỉ hoạt động đã xác minh và điểm thật mới được tính; không có nút xác nhận thủ công."}</div>${rows}</div>`;
  }

  function renderCoach(container, compact = false) {
    if (!container) return;
    const m = mission();
    const c = m.curriculum;
    const adaptive = m.adaptivePlan;
    const langEn = window.LANG_MODE === "en";
    const stageLabel = langEn ? (m.stageCode === "stage_0" ? "Pinyin Bootcamp" : m.stageCode === "stage_1" ? "HSK 1 foundation" : m.stageCode === "stage_2" ? "HSK 2 development" : "HSK 3 communication") : (m.stage || m.stageCode);
    const phase = m.vocabPhase || {};
    const taskRows = m.tasks.map((task) => {
      const locked = (task.type === "vocab-speaking" && !phase.introCompleted) || ((task.type === "tone-race" || task.type === "quest") && m.chainVocabulary?.length && !phase.speakingCompleted) || (task.type === "vocab-writing" && (!phase.speakingCompleted || !phase.gameCompleted)) || (["quiz", "match", "unscramble", "write"].includes(task.type) && m.chainVocabulary?.length && !phase.gameCompleted);
      const lockText = langEn ? " · complete the previous vocabulary phase first" : " · hoàn thành bước từ vựng trước trước";
      return `<button type="button" data-mission-task="${task.type}" ${locked ? "disabled aria-disabled=\"true\"" : ""} style="display:flex;align-items:center;gap:8px;width:100%;text-align:left;border:1px solid #f3d5e5;border-radius:11px;background:${locked ? "#f8fafc" : "#fff"};padding:8px 10px;margin-top:6px;cursor:${locked ? "not-allowed" : "pointer"};opacity:${locked ? ".58" : "1"};"><span style="font-size:20px;">${locked ? "🔒" : task.icon}</span><span style="flex:1;min-width:0;"><b>${langEn ? task.titleEn : task.titleVi}</b><br><small style="color:#64748b;overflow-wrap:anywhere;">${esc((langEn ? task.instructionEn : task.instructionVi) + (locked ? lockText : ""))}</small></span><small style="color:#a855f7;font-weight:800;white-space:nowrap;">${task.minutes} min</small></button>`;
    }).join("");
    const workbookPlan = "";
    const questPlan = "";
    const mistakeCount = window.PandaHanMistakes?.getQueue?.().length || 0;
    const adaptiveNote = adaptive ? `<div style="font-size:11.5px;color:#475569;margin-top:7px;padding:8px 9px;border-radius:9px;background:#fff;border:1px dashed #c4b5fd;">${langEn ? `Adaptive source: ${adaptive.reviewWords.length} due/weak review words${adaptive.introCompleted ? ` + ${adaptive.newWords.length} introduced words` : adaptive.vocabIntroReady ? ` · ${adaptive.introWords.length} phonetics-linked new words ready` : " · finish phonetics before new vocabulary"}${mistakeCount ? ` · ${mistakeCount} wrong items to redo` : ""}.` : `Nguồn thích ứng: ${adaptive.reviewWords.length} từ đến hạn/yếu cần ôn${adaptive.introCompleted ? ` + ${adaptive.newWords.length} từ mới đã học` : adaptive.vocabIntroReady ? ` · sẵn sàng ${adaptive.introWords.length} từ mới liên kết Ngữ âm` : " · hoàn thành Ngữ âm trước khi học từ mới"}${mistakeCount ? ` · ${mistakeCount} câu sai cần làm lại` : ""}.`}</div>` : "";
    const excelDetails = [
      c.grammar_focus ? `${langEn ? "Grammar/reference" : "Ngữ pháp/tài liệu"}: ${c.grammar_focus}` : "",
      c.notes ? `${langEn ? "Note" : "Ghi chú"}: ${c.notes}` : "",
      m.questStation !== "-" ? `${langEn ? "Quest station" : "Trạm Quest"}: ${m.questStation}` : "",
      m.questCompletionCondition !== "-" ? `${langEn ? "Stamp condition" : "Điều kiện đóng dấu"}: ${m.questCompletionCondition}` : "",
      m.questCheckpointQuestion !== "-" ? `${langEn ? "Checkpoint" : "Câu hỏi chốt"}: ${m.questCheckpointQuestion}` : ""
    ].filter(Boolean);
    const excelNote = excelDetails.length ? `<details style="margin-top:8px;background:#fff;border:1px solid #e2e8f0;border-radius:9px;padding:7px 9px;font-size:11px;color:#475569;"><summary style="cursor:pointer;font-weight:800;color:#7e22ce;">${langEn ? "Show full Excel day details" : "Xem đầy đủ nội dung ngày từ Excel"}</summary><div style="margin-top:6px;line-height:1.5;overflow-wrap:anywhere;">${excelDetails.map(esc).join("<br>")}</div></details>` : "";
    container.innerHTML = `<div data-ai-coach-plan="true" style="border:1px solid #f3d5e5;border-radius:14px;background:linear-gradient(135deg,#fff7fb,#f5f3ff);padding:12px;"><div style="font-size:11px;color:#a855f7;font-weight:800;text-transform:uppercase;">${langEn ? "AI learning plan · Excel + real learner data" : "Kế hoạch học với AI · Excel + dữ liệu học thật"}</div><h3 style="margin:3px 0;font-size:16px;">${langEn ? `Day ${m.dayNumber} · Week ${m.weekNumber} · ${stageLabel}` : `Ngày ${m.dayNumber} · Tuần ${m.weekNumber} · ${stageLabel}`}</h3><div style="font-weight:700;overflow-wrap:anywhere;">${esc(c.topic)}</div><div style="font-size:11.5px;color:#64748b;margin-top:5px;">${langEn ? `Target score: ${m.requiredScore}% · XP: ${m.xpTarget} · Estimated time: ${m.totalMinutes} minutes` : `Mục tiêu: ${m.requiredScore}% · XP: ${m.xpTarget} · Thời lượng dự kiến: ${m.totalMinutes} phút`}</div>${adaptiveNote}${excelNote}<div style="margin-top:9px;">${taskRows}</div>${renderRequiredChecklist(m, langEn)}</div>`;
    container.querySelectorAll("[data-mission-task]").forEach((button) => button.addEventListener("click", () => startTask(button.dataset.missionTask)));
  }

  function replyTo(text) {
    const m = activeMission || mission();
    const q = String(text || "").toLowerCase();
    const en = window.LANG_MODE === "en";
    const mistakeCount = window.PandaHanMistakes?.getQueue?.().length || 0;
    if (/sai|làm lại|redo|mistake|ôn lại/.test(q)) return en ? `${mistakeCount ? `You have ${mistakeCount} unresolved wrong item(s).` : "There are no unresolved wrong items."} Start the redo task; a correct retry removes one outstanding mistake.` : `${mistakeCount ? `Hiện có ${mistakeCount} câu/từ sai cần làm lại.` : "Hiện chưa có câu sai tồn đọng."} Hãy mở Ôn lại câu sai; trả lời đúng sẽ gỡ từng lỗi khỏi hàng đợi.`;
    if (/nghe từ|vocab.*listen|từ vựng.*nghe/.test(q)) return en ? `Start with the ${m.adaptivePlan?.introWords?.length || 0} phonetics-linked vocabulary words. Real playback must finish before each next word.` : `Bắt đầu với ${m.adaptivePlan?.introWords?.length || 0} từ mới liên kết Ngữ âm. Phải nghe mẫu thật xong mới sang từ tiếp theo.`;
    if (/nói từ|vocab.*speak|từ vựng.*nói/.test(q)) return en ? `After vocabulary listening, speak the same practice set into the microphone. Recognition attempts are saved separately from the full phonetics rubric.` : "Sau khi nghe từ vựng, hãy nói lại đúng nhóm từ đó vào micro. Lượt nhận diện được lưu riêng, không giả làm điểm rubric Ngữ âm.";
    if (/trắc nghiệm|quiz|multiple/.test(q)) return en ? `Start Multiple choice for Day ${m.dayNumber}. The set contains only introduced or due/weak words; current redo queue: ${mistakeCount}.` : `Hãy bấm Trắc nghiệm ngày ${m.dayNumber}. Đề chỉ lấy từ đã giới thiệu hoặc đến hạn/yếu; hiện hàng đợi câu sai là ${mistakeCount}.`;
    if (/sắp xếp|unscramble|câu/.test(q)) return en ? `Use Sentence unscramble next. It uses the same evidence-based practice pool and sends wrong items to redo.` : "Tiếp theo hãy làm Sắp xếp câu. Bài dùng cùng practice pool theo evidence và tự đưa câu sai vào hàng đợi làm lại.";
    if (/ghép|match|nghĩa/.test(q)) return en ? `Use Match Hanzi · meaning for a short warm-up. It uses only eligible words, not the whole HSK bank.` : `Hãy làm Ghép chữ · nghĩa để khởi động. Bài chỉ lấy từ đủ điều kiện, không lấy toàn bộ kho HSK.`;
    if (/quest|pinyin|thanh điệu|tone/.test(q)) return en ? `Open Pinyin Tone Quest ${m.questStation} for Day ${m.dayNumber}. Main mode: ${m.questMainMode}. Follow: ${m.questActivityChain}. The score is saved and used with the ${m.requiredScore}% gate.` : `Hãy mở Pinyin Tone Quest ${m.questStation} của ngày ${m.dayNumber}. Chế độ chính: ${m.questMainMode}. Làm theo chuỗi: ${m.questActivityChain}. Điểm sẽ được lưu và dùng cùng ngưỡng ${m.requiredScore}% để xét mở ngày tiếp theo.`;
    if (/nghe|listen|nói|speak|đọc|viết|read|write|srs|ôn/.test(q)) return en ? `Today's workbook tasks are: Listen — ${m.curriculum.listening_task}; Speak — ${m.curriculum.speaking_task}; Read/Write — ${m.curriculum.reading_writing_task}; SRS — ${m.curriculum.srs_review_task}.` : `Nhiệm vụ theo file hôm nay gồm: Nghe — ${m.curriculum.listening_task}; Nói — ${m.curriculum.speaking_task}; Đọc/Viết — ${m.curriculum.reading_writing_task}; SRS — ${m.curriculum.srs_review_task}.`;
    if (/viết|write/.test(q)) return en ? "Use Write the meaning after the recognition tasks. Try from memory before revealing the reference answer." : "Hãy làm Viết nghĩa sau các bài nhận diện. Cố nhớ trước rồi mới xem phần đáp án tham khảo.";
    if (/xong|hoàn thành|done|next|tiếp/.test(q)) return en ? `A new day unlocks only after the current registered-day sequence has all verified required tasks and reaches ${m.requiredScore}%. Wrong items remain assigned for redo. If the day is missed, the schedule inserts a repeat extension after midnight.` : `Ngày mới chỉ mở khi ngày hiện tại theo mốc đăng ký đã đủ nhiệm vụ bắt buộc có evidence và đạt ${m.requiredScore}%. Câu sai vẫn được giao làm lại. Nếu bỏ lỡ qua 24:00, hệ thống chèn ngày repeat nối tiếp.`;
    return en ? `Today's plan is Day ${m.dayNumber}: ${m.topic}. Start with ${m.tasks[0]?.titleEn || "the first task"}, then continue in order. Ask me about any task.` : `Kế hoạch hôm nay là ngày ${m.dayNumber}: ${m.topic}. Hãy bắt đầu với ${m.tasks[0]?.titleVi || "bài đầu tiên"}, rồi làm lần lượt. Bạn có thể hỏi tôi về từng bài.`;
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

  window.PandaHanMission = { load, mission, getCurrent: mission, getTargetVocabulary, startTask, renderCoach, replyTo, getActiveTask: () => activeTask, parseVocabulary, getCurriculumDay: findCurriculumDay };
  window.addEventListener("pandahan-vocab-phase-updated", () => {
    activeMission = null;
    const area = document.getElementById("chatMessagesArea");
    if (area?.querySelector("[data-ai-coach-plan]")) renderCoach(area);
  });
  window.addEventListener("pandahan-schedule-updated", () => {
    activeMission = null;
    const area = document.getElementById("chatMessagesArea");
    if (area?.querySelector("[data-ai-coach-plan]")) renderCoach(area);
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", load); else load();
})();
