/* PandaHan Pro — Quest split-parts loader + adaptive progress gate. */
(() => {
  "use strict";

  const PARTS = [
    "assets/pinyin-tone-quest.part-00",
    "assets/pinyin-tone-quest.part-01",
    "assets/pinyin-tone-quest.part-02",
  ];
  let loadPromise = null;
  let objectUrl = null;
  let activeFrameWindow = null;
  let lastQuestResultKey = null;

  function frame() { return document.getElementById("pinyinToneQuestFrame"); }
  function setStatus(message, isError = false) {
    const target = frame();
    if (!target) return;
    target.title = message;
    target.style.opacity = isError ? "0.35" : "0.7";
  }

  async function getScheduleForQuest() {
    try {
      const api = window.PandaHanSchedule;
      const schedule = api?.getScheduleAsync ? await api.getScheduleAsync() : api?.getSchedule?.();
      const days = Array.isArray(schedule?.days) ? schedule.days : [];
      const unlocked = days.filter((d) => d.status === "unlocked" || d.status === "completed")
        .map((d) => Number(d.day_number)).filter((n) => n > 0 && n <= 120);
      const completed = days.filter((d) => d.status === "completed")
        .map((d) => Number(d.day_number)).filter((n) => n > 0 && n <= 120);
      return { unlocked: Array.from(new Set(unlocked.length ? unlocked : [1])), completed: Array.from(new Set(completed)), schedule: schedule || null };
    } catch (error) {
      console.warn("Quest schedule gate fallback:", error.message || error);
      return { unlocked: [1], completed: [], schedule: null };
    }
  }

  function sendGateToQuest(gate) {
    if (activeFrameWindow) activeFrameWindow.postMessage({
      type: "PANDAHAN_QUEST_GATE",
      unlockedDays: gate.unlocked,
      completedDays: gate.completed,
    }, "*");
  }

  function sendLanguageToQuest(mode) {
    if (activeFrameWindow) activeFrameWindow.postMessage({ type: "PANDAHAN_QUEST_LANGUAGE", mode: mode === "en" ? "en" : "vi" }, "*");
  }

  async function refreshQuestGate() { sendGateToQuest(await getScheduleForQuest()); }

  async function handleQuestMessage(event) {
    const target = frame();
    if (!target || event.source !== target.contentWindow) return;
    const data = event.data || {};
      if (data.type === "PANDAHAN_QUEST_READY") {
        activeFrameWindow = target.contentWindow;
        sendLanguageToQuest(window.PandaHanI18n?.mode?.() || localStorage.getItem("pandahan_lang") || "vi");
        await refreshQuestGate();
        return;
      }
    if (data.type !== "PANDAHAN_QUEST_DAY_RESULT") return;
    const day = Number(data.day);
    const score = Math.max(0, Math.min(100, Number(data.scorePercent)));
    if (!day || !Number.isFinite(score) || lastQuestResultKey === `${day}:${score}:${data.resultToken || ""}`) return;
    lastQuestResultKey = `${day}:${score}:${data.resultToken || ""}`;
    try {
      if (window.PandaHanSchedule?.submitDayResult) {
        await window.PandaHanSchedule.submitDayResult(day, score);
        await refreshQuestGate();
      }
    } catch (error) {
      console.warn("Quest result was not committed to schedule:", error.message || error);
    }
  }

  const GATE_SCRIPT = `<script>(function(){
    var gate={unlockedDays:[1],completedDays:[]};
    var resultSent={};
    var questLang='vi';
    function allowed(day){return gate.unlockedDays.indexOf(day)>=0||gate.completedDays.indexOf(day)>=0;}
    function apply(){
      document.querySelectorAll('[data-day]').forEach(function(btn){
        var day=Number(btn.getAttribute('data-day')); var ok=allowed(day);
        btn.disabled=!ok; btn.setAttribute('aria-disabled',String(!ok));
        btn.classList.toggle('ph-locked',!ok); btn.title=ok?'Mở buổi học':'Hoàn thành buổi trước để mở buổi này';
      });
      var start=document.getElementById('oh-start-day'); if(start){var ok=allowed(1);start.disabled=!ok;start.setAttribute('aria-disabled',String(!ok));}
      translateUi(questLang);
    }
    function reportResult(){
      var exam=document.getElementById('exam'); if(!exam||!exam.classList.contains('visible'))return;
      var title=exam.innerText||''; var m=title.match(/(?:Hoàn thành Ngày|Completed Day)\\s+(\\d+)/i);if(!m)return;
      var day=Number(m[1]); var p=title.match(/(\\d+)\\s*%/); if(!p)return;
      var token=String(day)+':'+String(p[1]); if(resultSent[token])return; resultSent[token]=1;
      parent.postMessage({type:'PANDAHAN_QUEST_DAY_RESULT',day:day,scorePercent:Number(p[1]),resultToken:token},'*');
    }
    window.addEventListener('message',function(e){var d=e.data||{};if(d.type==='PANDAHAN_QUEST_LANGUAGE'){questLang=d.mode==='en'?'en':'vi';document.documentElement.setAttribute('data-pandahan-lang',questLang);translateUi(questLang);return;}if(d.type!=='PANDAHAN_QUEST_GATE')return;gate.unlockedDays=(d.unlockedDays||[1]).map(Number);gate.completedDays=(d.completedDays||[]).map(Number);apply();});
    function translateUi(mode){
      var map={
        'Mỗi ngày một gốc, nghe · nói · đọc · viết.':'One root topic each day: listen · speak · read · write.',
        'Nguyên nội dung, đáp án và audio MP3 từ gói bạn cung cấp. Mỗi ngày giữ đúng số mục của đề nguồn; giao diện dùng chìm để hỗ trợ người học.':'Original content, answers, and MP3 audio from your package. Each day keeps the exact source-set item count; the interface uses a guided layout to support learners.',
        'Mỗi ngày một gốc':'One root topic each day', 'Vào Đề':'Start', 'Ôn 0 câu sai':'Review 0 missed items', '20 mục':'20 items', 'mục':'items',
        'Bắt đầu một ngày học, mọi lỗi sẽ tự vào ô ôn.':'Start a study day and all missed items will be added to review.',
        'Start một ngày học, mọi lỗi sẽ tự vào ô ôn.':'Start a study day and all missed items will be added to review.', 'Chưa có câu sai nào':'No missed items yet', 'Đề nguồn':'Source set',
        'Hành trình đề nguồn':'Source-set journey', 'Bộ đề nguồn 120 ngày':'120-day source-set programme', 'ngày đã hoàn thành · chọn tự do':'days completed · choose freely',
        'Bật nhạc nền':'Turn on background music', 'Chọn đề nguồn theo ngày':'Choose the source set by day',
        '120 đề gốc, đủ nghe · nói · đọc · viết.':'120 source sets with listening · speaking · reading · writing.',
        'Mỗi ngày có đề nguồn đầy đủ: nghe · đọc · viết · nói.':'Each day includes a complete source set: listen · read · write · speak.',
        'THỐNG KÊ LỖI CẦN ÔN':'MISSED-ITEM REVIEW SUMMARY', 'Chưa có câu sai nào':'No missed items yet',
        'Start một ngày học, mọi lỗi sẽ tự vào ô ôn.':'Start a study day and all missed items will be added to review.',
        'Xem thống kê chi tiết':'View detailed statistics', 'đề nguồn · nghe · nói · đọc · viết':'source set · listen · speak · read · write',
        'Giai đoạn 0 - Ngữ âm nền tảng (Pinyin Bootcamp)':'Phase 0 - Phonics foundation (Pinyin Bootcamp)',
        'Học nội dung mới':'Learn new content', 'Nghe mẫu phát âm chuẩn, lặp lại 20 lần/âm':'Listen to the standard pronunciation and repeat 20 times per sound',
        'Ghi âm bản thân đọc, so sánh với audio mẫu':'Record yourself reading and compare with the model audio',
        'Luyện đọc rời từng thanh trên 6 nguyên âm, ghi âm so sánh mẫu':'Practise each tone on six vowels and compare your recording with the model',
        'Phân biệt cặp bật hơi/không bật hơi (b-p, d-t)':'Distinguish aspirated and unaspirated pairs (b-p, d-t)',
        'TRỌNG ĐIỂM: người Việt hay đọc sai vì tiếng Việt không có âm uốn lưỡi':'KEY POINT: Vietnamese learners often mispronounce this because Vietnamese has no retroflex sounds',
        'Luyện phân biệt bằng cặp từ tối thiểu, ghi âm so sánh':'Practise the contrast with minimal pairs and compare recordings',
        'Nghe lại toàn bộ audio trong tuần, làm bài test nghe':'Replay the week’s audio and take the listening test',
        'Thi nói: trả lời 8-10 câu hỏi tổng hợp chủ đề tuần':'Speaking test: answer 8–10 questions covering the week’s topic',
        'Làm bài test viết + đọc hiểu tổng hợp tuần':'Take the weekly writing and reading-comprehension test',
        'Ôn TOÀN BỘ từ đến hạn trên PandaHán Pro (mục Flashcard SRS)':'Review ALL due words on PandaHán Pro (SRS Flashcards)',
        'Học quy tắc viết tắt pinyin':'Learn Pinyin abbreviation rules', '[PINYIN] Tổng ôn ngữ âm + thi thử đọc':'[PINYIN] Phonics review + reading mock test',
        'Thi đọc 60 âm tiết bất kỳ, đạt >=90% mới sang từ vựng đại trà':'Read 60 random syllables; score at least 90% before moving to general vocabulary',
        'Giai đoạn 1 - Bậc 1 (505/500 từ - ĐÃ ĐỦ, nguồn PDF chính thức)':'Phase 1 - Level 1 (505/500 words - COMPLETE, official PDF source)',
        'Đọc phần Chiết tự + Cụm từ + Ví dụ trong tài liệu, viết lại 3 câu mới':'Read the character analysis, phrases, and examples; write three new sentences',
        'Nhập/ôn từ mới trên PandaHán Pro (mục Thêm từ vựng nếu chưa có) + Flashcard SRS':'Add/review new words on PandaHán Pro (use Add vocabulary if needed) + SRS Flashcards',
        'Luyện nghe theo dạng đề HSK đúng trình độ hiện tại':'Practise listening with HSK-format tests at your current level',
        'Luyện phản xạ với bạn học':'Practise conversational reflexes with a study partner', 'Shadowing theo audio mẫu, ghi âm và tự nghe lại':'Shadow the model audio, record yourself, and listen back',
        'Giai đoạn 2 - Bậc 2 (868 từ - ĐÃ ĐỦ, nguồn PDF chính thức)':'Phase 2 - Level 2 (868 words - COMPLETE, official PDF source)',
        'Giai đoạn 3 - Bậc 3 (280/973 từ: 18 chủ đề PandaHán, còn thiếu)':'Phase 3 - Level 3 (280/973 words: 18 PandaHán topics, in progress)',
        'Học Mục tiêu giao tiếp + Từ vựng 1-5/10 + Mẫu câu 1-3':'Study Communication Goals + Vocabulary 1–5/10 + Sentence Patterns 1–3',
        'Nghe mẫu câu 1-3 của chủ đề, luyện đọc theo':'Listen to sentence patterns 1–3 for the topic and read along',
        'Luyện nói mẫu câu 1-3 (ghi âm, tự sửa)':'Practise speaking patterns 1–3 (record and self-correct)',
        'Nghe/đọc Hội thoại mẫu, chép lại 3 câu':'Listen to/read the model dialogue and transcribe three sentences',
        'Nhiệm vụ thực hành: đóng vai / viết đoạn văn theo gợi ý trong tài liệu':'Practice task: role-play or write a paragraph using the prompts',
        'Nói theo rubric':'Speak using the rubric', 'Săn tín hiệu nghe':'Listening Signal Hunt', 'Nghĩa nhanh':'Quick Meaning',
        'Boss nghe tuần':'Weekly Listening Boss', 'Boss nói tuần':'Weekly Speaking Boss', 'Boss đọc tuần':'Weekly Reading Boss',
        'Boss viết tuần':'Weekly Writing Boss', 'Boss ôn tập':'Weekly Review Boss',
        'Đúng/tổng số câu × 100; bài viết theo rubric grammar catalog':'Correct answers / total × 100; writing is graded with the grammar rubric catalog',
        'HSK1: nghe một Hán tự, chọn pinyin':'HSK1: hear one Hanzi and choose the Pinyin', 'Luyện nghe Hán tự chọn Pinyin':'Listen to Hanzi and choose the Pinyin',
        'Đúng rồi!':'That’s right!', 'Đúng vì':'Correct because', 'nội dung nguồn xác nhận thông tin này.':'the source content confirms this information.',
        'Không phù hợp vì đoạn có một đáp án khớp rõ.':'Not suitable because the passage clearly matches another answer.',
        'Chưa phù hợp vì nguồn không nêu':'Not suitable because the source does not state', 'Nội dung nguồn':'Source content',
        'đáp án mở ngay khi đoạn nguồn kết thúc.':'answers unlock when the source segment ends.',
        'Audio nguồn phát trọn script câu nghe; đáp án mở ngay khi đoạn nguồn kết thúc.':'The source audio plays the full listening script; answers unlock when the source segment ends.',
        'Luyện nghe Hán tự chọn Pinyin':'Listen to Hanzi and choose the Pinyin', 'Hãy hoàn thành buổi học trước để mở buổi này.':'Complete the previous lesson to unlock this one.',
        'Bắt đầu':'Start', 'Tiếp tục':'Continue', 'Quay lại':'Back', 'Nộp bài':'Submit', 'Hoàn thành':'Completed',
        'Điểm':'Score', 'Ngày':'Day', 'Tuần':'Week', 'Tháng':'Month', 'Mở buổi học':'Open lesson',
        'Hoàn thành buổi trước để mở buổi này':'Complete the previous lesson to unlock this one', 'Đang tải':'Loading',
        'Kết quả':'Results', 'Thử lại':'Try again', 'Câu hỏi':'Question', 'Đáp án đúng':'Correct answer',
        'Phương án nhiễu cần loại':'Distractors to eliminate', 'Điểm cần đạt':'Target score', 'Gợi ý':'Hint',
        'Giải thích':'Explanation', 'Đúng':'Correct', 'Sai':'Incorrect', 'Ghi âm':'Record', 'Đang phát':'Playing...',
        'Nội dung buổi học':'Lesson content', 'Từ vựng hôm nay':'Words for today', 'Mở khóa':'Unlock', 'Đã mở':'Unlocked',
        'Ngày đã hoàn thành':'Completed days', 'Lộ trình 120 ngày':'120-day roadmap', 'Xem chi tiết':'View details',
        'Thống kê':'Statistics', 'Quay về':'Back to roadmap', 'Học':'Study', 'Đọc':'Read', 'Viết':'Write', 'Nghe':'Listen', 'Nói':'Speak'
      };
      var keys=Object.keys(map).sort(function(a,b){return b.length-a.length;});
      var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);var nodes=[],n;while(n=walker.nextNode())nodes.push(n);
      nodes.forEach(function(t){if(!t.__phOrig)t.__phOrig=t.nodeValue;var s=t.__phOrig;if(mode==='en')keys.forEach(function(v){if(v.length<=14&&!/[\s·/()[\]—+]/.test(v)){if(s.trim()===v)s=s.replace(v,map[v]);}else{s=s.split(v).join(map[v]);}});t.nodeValue=s;});
      document.querySelectorAll('button,[title],[aria-label]').forEach(function(el){['title','aria-label'].forEach(function(attr){var raw=el.getAttribute(attr);if(!raw)return;if(!el.__phAttrs)el.__phAttrs={};if(!el.__phAttrs[attr])el.__phAttrs[attr]=raw;var value=el.__phAttrs[attr];if(mode==='en')keys.forEach(function(v){if(v.length<=14&&!/[\s·/()[\]—+]/.test(v)){if(value.trim()===v)value=value.replace(v,map[v]);}else{value=value.split(v).join(map[v]);}});el.setAttribute(attr,value);});});
    }
    document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-day]');if(b&&b.disabled){e.preventDefault();e.stopImmediatePropagation();alert('Hãy hoàn thành buổi học trước để mở buổi này.');}},true);
    var observer=new MutationObserver(function(){apply();reportResult();}); observer.observe(document.documentElement,{subtree:true,childList:true});
    setInterval(reportResult,700);
    var style=document.createElement('style');style.textContent='.ph-locked{opacity:.48!important;filter:grayscale(.65);cursor:not-allowed!important}.ph-locked:after{content:" 🔒"}button[aria-disabled="true"]{cursor:not-allowed!important}';document.head.appendChild(style);
    parent.postMessage({type:'PANDAHAN_QUEST_READY'},'*'); apply();
  })();<\/script>`;

  async function loadQuestOffline() {
    const target = frame();
    if (!target) throw new Error("Không tìm thấy iframe Quest.");
    if (objectUrl) { target.src = objectUrl; return objectUrl; }
    if (loadPromise) return loadPromise;
    setStatus("Đang ghép nội dung Pinyin Tone Quest…");
    loadPromise = Promise.all(PARTS.map(async (part) => {
      const response = await fetch(part, { cache: "force-cache" });
      if (!response.ok) throw new Error(`Không tải được ${part} (${response.status})`);
      return response.arrayBuffer();
    })).then((buffers) => {
      const decoder = new TextDecoder("utf-8");
      const total = buffers.reduce((sum, buffer) => sum + buffer.byteLength, 0);
      const bytes = new Uint8Array(total); let offset = 0;
      buffers.forEach((buffer) => { bytes.set(new Uint8Array(buffer), offset); offset += buffer.byteLength; });
      let html = decoder.decode(bytes);
      const insertion = html.search(/<\/body>/i);
      if (insertion >= 0) html = html.slice(0, insertion) + GATE_SCRIPT + html.slice(insertion);
      else html += GATE_SCRIPT;
      objectUrl = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
      target.onload = () => { activeFrameWindow = target.contentWindow; refreshQuestGate(); };
      target.src = objectUrl; target.style.opacity = "1";
      return objectUrl;
    }).catch((error) => {
      loadPromise = null; target.style.opacity = "1";
      target.srcdoc = `<body style="font-family:system-ui;padding:24px;color:#991b1b;background:#fff7ed"><h3>Không tải được Quest offline</h3><p>${String(error.message || error)}</p><p>Hãy kiểm tra đủ 3 file <code>pinyin-tone-quest.part-00/01/02</code>.</p></body>`;
      throw error;
    });
    return loadPromise;
  }

  window.PandaHanQuestParts = { parts: PARTS.slice(), loadQuestOffline, refreshQuestGate, setLanguage: sendLanguageToQuest };
  window.addEventListener("message", handleQuestMessage);
  window.addEventListener("pandahan-schedule-updated", refreshQuestGate);
  document.addEventListener("DOMContentLoaded", () => {
    const card = document.getElementById("pCardPinyinQuest");
    if (card) card.addEventListener("click", () => loadQuestOffline().catch(() => {}));
  });
})();
