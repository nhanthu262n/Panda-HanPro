/* PandaHán Pro — Ôn tập 120 ngày: cổng >30%, audio offline và chrome Việt–English đồng bộ. */
(() => {
  "use strict";

  const QUEST_APP = "pinyin-tone-quest-app/index.html?embedded=1&v=quest-result-bridge-v21-20260901";
  let loadPromise = null;
  let objectUrl = null;
  let activeFrameWindow = null;
  let lastQuestResultKey = null;
  let questResultInFlight = null;
  const scheduleSyncInFlight = new Map();
  const scheduleSyncDone = new Set();

  function userNamespace() {
    try {
      if (typeof window.storageNamespace === "function") return String(window.storageNamespace() || "guest");
      const uid = window.CURRENT_USER?.uid || window.CURRENT_USER?.username;
      return String(uid || "guest").replace(/[^a-zA-Z0-9_-]/g, "_");
    } catch (_) { return "guest"; }
  }
  function parentProgressKey() { return `pandahan_quest_progress_summary_${userNamespace()}`; }
  function questBridgeKey() { return `pandahan_quest_bridge_scores_v17_${userNamespace()}`; }
  function saveQuestBridgeScore(day, score) {
    try {
      const rows = JSON.parse(localStorage.getItem(questBridgeKey()) || "{}") || {};
      const d = Number(day), v = Number(score);
      if (!Number.isInteger(d) || d < 1 || d > 120 || !Number.isFinite(v)) return;
      rows[String(d)] = Math.max(Number(rows[String(d)] || 0), Math.max(0, Math.min(100, v)));
      localStorage.setItem(questBridgeKey(), JSON.stringify(rows));
    } catch (_) {}
  }
  function questLanguage() { return window.LANG_MODE === "en" ? "en" : "vi"; }
  function questText(vi, en) { return questLanguage() === "en" ? en : vi; }
  function outerStatus(text, isError = false) {
    const node = document.getElementById("questProgressSyncStatus");
    if (!node) return;
    node.textContent = text;
    node.style.color = isError ? "#b42318" : "#6d4a7c";
    node.style.borderColor = isError ? "#f3b4b4" : "#ddd6fe";
  }
  function renderReviewCount(count) {
    const node = document.getElementById("questReviewErrorCount");
    if (node) node.textContent = String(Math.max(0, Number(count) || 0));
  }
  function showPersistedSummary() {
    try {
      const summary = JSON.parse(localStorage.getItem(parentProgressKey()) || "null");
      if (!summary) return;
      renderReviewCount(summary.mistakesCount);
      outerStatus(questText(
        `Ôn tập 120 ngày đã lưu: ${Number(summary.completedCount || 0)}/120 bài · ${Number(summary.mistakesCount || 0)} câu trong sổ ôn`,
        `120-Day Review saved: ${Number(summary.completedCount || 0)}/120 lessons · ${Number(summary.mistakesCount || 0)} items in the mistake log`
      ));
    } catch (_) {}
  }

  function frame() { return document.getElementById("pinyinToneQuestFrame"); }
  function setStatus(message, isError = false) {
    const target = frame();
    if (!target) return;
    target.title = message;
    target.style.opacity = isError ? "0.35" : "0.7";
  }

  function getQuestProgress() {
    try {
      return JSON.parse(localStorage.getItem(`pinyin-tone-quest-offline-progress-v2_${userNamespace()}`) || "{}") || {};
    } catch (_) { return {}; }
  }
  function getQuestGate() {
    try {
      const api = window.PandaHanQuestProgression;
      if (api?.gateFor) return api.gateFor(getQuestProgress());
    } catch (_) {}
    return { unlocked: [1], completed: [], progress: {} };
  }
  function currentQuestSummary() {
    const progress = getQuestGate().progress || getQuestProgress();
    const dayProgress = progress.dayProgress || {};
    const completed = Object.keys(dayProgress).filter((key) => dayProgress[key]?.completed);
    const last = completed.map((key) => ({ day: Number(key), record: dayProgress[key] })).sort((a, b) => Number(b.record?.updatedAt || 0) - Number(a.record?.updatedAt || 0))[0];
    return { completedCount: completed.length, mistakesCount: Array.isArray(progress.mistakes) ? progress.mistakes.length : 0, mistakes: Array.isArray(progress.mistakes) ? progress.mistakes.slice(-120) : [], lastDay: last?.day || 0, lastScorePercent: Number(last?.record?.scorePercent || 0), updatedAt: Number(last?.record?.updatedAt || Date.now()) };
  }
  function saveQuestSummary(summary) {
    try { localStorage.setItem(parentProgressKey(), JSON.stringify(summary)); } catch (_) {}
    renderReviewCount(summary.mistakesCount);
    outerStatus(questText(
      `Ôn tập 120 ngày đã lưu: ${summary.completedCount}/120 bài · ${summary.mistakesCount} câu trong sổ ôn`,
      `120-Day Review saved: ${summary.completedCount}/120 lessons · ${summary.mistakesCount} items in the mistake log`
    ));
  }

  function sendGateToQuest(gate) {
    if (activeFrameWindow) activeFrameWindow.postMessage({
      type: "PANDAHAN_QUEST_GATE",
      unlockedDays: gate.unlocked,
      completedDays: gate.completed,
    }, "*");
  }
  function sendLanguageToQuest() {
    if (activeFrameWindow) activeFrameWindow.postMessage({ type: "PANDAHAN_QUEST_LANGUAGE", lang: questLanguage() }, "*");
  }

  function refreshQuestGate() { sendGateToQuest(getQuestGate()); sendLanguageToQuest(); }

  async function syncQuestScoreToSchedule(day, score, resultToken = "progress-reconcile") {
    const numericDay = Math.max(1, Math.min(120, Number(day) || 0));
    const numericScore = Math.max(0, Math.min(100, Number(score)));
    if (!numericDay || !Number.isFinite(numericScore) || numericScore <= 30) return null;
    const key = `${numericDay}:${numericScore}`;
    if (scheduleSyncDone.has(key)) return null;
    if (scheduleSyncInFlight.has(key)) return scheduleSyncInFlight.get(key);
    const job = (async () => {
      const api = window.PandaHanSchedule;
      if (!api || typeof api.submitQuestResult !== "function") return null;
      try {
        const current = typeof api.getSchedule === "function" ? api.getSchedule() : null;
        const dayRow = current?.days?.find((item) => Number(item.day_number) === numericDay);
        if (dayRow?.status === "completed" && Number(dayRow.last_score ?? dayRow.best_score) > 30) {
          scheduleSyncDone.add(key);
          return { schedule: current, result: { dayNumber: numericDay, score: numericScore, passed: true, action: "already_completed" } };
        }
        const result = await api.submitQuestResult(numericDay, numericScore, `${resultToken}:${numericDay}:${numericScore}`);
        if (result?.result?.passed || result?.result?.action === "already_completed") {
          scheduleSyncDone.add(key);
          window.dispatchEvent(new CustomEvent("pandahan-quest-schedule-saved", { detail: result }));
        }
        return result;
      } catch (error) {
        console.warn("Quest → Schedule sync failed:", error?.message || error);
        return null;
      } finally {
        scheduleSyncInFlight.delete(key);
      }
    })();
    scheduleSyncInFlight.set(key, job);
    return job;
  }

  async function reconcileQuestProgressToSchedule(progress) {
    const rows = progress?.dayProgress && typeof progress.dayProgress === "object" ? progress.dayProgress : {};
    const ordered = Object.entries(rows)
      .map(([day, row]) => ({ day: Number(day), row: row || {} }))
      .filter(({ day, row }) => day >= 1 && day <= 120 && Number(row.scorePercent) > 30)
      .sort((a, b) => a.day - b.day);
    for (const item of ordered) {
      const score = Number(item.row.scorePercent);
      await syncQuestScoreToSchedule(item.day, score, "saved-progress");
    }
  }

  async function handleQuestMessage(event) {
    const target = frame();
    if (!target || event.source !== target.contentWindow) return;
    const data = event.data || {};
    if (data.type === "PANDAHAN_QUEST_READY") {
      activeFrameWindow = target.contentWindow;
      refreshQuestGate();
      showPersistedSummary();
      reconcileQuestProgressToSchedule(getQuestProgress()).catch(() => {});
      return;
    }
    if (data.type === "PANDAHAN_QUEST_PROGRESS") {
      if (data.progress && typeof data.progress === "object") {
        try { localStorage.setItem(`pinyin-tone-quest-offline-progress-v2_${userNamespace()}`, JSON.stringify(data.progress)); } catch (_) {}
      }
      const summary = currentQuestSummary();
      saveQuestSummary(summary);
      refreshQuestGate();
      reconcileQuestProgressToSchedule(data.progress || getQuestProgress()).catch(() => {});
      return;
    }
    if (data.type !== "PANDAHAN_QUEST_DAY_RESULT") return;
    const day = Number(data.day);
    const score = Math.max(0, Math.min(100, Number(data.scorePercent)));
    const resultKey = `${day}:${score}:${data.resultToken || ""}`;
    if (!day || !Number.isFinite(score) || lastQuestResultKey === resultKey || questResultInFlight === resultKey) return;
    questResultInFlight = resultKey;
    const passed = score > 30;
    saveQuestBridgeScore(day, score);
    const evaluation = { dayNumber: day, scorePercent: score, passed, threshold: 30, reviewType: "quest_lesson", repeatCount: 0, action: passed ? "unlock_next_lesson" : "retry_lesson", resultToken: String(data.resultToken || resultKey), scheduleSyncOwner: "quest-loader" };
    outerStatus(questText(
      `Ôn tập 120 ngày · Bài ${day}: ${score}% · ${passed ? "Đã vượt 30% — mở bài tiếp theo" : "Cần đạt trên 30% để mở bài mới"}`,
      `120-Day Review · Lesson ${day}: ${score}% · ${passed ? "Above 30% — next lesson unlocked" : "Score above 30% to unlock the next lesson"}`
    ));
    if (passed) await syncQuestScoreToSchedule(day, score, String(data.resultToken || resultKey));
    window.dispatchEvent(new CustomEvent("pandahan-quest-score-saved", { detail: evaluation }));
    lastQuestResultKey = resultKey;
    questResultInFlight = null;
  }

  const STORAGE_BOOTSTRAP = `<script>(function(){try{var ns='guest';try{if(parent&&typeof parent.storageNamespace==='function'){ns=String(parent.storageNamespace()||'guest');}else if(parent&&parent.CURRENT_USER){ns=String(parent.CURRENT_USER.uid||parent.CURRENT_USER.username||'guest');}}catch(_){}ns=ns.replace(/[^a-zA-Z0-9_-]/g,'_');var key='pinyin-tone-quest-offline-progress-v2_'+ns;var old='pinyin-tone-quest-offline-progress-v2';if(!localStorage.getItem(key)){var raw=localStorage.getItem(old);if(raw)localStorage.setItem(key,raw);}}catch(_){}})();</script>`;
  const GATE_SCRIPT = `<script>(function(){
    var gate={unlockedDays:[1],completedDays:[]};
    function progressKey(){var ns='guest';try{if(parent&&typeof parent.storageNamespace==='function'){ns=String(parent.storageNamespace()||'guest');}else if(parent&&parent.CURRENT_USER){ns=String(parent.CURRENT_USER.uid||parent.CURRENT_USER.username||'guest');}}catch(_){}return 'pinyin-tone-quest-offline-progress-v2_'+ns.replace(/[^a-zA-Z0-9_-]/g,'_');}
    function reportProgress(){try{var raw=localStorage.getItem(progressKey());if(!raw)return;var p=JSON.parse(raw)||{},dp=p.dayProgress||{},keys=Object.keys(dp),completed=keys.filter(function(k){return dp[k]&&dp[k].completed;});var last=completed.map(function(k){return dp[k]&&{day:Number(k),record:dp[k]};}).filter(Boolean).sort(function(a,b){return Number(b.record.updatedAt||b.record.completedAt||0)-Number(a.record.updatedAt||a.record.completedAt||0);})[0];var mistakes=Array.isArray(p.mistakes)?p.mistakes.slice(-120):[];parent.postMessage({type:'PANDAHAN_QUEST_PROGRESS',progress:p,completedCount:completed.length,mistakesCount:mistakes.length,mistakes:mistakes,lastDay:last?last.day:0,lastScorePercent:last&&last.record.answered?Math.round(Number(last.record.correct||0)/Number(last.record.answered||1)*100):0,updatedAt:Date.now()},'*');}catch(_){}}
    setInterval(reportProgress,700);
    var resultSent={}; var lastStartedDay=0;
    function allowed(day){return gate.unlockedDays.indexOf(day)>=0||gate.completedDays.indexOf(day)>=0;}
    function apply(){
      document.querySelectorAll('[data-day]').forEach(function(btn){
        var day=Number(btn.getAttribute('data-day')); var ok=allowed(day);
        btn.disabled=!ok; btn.setAttribute('aria-disabled',String(!ok));
        btn.classList.toggle('ph-locked',!ok); btn.title=ok?'Mở bài ôn tập':'Đạt trên 30% ở bài trước để mở bài này';
      });
      var start=document.getElementById('oh-start-day'); if(start){var ok=allowed(1);start.disabled=!ok;start.setAttribute('aria-disabled',String(!ok));}
    }
    function reportResult(){
      var title=(document.body&&document.body.innerText)||'';
      if(!title)return;
      // React Quest result screen: "COMPLETION CERTIFICATE · DAY 001" + "83% accuracy · 正确率".
      // Do not rely on the old #exam.visible wrapper; the current Quest build does not use it.
      var m=title.match(/COMPLETION\s+CERTIFICATE\s*[·•\-–—:]*\s*DAY\s*0*(\d+)/i)
        || title.match(/(?:Hoàn thành|Complete|Completed|Finished)\s+(?:Ngày|Day)\s*#?\s*0*(\d+)/i)
        || title.match(/第\s*0*(\d+)\s*天/);
      var day=m?Number(m[1]):Number(lastStartedDay||0); if(!day||day<1||day>120)return;
      var p=title.match(/(\d+(?:[.,]\d+)?)\s*%\s*(?:accuracy|正确率)/i)
        || title.match(/(?:accuracy|正确率)\s*[:：]?\s*(\d+(?:[.,]\d+)?)\s*%/i);
      if(!p&&m)p=title.match(/(\d+(?:[.,]\d+)?)\s*%/);
      if(!p)return;
      var score=Math.max(0,Math.min(100,Math.round(Number(String(p[1]).replace(',','.')))));
      var token=String(day)+':'+String(score); if(resultSent[token])return; resultSent[token]=1;
      try{var key=progressKey(),stored=JSON.parse(localStorage.getItem(key)||'{}')||{},rows=stored.dayProgress||{},row=rows[String(day)]||{};row.scorePercent=score;row.completed=score>30;row.threshold=30;row.updatedAt=Date.now();rows[String(day)]=row;stored.dayProgress=rows;localStorage.setItem(key,JSON.stringify(stored));}catch(_){}
      reportProgress();
      parent.postMessage({type:'PANDAHAN_QUEST_DAY_RESULT',day:day,scorePercent:score,resultToken:token},'*');
    }
    window.addEventListener('message',function(e){var d=e.data||{};if(d.type==='PANDAHAN_QUEST_GATE'){gate.unlockedDays=(d.unlockedDays||[1]).map(Number);gate.completedDays=(d.completedDays||[]).map(Number);apply();return;}if(d.type==='PANDAHAN_QUEST_OPEN_REVIEW'){var review=document.getElementById('oh-errors');if(review)review.click();}});
    document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-day]');if(!b)return;var chosen=Number(b.getAttribute('data-day'));if(b.disabled){e.preventDefault();e.stopImmediatePropagation();alert('Hãy đạt trên 30% ở bài trước để mở bài này.');return;}lastStartedDay=chosen;},true);
    var observer=new MutationObserver(function(){apply();reportResult();}); observer.observe(document.documentElement,{subtree:true,childList:true});
    setInterval(reportResult,700);
    document.documentElement.classList.add('ph-content-only');
    parent.postMessage({type:'PANDAHAN_QUEST_READY'},'*'); apply(); reportProgress();
  })();</script>`;
  const QUEST_I18N_SCRIPT = `<script>(function(){
    var lang='vi';
    var exact={
      'Từ điển':'Dictionary','Ôn tập':'Review','Luyện tập':'Practice','Ngữ âm':'Phonetics','Tiến độ':'Progress','Học liên tiếp':'Learning streak','Giáo viên':'Teacher',
      'Bắt đầu một ngày học, mọi lỗi sẽ tự vào sổ ôn.':'Start a daily review; every mistake is added to your review log.',
      '120 đề gốc, nghe · nói · đọc · viết.':'120 source lessons: listen · speak · read · write.',
      'Mỗi ngày một đề gốc, đủ nghe · nói · đọc · viết.':'Each day has one source lesson with listening, speaking, reading and writing.',
      'Mỗi ngày có đề nguồn đầy đủ: nghe · đọc · viết · nói.':'Each day has a complete source lesson: listen · read · write · speak.',
      'Pinyin Race Quest · Lộ trình 120 ngày':'Pinyin Race Quest · 120-Day Review','Pinyin Tone Quest — Bản HTML độc lập':'Pinyin Tone Quest — Standalone HTML edition',
      'HSK 3.0 · BỘ ĐỀ NGUỒN 120 NGÀY':'HSK 3.0 · 120-DAY SOURCE LESSONS','Bạn chọn:':'You chose:','Căn cứ nguồn:':'Source basis:',
      'CHỌN ĐỀ NGUỒN THEO NGÀY':'SELECT A SOURCE LESSON BY DAY','Hành trình đề nguồn':'Source lesson journey',
      'SỔ LỖI · ĐỀ NGUỒN':'MISTAKE LOG · SOURCE LESSONS','THỐNG KÊ LỖI CẦN ÔN':'REVIEW MISTAKE SUMMARY',
      'Chưa có câu sai':'No incorrect answers yet','Chưa có câu sai nào':'No incorrect answers yet','Khi trả lời sai, mục này sẽ tự ghi lại.':'Incorrect answers are saved here automatically.',
      '← Lộ trình 120 ngày':'← 120-Day Review','Lộ trình 120 ngày':'120-Day Review','Làm lại ngày này':'Retry this lesson',
      'Tiến độ, điểm và câu sai đã được lưu ngay trên thiết bị này.':'Progress, scores and incorrect answers are saved on this device.',
      'Câu đúng':'Correct answers','Độ chính xác':'Accuracy','Xem kết quả →':'View results →','Tiếp theo →':'Next →',
      'Nghe audio và chọn đáp án đúng':'Listen to the audio and choose the correct answer','LUYỆN TẬP':'PRACTICE','Nghe lại':'Listen again','Audio MP3 nhúng · offline':'Embedded MP3 audio · offline',
      'Đúng rồi!':'Correct!','Chưa đúng':'Not quite','Đáp án đúng:':'Correct answer:','Đúng:':'Correct:',
      'Vào Đề Ngày 1 · 20 mục':'Start Day 1 · 20 items','Xem thống kê chi tiết →':'View detailed statistics →','♫ Bật nhạc nền':'♫ Enable background music',
      '📒 Ôn':'📒 Review','🔊 Nghe MP3 gốc':'🔊 Play original MP3','🗣 Nói theo rubric':'🗣 Speak with the rubric','✍️ Viết':'✍️ Write','📖 Đọc':'📖 Read','🔔 Nhắc nhở':'🔔 Reminder'
    };
    function translate(value){
      var raw=String(value==null?'':value);if(!raw)return raw;
      if(lang!=='en')return raw;
      var trimmed=raw.trim(),lead=(raw.match(/^\s*/)||[''])[0],trail=(raw.match(/\s*$/)||[''])[0],out=exact[trimmed]||trimmed;
      out=out.replace(/^Hoàn thành Ngày\s+(\d+)/,'Completed Day $1').replace(/^NGÀY\s*(\d+)/,'DAY $1').replace(/^TUẦN\s*(\d+)/,'WEEK $1').replace(/^Ôn Ngày\s*(\d+)/,'Review Day $1').replace(/^(\d+)\s+mục$/,'$1 items').replace(/^(\d+)\s+ngày$/,'$1 days').replace(/^(\d+)%\s*·\s*chơi lại$/,'$1% · retry').replace(/^Chạm để bắt đầu$/,'Tap to start').replace(/^✓ Hoàn thành$/,'✓ Completed').replace(/^đề nguồn · nghe · nói · đọc · viết$/,'source lesson · listen · speak · read · write').replace(/^câu cần ôn$/,'items to review').replace(/^câu sai$/,'incorrect answers').replace(/^bạn đang sai\.$/,'you answered incorrectly.').replace(/^Đáp án đúng:\s*/,'Correct answer: ').replace(/^Đúng:\s*/,'Correct: ').replace(/^Bạn chọn:\s*/,'You chose: ').replace(/^Căn cứ nguồn:\s*/,'Source basis: ').replace(/^(\d+)\s+câu cần ôn$/,'$1 items to review').replace(/^(\d+)\s+câu sai$/,'$1 incorrect answers');
      return lead+out+trail;
    }
    function localize(){
      document.title=lang==='en'?'Pinyin Tone Quest — 120-Day Review':'Pinyin Tone Quest — Ôn tập 120 ngày';
      document.querySelectorAll('button,h1,h2,h3,h4,p,small,span,strong,b,em,i,label,div').forEach(function(el){
        if(el.children.length)return;
        var source=el.dataset.questVi;if(source==null){source=el.textContent||'';el.dataset.questVi=source;}
        var localized=lang==='en'?translate(source):source;
        if(el.textContent!==localized)el.textContent=localized;
      });
      document.querySelectorAll('[data-day]').forEach(function(button){
        var original=button.title||'';if(!button.dataset.questViTitle)button.dataset.questViTitle=original;
        if(button.dataset.questViTitle==='Mở bài ôn tập'||button.dataset.questViTitle==='Đạt trên 30% ở bài trước để mở bài này')button.title=lang==='en'?(button.dataset.questViTitle==='Mở bài ôn tập'?'Open review lesson':'Score above 30% on the previous lesson to open this lesson'):button.dataset.questViTitle;
      });
    }
    try{lang=(parent&&parent.LANG_MODE==='en')?'en':'vi';}catch(_){};
    window.addEventListener('message',function(e){var d=e.data||{};if(d.type==='PANDAHAN_QUEST_LANGUAGE'){lang=d.lang==='en'?'en':'vi';localize();}});
    var observer=new MutationObserver(function(){localize();});observer.observe(document.documentElement,{subtree:true,childList:true});
    setTimeout(localize,0);
  })();</script>`;

  const CONTENT_ONLY_STYLE = `<style id="pandahan-content-only-style">.ph-content-only{margin:0;min-height:100vh;background:#fff;color:#1f2937;overflow-x:hidden}.ph-content-only .oh-app{display:block!important;min-height:100vh!important}.ph-content-only .oh-main{display:block!important;grid-column:1!important;grid-row:1!important;width:100%!important;max-width:none!important;margin:0!important;padding:18px!important}.ph-content-only .oh-launcher,.ph-content-only .oh-exam{max-width:1200px!important;margin-left:auto!important;margin-right:auto!important}.ph-locked{opacity:.48!important;filter:grayscale(.65);cursor:not-allowed!important}.ph-locked:after{content:" 🔒"}button[aria-disabled="true"]{cursor:not-allowed!important}</style>`;

  function extractQuestContentOnlyHtml(html) {
    const parsed = new DOMParser().parseFromString(String(html || ""), "text/html");
    const main = parsed.querySelector("main.oh-main");
    const gameData = parsed.getElementById("game-data");
    const runtime = Array.from(parsed.body.querySelectorAll(":scope > script:not(#game-data)"));
    if (!main || !gameData || !runtime.length) throw new Error("Quest source thiếu main, game-data hoặc runtime.");
    const output = document.implementation.createHTMLDocument("Pinyin Tone Quest");
    output.head.innerHTML = `<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Pinyin Tone Quest</title>${CONTENT_ONLY_STYLE}${Array.from(parsed.head.querySelectorAll("style")).map((style) => style.outerHTML).join("")}`;
    const app = output.createElement("div");
    app.className = "oh-app ph-content-only";
    app.appendChild(main.cloneNode(true));
    output.body.appendChild(app);
    output.body.appendChild(gameData.cloneNode(true));
    runtime.forEach((script) => output.body.appendChild(script.cloneNode(true)));
    output.body.insertAdjacentHTML("beforeend", STORAGE_BOOTSTRAP + GATE_SCRIPT + QUEST_I18N_SCRIPT);
    return "<!doctype html>" + output.documentElement.outerHTML;
  }

  let searchFrameWindow = null;
  function installQuestDaySearch(target) {
    const doc = target?.contentDocument;
    if (!doc || searchFrameWindow === target.contentWindow) return;
    const main = doc.querySelector('main.oh-main') || doc.body;
    if (!main) return;
    searchFrameWindow = target.contentWindow;
    const bar = doc.createElement('div');
    bar.id = 'pandahan-quest-day-search';
    bar.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 auto 14px;max-width:1200px;padding:9px 12px;border:1px solid #f3bfd8;border-radius:14px;background:rgba(255,255,255,.92);box-shadow:0 4px 14px rgba(157,23,77,.06);position:sticky;top:8px;z-index:20;';
    bar.innerHTML = '<strong style="color:#9d174d;font-size:12px">Tìm ngày / Find day</strong><input id="pandahanQuestDayInput" inputmode="numeric" type="search" min="1" max="120" placeholder="1–120" aria-label="Tìm ngày từ 1 đến 120" style="width:86px;border:1px solid #f1a8c7;border-radius:9px;padding:7px 9px;background:#fff;color:#4c1d95;font-weight:800;outline:0"><button id="pandahanQuestDayGo" type="button" style="border:0;border-radius:9px;padding:7px 11px;background:#e5488d;color:#fff;font-weight:800;cursor:pointer">Đến ngày / Go</button><span id="pandahanQuestDayError" role="alert" style="display:none;color:#b42318;font-size:11px;font-weight:800"></span>';
    main.prepend(bar);
    const input = bar.querySelector('#pandahanQuestDayInput');
    const error = bar.querySelector('#pandahanQuestDayError');
    const buttons = () => Array.from(doc.querySelectorAll('[data-day]'));
    const clearHighlight = () => buttons().forEach((el) => { el.style.outline = ''; el.style.outlineOffset = ''; el.removeAttribute('data-quest-search-hit'); });
    const showError = (message) => { error.textContent = message; error.style.display = message ? 'inline' : 'none'; };
    const jump = () => {
      const raw = String(input.value || '').trim();
      clearHighlight();
      if (!/^\d+$/.test(raw)) { showError(raw ? 'Vui lòng nhập số từ 1 đến 120.' : 'Hãy nhập số ngày.'); return; }
      const day = Number(raw);
      if (day < 1 || day > 120) { showError('Ngày phải nằm trong khoảng 1–120.'); return; }
      const hit = buttons().find((el) => Number(el.getAttribute('data-day')) === day);
      if (!hit) { showError('Chưa tìm thấy ngày này trong roadmap.'); return; }
      showError(''); hit.style.outline = '4px solid #f59e0b'; hit.style.outlineOffset = '3px'; hit.setAttribute('data-quest-search-hit', 'true'); hit.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    bar.querySelector('#pandahanQuestDayGo').addEventListener('click', jump);
    input.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); jump(); } });
    input.addEventListener('input', () => { if (!input.value) { clearHighlight(); showError(''); } });
  }

  async function loadQuestOffline() {
    const target = frame();
    if (!target) throw new Error("Không tìm thấy iframe Quest.");
    if (loadPromise) return loadPromise;
    setStatus(questText("Đang mở Pinyin Tone Quest…", "Opening Pinyin Tone Quest…"));
    loadPromise = new Promise((resolve, reject) => {
      target.onload = () => {
        activeFrameWindow = target.contentWindow;
        refreshQuestGate();
        target.style.opacity = "1";
        outerStatus(questText("Ôn tập 120 ngày đã sẵn sàng · kết quả và sổ ôn sẽ lưu theo tài khoản", "120-Day Review is ready · results and the mistake log will be saved for this account"));
        resolve(QUEST_APP);
      };
      target.onerror = () => {
        loadPromise = null; target.style.opacity = "1";
        target.srcdoc = '<body style="font-family:system-ui;padding:24px;color:#991b1b;background:#fff7ed"><h3>Unable to load Pinyin Tone Quest</h3><p>Please check the integrated app files.</p></body>';
        reject(new Error("Unable to load integrated Pinyin Tone Quest"));
      };
      target.loading = "eager";
      target.src = QUEST_APP;
      target.style.opacity = "0.7";
    });
    return loadPromise;
  }
  window.PandaHanQuestParts = { parts: [QUEST_APP], loadQuestOffline, refreshQuestGate, extractQuestContentOnlyHtml };
  window.addEventListener("message", handleQuestMessage);
  document.addEventListener("DOMContentLoaded", () => {
    const reviewButton = document.getElementById("questReviewErrorsBtn");
    if (reviewButton) reviewButton.addEventListener("click", () => {
      const target = frame();
      if (!target || !activeFrameWindow) {
        outerStatus(questText("Hãy mở Ôn tập 120 ngày trước để tải sổ ôn.", "Open 120-Day Review first to load the mistake log."), true);
        return;
      }
      activeFrameWindow.postMessage({ type: "PANDAHAN_QUEST_OPEN_REVIEW" }, "*");
    });
  });
  document.addEventListener("DOMContentLoaded", () => {
    const card = document.getElementById("pCardPinyinQuest");
    if (card) card.addEventListener("click", () => loadQuestOffline().catch(() => {}));
    const searchInput = document.getElementById("questDaySearch");
    const searchError = document.getElementById("questDaySearchError");
    const jumpToDay = () => {
      const raw = String(searchInput?.value || "").trim();
      if (searchError) { searchError.textContent = ""; searchError.style.display = "none"; }
      if (!/^\d+$/.test(raw)) { if (searchError) { searchError.textContent = raw ? "Nhập số từ 1 đến 120." : "Nhập số ngày."; searchError.style.display = "inline"; } return; }
      const day = Number(raw);
      if (day < 1 || day > 120) { if (searchError) { searchError.textContent = "Ngày phải từ 1 đến 120."; searchError.style.display = "inline"; } return; }
      const target = frame();
      const doc = target?.contentDocument;
      const hit = doc ? Array.from(doc.querySelectorAll(".day-quest-card")).find((node) => { const label = String(node.getAttribute("aria-label") || node.textContent || ""); const match = label.match(/(?:Day|Ngày)\s*#?\s*(\d+)/i); return Number(match?.[1] || 0) === day; }) : null;
      if (!hit) { if (searchError) { searchError.textContent = "Hãy mở Ôn tập 120 ngày trước."; searchError.style.display = "inline"; } loadQuestOffline().catch(() => {}); return; }
      doc.querySelectorAll("[data-quest-search-hit]").forEach((node) => { node.style.outline = ""; node.removeAttribute("data-quest-search-hit"); });
      hit.style.outline = "4px solid #f59e0b"; hit.style.outlineOffset = "3px"; hit.setAttribute("data-quest-search-hit", "true"); hit.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    if (searchInput) { searchInput.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); jumpToDay(); } }); searchInput.addEventListener("input", () => { if (!searchInput.value && searchError) { searchError.textContent = ""; searchError.style.display = "none"; } }); }
    showPersistedSummary();
  });
  window.addEventListener("pandahan-language-changed", () => {
    showPersistedSummary();
    sendLanguageToQuest();
  });
})();
