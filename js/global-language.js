/* PandaHán Pro — global Vietnamese/English language layer.
 * Learning data, Chinese text and audio are intentionally left untouched.
 */
(() => {
  "use strict";

  const pairs = [
    ["Hệ thống học tập thông minh & đồng bộ", "Smart learning and sync system"],
    ["hoặc", "or"],
    ["Đăng nhập ngay", "Sign in"],
    ["Mật khẩu", "Password"],
    ["Tiếp tục Offline", "Continue offline"],
    ["Đang xử lý, vui lòng chờ...", "Processing, please wait..."],
    ["Hướng dẫn người mới", "New learner guide"],
    ["Test nhắc nhở", "Test reminder"],
    ["Bật thông báo", "Enable notifications"],
    ["Đến giờ ôn từ vựng rồi!", "It is time to review your vocabulary!"],
    ["Nghe nhắc nhở", "Play reminder"],
    ["Ôn tập ngay", "Review now"],
    ["Streak sắp mất!", "Your streak is at risk!"],
    ["Học ngay!", "Study now!"],
    ["Thoát", "Log out"],
    ["Từ điển", "Dictionary"],
    ["Ôn tập", "Review"],
    ["Luyện tập", "Practice"],
    ["Tiến độ", "Progress"],
    ["Ngữ âm", "Phonics"],
    ["Nhắn tin", "Messages"],
    ["Giáo viên", "Teacher"],
    ["Học liên tiếp", "Study streak"],
    ["Tất cả loại từ", "All parts of speech"],
    ["Tất cả mức độ", "All levels"],
    ["Chưa học", "Not studied"],
    ["Mới học", "New"],
    ["Đang ôn", "Reinforcing"],
    ["Đã nắm", "Familiar"],
    ["Thành thạo", "Mastered"],
    ["Cần ôn", "Due"],
    ["ĐỘNG TỪ", "VERB"],
    ["DANH TỪ", "NOUN"],
    ["TÍNH TỪ", "ADJECTIVE"],
    ["PHÓ TỪ", "ADVERB"],
    ["LIÊN TỪ", "CONJUNCTION"],
    ["GIỚI TỪ", "PREPOSITION"],
    ["TRỢ TỪ", "PARTICLE"],
    ["TRỢ ĐỘNG TỪ", "AUXILIARY VERB"],
    ["ĐẠI TỪ NGHI VẤN", "INTERROGATIVE PRONOUN"],
    ["ĐẠI TỪ CHỈ ĐỊNH", "DEMONSTRATIVE PRONOUN"],
    ["ĐẠI TỪ NHÂN XƯNG", "PERSONAL PRONOUN"],
    ["ĐẠI TỪ", "PRONOUN"],
    ["LƯỢNG TỪ", "MEASURE WORD"],
    ["SỐ TỪ", "NUMBER"],
    ["THÁN TỪ", "INTERJECTION"],
    ["CỤM TỪ/THÀNH NGỮ", "PHRASE/IDIOM"],
    ["Cụm từ/thành ngữ", "Phrase/idiom"],
    ["thành ngữ", "idiom"],
    ["Danh từ", "Noun"],
    ["Động từ", "Verb"],
    ["Tính từ", "Adjective"],
    ["Phó từ", "Adverb"],
    ["Liên từ", "Conjunction"],
    ["Giới từ", "Preposition"],
    ["Trợ từ", "Particle"],
    ["Trợ động từ", "Auxiliary verb"],
    ["Đại từ nghi vấn", "Interrogative pronoun"],
    ["Đại từ chỉ định", "Demonstrative pronoun"],
    ["Đại từ nhân xưng", "Personal pronoun"],
    ["Đại từ", "Pronoun"],
    ["Lượng từ", "Measure word"],
    ["Số từ", "Number"],
    ["Thán từ", "Interjection"],
    ["Cụm từ", "Phrase"],
    ["đã học", "studied"],
    ["Sơ cấp 1", "Elementary 1"],
    ["Sơ cấp 2", "Elementary 2"],
    ["Trung cấp", "Intermediate"],
    ["Quay lại", "Back"],
    ["Xem thêm", "See more"],
    ["CỤM TỪ", "PHRASES"],
    ["CÂU VÍ DỤ", "EXAMPLE SENTENCES"],
    ["MỨC ĐỘ GHI NHỚ", "MEMORY MASTERY"],
    ["Ngày kể từ lần đầu học", "Days since first learned"],
    ["Ngày kể từ lần ôn gần nhất", "Days since last review"],
    ["Tổng số lần đã học lại", "Total review repetitions"],
    ["Ngày ôn", "Review date"],
    ["Khoảng cách", "Gap"],
    ["Điểm", "Grade"],
    ["Chưa có dữ liệu ôn tập", "No review data yet"],
    ["Đánh dấu cần ôn", "Flag for review"],
    ["Thoát", "Exit"],
    ["Hiện đáp án", "Reveal answer"],
    ["Tiếp tục", "Continue"],
    ["Hoàn thành!", "Completed!"],
    ["Nhớ tốt", "Good recall"],
    ["Cần ôn lại", "Needs redo"],
    ["Xem tiến độ", "View progress"],
    ["Xóa", "Clear"],
    ["Kiểm tra", "Check"],
    ["Câu tiếp", "Next question"],
    ["Luyện tập tam ngữ", "Trilingual Practice"],
    ["Chọn cấp độ và dạng bài", "Choose HSK level and exercise type"],
    ["trái nghĩa", "antonym"],
    ["đồng nghĩa", "synonym"],
    ["Sắp xếp hội thoại", "Dialogue reordering"],
    ["Đoạn văn điền từ", "Paragraph cloze"],
    ["Đề HSK3 3.0", "HSK3 3.0 Practice Set"],
    ["Đoạn văn điền từ", "Paragraph cloze"],
    ["Đồng/trái nghĩa", "Synonym/antonym"],
    ["Sắp xếp hội thoại", "Dialogue reordering"],
    ["Luyện nghe và chọn thanh điệu trong không gian Quest offline", "Listen and choose tones in the offline Quest"],
    ["Về luyện tập", "Back to Practice"],
    ["Trợ lý học tiếng Trung hỗ trợ luyện hội thoại, giải thích từ và đề xuất bước học tiếp theo.", "The Chinese learning assistant helps you practise conversations, explain words and suggest your next step."],
    ["AI hỗ trợ · Giáo viên kiểm soát", "AI support · Teacher supervised"],
    ["Trò chuyện trực tiếp Giáo viên - Học viên", "Direct Teacher–Student Messaging"],
    ["Danh sách liên hệ", "Contacts"],
    ["Gửi thông báo cho tất cả học viên", "Notify all students"],
    ["Chọn một liên hệ để bắt đầu trò chuyện", "Select a contact to start chatting"],
    ["Chưa chọn cuộc trò chuyện nào.", "No conversation selected."],
    ["Bảng điều khiển Giáo viên", "Teacher Dashboard"],
    ["Thêm từ vựng mới", "Add new vocabulary"],
    ["Danh sách học viên", "Student List"],
    ["Tiến độ học tập", "Learning Progress"],
    ["Theo dõi hành trình chinh phục HSK 1-3 của bạn", "Track your HSK 1–3 learning journey"],
    ["Từ đã thêm", "Added words"],
    ["Đã nhớ", "Remembered"],
    ["Chưa nhớ", "Not yet remembered"],
    ["Cần ôn ngay", "Due now"],
    ["từ thành thạo", "mastered words"],
    ["văn hóa/chiết tự", "culture/character etymology"],
    ["Ôn tập Kho báu", "Treasure Review"],
    ["Hoạt động học tập", "Learning activity"],
    ["Rubric đánh giá mức độ ghi nhớ", "Memory mastery rubric"],
    ["Lịch sử hoạt động", "Activity history"],
    ["Chứng chỉ đã lưu", "Saved certificates"],
    ["Không có hoạt động ghi nhận", "No recorded activity"],
    ["Chưa có hoạt động nào.", "No activity yet."],
    ["Thông báo chung", "Broadcast"],
    ["Luyện hội thoại", "Conversation practice"],
    ["Chỉ dùng từ vựng HSK1-3 đã học", "Uses only learned HSK1–3 vocabulary"],
    ["đang gõ...", "is typing..."],
    ["Đang tải Ngữ âm Pinyin…", "Loading Pinyin phonetics…"],
    ["Lần đầu cần tải dữ liệu âm thanh và flashcard.", "The first load fetches audio data and flashcards."],
    ["phần đã tải", "parts loaded"],
    ["Không tải được module Ngữ âm.", "Could not load the phonetics module."],
    ["Hãy kiểm tra mạng rồi nhấn Ctrl + F5 để thử lại.", "Check your connection and press Ctrl + F5 to try again."],
    ["Thẻ tiếp theo", "Next card"],
    ["Thẻ trước", "Previous card"],
    ["Bắt đầu", "Start"],
    ["Nộp bài", "Submit"],
    ["Mở buổi học", "Open lesson"],
    ["Hoàn thành buổi trước để mở buổi này", "Complete the previous lesson to unlock this one"],
    ["Hãy hoàn thành buổi học trước để mở buổi này.", "Complete the previous lesson to unlock this one."],
    ["Học nội dung mới", "New lesson"],
    ["Ôn tập & kiểm tra tuần", "Weekly review & test"],
    ["Ôn tập & kiểm tra tháng", "Monthly review & test"],
    ["Giai đoạn", "Phase"],
    ["Ngày", "Day"],
    ["Buổi", "Lesson"],
    ["Từ", "words"],
    ["ngày", "days"],
    ["tháng", "months"],
    ["tuần", "weeks"],
    ["phút", "minutes"],
    ["giây", "seconds"],
    ["Đang tải tin nhắn...", "Loading messages..."],
    ["Chưa có tin nhắn nào. Hãy gửi lời chào!", "No messages yet. Say hello!"],
    ["Lỗi tải tin nhắn (Kiểm tra Firestore Rules).", "Could not load messages (check Firestore Rules)."],
    ["Đang tải danh sách...", "Loading contact list..."],
    ["Chưa có liên hệ nào.", "No contacts yet."],
    ["Chưa có giáo viên nào để nhắn tin.", "No teachers available for messaging."],
    ["Học viên", "Student"],
    ["Đang chat với:", "Chatting with:"],
    ["Vừa xong", "Just now"],
    ["Thông báo chung", "Broadcast"],
    ["Hình ảnh", "Image"],
    ["không tải được ảnh, bấm để mở", "image could not be loaded; click to open"],
    ["Tệp đính kèm", "Attachment"],
    ["File quá lớn", "File too large"],
    ["tối đa", "maximum"],
    ["Không đọc được file.", "Could not read the file."],
    ["Không thể gửi tin nhắn:", "Could not send the message:"],
    ["Bạn có tin nhắn mới từ", "You have a new message from"],
    ["Thành viên", "Member"],
    ["Muốn tra từ hoặc nhờ AI giải thích: chọn một từ trong bài học rồi bấm nút tra từ.", "To look up a word or ask AI for an explanation, select a word in a lesson and click the lookup button."],
    ["Công cụ AI", "AI tools"],
    ["Các chức năng AI", "AI features"],
    ["Các chức năng AI được gom về một vị trí để tránh chồng lấn với tin nhắn giáo viên.", "AI features are grouped in one place to avoid overlapping with teacher messages."],
    ["Luyện hội thoại tiếng Trung với Panda", "Practise Chinese conversations with Panda"],
    ["Mở Chat AI luyện hội thoại", "Open AI conversation chat"],
    ["Hộp chat luyện tiếng Trung theo cấp HSK, ngữ pháp, từ vựng và chủ đề hội thoại.", "Chat box for Chinese practice by HSK level, grammar, vocabulary and conversation topic."],
    ["Nguồn học đã nạp cho AI Chat Box", "Learning sources loaded for AI Chat Box"],
    ["Ngữ liệu dùng cho AI Chat Box", "AI Chat Box learning sources"],
    ["Ngữ pháp", "Grammar"],
    ["Chủ đề", "Topics"],
    ["Gửi thông báo cho tất cả học viên", "Notify all students"],
    ["Tin nhắn sẽ tự động xuất hiện trong khung chat riêng giữa bạn và từng học viên.", "The message will appear automatically in a private chat with each student."],
    ["Nhập nội dung thông báo...", "Enter the notification text..."],
    ["Đính kèm file", "Attach file"],
    ["Hủy", "Cancel"],
    ["Gửi cho tất cả", "Send to all"],
    ["Vui lòng nhập nội dung hoặc đính kèm file.", "Please enter text or attach a file."],
    ["Đang gửi...", "Sending..."],
    ["Không thể gửi thông báo:", "Could not send the notification:"],
    ["Chưa có học viên nào để gửi thông báo.", "No students available for notification."],
    ["Đã gửi thông báo cho", "Notification sent to"],
    ["học viên", "students"],
    ["Nội dung buổi học", "Lesson content"],
    ["NỘI DUNG BUỔI HỌC", "LESSON CONTENT"],
    ["Words sắp học hôm nay", "Words for today"],
    ["sắp học hôm nay", "for today"],
    ["Mở từng chữ để nghe đúng mẫu rồi luyện Flashcard → Game → Quiz", "Open each item to hear the model, then practise with Flashcards → Game → Quiz"],
    ["Lesson hoàn thành", "Lessons completed"],
    ["Lesson đã mở", "Lessons unlocked"],
    ["Tổng sao", "Total stars"],
    ["Lịch sử phát âm", "Pronunciation history"],
    ["thanh điệu", "tones"],
    ["Nghĩa tiếng Việt", "Vietnamese meaning"],
    ["Khẩu hình", "Mouth position"],
    ["Nghe mẫu giáo viên", "Listen to teacher model"],
    ["Play model đơn", "Play single model"],
    ["Check micro", "Check microphone"],
    ["Ghi âm", "Record"],
    ["Dùng mic laptop", "Use laptop mic"],
    ["Tải lại", "Reload"],
    ["Bài tập", "Practice"],
    ["Luyện đọc", "Reading practice"],
    ["Trắc nghiệm", "Quiz"],
    ["Mỗi lần chỉ học một flashcard. Play model, ghi âm, xem điểm rồi chuyển sang thẻ kế tiếp.", "Study one flashcard at a time. Play the model, record yourself, check the score, then move to the next card."],
    ["Phần đã tải", "Parts loaded"],
    ["Reinforcing luyện", "Reinforcing"],
    ["Familiar vững", "Familiar"],
    ["ghi nhớ từ này.", "remember this word."],
    ["Cập nhật lần cuối", "Last updated"],
    ["Tiến độ tổng", "Overall progress"],
    ["Dữ liệu được lấy trực tiếp từ Firebase Firestore.", "Data is read directly from Firebase Firestore."],
    ["rời trang (⏱️) và những hoạt động đã làm trong lượt đó. / Each entry shows the login/leave time (⏱️) plus what you did during that visit.", "Each entry shows the login/leave time (⏱️) plus what you did during that visit."],
    ["Theo dõi từng lần thu, điểm gần nhất và mức tiến bộ theo Pinyin/thanh điệu.", "Track each recording, your latest score, and progress by Pinyin and tone."],
    ["Chưa có lần thu âm nào. Mở một ô Pinyin, bấm Ghi âm rồi xem kết quả ở đây.", "No recordings yet. Open a Pinyin card, press Record, then view the result here."],
    ["Chưa có lần thu âm nào. Mở một ô Pinyin, bấm Record rồi xem kết quả ở đây.", "No recordings yet. Open a Pinyin card, press Record, then view the result here."],
    ["Mở một ô Pinyin, bấm Ghi âm rồi xem kết quả ở đây.", "Open a Pinyin card, press Record, then view the result here."],
  ];
  const exact = new Map(pairs);
  const textOriginals = new WeakMap();
  const attrOriginals = new WeakMap();
  const observedRoots = new WeakSet();
  let mode = localStorage.getItem("pandahan_lang") || "vi";

  function isEnglish() { return mode === "en"; }
  function setMode(next) { mode = next === "en" ? "en" : "vi"; }
  function normalize(value) { return String(value || "").replace(/\s+/g, " ").trim(); }

  function translateValue(value) {
    const original = String(value ?? "");
    const normalized = normalize(original);
    if (!normalized) return original;
    const exactValue = exact.get(normalized);
    if (exactValue) {
      return original.replace(normalized, mode === "en" ? exactValue : normalized);
    }
    const slash = normalized.match(/^(.*?)\s*\/\s*(.*)$/);
    if (slash && (slash[1] || slash[2])) {
      const chosen = mode === "en" ? slash[2] : slash[1];
      return original.replace(normalized, chosen);
    }
    if (mode === "vi") return original;
    let result = original;
    pairs.slice().sort((a, b) => b[0].length - a[0].length).forEach(([vi, en]) => {
      result = result.split(vi).join(en);
    });
    result = result.replace(/(\d+)\s*ngày/g, "$1 days").replace(/(\d+)\s*tuần/g, "$1 weeks").replace(/(\d+)\s*tháng/g, "$1 months");
    return result;
  }

  function applyText(root) {
    if (!root) return;
    const owner = root.nodeType === Node.DOCUMENT_NODE ? root.body : root;
    if (!owner) return;
    const walker = document.createTreeWalker(owner, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (parent.closest?.(".en")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) nodes.push(node);
    nodes.forEach((textNode) => {
      if (!textOriginals.has(textNode)) textOriginals.set(textNode, textNode.nodeValue);
      textNode.nodeValue = translateValue(textOriginals.get(textNode));
    });
  }

  function applyAttributes(root) {
    if (!root?.querySelectorAll) return;
    root.querySelectorAll("[placeholder],[title],[aria-label]").forEach((el) => {
      ["placeholder", "title", "aria-label"].forEach((attr) => {
        if (!el.hasAttribute(attr)) return;
        let originals = attrOriginals.get(el);
        if (!originals) { originals = {}; attrOriginals.set(el, originals); }
        if (!(attr in originals)) originals[attr] = el.getAttribute(attr);
        el.setAttribute(attr, translateValue(originals[attr]));
      });
    });
  }

  function hideEnglishSpans(root) {
    if (!root?.querySelectorAll) return;
    root.querySelectorAll(".en").forEach((el) => {
      el.style.display = "none";
      el.setAttribute("aria-hidden", "true");
    });
  }

  function updateLeading(selector, vi, en) {
    const el = document.querySelector(selector);
    if (!el) return;
    const textNode = [...el.childNodes].find((child) => child.nodeType === Node.TEXT_NODE);
    if (textNode) {
      if (!textOriginals.has(textNode)) textOriginals.set(textNode, vi);
      textNode.nodeValue = isEnglish() ? en : vi;
    }
  }

  function applyFixedLabels() {
    const fixed = [
      ["#searchInput", "🔍 Tìm chữ Hán / pinyin / nghĩa Việt / English...", "🔍 Search Hanzi / Pinyin / Vietnamese meaning / English..."],
      ["#langLabel", "Tiếng Việt", "English"],
      ["#sidebarUserBadge > div:nth-child(2) > div:nth-child(2)", "🌍 中文 · Tiếng Việt", "🌍 中文 · English"],
      ["#openFirstGuideBtn", "Hướng dẫn người mới", "New learner guide"],
      ["#testReminderBtn", "🔊 Test nhắc nhở", "🔊 Test reminder"],
      ["#enableNotifBtn", "🔔 Bật thông báo", "🔔 Enable notifications"],
      ["#studyReminderText", "Đến giờ ôn từ vựng rồi!", "It is time to review your vocabulary!"],
      ["#studyReminderPlayBtn", "🔊 Nghe nhắc nhở", "🔊 Play reminder"],
      ["#studyReminderStartBtn", "▶️ Ôn tập ngay", "▶️ Review now"],
      ["#streakWarningText", "Streak sắp mất!", "Your streak is at risk!"],
      ["#streakWarningStudyBtn", "⚡ Học ngay!", "⚡ Study now!"],
      ["#sidebarLogoutBtnReal", "🚪 Thoát / Log out", "🚪 Log out"],
      ["#detailBack", "← Quay lại / Back", "← Back"],
      ["#dChietuMoreTxt", "Xem thêm", "See more"],
      ["#dReviewBtn", "🎯 Ôn ngay / Review now", "🎯 Review now"],
      ["#dFlagBtn", "➕ Đánh dấu cần ôn / Flag for review", "➕ Flag for review"],
      ["#qExitBtn", "✕ Thoát / Exit", "✕ Exit"],
      ["#fcRevealBtn", "👁️ Hiện đáp án / Reveal", "👁️ Reveal answer"],
      ["#fcContinueBtn", "➡️ Tiếp tục / Continue", "➡️ Continue"],
      ["#fcEndBtn", "📊 Xem tiến độ / View progress", "📊 View progress"],
      ["#uClearBtn", "↺ Xóa / Clear", "↺ Clear"],
      ["#uCheckBtn", "✓ Kiểm tra / Check", "✓ Check"],
      ["#uNextBtn", "Câu tiếp / Next →", "Next question →"],
      ["#range7Btn", "7 ngày", "7 days"],
      ["#range30Btn", "30 ngày", "30 days"],
      ["#hsk1Badge", "149 từ", "149 words"],
      ["#hsk2Badge", "136 từ", "136 words"],
      ["#hsk3Badge", "319 từ", "319 words"],
      ["#pCardAdvanced .p-title", "Đề HSK3 3.0", "HSK3 3.0 Practice Set"],
      ["#pCardAdvanced .p-desc", "trái nghĩa · Sắp xếp hội thoại", "antonym · Dialogue reordering"],
      ["#pCardPinyinQuest .p-title", "Pinyin Tone Quest", "Pinyin Tone Quest"],
      ["#pCardPinyinQuest .p-desc", "Luyện nghe và chọn thanh điệu trong không gian Quest offline", "Listen and choose tones in the offline Quest"],
    ];
    fixed.forEach(([selector, vi, en]) => {
      const el = document.querySelector(selector);
      if (!el) return;
      const value = isEnglish() ? en : vi;
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") el.placeholder = value;
      else if (el.children.length === 0) el.textContent = value;
      else updateLeading(selector, vi, en);
    });

    const nav = {
      browse: ["📚 Từ điển", "📚 Dictionary"],
      review: ["🎯 Ôn tập", "🎯 Review"],
      practice: ["✍️ Luyện tập", "✍️ Practice"],
      dashboard: ["📊 Tiến độ", "📊 Progress"],
      pinyin: ["🎵 Ngữ âm", "🎵 Phonics"],
      chat: ["💬 Nhắn tin", "💬 Messages"],
      ai: ["🤖 AI Teacher", "🤖 AI Tutor"],
      teacher: ["👩‍🏫 Giáo viên", "👩‍🏫 Teacher"],
    };
    Object.entries(nav).forEach(([tab, labels]) => updateLeading(`[data-tab="${tab}"]`, labels[0], labels[1]));
    document.querySelectorAll(".en").forEach((el) => { el.style.display = "none"; el.setAttribute("aria-hidden", "true"); });
    document.querySelectorAll("#posFilter option,#tierFilter option,#practiceLevel option,#pLevelFilter option").forEach((option) => {
      if (!textOriginals.has(option.firstChild)) textOriginals.set(option.firstChild, option.firstChild?.nodeValue || "");
    });
  }

  function apply(root = document) {
    document.documentElement.lang = isEnglish() ? "en" : "vi";
    document.body?.setAttribute("data-language", mode);
    applyText(root);
    applyAttributes(root);
    hideEnglishSpans(root);
    if (root === document) applyFixedLabels();
    try { window.PandaHanFirstTimeGuide?.refreshLanguage?.(); } catch (_) {}
    try { window.PandaHanQuestParts?.setLanguage?.(mode); } catch (_) {}
  }

  function observeShadowRoot(shadow) {
    if (!shadow || observedRoots.has(shadow)) return;
    observedRoots.add(shadow);
    apply(shadow);
    const observer = new MutationObserver(() => {
      window.clearTimeout(shadow.__pandahanI18nTimer);
      shadow.__pandahanI18nTimer = window.setTimeout(() => apply(shadow), 80);
    });
    observer.observe(shadow, { childList: true, subtree: true });
  }

  function notifyQuest(modeValue) {
    try { window.PandaHanQuestParts?.setLanguage?.(modeValue); } catch (_) {}
  }

  window.PandaHanI18n = {
    apply,
    observeShadowRoot,
    isEnglish,
    mode: () => mode,
    t: (vi, en) => isEnglish() ? en : vi,
    messageText: (message, field = "text") => {
      if (!message) return "";
      if (isEnglish()) return message[`${field}_en`] || message[`${field}En`] || message[field] || "";
      return message[`${field}_vi`] || message[field] || "";
    },
    setMode(next) { setMode(next); apply(document); notifyQuest(mode); },
  };

  window.addEventListener("pandahan-language-changed", (event) => {
    setMode(event.detail?.mode || localStorage.getItem("pandahan_lang") || "vi");
    apply(document);
    notifyQuest(mode);
  });
  function observeMountedPhonetics() {
    const host = document.getElementById("pinyin-phonetics-root");
    if (host?.shadowRoot) observeShadowRoot(host.shadowRoot);
  }
  let documentObserver = null;
  let documentTimer = 0;
  function observeDocumentChanges() {
    if (!document.body || documentObserver) return;
    documentObserver = new MutationObserver(() => {
      if (documentTimer) return;
      documentTimer = window.setTimeout(() => {
        documentTimer = 0;
        documentObserver.disconnect();
        apply(document);
        documentObserver.observe(document.body, { childList: true, subtree: true });
      }, 80);
    });
    documentObserver.observe(document.body, { childList: true, subtree: true });
  }
  window.addEventListener("pandahan-phonetics-mounted", observeMountedPhonetics);
  document.addEventListener("DOMContentLoaded", () => {
    apply(document);
    observeMountedPhonetics();
    observeDocumentChanges();
  });
})();
