/* Evidence → diagnosis → dimension-specific practice. A diagnosis never writes SM-2 or mastery. */
(() => {
  "use strict";
  const DIMS=["FORM","SOUND","MEANING","USAGE","PRODUCTION"];
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
        cls=7;confidence=0.9;reason="Ba lần sai ở cùng từ và cùng năng lực.";
      }else if(e.kind==="writing"&&item.input&&item.correction?.reason){
        cls=10;dimensions=["USAGE","PRODUCTION"];confidence=0.85;reason="Câu người học có lỗi dùng từ/cấu trúc được bộ sửa xác định.";
      }else if(e.kind==="speaking"&&known&&Number(item.tone)<24){
        cls=8;confidence=0.7;reason="Đã có bằng chứng hiểu nghĩa, nhưng phần thanh điệu của bài nói thấp.";
      }else if(e.kind==="audio"&&crossRead){
        cls=9;confidence=0.75;reason="Đọc hiểu đúng từ này trước đó nhưng nghe nhận diện sai.";
      }else if(e.kind==="meaning"&&item.priorExposure===false){
        cls=6;confidence=0.85;reason="Chưa có lần ôn từ trước bài này; cần học mẫu rồi kiểm tra lại.";
      }else if(e.kind==="form"&&hanzi(item.input)&&hanzi(item.input)!==e.char){
        cls=5;confidence=0.7;reason="Hán tự nhập khác Hán tự mục tiêu; chưa khẳng định hai chữ có cấu tạo tương tự.";
      }else if(e.kind==="meaning"&&relatedMeaning(e.char,item.input)){
        cls=3;confidence=0.8;reason="Đáp án là từ/nghĩa dễ nhầm đã được biên soạn.";
      }else if(e.kind==="phonetics"||e.kind==="pinyin"){
        cls=4;confidence=0.7;reason="Đáp án âm/Pinyin không khớp âm mẫu.";
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
    return `<section style="margin-top:10px;padding:10px;border:1px solid #bfdbfe;border-radius:12px;background:#eff6ff"><b>🧭 Bài tiếp theo từ 10 lớp chẩn đoán</b><p style="font-size:11px;margin:4px 0">Đề xuất dựa trên câu trả lời đã lưu; mỗi năng lực được theo dõi riêng. Điểm SM‑2 không bị sửa bởi gợi ý.</p>${rec.map((r,i)=>{const d=m[r.target]?.[r.dimension];return `<div style="background:#fff;border-radius:9px;padding:8px;margin-top:6px;font-size:12px"><b>${ESC(r.target)} · Lớp ${r.diagnosisClass}: ${ESC(r.label)}</b> · ${r.dimension} ${d?Math.round(d.value*100)+"%":"—"} · ${Math.round(r.confidence*100)}% tin cậy<br><span>${ESC(r.reason||"Dựa trên phản hồi gần nhất.")}</span><details><summary>5 năng lực · số bằng chứng</summary>${DIMS.map(dim=>{const st=m[r.target]?.[dim];return `<div>${dim}: ${st?`${Math.round(st.value*100)}% · ${st.evidenceCount} bằng chứng · tin cậy ${Math.round(st.confidence*100)}%`:"Chưa đủ dữ liệu"}</div>`}).join("")}</details><button type="button" data-ten-layer="${i}" style="margin-top:5px;padding:5px 9px;border:1px solid #93c5fd;border-radius:7px;background:#dbeafe">${r.diagnosisClass===7?(decisions.get(recommendationId(r))?.status==="approved"?"Giáo viên đã duyệt · Mở bài luyện":decisions.get(recommendationId(r))?.status==="rejected"?"Giáo viên không đồng ý":decisions.get(recommendationId(r))?.status==="pending"?"Đang chờ giáo viên":"Gửi giáo viên xem xét"):"Mở bài luyện phù hợp"}</button></div>`}).join("")}</section>`;
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
      case 1:return {mode:"production",prompt:`Dùng “${rec.target}” viết một câu MỚI trong ngữ cảnh khác. Bài viết cần chấm rubric trước khi cập nhật PRODUCTION.`,reference:s?.example||"",dimension:"PRODUCTION"};
      case 2:if(rec.dimension==="SOUND")return {mode:"choice",audio:true,prompt:"Nghe lại từ rồi chọn đúng Pinyin, không nhìn gợi ý.",options:[py,toneDistractor(py)].filter(Boolean),answer:py,dimension:"SOUND"};
        if(rec.dimension==="FORM")return {mode:"typing",prompt:`Dựa vào Pinyin ${py} và nghĩa ${meaningText}, gõ lại Hán tự.`,answer:rec.target,dimension:"FORM"};
        return {mode:"choice",prompt:`Chọn nghĩa của “${rec.target}” trong ngữ cảnh mới.`,options:[meaningText,meaning(word(s?.wrong))||meaning(vocab().find(x=>x.char!==rec.target&&x.hsk===w?.hsk))].filter(Boolean),answer:meaningText,dimension:"MEANING"};
      case 3:return s?{mode:"choice",prompt:s.prompt,options:[s.answer,s.wrong],answer:s.answer,explain:`${s.answer} = ${s.meaning}; ${s.wrong} diễn tả ý khác trong câu này.`,dimension:"MEANING"}:null;
      case 4:{const confused=String(rec.input||"").split("·").pop().trim();return {mode:"choice",audio:true,prompt:"Nghe từ rồi phân biệt âm/Pinyin bạn đã nhầm.",options:[py,/^[a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ\s]+$/i.test(confused)&&norm(confused)!==norm(py)?confused:toneDistractor(py)].filter(Boolean),answer:py,dimension:"SOUND"}}
      case 5:return {mode:"typing",prompt:`Character Intelligence: nhìn Pinyin (${py}) và nghĩa (${meaningText}), gõ Hán tự đúng.`,answer:rec.target,explain:`Đối chiếu từng chữ: ${[...rec.target].join(" · ")}.${w?.chietu_vi?` Ghi chú học liệu: ${w.chietu_vi}`:""}`,dimension:"FORM"};
      case 6:return {mode:"choice",learn:true,prompt:`Học mẫu: ${rec.target} · ${py} · ${meaningText}. ${s?.example||String(w?.examples?.[0]?.[0]||"")} Sau đó chọn nghĩa đúng.`,options:[meaningText,s?.wrong||"Không liên quan"].filter(Boolean),answer:meaningText,dimension:"MEANING"};
      case 8:return {mode:"choice",audio:true,prompt:`Nghe “${rec.target}” và chọn Pinyin/thanh điệu đúng. Nghĩa của từ được giữ nguyên.`,options:[py,toneDistractor(py)].filter(Boolean),answer:py,dimension:"SOUND"};
      case 9:return {mode:"choice",audio:true,prompt:"Nghe từ rồi chọn Hán tự được phát âm.",options:[rec.target,soundConfusable(rec.target)].filter(Boolean),answer:rec.target,dimension:"SOUND"};
      case 10:return s?{mode:"choice",prompt:`Sửa câu “${String(rec.input||"这个问题很方便。")}”: chọn câu dùng từ phù hợp với ý “vấn đề này dễ”.`,options:["这个问题很容易。","这个问题很方便。"],answer:"这个问题很容易。",explain:s.correction,dimension:"USAGE"}: {mode:"production",prompt:`Viết lại một câu khác sử dụng “${rec.target}”. Câu mới sẽ chờ giáo viên/rubric xác minh.`,reference:"",dimension:"USAGE"};
      default:return null;
    }
  }
  function open(rec){
    if(!rec)return;
    if(rec.diagnosisClass===7){const status=decisions.get(recommendationId(rec))?.status;if(status==="approved"){const cls=rec.dimension==="FORM"?5:rec.dimension==="SOUND"?8:rec.dimension==="USAGE"?10:SCENARIOS[rec.target]?3:6;open({...rec,diagnosisClass:cls});return}if(status==="pending"||status==="rejected")return;sendTeacher(rec);return}
    const q=question(rec);if(!q||q.mode==="choice"&&new Set(q.options.map(norm)).size<2){alert("Chưa có cặp đáp án đã duyệt cho từ này. Hãy chọn bài học hiện có hoặc nhờ giáo viên bổ sung học liệu.");return}
    if(q.audio&&!("speechSynthesis" in window)){alert("Thiết bị chưa phát được audio tiếng Trung; hãy dùng Listening Lab có audio trước khi làm bài chẩn đoán này.");return}
    document.getElementById("ptTenLayerOverlay")?.remove();const ov=document.createElement("div");ov.id="ptTenLayerOverlay";ov.style="position:fixed;inset:0;z-index:130000;background:#0f172acc;display:grid;place-items:center;padding:14px";
    const existing=rec.diagnosisClass===8?{type:"quest",label:"Mở Pinyin Tone Quest của ngày"}:rec.diagnosisClass===9||rec.diagnosisClass===4?{type:"listening",label:"Mở Listening Lab"}:rec.diagnosisClass===10||rec.diagnosisClass===1?{type:"reading_writing",label:"Mở Writing Coach"}:rec.diagnosisClass===6?{type:"vocab-intro",label:"Mở Vocabulary Learn Mode"}:null;
    ov.innerHTML=`<section style="background:#fff;max-width:650px;width:100%;padding:22px;border-radius:15px;color:#102a43"><button id="ptTenClose" style="float:right">✕</button><b>Lớp ${rec.diagnosisClass} · ${ESC(rec.target)} · ${q.dimension}</b><p>${ESC(q.prompt)}</p>${q.audio?'<button id="ptTenAudio" type="button">🔊 Nghe mẫu</button>':""}${q.mode==="choice"?`<div id="ptTenChoices" style="display:grid;gap:8px;margin-top:12px">${q.options.map((o,i)=>`<button type="button" data-i="${i}" style="padding:12px;text-align:left">${ESC(o)}</button>`).join("")}</div>`:`<textarea id="ptTenInput" rows="3" style="width:100%" placeholder="Nhập câu trả lời"></textarea><button id="ptTenSubmit" type="button">Nộp bài</button>`}${existing?`<p><button id="ptTenExisting" type="button">${ESC(existing.label)}</button></p>`:""}<div id="ptTenResult" aria-live="polite"></div></section>`;
    document.body.appendChild(ov);ov.querySelector("#ptTenClose").onclick=()=>ov.remove();ov.onclick=e=>{if(e.target===ov)ov.remove()};
    const audio=ov.querySelector("#ptTenAudio");if(audio)audio.onclick=()=>speak(rec.target);
    const existingBtn=ov.querySelector("#ptTenExisting");if(existingBtn)existingBtn.onclick=()=>{ov.remove();window.PandaHanMission?.startTask?.(existing.type)};
    let done=false;
    async function grade(input){if(done)return;done=true;
      const verified=q.mode!=="production",correct=verified&&norm(input)===norm(q.answer);
      const message=verified?(correct?`Đúng. ${q.explain||"Đã xác minh đáp án ở năng lực "+q.dimension+"."}`:`Chưa đúng. Đáp án: ${q.answer}. ${q.explain||"Nghe/xem lại mẫu rồi làm lại."}`):"Đã nhận câu mới. Cần rubric hoặc giáo viên kiểm tra nghĩa và ngữ pháp; chưa cập nhật mastery.";
      if(verified)await submit(rec,input,q.answer,correct,q.dimension,{responseMs:Date.now()-started});
      else await window.PanTutorAttemptHistory?.save?.({dayNumber:rec.dayNumber,taskId:"teacherDraft",scorePercent:0,passed:false,completeSet:false,total:1,items:[{target:rec.target,dimension:q.dimension,input,expected:q.reference,verified:false,status:"pending_review",sourceAttemptId:rec.attemptId}],scheduleSaved:false});
      ov.querySelector("#ptTenResult").innerHTML=`<p style="background:#eff6ff;padding:10px">${ESC(message)}</p><button id="ptTenAgain" type="button">Làm lại</button>`;
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
          line.innerHTML=`<b>${ESC(student.name)} · ${ESC(r.target)} · ${ESC(r.dimension)}</b><br>${ESC(r.reason)} · ${verified.length}/${ids.length} lần sai kiểm tra được${verified.length>=3?' <button data-decision="approved">Đồng ý</button> <button data-decision="rejected">Không đồng ý</button>':" · Chưa đủ bằng chứng để duyệt"}`;section.appendChild(line);
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
