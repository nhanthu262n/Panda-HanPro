/* Evidence → diagnosis → dimension-specific practice. A diagnosis never writes SM-2 or mastery. */
(() => {
  "use strict";
  const DIMS=["FORM","SOUND","MEANING","USAGE","PRODUCTION"];
  const DIM_NAMES={FORM:"Nhận mặt chữ",SOUND:"Nghe và nhận diện âm",MEANING:"Hiểu nghĩa",USAGE:"Dùng từ trong câu",PRODUCTION:"Tự viết câu"};
  const LABELS={1:"Đúng nhanh",2:"Đúng nhưng do dự",3:"Nhầm nghĩa gần",4:"Nhầm âm",5:"Nhầm chữ",6:"Chưa học vững",7:"Sai lặp lại",8:"Hiểu nghĩa, sai âm/thanh",9:"Đọc đúng, nghe sai",10:"Nhớ từ, dùng sai câu"};
  const ROUTES={1:"production",2:"confirm",3:"meaning_contrast",4:"sound_contrast",5:"hanzi_form",6:"learn",7:"teacher_review",8:"tone_practice",9:"listening",10:"usage_rewrite"};
  const ESC=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const hanzi=x=>(String(x||"").match(/[\u3400-\u9fff]+/u)||[])[0]||"";
  const norm=x=>String(x??"").trim().toLowerCase().replace(/[\s。！？!?，,]/g,"");
  function vocab(){try{return typeof VOCAB!=="undefined"?VOCAB:(window.VOCAB||[])}catch(_){return window.VOCAB||[]}}
  function word(char){try{return (typeof VOCAB_BY_CHAR!=="undefined"?VOCAB_BY_CHAR:window.VOCAB_BY_CHAR||{})?.[char]||vocab().find(x=>x.char===char)||null}catch(_){return null}}
  function meaning(w){return String(w?.meaning??w?.meaning_vn??w?.meaning_en??"").trim()}
  function lexicalEvidence(row,item){
    const task=row.taskId, char=String(item.char||item.word||item.target||"");
    if(task==="listening")return {char:String(item.word||hanzi(char)),dim:"SOUND",correct:item.correct===true,kind:"audio"};
    if(task==="phonetics_core")return {char:hanzi(char),dim:"SOUND",correct:item.correct===true,kind:"phonetics"};
    if(task==="speaking")return {char:String(item.word||hanzi(char)),dim:"SOUND",correct:Number(item.score)>=75,kind:"speaking"};
    if(task==="vocab-intro")return {char,dim:"MEANING",correct:item.correct===true,kind:"meaning"};
    if(task==="srs")return {char:String(item.char||item.expected||""),dim:"FORM",correct:item.correct===true,kind:"form"};
    if(task==="reading_writing"){
      const dim=item.kind==="writing"?"USAGE":item.kind==="pinyin"?"SOUND":"MEANING";
      return {char,dim,correct:Number(item.score)>=75&&!item.correction?.reason,kind:item.kind};
    }
    if(task==="remediation")return {char:String(item.target||""),dim:item.dimension,correct:item.correct===true,kind:"remediation"};
    return null;
  }
  function relatedMeaning(char,chosen){
    const pair={"方便":["容易","easy","dễ"],"容易":["方便","convenient","thuận tiện"]};
    return (pair[char]||[]).some(x=>norm(chosen).includes(norm(x)));
  }
  function diagnose(rows){
    const ordered=[...rows].sort((a,b)=>a.createdAt-b.createdAt),events=[],history=new Map();
    for(const row of ordered)for(const [index,item] of (row.items||[]).entries()){
      const e=lexicalEvidence(row,item);if(!e?.char||!DIMS.includes(e.dim))continue;
      const previous=history.get(e.char)||[],known=previous.some(p=>p.correct&&p.dimension==="MEANING");
      const sameDimension=previous.filter(p=>p.dimension===e.dim),priorWrong=sameDimension.slice(-2).filter(p=>!p.correct).length;
      const threeDistinctAttempts=new Set([...sameDimension.slice(-2),{attemptId:row.attemptId}].map(p=>p.attemptId)).size===3;
      const crossRead=previous.some(p=>p.kind==="reading"&&p.correct);
      let cls=null,confidence=0,reason="",dimensions=[e.dim];
      const measured=Number(item.responseMs);
      if(e.correct){
        if(Number.isFinite(measured)&&measured>0){
          cls=measured<=3500&&item.confidence==="certain"?1:measured>=6000||item.confidence==="unsure"?2:null;
          confidence=cls===1?0.95:cls===2?0.85:0;
        }
      }else if(priorWrong>=2&&threeDistinctAttempts&&e.kind!=="remediation"){
        cls=7;confidence=0.9;reason="Bạn đã trả lời sai từ này ba lần ở cùng một dạng bài. Hãy đổi cách luyện.";
      }else if(e.kind==="writing"&&item.input&&item.correction?.reason){
        cls=10;dimensions=["USAGE","PRODUCTION"];confidence=0.85;reason="Câu bạn viết cần sửa cách dùng từ hoặc cấu trúc câu.";
      }else if(e.kind==="speaking"&&known&&Number(item.tone)<24){
        cls=8;confidence=0.7;reason="Bạn hiểu nghĩa từ này nhưng cần luyện thanh điệu thêm.";
      }else if(e.kind==="audio"&&crossRead){
        cls=9;confidence=0.75;reason="Bạn từng đọc đúng từ này nhưng chưa nhận ra khi nghe.";
      }else if(e.kind==="meaning"&&item.priorExposure===false){
        cls=6;confidence=0.85;reason="Bạn chưa ôn từ này trước đó. Hãy xem mẫu rồi thử lại.";
      }else if(e.kind==="form"&&hanzi(item.input)&&hanzi(item.input)!==e.char){
        cls=5;confidence=0.7;reason="Chữ Hán bạn nhập khác với chữ cần viết. Hãy nhìn kỹ từng nét.";
      }else if(e.kind==="meaning"&&relatedMeaning(e.char,item.input)){
        cls=3;confidence=0.8;reason="Bạn đã chọn một từ có nghĩa dễ nhầm với đáp án đúng.";
      }else if(e.kind==="phonetics"||e.kind==="pinyin"){
        cls=4;confidence=0.7;reason="Âm bạn chọn khác âm mẫu. Hãy nghe lại và chú ý thanh điệu.";
      }
      const event={attemptId:row.attemptId,itemIndex:index,dayNumber:row.dayNumber,target:e.char,dimension:e.dim,dimensions,correct:e.correct,kind:e.kind,diagnosisClass:cls,confidence,reason,createdAt:row.createdAt,input:item.input,expected:item.expected,score:item.score};
      events.push(event);previous.push(event);history.set(e.char,previous);
    }
    return events;
  }
  function model(events){
    const out={};for(const e of events){
      const w=out[e.target]||(out[e.target]={});
      const dims=e.diagnosisClass===10?["USAGE","PRODUCTION"]:[e.dimension];
      for(const dim of dims){if(!DIMS.includes(dim))continue;
        const state=w[dim]||(w[dim]={value:0.5,evidenceCount:0,confidence:0});
        const validity=e.kind==="speaking"?0.45:e.kind==="writing"?0.35:e.kind==="remediation"?0.65:0.8;
        const weight=dim==="PRODUCTION"?0.25:0.25*validity;
        state.value=Math.round((state.value*(1-weight)+(e.correct?1:0)*weight)*1000)/1000;
        state.evidenceCount++;state.confidence=Math.round(Math.min(0.95,1-Math.pow(1-validity*0.35,state.evidenceCount))*100)/100;
      }
    }return out;
  }
  function recommendations(day,rows){
    const events=diagnose(rows).filter(e=>e.dayNumber===Number(day)&&e.diagnosisClass);
    const recent=new Map();events.forEach(e=>recent.set(`${e.target}:${e.dimension}`,e));
    return [...recent.values()].filter(e=>e.diagnosisClass!==1||e.kind==="meaning").sort((a,b)=>b.createdAt-a.createdAt).slice(0,8).map(e=>({...e,route:ROUTES[e.diagnosisClass],label:LABELS[e.diagnosisClass]}));
  }
  function quality({correct,responseMs,priorExposure,confidence}){
    if(!priorExposure&&!correct)return null; // First teach, then start SM-2.
    return correct?(confidence==="unsure"||Number.isFinite(Number(responseMs))&&responseMs>=6000?4:5):2;
  }
  function render(day){
    const rows=window.PanTutorAttemptHistory?.allRows?.()||[],rec=recommendations(day,rows),m=model(diagnose(rows));
    if(!rec.length)return "";
    return `<section style="margin-top:10px;padding:10px;border:1px solid #bfdbfe;border-radius:12px;background:#eff6ff"><b>🧭 Bài luyện phù hợp với kết quả của bạn</b><p style="font-size:12px;margin:5px 0">Đề xuất dựa trên những câu bạn đã làm. Kỹ năng chưa được kiểm tra sẽ không bị tính là yếu.</p>${rec.map((r,i)=>{const d=m[r.target]?.[r.dimension];const observed=DIMS.filter(dim=>m[r.target]?.[dim]);return `<div style="background:#fff;border-radius:9px;padding:10px;margin-top:7px;font-size:13px"><b>${ESC(r.target)} · ${ESC(r.label)}</b><br><span>${ESC(DIM_NAMES[r.dimension]||r.dimension)}: ${d?`${d.evidenceCount} lần làm bài đã ghi nhận`:"Đang chờ kết quả bài làm"}</span><br><span>${ESC(r.reason||"Dựa trên câu trả lời gần nhất.")}</span><details style="margin-top:7px"><summary>Những kỹ năng đã có bài làm</summary>${observed.map(dim=>{const st=m[r.target][dim];return `<div>${ESC(DIM_NAMES[dim])}: ${st.evidenceCount} lần làm bài · kết quả tham khảo ${Math.round(st.value*100)}%</div>`}).join("")}<small>Điểm tham khảo chỉ dựa trên bài đã làm; các kỹ năng khác chưa được kiểm tra.</small></details><button type="button" data-ten-layer="${i}" style="margin-top:8px;padding:8px 12px;border:1px solid #93c5fd;border-radius:9px;background:#dbeafe;font-weight:700">${r.diagnosisClass===7?(decisions.get(recommendationId(r))?.status==="approved"?"Giáo viên đã duyệt · Mở bài luyện":decisions.get(recommendationId(r))?.status==="rejected"?"Giáo viên không đồng ý":decisions.get(recommendationId(r))?.status==="pending"?"Đang chờ giáo viên":"Gửi giáo viên xem xét"):"Luyện thêm phần này"}</button></div>`}).join("")}</section>`;
  }
  function bind(container,day){
    const rec=recommendations(day,window.PanTutorAttemptHistory?.allRows?.()||[]);
    container.querySelectorAll("[data-ten-layer]").forEach(btn=>btn.addEventListener("click",()=>open(rec[Number(btn.dataset.tenLayer)])));
  }
  function speak(text){if(!window.speechSynthesis)return false;const utter=new SpeechSynthesisUtterance(text);utter.lang="zh-CN";speechSynthesis.speak(utter);return true}
  function toneDistractor(pinyin){
    const tones="āáǎàa ēéěèe īíǐìi ōóǒòo ūúǔùu ǖǘǚǜü".split(" ");
    for(const group of tones)for(let i=0;i<4;i++)if(String(pinyin).includes(group[i]))return String(pinyin).replace(group[i],group[(i+1)%4]);
    return "";
  }
  function toneChoices(pinyin,confused){
    const groups="āáǎàa ēéěèe īíǐìi ōóǒòo ūúǔùu ǖǘǚǜü".split(" ");
    const options=[pinyin];
    for(const group of groups){const index=[...group.slice(0,4)].findIndex(ch=>pinyin.includes(ch));if(index<0)continue;
      for(let offset=1;offset<4;offset++)options.push(pinyin.replace(group[index],group[(index+offset)%4]));break;
    }
    if(confused&&/^[a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ\s]+$/i.test(confused))options.push(confused);
    return [...new Set(options.map(x=>String(x||"").trim()).filter(Boolean))].slice(0,4);
  }
  function soundConfusable(target){
    const base=String(word(target)?.pinyin||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
    const list=vocab();
    return list.find(x=>x.char!==target&&x.char?.length===target.length&&String(x.pinyin||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")===base)?.char
      ||list.find(x=>x.char!==target&&x.char?.length===target.length&&x.hsk===word(target)?.hsk)?.char||"";
  }
  async function submit(rec,answer,expected,correct,dimension,extra={}){
    const result=await window.PanTutorAttemptHistory?.save?.({dayNumber:rec.dayNumber,taskId:"remediation",scorePercent:correct?100:0,passed:!!correct,completeSet:true,correct:correct?1:0,total:1,items:[{target:rec.target,dimension,input:answer,expected,correct,diagnosisClass:rec.diagnosisClass,sourceAttemptId:rec.attemptId,...extra}],scheduleSaved:false});
    return result;
  }
  const SCENARIOS={
    "方便":{prompt:"这个酒店离地铁站很近，交通很____。",answer:"方便",wrong:"容易",meaning:"thuận tiện",example:"这个地方交通很方便。",correction:"这个问题很容易。\n这个地方交通很方便。"},
    "容易":{prompt:"这个问题不难，很____。",answer:"容易",wrong:"方便",meaning:"dễ",example:"这个问题很容易。",correction:"这个问题很容易。\n这个地方交通很方便。"}
  };
  const decisions=new Map();
  const recommendationId=r=>`${r.dayNumber}_${r.target}_${r.dimension}`;
  async function loadDecisions(){
    const uid=window.firebase?.auth?.().currentUser?.uid,db=window.PandaHanFirebase?.firestore;if(!uid||!db)return;
    try{const snap=await db.collection("learningRecommendations").doc(uid).collection("items").limit(100).get();
      decisions.clear();snap.forEach(doc=>decisions.set(doc.id,doc.data()));
      document.querySelectorAll("[data-ai-coach-plan]").forEach(el=>window.PandaHanMission?.renderCoach?.(el.parentElement));
    }catch(e){console.warn("Teacher decision load:",e?.code||e?.message||e)}
  }
  function question(rec){
    const w=word(rec.target),s=SCENARIOS[rec.target],py=String(w?.pinyin||""),meaningText=meaning(w)||s?.meaning||"";
    switch(rec.diagnosisClass){
      case 1:return {mode:"production",prompt:`Dùng “${rec.target}” viết một câu mới trong ngữ cảnh khác. Giáo viên sẽ kiểm tra câu của bạn.`,reference:s?.example||"",dimension:"PRODUCTION"};
      case 2:if(rec.dimension==="SOUND")return {mode:"choice",audio:true,prompt:"Nghe lại từ rồi chọn đúng cách đọc, không nhìn gợi ý.",options:toneChoices(py),answer:py,dimension:"SOUND"};
        if(rec.dimension==="FORM")return {mode:"typing",prompt:`Dựa vào Pinyin ${py} và nghĩa ${meaningText}, gõ lại Hán tự.`,answer:rec.target,dimension:"FORM"};
        return {mode:"choice",prompt:`Chọn nghĩa của “${rec.target}” trong ngữ cảnh mới.`,options:[meaningText,meaning(word(s?.wrong))||meaning(vocab().find(x=>x.char!==rec.target&&x.hsk===w?.hsk))].filter(Boolean),answer:meaningText,dimension:"MEANING"};
      case 3:return s?{mode:"choice",prompt:s.prompt,options:[s.answer,s.wrong],answer:s.answer,explain:`${s.answer} = ${s.meaning}; ${s.wrong} diễn tả ý khác trong câu này.`,dimension:"MEANING"}:null;
      case 4:{const confused=String(rec.input||"").split("·").pop().trim();return {mode:"choice",audio:true,prompt:"Nghe từ rồi chọn đúng cách đọc.",options:toneChoices(py,confused),answer:py,dimension:"SOUND"}}
      case 5:return {mode:"typing",prompt:`Nhìn cách đọc (${py}) và nghĩa (${meaningText}), rồi gõ chữ Hán đúng.`,answer:rec.target,explain:`Đối chiếu từng chữ: ${[...rec.target].join(" · ")}.${w?.chietu_vi?` Ghi chú học liệu: ${w.chietu_vi}`:""}`,dimension:"FORM"};
      case 6:return {mode:"choice",learn:true,prompt:`Học mẫu: ${rec.target} · ${py} · ${meaningText}. ${s?.example||String(w?.examples?.[0]?.[0]||"")} Sau đó chọn nghĩa đúng.`,options:[meaningText,s?.wrong||"Không liên quan"].filter(Boolean),answer:meaningText,dimension:"MEANING"};
      case 8:return {mode:"choice",audio:true,prompt:`Nghe “${rec.target}” và chọn thanh điệu đúng.`,options:toneChoices(py),answer:py,dimension:"SOUND"};
      case 9:return {mode:"choice",audio:true,prompt:"Nghe từ rồi chọn Hán tự được phát âm.",options:[rec.target,soundConfusable(rec.target)].filter(Boolean),answer:rec.target,dimension:"SOUND"};
      case 10:return s?{mode:"choice",prompt:`Sửa câu “${String(rec.input||"这个问题很方便。")}”: chọn câu dùng từ phù hợp với ý “vấn đề này dễ”.`,options:["这个问题很容易。","这个问题很方便。"],answer:"这个问题很容易。",explain:s.correction,dimension:"USAGE"}: {mode:"production",prompt:`Viết lại một câu khác sử dụng “${rec.target}”. Câu mới sẽ chờ giáo viên/rubric xác minh.`,reference:"",dimension:"USAGE"};
      default:return null;
    }
  }
  function ensurePracticeStyle(){
    if(document.getElementById("ptTenPracticeStyle"))return;
    const style=document.createElement("style");style.id="ptTenPracticeStyle";
    style.textContent=`#ptTenLayerOverlay{position:fixed;inset:0;z-index:130000;background:rgba(9,23,43,.56);backdrop-filter:blur(5px);display:grid;place-items:center;padding:18px;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;color:#172033}
#ptTenLayerOverlay .ptt-panel{width:min(980px,100%);max-height:94vh;overflow:auto;background:#f7f9fc;border:1px solid #dfe6f0;border-radius:24px;box-shadow:0 30px 90px rgba(7,23,48,.28)}
#ptTenLayerOverlay .ptt-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:20px 22px;background:#fff;border-bottom:1px solid #e5ebf4}#ptTenLayerOverlay .ptt-title{font-size:23px;font-weight:900;color:#102a43}#ptTenLayerOverlay .ptt-sub{margin-top:4px;font-size:13px;color:#66758a}#ptTenLayerOverlay .ptt-close{border:1px solid #dfe6f0;background:#fff;border-radius:12px;padding:9px 12px;font-weight:800;color:#536174}
#ptTenLayerOverlay .ptt-body{padding:20px 22px 24px}#ptTenLayerOverlay .ptt-banner{padding:13px 15px;border-radius:15px;background:#eef5ff;border:1px solid #dbeafe;color:#23456f;font-size:13px;line-height:1.55;margin-bottom:15px}#ptTenLayerOverlay .ptt-progress{display:flex;align-items:center;gap:12px;margin-bottom:15px;font-size:12px;font-weight:800;color:#526173}#ptTenLayerOverlay .ptt-bar{height:8px;flex:1;background:#e6ebf2;border-radius:99px}#ptTenLayerOverlay .ptt-bar span{display:block;width:100%;height:100%;background:#2563eb;border-radius:99px}
#ptTenLayerOverlay .ptt-card{background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:22px;box-shadow:0 8px 28px rgba(16,42,67,.06)}#ptTenLayerOverlay .ptt-kicker{display:inline-block;padding:6px 9px;border-radius:99px;background:#eef5ff;color:#1d4ed8;font-size:11px;font-weight:900}#ptTenLayerOverlay .ptt-question{margin:14px 0 8px;color:#102a43;font-size:22px;font-weight:900}#ptTenLayerOverlay .ptt-help{color:#6b778c;font-size:13px;line-height:1.55}#ptTenLayerOverlay .ptt-orb{width:120px;height:120px;margin:17px auto;display:grid;place-items:center;border-radius:50%;background:linear-gradient(145deg,#dbeafe,#eff6ff);border:1px solid #bfdbfe;font-size:48px;cursor:pointer}#ptTenLayerOverlay .ptt-actions{display:flex;gap:9px;justify-content:center;flex-wrap:wrap;margin:12px 0}#ptTenLayerOverlay .ptt-primary{border:1px solid #2563eb;background:#2563eb;color:#fff;border-radius:12px;padding:10px 14px;font-weight:850;cursor:pointer}#ptTenLayerOverlay .ptt-secondary{border:1px solid #dfe6f0;background:#fff;color:#16304e;border-radius:12px;padding:10px 14px;font-weight:800;cursor:pointer}
#ptTenLayerOverlay .ptt-options{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:15px}#ptTenLayerOverlay .ptt-option{min-height:58px;text-align:left;border:1px solid #dfe6f0;background:#fff;border-radius:13px;padding:12px 13px;color:#172033;font-weight:700;cursor:pointer}#ptTenLayerOverlay .ptt-option:hover{border-color:#9fc0ff;background:#f8fbff}#ptTenLayerOverlay .ptt-option:disabled{cursor:default}#ptTenLayerOverlay .ptt-option.correct{border-color:#86efac;background:#ecfdf3;color:#166534}#ptTenLayerOverlay .ptt-option.wrong{border-color:#fecaca;background:#fff1f2;color:#b91c1c}#ptTenLayerOverlay .ptt-input{box-sizing:border-box;width:100%;min-height:100px;margin:15px 0;padding:12px;border:1px solid #dfe6f0;border-radius:12px;font:inherit}#ptTenLayerOverlay .ptt-result{margin-top:14px;padding:14px;border-radius:14px;background:#eef5ff;color:#23456f;line-height:1.6}#ptTenLayerOverlay .ptt-result:empty{display:none}
@media(max-width:680px){#ptTenLayerOverlay{padding:0;place-items:stretch}#ptTenLayerOverlay .ptt-panel{max-height:100vh;border-radius:0}#ptTenLayerOverlay .ptt-head,#ptTenLayerOverlay .ptt-body{padding:15px}#ptTenLayerOverlay .ptt-options{grid-template-columns:1fr}#ptTenLayerOverlay .ptt-title{font-size:19px}}`;
    document.head.appendChild(style);
  }
  function open(rec){
    if(!rec)return;
    if(rec.diagnosisClass===7){const status=decisions.get(recommendationId(rec))?.status;if(status==="approved"){const cls=rec.dimension==="FORM"?5:rec.dimension==="SOUND"?8:rec.dimension==="USAGE"?10:SCENARIOS[rec.target]?3:6;open({...rec,diagnosisClass:cls});return}if(status==="pending"||status==="rejected")return;sendTeacher(rec);return}
    const q=question(rec);if(!q||q.mode==="choice"&&new Set(q.options.map(norm)).size<2){alert("Chưa có cặp đáp án đã duyệt cho từ này. Hãy chọn bài học hiện có hoặc nhờ giáo viên bổ sung học liệu.");return}
    if(q.audio&&!("speechSynthesis" in window)){alert("Thiết bị chưa phát được audio tiếng Trung; hãy dùng Listening Lab có audio trước khi làm bài chẩn đoán này.");return}
    ensurePracticeStyle();document.getElementById("ptTenLayerOverlay")?.remove();
    const ov=document.createElement("div");ov.id="ptTenLayerOverlay";
    const existing=rec.diagnosisClass===8?{type:"quest",label:"Luyện thanh điệu trong bài hôm nay"}:rec.diagnosisClass===9||rec.diagnosisClass===4?{type:"listening",label:"Luyện nghe thêm"}:rec.diagnosisClass===10||rec.diagnosisClass===1?{type:"reading_writing",label:"Luyện viết câu"}:rec.diagnosisClass===6?{type:"vocab-intro",label:"Học lại từ này"}:null;
    ov.innerHTML=`<section class="ptt-panel" role="dialog" aria-modal="true" aria-label="Bài luyện bổ sung"><header class="ptt-head"><div><div class="ptt-title">${q.audio?"🎧 AI Coach · Luyện nghe":"📝 AI Coach · Luyện thêm"}</div><div class="ptt-sub">Ngày ${Number(rec.dayNumber)} · ${ESC(rec.target)} · ${ESC(DIM_NAMES[q.dimension]||q.dimension)}</div></div><button id="ptTenClose" class="ptt-close" type="button">✕ Thoát</button></header><div class="ptt-body"><div class="ptt-banner"><b>Bài luyện phù hợp:</b> ${ESC(rec.label)}. Làm câu này để kiểm tra lại phần ${ESC((DIM_NAMES[q.dimension]||q.dimension).toLowerCase())}.</div><div class="ptt-progress"><div class="ptt-bar"><span></span></div><span>1 / 1</span></div><div class="ptt-card"><span class="ptt-kicker">${q.audio?"LUYỆN NGHE · NGHE TRƯỚC":"LUYỆN TẬP · LÀM LẠI"}</span><h2 class="ptt-question">${ESC(q.prompt)}</h2>${q.audio?'<p class="ptt-help">Nghe mẫu rồi chọn một đáp án. Bạn có thể nghe lại nhiều lần.</p><button id="ptTenOrb" class="ptt-orb" type="button" aria-label="Nghe mẫu">🔊</button><div class="ptt-actions"><button id="ptTenAudio" class="ptt-primary" type="button">▶ Nghe lại audio</button></div>':""}${q.mode==="choice"?`<div id="ptTenChoices" class="ptt-options">${q.options.map((o,i)=>`<button type="button" class="ptt-option" data-i="${i}">${ESC(o)}</button>`).join("")}</div>`:`<textarea id="ptTenInput" class="ptt-input" rows="3" placeholder="Nhập câu trả lời"></textarea><div class="ptt-actions"><button id="ptTenSubmit" class="ptt-primary" type="button">Nộp bài</button></div>`}<div id="ptTenResult" class="ptt-result" aria-live="polite"></div>${existing?`<div class="ptt-actions"><button id="ptTenExisting" class="ptt-secondary" type="button">${ESC(existing.label)}</button></div>`:""}</div></div></section>`;
    document.body.appendChild(ov);ov.querySelector("#ptTenClose").onclick=()=>ov.remove();ov.onclick=e=>{if(e.target===ov)ov.remove()};
    const audio=ov.querySelector("#ptTenAudio");if(audio)audio.onclick=()=>speak(rec.target);const orb=ov.querySelector("#ptTenOrb");if(orb)orb.onclick=()=>speak(rec.target);
    const existingBtn=ov.querySelector("#ptTenExisting");if(existingBtn)existingBtn.onclick=()=>{ov.remove();window.PandaHanMission?.startTask?.(existing.type)};
    let done=false;
    async function grade(input){if(done)return;done=true;
      const verified=q.mode!=="production",correct=verified&&norm(input)===norm(q.answer);
      const message=verified?(correct?`Đúng. ${q.explain||"Bạn đã trả lời đúng phần "+(DIM_NAMES[q.dimension]||q.dimension)+"."}`:`Chưa đúng. Đáp án: ${q.answer}. ${q.explain||"Nghe/xem lại mẫu rồi làm lại."}`):"Đã nhận câu mới. Cần giáo viên kiểm tra nghĩa và ngữ pháp trước khi tính kết quả.";
      if(verified)await submit(rec,input,q.answer,correct,q.dimension,{responseMs:Date.now()-started});
      else await window.PanTutorAttemptHistory?.save?.({dayNumber:rec.dayNumber,taskId:"teacherDraft",scorePercent:0,passed:false,completeSet:false,total:1,items:[{target:rec.target,dimension:q.dimension,input,expected:q.reference,verified:false,status:"pending_review",sourceAttemptId:rec.attemptId}],scheduleSaved:false});
      ov.querySelector("#ptTenResult").innerHTML=`<p>${ESC(message)}</p><button id="ptTenAgain" class="ptt-secondary" type="button">Làm lại</button>`;
      ov.querySelectorAll("#ptTenChoices button").forEach(x=>{x.classList.add(norm(x.textContent)===norm(q.answer)?"correct":"wrong")});
      ov.querySelector("#ptTenAgain").onclick=()=>{ov.remove();open(rec)};
      ov.querySelectorAll("#ptTenChoices button,#ptTenSubmit").forEach(x=>x.disabled=true);
    }
    const started=Date.now();ov.querySelectorAll("#ptTenChoices button").forEach(btn=>btn.onclick=()=>grade(q.options[Number(btn.dataset.i)]));const submitBtn=ov.querySelector("#ptTenSubmit");if(submitBtn)submitBtn.onclick=()=>grade(ov.querySelector("#ptTenInput").value);
  }
  async function sendTeacher(rec,quiet=false){
    const uid=window.firebase?.auth?.().currentUser?.uid,db=window.PandaHanFirebase?.firestore;
    if(!uid||!db){if(!quiet)alert("Hãy đăng nhập để gửi đề xuất cho giáo viên.");return}
    const key=recommendationId(rec);
    const ref=db.collection("learningRecommendations").doc(uid).collection("items").doc(key);
    try{const snap=await ref.get();if(snap.exists){if(!quiet)alert("Đề xuất này đã được gửi. Giáo viên sẽ xem bằng chứng và quyết định.");return}
      const evidence=diagnose(window.PanTutorAttemptHistory.allRows()).filter(x=>x.target===rec.target&&x.dimension===rec.dimension&&!x.correct).slice(-3);
      if(new Set(evidence.map(x=>x.attemptId)).size<3){if(!quiet)alert("Cần đủ ba lần làm sai riêng biệt đã lưu trước khi gửi đề xuất.");return}
      await ref.set({ownerId:uid,dayNumber:rec.dayNumber,target:rec.target,dimension:rec.dimension,diagnosisClass:7,sourceAttemptIds:evidence.map(x=>x.attemptId),route:rec.dimension==="FORM"?"hanzi_form":rec.dimension==="SOUND"?"tone_practice":rec.dimension==="USAGE"?"usage_rewrite":"meaning_contrast",reason:rec.reason,status:"pending",createdAt:Date.now()});decisions.set(key,{status:"pending"});if(!quiet)alert("Đã gửi đề xuất kèm ba lần làm sai cho giáo viên.");loadDecisions()
    }catch(e){if(!quiet)alert("Chưa gửi được đề xuất: "+String(e?.message||e));else console.warn("Recommendation pending:",e?.code||e?.message||e)}
  }
  async function renderTeacher(host,students){
    const db=window.PandaHanFirebase?.firestore;if(!db||!host)return;
    const section=document.createElement("section");section.style="padding:12px;margin:12px 0;border:1px solid #bfdbfe;border-radius:12px;background:#eff6ff";section.innerHTML="<b>🧭 Đề xuất can thiệp cần giáo viên duyệt</b>";host.prepend(section);
    for(const student of students){
      try{const snap=await db.collection("learningRecommendations").doc(student.uid).collection("items").where("status","==","pending").limit(10).get();
        for(const doc of snap.docs){const r=doc.data();const line=document.createElement("div");line.style="padding:8px;background:white;margin:7px 0;border-radius:8px";
          const ids=[...new Set(r.sourceAttemptIds||[])].slice(0,10);
          const sources=await Promise.all(ids.map(id=>db.collection("learningAttempts").doc(student.uid).collection("attempts").doc(id).get()));
          const verified=sources.filter(x=>x.exists&&x.data()?.ownerId===student.uid&&(x.data()?.items||[]).some(item=>String(item.word||item.char||item.target||"").includes(r.target)&&(item.correct===false||Number.isFinite(Number(item.score))&&Number(item.score)<75||!!item.correction?.reason)));
          line.innerHTML=`<b>${ESC(student.name)} · ${ESC(r.target)} · ${ESC(DIM_NAMES[r.dimension]||r.dimension)}</b><br>${ESC(r.reason)} · ${verified.length}/${ids.length} lần sai kiểm tra được${verified.length>=3?' <button data-decision="approved">Đồng ý</button> <button data-decision="rejected">Không đồng ý</button>':" · Chưa đủ bằng chứng để duyệt"}`;section.appendChild(line);
          line.querySelectorAll("[data-decision]").forEach(btn=>btn.onclick=async()=>{try{await doc.ref.update({status:btn.dataset.decision,reviewedAt:Date.now(),reviewedBy:window.firebase.auth().currentUser.uid});line.remove()}catch(e){alert("Không lưu được quyết định: "+e.message)}})
        }
      }catch(e){console.warn("Teacher recommendations:",e?.code||e?.message||e)}
    }
  }
  window.PanTutorTenLayer={diagnose,model,recommendations,quality,render,bind,open,renderTeacher,question,loadDecisions};
  window.firebase?.auth?.().onAuthStateChanged(user=>{if(user)loadDecisions()});
  window.addEventListener("pantutor-attempt-saved",event=>{
    if(event.detail?.restored||!event.detail?.attemptId)return;
    const rows=window.PanTutorAttemptHistory?.allRows?.()||[];
    const match=recommendations(event.detail.dayNumber,rows).find(r=>r.diagnosisClass===7&&r.attemptId===event.detail.attemptId);
    if(match&&!decisions.has(recommendationId(match)))sendTeacher(match,true);
  });
})();
