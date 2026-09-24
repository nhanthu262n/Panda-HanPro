(() => {
  "use strict";

  const VERSION = "v57.2-phonetics-sync-deep-feedback-20260924";
  const base = window.PandaHanCoachSkills || {};
  const PASS = Object.freeze({
    phonetics_core: 30,
    listening: 60,
    speaking: 60,
    "vocab-intro": 70,
    reading_writing: 60,
    srs: 60,
    mistake_review: 70
  });

  const S = {
    mode:null, mission:null, items:[], index:0, answers:[], scores:[], phase:"",
    stream:null, recorder:null, chunks:[], recognition:null, recognitionCandidates:[],
    audioCtx:null, sourceNode:null, processor:null, silentGain:null, pcmChunks:[], pcmRate:0,
    recordBlob:null, recordUrl:"", autoTimer:0, currentWord:null, recognitionError:"", recognitionEnded:false, reports:[], speakingItems:[], itemStartedAt:0, variant:0
  };

  const toneMarks = {"ā":1,"á":2,"ǎ":3,"à":4,"ē":1,"é":2,"ě":3,"è":4,"ī":1,"í":2,"ǐ":3,"ì":4,"ō":1,"ó":2,"ǒ":3,"ò":4,"ū":1,"ú":2,"ǔ":3,"ù":4,"ǖ":1,"ǘ":2,"ǚ":3,"ǜ":4,"Ā":1,"Á":2,"Ǎ":3,"À":4,"Ē":1,"É":2,"Ě":3,"È":4,"Ī":1,"Í":2,"Ǐ":3,"Ì":4,"Ō":1,"Ó":2,"Ǒ":3,"Ò":4,"Ū":1,"Ú":2,"Ǔ":3,"Ù":4,"Ǖ":1,"Ǘ":2,"Ǚ":3,"Ǜ":4};
  const toneVowels = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/i;

  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number(v)||0));
  const esc=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  const T=(vi,en)=>window.LANG_MODE==="vi"?String(vi??""):String(en??vi??"");
  const localizeRoot=(root)=>{try{window.PanTutorV57Vietnamese?.apply?.(root||document.body)}catch(_){}};
  const uniq=a=>[...new Set((a||[]).filter(Boolean))];
  const clean=v=>String(v||"").toLowerCase().normalize("NFKC").replace(/[\s\p{P}\p{S}]/gu,"");
  const cleanPinyin=v=>String(v||"").toLowerCase().normalize("NFC").replace(/[\s'’·-]+/g,"").replace(/u:/g,"ü");
  const stripTone=v=>cleanPinyin(v).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/ü/g,"v");
  function vocab(){try{return Array.isArray(window.VOCAB)?window.VOCAB:(typeof VOCAB!=="undefined"&&Array.isArray(VOCAB)?VOCAB:[])}catch(_){return[]}}
  function vocabMap(){try{return window.VOCAB_BY_CHAR||(typeof VOCAB_BY_CHAR!=="undefined"?VOCAB_BY_CHAR:{})}catch(_){return{}}}
  function wordMeaning(w){
    return String(window.LANG_MODE==="vi"
      ? (w?.meaning ?? w?.meaning_vn ?? w?.meaning_en ?? "")
      : (w?.meaning_en ?? w?.meaning ?? w?.meaning_vn ?? "")
    ).trim();
  }
  function exampleMeaning(ex,w){
    return String(window.LANG_MODE==="vi"
      ? (ex?.[2] ?? wordMeaning(w))
      : (ex?.[3] ?? wordMeaning(w))
    ).trim();
  }
  function mission(){return S.mission||window.PandaHanMission?.getCurrent?.()||window.PandaHanMission?.getMission?.()||null}
  function wordList(m){
    const seen=new Set(),out=[];
    const add=w=>{if(w?.char&&!seen.has(w.char)){seen.add(w.char);out.push(w)}};
    [...(m?.chainVocabulary||[]),...(m?.adaptivePlan?.newWords||[]),...(m?.adaptivePlan?.introWords||[]),...(m?.adaptivePlan?.practiceWords||[])].forEach(add);
    const raw=String(m?.curriculum?.new_vocab_raw||"");
    raw.split(";").forEach(p=>{const c=(p.trim().match(/^(.+?)\([^)]*\)-/)||[])[1]?.trim();if(c)add(vocabMap()[c])});
    if(out.length<8){
      const level=Number(m?.dayNumber||1)<=35?1:Number(m?.dayNumber||1)<=70?2:3;
      vocab().filter(w=>Number(w.hsk||1)<=level).slice(0,80).forEach(add);
    }
    return out.slice(0,24);
  }
  function itemFromWord(w){
    const ex=Array.isArray(w?.examples)&&w.examples.length?w.examples[0]:null;
    return {word:w,text:String(ex?.[0]||w?.char||""),pinyin:String(ex?.[1]||w?.pinyin||""),meaning:exampleMeaning(ex,w),char:String(w?.char||"")};
  }
  function editSimilarity(a,b){
    a=Array.from(clean(a));b=Array.from(clean(b)); if(!a.length||!b.length)return 0;
    const prev=Array.from({length:b.length+1},(_,i)=>i);
    for(let i=1;i<=a.length;i++){let left=i,diag=i-1;for(let j=1;j<=b.length;j++){const old=prev[j];const cur=Math.min(prev[j]+1,left+1,diag+(a[i-1]===b[j-1]?0:1));prev[j]=cur;left=cur;diag=old}}
    return clamp(1-prev[b.length]/Math.max(a.length,b.length));
  }
  function shuffle(a,seed=Math.random){const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(seed()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x}
  function seeded(day,salt){let x=((Number(day)||1)*2654435761+((salt||1)+Number(S.variant||0)*7919)*1013904223)|0;return()=>{x=(x+0x6D2B79F5)|0;let t=Math.imul(x^(x>>>15),1|x);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
  
function nextVariant(mode,day){
    const key=`pantutor_v57_attempt_${String(mode||"task")}_${Number(day)||1}`;
    const n=(Number(localStorage.getItem(key)||0)+1)%9973;
    localStorage.setItem(key,String(n));
    return n||1;
  }
  function cleanOption(v){
    let s=String(v??"").normalize("NFKC").trim();
    s=s.replace(/^\s*[\(\[\{【]?\s*[A-Da-d]\s*[\)\]\}】.:\-、]\s*/u,"");
    s=s.replace(/^\s*[A-Da-d]\s*[.)：:\-、]\s*/u,"");
    const pairs=[["(",")"],["[","]"],["{","}"],["【","】"],["“","”"],['"','"'],["'","'"]];
    let again=true;
    while(again&&s.length>1){again=false;for(const [a,b] of pairs){if(s.startsWith(a)&&s.endsWith(b)){s=s.slice(a.length,-b.length).trim();again=true}}}
    if(s.length<=40)s=s.replace(/[\s。．.，,；;：:！？!?]+$/u,"").trim();
    return s.replace(/\s+/g," ").trim();
  }
  function sameKind(a,b){
    const k=x=>/[\u3400-\u9fff]/u.test(x)?"zh":/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/iu.test(x)?"pinyin":"latin";
    return k(String(a||""))===k(String(b||""));
  }
  function validateOptions(answer,candidates,rnd=Math.random){
    const ans=cleanOption(answer),out=[ans];
    const pool=uniq((candidates||[]).map(cleanOption)).filter(x=>x&&x!==ans);
    pool.sort((a,b)=>(sameKind(ans,a)?0:1)-(sameKind(ans,b)?0:1)||Math.abs(a.length-ans.length)-Math.abs(b.length-ans.length));
    for(const x of shuffle(pool,rnd)){if(!out.includes(x))out.push(x);if(out.length===4)break}
    return out.length===4?shuffle(out,rnd):out;
  }
  function plausibleMeaningDistractors(w,answer,day,index){
    const targetPos=String(w?.pos||""),targetHsk=Number(w?.hsk||1);
    const near=vocab().filter(x=>x?.char!==w?.char)
      .filter(x=>!targetPos||String(x?.pos||"")===targetPos)
      .filter(x=>Math.abs(Number(x?.hsk||1)-targetHsk)<=1)
      .map(wordMeaning).filter(Boolean);
    const sameLevel=vocab().filter(x=>x?.char!==w?.char).filter(x=>Math.abs(Number(x?.hsk||1)-targetHsk)<=1).map(wordMeaning).filter(Boolean);
    const fallback=vocab().filter(x=>x?.char!==w?.char).map(wordMeaning).filter(Boolean);
    return validateOptions(answer,near.concat(sameLevel,fallback),seeded(day,7000+index+S.variant*31));
  }
  function plausiblePinyinDistractors(py,words,day,index){
    const base=stripTone(py),pool=[];
    (words||[]).forEach(w=>{const x=firstSyllable(w?.pinyin||"");if(x&&x!==py&&(stripTone(x)===base||x[0]===py[0]||Math.abs(x.length-py.length)<=1))pool.push(x)});
    return validateOptions(py,pool.concat((words||[]).map(w=>firstSyllable(w?.pinyin||"")).filter(Boolean)),seeded(day,7100+index+S.variant*37));
  }
  function avoidImmediateRepeat(items,mode,day){
    const arr=[...(items||[])];if(!arr.length)return arr;
    const sig=x=>String(x?.id||x?.text||x?.char||x?.prompt||x?.word?.char||"").trim();
    const key=`pantutor_v57_last_question_${String(mode)}_${Number(day)||1}`,prev=localStorage.getItem(key)||"";
    if(arr.length>1&&sig(arr[0])&&sig(arr[0])===prev)arr.push(arr.shift());
    localStorage.setItem(key,sig(arr[0]));
    return arr;
  }

  function taskTitle(mode){return ({phonetics_core:T("🎼 AI Coach · Phòng luyện ngữ âm","🎼 AI Coach Phonetics Core Lab"),srs:T("🔁 AI Coach · Ôn SRS đến hạn","🔁 AI Coach SRS Due Review"),"vocab-intro":T("📚 AI Coach · Từ vựng theo lộ trình Excel","📚 AI Coach Excel Vocabulary Lab"),reading_writing:T("📖 AI Coach · Đọc / Viết","📖 AI Coach Reading / Writing Lab"),mistake_review:T("🔄 AI Coach · Ôn lỗi sai","🔄 AI Coach Mistake Review"),speaking:T("🗣️ AI Coach · Nói / Đọc thành tiếng","🗣️ AI Coach Speaking · Read-aloud Lab")})[mode]||T("Nhiệm vụ AI Coach","AI Coach Task")}
  function sourceText(mode,m){
    const c=m?.curriculum||{};
    if(mode==="srs")return window.LANG_MODE==="vi"?(c.srs_review_task||"Ôn các từ vựng SRS đến hạn."):(c.srs_review_task||"Review due SRS vocabulary.");
    if(mode==="reading_writing")return window.LANG_MODE==="vi"?(c.reading_writing_task||"Hoàn thành nhiệm vụ Đọc / Viết hôm nay."):(c.reading_writing_task||"Complete today's Reading / Writing assignment.");
    if(mode==="mistake_review")return window.LANG_MODE==="vi"?`${window.PandaHanMistakes?.getQueue?.().length||0} lỗi chưa xử lý trong hàng đợi ôn lỗi.`:`${window.PandaHanMistakes?.getQueue?.().length||0} unresolved item(s) in the mistake queue.`;
    if(mode==="phonetics_core")return window.LANG_MODE==="vi"?`${c.topic||m?.topic||"Pinyin Bootcamp"} · nhiệm vụ nhận diện cho Ngày ${Number(m?.dayNumber||1)}.`:`${c.topic||m?.topic||"Pinyin Bootcamp"} · objective recognition task for Day ${Number(m?.dayNumber||1)}.`;
    if(mode==="vocab-intro")return Number(m?.dayNumber||1)<=10?T("Ví dụ từ vựng gắn với ngữ âm của ngày Bootcamp này.","Phonetics-linked vocabulary examples for this Bootcamp Day."):T(`Học toàn bộ từ vựng Excel được giao cho Ngày ${Number(m?.dayNumber||1)} và ghi kết quả thực vào SRS.`,`Learn the complete Excel vocabulary set assigned to Day ${Number(m?.dayNumber||1)} and feed actual answers into SRS.`);
    if(mode==="speaking")return base.taskEnglish?.(c.speaking_task,"speaking")||c.speaking_task||"Record the assigned read-aloud task.";
    return T("Hoàn thành nhiệm vụ được giao.","Complete the assigned task.");
  }

  function ensureStyle(){
    if(document.getElementById("ptCoachSuiteStyleV53"))return;
    const st=document.createElement("style");st.id="ptCoachSuiteStyleV53";st.textContent=`
#ptCoachSkillOverlay{position:fixed;inset:0;z-index:120500;background:rgba(9,23,43,.58);backdrop-filter:blur(5px);display:grid;place-items:center;padding:18px;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;color:#172033}
#ptCoachSkillPanel{width:min(1020px,100%);max-height:95vh;overflow:auto;background:#f7f9fc;border:1px solid #dfe6f0;border-radius:24px;box-shadow:0 30px 90px rgba(7,23,48,.28)}
.ptcs-head{position:sticky;top:0;z-index:5;display:flex;gap:14px;align-items:flex-start;justify-content:space-between;padding:19px 22px;background:rgba(255,255,255,.97);border-bottom:1px solid #e5ebf4}.ptcs-title{font-size:22px;font-weight:900;color:#102a43}.ptcs-sub{margin-top:4px;color:#66758a;font-size:12.5px}.ptcs-close{border:1px solid #dfe6f0;background:#fff;border-radius:12px;padding:9px 12px;font-weight:800;color:#536174}.ptcs-body{padding:20px 22px 24px}.ptcs-source{padding:12px 14px;border-radius:14px;background:#eef5ff;border:1px solid #dbeafe;color:#23456f;font-size:12.5px;line-height:1.55;margin-bottom:14px}.ptcs-progress{display:flex;align-items:center;gap:12px;margin-bottom:14px}.ptcs-bar{height:8px;flex:1;background:#e6ebf2;border-radius:99px;overflow:hidden}.ptcs-bar span{display:block;height:100%;background:linear-gradient(90deg,#2563eb,#60a5fa)}.ptcs-count{font-size:12px;font-weight:850;color:#526173}.ptcs-card{background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:22px;box-shadow:0 8px 28px rgba(16,42,67,.055)}.ptcs-kicker{display:inline-flex;padding:6px 9px;border-radius:999px;background:#eef5ff;color:#1d4ed8;font-size:10.5px;font-weight:900}.ptcs-question{margin:14px 0 8px;color:#102a43;font-size:21px;font-weight:900}.ptcs-help{color:#6b778c;font-size:12.5px;line-height:1.55}.ptcs-hanzi{font-size:32px;font-weight:900;color:#102a43}.ptcs-pinyin{font-size:17px;font-weight:850;color:#db2777;margin-top:3px}.ptcs-meaning{color:#526173;margin-top:5px}.ptcs-actions{display:flex;gap:9px;justify-content:center;flex-wrap:wrap;margin:13px 0}.ptcs-btn{border:1px solid #dfe6f0;background:#fff;color:#16304e;border-radius:12px;padding:10px 14px;font-weight:850}.ptcs-btn.primary{background:#2563eb;border-color:#2563eb;color:#fff}.ptcs-btn.record{background:#e11d48;border-color:#e11d48;color:#fff}.ptcs-btn.stop{background:#102a43;border-color:#102a43;color:#fff}.ptcs-btn:disabled{opacity:.45;cursor:not-allowed}.ptcs-options{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:15px}.ptcs-option{min-height:56px;text-align:left;border:1px solid #dfe6f0;background:#fff;border-radius:13px;padding:12px 13px;color:#172033;font-weight:700}.ptcs-option:hover{border-color:#9fc0ff;background:#f8fbff}.ptcs-option.correct{border-color:#86efac;background:#ecfdf3;color:#166534}.ptcs-option.wrong{border-color:#fecaca;background:#fff1f2;color:#b91c1c}.ptcs-input{width:100%;min-height:48px;border:1px solid #dfe6f0;border-radius:12px;padding:11px 13px;font-size:15px;outline:none}.ptcs-input:focus{border-color:#93b4ff;box-shadow:0 0 0 3px #eef5ff}.ptcs-reveal{margin-top:14px;padding:14px;border-radius:14px;background:#f8fafc;border:1px solid #e6ebf2}.ptcs-next{display:flex;justify-content:flex-end;margin-top:14px}.ptcs-audio-orb{width:112px;height:112px;margin:16px auto;display:grid;place-items:center;border-radius:50%;background:linear-gradient(145deg,#dbeafe,#eff6ff);border:1px solid #bfdbfe;font-size:44px}.ptcs-audio-orb.playing{box-shadow:0 0 0 9px rgba(37,99,235,.08)}.ptcs-speak-target{text-align:center;padding:10px}.ptcs-speak-target .ptcs-hanzi{font-size:38px}.ptcs-rec-status{text-align:center;margin:11px 0;color:#526173;font-size:12.5px}.ptcs-score{margin-top:15px;padding:15px;border:1px solid #dbeafe;border-radius:16px;background:#f8fbff}.ptcs-score-big{font-size:34px;font-weight:950;color:#102a43}.ptcs-rubric{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px}.ptcs-rubric>div{padding:9px;border-radius:11px;background:#fff;border:1px solid #e2e8f0;font-size:11px;color:#526173}.ptcs-rubric b{display:block;color:#102a43;font-size:15px;margin-top:2px}.ptcs-summary{text-align:center;padding:27px}.ptcs-summary .ptcs-score-big{font-size:50px}.ptcs-badge{display:inline-flex;padding:6px 9px;border-radius:999px;background:#ecfdf3;color:#15803d;font-size:11px;font-weight:900}.ptcs-badge.fail{background:#fff1f2;color:#be123c}.ptcs-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:13px}.ptcs-mini{border:1px solid #e2e8f0;border-radius:14px;padding:12px;background:#f8fafc}.ptcs-mini b{display:block;color:#102a43}.ptcs-mini span{display:block;color:#6b778c;font-size:11px;margin-top:4px}.ptcs-writing-rubric{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:10px}.ptcs-writing-rubric div{background:#f8fafc;border:1px solid #e5ebf4;border-radius:10px;padding:8px;font-size:11px;color:#526173}.ptcs-writing-rubric b{color:#102a43}

.ptcs-teacher-report{margin-top:14px;border:1px solid #dbeafe;border-radius:16px;background:#fbfdff;overflow:hidden;text-align:left}.ptcs-teacher-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;background:#eef5ff;border-bottom:1px solid #dbeafe}.ptcs-teacher-head b{color:#102a43;font-size:14px}.ptcs-teacher-head span{font-size:11px;font-weight:900;color:#1d4ed8}.ptcs-teacher-body{padding:13px 14px}.ptcs-teacher-section{margin-top:10px;padding-top:10px;border-top:1px dashed #d9e3ef}.ptcs-teacher-section:first-child{margin-top:0;padding-top:0;border-top:0}.ptcs-teacher-section h4{margin:0 0 5px;color:#102a43;font-size:12px}.ptcs-teacher-section p{margin:0;color:#526173;font-size:12px;line-height:1.58}.ptcs-teacher-list{margin:5px 0 0;padding-left:18px;color:#526173;font-size:12px;line-height:1.58}.ptcs-breakdown{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin-top:10px}.ptcs-breakdown>div{padding:8px;border:1px solid #e2e8f0;border-radius:10px;background:#fff;color:#66758a;font-size:10.5px}.ptcs-breakdown b{display:block;color:#102a43;font-size:14px;margin-top:2px}.ptcs-model-answer{margin-top:7px;padding:9px 10px;border-left:3px solid #60a5fa;background:#f8fbff;color:#23456f;font-size:12px;line-height:1.55}.ptcs-teacher-summary{margin:16px 0 0;padding:14px;border-radius:15px;background:#f8fbff;border:1px solid #dbeafe;text-align:left}.ptcs-teacher-summary h3{margin:0 0 7px;color:#102a43;font-size:15px}.ptcs-teacher-summary p{margin:5px 0;color:#526173;font-size:12px;line-height:1.55}
.ptcs-option.ptcs-sound-choice{position:relative;min-height:108px;display:grid;place-items:center;gap:2px;padding:13px 12px}.ptcs-sound-choice .ptcs-choice-hanzi{font-size:30px;font-weight:900;color:#263548;line-height:1}.ptcs-sound-choice .ptcs-choice-pinyin{font-size:15px;font-weight:900;color:#ec4899;line-height:1.2}.ptcs-sound-choice .ptcs-choice-tone{font-size:10px;color:#7b8798;font-weight:800}.ptcs-option.ptcs-sound-choice.correct .ptcs-choice-pinyin{color:#15803d}.ptcs-option.ptcs-sound-choice.wrong .ptcs-choice-pinyin{color:#b91c1c}
@media(max-width:680px){.ptcs-breakdown{grid-template-columns:1fr 1fr}}

@media(max-width:680px){#ptCoachSkillOverlay{padding:0;place-items:stretch}#ptCoachSkillPanel{max-height:100vh;border-radius:0}.ptcs-head{padding:14px}.ptcs-body{padding:14px}.ptcs-options{grid-template-columns:1fr}.ptcs-rubric,.ptcs-grid,.ptcs-writing-rubric{grid-template-columns:1fr 1fr}.ptcs-title{font-size:18px}.ptcs-speak-target .ptcs-hanzi{font-size:31px}}
`;
    document.head.appendChild(st);
  }
  function close(){
    clearTimeout(S.autoTimer);try{speechSynthesis?.cancel?.()}catch(_){};cleanupAudio();
    document.getElementById("ptCoachSkillOverlay")?.remove();S.mode=null;S.items=[];S.answers=[];S.scores=[];S.reports=[];S.index=0;
  }
  function createShell(mode,m){
    try{base.close?.()}catch(_){};close();ensureStyle();S.mode=mode;S.mission=m||mission();S.variant=nextVariant(mode,S.mission?.dayNumber);S.items=[];S.index=0;S.answers=[];S.scores=[];S.reports=[];S.speakingItems=[];S.phase="";
    const mm=S.mission||{};const ov=document.createElement("div");ov.id="ptCoachSkillOverlay";const title=taskTitle(mode);
    ov.innerHTML=`<section id="ptCoachSkillPanel" role="dialog" aria-modal="true"><header class="ptcs-head"><div><div class="ptcs-title">${esc(title)}</div><div class="ptcs-sub">${T("Ngày","Day")} ${Number(mm.dayNumber||1)} · ${esc(mm.topic||mm.curriculum?.topic||T("lộ trình 120 ngày","120-day curriculum"))}</div></div><button class="ptcs-close" type="button">✕ ${T("Thoát","Exit")}</button></header><div class="ptcs-body"><div class="ptcs-source"><b>${T("Nhiệm vụ theo lộ trình Excel:","Excel curriculum task:")}</b> ${esc(sourceText(mode,mm))}</div><div id="ptCoachSkillContent"><div class="ptcs-card" style="text-align:center">${T("Đang chuẩn bị nhiệm vụ…","Preparing task…")}</div></div></div></section>`;
    document.body.appendChild(ov);ov.querySelector(".ptcs-close").onclick=close;ov.addEventListener("click",e=>{if(e.target===ov)close()});localizeRoot(ov);return ov;
  }
  function progressHtml(index=S.index,total=S.items.length){const n=Math.max(1,total||1);return `<div class="ptcs-progress"><div class="ptcs-bar"><span style="width:${Math.round(index/n*100)}%"></span></div><div class="ptcs-count">${Math.min(n,index+1)} / ${n}</div></div>`}
  function recordTeacherReport(area,score,strength,focus){S.reports.push({area:String(area||"Task"),score:Number(score)||0,strength:String(strength||""),focus:String(focus||"")})}
  function teacherReportHtml(cfg={}){
    const rows=(cfg.sections||[]).filter(Boolean).map(s=>`<div class="ptcs-teacher-section"><h4>${esc(s.title||T("Phân tích","Analysis"))}</h4>${Array.isArray(s.lines)?`<ul class="ptcs-teacher-list">${s.lines.filter(Boolean).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:`<p>${esc(s.text||"")}</p>`}</div>`).join("");
    const model=cfg.model?`<div class="ptcs-teacher-section"><h4>${T("Mẫu / tham chiếu","Model / reference")}</h4><div class="ptcs-model-answer">${esc(cfg.model)}</div></div>`:"";
    const next=cfg.next?`<div class="ptcs-teacher-section"><h4>${T("Luyện tập tiếp theo","Next practice")}</h4><p>${esc(cfg.next)}</p></div>`:"";
    return `<div class="ptcs-teacher-report"><div class="ptcs-teacher-head"><b>🧑‍🏫 ${T("Phản hồi giáo viên","Teacher feedback")}</b><span>${esc(cfg.status||T("PHÂN TÍCH","ANALYSIS"))}</span></div><div class="ptcs-teacher-body">${cfg.overview?`<div class="ptcs-teacher-section"><h4>${T("Nhận xét tổng quan","Overall comment")}</h4><p>${esc(cfg.overview)}</p></div>`:""}${cfg.breakdown||""}${rows}${model}${next}</div></div>`;
  }
  function toneLabel(n){const en=({1:"Tone 1 — high and level",2:"Tone 2 — rising",3:"Tone 3 — low/dipping with recovery",4:"Tone 4 — sharp falling",5:"Neutral tone — short and light"})[Number(n)]||"Tone pattern not identified";const vi=({1:"Thanh 1 — cao và ngang",2:"Thanh 2 — đi lên",3:"Thanh 3 — thấp, hạ rồi hồi lên",4:"Thanh 4 — hạ mạnh",5:"Thanh nhẹ — ngắn và nhẹ"})[Number(n)]||"Chưa xác định được mẫu thanh điệu";return T(vi,en)}
  function meaningOfWord(w){return wordMeaning(w)}
  function pinyinOfWord(w){return String(w?.pinyin||"").trim()}
  function exampleOfWord(w){const ex=Array.isArray(w?.examples)&&w.examples[0]?w.examples[0]:null;return ex?{zh:String(ex[0]||""),py:String(ex[1]||""),meaning:exampleMeaning(ex,w)}:{zh:"",py:"",meaning:""}}
  function distractorWordForMeaning(meaning){return vocab().find(w=>wordMeaning(w)===String(meaning||"").trim())||null}

  /*
   * v57.2 learner-feedback intelligence.
   * The first ten HSK1 entries mirror the pedagogical fields in the uploaded
   * HSK1_FIRST10_VOCABULARY_INTELLIGENCE document: usage patterns, confusables,
   * common learner errors, context/model and repair prompts. Mnemonics/etymology
   * are intentionally not used as grammar evidence.
   */
  const VOCAB_INTELLIGENCE = Object.freeze({
    "爱":{
      patterns:["S + 爱 + O","S + 爱 + V","我爱……，但是……"],
      confusables:["喜欢: thích, thường nhẹ hơn","爱好: sở thích (danh từ)","想: muốn, không phải yêu/thích"],
      errors:["爱看书 không cần 的 giữa 爱 và 看","Không dùng 爱 thay cho 想 khi diễn đạt “muốn”"],
      model:"我爱我的家人，也爱看书。",
      pronunciation:"ài · thanh 4; âm tiết mở đầu không có phụ âm đầu, vần ai."
    },
    "八":{
      patterns:["S + 有 + 八 + lượng từ + N","现在是八点","S + 八岁"],
      confusables:["六: sáu","九: chín","百: trăm"],
      errors:["Trong mẫu đếm người/sách cơ bản cần lượng từ phù hợp","八点 là 8 giờ; đọc bā thanh 1"],
      model:"我家有八口人。现在是八点。",
      pronunciation:"bā · b + a · thanh 1 cao và ngang."
    },
    "爸爸":{
      patterns:["这是我爸爸","我爸爸是 + nghề nghiệp","爸爸在 + V"],
      confusables:["妈妈: mẹ","父亲: cha, trang trọng hơn","叔叔: chú/bác nam"],
      errors:["Khi nói nghề nghiệp dùng 是: 我爸爸是医生","爸爸 là cách gọi thân mật; 父亲 trang trọng hơn"],
      model:"我爸爸是医生。他在医院工作。",
      pronunciation:"bàba · âm tiết đầu bà thanh 4; âm tiết sau thường nhẹ/neutral."
    },
    "杯子":{
      patterns:["N + 里 + 有 + substance","请给我一个杯子","用杯子喝……"],
      confusables:["碗: bát/tô","瓶子: chai","茶杯: tách trà"],
      errors:["Một cái cốc: 一个杯子, không nói 一杯子","Phân biệt 一个杯子 với 一杯水"],
      model:"请给我一个杯子。杯子里有茶。",
      pronunciation:"bēizi · bēi thanh 1; zi thường đọc nhẹ."
    },
    "北京":{
      patterns:["北京是 + place/status","S + 在北京 + V","S + 去北京 + V"],
      confusables:["南京: Nam Kinh","北方: phía Bắc","首都: thủ đô (danh từ chung)"],
      errors:["Vị trí dùng 在北京; hướng đi dùng 去北京","北京 là tên riêng, 首都 là chức năng/loại địa danh"],
      model:"我在北京学习。明年我想去北京旅游。",
      pronunciation:"Běijīng · Běi thanh 3 + jīng thanh 1."
    },
    "本":{
      patterns:["number + 本 + book","这/那 + 本 + N","S + 看/买 + 一本 + N"],
      confusables:["个: lượng từ chung","张: tờ/vật phẳng","册: quyển/tập"],
      errors:["Sách/vở dùng 本: 一本书","Không dùng 本 cho người hoặc cốc"],
      model:"我买了两本书。这本书很有意思。",
      pronunciation:"běn · b + en · thanh 3."
    },
    "不":{
      patterns:["S + 不 + V","S + 不 + Adj","不要 + V"],
      confusables:["没: chưa/không có trong nhiều ngữ cảnh quá khứ","别: đừng","无: không có, văn viết"],
      errors:["不 thường đứng trước động từ/tính từ","Không dùng 不 máy móc cho hành động quá khứ đã hoàn thành"],
      model:"我不喜欢喝咖啡。今天我不去学校。",
      pronunciation:"bù · b + u · thanh 4; trong chuỗi lời nói có thể có biến điệu theo từ sau."
    },
    "菜":{
      patterns:["S + 做菜","这个菜 + 很 + Adj","请给我看看菜单"],
      confusables:["饭: cơm/bữa ăn","食物: thức ăn nói chung","菜单: thực đơn"],
      errors:["这个菜很好吃 nói về món ăn trong ngữ cảnh này","菜 và 饭/菜单 không thay thế máy móc cho nhau"],
      model:"妈妈在买菜。这个菜很好吃。",
      pronunciation:"cài · c + ai · thanh 4."
    },
    "茶":{
      patterns:["S + 喜欢/喝 + 茶","请 + V + 茶","这/那是 + 茶"],
      confusables:["水: nước","咖啡: cà phê","茶杯: cốc/tách trà"],
      errors:["Trong câu cơ bản nói 喝茶, không nói 吃茶","一杯茶 là một cốc trà; 茶 không phải cái cốc"],
      model:"请喝茶。这是中国茶。",
      pronunciation:"chá · ch + a · thanh 2 đi lên."
    },
    "吃":{
      patterns:["S + 吃 + O","一起 + 吃饭 + 吧","你吃了吗？","这个菜很好吃"],
      confusables:["喝: uống","做饭: nấu cơm","好吃: ngon"],
      errors:["Đồ uống như 茶 dùng 喝, không dùng 吃","好吃 là tính từ đánh giá món ăn"],
      model:"你吃了吗？我们一起吃饭吧。这个菜很好吃。",
      pronunciation:"chī · ch + i (âm đỉnh lưỡi sau) · thanh 1."
    }
  });
  function wordIntel(w){
    const c=String(w?.char||"").trim();
    return VOCAB_INTELLIGENCE[c]||VOCAB_INTELLIGENCE[firstHanzi(c)]||null;
  }
  function joinIntelLines(intel,key,limit=3){
    const arr=Array.isArray(intel?.[key])?intel[key]:[];
    return arr.slice(0,limit);
  }
  function repairLearnerSentence(raw,target){
    let out=String(raw||"").trim(),reason="";
    if(!out)return{changed:false,text:"",reason:""};
    const before=out;
    if(target==="爱"){
      if(out.includes("爱很")){out=out.replace(/爱很/g,"很爱");reason="Đổi trật tự “爱很” thành “很爱” khi 很 bổ nghĩa mức độ cho 爱."}
    }else if(target==="爸爸"){
      if(/我爸爸(医生|老师|学生|护士|经理)/.test(out)){out=out.replace(/我爸爸(医生|老师|学生|护士|经理)/,"我爸爸是$1");reason="Thêm 是 giữa chủ ngữ và nghề nghiệp."}
    }else if(target==="杯子"){
      if(out.includes("一杯子")){out=out.replace(/一杯子/g,"一个杯子");reason="Dùng lượng từ 个 cho danh từ 杯子; 一杯 thường đo lượng đồ uống."}
    }else if(target==="北京"){
      if(out.includes("是北京工作")){out=out.replace(/是北京工作/g,"在北京工作");reason="Dùng 在 để biểu đạt nơi diễn ra hành động."}
    }else if(target==="本"){
      if(out.includes("一个书")){out=out.replace(/一个书/g,"一本书");reason="Sách/vở dùng lượng từ 本."}
      else if(/(^|[我你他她们想要买看有])一书/.test(out)){out=out.replace(/一书/g,"一本书");reason="Bổ sung lượng từ 本 trước 书."}
    }else if(target==="不"){
      const rules=[["喜欢不","不喜欢"],["喝不","不喝"],["去不","不去"],["来不","不来"]];
      for(const [a,b] of rules){if(out.includes(a)){out=out.replace(new RegExp(a,"g"),b);reason="Đưa 不 về trước động từ/tính từ trong mẫu phủ định cơ bản.";break}}
    }else if(target==="方便"){
      if(out.includes("这个问题很方便")){out=out.replace(/这个问题很方便/g,"这个问题很容易");reason="描述 vấn đề dễ hay khó dùng 容易; 方便 dùng cho sự thuận tiện về điều kiện, vị trí hoặc cách làm."}
    }else if(target==="茶"||target==="吃"){
      if(out.includes("吃茶")){out=out.replace(/吃茶/g,"喝茶");reason="Đồ uống 茶 kết hợp cơ bản với 喝, không phải 吃."}
    }else if(target==="菜"){
      if(out.includes("吃菜单")){out=out.replace(/吃菜单/g,"看菜单");reason="菜单 là thực đơn; dùng 看/看看菜单, không dùng 吃菜单."}
    }
    return{changed:out!==before,text:out,reason};
  }
  function correctionStructureForWord(w){
    const intel=wordIntel(w);
    return intel?.patterns?.length?intel.patterns.join(" / "):T("S + từ mục tiêu + thành phần phù hợp","S + target word + appropriate complement");
  }
  function detailedWordFeedbackLines(w){
    const intel=wordIntel(w);if(!intel)return[];
    const out=[];
    if(intel.patterns?.length)out.push(`${T("Cấu trúc nên dùng","Recommended structure")}: ${intel.patterns.join(" / ")}`);
    if(intel.errors?.length)out.push(`${T("Lỗi người học thường gặp","Common learner error")}: ${intel.errors[0]}`);
    if(intel.confusables?.length)out.push(`${T("Từ dễ nhầm","Confusable")}: ${intel.confusables.slice(0,2).join("; ")}`);
    return out;
  }
  function aggregateTeacherSummary(label,score){
    if(!S.reports.length)return "";
    const reports=S.reports.filter(x=>Number.isFinite(x.score));if(!reports.length)return "";
    const strongest=[...reports].sort((a,b)=>b.score-a.score)[0],weakest=[...reports].sort((a,b)=>a.score-b.score)[0];
    const overallNote=score>=90?T("Kết quả ổn định; tiếp tục tập trung vào độ chính xác và tự nhiên.","Performance is consistently strong; focus on precision and naturalness."):score>=75?T("Kỹ năng cốt lõi đã hình thành nhưng vẫn còn một vài điểm yếu cần luyện có mục tiêu.","The core skill is working, but one or two recurring weaknesses still need targeted practice."):score>=60?T("Nhiệm vụ đã đạt ngưỡng nhưng mẫu kỹ năng chưa đủ ổn định để sử dụng tự động.","The task is passed, but the pattern is not yet stable enough for automatic production."):T("Cần thêm một lượt luyện tập có trọng tâm trước khi kỹ năng ổn định.","The task needs another focused attempt before the skill is reliable.");
    return `<div class="ptcs-teacher-summary"><h3>🧑‍🏫 ${T("Tóm tắt của giáo viên","Teacher summary")}</h3><p><b>${T("Tổng quan","Overall")}:</b> ${Math.round(score)}/100 · ${reports.length} ${T("mục đã chấm","graded item(s)")}. ${overallNote}</p><p><b>${T("Bằng chứng mạnh nhất","Strongest evidence")}:</b> ${esc(strongest?.area||label)} — ${Math.round(strongest?.score||0)}/100${strongest?.strength?` · ${esc(strongest.strength)}`:""}.</p><p><b>${T("Ưu tiên sửa","Priority correction")}:</b> ${esc(weakest?.area||label)} — ${Math.round(weakest?.score||0)}/100. ${esc(weakest?.focus||T("Làm lại mục có điểm thấp nhất và tự giải thích đáp án trước khi tiếp tục.","Repeat the lowest-scoring item and explain the answer before moving on."))}</p></div>`;
  }
  function pinyinTeacherAnalysis(it,value,points){
    const typed=String(value||"").trim(),target=String(it.answer||"").trim(),typedBase=stripTone(typed),targetBase=stripTone(target),baseSim=editSimilarity(typedBase,targetBase),sameBase=typedBase===targetBase&&!!targetBase,tt=pinyinTones(target),ut=pinyinTones(typed),toneSame=tt.length===ut.length&&tt.every((x,i)=>x===ut[i]),intel=wordIntel(it.word);
    const difference=phoneticDifference(target,typed);
    const strength=points===100?T("Âm tiết và dấu thanh đều khớp với mục tiêu.","Both syllable spelling and tone marks match the target."):sameBase?T("Phần âm cơ sở đúng nhưng dấu thanh chưa khớp.","The base sound is correct, but the tone mark does not match."):T("Phần âm cơ sở và/hoặc dấu thanh chưa khớp mục tiêu.","The base sound and/or tone mark does not match the target.");
    const focus=points===100?T("Viết lại Pinyin một lần từ trí nhớ rồi đọc thành tiếng.","Write the Pinyin once more from memory and say it aloud."):sameBase&&!toneSame?T("Giữ nguyên phần chữ, nghe lại hướng cao độ rồi đặt đúng dấu thanh.","Keep the letters, replay the pitch direction, then place the correct tone mark."):T("Nghe lại → tách âm đầu/vần → viết phần âm → thêm thanh điệu → đọc lại.","Replay → separate initial/final → write the base sound → add the tone → read it aloud.");
    const lines=[
      `${T("Đầu vào","Input")}: ${typed||T("(trống)","(blank)")}`,
      `${T("Đầu ra đúng","Correct output")}: ${target}`,
      `${T("Sai khác","Difference")}: ${difference}`,
      `${T("Độ tương đồng phần âm","Base-sound similarity")}: ${Math.round(baseSim*100)}%`,
      `${T("Thanh mục tiêu","Target tone(s)")}: ${tt.length?tt.map(toneLabel).join("; "):T("không có dữ liệu","not available")}`
    ];
    if(intel?.pronunciation)lines.push(`${T("Điểm phát âm cần nhớ","Pronunciation cue")}: ${intel.pronunciation}`);
    return {html:teacherReportHtml({status:points===100?T("ĐÚNG — CỦNG CỐ","CORRECT — REINFORCE"):T("SAI — PHÂN TÍCH VÀ SỬA","INCORRECT — DIAGNOSE & REPAIR"),overview:strength,sections:[{title:T("Input → Output","Input → Output"),lines},{title:T("Cách tự sửa","Self-repair steps"),lines:[focus]}],model:target,next:focus}),strength,focus,correction:{input:typed,output:target,difference}}
  }
  function writingTeacherAnalysis(it,value){
    const raw=String(value||"").trim(),target=String(it?.word?.char||""),reference=String(it?.reference||""),hanzi=(raw.match(/[\u3400-\u9fff]/g)||[]).length,hasTarget=!!target&&raw.includes(target),hasPunct=/[。！？!?]$/.test(raw),issues=[],notes=[],intel=wordIntel(it.word),repair=repairLearnerSentence(raw,target);
    let task=hasTarget?(hanzi>=5?20:15):Math.min(8,hanzi*2),organization=hanzi>=10?18:hanzi>=6?16:hanzi>=4?12:hanzi>=2?8:2;if(hasPunct)organization=Math.min(20,organization+2);
    let grammar=raw?28:0;

    if(/(的的|了了|是是|很很|在在)/.test(raw)){grammar-=7;issues.push(T("Phát hiện từ chức năng/trợ từ bị lặp; cần bỏ phần lặp và kiểm tra lại trật tự từ.","A repeated function word/particle was detected; remove the duplicate and recheck word order."))}
    if(/虽然/.test(raw)&&!/(但是|可是|不过)/.test(raw)){grammar-=2;notes.push(T("Có 虽然 nhưng chưa có dấu hiệu đối lập rõ. Đây không luôn là lỗi, nhưng 但是/可是/不过 thường làm quan hệ đối lập rõ hơn.","虽然 appears without an explicit contrast marker. This is not always an error, but 但是/可是/不过 often makes the contrast clearer."))}
    if(/因为/.test(raw)&&!/(所以)/.test(raw))notes.push(T("Có 因为 nhưng không có 所以. Tiếng Trung có thể lược 所以, vì vậy chỉ ghi chú chứ không tự động trừ điểm.","因为 appears without 所以. Chinese can omit 所以, so this is noted rather than automatically penalized."));
    if(/把/.test(raw)&&!/(了|好|完|到|在|给|成|开|上|下|走|来|去|掉|清楚|明白)/.test(raw)){grammar-=5;issues.push(T("Cấu trúc 把 chưa thể hiện rõ kết quả, phương hướng, vị trí hoặc hoàn thành.","The 把 construction lacks a clear result, direction, location or completion cue."))}
    if(raw&&hanzi<4){grammar-=4;issues.push(T("Câu quá ngắn để thể hiện một cấu trúc câu tiếng Trung ổn định.","The response is too short to demonstrate a stable Chinese sentence structure."))}
    if(repair.changed){grammar-=4;issues.push(T(`Phát hiện lỗi dùng từ/cấu trúc có thể sửa trực tiếp: ${repair.reason}`,`A high-confidence usage/structure issue can be repaired directly: ${repair.reason}`))}

    grammar=Math.max(0,Math.min(30,grammar));
    let vocabulary=hasTarget?(hanzi>=7?15:12):Math.min(6,Math.max(0,hanzi)),naturalness=raw?(hasPunct?13:11):0;if(issues.length)naturalness=Math.max(3,naturalness-issues.length*2);if(hanzi>=10&&!issues.length)naturalness=Math.min(15,naturalness+2);
    let score=Math.round(task+organization+grammar+vocabulary+naturalness);if(!hasTarget)score=Math.min(score,49);

    const grammarEntry=window.PandaHanGrammarPack?.find?.(raw);
    if(grammarEntry)notes.push(`${T("Cấu trúc nhận diện","Detected structure")}: ${grammarEntry.form}. ${grammarEntry.cautionEn||grammarEntry.en||""}`.trim());
    if(!issues.length)issues.push(T("Chưa phát hiện lỗi ngữ pháp cục bộ có độ tin cậy cao; hệ thống không tự bịa lỗi. Câu vẫn được đánh giá theo yêu cầu nhiệm vụ.","No high-confidence local grammar error was detected; the system does not invent an error. The sentence is still evaluated against the task."));

    const structure=correctionStructureForWord(it.word);
    const intelLines=detailedWordFeedbackLines(it.word);
    const suggestedOutput=repair.changed?repair.text:"";
    const ex=exampleOfWord(it.word);
    const model=intel?.model||reference||ex.zh||T(`Dùng “${target}” trong một câu hoàn chỉnh có chủ ngữ hoặc ngữ cảnh rõ.`,`Use “${target}” in a complete sentence with a clear subject or context.`);

    const strength=hasTarget&&grammar>=24
      ?T(`Từ mục tiêu “${target}” đã được sử dụng và câu có khung ngữ pháp phù hợp.`,`The target word “${target}” is used and the sentence has a workable grammatical frame.`)
      :hasTarget
        ?T(`Đã sử dụng “${target}”, nhưng câu vẫn cần chỉnh ở cấu trúc hoặc độ tự nhiên.`,`The target word “${target}” is present, but the sentence still needs structural or naturalness repair.`)
        :T(`Câu chưa đáp ứng yêu cầu vì thiếu từ mục tiêu “${target}”.`,`The response does not meet the task because the required target word “${target}” is missing.`);

    const focus=!hasTarget
      ?T(`Viết lại câu theo một trong các khung: ${structure}.`,`Rewrite the sentence using one of these frames: ${structure}.`)
      :repair.changed
        ?T(`So sánh đầu vào với đầu ra sửa, sau đó tự viết lại mà không sao chép: ${repair.text}`,`Compare the input with the repaired output, then rewrite it independently: ${repair.text}`)
        :grammar<22
          ?T(`Sửa lỗi ngữ pháp đã nêu và giữ từ mục tiêu trong khung: ${structure}.`,`Fix the grammar issue above and keep the target word in this frame: ${structure}.`)
          :T(`Tạo thêm một câu mới với “${target}” theo khung khác để kiểm tra khả năng vận dụng.`,`Create one more sentence with “${target}” using a different frame to test transfer.`);

    const breakdown=`<div class="ptcs-breakdown"><div>${T("Hoàn thành nhiệm vụ","Task")} /20<b>${task}</b></div><div>${T("Tổ chức","Organization")} /20<b>${organization}</b></div><div>${T("Ngữ pháp","Grammar")} /30<b>${grammar}</b></div><div>${T("Từ vựng","Vocabulary")} /15<b>${vocabulary}</b></div><div>${T("Tự nhiên","Naturalness")} /15<b>${naturalness}</b></div></div>`;

    const sections=[
      {title:T("Đầu vào của người học","Learner input"),lines:[
        `${T("Câu gốc","Original sentence")}: ${raw||T("(trống)","(blank)")}`,
        `${T("Từ mục tiêu","Target word")}: ${target} — ${meaningOfWord(it.word)||T("từ vựng mục tiêu","target vocabulary")}`,
        `${T("Số chữ Hán nhận diện","Chinese characters detected")}: ${hanzi}`
      ]},
      {title:T("Chẩn đoán lỗi","Error diagnosis"),lines:issues},
      {title:T("Cấu trúc đúng cần đối chiếu","Correct structure to compare"),lines:[
        `${T("Khung cấu trúc","Structure")}: ${structure}`,
        ...intelLines
      ]},
      {title:T("Đầu ra sửa có căn cứ","Evidence-based corrected output"),lines:suggestedOutput?[
        `${T("Câu sau khi sửa quy tắc chắc chắn","Rule-based repair")}: ${suggestedOutput}`,
        `${T("Lý do sửa","Why")}: ${repair.reason}`
      ]:[
        T("Không tự viết lại toàn bộ câu khi chưa có đủ căn cứ. Người học đối chiếu cấu trúc đúng và mẫu tham chiếu để tự sửa.","The system does not rewrite the whole sentence without enough evidence. Compare the correct structure and model, then self-repair.")
      ]},
      ...(notes.length?[{title:T("Ghi chú giáo viên","Teacher notes"),lines:notes}]:[])
    ];

    return {
      score,
      html:teacherReportHtml({status:score>=90?T("RẤT TỐT","EXCELLENT"):score>=75?T("TỐT","GOOD"):score>=60?T("ĐẠT — CẦN CỦNG CỐ","PASS — REINFORCE"):T("CẦN SỬA","REVISE"),overview:strength,breakdown,sections,model,next:focus}),
      strength,focus,
      correction:{input:raw,targetWord:target,structure,suggestedOutput,reason:repair.reason,model}
    }
  }


  function zhVoice(){
    const vs=window.speechSynthesis?.getVoices?.()||[];const zh=vs.filter(v=>/^zh(?:-|$)/i.test(v.lang||""));
    return ["google","xiaoxiao","yunxi","yunyang","tingting","huihui"].reduce((hit,k)=>hit||zh.find(v=>String(v.name||"").toLowerCase().includes(k)),null)||zh[0]||null;
  }
  function speak(text,button=null){
    return new Promise(resolve=>{if(!text||!("speechSynthesis" in window)){resolve(false);return}try{speechSynthesis.cancel()}catch(_){}
      const run=()=>{const u=new SpeechSynthesisUtterance(String(text));u.lang="zh-CN";const v=zhVoice();if(v)u.voice=v;u.rate=.90;u.pitch=1;u.volume=1;u.onstart=()=>button?.classList.add("playing");u.onend=()=>{button?.classList.remove("playing");resolve(true)};u.onerror=()=>{button?.classList.remove("playing");resolve(false)};speechSynthesis.speak(u)};
      if(zhVoice()||speechSynthesis.getVoices().length)run();else setTimeout(run,600);
    });
  }

  async function saveEvidence(taskId,score,evidence={}){
    const m=S.mission||mission()||{};
    const day=Number(m.dayNumber||1);
    const threshold=Number(evidence.passThreshold??PASS[taskId]??60);
    const completeSet=evidence.completeSet!==false;
    const scorePassed=completeSet&&Number(score)>=threshold;
    const full={...evidence,taskId,dayNumber:day,scorePercent:Number(score),passThreshold:threshold,completeSet,scorePassed,passed:false,sourceWorkbook:"KeHoach_PandaHan_120Ngay_HSK3_v2_TichHop_PinyinToneQuest.xlsx",curriculumTask:sourceText(taskId,m),evaluatedAt:Date.now(),date:new Date().toISOString(),rawSource:`ai-coach-task-suite-${taskId}`};
    let out=null,saveError=null;
    try{
      out=await window.PandaHanSchedule?.recordTaskScore?.(day,taskId,Number(score),`verified:ai-coach-task-suite-${taskId}`,{...full,passed:scorePassed});
    }catch(e){
      saveError=e;
      console.warn("AI Coach task evidence sync:",taskId,e?.code||e?.message||e);
    }
    let persistedPassed=out?.result?.passed===true;
    try{
      const savedDay=window.PandaHanSchedule?.getSchedule?.()?.days?.find?.(d=>Number(d.day_number)===day);
      if(scorePassed && savedDay?.completed_tasks?.[taskId]) persistedPassed=true;
    }catch(_){}
    full.passed=persistedPassed;full.persisted=!!out;full.localOnlyTestMode=out?.result?.localOnlyTestMode===true;
    try{full.attempt=await window.PanTutorAttemptHistory?.save?.({dayNumber:day,taskId,scorePercent:Number(score),passed:scorePassed,completeSet,correct:evidence.correct??S.answers.filter(x=>x.correct).length,total:evidence.total??S.items.length,items:taskId==="speaking"?S.speakingItems:S.answers,teacherReports:S.reports,scheduleSaved:!!out})}catch(e){saveError=saveError||e;console.warn("Attempt history save:",e?.message||e)}
    try{localStorage.setItem(`pantutor_ai_coach_${taskId}_day_${day}`,JSON.stringify(full))}catch(_){}
    window.dispatchEvent(new CustomEvent("pandahan-learning-evaluation",{detail:{verified:true,action:persistedPassed?"standalone_task_passed_and_saved":scorePassed?"standalone_task_passed_save_failed":"standalone_task_needs_retry",...full}}));
    return {passed:persistedPassed,scorePassed,threshold,full,saveError:saveError?String(saveError.code||saveError.message||saveError):"",sync:out};
  }
  function summary(label,score,result,detail){
    const host=document.getElementById("ptCoachSkillContent");if(!host)return;const passed=!!result?.passed,scorePassed=!!result?.scorePassed,badge=passed?"✓ Verified — green check saved":scorePassed?"Score passed, but evidence was not saved":"Needs another attempt",saveNote=(!passed&&scorePassed)?`<p style="color:#b91c1c"><b>Save error:</b> ${esc(result?.saveError||"schedule write was not confirmed")}. Return to AI Coach and retry this task; no false green check is shown.</p>`:"",teacher=aggregateTeacherSummary(label,score);
    host.innerHTML=`<div class="ptcs-card ptcs-summary"><span class="ptcs-badge ${passed?"":"fail"}">${badge}</span><h2>${esc(label)}</h2><div class="ptcs-score-big">${Math.round(score)}/100</div><p>${esc(detail||"")}</p>${teacher}${saveNote}${window.PanTutorAttemptHistory?.html?.(S.mission?.dayNumber,label==="Pinyin Bootcamp · Phonetics Core"?"phonetics_core":S.mode)||""}<p>Pass mark: <b>${Number(result?.threshold||0)}%</b>. This task records learning evidence only; <b>Pinyin Tone Quest remains the only next-day unlock gate.</b></p><div class="ptcs-actions"><button class="ptcs-btn primary" id="ptcsDone" type="button">Return to AI Coach</button><button class="ptcs-btn" id="ptcsRedo" type="button">Redo task</button></div></div>`;localizeRoot(host);document.getElementById("ptcsDone").onclick=close;document.getElementById("ptcsRedo").onclick=()=>reopenCurrent()
  }
  function reopenCurrent(){const m=S.mission,mode=S.mode;if(mode==="phonetics_core")openPhoneticsCore(m);else if(mode==="srs")openSrs(m);else if(mode==="vocab-intro")openVocabulary(m);else if(mode==="reading_writing")openReadingWriting(m);else if(mode==="mistake_review")openMistakeReview(m);else if(mode==="speaking")openSpeaking(m)}

  /* ---------------- Day 1–10: standalone Phonetics Core ---------------- */
  function firstTone(p){for(const ch of String(p||"")){if(toneMarks[ch])return toneMarks[ch]}return 5}
  function firstSyllable(p){return String(p||"").trim().split(/[\s'’·-]+/)[0]||String(p||"")}
  const PINYIN_BASE_MAP={"ā":"a","á":"a","ǎ":"a","à":"a","ē":"e","é":"e","ě":"e","è":"e","ī":"i","í":"i","ǐ":"i","ì":"i","ō":"o","ó":"o","ǒ":"o","ò":"o","ū":"u","ú":"u","ǔ":"u","ù":"u","ǖ":"ü","ǘ":"ü","ǚ":"ü","ǜ":"ü","Ā":"A","Á":"A","Ǎ":"A","À":"A","Ē":"E","É":"E","Ě":"E","È":"E","Ī":"I","Í":"I","Ǐ":"I","Ì":"I","Ō":"O","Ó":"O","Ǒ":"O","Ò":"O","Ū":"U","Ú":"U","Ǔ":"U","Ù":"U","Ǖ":"Ü","Ǘ":"Ü","Ǚ":"Ü","Ǜ":"Ü"};
  const PINYIN_TONE_TABLE={a:["a","ā","á","ǎ","à"],e:["e","ē","é","ě","è"],i:["i","ī","í","ǐ","ì"],o:["o","ō","ó","ǒ","ò"],u:["u","ū","ú","ǔ","ù"],ü:["ü","ǖ","ǘ","ǚ","ǜ"]};
  function plainPinyinSyllable(v){return Array.from(String(v||"")).map(ch=>PINYIN_BASE_MAP[ch]||ch).join("").replace(/[1-5]$/,'')}
  function markPinyinTone(v,tone){
    let base=plainPinyinSyllable(v).toLowerCase().replace(/v/g,"ü"),t=Number(tone)||5;if(t===5)return base;
    const vowels=[...base].map((ch,i)=>PINYIN_TONE_TABLE[ch]?i:-1).filter(i=>i>=0);if(!vowels.length)return base;
    let idx=base.indexOf("a");if(idx<0)idx=base.indexOf("e");if(idx<0){const ou=base.indexOf("ou");if(ou>=0)idx=ou}if(idx<0)idx=vowels[vowels.length-1];
    const ch=base[idx],rep=(PINYIN_TONE_TABLE[ch]||[])[t]||ch;return base.slice(0,idx)+rep+base.slice(idx+1);
  }
  function firstHanzi(v){const m=String(v||"").match(/[\u3400-\u9fff]/u);return m?m[0]:String(v||"").slice(0,1)}
  function toneChoiceOptions(target,words,day,index){
    const targetPy=String(target?.pinyin||"").trim(),targetTone=firstTone(targetPy),targetBase=stripTone(targetPy),targetChar=String(target?.char||"").trim();
    const all=uniq([...(words||[]),...vocab().filter(w=>w?.pinyin&&w?.char)]);const rnd=seeded(day,5450+index+S.variant*43);
    const scored=all.filter(w=>w!==target&&String(w?.char||"").trim()!==targetChar).map(w=>{
      const py=String(w?.pinyin||"").trim(),base=stripTone(py),tone=firstTone(py),char=String(w?.char||"").trim();let score=0;
      if(tone!==targetTone)score+=22;
      if(base===targetBase)score+=90;
      score+=Math.round(editSimilarity(base,targetBase)*42);
      if(base?.[0]===targetBase?.[0])score+=10;
      score-=Math.abs(base.length-targetBase.length)*2;
      return{key:`${char}|${py}`,char,pinyin:py,tone,correct:false,score,r:rnd()};
    }).sort((a,b)=>b.score-a.score||a.r-b.r);
    const out=[{key:`${targetChar}|${targetPy}`,char:targetChar,pinyin:targetPy,tone:targetTone,correct:true}];
    for(const c of scored){
      if(!c.char||!c.pinyin||out.some(o=>o.key===c.key))continue;
      out.push(c);if(out.length===4)break;
    }
    /* Last-resort tone variants keep the task usable when a Day has too few real words. */
    for(const t of [1,2,3,4]){
      if(out.length===4)break;if(t===targetTone)continue;
      const py=markPinyinTone(targetPy,t),key=`${targetChar}|${py}`;
      if(!out.some(o=>o.key===key))out.push({key,char:targetChar,pinyin:py,tone:t,correct:false,synthetic:true});
    }
    return shuffle(out,rnd).slice(0,4);
  }
  function pinyinChoiceOptions(target,words,day,index){
    const targetPy=String(target?.pinyin||"").trim(),targetChar=String(target?.char||"").trim(),base=stripTone(targetPy),rnd=seeded(day,5570+index+S.variant*47);
    const candidates=uniq([...(words||[]),...vocab().filter(w=>w?.pinyin&&w?.char)]).filter(w=>w!==target&&String(w?.char||"").trim()!==targetChar).map(w=>{
      const py=String(w?.pinyin||"").trim(),char=String(w?.char||"").trim(),b=stripTone(py);let score=Math.round(editSimilarity(base,b)*70);
      if(firstTone(py)===firstTone(targetPy))score+=12;
      if(b?.[0]===base?.[0])score+=10;
      score-=Math.abs(b.length-base.length)*2;
      return{key:`${char}|${py}`,char,pinyin:py,correct:false,score,r:rnd()};
    }).sort((a,b)=>b.score-a.score||a.r-b.r);
    const out=[{key:`${targetChar}|${targetPy}`,char:targetChar,pinyin:targetPy,correct:true}];
    for(const c of candidates){
      if(!c.char||!c.pinyin||out.some(o=>o.key===c.key))continue;
      out.push(c);if(out.length===4)break;
    }
    return shuffle(out,rnd).slice(0,4);
  }
  function phoneticDifference(targetPy,chosenPy){
    const target=String(targetPy||"").trim(),chosen=String(chosenPy||"").trim(),tb=stripTone(target),cb=stripTone(chosen),tt=firstTone(target),ct=firstTone(chosen);
    if(target===chosen)return T("Âm tiết và thanh điệu khớp hoàn toàn.","The syllable and tone match exactly.");
    if(tb===cb&&tt!==ct)return T(`Phần âm “${tb}” đúng nhưng thanh điệu sai: bạn chọn ${toneLabel(ct)}, mục tiêu là ${toneLabel(tt)}.`,`The base sound “${tb}” matches, but the tone differs: you chose ${toneLabel(ct)} and the target is ${toneLabel(tt)}.`);
    if(tt===ct&&tb!==cb)return T(`Thanh điệu đúng nhưng phần âm chưa khớp: “${cb||chosen}” khác “${tb||target}”.`,`The tone matches, but the base sound differs: “${cb||chosen}” vs “${tb||target}”.`);
    return T(`Cả phần âm và thanh điệu đều khác mục tiêu: “${chosen}” → “${target}”.`,`Both the base sound and tone differ from the target: “${chosen}” → “${target}”.`);
  }
  function buildPhoneticsItems(m){
    const words=wordList(m).filter(w=>w?.pinyin&&w?.char);const rnd=seeded(m?.dayNumber,5301);const chosen=shuffle(words,rnd).slice(0,Math.min(10,Math.max(6,words.length)));
    return chosen.map((w,i)=>{
      const kind=i%2?"pinyin":"tone",options=kind==="tone"?toneChoiceOptions(w,words,m?.dayNumber,i):pinyinChoiceOptions(w,words,m?.dayNumber,i),correct=options.find(o=>o.correct)||options[0];
      return {kind,word:w,text:String(w.char||"").trim(),pinyin:String(w.pinyin||"").trim(),answer:correct.key,answerLabel:`${correct.char} · ${correct.pinyin}`,options};
    });
  }
  async function openPhoneticsCore(m){createShell("phonetics_core",m);S.items=avoidImmediateRepeat(buildPhoneticsItems(S.mission),"phonetics_core",S.mission?.dayNumber);S.index=0;S.answers=[];if(!S.items.length){document.getElementById("ptCoachSkillContent").innerHTML=`<div class="ptcs-card">${T("Không có mục ngữ âm liên kết với ngày học này.","No phonetics-linked items are available for this Day.")}</div>`;return}renderPhoneticsCore()}
  function renderPhoneticsCore(){
    S.itemStartedAt=Date.now();const host=document.getElementById("ptCoachSkillContent"),it=S.items[S.index];if(!host||!it)return;
    const question=T("Nghe và chọn đáp án đúng.","Listen and choose the correct answer.");
    const help=T("Nghe audio trước, sau đó chọn thẻ có chữ Hán và Pinyin tương ứng. Không hiển thị A/B/C/D để người học tập trung vào âm–chữ–Pinyin. Đây là nhiệm vụ ngữ âm độc lập của AI Coach, không phải Pinyin Tone Quest chính.","Listen first, then choose the card with the matching Hanzi and Pinyin. A/B/C/D labels are intentionally omitted so attention stays on sound–character–Pinyin mapping. This is a standalone AI Coach phonetics task, not the main Pinyin Tone Quest.");
    const optionHtml=it.options.map(o=>`<button class="ptcs-option ptcs-sound-choice" type="button" data-value="${esc(o.key)}" data-label="${esc(`${o.char} · ${o.pinyin}`)}" data-pinyin="${esc(o.pinyin)}"><span class="ptcs-choice-hanzi">${esc(o.char)}</span><span class="ptcs-choice-pinyin" data-keep-pinyin="true">${esc(o.pinyin)}</span></button>`).join("");
    host.innerHTML=progressHtml()+`<div class="ptcs-card"><span class="ptcs-kicker">${T("PINYIN BOOTCAMP · BÀI NHẬN DIỆN ÂM","PINYIN BOOTCAMP · SOUND RECOGNITION")}</span><div class="ptcs-question">${question}</div><div class="ptcs-help">${help}</div><button class="ptcs-audio-orb" id="ptcsPhOrb" type="button" aria-label="${T("Nghe lại","Replay")}">🔊</button><div class="ptcs-options">${optionHtml}</div><div id="ptcsReveal"></div></div>`;
    const orb=document.getElementById("ptcsPhOrb");orb.onclick=()=>speak(it.text,orb);host.querySelectorAll(".ptcs-option").forEach(b=>b.onclick=()=>answerPhonetics(b,it));S.autoTimer=setTimeout(()=>speak(it.text,orb),180);localizeRoot(host)
  }
  function answerPhonetics(btn,it){
    const opts=[...document.querySelectorAll("#ptCoachSkillContent .ptcs-option")],chosen=String(btn.dataset.value||"").trim(),chosenLabel=String(btn.dataset.label||"").trim(),chosenPy=String(btn.dataset.pinyin||"").trim(),answer=String(it.answer||"").trim(),answerLabel=String(it.answerLabel||it.answer||"").trim(),ok=chosen===answer;
    opts.forEach(b=>{b.disabled=true;if(String(b.dataset.value||"").trim()===answer)b.classList.add("correct")});if(!ok)btn.classList.add("wrong");S.answers.push({correct:ok,target:it.text,answer:answerLabel,chosen:chosenLabel,input:chosenLabel,expected:answerLabel,responseMs:Date.now()-S.itemStartedAt});
    const tone=firstTone(it.pinyin),intel=wordIntel(it.word),difference=phoneticDifference(it.pinyin,chosenPy||chosenLabel.split("·").pop()?.trim());
    const strength=ok?T(`Bạn đã nối đúng âm nghe được với “${it.text}” và Pinyin “${it.pinyin}”.`,`You correctly mapped the sound to “${it.text}” and Pinyin “${it.pinyin}”.`):T(`Bạn đã chọn “${chosenLabel}”, trong khi âm mục tiêu là “${it.text} · ${it.pinyin}”.`,`You chose “${chosenLabel}”, while the target sound is “${it.text} · ${it.pinyin}”.`);
    const focus=ok?T(`Nghe lại một lần, sau đó đọc “${it.text} · ${it.pinyin}” mà không nhìn thẻ.`,`Replay once, then say “${it.text} · ${it.pinyin}” without looking at the card.`):T(`Nghe lại → xác định phần âm → xác định hướng thanh → đối chiếu chữ Hán → đọc lại “${it.text} · ${it.pinyin}”.`,`Replay → identify the base sound → identify tone direction → match the Hanzi → repeat “${it.text} · ${it.pinyin}”.`);
    recordTeacherReport(T("Nhận diện ngữ âm","Phonetics recognition"),ok?100:0,strength,focus);
    const lines=[
      `${T("Âm/chữ mục tiêu","Target")}: ${it.text} · ${it.pinyin}`,
      `${T("Bạn đã chọn","Your input")}: ${chosenLabel||T("(trống)","(blank)")}`,
      `${T("Phân tích sai khác","Difference")}: ${difference}`,
      `${T("Thanh mục tiêu","Target tone")}: ${toneLabel(tone)}`
    ];
    if(intel?.pronunciation)lines.push(`${T("Điểm phát âm cần nhớ","Pronunciation cue")}: ${intel.pronunciation}`);
    const repairLines=ok
      ? [T("Không cần sửa đáp án. Hãy củng cố bằng một lần nghe–nhắc lại không nhìn đáp án.","No correction is needed. Reinforce it with one listen-and-repeat attempt without looking.")]
      : [
          `${T("Đầu vào sai","Incorrect input")}: ${chosenLabel}`,
          `${T("Đầu ra đúng","Correct output")}: ${it.text} · ${it.pinyin}`,
          `${T("Quy trình sửa","Repair sequence")}: ${focus}`
        ];
    const report=teacherReportHtml({status:ok?T("ĐÚNG — CỦNG CỐ ÂM","CORRECT — REINFORCE"):T("SAI — PHÂN TÍCH VÀ SỬA ÂM","INCORRECT — DIAGNOSE & REPAIR"),overview:strength,sections:[{title:T("Bằng chứng âm–chữ–Pinyin","Sound–character–Pinyin evidence"),lines},{title:T("Từ đầu vào đến đầu ra đúng","Input → corrected output"),lines:repairLines}],model:`${it.text} · ${it.pinyin}`,next:focus});
    document.getElementById("ptcsReveal").innerHTML=`<div class="ptcs-reveal"><div class="ptcs-hanzi">${esc(it.text)}</div><div class="ptcs-pinyin" data-keep-pinyin="true">${esc(it.pinyin)}</div>${report}</div><div class="ptcs-next"><button class="ptcs-btn primary" id="ptcsPhNext">${S.index+1>=S.items.length?T("Hoàn thành Ngữ âm","Finish Phonetics"):T("Tiếp theo →","Next →")}</button></div>`;
    localizeRoot(document.getElementById("ptcsReveal"));
    document.getElementById("ptcsPhNext").onclick=async()=>{S.index++;if(S.index>=S.items.length){const score=Math.round(S.answers.filter(x=>x.correct).length/Math.max(1,S.answers.length)*100),r=await saveEvidence("phonetics_core",score,{completeSet:true,correct:S.answers.filter(x=>x.correct).length,total:S.answers.length,answers:S.answers,teacherReports:S.reports,evidenceType:"ai_coach_pinyin_bootcamp_core_teacher_feedback_v57_2",passThreshold:30});summary(T("Pinyin Bootcamp · Ngữ âm cốt lõi","Pinyin Bootcamp · Phonetics Core"),score,r,T(`${S.answers.filter(x=>x.correct).length}/${S.answers.length} câu nhận diện đúng.`,`${S.answers.filter(x=>x.correct).length} of ${S.answers.length} objective items correct.`))}else renderPhoneticsCore()}
  }

  /* ---------------- SRS Due Review inside AI Coach ---------------- */
  function dueWords(){
    const all=vocab();let out=[];try{out=all.filter(w=>typeof window.isDue==="function"&&window.isDue(w.char)).sort((a,b)=>{try{return Number(window.getStat?.(a.char)?.nextReview||0)-Number(window.getStat?.(b.char)?.nextReview||0)}catch(_){return 0}})}catch(_){out=[]}return out.slice(0,20);
  }
  async function openSrs(m){createShell("srs",m);S.items=dueWords().map(itemFromWord);S.index=0;S.answers=[];if(!S.items.length){const r=await saveEvidence("srs",100,{completeSet:true,total:0,correct:0,evidenceType:"ai_coach_srs_nothing_due",passThreshold:60});summary("SRS due review",100,r,"No vocabulary is due right now. The SRS task is verified for this Day.");return}renderSrs()}
  function renderSrs(){S.itemStartedAt=Date.now();const host=document.getElementById("ptCoachSkillContent"),it=S.items[S.index];if(!host||!it)return;host.innerHTML=progressHtml()+`<div class="ptcs-card"><span class="ptcs-kicker">SRS · REAL RECALL</span><div class="ptcs-question">Type the Hanzi from memory.</div><div class="ptcs-reveal"><div class="ptcs-pinyin" data-keep-pinyin="true">${esc(it.word.pinyin||it.pinyin)}</div><div class="ptcs-meaning">${esc(wordMeaning(it.word)||it.meaning)}</div></div><input id="ptcsSrsInput" class="ptcs-input" autocomplete="off" placeholder="Type Hanzi"><label style="display:block;margin-top:10px;font-size:12px"><input type="checkbox" id="ptcsConfidence"> Tôi chắc chắn với đáp án này</label><div class="ptcs-actions"><button class="ptcs-btn primary" id="ptcsSrsCheck">Check answer</button></div><div id="ptcsReveal2"></div></div>`;const inp=document.getElementById("ptcsSrsInput");document.getElementById("ptcsSrsCheck").onclick=()=>checkSrs(inp,it);inp.addEventListener("keydown",e=>{if(e.key==="Enter")checkSrs(inp,it)});inp.focus();localizeRoot(host)}
  function checkSrs(inp,it){
    if(inp.disabled)return;const typed=String(inp.value||"").trim(),ok=clean(typed)===clean(it.char),py=it.word.pinyin||it.pinyin,meaning=wordMeaning(it.word)||it.meaning,ex=exampleOfWord(it.word);inp.disabled=true;const stat=window.getStat?.(it.char),priorExposure=!!(Number(stat?.repetitions)>0||stat?.studyLog?.length),responseMs=Date.now()-S.itemStartedAt,confidence=document.getElementById("ptcsConfidence")?.checked?"certain":"unsure";const quality=window.PanTutorTenLayer?.quality?.({correct:ok,responseMs,priorExposure,confidence})??(ok?5:(priorExposure?2:null));if(quality!=null)try{window.gradeWord?.(it.char,quality)}catch(_){}
    S.answers.push({correct:ok,char:it.char,typed,input:typed,expected:it.char,pinyin:py,priorExposure,responseMs,confidence,sm2Quality:quality});const strength=ok?`You retrieved “${it.char}” from Pinyin/meaning without seeing the Hanzi.`:`The retrieval cue was recognized, but the Hanzi form “${it.char}” was not recalled accurately.`;const focus=ok?"Repeat the word once aloud, then let the normal SRS interval handle the next review.":`Copy “${it.char}” once while saying ${py}; then close it and retrieve the Hanzi again.`;recordTeacherReport("SRS recall",ok?100:0,strength,focus);
    const report=teacherReportHtml({status:ok?"RECALL SUCCESS":"RELEARNING NEEDED",overview:strength,sections:[{title:"Recall evidence",lines:[`Your answer: ${typed||"(blank)"}`,`Correct Hanzi: ${it.char}`,`Pinyin: ${py}`,`Meaning: ${meaning}`]},{title:"SRS consequence",lines:[ok?"The existing SM-2 engine receives a successful recall grade, so the interval can expand.":"The existing SM-2 engine receives a relearning grade, so this word remains due sooner instead of being treated as mastered."]}],model:ex.zh?`${ex.zh} — ${ex.meaning}`:`${it.char} · ${py} · ${meaning}`,next:focus});
    document.getElementById("ptcsReveal2").innerHTML=`<div class="ptcs-reveal"><div class="ptcs-hanzi">${esc(it.char)}</div>${report}</div><div class="ptcs-next"><button class="ptcs-btn primary" id="ptcsSrsNext">${S.index+1>=S.items.length?"Finish SRS":"Next word →"}</button></div>`;
    localizeRoot(document.getElementById("ptcsReveal2"));document.getElementById("ptcsSrsNext").onclick=async()=>{S.index++;if(S.index>=S.items.length){const correct=S.answers.filter(x=>x.correct).length,score=Math.round(correct/Math.max(1,S.answers.length)*100),r=await saveEvidence("srs",score,{completeSet:true,correct,total:S.answers.length,teacherReports:S.reports,evidenceType:"ai_coach_srs_due_review_teacher_feedback_v57",passThreshold:60});summary("SRS due review",score,r,`${correct} of ${S.answers.length} due words recalled correctly. SM-2 was updated from these actual answers.`)}else renderSrs()}
  }

  /* ---------------- Full Excel Vocabulary Lab ---------------- */
  async function openVocabulary(m,targetWord){createShell("vocab-intro",m);S.items=wordList(S.mission).slice(0,18).map(itemFromWord).filter(x=>x.char);if(targetWord){const target=window.VOCAB_BY_CHAR?.[String(targetWord)]||window.VOCAB?.find?.(w=>w.char===String(targetWord));if(target)S.items=[itemFromWord(target),...S.items.filter(x=>x.char!==target.char)];}S.index=0;S.answers=[];S.phase="learn";if(!S.items.length){document.getElementById("ptCoachSkillContent").innerHTML=`<div class="ptcs-card">${T("Không có từ vựng Excel được giao cho ngày này.","No Excel vocabulary is assigned to this Day.")}</div>`;return}renderVocabLearn()}
  function renderVocabLearn(){const host=document.getElementById("ptCoachSkillContent"),it=S.items[S.index];if(!host||!it)return;const bootcamp=Number(S.mission?.dayNumber||1)<=10;if(!bootcamp){try{window.recordView?.(it.char)}catch(_){}};host.innerHTML=progressHtml()+`<div class="ptcs-card"><span class="ptcs-kicker">LEARN ALL EXCEL WORDS · PHASE 1/2</span><div class="ptcs-speak-target"><div class="ptcs-hanzi">${esc(it.char)}</div><div class="ptcs-pinyin" data-keep-pinyin="true">${esc(it.word.pinyin||it.pinyin)}</div><div class="ptcs-meaning">${esc(wordMeaning(it.word)||it.meaning)}</div></div>${Array.isArray(it.word.examples)&&it.word.examples[0]?`<div class="ptcs-reveal"><b>Example</b><div style="margin-top:5px">${esc(it.word.examples[0][0])}</div><div class="ptcs-pinyin" data-keep-pinyin="true" style="font-size:13px">${esc(it.word.examples[0][1]||"")}</div><div class="ptcs-meaning">${esc(exampleMeaning(it.word.examples[0],it.word))}</div></div>`:""}<div class="ptcs-actions"><button class="ptcs-btn primary" id="ptcsVocabAudio">▶ Listen</button><button class="ptcs-btn" id="ptcsVocabNext">${S.index+1>=S.items.length?"Start scored quiz →":"Next word →"}</button></div></div>`;document.getElementById("ptcsVocabAudio").onclick=()=>speak(it.char);document.getElementById("ptcsVocabNext").onclick=()=>{S.index++;if(S.index>=S.items.length){S.phase="quiz";S.index=0;S.items=avoidImmediateRepeat(shuffle(S.items,seeded(S.mission?.dayNumber,5800)),"vocab-intro",S.mission?.dayNumber);renderVocabQuiz()}else renderVocabLearn()};localizeRoot(host)}
  function renderVocabQuiz(){S.itemStartedAt=Date.now();const host=document.getElementById("ptCoachSkillContent"),it=S.items[S.index];if(!host||!it)return;const answer=cleanOption(String(wordMeaning(it.word)||it.meaning)),options=plausibleMeaningDistractors(it.word,answer,S.mission?.dayNumber,S.index);host.innerHTML=progressHtml()+`<div class="ptcs-card"><span class="ptcs-kicker">EXCEL VOCABULARY · SCORED QUIZ</span><div class="ptcs-speak-target"><div class="ptcs-hanzi">${esc(it.char)}</div><div class="ptcs-pinyin" data-keep-pinyin="true">${esc(it.word.pinyin||it.pinyin)}</div></div><div class="ptcs-question">Choose the correct meaning.</div><div class="ptcs-options">${options.map(o=>`<button class="ptcs-option">${esc(o)}</button>`).join("")}</div><label style="display:block;margin-top:10px;font-size:12px"><input type="checkbox" id="ptcsConfidence"> Tôi chắc chắn với đáp án này</label><div id="ptcsReveal"></div></div>`;host.querySelectorAll(".ptcs-option").forEach(b=>b.onclick=()=>answerVocab(b,it,answer));localizeRoot(host)}
  function answerVocab(btn,it,answer){
    const opts=[...document.querySelectorAll("#ptCoachSkillContent .ptcs-option")],chosen=btn.textContent.trim(),ok=chosen===answer,bootcamp=Number(S.mission?.dayNumber||1)<=10,py=it.word.pinyin||it.pinyin,ex=exampleOfWord(it.word),dw=distractorWordForMeaning(chosen),intel=wordIntel(it.word);
    opts.forEach(b=>{b.disabled=true;if(b.textContent.trim()===answer)b.classList.add("correct")});if(!ok)btn.classList.add("wrong");const stat=window.getStat?.(it.char),priorExposure=!!(Number(stat?.repetitions)>0||stat?.studyLog?.length),responseMs=Date.now()-S.itemStartedAt,confidence=document.getElementById("ptcsConfidence")?.checked?"certain":"unsure";const quality=window.PanTutorTenLayer?.quality?.({correct:ok,responseMs,priorExposure,confidence})??(ok?5:(priorExposure?2:null));if(!bootcamp&&quality!=null){try{window.gradeWord?.(it.char,quality)}catch(_){}}
    S.answers.push({correct:ok,char:it.char,chosen,answer,input:chosen,expected:answer,priorExposure,responseMs,confidence,sm2Quality:bootcamp?null:quality});
    const strength=ok?T(`Bạn đã nối đúng “${it.char}” (${py}) với nghĩa trong lộ trình.`,`You correctly linked “${it.char}” (${py}) to its curriculum meaning.`):T(`Bạn chọn “${chosen}”, nhưng nghĩa đúng của “${it.char}” là “${answer}”.`,`You chose “${chosen}”, but the correct meaning of “${it.char}” is “${answer}”.`);
    const structure=correctionStructureForWord(it.word);
    const focus=ok?T(`Dùng “${it.char}” trong một câu theo khung: ${structure}.`,`Use “${it.char}” in one sentence with this frame: ${structure}.`):T(`Đọc lại nghĩa đúng, đối chiếu từ dễ nhầm, sau đó tạo một câu theo khung: ${structure}.`,`Review the correct meaning, compare confusables, then create a sentence with this frame: ${structure}.`);
    recordTeacherReport(T("Nghĩa và cách dùng từ","Vocabulary meaning & usage"),ok?100:0,strength,focus);

    const whyLines=[
      ok?T("Đáp án khớp nghĩa được lưu cho từ mục tiêu.","The answer matches the stored meaning for the target word."):dw?T(`Lựa chọn “${chosen}” thuộc về từ khác như “${dw.char}” (${pinyinOfWord(dw)}), nên là phương án nhiễu ở đây.`,`The choice “${chosen}” belongs to another item such as “${dw.char}” (${pinyinOfWord(dw)}), so it is a distractor here.`):T("Lựa chọn này không khớp nghĩa của từ mục tiêu.","This choice does not match the target word."),
      ...detailedWordFeedbackLines(it.word)
    ];
    if(intel?.model)whyLines.push(`${T("Mẫu sử dụng","Usage model")}: ${intel.model}`);

    const report=teacherReportHtml({
      status:ok?T("ĐÚNG — MỞ RỘNG CÁCH DÙNG","CORRECT — EXTEND USAGE"):T("SAI — SỬA NGHĨA VÀ CÁCH DÙNG","INCORRECT — REPAIR MEANING & USAGE"),
      overview:strength,
      sections:[
        {title:T("Input → Output","Input → Output"),lines:[
          `${T("Đầu vào người học","Learner input")}: ${chosen}`,
          `${T("Đầu ra đúng","Correct output")}: ${answer}`,
          `${T("Từ mục tiêu","Target word")}: ${it.char} · ${py}`
        ]},
        {title:T("Vì sao và dùng thế nào","Why & how to use it"),lines:whyLines}
      ],
      model:intel?.model||(ex.zh?`${ex.zh} — ${ex.meaning}`:`${it.char} · ${py} · ${answer}`),
      next:focus
    });
    document.getElementById("ptcsReveal").innerHTML=`<div class="ptcs-reveal">${report}</div><div class="ptcs-next"><button class="ptcs-btn primary" id="ptcsVocabQuizNext">${S.index+1>=S.items.length?T("Hoàn thành từ vựng","Finish vocabulary"):T("Tiếp theo →","Next →")}</button></div>`;
    localizeRoot(document.getElementById("ptcsReveal"));document.getElementById("ptcsVocabQuizNext").onclick=async()=>{S.index++;if(S.index>=S.items.length){const correct=S.answers.filter(x=>x.correct).length,score=Math.round(correct/Math.max(1,S.answers.length)*100),bootcamp=Number(S.mission?.dayNumber||1)<=10,r=await saveEvidence("vocab-intro",score,{completeSet:true,correct,total:S.answers.length,answers:S.answers,teacherReports:S.reports,evidenceType:bootcamp?"ai_coach_phonetics_linked_vocabulary_teacher_feedback_v57_2":"ai_coach_excel_vocabulary_teacher_feedback_v57_2",passThreshold:70});summary(bootcamp?T("Từ vựng gắn với ngữ âm","Phonetics-linked vocabulary"):T("Từ vựng Excel","Excel vocabulary"),score,r,bootcamp?T(`${correct}/${S.answers.length} ví dụ gắn với phát âm đúng. Ngày 1–10 không đưa các mục này vào SRS tổng quát.`,`${correct} of ${S.answers.length} pronunciation-linked examples correct. Day 1–10 does not add these items to general SRS.`):T(`${correct}/${S.answers.length} từ đúng. Các câu trả lời thực tế đã được chuyển vào SRS hiện có.`,`${correct} of ${S.answers.length} words correct. Actual answers were saved into the existing SRS engine.`))}else renderVocabQuiz()}
  }

  /* ---------------- Reading / Writing Lab ---------------- */
  function buildRWItems(m){
    const day=Number(m?.dayNumber||1),words=shuffle(wordList(m),seeded(day,6050)).slice(0,12),items=[];
    if(day<=10){words.slice(0,Math.min(8,words.length)).forEach(w=>items.push({kind:"pinyin",word:w,prompt:`Type the tone-marked Pinyin for ${w.char}.`,answer:String(w.pinyin||"")}));return items}
    const pool=uniq(words.map(wordMeaning).filter(Boolean));
    words.slice(0,6).forEach((w,i)=>{const ex=Array.isArray(w.examples)&&w.examples[0]?w.examples[0]:null;if(i%3===0&&ex){const answer=exampleMeaning(ex,w);items.push({kind:"reading",word:w,prompt:String(ex[0]),answer:cleanOption(answer),options:plausibleMeaningDistractors(w,answer,day,100+i)})}else if(i%3===1){items.push({kind:"pinyin",word:w,prompt:`Type the Pinyin for ${w.char}.`,answer:String(w.pinyin||"")})}else{items.push({kind:"writing",word:w,prompt:T(`Viết một câu tiếng Trung sử dụng “${w.char}” (${wordMeaning(w)||"từ mục tiêu"}).`,`Write one Chinese sentence using “${w.char}” (${wordMeaning(w)||"target word"}).`),reference:String(ex?.[0]||"")})}});
    return items;
  }
  async function openReadingWriting(m){createShell("reading_writing",m);S.items=avoidImmediateRepeat(buildRWItems(S.mission),"reading_writing",S.mission?.dayNumber);S.index=0;S.scores=[];if(!S.items.length){document.getElementById("ptCoachSkillContent").innerHTML='<div class="ptcs-card">No curriculum-linked Reading / Writing items are available for this Day.</div>';return}renderRW()}
  function renderRW(){
    S.itemStartedAt=Date.now();const host=document.getElementById("ptCoachSkillContent"),it=S.items[S.index];if(!host||!it)return;let body="";
    if(it.kind==="reading")body=`<div class="ptcs-question">Read and choose the best meaning.</div><div class="ptcs-hanzi" style="font-size:25px">${esc(it.prompt)}</div><div class="ptcs-options">${it.options.map(o=>`<button class="ptcs-option">${esc(o)}</button>`).join("")}</div>`;
    else if(it.kind==="writing")body=`<div class="ptcs-question">${esc(it.prompt)}</div><div class="ptcs-help">Writing is graded with five teacher criteria: task completion, organization, grammar, vocabulary, and naturalness/style.</div><textarea id="ptcsRWInput" class="ptcs-input" rows="5" autocomplete="off" placeholder="Write a complete Chinese sentence"></textarea><div class="ptcs-actions"><button class="ptcs-btn primary" id="ptcsRWCheck">Compare & grade</button></div>`;
    else body=`<div class="ptcs-question">${esc(it.prompt)}</div><input id="ptcsRWInput" class="ptcs-input" autocomplete="off" placeholder="Type Pinyin with tone marks"><div class="ptcs-actions"><button class="ptcs-btn primary" id="ptcsRWCheck">Check</button></div>`;
    host.innerHTML=progressHtml()+`<div class="ptcs-card"><span class="ptcs-kicker">READING / WRITING · TEACHER-GRADED TASK</span>${body}<div id="ptcsReveal"></div></div>`;
    if(it.kind==="reading")host.querySelectorAll(".ptcs-option").forEach(b=>b.onclick=()=>gradeRW(it,b.textContent.trim(),b));else{const inp=document.getElementById("ptcsRWInput");document.getElementById("ptcsRWCheck").onclick=()=>gradeRW(it,inp.value,null);inp.addEventListener("keydown",e=>{if(e.key==="Enter"&&it.kind!=="writing")gradeRW(it,inp.value,null)});inp.focus()}
  }
  function gradeRW(it,value,btn){
    let points=0,reportHtml="",strength="",focus="",correction=null;
    if(it.kind==="reading"){
      const chosen=String(value||"").trim(),ok=chosen===it.answer;points=ok?100:0;const opts=[...document.querySelectorAll("#ptCoachSkillContent .ptcs-option")];opts.forEach(b=>{b.disabled=true;if(b.textContent.trim()===it.answer)b.classList.add("correct")});if(btn&&!ok)btn.classList.add("wrong");
      const dw=distractorWordForMeaning(chosen),w=it.word||{},ex=exampleOfWord(w),intel=wordIntel(w);strength=ok?T(`Bạn đã nối đúng câu với nghĩa của “${w.char||"từ mục tiêu"}”.`,`You connected the sentence to the meaning of “${w.char||"the target word"}”.`):T("Bạn đã hoàn thành quyết định đọc hiểu nhưng lựa chọn chưa khớp ngữ cảnh câu.","You completed the comprehension decision, but the selected meaning does not match the sentence context.");focus=ok?T("Đọc lại câu và tự diễn đạt nghĩa mà không nhìn đáp án.","Reread the sentence and retell the meaning without the options."):T(`Bám vào “${w.char||"từ mục tiêu"}” (${pinyinOfWord(w)}) và nghĩa “${meaningOfWord(w)||it.answer}”, sau đó đọc lại toàn câu.`,`Anchor on “${w.char||"the target word"}” (${pinyinOfWord(w)}) and its meaning “${meaningOfWord(w)||it.answer}”, then reread the full sentence.`);
      const usage=detailedWordFeedbackLines(w);
      reportHtml=teacherReportHtml({status:ok?T("ĐÚNG — GIẢI THÍCH","CORRECT — EXPLAINED"):T("SAI — PHÂN TÍCH NGỮ CẢNH","INCORRECT — CONTEXT ANALYSIS"),overview:strength,sections:[{title:T("Input → Output","Input → Output"),lines:[`${T("Câu","Sentence")}: ${it.prompt}`,`${T("Bạn chọn","Your input")}: ${chosen}`,`${T("Đáp án tốt nhất","Best output")}: ${it.answer}`,`${T("Từ mục tiêu","Target vocabulary")}: ${w.char||"—"} ${pinyinOfWord(w)?`(${pinyinOfWord(w)})`:""} — ${meaningOfWord(w)||T("từ mục tiêu","target")}`]},{title:T("Vì sao","Why"),lines:[ok?T("Lựa chọn khớp nghĩa và ngữ cảnh của câu.","The choice matches the sentence meaning and context."):dw?T(`“${chosen}” gắn với từ khác như “${dw.char}” (${pinyinOfWord(dw)}), nên không phù hợp ở đây.`,`“${chosen}” is associated with another item such as “${dw.char}” (${pinyinOfWord(dw)}), so it does not fit here.`):T("Phương án đã chọn là distractor và không khớp ngữ cảnh.","The selected option is a distractor and does not match the context."),...usage]}],model:intel?.model||(ex.zh?`${ex.zh} — ${ex.meaning||it.answer}`:`${it.prompt} — ${it.answer}`),next:focus});
      correction={input:chosen,output:it.answer,kind:"reading"};
    }else if(it.kind==="pinyin"){
      const typed=cleanPinyin(value),target=cleanPinyin(it.answer);points=typed===target?100:(stripTone(typed)===stripTone(target)?55:Math.round(40*editSimilarity(stripTone(typed),stripTone(target))));const a=pinyinTeacherAnalysis(it,value,points);reportHtml=a.html;strength=a.strength;focus=a.focus;correction=a.correction;document.getElementById("ptcsRWInput").disabled=true;
    }else{
      const a=writingTeacherAnalysis(it,value);points=a.score;reportHtml=a.html;strength=a.strength;focus=a.focus;correction=a.correction;document.getElementById("ptcsRWInput").disabled=true;
    }
    S.scores[S.index]=points;
    S.answers.push({kind:it.kind,input:String(value||""),score:points,target:it.word?.char||"",expected:it.answer||it.reference||"",correction,responseMs:Date.now()-S.itemStartedAt});
    recordTeacherReport(it.kind==="writing"?T("Viết","Writing"):it.kind==="reading"?T("Đọc hiểu","Reading comprehension"):T("Viết Pinyin","Pinyin writing"),points,strength,focus);
    document.getElementById("ptcsReveal").innerHTML=`<div class="ptcs-reveal"><b>${points}/100</b>${reportHtml}</div><div class="ptcs-next"><button class="ptcs-btn primary" id="ptcsRWNext">${S.index+1>=S.items.length?T("Hoàn thành Đọc / Viết","Finish Reading / Writing"):T("Tiếp theo →","Next →")}</button></div>`;
    localizeRoot(document.getElementById("ptcsReveal"));document.getElementById("ptcsRWNext").onclick=async()=>{S.index++;if(S.index>=S.items.length){const vals=S.scores.filter(Number.isFinite),score=Math.round(vals.reduce((a,b)=>a+b,0)/Math.max(1,vals.length)),r=await saveEvidence("reading_writing",score,{completeSet:vals.length===S.items.length,itemScores:vals,attempts:S.answers,teacherReports:S.reports,evidenceType:"ai_coach_reading_writing_input_output_repair_v57_2",passThreshold:60});summary(T("Đọc / Viết","Reading / Writing"),score,r,T(`${vals.length} mục theo lộ trình đã hoàn thành với phản hồi Input → Chẩn đoán → Cấu trúc đúng → Output sửa.`,`${vals.length} curriculum-linked items completed with Input → Diagnosis → Correct structure → Repaired output feedback.`))}else renderRW()}
  }

  /* ---------------- Mistake Review Lab ---------------- */
  function mistakeItems(){const q=window.PandaHanMistakes?.getQueue?.()||[];return q.slice(0,12).map(x=>{let expected=String(x.expected||"").trim();const w=vocabMap()[x.char];if(!expected&&w)expected=String(wordMeaning(w)||w.char||"");return {...x,expected}}).filter(x=>x.expected)}
  async function openMistakeReview(m){createShell("mistake_review",m);S.items=mistakeItems();S.index=0;S.answers=[];if(!S.items.length){const r=await saveEvidence("mistake_review",100,{completeSet:true,total:0,correct:0,evidenceType:"ai_coach_mistake_queue_empty",passThreshold:70});summary("Mistake review",100,r,"No reviewable unresolved items are currently in the queue.");return}renderMistake()}
  function acceptable(a,b){const x=clean(a),y=clean(b);if(!x||!y)return false;if(x===y)return true;if(Math.min(x.length,y.length)>=3&&(x.includes(y)||y.includes(x)))return true;return editSimilarity(x,y)>=.88}
  function renderMistake(){const host=document.getElementById("ptCoachSkillContent"),it=S.items[S.index];if(!host||!it)return;host.innerHTML=progressHtml()+`<div class="ptcs-card"><span class="ptcs-kicker">MISTAKE REVIEW · ACTUAL RETRY</span><div class="ptcs-question">Redo this item.</div><div class="ptcs-reveal"><b>Original prompt</b><div style="margin-top:6px">${esc(it.prompt||it.char||"Review the target item")}</div>${it.selected?`<div class="ptcs-help" style="margin-top:7px">Previous answer: ${esc(it.selected)}</div>`:""}</div><input id="ptcsMistakeInput" class="ptcs-input" autocomplete="off" placeholder="Type the correct answer"><div class="ptcs-actions"><button id="ptcsMistakeCheck" class="ptcs-btn primary">Check</button></div><div id="ptcsReveal2"></div></div>`;const inp=document.getElementById("ptcsMistakeInput");document.getElementById("ptcsMistakeCheck").onclick=()=>checkMistake(inp,it);inp.addEventListener("keydown",e=>{if(e.key==="Enter")checkMistake(inp,it)});inp.focus()}
  function checkMistake(inp,it){
    if(inp.disabled)return;
    const typed=String(inp.value||"").trim(),ok=acceptable(typed,it.expected);inp.disabled=true;
    if(ok){try{window.PandaHanMistakes?.resolveEntry?.(it.key)}catch(_){}}
    const w=vocabMap()[it.char]||null,intel=wordIntel(w),repair=repairLearnerSentence(typed,String(it.char||""));
    S.answers.push({correct:ok,key:it.key,typed,expected:it.expected,correction:repair.changed?repair:null});
    const strength=ok?T("Bạn đã sửa đúng ở một lượt truy hồi mới nên lỗi có thể được đánh dấu đã xử lý.","You corrected the item on a fresh retrieval attempt, so the mistake can be resolved."):T("Lần làm lại vẫn chưa khớp đáp án mong đợi nên lỗi tiếp tục ở hàng đợi ôn.","The retry still does not match the expected answer, so the mistake remains in the review queue.");
    const structure=w?correctionStructureForWord(w):"";
    const focus=ok?T("Tự giải thích vì sao đáp án mới đúng, sau đó tạo một ví dụ khác.","Explain why the corrected answer works, then create one new example."):structure?T(`So sánh đầu vào với đáp án đúng và kiểm tra lại theo khung: ${structure}.`,`Compare the input with the expected answer and recheck it with this frame: ${structure}.`):T(`So sánh “${typed||"(trống)"}” với “${it.expected}”, xác định sai ở nghĩa, dạng từ, trật tự hay thiếu thông tin rồi làm lại.`,`Compare “${typed||"(blank)"}” with “${it.expected}”, identify whether the error is meaning, word form, order or omission, then retry.`);
    recordTeacherReport(T("Sửa lỗi","Mistake correction"),ok?100:0,strength,focus);
    const whyLines=[ok?T("Lần làm lại hiện tại khớp đáp án đủ để giải quyết lỗi.","The current retry matches the expected answer closely enough to resolve the mistake."):T("Lần làm lại vẫn nằm ngoài ngưỡng chấp nhận; không tự đánh dấu đúng để tránh che mất lỗ hổng học tập.","The retry is still outside the accepted match range; it is not auto-resolved so the learning gap remains visible.")];
    if(structure)whyLines.push(`${T("Cấu trúc cần đối chiếu","Structure to compare")}: ${structure}`);
    if(intel?.errors?.length)whyLines.push(`${T("Lỗi thường gặp","Common error")}: ${intel.errors[0]}`);
    if(repair.changed)whyLines.push(`${T("Sửa theo quy tắc","Rule-based repair")}: ${repair.text} · ${repair.reason}`);
    const report=teacherReportHtml({status:ok?T("ĐÃ SỬA","RESOLVED"):T("CHƯA SỬA XONG","STILL UNRESOLVED"),overview:strength,sections:[
      {title:T("Lịch sử Input → Output","Input → Output history"),lines:[`${T("Đề gốc","Original prompt")}: ${it.prompt||it.char||T("Mục ôn","Review item")}`,it.selected?`${T("Đáp án trước","Previous answer")}: ${it.selected}`:T("Không có đáp án trước được lưu.","No previous answer text was stored."),`${T("Input hiện tại","Current input")}: ${typed||T("(trống)","(blank)")}`,`${T("Output mong đợi","Expected output")}: ${it.expected}`]},
      {title:T("Chẩn đoán và cách sửa","Diagnosis & repair"),lines:whyLines}
    ],model:intel?.model||it.expected,next:focus});
    document.getElementById("ptcsReveal2").innerHTML=`<div class="ptcs-reveal">${report}</div><div class="ptcs-next"><button class="ptcs-btn primary" id="ptcsMistakeNext">${S.index+1>=S.items.length?T("Hoàn thành ôn lỗi","Finish review batch"):T("Lỗi tiếp theo →","Next mistake →")}</button></div>`;
    localizeRoot(document.getElementById("ptcsReveal2"));document.getElementById("ptcsMistakeNext").onclick=async()=>{S.index++;if(S.index>=S.items.length){const correct=S.answers.filter(x=>x.correct).length,score=Math.round(correct/Math.max(1,S.answers.length)*100),r=await saveEvidence("mistake_review",score,{completeSet:true,correct,total:S.answers.length,attempts:S.answers,teacherReports:S.reports,remaining:window.PandaHanMistakes?.getQueue?.().length||0,evidenceType:"ai_coach_mistake_review_input_output_repair_v57_2",passThreshold:70});summary(T("Ôn lỗi sai","Mistake review"),score,r,T(`${correct}/${S.answers.length} lỗi trong batch đã được sửa. Còn ${window.PandaHanMistakes?.getQueue?.().length||0} lỗi trong hàng đợi.`,`${correct} of ${S.answers.length} retry items corrected. Remaining queue: ${window.PandaHanMistakes?.getQueue?.().length||0}.`))}else renderMistake()}
  }

  /* ---------------- Speaking / Read-aloud: canonical PCM WAV + better recognition ---------------- */
  function recognitionCtor(){return window.SpeechRecognition||window.webkitSpeechRecognition||null}
  function encodeWav(samples,sampleRate){const buf=new ArrayBuffer(44+samples.length*2),v=new DataView(buf),write=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};write(0,"RIFF");v.setUint32(4,36+samples.length*2,true);write(8,"WAVE");write(12,"fmt ");v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sampleRate,true);v.setUint32(28,sampleRate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);write(36,"data");v.setUint32(40,samples.length*2,true);for(let i=0;i<samples.length;i++)v.setInt16(44+i*2,Math.max(-1,Math.min(1,samples[i]))*32767,true);return new Blob([buf],{type:"audio/wav"})}
  function mergePcm(chunks){const n=chunks.reduce((s,a)=>s+a.length,0),out=new Float32Array(n);let p=0;chunks.forEach(a=>{out.set(a,p);p+=a.length});return out}
  function cleanupAudio(){
    try{if(S.recorder&&S.recorder.state!=="inactive")S.recorder.stop()}catch(_){};try{S.recognition?.abort?.()}catch(_){};try{S.processor&&(S.processor.onaudioprocess=null);S.processor?.disconnect?.()}catch(_){};try{S.sourceNode?.disconnect?.()}catch(_){};try{S.silentGain?.disconnect?.()}catch(_){};try{S.audioCtx?.close?.()}catch(_){};try{S.stream?.getTracks?.().forEach(t=>t.stop())}catch(_){};
    S.recorder=null;S.recognition=null;S.processor=null;S.sourceNode=null;S.silentGain=null;S.audioCtx=null;S.stream=null;S.pcmChunks=[];S.pcmRate=0;
  }
  function clearRecordingUrl(){if(S.recordUrl){try{URL.revokeObjectURL(S.recordUrl)}catch(_){}S.recordUrl=""}S.recordBlob=null}
  async function openSpeaking(m){createShell("speaking",m);S.items=wordList(S.mission).map(itemFromWord).filter(x=>x.text).slice(0,Number(S.mission?.dayNumber||1)%7===0?8:5);S.index=0;S.scores=[];if(!S.items.length){document.getElementById("ptCoachSkillContent").innerHTML='<div class="ptcs-card">No curriculum-linked speaking cards are available for this Day.</div>';return}renderSpeaking()}
  function renderSpeaking(){cleanupAudio();clearRecordingUrl();const host=document.getElementById("ptCoachSkillContent"),it=S.items[S.index];if(!host||!it)return;host.innerHTML=progressHtml()+`<div class="ptcs-card"><span class="ptcs-kicker">SPEAKING · MODEL → CANONICAL WAV → RUBRIC</span><div class="ptcs-speak-target"><div class="ptcs-hanzi">${esc(it.text)}</div><div class="ptcs-pinyin" data-keep-pinyin="true">${esc(it.pinyin)}</div><div class="ptcs-meaning">${esc(it.meaning)}</div></div><div class="ptcs-actions"><button class="ptcs-btn primary" id="ptcsModel">▶ Play natural model</button><button class="ptcs-btn record" id="ptcsRecord">● Record</button><button class="ptcs-btn stop" id="ptcsStop" disabled>■ Stop & grade</button><button class="ptcs-btn" id="ptcsPlayback" disabled>▶ Replay exact graded WAV</button></div><div id="ptcsRecStatus" class="ptcs-rec-status">The replay and scorer use the same canonical mono PCM WAV whenever the browser supports raw capture.</div><div id="ptcsSpeakScore"></div></div>`;document.getElementById("ptcsModel").onclick=()=>speak(it.text);document.getElementById("ptcsRecord").onclick=()=>startSpeakingCapture(it);document.getElementById("ptcsStop").onclick=()=>stopSpeakingCapture(it);document.getElementById("ptcsPlayback").onclick=()=>{if(S.recordUrl)new Audio(S.recordUrl).play().catch(()=>{})};S.autoTimer=setTimeout(()=>speak(it.text),180)}
  async function startSpeakingCapture(it){cleanupAudio();clearRecordingUrl();try{speechSynthesis?.cancel?.()}catch(_){};const status=document.getElementById("ptcsRecStatus");try{
      S.stream=await navigator.mediaDevices.getUserMedia({audio:{channelCount:{ideal:1},sampleRate:{ideal:48000},sampleSize:{ideal:16},echoCancellation:{ideal:false},noiseSuppression:{ideal:false},autoGainControl:{ideal:false}}});
      const AC=window.AudioContext||window.webkitAudioContext;if(AC){S.audioCtx=new AC();if(S.audioCtx.state==="suspended")await S.audioCtx.resume().catch(()=>{});S.pcmRate=S.audioCtx.sampleRate;S.pcmChunks=[];S.sourceNode=S.audioCtx.createMediaStreamSource(S.stream);S.processor=S.audioCtx.createScriptProcessor(4096,1,1);S.silentGain=S.audioCtx.createGain();S.silentGain.gain.value=0;S.processor.onaudioprocess=e=>{const x=e.inputBuffer.getChannelData(0);S.pcmChunks.push(new Float32Array(x))};S.sourceNode.connect(S.processor);S.processor.connect(S.silentGain);S.silentGain.connect(S.audioCtx.destination)}
      if(window.MediaRecorder){const types=["audio/webm;codecs=opus","audio/ogg;codecs=opus","audio/webm","audio/mp4"];const mime=types.find(t=>MediaRecorder.isTypeSupported?.(t))||"";S.chunks=[];S.recorder=new MediaRecorder(S.stream,mime?{mimeType:mime}:undefined);S.recorder.ondataavailable=e=>{if(e.data?.size)S.chunks.push(e.data)};S.recorder.start(160)}
      S.recognitionCandidates=[];S.recognitionError="";S.recognitionEnded=false;const RC=recognitionCtor();if(RC){try{const r=new RC();S.recognition=r;r.lang="zh-CN";r.interimResults=true;r.continuous=false;r.maxAlternatives=5;r.onresult=e=>{for(let i=e.resultIndex;i<e.results.length;i++){const result=e.results[i];for(let j=0;j<result.length;j++){const a=result[j];const txt=String(a.transcript||"").trim();if(txt)S.recognitionCandidates.push({text:txt,confidence:Number(a.confidence||0),final:!!result.isFinal})}}};r.onerror=e=>{S.recognitionError=String(e?.error||"recognition_error")};r.onend=()=>{S.recognitionEnded=true};r.start()}catch(e){S.recognitionError=String(e?.message||"recognition_start_failed")} }else S.recognitionError="unsupported";
      document.getElementById("ptcsRecord").disabled=true;document.getElementById("ptcsStop").disabled=false;if(status)status.textContent="Recording raw mono speech… read the full target naturally, then press Stop & grade.";
    }catch(e){if(status)status.textContent="Microphone permission is required. Please allow microphone access and try again.";cleanupAudio()}}
  async function stopSpeakingCapture(it){const status=document.getElementById("ptcsRecStatus"),stop=document.getElementById("ptcsStop");if(stop)stop.disabled=true;if(status)status.textContent="Building canonical WAV and analyzing pronunciation…";try{S.recognition?.stop?.()}catch(_){}
    let fallbackBlob=null;if(S.recorder&&S.recorder.state!=="inactive")fallbackBlob=await new Promise(resolve=>{const r=S.recorder;r.onstop=()=>resolve(new Blob(S.chunks,{type:r.mimeType||"audio/webm"}));try{r.stop()}catch(_){resolve(null)}});
    await new Promise(r=>setTimeout(r,900));let blob=null;const pcm=mergePcm(S.pcmChunks);if(pcm.length>Math.max(1000,(S.pcmRate||48000)*.22))blob=encodeWav(pcm,S.pcmRate||48000);else blob=fallbackBlob;cleanupAudio();if(!blob){if(status)status.textContent="No usable audio was captured. Please record again.";document.getElementById("ptcsRecord").disabled=false;return}
    S.recordBlob=blob;S.recordUrl=URL.createObjectURL(blob);document.getElementById("ptcsPlayback").disabled=false;const metrics=await analyzeAudio(blob,it.pinyin);const rec=bestRecognition(it.text,S.recognitionCandidates);const grade=gradeSpeaking(it,rec,metrics);if(!grade.valid){if(status)status.textContent=grade.feedback;document.getElementById("ptcsRecord").disabled=false;document.getElementById("ptcsStop").disabled=true;renderInvalidSpeaking(grade,it);return}S.scores[S.index]=grade.score;S.speakingItems[S.index]={target:it.text,word:it.word?.char||"",expected:it.text,input:grade.recognized||"",recognized:grade.recognized||"",pinyin:it.pinyin,score:grade.score,correct:grade.fullCompatible===true,tone:grade.tone,segmental:grade.segmental,articulation:grade.articulation,fluency:grade.fluency,audioOnly:!!grade.audioOnly};renderSpeakingScore(grade,it);if(status)status.textContent=grade.audioOnly?"Speech recognition was unavailable, so this card was graded from the exact WAV with the acoustic rubric. You can replay it and continue.":"Graded from the exact WAV used by Replay. Compare it with the model before continuing.";
  }
  function bestRecognition(target,cands){const list=(cands||[]).filter(x=>x.text);if(!list.length)return{text:"",confidence:0,similarity:0};let best=null;list.forEach(c=>{const sim=editSimilarity(target,c.text),quality=.88*sim+.12*clamp(c.confidence);if(!best||quality>best.quality)best={...c,similarity:sim,quality}});return best||{text:"",confidence:0,similarity:0}}
  function pinyinTones(p){return String(p||"").split(/[\s,'’·-]+/).map(tok=>{let t=0;for(const ch of tok)if(toneMarks[ch])t=toneMarks[ch];return /[A-Za-züÜāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(tok)?t||5:0}).filter(Boolean)}
  function median(a){if(!a.length)return 0;const b=[...a].sort((x,y)=>x-y),m=Math.floor(b.length/2);return b.length%2?b[m]:(b[m-1]+b[m])/2}
  function mean(a){return a.length?a.reduce((s,v)=>s+v,0)/a.length:0}
  function trimSignal(s,threshold){let a=0,b=s.length-1;while(a<b&&Math.abs(s[a])<threshold)a++;while(b>a&&Math.abs(s[b])<threshold)b--;return s.slice(Math.max(0,a-300),Math.min(s.length,b+301))}
  function pitchTrack(s,sr,rms){const frame=Math.max(256,Math.floor(sr*.04)),hop=Math.max(96,Math.floor(sr*.012)),pts=[];for(let off=0;off+frame<s.length;off+=hop){let e=0;for(let i=0;i<frame;i++){const v=s[off+i];e+=v*v}const fr=Math.sqrt(e/frame);if(fr<Math.max(.0018,rms*.18))continue;let best=0,bestLag=0;const lo=Math.floor(sr/500),hi=Math.min(frame-3,Math.floor(sr/70));for(let lag=lo;lag<=hi;lag+=2){let c=0,a=0,b=0;for(let i=0;i<frame-lag;i+=2){const u=s[off+i],v=s[off+i+lag];c+=u*v;a+=u*u;b+=v*v}const q=c/Math.sqrt(a*b||1);if(q>best){best=q;bestLag=lag}}if(best>.38&&bestLag){const hz=sr/bestLag;if(hz>=70&&hz<=500)pts.push({time:off/sr,hz,quality:best})}}return pts}
  function toneScore(points,tones){if(!tones.length||points.length<Math.max(5,tones.length*2))return null;const med=median(points.map(x=>x.hz));const sem=points.map(x=>12*Math.log2(x.hz/med));let sum=0,n=0;for(let i=0;i<tones.length;i++){const a=Math.floor(i*sem.length/tones.length),b=Math.max(a+1,Math.floor((i+1)*sem.length/tones.length)),seg=sem.slice(a,b);if(seg.length<2)continue;const qn=Math.max(1,Math.floor(seg.length*.25)),first=mean(seg.slice(0,qn)),last=mean(seg.slice(-qn)),mn=Math.min(...seg),mx=Math.max(...seg),slope=last-first,range=mx-mn;let q=.65;const t=tones[i];if(t===1)q=clamp(1-Math.abs(slope)/3.2-Math.max(0,range-3.2)/7);else if(t===2)q=clamp(.45+(slope+0.2)/4.2);else if(t===4)q=clamp(.45+(-slope+0.2)/4.2);else if(t===3){const dip=Math.min(first,last)-mn,recovery=last-mn;q=clamp(.35+Math.max(0,dip)/3.2+Math.max(0,recovery)/5);if(slope<-.5&&recovery<1.1)q=Math.max(q,.55)}else q=clamp(.8-Math.max(0,range-4)/9);sum+=q;n++}return n?sum/n:null}
  function estimateSyllables(s,sr,rms){
    const frame=Math.max(160,Math.floor(sr*.024)),hop=Math.max(80,Math.floor(sr*.010)),env=[];
    for(let o=0;o+frame<s.length;o+=hop){let e=0;for(let i=0;i<frame;i++){const v=s[o+i];e+=v*v}env.push(Math.sqrt(e/frame))}
    if(env.length<3)return 0;
    const smooth=env.map((_,i)=>mean(env.slice(Math.max(0,i-2),Math.min(env.length,i+3))));
    const threshold=Math.max(.0018,rms*.30),minGap=Math.max(4,Math.round(.105/(hop/sr)));let count=0,last=-minGap;
    for(let i=1;i<smooth.length-1;i++){if(smooth[i]>=threshold&&smooth[i]>=smooth[i-1]&&smooth[i]>smooth[i+1]&&i-last>=minGap){count++;last=i}}
    return count;
  }
  async function analyzeAudio(blob,pinyin){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return{valid:false,reason:"AudioContext unavailable"};const ctx=new AC();const buf=await ctx.decodeAudioData(await blob.arrayBuffer());let s=buf.getChannelData(0);let e=0,peak=0;for(const v of s){e+=v*v;peak=Math.max(peak,Math.abs(v))}const rms=Math.sqrt(e/Math.max(1,s.length));if(buf.duration<.24||peak<.004||rms<.001)return{valid:false,reason:"Speech was too short or too faint"};const trimmed=trimSignal(s,Math.max(.0015,rms*.12));let activeFrames=0,totalFrames=0;const f=Math.max(128,Math.floor(buf.sampleRate*.02));for(let o=0;o+f<trimmed.length;o+=f){totalFrames++;let fe=0;for(let i=0;i<f;i++)fe+=trimmed[o+i]*trimmed[o+i];if(Math.sqrt(fe/f)>Math.max(.0018,rms*.16))activeFrames++}const voicedRatio=totalFrames?activeFrames/totalFrames:0;const pitches=pitchTrack(trimmed,buf.sampleRate,rms),tones=pinyinTones(pinyin),toneCompat=toneScore(pitches,tones),speechDuration=trimmed.length/buf.sampleRate,signalQuality=clamp((rms-.001)/.025*.55+voicedRatio*.35+clamp(pitches.length/Math.max(8,tones.length*3))*.10),estimatedSyllables=estimateSyllables(trimmed,buf.sampleRate,rms),targetSyllables=Math.max(1,tones.length),syllableFit=estimatedSyllables?clamp(1-Math.abs(estimatedSyllables-targetSyllables)/Math.max(targetSyllables,2)):0;await ctx.close().catch(()=>{});return{valid:true,duration:buf.duration,speechDuration,rms,peak,voicedRatio,pitchCount:pitches.length,toneCompat,signalQuality,syllables:tones.length,estimatedSyllables,syllableFit}}catch(e){return{valid:false,reason:e?.message||"Audio decode failed"}}}
  function gradeSpeaking(it,rec,metrics){
    if(!metrics?.valid)return{valid:false,score:null,feedback:`Recording could not be graded reliably: ${metrics?.reason||"invalid audio"}. Record again; no low score is saved.`,recognized:rec?.text||"",metrics};
    const sim=Number(rec?.similarity||0),conf=clamp(rec?.confidence||0),hasTranscript=!!String(rec?.text||"").trim(),toneCompat=metrics.toneCompat,signal=clamp(metrics.signalQuality),voiced=clamp(metrics.voicedRatio),pitchCoverage=clamp(Number(metrics.pitchCount||0)/Math.max(8,Number(metrics.syllables||1)*2.2));
    const syll=Math.max(1,Number(metrics.syllables||Array.from(clean(it.text)).length||1)),expected=.32*syll+.18,dur=Number(metrics.speechDuration||metrics.duration||0),durationFit=clamp(1-Math.abs(dur-expected)/Math.max(expected*1.15,1.2)),syllableFit=Number.isFinite(metrics.syllableFit)?clamp(metrics.syllableFit):clamp(.55*durationFit+.45*voiced);
    if(hasTranscript){
      const toneRatio=toneCompat==null?clamp(.55*sim+.25*conf+.20*signal):clamp(.72*toneCompat+.18*sim+.10*signal);
      let tone=Math.round(35*toneRatio),segmental=Math.round(35*clamp(.86*sim+.14*Math.max(conf,.55*sim))),articulation=Math.round(20*clamp(.58*sim+.27*signal+.15*voiced)),fluency=Math.round(10*clamp(.58*durationFit+.30*voiced+.12*signal));
      const fullCompatible=sim>=.985&&signal>=.42&&(toneCompat==null?conf>=.68:toneCompat>=.72);
      if(fullCompatible)return{valid:true,score:100,fullCompatible:true,audioOnly:false,similarity:sim,recognized:rec.text,tone:35,segmental:35,articulation:20,fluency:10,feedback:"Full compatibility detected across content recognition and acoustic checks: 100/100.",metrics};
      let score=tone+segmental+articulation+fluency;let cap=sim<.18?34:sim<.35?44:sim<.55?59:sim<.72?74:sim<.88?89:97;if(toneCompat!=null&&toneCompat<.28)cap=Math.min(cap,59);else if(toneCompat!=null&&toneCompat<.45)cap=Math.min(cap,74);score=Math.min(score,cap);
      const feedback=sim<.35?"The recognized Mandarin differs strongly from the target, but the recording is valid. Review the model, then continue or retry this card.":sim<.55?"The recognized syllable/word content differs substantially from the target. Rebuild the sentence slowly, then repeat with the model.":toneCompat!=null&&toneCompat<.45?"The words are mostly recognized, but the pitch movement does not match the target tones closely enough. Focus on tone direction before increasing speed.":sim<.88?"The target is partly compatible. Focus on the mismatched syllables, initial/final clarity and sentence rhythm.":"Very close. A small tone, segmental or rhythm mismatch remains.";
      return{valid:true,score,fullCompatible:false,audioOnly:false,similarity:sim,recognized:rec.text,tone,segmental,articulation,fluency,feedback,metrics};
    }
    /* ASR is optional. When it is unavailable we grade only what the WAV can support.
       The score is deliberately capped below 90 because target words/initial-final identity
       cannot be fully verified without a transcript or a phoneme model. */
    const toneRatio=toneCompat==null?clamp(.48*signal+.30*voiced+.22*pitchCoverage):clamp(.82*toneCompat+.10*signal+.08*pitchCoverage);
    const segmentProxy=clamp(.46*syllableFit+.24*durationFit+.18*signal+.12*pitchCoverage);
    const articulationProxy=clamp(.38*signal+.30*syllableFit+.20*voiced+.12*pitchCoverage);
    const fluencyRatio=clamp(.54*durationFit+.30*voiced+.16*syllableFit);
    let tone=Math.round(35*toneRatio),segmental=Math.round(35*segmentProxy),articulation=Math.round(20*articulationProxy),fluency=Math.round(10*fluencyRatio),score=tone+segmental+articulation+fluency;
    const acousticConfidence=clamp(.30*signal+.25*voiced+.25*syllableFit+.20*(toneCompat==null?pitchCoverage:toneCompat));
    if(acousticConfidence<.28)score=Math.min(score,49);else if(acousticConfidence<.42)score=Math.min(score,59);else score=Math.min(score,84);
    return{valid:true,score,fullCompatible:false,audioOnly:true,similarity:null,recognized:"",tone,segmental,articulation,fluency,feedback:`Speech recognition did not return a reliable transcript (${S.recognitionError||"browser/connection unavailable"}). This card was still graded from the canonical WAV using tone contour, syllable timing, signal clarity and fluency. Audio-only grading is capped at 84/100 because target word identity cannot be fully verified.`,metrics};
  }
  async function finishSpeakingFromCurrent(){
    const vals=S.scores.filter(Number.isFinite),score=Math.round(vals.reduce((a,b)=>a+b,0)/Math.max(1,vals.length)),complete=vals.length===S.items.length,r=await saveEvidence("speaking",score,{completeSet:complete,cardScores:S.scores.map(v=>Number.isFinite(v)?v:null),teacherReports:S.reports,total:S.items.length,graded:vals.length,evidenceType:"ai_coach_speaking_canonical_wav_rubric_teacher_feedback_v57",passThreshold:60});summary("Speaking / Read-aloud",score,r,`${vals.length} of ${S.items.length} cards received rubric scores. Each graded card includes criterion-level teacher feedback.`)
  }
  function advanceSpeaking(){S.index++;if(S.index>=S.items.length)finishSpeakingFromCurrent();else renderSpeaking()}
  function renderInvalidSpeaking(g,it){const h=document.getElementById("ptcsSpeakScore");if(!h)return;h.innerHTML=`<div class="ptcs-score"><div class="ptcs-help"><b>No score saved for this card.</b> ${esc(g.feedback)}</div><div class="ptcs-transcript" style="margin-top:8px"><b>Recognized:</b> ${esc(g.recognized||"No reliable transcript")}<br><b>Target:</b> ${esc(it.text)}</div><div class="ptcs-next" style="gap:8px"><button class="ptcs-btn" id="ptcsSpeakRetry">Record again</button><button class="ptcs-btn primary" id="ptcsSpeakSkip">${S.index+1>=S.items.length?"Finish without this score":"Skip card →"}</button></div></div>`;document.getElementById("ptcsSpeakRetry").onclick=()=>{h.innerHTML="";document.getElementById("ptcsRecord").disabled=false;document.getElementById("ptcsRecStatus").textContent="Ready to record again."};document.getElementById("ptcsSpeakSkip").onclick=()=>advanceSpeaking()}
  function renderSpeakingScore(g,it){
    const h=document.getElementById("ptcsSpeakScore");if(!h)return;
    const mode=g.audioOnly?`<span class="ptcs-badge" style="background:#fff7ed;color:#9a3412">${T("Chấm chủ yếu bằng âm học","Acoustic-only grading")}</span>`:`<span class="ptcs-badge">${T("ASR + âm học","ASR + acoustic grading")}</span>`;
    const toneComment=g.tone>=31?T("Đường cao độ gần mục tiêu.","Tone contours are strong and close to the target."):g.tone>=24?T("Phần lớn hướng thanh dùng được nhưng cần làm rõ độ cao/độ dốc.","Most tone directions are usable, but one or more contours need clearer height/slope."):g.tone>=16?T("Hướng thanh chưa ổn định; nên luyện từng âm tiết.","Tone direction is inconsistent; practise syllable by syllable first."):T("Bằng chứng thanh điệu yếu hoặc không khớp mẫu mục tiêu.","Tone evidence is weak or conflicts with the target pattern.");
    const segComment=g.segmental>=31?T("Âm đầu/vần được nhận dạng tốt.","Initial/final identity is strongly supported by recognition."):g.segmental>=24?T("Phần lớn âm tiết được nhận dạng nhưng vẫn có điểm chưa chắc.","Most syllable content is recognized, with some segmental uncertainty."):g.audioOnly?T("Không có transcript đáng tin cậy nên âm đầu/vần chỉ được ước lượng từ tín hiệu âm học.","No reliable transcript was available, so initial/final identity is only estimated from acoustic timing."):T("Một số âm tiết nhận dạng khác mục tiêu; cần dựng lại âm đầu/vần chậm hơn.","Several recognized syllables differ from the target; rebuild initials/finals slowly.");
    const artComment=g.articulation>=17?T("Độ rõ âm học ổn định.","Acoustic clarity is stable."):g.articulation>=12?T("Độ rõ dùng được nhưng ranh giới phụ âm/nguyên âm có thể rõ hơn.","Clarity is usable but consonant/vowel definition can be sharper."):T("Tín hiệu cho thấy cấu âm chưa rõ; chấm bằng microphone chỉ là acoustic proxy, không nhìn trực tiếp môi/lưỡi.","Acoustic evidence suggests blurred articulation; microphone scoring cannot directly see tongue/lip position.");
    const fluComment=g.fluency>=8?T("Nhịp và độ liền mạch tự nhiên.","Pacing and continuity are natural for this target."):g.fluency>=5?T("Câu hiểu được nhưng nhịp/dừng chưa đều.","The sentence is understandable but timing/pauses are uneven."):T("Bài đọc còn rời hoặc thời lượng lệch đáng kể so với mục tiêu.","Speech is too fragmented or timing differs substantially from the target.");
    const strength=g.score>=90?T("Bài đọc gần mẫu trên các bằng chứng hiện có.","The read-aloud is close to the model across the available evidence."):g.score>=75?T("Câu khá ổn định nhưng còn một vài điểm phát âm cần sửa.","The sentence is mostly stable, with a small number of pronunciation weaknesses."):g.score>=60?T("Bài đạt ngưỡng nhưng vẫn có ít nhất một thành phần cần luyện tập trung.","The attempt passes, but at least one pronunciation component still needs focused practice."):T("Bản ghi hợp lệ nhưng phát âm chưa ổn định với mục tiêu này.","The recording is valid, but pronunciation is not yet stable enough for this target.");
    const focus=g.tone<24?T("Nghe mẫu và bắt chước riêng đường cao độ trước, sau đó mới ghép chữ.","Replay the model and copy only the pitch direction first; then add the words."):g.segmental<24?T("Đọc chậm và dựng lại âm đầu/vần chưa rõ trước khi tăng tốc.","Slow down and rebuild the unclear initial/final syllables before restoring normal speed."):g.fluency<6?T("Đọc theo cụm nghĩa ngắn rồi nối lại, tránh khoảng dừng dài.","Read in short meaning groups, then reconnect them without long pauses."):T("Thu thêm một lần, giữ độ rõ hiện tại và tăng nhẹ tính tự nhiên.","Record one more attempt aiming for the same clarity at a slightly more natural pace.");
    const intel=wordIntel(it.word),recognized=g.recognized||T("Không có transcript đáng tin cậy","Unavailable — acoustic-only grading");
    const inputOutputLines=[
      `${T("Input máy nghe được","Recognized input")}: ${recognized}`,
      `${T("Output mục tiêu","Target output")}: ${it.text}`,
      `Pinyin: ${it.pinyin}`,
      `${T("Hướng sửa ưu tiên","Priority repair")}: ${focus}`
    ];
    if(intel?.pronunciation)inputOutputLines.push(`${T("Điểm phát âm cần nhớ","Pronunciation cue")}: ${intel.pronunciation}`);
    recordTeacherReport(T("Nói / Đọc thành tiếng","Speaking / Read-aloud"),g.score,strength,focus);
    const report=teacherReportHtml({status:g.fullCompatible?T("TƯƠNG THÍCH CAO","FULL COMPATIBILITY"):g.audioOnly?T("RUBRIC ÂM HỌC","AUDIO-ONLY RUBRIC"):T("PHÂN TÍCH RUBRIC","RUBRIC ANALYSIS"),overview:strength,sections:[
      {title:T("Input → Output phát âm","Pronunciation input → target output"),lines:inputOutputLines},
      {title:"Tone /35",lines:[`${g.tone}/35. ${toneComment}`,`${T("Tương thích đường thanh","Acoustic tone compatibility")}: ${g.metrics?.toneCompat==null?T("chưa đủ tin cậy","not reliable enough to use"):Math.round(g.metrics.toneCompat*100)+"%"}`]},
      {title:"Initial–final /35",lines:[`${g.segmental}/35. ${segComment}`,`${T("Máy nhận dạng","Recognized")}: ${recognized}`,`${T("Mục tiêu","Target")}: ${it.text}`]},
      {title:"Articulation /20",lines:[`${g.articulation}/20. ${artComment}`,`${T("Chất lượng tín hiệu","Signal quality")}: ${Math.round(Number(g.metrics?.signalQuality||0)*100)}% · voiced ratio: ${Math.round(Number(g.metrics?.voicedRatio||0)*100)}%`]},
      {title:"Fluency /10",lines:[`${g.fluency}/10. ${fluComment}`,`${T("Số âm tiết ước lượng","Estimated syllables")}: ${Number(g.metrics?.estimatedSyllables||0)} / ${T("mục tiêu","target")} ${Number(g.metrics?.syllables||0)}`]}
    ],model:`${it.text} · ${it.pinyin} · ${it.meaning}`,next:focus});
    h.innerHTML=`<div class="ptcs-score">${mode}<div class="ptcs-score-big">${g.score}/100</div>${report}<div class="ptcs-next" style="gap:8px"><button class="ptcs-btn" id="ptcsSpeakAgain">${T("Thu lại","Record again")}</button><button class="ptcs-btn primary" id="ptcsSpeakNext">${S.index+1>=S.items.length?T("Hoàn thành Nói","Finish Speaking"):T("Thẻ tiếp theo →","Next card →")}</button></div></div>`;localizeRoot(h);
    document.getElementById("ptcsSpeakAgain").onclick=()=>{S.scores[S.index]=undefined;S.speakingItems[S.index]=undefined;if(S.reports.length)S.reports.pop();renderSpeaking()};document.getElementById("ptcsSpeakNext").onclick=()=>advanceSpeaking()
  }

  window.PandaHanCoachSkills={...base,openPhoneticsCore,openSrs,openVocabulary,openReadingWriting,openMistakeReview,openSpeaking,close,passThresholds:PASS,version:VERSION};
})();
