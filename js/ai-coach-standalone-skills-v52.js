(() => {
  "use strict";

  const VERSION = "v52-standalone-listen-speak-20260907";
  const state = {
    mode: null, mission: null, items: [], index: 0, answers: [], scores: [],
    recorder: null, stream: null, chunks: [], recognition: null, recognized: "", confidence: 0,
    recordStartedAt: 0, recordBlob: null, recordUrl: "", autoPlayTimer: 0, curriculumCache: null
  };

  const toneMarks = {
    "ā":1,"á":2,"ǎ":3,"à":4,"ē":1,"é":2,"ě":3,"è":4,"ī":1,"í":2,"ǐ":3,"ì":4,
    "ō":1,"ó":2,"ǒ":3,"ò":4,"ū":1,"ú":2,"ǔ":3,"ù":4,"ǖ":1,"ǘ":2,"ǚ":3,"ǜ":4,
    "Ā":1,"Á":2,"Ǎ":3,"À":4,"Ē":1,"É":2,"Ě":3,"È":4,"Ī":1,"Í":2,"Ǐ":3,"Ì":4,
    "Ō":1,"Ó":2,"Ǒ":3,"Ò":4,"Ū":1,"Ú":2,"Ǔ":3,"Ù":4,"Ǖ":1,"Ǘ":2,"Ǚ":3,"Ǜ":4
  };

  function clamp(v, a=0, b=1){ return Math.max(a, Math.min(b, Number(v) || 0)); }
  function esc(v){ return String(v ?? "").replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m])); }
  function getVocab(){ try { return typeof VOCAB !== "undefined" && Array.isArray(VOCAB) ? VOCAB : (Array.isArray(window.VOCAB) ? window.VOCAB : []); } catch (_) { return Array.isArray(window.VOCAB) ? window.VOCAB : []; } }
  function getMap(){ try { return typeof VOCAB_BY_CHAR !== "undefined" ? VOCAB_BY_CHAR : (window.VOCAB_BY_CHAR || {}); } catch (_) { return window.VOCAB_BY_CHAR || {}; } }
  function uniqWords(list){ const seen=new Set(); return (list||[]).filter(w=>w&&w.char&&!seen.has(w.char)&&seen.add(w.char)); }
  function parseChars(raw){
    if (!raw || raw === "-") return [];
    return String(raw).split(";").map(part => (part.trim().match(/^(.+?)\([^)]*\)-/)||[])[1]?.trim()).filter(Boolean);
  }
  function normalizePinyin(v){ return String(v||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/ü/g,"v"); }
  function focusMatch(word, groups){
    if (!groups?.length) return true;
    const py = normalizePinyin(word?.pinyin).split(/[\s'-]+/).filter(Boolean);
    return groups.some(g => {
      if (g.type === "tone") return true;
      return py.some(s => (g.tokens||[]).some(t => {
        const x=normalizePinyin(String(t).replace(/-/g,""));
        return g.type === "initial" ? s.startsWith(x) : s.includes(x);
      }));
    });
  }
  async function curriculumDays(){
    if (state.curriculumCache) return state.curriculumCache;
    try {
      const r=await fetch(`assets/curriculum_days.json?v=${VERSION}`, {cache:"no-store"});
      const d=await r.json(); state.curriculumCache = Array.isArray(d) ? d : (d.curriculum_days || []);
    } catch (_) { state.curriculumCache=[]; }
    return state.curriculumCache;
  }
  async function wordsForMission(m){
    const direct=uniqWords([...(m?.chainVocabulary||[]), ...(m?.adaptivePlan?.newWords||[]), ...(m?.adaptivePlan?.introWords||[])]);
    if (direct.length >= 5) return direct.slice(0,18);
    const map=getMap();
    const rawChars=parseChars(m?.curriculum?.new_vocab_raw);
    let words=uniqWords([...direct, ...rawChars.map(c=>map[c]).filter(Boolean)]);
    if (Number(m?.dayNumber||0) <= 10 && m?.adaptivePlan?.focusGroups?.length) {
      const focus=getVocab().filter(w=>focusMatch(w,m.adaptivePlan.focusGroups)).sort((a,b)=>(Number(a.hsk)||9)-(Number(b.hsk)||9));
      words=uniqWords([...words,...focus]).slice(0,18);
    }
    if (words.length < 6) {
      const days=await curriculumDays(), day=Number(m?.dayNumber||1);
      for (let d=day; d>=Math.max(1,day-7) && words.length<18; d--) {
        const row=days.find(x=>Number(x.day_number)===d); if(!row) continue;
        words=uniqWords([...words,...parseChars(row.new_vocab_raw).map(c=>map[c]).filter(Boolean)]);
      }
    }
    if (words.length < 6) words=uniqWords([...words,...getVocab().filter(w=>Number(w.hsk||1)<=Math.max(1, Number(m?.stageCode?.replace(/\D/g,""))||1))]).slice(0,18);
    return words.slice(0,18);
  }

  const listenTaskEn = new Map([
    ["Nghe mẫu phát âm chuẩn, lặp lại 20 lần/âm","Listen to the standard pronunciation model and repeat each sound 20 times."],
    ["Nghe lại toàn bộ audio trong tuần, làm bài test nghe","Review all audio from the week and complete a listening test."],
    ["Nghe bài hát/podcast ngắn, tìm từ vựng đã học","Listen to a short song or podcast and identify vocabulary you have learned."],
    ["Luyện nghe theo dạng đề HSK đúng trình độ hiện tại","Complete an HSK-style listening exercise at your current level."],
    ["Nghe hội thoại chủ đề tuần trên PanTutor / audio giáo trình, chép 5 câu pinyin","Listen to the weekly dialogue and transcribe five lines in Pinyin."],
    ["Nghe mẫu câu 1-3 của chủ đề, luyện đọc theo","Listen to model sentences 1–3 for the topic and read along."],
    ["Nghe/đọc Hội thoại mẫu, chép lại 3 câu","Listen to/read the model dialogue and transcribe three sentences."],
    ["Nghe audio, trả lời câu hỏi trắc nghiệm","Listen to the audio and answer multiple-choice questions."],
    ["Nghe lại toàn bộ hội thoại chủ đề, luyện phản xạ","Review all topic dialogues and practise rapid comprehension responses."]
  ]);
  const speakTaskEn = new Map([
    ["Ghi âm bản thân đọc, so sánh với audio mẫu","Record yourself reading and compare it with the model audio."],
    ["Thi nói: trả lời 8-10 câu hỏi tổng hợp chủ đề tuần","Speaking test: answer 8–10 integrated questions from the week's topics."],
    ["Trả lời câu hỏi ứng khẩu kiểu HSKK (5 câu)","Answer five HSKK-style spontaneous speaking prompts."],
    ["Luyện phản xạ với bạn học","Practise quick spoken responses with a partner or the PanTutor model."],
    ["Shadowing theo audio mẫu, ghi âm và tự nghe lại","Shadow the model audio, record yourself and listen back."],
    ["Luyện nói mẫu câu 1-3 (ghi âm, tự sửa)","Practise model sentences 1–3, record them and self-correct."],
    ["Đóng vai hội thoại theo tình huống chủ đề","Role-play a dialogue based on the topic situation."],
    ["Nhiệm vụ thực hành: đóng vai / tự sáng tạo hội thoại theo gợi ý","Practice task: role-play or create your own dialogue from the prompts."],
    ["Đóng vai Hội thoại mẫu với bạn học hoặc ghi âm 1 mình 2 vai","Role-play the model dialogue with a partner, or record both roles yourself."],
    ["Nhiệm vụ thực hành: đóng vai / viết đoạn văn theo gợi ý trong tài liệu","Practice task: role-play and produce a guided spoken/written response from the source material."]
  ]);
  function taskEnglish(raw, type){
    const s=String(raw||"").trim();
    if (!s || s === "-") return type==="listening" ? "Complete today's listening task." : "Complete today's speaking task.";
    return (type==="listening"?listenTaskEn:speakTaskEn).get(s) || (type==="listening" ? "Complete the listening activity assigned for this Excel curriculum day." : "Complete the speaking activity assigned for this Excel curriculum day.");
  }

  function seeded(day, salt){ let x=(Number(day)||1)*2654435761 + salt*1013904223; return ()=>{ x|=0; x=x+0x6D2B79F5|0; let t=Math.imul(x^x>>>15,1|x); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
  function shuffle(arr, rnd=Math.random){ const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
  function itemFromWord(w){
    const ex=Array.isArray(w?.examples)&&w.examples.length ? w.examples[0] : null;
    return { word:w, text:String(ex?.[0]||w?.char||""), pinyin:String(ex?.[1]||w?.pinyin||""), meaning:String(ex?.[3]||w?.meaning_en||w?.meaning||w?.char||"") };
  }
  async function buildListening(m){
    const words=await wordsForMission(m), base=words.map(itemFromWord).filter(x=>x.text&&x.meaning);
    const count=Math.min(Number(m?.dayNumber)%7===0?8:6, Math.max(4,base.length));
    const rnd=seeded(m?.dayNumber,11), selected=shuffle(base,rnd).slice(0,count);
    const allMeanings=uniqStrings([...base.map(x=>x.meaning),...getVocab().slice(0,60).map(w=>w.meaning_en).filter(Boolean)]);
    return selected.map((x,i)=>{
      const distract=shuffle(allMeanings.filter(v=>v!==x.meaning), seeded(m?.dayNumber,i+31)).slice(0,3);
      return {...x, options:shuffle([x.meaning,...distract],seeded(m?.dayNumber,i+71))};
    });
  }
  async function buildSpeaking(m){
    const words=await wordsForMission(m), day=Number(m?.dayNumber||1);
    const base=words.map(w=>{
      const ex=Array.isArray(w?.examples)&&w.examples.length ? w.examples[(day+String(w.char).length)%w.examples.length] : null;
      const sentence = day<=10 ? String(w.char||"") : String(ex?.[0]||w.char||"");
      const pinyin = day<=10 ? String(w.pinyin||"") : String(ex?.[1]||w.pinyin||"");
      const meaning = day<=10 ? String(w.meaning_en||w.meaning||"") : String(ex?.[3]||w.meaning_en||w.meaning||"");
      return {word:w,text:sentence,pinyin,meaning};
    }).filter(x=>x.text);
    return shuffle(base,seeded(day,101)).slice(0, day%7===0?8:5);
  }
  function uniqStrings(a){ return [...new Set((a||[]).map(v=>String(v||"").trim()).filter(Boolean))]; }

  function ensureStyle(){
    if (document.getElementById("ptCoachSkillStyle")) return;
    const s=document.createElement("style"); s.id="ptCoachSkillStyle"; s.textContent=`
#ptCoachSkillOverlay{position:fixed;inset:0;z-index:120000;background:rgba(9,23,43,.56);backdrop-filter:blur(5px);display:grid;place-items:center;padding:18px;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;color:#172033}
#ptCoachSkillPanel{width:min(980px,100%);max-height:94vh;overflow:auto;background:#f7f9fc;border:1px solid #dfe6f0;border-radius:24px;box-shadow:0 30px 90px rgba(7,23,48,.28)}
.ptcs-head{position:sticky;top:0;z-index:4;display:flex;gap:14px;align-items:flex-start;justify-content:space-between;padding:20px 22px;background:rgba(255,255,255,.96);border-bottom:1px solid #e5ebf4;border-radius:24px 24px 0 0}.ptcs-title{font-size:23px;font-weight:900;color:#102a43}.ptcs-sub{margin-top:4px;color:#66758a;font-size:13px;line-height:1.5}.ptcs-close{border:1px solid #dfe6f0;background:#fff;border-radius:12px;padding:9px 12px;font-weight:800;color:#536174}
.ptcs-body{padding:20px 22px 24px}.ptcs-source{padding:13px 15px;border-radius:15px;background:#eef5ff;border:1px solid #dbeafe;color:#23456f;font-size:13px;line-height:1.55;margin-bottom:15px}.ptcs-progress{display:flex;align-items:center;gap:12px;margin-bottom:15px}.ptcs-bar{height:8px;flex:1;background:#e6ebf2;border-radius:99px;overflow:hidden}.ptcs-bar>span{display:block;height:100%;background:linear-gradient(90deg,#2563eb,#60a5fa);border-radius:99px}.ptcs-count{font-size:12px;font-weight:850;color:#526173;white-space:nowrap}
.ptcs-card{background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:22px;box-shadow:0 8px 28px rgba(16,42,67,.06)}.ptcs-kicker{display:inline-flex;padding:6px 9px;border-radius:999px;background:#eef5ff;color:#1d4ed8;font-size:11px;font-weight:900}.ptcs-question{margin:14px 0 8px;color:#102a43;font-size:22px;font-weight:900}.ptcs-help{color:#6b778c;font-size:13px;line-height:1.55}.ptcs-audio-orb{width:120px;height:120px;margin:17px auto;display:grid;place-items:center;border-radius:50%;background:linear-gradient(145deg,#dbeafe,#eff6ff);border:1px solid #bfdbfe;font-size:48px;box-shadow:0 12px 34px rgba(37,99,235,.13)}.ptcs-audio-orb.playing{animation:ptcsPulse 1s infinite alternate}@keyframes ptcsPulse{to{transform:scale(1.04);box-shadow:0 14px 42px rgba(37,99,235,.25)}}
.ptcs-actions{display:flex;gap:9px;justify-content:center;flex-wrap:wrap;margin:12px 0}.ptcs-btn{border:1px solid #dfe6f0;background:#fff;color:#16304e;border-radius:12px;padding:10px 14px;font-weight:850}.ptcs-btn.primary{background:#2563eb;border-color:#2563eb;color:#fff}.ptcs-btn.record{background:#e11d48;border-color:#e11d48;color:#fff}.ptcs-btn.stop{background:#102a43;border-color:#102a43;color:#fff}.ptcs-btn:disabled{opacity:.46;cursor:not-allowed}.ptcs-options{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:15px}.ptcs-option{min-height:58px;text-align:left;border:1px solid #dfe6f0;background:#fff;border-radius:13px;padding:12px 13px;color:#172033;font-weight:700}.ptcs-option:hover{border-color:#9fc0ff;background:#f8fbff}.ptcs-option.correct{border-color:#86efac;background:#ecfdf3;color:#166534}.ptcs-option.wrong{border-color:#fecaca;background:#fff1f2;color:#b91c1c}.ptcs-option:disabled{cursor:default}
.ptcs-reveal{margin-top:14px;padding:14px;border-radius:14px;background:#f8fafc;border:1px solid #e6ebf2}.ptcs-hanzi{font-size:30px;font-weight:900;color:#102a43}.ptcs-pinyin{font-size:17px;font-weight:850;color:#db2777;margin-top:3px}.ptcs-meaning{color:#526173;margin-top:5px}.ptcs-next{display:flex;justify-content:flex-end;margin-top:15px}
.ptcs-speak-target{text-align:center;padding:12px}.ptcs-speak-target .ptcs-hanzi{font-size:38px}.ptcs-rec-status{text-align:center;margin:12px 0;color:#526173;font-size:13px}.ptcs-score{margin-top:15px;padding:15px;border:1px solid #dbeafe;border-radius:16px;background:#f8fbff}.ptcs-score-big{font-size:32px;font-weight:950;color:#102a43}.ptcs-rubric{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px}.ptcs-rubric>div{padding:9px;border-radius:11px;background:#fff;border:1px solid #e2e8f0;font-size:11px;color:#526173}.ptcs-rubric b{display:block;color:#102a43;font-size:15px;margin-top:2px}.ptcs-transcript{margin-top:10px;color:#526173;font-size:12px;line-height:1.5}.ptcs-summary{text-align:center;padding:26px}.ptcs-summary .ptcs-score-big{font-size:48px}.ptcs-summary h2{color:#102a43}.ptcs-summary p{color:#66758a}.ptcs-badge{display:inline-flex;padding:6px 9px;border-radius:999px;background:#ecfdf3;color:#15803d;font-size:11px;font-weight:900}
@media(max-width:680px){#ptCoachSkillOverlay{padding:0;place-items:stretch}#ptCoachSkillPanel{max-height:100vh;border-radius:0}.ptcs-head{border-radius:0;padding:15px}.ptcs-body{padding:15px}.ptcs-options{grid-template-columns:1fr}.ptcs-rubric{grid-template-columns:1fr 1fr}.ptcs-title{font-size:19px}.ptcs-speak-target .ptcs-hanzi{font-size:32px}}
`;
    document.head.appendChild(s);
  }
  function root(){ return document.getElementById("ptCoachSkillOverlay"); }
  function close(){
    clearTimeout(state.autoPlayTimer); try{window.speechSynthesis?.cancel?.();}catch(_){}
    cleanupRecording(); root()?.remove(); state.mode=null; state.items=[]; state.index=0;
  }
  function createShell(mode,m){
    ensureStyle(); close(); state.mode=mode; state.mission=m; state.answers=[];state.scores=[];state.index=0;
    const ov=document.createElement("div");ov.id="ptCoachSkillOverlay";
    const raw=mode==="listening"?m?.curriculum?.listening_task:m?.curriculum?.speaking_task;
    const title=mode==="listening"?"🎧 AI Coach Listening Lab":"🗣️ AI Coach Speaking · Read-aloud Lab";
    ov.innerHTML=`<section id="ptCoachSkillPanel" role="dialog" aria-modal="true" aria-label="${esc(title)}"><header class="ptcs-head"><div><div class="ptcs-title">${title}</div><div class="ptcs-sub">Day ${Number(m?.dayNumber||1)} · ${esc(String(m?.topic||"120-day curriculum"))}</div></div><button class="ptcs-close" type="button">✕ Exit</button></header><div class="ptcs-body"><div class="ptcs-source"><b>Excel curriculum task:</b> ${esc(taskEnglish(raw,mode))}</div><div id="ptCoachSkillContent"><div class="ptcs-card" style="text-align:center">Preparing today's task…</div></div></div></section>`;
    document.body.appendChild(ov);ov.querySelector(".ptcs-close").onclick=close;ov.addEventListener("click",e=>{if(e.target===ov)close()});
    return ov;
  }
  function progressHtml(){ const total=state.items.length||1, idx=Math.min(total,state.index+1);return `<div class="ptcs-progress"><div class="ptcs-bar"><span style="width:${Math.round((state.index)/total*100)}%"></span></div><div class="ptcs-count">${idx} / ${total}</div></div>`; }

  function zhVoice(){
    const vs=window.speechSynthesis?.getVoices?.()||[];const zh=vs.filter(v=>/^zh(-CN)?/i.test(v.lang||""));
    return ["xiaoxiao","yunxi","yunyang","google","tingting"].reduce((hit,k)=>hit||zh.find(v=>String(v.name).toLowerCase().includes(k)),null)||zh[0]||null;
  }
  function speak(text, button=null){
    return new Promise(resolve=>{
      if(!text||!("speechSynthesis" in window)){resolve(false);return;}
      try{window.speechSynthesis.cancel();}catch(_){}
      const run=()=>{const u=new SpeechSynthesisUtterance(String(text));u.lang="zh-CN";const v=zhVoice();if(v)u.voice=v;u.rate=.78;u.pitch=1;u.onstart=()=>button?.classList.add("playing");u.onend=()=>{button?.classList.remove("playing");resolve(true)};u.onerror=()=>{button?.classList.remove("playing");resolve(false)};window.speechSynthesis.speak(u);};
      if(zhVoice()||window.speechSynthesis.getVoices().length)run();else{let done=false;const old=window.speechSynthesis.onvoiceschanged;window.speechSynthesis.onvoiceschanged=()=>{old?.();if(!done){done=true;run()}};setTimeout(()=>{if(!done){done=true;run()}},650);}
    });
  }

  async function openListening(m){
    createShell("listening",m);state.items=await buildListening(m);state.index=0;
    if(!state.items.length){document.getElementById("ptCoachSkillContent").innerHTML='<div class="ptcs-card">No curriculum-linked audio items are available for this day.</div>';return;}
    renderListening();
  }
  function renderListening(){
    const host=document.getElementById("ptCoachSkillContent"), item=state.items[state.index];if(!host||!item)return;
    host.innerHTML=progressHtml()+`<div class="ptcs-card"><span class="ptcs-kicker">LISTENING · AUDIO FIRST</span><div class="ptcs-question">Which meaning best matches the audio?</div><div class="ptcs-help">The model audio plays automatically. Replay it as many times as needed, then choose one answer.</div><button class="ptcs-audio-orb" id="ptcsListenOrb" type="button" aria-label="Replay audio">🔊</button><div class="ptcs-actions"><button class="ptcs-btn primary" id="ptcsReplay" type="button">▶ Replay audio</button></div><div class="ptcs-options">${item.options.map((o,i)=>`<button class="ptcs-option" type="button" data-i="${i}">${esc(o)}</button>`).join("")}</div><div id="ptcsReveal"></div></div>`;
    const orb=document.getElementById("ptcsListenOrb"), replay=()=>speak(item.text,orb);orb.onclick=replay;document.getElementById("ptcsReplay").onclick=replay;
    host.querySelectorAll(".ptcs-option").forEach(btn=>btn.onclick=()=>answerListening(btn,item));
    state.autoPlayTimer=setTimeout(replay,160);
  }
  function answerListening(btn,item){
    const host=document.getElementById("ptCoachSkillContent"), options=[...host.querySelectorAll(".ptcs-option")], chosen=btn.textContent.trim(),correct=chosen===item.meaning;
    options.forEach(b=>{b.disabled=true;if(b.textContent.trim()===item.meaning)b.classList.add("correct")});if(!correct)btn.classList.add("wrong");
    state.answers.push({target:item.text,pinyin:item.pinyin,meaning:item.meaning,chosen,correct});
    document.getElementById("ptcsReveal").innerHTML=`<div class="ptcs-reveal"><div class="ptcs-hanzi">${esc(item.text)}</div><div class="ptcs-pinyin" data-keep-pinyin="true">${esc(item.pinyin)}</div><div class="ptcs-meaning">${correct?"✓ Correct":"Review the model"}: ${esc(item.meaning)}</div></div><div class="ptcs-next"><button class="ptcs-btn primary" id="ptcsListenNext" type="button">${state.index+1>=state.items.length?"Finish Listening":"Next audio →"}</button></div>`;
    document.getElementById("ptcsListenNext").onclick=()=>{state.index++;state.index>=state.items.length?finishListening():renderListening()};
  }
  async function finishListening(){
    const total=state.answers.length||1, correct=state.answers.filter(x=>x.correct).length, score=Math.round(correct/total*100);
    await saveEvidence("listening",score,{evidenceType:"ai_coach_standalone_listening_lab",correct,total,wrongItems:state.answers.filter(x=>!x.correct).map(x=>({target:x.target,chosen:x.chosen,answer:x.meaning})),completeSet:true,passThreshold:60});
    renderSummary("Listening",score,`${correct} of ${total} audio questions correct.`);
  }

  async function openSpeaking(m){
    createShell("speaking",m);state.items=await buildSpeaking(m);state.index=0;
    if(!state.items.length){document.getElementById("ptCoachSkillContent").innerHTML='<div class="ptcs-card">No curriculum-linked speaking cards are available for this day.</div>';return;}
    renderSpeaking();
  }
  function renderSpeaking(){
    const host=document.getElementById("ptCoachSkillContent"), item=state.items[state.index];if(!host||!item)return;cleanupRecording();
    host.innerHTML=progressHtml()+`<div class="ptcs-card"><span class="ptcs-kicker">SPEAKING · LISTEN → READ → RECORD → SCORE</span><div class="ptcs-speak-target"><div class="ptcs-hanzi">${esc(item.text)}</div><div class="ptcs-pinyin" data-keep-pinyin="true">${esc(item.pinyin)}</div><div class="ptcs-meaning">${esc(item.meaning)}</div></div><div class="ptcs-actions"><button class="ptcs-btn primary" id="ptcsModel" type="button">▶ Play model</button><button class="ptcs-btn record" id="ptcsRecord" type="button">● Record</button><button class="ptcs-btn stop" id="ptcsStop" type="button" disabled>■ Stop & grade</button><button class="ptcs-btn" id="ptcsPlayback" type="button" disabled>▶ Replay my recording</button></div><div class="ptcs-rec-status" id="ptcsRecStatus">Listen to the model, then record the complete target.</div><div id="ptcsSpeakScore"></div></div>`;
    const model=document.getElementById("ptcsModel");model.onclick=()=>speak(item.text);document.getElementById("ptcsRecord").onclick=()=>startRecording(item);document.getElementById("ptcsStop").onclick=()=>stopRecordingAndGrade(item);document.getElementById("ptcsPlayback").onclick=()=>playRecording();
    state.autoPlayTimer=setTimeout(()=>speak(item.text),180);
  }
  function recognitionCtor(){return window.SpeechRecognition||window.webkitSpeechRecognition||null;}
  async function startRecording(item){
    cleanupRecording();
    const status=document.getElementById("ptcsRecStatus"),recBtn=document.getElementById("ptcsRecord"),stopBtn=document.getElementById("ptcsStop");
    try{
      state.stream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
      const types=["audio/webm;codecs=opus","audio/webm","audio/ogg;codecs=opus","audio/mp4"];const mime=types.find(t=>window.MediaRecorder?.isTypeSupported?.(t))||"";
      state.chunks=[];state.recorder=new MediaRecorder(state.stream,mime?{mimeType:mime}:undefined);state.recorder.ondataavailable=e=>{if(e.data?.size)state.chunks.push(e.data)};state.recordStartedAt=performance.now();state.recognized="";state.confidence=0;
      const RC=recognitionCtor();if(RC){try{const r=new RC();state.recognition=r;r.lang="zh-CN";r.interimResults=false;r.continuous=false;r.maxAlternatives=3;r.onresult=e=>{let best=null;for(let i=0;i<e.results.length;i++){for(let j=0;j<e.results[i].length;j++){const a=e.results[i][j];if(!best||Number(a.confidence||0)>Number(best.confidence||0))best=a}}if(best){state.recognized=String(best.transcript||"").trim();state.confidence=Number(best.confidence||0)}};r.onerror=()=>{};r.start()}catch(_){}}
      state.recorder.start(160);recBtn.disabled=true;stopBtn.disabled=false;if(status)status.textContent="Recording… read the full target naturally, then press Stop & grade.";
    }catch(e){if(status)status.textContent="Microphone permission is required for this speaking task.";cleanupRecording();}
  }
  async function stopRecordingAndGrade(item){
    const status=document.getElementById("ptcsRecStatus"),stopBtn=document.getElementById("ptcsStop");if(!state.recorder||state.recorder.state==="inactive")return;stopBtn.disabled=true;if(status)status.textContent="Analyzing pronunciation…";
    const blob=await new Promise(resolve=>{const r=state.recorder;r.onstop=()=>resolve(new Blob(state.chunks,{type:r.mimeType||"audio/webm"}));try{r.stop()}catch(_){resolve(new Blob(state.chunks))}});
    try{state.recognition?.stop?.()}catch(_){};await new Promise(r=>setTimeout(r,650));state.recordBlob=blob;if(state.recordUrl)URL.revokeObjectURL(state.recordUrl);state.recordUrl=URL.createObjectURL(blob);document.getElementById("ptcsPlayback").disabled=false;
    const metrics=await analyzeRecording(blob,item.pinyin);const grade=gradeSpeaking(item,state.recognized,state.confidence,metrics);state.scores[state.index]=grade.score;renderSpeakingScore(grade,item);if(status)status.textContent="Recording graded. Replay it, compare with the model, then continue.";cleanupStreamOnly();
  }
  function playRecording(){if(!state.recordUrl)return;const a=new Audio(state.recordUrl);a.play().catch(()=>{});}
  function cleanText(v){return String(v||"").toLowerCase().normalize("NFKC").replace(/[\s\p{P}\p{S}]/gu,"");}
  function editSimilarity(a,b){a=Array.from(cleanText(a));b=Array.from(cleanText(b));if(!a.length||!b.length)return 0;const prev=Array(b.length+1).fill(0).map((_,i)=>i);for(let i=1;i<=a.length;i++){let left=i,diag=i-1;for(let j=1;j<=b.length;j++){const old=prev[j],cur=Math.min(prev[j]+1,left+1,diag+(a[i-1]===b[j-1]?0:1));prev[j]=cur;left=cur;diag=old}}return clamp(1-prev[b.length]/Math.max(a.length,b.length));}
  function pinyinTones(pinyin){return String(pinyin||"").split(/[\s,'’·-]+/).map(tok=>{let t=0;for(const ch of tok){if(toneMarks[ch])t=toneMarks[ch]}return tok.replace(/[^A-Za-züÜāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/g,"")?t||5:0}).filter(Boolean);}
  async function analyzeRecording(blob,pinyin){
    try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return{duration:0,rms:0,voicedRatio:0,toneCompat:null};const ctx=new AC();const buf=await ctx.decodeAudioData(await blob.arrayBuffer());const s=buf.getChannelData(0),sr=buf.sampleRate;let e=0,peak=0;for(const v of s){e+=v*v;peak=Math.max(peak,Math.abs(v))}const rms=Math.sqrt(e/Math.max(1,s.length));const frame=Math.max(128,Math.floor(sr*.035)),hop=Math.max(64,Math.floor(sr*.02));let active=0,total=0;const pitches=[];for(let off=0;off+frame<s.length;off+=hop){total++;let fe=0;for(let i=0;i<frame;i++){const v=s[off+i];fe+=v*v}const fr=Math.sqrt(fe/frame);if(fr<Math.max(.0025,rms*.22))continue;active++;let best=0,bestLag=0;const lo=Math.floor(sr/480),hi=Math.min(frame-2,Math.floor(sr/75));for(let lag=lo;lag<=hi;lag+=3){let c=0,a=0,b=0;for(let i=0;i<frame-lag;i+=3){const u=s[off+i],v=s[off+i+lag];c+=u*v;a+=u*u;b+=v*v}const q=c/Math.sqrt(a*b||1);if(q>best){best=q;bestLag=lag}}if(best>.25&&bestLag)pitches.push({time:off/sr,hz:sr/bestLag});}
      const tones=pinyinTones(pinyin), toneCompat=tones.length&&pitches.length>=tones.length?scoreToneSequence(pitches,tones,buf.duration):null;await ctx.close().catch(()=>{});return{duration:buf.duration,rms,peak,voicedRatio:total?active/total:0,toneCompat};
    }catch(_){return{duration:0,rms:0,voicedRatio:0,toneCompat:null};}
  }
  function scoreToneSequence(pitches,tones,duration){
    const hz=pitches.map(x=>x.hz).sort((a,b)=>a-b),base=hz[Math.floor(hz.length/2)]||180;let sum=0,n=0;
    tones.forEach((tone,i)=>{const a=duration*i/tones.length,b=duration*(i+1)/tones.length,seg=pitches.filter(x=>x.time>=a&&x.time<b).map(x=>12*Math.log2(Math.max(1,x.hz)/base));if(seg.length<2)return;const first=seg.slice(0,Math.max(1,Math.ceil(seg.length*.3))).reduce((s,v)=>s+v,0)/Math.max(1,Math.ceil(seg.length*.3)),lastPart=seg.slice(Math.floor(seg.length*.7)),last=lastPart.reduce((s,v)=>s+v,0)/Math.max(1,lastPart.length),midPart=seg.slice(Math.floor(seg.length*.3),Math.max(Math.floor(seg.length*.7),Math.floor(seg.length*.3)+1)),mid=midPart.reduce((s,v)=>s+v,0)/Math.max(1,midPart.length),slope=last-first,range=Math.max(...seg)-Math.min(...seg),dip=Math.min(first,last)-mid;let q=tone===1?clamp(1-Math.abs(slope)/3-range/10):tone===2?clamp(.5+slope/5):tone===3?clamp(.35+Math.max(0,dip)/3+Math.max(0,last-mid)/4):tone===4?clamp(.5-slope/5):clamp(1-range/7);sum+=q;n++;});return n?sum/n:null;
  }
  function gradeSpeaking(item,recognized,confidence,metrics){
    const target=cleanText(item.text),heard=cleanText(recognized),sim=editSimilarity(target,heard),conf=confidence>0?clamp(confidence):clamp(sim*.8),chars=Math.max(1,Array.from(target).length),expected=Math.max(.55,Math.min(8,chars*.34+.25)),dur=Number(metrics?.duration||0),durationFit=dur?clamp(1-Math.abs(dur-expected)/Math.max(expected,1.1)):0,voiced=clamp(metrics?.voicedRatio||0),signal=clamp(((metrics?.rms||0)-.0015)/.035*.55+voiced*.45),toneCompat=metrics?.toneCompat;
    const exact=!!target&&target===heard;
    if(exact)return{score:100,exact,similarity:1,recognized,tone:35,segmental:35,articulation:20,fluency:10,feedback:"Full compatibility detected. The recognized Mandarin matches the target exactly: 100/100.",metrics};
    let tone=Math.round(35*clamp(toneCompat==null?(.46*sim+.28*conf+.26*signal):(.62*toneCompat+.22*sim+.16*signal)));
    let segmental=Math.round(35*clamp(.76*sim+.24*conf));
    let articulation=Math.round(20*clamp(.52*sim+.30*signal+.18*conf));
    let fluency=Math.round(10*clamp(.62*durationFit+.38*voiced));let score=tone+segmental+articulation+fluency;
    const cap=sim<.35?39:sim<.55?59:sim<.72?74:sim<.88?89:96;score=Math.min(score,cap);if(!heard)score=Math.min(score,45);
    const feedback=!heard?"The recording was captured, but Mandarin speech recognition could not verify the target. Replay the model, speak closer to the microphone and try again.":sim<.55?"The recognized content differs substantially from the target. Rebuild the sentence slowly, then repeat with the model.":sim<.88?"The target is partly compatible. Focus on the mismatched syllables, tone direction and sentence rhythm.":"Very close. A small pronunciation or recognition mismatch remains; compare once more with the model.";
    return{score,exact:false,similarity:sim,recognized,tone,segmental,articulation,fluency,feedback,metrics};
  }
  function renderSpeakingScore(g,item){
    const host=document.getElementById("ptcsSpeakScore");if(!host)return;host.innerHTML=`<div class="ptcs-score"><div class="ptcs-score-big">${g.score}/100</div><div class="ptcs-help">${esc(g.feedback)}</div><div class="ptcs-rubric"><div>Tone /35<b>${g.tone}</b></div><div>Initial–final /35<b>${g.segmental}</b></div><div>Articulation /20<b>${g.articulation}</b></div><div>Fluency /10<b>${g.fluency}</b></div></div><div class="ptcs-transcript"><b>Recognized:</b> ${esc(g.recognized||"No reliable transcript")}<br><b>Target:</b> ${esc(item.text)}</div><div class="ptcs-next"><button class="ptcs-btn primary" id="ptcsSpeakNext" type="button">${state.index+1>=state.items.length?"Finish Speaking":"Next card →"}</button></div></div>`;document.getElementById("ptcsSpeakNext").onclick=()=>{state.index++;state.index>=state.items.length?finishSpeaking():renderSpeaking()};
  }
  async function finishSpeaking(){
    const vals=state.scores.filter(Number.isFinite),score=vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):0;
    await saveEvidence("speaking",score,{evidenceType:"ai_coach_standalone_speaking_readaloud_lab",cardScores:vals,total:state.items.length,graded:vals.length,completeSet:vals.length===state.items.length});
    renderSummary("Speaking / Read-aloud",score,`${vals.length} of ${state.items.length} cards were recorded and graded.`);
  }
  function cleanupStreamOnly(){try{state.stream?.getTracks?.().forEach(t=>t.stop())}catch(_){}state.stream=null;state.recorder=null;state.recognition=null;}
  function cleanupRecording(){try{if(state.recorder&&state.recorder.state!=="inactive")state.recorder.stop()}catch(_){}try{state.recognition?.abort?.()}catch(_){}cleanupStreamOnly();if(state.recordUrl){try{URL.revokeObjectURL(state.recordUrl)}catch(_){}state.recordUrl=""}state.recordBlob=null;}

  async function saveEvidence(taskId,score,evidence){
    const m=state.mission,day=Number(m?.dayNumber||1),full={...evidence,scorePercent:score,dayNumber:day,sourceWorkbook:"KeHoach_PandaHan_120Ngay_HSK3_v2_TichHop_PinyinToneQuest.xlsx",curriculumTask:taskId==="listening"?m?.curriculum?.listening_task:m?.curriculum?.speaking_task,date:new Date().toISOString(),rawSource:`ai-coach-standalone-${taskId}`};
    try{localStorage.setItem(`pantutor_ai_coach_${taskId}_day_${day}`,JSON.stringify(full))}catch(_){}
    let out=null;try{out=await window.PandaHanSchedule?.recordTaskScore?.(day,taskId,score,`verified:ai-coach-standalone-${taskId}`,full)}catch(e){console.warn("Standalone AI Coach evidence sync:",taskId,e?.code||e?.message||e)}
    window.dispatchEvent(new CustomEvent("pandahan-learning-evaluation",{detail:{verified:true,taskId,dayNumber:day,scorePercent:score,passed:score>=Number(full.passThreshold||30),action:"standalone_task_completed",...full}}));
    return out;
  }
  function renderSummary(label,score,detail){
    const host=document.getElementById("ptCoachSkillContent");if(!host)return;host.innerHTML=`<div class="ptcs-card ptcs-summary"><span class="ptcs-badge">Evidence saved to Day ${Number(state.mission?.dayNumber||1)}</span><h2>${esc(label)} complete</h2><div class="ptcs-score-big">${score}/100</div><p>${esc(detail)}</p><p>This task records evidence only. <b>Pinyin Tone Quest remains the only next-day unlock gate.</b></p><div class="ptcs-actions"><button class="ptcs-btn primary" id="ptcsDone" type="button">Return to AI Coach</button><button class="ptcs-btn" id="ptcsRedo" type="button">Redo task</button></div></div>`;document.getElementById("ptcsDone").onclick=close;document.getElementById("ptcsRedo").onclick=()=>{const m=state.mission,mode=state.mode;mode==="listening"?openListening(m):openSpeaking(m)};
  }

  window.PandaHanCoachSkills={openListening,openSpeaking,close,taskEnglish,version:VERSION};
})();
