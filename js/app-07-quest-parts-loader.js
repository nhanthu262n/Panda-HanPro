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

  async function refreshQuestGate() { sendGateToQuest(await getScheduleForQuest()); }

  async function handleQuestMessage(event) {
    const target = frame();
    if (!target || event.source !== target.contentWindow) return;
    const data = event.data || {};
    if (data.type === "PANDAHAN_QUEST_READY") {
      activeFrameWindow = target.contentWindow;
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
      var title=exam.innerText||''; var m=title.match(/Hoàn thành Ngày\\s+(\\d+)/i); if(!m)return;
      var day=Number(m[1]); var p=title.match(/(\\d+)\\s*%/); if(!p)return;
      var token=String(day)+':'+String(p[1]); if(resultSent[token])return; resultSent[token]=1;
      parent.postMessage({type:'PANDAHAN_QUEST_DAY_RESULT',day:day,scorePercent:Number(p[1]),resultToken:token},'*');
    }
    window.addEventListener('message',function(e){var d=e.data||{};if(d.type!=='PANDAHAN_QUEST_GATE')return;gate.unlockedDays=(d.unlockedDays||[1]).map(Number);gate.completedDays=(d.completedDays||[]).map(Number);apply();});
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

  window.PandaHanQuestParts = { parts: PARTS.slice(), loadQuestOffline, refreshQuestGate };
  window.addEventListener("message", handleQuestMessage);
  window.addEventListener("pandahan-schedule-updated", refreshQuestGate);
  document.addEventListener("DOMContentLoaded", () => {
    const card = document.getElementById("pCardPinyinQuest");
    if (card) card.addEventListener("click", () => loadQuestOffline().catch(() => {}));
  });
})();
