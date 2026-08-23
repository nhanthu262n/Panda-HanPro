/* PandaHan Pro — Quest split-parts loader + adaptive progress gate. */
(() => {
  "use strict";

  const PARTS = [
    "assets/pinyin-tone-quest.part-00?v=quest-source-20260823-final8",
    "assets/pinyin-tone-quest.part-01?v=quest-source-20260823-final8",
    "assets/pinyin-tone-quest.part-02?v=quest-source-20260823-final8",
  ];
  let loadPromise = null;
  let objectUrl = null;
  let activeFrameWindow = null;
  let lastQuestResultKey = null;
  let questResultInFlight = null;

  function userNamespace() {
    try {
      if (typeof window.storageNamespace === "function") return String(window.storageNamespace() || "guest");
      const uid = window.CURRENT_USER?.uid || window.CURRENT_USER?.username;
      return String(uid || "guest").replace(/[^a-zA-Z0-9_-]/g, "_");
    } catch (_) { return "guest"; }
  }
  function parentProgressKey() { return `pandahan_quest_progress_summary_${userNamespace()}`; }
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
      outerStatus(`Quest đã lưu: ${Number(summary.completedCount || 0)}/120 ngày · ${Number(summary.mistakesCount || 0)} câu trong sổ ôn`);
    } catch (_) {}
  }

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

  async function refreshQuestGate() { sendGateToQuest(await getScheduleForQuest()); }

  async function handleQuestMessage(event) {
    const target = frame();
    if (!target || event.source !== target.contentWindow) return;
    const data = event.data || {};
    if (data.type === "PANDAHAN_QUEST_READY") {
      activeFrameWindow = target.contentWindow;
      await refreshQuestGate();
      showPersistedSummary();
      return;
    }
    if (data.type === "PANDAHAN_QUEST_PROGRESS") {
      const summary = {
        completedCount: Number(data.completedCount || 0),
        mistakesCount: Number(data.mistakesCount || 0),
        mistakes: Array.isArray(data.mistakes) ? data.mistakes.slice(-120) : [],
        lastDay: Number(data.lastDay || 0),
        lastScorePercent: Number(data.lastScorePercent || 0),
        updatedAt: Number(data.updatedAt || Date.now()),
      };
      try { localStorage.setItem(parentProgressKey(), JSON.stringify(summary)); } catch (_) {}
      renderReviewCount(summary.mistakesCount);
      outerStatus(`Quest đã lưu: ${summary.completedCount}/120 ngày · ${summary.mistakesCount} câu trong sổ ôn`);
      return;
    }
    if (data.type !== "PANDAHAN_QUEST_DAY_RESULT") return;
    const day = Number(data.day);
    const score = Math.max(0, Math.min(100, Number(data.scorePercent)));
    const resultKey = `${day}:${score}:${data.resultToken || ""}`;
    if (!day || !Number.isFinite(score) || lastQuestResultKey === resultKey || questResultInFlight === resultKey) return;
    questResultInFlight = resultKey;
    try {
      if (window.PandaHanSchedule?.submitDayResult) {
        const result = await (window.PandaHanSchedule.submitQuestResult
          ? window.PandaHanSchedule.submitQuestResult(day, score, data.resultToken)
          : window.PandaHanSchedule.submitDayResult(day, score));
        await refreshQuestGate();
        const evaluation = {
          dayNumber: day,
          scorePercent: score,
          passed: !!result?.result?.passed,
          threshold: Number(result?.result?.threshold || 80),
          reviewType: result?.result?.reviewType || "daily",
          repeatCount: Number(result?.result?.repeatCount || 0),
          action: result?.result?.action || "advance"
        };
        outerStatus(`Quest ngày ${day}: ${score}% · ${evaluation.passed ? "Đã đạt ngưỡng và đã lưu" : "Đã lưu, cần ôn lại"}`);
        window.dispatchEvent(new CustomEvent("pandahan-quest-score-saved", { detail: evaluation }));
        window.dispatchEvent(new CustomEvent("pandahan-learning-evaluation", { detail: { source: "quest", ...evaluation, evaluatedAt: Date.now() } }));
        lastQuestResultKey = resultKey;
      }
    } catch (error) {
      outerStatus("Chưa đồng bộ được kết quả Quest vào lộ trình; dữ liệu ôn tập offline vẫn được giữ.", true);
      console.warn("Quest result was not committed to schedule:", error.message || error);
    } finally {
      questResultInFlight = null;
    }
  }

  const STORAGE_BOOTSTRAP = `<script>(function(){try{var ns='guest';try{if(parent&&typeof parent.storageNamespace==='function'){ns=String(parent.storageNamespace()||'guest');}else if(parent&&parent.CURRENT_USER){ns=String(parent.CURRENT_USER.uid||parent.CURRENT_USER.username||'guest');}}catch(_){}ns=ns.replace(/[^a-zA-Z0-9_-]/g,'_');var key='pinyin-tone-quest-offline-progress-v2_'+ns;var old='pinyin-tone-quest-offline-progress-v2';if(!localStorage.getItem(key)){var raw=localStorage.getItem(old);if(raw)localStorage.setItem(key,raw);}}catch(_){}})();</script>`;
  const GATE_SCRIPT = `<script>(function(){
    var gate={unlockedDays:[1],completedDays:[]};
    function progressKey(){var ns='guest';try{if(parent&&typeof parent.storageNamespace==='function'){ns=String(parent.storageNamespace()||'guest');}else if(parent&&parent.CURRENT_USER){ns=String(parent.CURRENT_USER.uid||parent.CURRENT_USER.username||'guest');}}catch(_){}return 'pinyin-tone-quest-offline-progress-v2_'+ns.replace(/[^a-zA-Z0-9_-]/g,'_');}
    function reportProgress(){try{var raw=localStorage.getItem(progressKey());if(!raw)return;var p=JSON.parse(raw)||{},dp=p.dayProgress||{},keys=Object.keys(dp),completed=keys.filter(function(k){return dp[k]&&dp[k].completed;});var last=completed.map(function(k){return dp[k]&&{day:Number(k),record:dp[k]};}).filter(Boolean).sort(function(a,b){return Number(b.record.updatedAt||b.record.completedAt||0)-Number(a.record.updatedAt||a.record.completedAt||0);})[0];var mistakes=Array.isArray(p.mistakes)?p.mistakes.slice(-120):[];parent.postMessage({type:'PANDAHAN_QUEST_PROGRESS',completedCount:completed.length,mistakesCount:mistakes.length,mistakes:mistakes,lastDay:last?last.day:0,lastScorePercent:last&&last.record.answered?Math.round(Number(last.record.correct||0)/Number(last.record.answered||1)*100):0,updatedAt:Date.now()},'*');}catch(_){}}
    setInterval(reportProgress,700);
    var resultSent={}; var lastStartedDay=0;
    function allowed(day){return gate.unlockedDays.indexOf(day)>=0||gate.completedDays.indexOf(day)>=0;}
    function apply(){
      document.querySelectorAll('[data-day]').forEach(function(btn){
        var day=Number(btn.getAttribute('data-day')); var ok=allowed(day);
        btn.disabled=!ok; btn.setAttribute('aria-disabled',String(!ok));
        btn.classList.toggle('ph-locked',!ok); btn.title=ok?'Mở buổi học':'Hoàn thành buổi trước để mở buổi này';
      });
      var start=document.getElementById('oh-start-day'); if(start){var ok=allowed(1);start.disabled=!ok;start.setAttribute('aria-disabled',String(!ok));}
    }
    function reportResult(){
      var exam=document.getElementById('exam'); if(!exam||!exam.classList.contains('visible'))return;
      var title=exam.innerText||'';
      var m=title.match(/(?:Hoàn thành|Complete|Completed|Finished)\\s+(?:Ngày|Day)\\s*#?\\s*(\\d+)/i) || title.match(/(?:Ngày|Day)\\s*#?\\s*(\\d+)/i);
      var day=m?Number(m[1]):Number(lastStartedDay||0); if(!day)return;
      var p=title.match(/(\\d+(?:[.,]\\d+)?)\\s*%/); if(!p)return;
      var score=Math.max(0,Math.min(100,Math.round(Number(String(p[1]).replace(',','.')))));
      var token=String(day)+':'+String(score); if(resultSent[token])return; resultSent[token]=1;
      parent.postMessage({type:'PANDAHAN_QUEST_DAY_RESULT',day:day,scorePercent:score,resultToken:token},'*');
    }
    window.addEventListener('message',function(e){var d=e.data||{};if(d.type==='PANDAHAN_QUEST_GATE'){gate.unlockedDays=(d.unlockedDays||[1]).map(Number);gate.completedDays=(d.completedDays||[]).map(Number);apply();return;}if(d.type==='PANDAHAN_QUEST_OPEN_REVIEW'){var review=document.getElementById('oh-errors');if(review)review.click();}});
    document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-day]');if(!b)return;var chosen=Number(b.getAttribute('data-day'));if(b.disabled){e.preventDefault();e.stopImmediatePropagation();alert('Hãy hoàn thành buổi học trước để mở buổi này.');return;}lastStartedDay=chosen;},true);
    var observer=new MutationObserver(function(){apply();reportResult();}); observer.observe(document.documentElement,{subtree:true,childList:true});
    setInterval(reportResult,700);
    document.documentElement.classList.add('ph-content-only');
    parent.postMessage({type:'PANDAHAN_QUEST_READY'},'*'); apply(); reportProgress();
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
    output.body.insertAdjacentHTML("beforeend", STORAGE_BOOTSTRAP + GATE_SCRIPT);
    return "<!doctype html>" + output.documentElement.outerHTML;
  }

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
        const storageDeclaration = "const OFFLINE_STORAGE_KEY = (() => { try { const ns = window.parent && typeof window.parent.storageNamespace === 'function' ? window.parent.storageNamespace() : 'guest'; return 'pinyin-tone-quest-offline-progress-v2_' + String(ns || 'guest').replace(/[^a-zA-Z0-9_-]/g, '_'); } catch (_) { return 'pinyin-tone-quest-offline-progress-v2_guest'; } })();";
        html = html.replace("const OFFLINE_STORAGE_KEY = 'pinyin-tone-quest-offline-progress-v2';", storageDeclaration);
        html = extractQuestContentOnlyHtml(html);
      objectUrl = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
      target.onload = () => { activeFrameWindow = target.contentWindow; refreshQuestGate(); };
      target.src = objectUrl; target.style.opacity = "1";
      outerStatus("Quest đã sẵn sàng · kết quả và sổ ôn sẽ lưu theo tài khoản");
      return objectUrl;
    }).catch((error) => {
      loadPromise = null; target.style.opacity = "1";
      target.srcdoc = `<body style="font-family:system-ui;padding:24px;color:#991b1b;background:#fff7ed"><h3>Không tải được Quest offline</h3><p>${String(error.message || error)}</p><p>Hãy kiểm tra đủ 3 file <code>pinyin-tone-quest.part-00/01/02</code>.</p></body>`;
      throw error;
    });
    return loadPromise;
  }

  window.PandaHanQuestParts = { parts: PARTS.slice(), loadQuestOffline, refreshQuestGate, extractQuestContentOnlyHtml };
  window.addEventListener("message", handleQuestMessage);
  document.addEventListener("DOMContentLoaded", () => {
    const reviewButton = document.getElementById("questReviewErrorsBtn");
    if (reviewButton) reviewButton.addEventListener("click", () => {
      const target = frame();
      if (!target || !activeFrameWindow) {
        outerStatus("Hãy mở Pinyin Tone Quest trước để tải sổ ôn.", true);
        return;
      }
      activeFrameWindow.postMessage({ type: "PANDAHAN_QUEST_OPEN_REVIEW" }, "*");
    });
  });
  window.addEventListener("pandahan-schedule-updated", refreshQuestGate);
  document.addEventListener("DOMContentLoaded", () => {
    const card = document.getElementById("pCardPinyinQuest");
    if (card) card.addEventListener("click", () => loadQuestOffline().catch(() => {}));
    showPersistedSummary();
  });
})();
