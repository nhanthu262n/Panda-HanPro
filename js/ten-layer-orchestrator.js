/* Evidence → diagnosis → dimension-specific practice. A diagnosis never writes SM-2 or mastery. */
(() => {
  "use strict";
  const en=()=> (typeof LANG_MODE!=="undefined"?LANG_MODE:localStorage.getItem("pandahan_lang"))==='en';
  const tr=(vi,english)=>en()?english:vi;
  const englishNames={FORM:'Character recognition',SOUND:'Listening and sound recognition',MEANING:'Word meaning',USAGE:'Word use in sentences',PRODUCTION:'Sentence writing'};
  const DIMS=["FORM","SOUND","MEANING","USAGE","PRODUCTION"];
  const DIM_NAMES={FORM:"Nhận mặt chữ",SOUND:"Nghe và nhận diện âm",MEANING:"Hiểu nghĩa",USAGE:"Dùng từ trong câu",PRODUCTION:"Tự viết câu"};
  const ACTIONS={1:"Giữ lịch ôn hiện tại",2:"Làm câu kiểm tra không gợi ý",3:"Phân biệt hai từ trong ngữ cảnh",4:"Nghe và phân biệt thanh điệu",5:"Nhìn cấu tạo rồi viết chữ Hán",6:"Học lại mẫu trước khi kiểm tra",7:"Nhờ giáo viên chọn cách luyện",8:"Luyện thanh điệu của đúng từ này",9:"Nghe từ và chọn chữ đúng",10:"Sửa câu và tập dùng từ trong ngữ cảnh"};
  const LABELS={1:"Đúng nhanh",2:"Đúng nhưng do dự",3:"Nhầm nghĩa gần",4:"Nhầm âm",5:"Nhầm chữ",6:"Chưa học vững",7:"Sai lặp lại",8:"Hiểu nghĩa, sai âm/thanh",9:"Đọc đúng, nghe sai",10:"Nhớ từ, dùng sai câu"};
  const ROUTES={1:"production",2:"confirm",3:"meaning_contrast",4:"sound_contrast",5:"hanzi_form",6:"learn",7:"teacher_review",8:"tone_practice",9:"listening",10:"usage_rewrite"};
  const ESC=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const hanzi=x=>(String(x||"").match(/[\u3400-\u9fff]+/u)||[])[0]||"";
  const norm=x=>String(x??"").trim().toLowerCase().replace(/[\s。！？!?，,]/g,"");
  function vocab(){try{return typeof VOCAB!=="undefined"?VOCAB:(window.VOCAB||[])}catch(_){return window.VOCAB||[]}}
  function word(char){try{return (typeof VOCAB_BY_CHAR!=="undefined"?VOCAB_BY_CHAR:window.VOCAB_BY_CHAR||{})?.[char]||vocab().find(x=>x.char===char)||null}catch(_){return null}}
  function meaning(w){return String((en()?w?.meaning_en:w?.meaning)||w?.meaning_vn||w?.meaning_en||"").trim()}
  function lexicalEvidence(row,item){
    if(item.verified===false||item.hintShown===true)return null;
    const task=row.taskId, char=String(item.char||item.word||item.target||"");
    if(task==="hidden_response")return {char,dim:item.dimension,correct:item.correct===true,kind:item.dimension==="SOUND"?"phonetics":item.dimension==="USAGE"?"writing":"meaning"};
    if(task==="dictionary_quiz")return {char,dim:item.dimension||"MEANING",correct:item.correct===true,kind:item.dimension==="SOUND"?"phonetics":item.dimension==="USAGE"?"writing":"meaning"};
    if(task==="listening")return {char:String(item.word||hanzi(char)),dim:"SOUND",correct:item.correct===true,kind:"audio"};
    if(task==="phonetics_core")return {char:hanzi(char),dim:"SOUND",correct:item.correct===true,kind:"phonetics"};
    if(task==="speaking"&&item.verified!==true)return null;
    if(task==="speaking")return {char:String(item.word||hanzi(char)),dim:"SOUND",correct:Number(item.score)>=75,kind:"speaking"};
    if(task==="vocab-intro")return {char,dim:item.dimension||"MEANING",correct:item.correct===true,kind:"meaning"};
    if(task==="srs")return {char:String(item.char||item.expected||""),dim:"FORM",correct:item.correct===true,kind:"form"};
    if(task==="reading_writing"){
      const dim=item.dimension|| (item.kind==="writing"?"USAGE":item.kind==="pinyin"?"SOUND":"MEANING");
      if(item.kind==="writing"&&!(item.verified===true&&typeof item.correct==="boolean"))return null;
      return {char,dim,correct:typeof item.correct==="boolean"?item.correct:Number(item.score)===100,kind:item.kind};
    }
    if(task==="remediation")return {char:String(item.target||""),dim:item.dimension,correct:item.correct===true,kind:"remediation"};
    return null;
  }
  function errorDetails(target, dimension, rows) {
    const matches=[], seen=new Set();
    for(const raw of [...rows].sort((a,b)=>a.createdAt-b.createdAt)) {
      const row=window.PanTutorVocabularyMemory?.normalize?.([raw])?.[0]||raw;
      for(const [index,item] of (row.items||[]).entries()) {
        const id=row.attemptId+":"+index;
        const char=String(item.target||item.char||item.word||"");
        const e=lexicalEvidence(row,item);
        if(char!==target&&e?.char!==target||seen.has(id))continue;
        const dim=item.dimension||e?.dim;
        if(dim!==dimension||item.verified===false||item.hintShown||typeof item.correct!=="boolean")continue;
        seen.add(id);matches.push({ ...item, at:row.createdAt, day:row.dayNumber });
      }
    }
    const errors=matches.filter(x=>!x.correct), latest=matches.at(-1), w=word(target);
    const item=errors.at(-1);
    if(en()){
      if(!item)return `<div class="pm-error-analysis"><p>${latest?.correct?'Your latest checked answer was correct. Review again on schedule.':'Review is due. No verified error is available for a specific diagnosis.'}</p></div>`;
      const answer=String(item.input||'—'),expected=String(item.expected||target);
      let why=`You answered “${answer}”; the reference answer was “${expected}”.`;
      const next={SOUND:'Compare the initial, final and tone in these two readings; then identify the sound without looking at the text.',FORM:'Compare each character with the model, then cover it and write again.',MEANING:'Compare the two meanings and choose the intended meaning in a new example.',USAGE:'Check how the target word fits the sentence, then rewrite it while keeping your intended meaning.',PRODUCTION:'Check the sentence structure and required word, then write a new sentence.'}[dimension];
      if(dimension==='SOUND'){const base=x=>x.split('·').pop().trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'');const a=base(answer),b=base(expected);if(a===b)why+=' The base spelling matches; check the tone marks.';else{const initial=x=>x.match(/^(zh|ch|sh|[bpmfdtnlgkhjqxrzcswy])/i)?.[0]||'';if(/^[a-zü]+$/i.test(a)&&/^[a-zü]+$/i.test(b)){const ai=initial(a),bi=initial(b);if(ai!==bi)why+=` Initial: “${ai||'none'}” → “${bi||'none'}”.`;if(a.slice(ai.length)!==b.slice(bi.length))why+=` Final: “${a.slice(ai.length)}” → “${b.slice(bi.length)}”.`;}else why+=' Compare the initial, final and tone; the stored response does not isolate the cause.';}why+=' A listening error alone does not prove a pronunciation error.';}
      if(item.validationReason==='missing_required_target')why=`Your sentence “${answer}” is missing the required word “${target}”.`;
      return `<div class="pm-error-analysis">${latest?.correct?'<p class="pm-ok">Your latest answer corrected this error. Keep practising to consolidate it.</p>':''}<p><b>Focus:</b> ${ESC(why)}</p><p><b>Try next:</b> ${ESC(next)}</p></div>`;
    }
    if(!item)return `<div class="pm-error-analysis"><p>${matches.length?`Bạn đã trả lời đúng phần ${ESC(DIM_NAMES[dimension]?.toLowerCase()||"này")} của “${ESC(target)}”. Ôn theo lịch để kiểm tra lại khả năng ghi nhớ.`:"Mục này đến lịch ôn. Chưa có lỗi đã xác minh để nhận xét cụ thể."}</p></div>`;
    const answer=String(item.input||""), expected=String(item.expected||"");
    const event=diagnose(rows).filter(e=>e.target===target&&e.dimension===dimension&&!e.correct).at(-1);
    const cls=event?.diagnosisClass;
    let why="", next="";
    const py=value=>{
      const raw=String(value).split(/[·|]/).pop().trim().toLowerCase();
      if(!raw||/[\u3400-\u9fff]/.test(raw)||!/^[a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ1-5\s'’]+$/i.test(raw))return [];
      return raw.split(/[\s'’]+/).filter(Boolean).map(v=>{const n=v.normalize('NFD');const mark=[['\u0304',1],['\u0301',2],['\u030c',3],['\u0300',4]].find(([m])=>n.includes(m));const tone=Number(v.match(/[1-5]$/)?.[0]||mark?.[1]||0);const base=n.replace(/[\u0304\u0301\u030c\u0300]/g,'').replace(/[1-5]/g,'').normalize('NFC');const initial=base.match(/^(zh|ch|sh|[bpmfdtnlgkhjqxrzcswy])/i)?.[0]||'';return {text:v,base,initial,final:base.slice(initial.length),tone};});
    };
    if(dimension==='SOUND'){
      const chosen=py(answer), correct=py(expected);
      const differences=[];
      if(chosen.length&&chosen.length===correct.length)correct.forEach((right,i)=>{const wrong=chosen[i],pos=correct.length>1?`Âm tiết ${i+1}: `:'';
        if(wrong.initial!==right.initial)differences.push(`${pos}bạn nhầm âm đầu “${wrong.initial||'không có'}” với “${right.initial||'không có'}”`);
        if(wrong.final!==right.final)differences.push(`${pos}bạn chọn phần vần “${wrong.final}” thay vì “${right.final}”`);
        if(wrong.tone&&right.tone&&wrong.tone!==right.tone)differences.push(`${pos}bạn chọn thanh ${wrong.tone} thay vì thanh ${right.tone}`);
      });
      why=differences.length?`${differences.join('; ')}. Cặp cần phân biệt là “${answer}” và “${expected}”.`:`Bạn đã chọn “${answer||'đáp án chưa được lưu'}” thay cho “${expected||target}” trong bài nhận diện âm. Dữ liệu chưa chỉ rõ lỗi nằm ở âm đầu, vần hay thanh điệu.`;
      if(chosen.length===1&&correct.length===1&&chosen[0].initial===correct[0].initial&&chosen[0].final!==correct[0].final){why+=` Hai cách đọc cùng âm đầu “${correct[0].initial}”, nhưng khác phần vần; không nên chỉ luyện thanh điệu.`;}
      next=`Nghe luân phiên “${expected||target}” và “${answer||'âm đã nhầm'}”, tập trung vào phần khác nhau vừa nêu, rồi nghe chọn lại khi không nhìn chữ.`;
      if(cls===8)why+=' Bài nghĩa trước đó có câu đúng; phần cần sửa ở đây là âm/thanh, không phải học lại toàn bộ nghĩa.';
      if(cls===9)why+=' Bạn đã có câu đọc đúng; khó khăn đang xuất hiện khi chuyển sang nghe.';
    }else if(dimension==='MEANING'){
      why=`Với “${target}”, bạn trả lời “${answer||'chưa lưu'}” trong khi bài yêu cầu “${expected||'đáp án chưa lưu'}”.`;
      if(cls===3)why+=' Đây là cặp nghĩa dễ nhầm: cần phân biệt ngữ cảnh dùng, không chỉ học thuộc bản dịch.';
      next=`Đối chiếu nghĩa “${expected||meaning(w)}” với đáp án bạn chọn, tìm một ví dụ cho mỗi nghĩa rồi làm câu chọn nghĩa trong ngữ cảnh mới.`;
    }else if(dimension==='FORM'){
      why=`Bạn nhận diện/viết “${answer||'chưa lưu'}” thay vì “${expected||target}”.`;
      const aa=Array.from(answer),bb=Array.from(expected||target);const diff=bb.map((c,i)=>aa[i]!==c?`vị trí ${i+1}: “${aa[i]||'thiếu chữ'}” → “${c}”`:'').filter(Boolean);if(diff.length)why+=' Chỗ cần đối chiếu: '+diff.join('; ')+'.';
      next='So sánh các vị trí khác nhau với chữ mẫu, che mẫu rồi chọn hoặc viết lại. Không suy ra lỗi hiểu nghĩa từ lỗi mặt chữ này.';
    }else{
      why=item.validationReason==='missing_required_target'?`Câu “${answer}” chưa chứa từ bắt buộc “${target}”.`:String(item.correction?.reason||`Câu “${answer}” chưa khớp yêu cầu của bài dùng từ/cấu trúc.`);
      if(expected)why+=` Đáp án tham chiếu của bài: “${expected}”.`;
      next=`Sửa đúng phần vừa nêu trong câu của bạn, giữ ý định diễn đạt, rồi viết một câu mới với “${target}”.`;
    }
    if(cls===6){why+=' Bạn chưa có bước học ban đầu được ghi nhận.';next='Xem nghĩa và nghe mẫu trước, sau đó làm một câu kiểm tra ngắn.';}
    if(cls===7){why+=' Lỗi ở kỹ năng này đã lặp lại qua ba lượt làm riêng.';next+=' Nếu vẫn nhầm, chuyển sang cách luyện khác và nhờ giáo viên kiểm tra.';}
    const progress=latest?.correct?'Bạn đã sửa đúng ở lượt gần nhất. Phần dưới là điểm từng nhầm cần củng cố, không phải lỗi mới.':'';
    return `<div class="pm-error-analysis" style="line-height:1.65;overflow-wrap:anywhere">${progress?`<p style="color:#15803d">${ESC(progress)}</p>`:''}<p><b>Điểm cần chú ý:</b> ${ESC(why)}</p><p><b>Luyện thế nào:</b> ${ESC(next)}</p></div>`;
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
          cls=measured<3000&&item.confidence==="certain"?1:measured>=3000||item.confidence==="unsure"?2:null;
          confidence=cls===1?0.95:cls===2?0.85:0;
        }
      }else if(priorWrong>=2&&threeDistinctAttempts&&e.kind!=="remediation"){
        cls=7;confidence=0.9;reason="Bạn đã trả lời sai từ này ba lần ở cùng một kỹ năng. Hãy đổi cách luyện.";
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
      if(!e.correct&&!cls){cls=e.dim==='SOUND'?4:e.dim==='FORM'?5:['USAGE','PRODUCTION'].includes(e.dim)?10:2;confidence=.65;reason="Câu trả lời chưa đạt. Hãy luyện lại đúng kỹ năng của từ này.";}
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
  function recommendations(day,rows,allEvents){
    const all=allEvents||diagnose(rows),events=all.filter(e=>e.dayNumber===Number(day));
    const recent=new Map();events.filter(e=>e.kind!=="remediation").forEach(e=>recent.set(`${e.target}:${e.dimension}`,e));
    const byWord=model(all);
    return [...recent.values()].filter(e=>e.diagnosisClass&&e.diagnosisClass!==1).filter(e=>{
      const after=events.filter(x=>x.target===e.target&&x.dimension===e.dimension&&x.kind==="remediation"&&x.createdAt>=e.createdAt);
      return after.length<3||!after.slice(-3).every(x=>x.correct);
    }).map(e=>{
      const same=all.filter(x=>x.target===e.target&&x.dimension===e.dimension),source=same.slice(-8);
      const related=all.filter(x=>x.target===e.target&&x.dimension==="MEANING");
      const before=same.filter(x=>x.kind!=="remediation"),after=same.filter(x=>x.kind==="remediation");
      const confidence=Math.min(.95,Math.round((e.confidence*.55+Math.min(1,source.length/5)*.45)*100)/100);
      const weakness=1-(byWord[e.target]?.[e.dimension]?.value??.5),relevance=e.dayNumber===Number(day)?1:.6;
      const reviewAt=Number(window.PandaHanAdaptiveLearning?.getStatFor?.(e.target)?.nextReview||0);
      const due=reviewAt>0&&reviewAt<=Date.now();
      const urgency=e.diagnosisClass===7?1.3:due?1.2:before.slice(-3).filter(x=>!x.correct).length>=2?1.15:1;
      return {...e,id:recommendationId(e),route:ROUTES[e.diagnosisClass],label:e.correct===false&&e.diagnosisClass===2?"Chưa hiểu đúng nghĩa":LABELS[e.diagnosisClass],action:ACTIONS[e.diagnosisClass],confidence,due,priority:Math.round(weakness*confidence*relevance*urgency*1000)/1000,evidence:{correct:source.filter(x=>x.correct).length,total:source.length,attemptIds:[...new Set(source.map(x=>x.attemptId))],meaningCorrect:related.filter(x=>x.correct).length,meaningTotal:related.length,lastAt:e.createdAt},before:{correct:before.filter(x=>x.correct).length,total:before.length},after:{correct:after.filter(x=>x.correct).length,total:after.length},dimensions:byWord[e.target]||{}};
    }).sort((a,b)=>b.priority-a.priority||b.createdAt-a.createdAt).slice(0,8);
  }
  function quality({correct,responseMs,priorExposure,confidence}){
    if(!priorExposure&&!correct)return null; // First teach, then start SM-2.
    return correct?(confidence==="unsure"||Number.isFinite(Number(responseMs))&&responseMs>=6000?4:5):2;
  }
  const choiceFor=(rec,rows)=>rows.filter(r=>r.taskId==="recommendation_choice"&&r.items?.[0]?.recommendationId===rec.id).sort((a,b)=>b.createdAt-a.createdAt)[0]?.items?.[0]?.choice||"pending";
  async function choose(rec,choice){
    await window.PanTutorAttemptHistory?.save?.({dayNumber:rec.dayNumber,taskId:"recommendation_choice",scorePercent:0,passed:false,completeSet:false,total:0,correct:0,items:[{recommendationId:rec.id,target:rec.target,dimension:rec.dimension,sourceAttemptId:rec.attemptId,choice}],scheduleSaved:false});
    if(choice==="practice")open(rec);
    else if(choice==="explain")explain(rec);
    else window.PandaHanMission?.renderCoach?.(document.querySelector("[data-ai-coach-plan]")?.parentElement);
  }
  function render(day){
    const rows=window.PanTutorAttemptHistory?.allRows?.()||[],rec=recommendations(day,rows);
    if(!rec.length)return "";
    const cards=rec.map((r,i)=>{
      const status=choiceFor(r,rows),review=decisions.get(r.id),observed=DIMS.filter(dim=>r.dimensions[dim]);
      const evidence=`${r.evidence.correct}/${r.evidence.total} lần đúng ở phần ${DIM_NAMES[r.dimension].toLowerCase()}${r.evidence.meaningTotal?` · Hiểu nghĩa đúng ${r.evidence.meaningCorrect}/${r.evidence.meaningTotal}`:""}`;
      const progress=r.after.total?`Sau khi luyện: ${r.after.correct}/${r.after.total} câu đúng`:"Chưa làm bài luyện bổ sung";
      return `<article style="background:#fff;border-radius:12px;padding:12px;margin-top:9px;font-size:15px"><b>${ESC(r.target)} · ${ESC(r.label)}</b><p style="margin:6px 0">${ESC(r.reason||"Dựa trên câu trả lời gần nhất.")}</p><div>${ESC(evidence)} · ${ESC(progress)}</div><div style="margin:6px 0;color:#1d4ed8"><b>Đề xuất:</b> ${ESC(review?.teacherAction||r.action)}</div>${review?.teacherReason?`<p><b>Giáo viên:</b> ${ESC(review.teacherReason)} (${review.status==="approved"?"đã duyệt":"không đồng ý"})</p>`:""}<small>${status==="skip"?"Đã để sau · bạn có thể luyện lại bất cứ lúc nào":status==="practice"?"Bạn đã chọn luyện bài này":status==="explain"?"Bạn đã xem giải thích":status==="alternative"?"Bạn đã chọn bài khác":"Bạn quyết định bước tiếp theo"}</small><details style="margin:7px 0"><summary>Xem kết quả từng kỹ năng</summary>${observed.map(dim=>{const st=r.dimensions[dim];return `<div>${ESC(DIM_NAMES[dim])}: ${st.evidenceCount} bài · kết quả tham khảo ${Math.round(st.value*100)}%</div>`}).join("")}<small>Kỹ năng chưa có bài làm chưa được đánh giá.</small></details><div style="display:flex;gap:7px;flex-wrap:wrap"><button type="button" data-ten-choice="practice" data-ten-index="${i}" ${r.diagnosisClass===7&&["pending","rejected"].includes(review?.status)?"disabled":""}>${r.diagnosisClass===7?(review?.status==="approved"?"Luyện ngay":review?.status==="pending"?"Đang chờ giáo viên":review?.status==="rejected"?"Giáo viên không duyệt":"Gửi giáo viên xem xét"):"Luyện ngay"}</button><button type="button" data-ten-choice="explain" data-ten-index="${i}">Xem giải thích</button><button type="button" data-ten-choice="skip" data-ten-index="${i}">${tr('Để sau','Close')}</button><button type="button" data-ten-choice="alternative" data-ten-index="${i}">Chọn bài khác</button>${r.confidence<=.55&&r.diagnosisClass!==7?`<button type="button" data-ten-choice="ask_teacher" data-ten-index="${i}">Nhờ giáo viên xem giúp</button>`:""}</div></article>`;
    }).join("");
    const latest=rec[0],reflection=rows.filter(r=>r.taskId==="learner_reflection"&&r.dayNumber===Number(day)).at(-1);
    const meaning=latest.evidence.meaningTotal?`Hiểu nghĩa đúng ${latest.evidence.meaningCorrect}/${latest.evidence.meaningTotal}. `:"";
    const mirror=`${meaning}${DIM_NAMES[latest.dimension]}: ${latest.evidence.correct}/${latest.evidence.total} câu đúng. ${latest.after.total?`Sau khi luyện thêm, bạn đúng ${latest.after.correct}/${latest.after.total} câu.`:"Bạn có thể thử bài bổ sung rồi xem kết quả thay đổi."}`;
    return `<section style="margin-top:10px;padding:12px;border:1px solid #bfdbfe;border-radius:12px;background:#eff6ff"><b>🧭 Bài nên luyện tiếp</b><p style="font-size:14px;margin:5px 0">Gợi ý dựa trên bài làm đã lưu; bạn chọn cách học tiếp.</p>${cards}<div style="background:#fff;padding:12px;border-radius:12px;margin-top:9px;font-size:15px"><b>🪞 Nhìn lại buổi học</b><p><b>${ESC(latest.target)}:</b> ${ESC(mirror)} Đề xuất: ${ESC(latest.action.toLowerCase())}.</p><label for="ptTenReflection">Bạn nhầm vì nghĩa của từ, âm đọc, hay cách dùng trong câu?</label><textarea id="ptTenReflection" rows="2" style="box-sizing:border-box;width:100%;padding:9px;border:1px solid #cbd5e1;border-radius:8px" placeholder="Viết điều bạn muốn luyện tiếp">${ESC(reflection?.items?.[0]?.input||"")}</textarea><button type="button" data-ten-reflection="${Number(day)}">Lưu suy nghĩ của tôi</button><small id="ptTenReflectionStatus" role="status"></small></div></section>`;
  }
  function bind(container,day){
    const rec=recommendations(day,window.PanTutorAttemptHistory?.allRows?.()||[]);
    container.querySelectorAll("[data-ten-choice]").forEach(btn=>btn.addEventListener("click",()=>{
      const r=rec[Number(btn.dataset.tenIndex)],action=btn.dataset.tenChoice;
      if(action==="ask_teacher"){sendTeacher(r).then(()=>window.PandaHanMission?.renderCoach?.(container)).catch(e=>alert(e.message));return}
      if(action==="alternative"){
        const other=rec.find(x=>x.id!==r.id);
        choose(r,action).then(()=>other?open(other):window.PandaHanMission?.startTask?.(r.dimension==="SOUND"?"listening":r.dimension==="FORM"?"vocab-intro":"reading_writing")).catch(e=>alert("Chưa lưu được lựa chọn: "+e.message));
      }else choose(r,action).catch(e=>alert("Chưa lưu được lựa chọn: "+e.message));
    }));
    container.querySelector("[data-ten-reflection]")?.addEventListener("click",async()=>{
      const input=container.querySelector("#ptTenReflection")?.value?.trim();if(!input)return;
      try{await window.PanTutorAttemptHistory?.save?.({dayNumber:Number(day),taskId:"learner_reflection",scorePercent:0,passed:false,completeSet:false,total:0,items:[{input}],scheduleSaved:false});
        const label=container.querySelector("#ptTenReflectionStatus");if(label)label.textContent=" Đã lưu vào lịch sử của bạn.";
      }catch(e){alert("Chưa lưu được suy nghĩ của bạn: "+e.message)}
    });
  }
  function explain(rec){
    const w=word(rec.target),s=SCENARIOS[rec.target];ensurePracticeStyle();document.getElementById("ptTenLayerOverlay")?.remove();
    const ov=document.createElement("div");ov.id="ptTenLayerOverlay";
    const details=rec.dimension==="FORM"?String(w?.chietu_vi||"Nhìn từng phần của chữ và đối chiếu với chữ mẫu."):rec.dimension==="SOUND"?`Nghe ${rec.target} (${w?.pinyin||""}) nhiều lần. Chú ý thanh điệu rồi chọn âm nghe được.`:s?.correction||String(w?.examples?.[0]?.[0]||"Xem ví dụ của từ trước khi làm bài.");
    ov.innerHTML=`<section class="ptt-panel" role="dialog" aria-modal="true"><header class="ptt-head"><b class="ptt-title">${tr("Giải thích","Guidance")} · ${ESC(rec.target)}</b><button class="ptt-close" type="button">${tr('✕ Thoát','✕ Close')}</button></header><div class="ptt-body"><div class="ptt-card">${errorDetails(rec.target,rec.dimension,window.PanTutorAttemptHistory?.allRows?.()||[])}<p style="white-space:pre-line">${ESC(en()?(rec.dimension==="SOUND"?"Listen to the model, compare the initial, final and tone, then try a new listening task.":rec.dimension==="FORM"?(w?.chietu_en||"Compare the components with the model, then cover it and write again."):"Read a reference example, check the word in context, then try a new task."):details)}</p><div class="ptt-actions"><button class="ptt-primary" type="button" data-next="practice">${tr('Luyện ngay','Practise now')}</button><button class="ptt-secondary" type="button" data-next="later">${tr('Để sau','Close')}</button></div></div></div></section>`;
    document.body.appendChild(ov);ov.querySelector(".ptt-close").onclick=()=>ov.remove();ov.onclick=e=>{if(e.target===ov)ov.remove()};
    ov.querySelector('[data-next="practice"]').onclick=()=>{ov.remove();choose(rec,"practice").catch(e=>alert(e.message))};
    ov.querySelector('[data-next="later"]').onclick=()=>ov.remove();
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
    if(confused&&/^[a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ\s]+$/i.test(confused))options.push(confused);
    for(const group of groups){const index=[...group.slice(0,4)].findIndex(ch=>pinyin.includes(ch));if(index<0)continue;
      for(let offset=1;offset<4;offset++)options.push(pinyin.replace(group[index],group[(index+offset)%4]));break;
    }
    return [...new Set(options.map(x=>String(x||"").trim()).filter(Boolean))].slice(0,4);
  }
  function soundConfusable(target){
    const base=String(word(target)?.pinyin||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
    const list=vocab();
    return list.find(x=>x.char!==target&&x.char?.length===target.length&&String(x.pinyin||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")===base)?.char
      ||list.find(x=>x.char!==target&&x.char?.length===target.length&&x.hsk===word(target)?.hsk)?.char
      ||list.find(x=>x.char!==target&&x.char?.length===target.length)?.char||"";
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
        return {mode:"choice",prompt:`Chọn nghĩa của “${rec.target}”.`,options:[meaningText,meaning(word(s?.wrong))||meaning(vocab().find(x=>x.char!==rec.target&&x.hsk===w?.hsk))].filter(Boolean),answer:meaningText,dimension:"MEANING"};
      case 3:return s?{mode:"choice",prompt:s.prompt,options:[s.answer,s.wrong],answer:s.answer,explain:`${s.answer} = ${s.meaning}; ${s.wrong} diễn tả ý khác trong câu này.`,dimension:"MEANING"}:null;
      case 4:{const confused=String(rec.input||"").split("·").pop().trim();return {mode:"choice",audio:true,prompt:"Nghe từ rồi chọn đúng cách đọc.",options:toneChoices(py,confused),answer:py,dimension:"SOUND"}}
      case 5:return {mode:"typing",prompt:`Nhìn cách đọc (${py}) và nghĩa (${meaningText}), rồi gõ chữ Hán đúng.`,answer:rec.target,explain:`Đối chiếu từng chữ: ${[...rec.target].join(" · ")}.${w?.chietu_vi?` Ghi chú học liệu: ${w.chietu_vi}`:""}`,dimension:"FORM"};
      case 6:return {mode:"choice",learn:true,prompt:`Chọn nghĩa của “${rec.target}” mà không xem mẫu.`,options:[...new Set([meaningText,...vocab().filter(x=>x.char!==rec.target).map(meaning).filter(x=>x&&norm(x)!==norm(meaningText))])].slice(0,4),answer:meaningText,dimension:"MEANING"};
      case 8:return {mode:"choice",audio:true,prompt:"Nghe mẫu và chọn thanh điệu đúng.",options:toneChoices(py),answer:py,dimension:"SOUND"};
      case 9:return {mode:"choice",audio:true,prompt:"Nghe từ rồi chọn Hán tự được phát âm.",options:[rec.target,soundConfusable(rec.target)].filter(Boolean),answer:rec.target,dimension:"SOUND"};
      case 10:return s?{mode:"choice",prompt:`Sửa câu “${String(rec.input||"这个问题很方便。")}”: chọn câu dùng từ phù hợp với ý “vấn đề này dễ”.`,options:["这个问题很容易。","这个问题很方便。"],answer:"这个问题很容易。",explain:s.correction,dimension:"USAGE"}: {mode:"production",prompt:`Viết lại một câu khác sử dụng “${rec.target}”. Câu mới sẽ chờ giáo viên/rubric xác minh.`,reference:"",dimension:"USAGE"};
      default:return null;
    }
  }
  function questionId(q){return JSON.stringify([q.dimension,q.mode,q.audioText||'',q.sourcePrompt||q.prompt,'']);}
  function seenKey(rec){const uid=window.firebase?.auth?.().currentUser?.uid|| (typeof STORE_KEY!=='undefined'?STORE_KEY:'guest');return 'pt-review-questions-v81:'+uid+':'+rec.target+':'+rec.dimension;}
  function seenQuestions(rec){let local=[];try{local=JSON.parse(localStorage.getItem(seenKey(rec))||'[]')}catch(_){}const seen=new Set(local);for(const row of window.PanTutorAttemptHistory?.allRows?.()||[])for(const i of row.items||[])if(i.target===rec.target&&i.dimension===rec.dimension&&i.questionId)seen.add(i.questionId);return seen;}
  function rememberQuestion(rec,q){const seen=seenQuestions(rec);seen.add(questionId(q));try{localStorage.setItem(seenKey(rec),JSON.stringify([...seen]))}catch(_){} }
  function practiceQuestions(rec){
    const w=word(rec.target),py=w?.pinyin||'',m=meaning(w),bank=[],dim=rec.dimension;
    const add=q=>{q.sourcePrompt=q.sourcePrompt||q.prompt;bank.push(q)};
    const examples=(w?.examples||[]).map(e=>Array.isArray(e)?e[0]:e?.zh||e?.sentence||'').filter(e=>typeof e==='string'&&e.includes(rec.target));
    const others=vocab().filter(x=>x.char!==rec.target&&x.char&&x.pinyin);
    const peer=word(soundConfusable(rec.target))||others[0];
    if(dim==='SOUND'&&py){
      add({mode:'choice',audio:true,audioText:rec.target,prompt:tr('Nghe và chọn Pinyin đúng.','Listen and choose the correct Pinyin.'),sourcePrompt:'sound-pinyin',options:toneChoices(py,String(rec.input||'').split('·').pop().trim()),answer:py,dimension:dim});
      if(peer)add({mode:'choice',audio:true,audioText:rec.target,prompt:tr('Nghe và chọn từ vừa được đọc.','Listen and select the word you heard.'),sourcePrompt:'sound-character',options:[rec.target,peer.char],answer:rec.target,dimension:dim});
      examples.forEach(sentence=>{if(peer&&!sentence.includes(peer.char))add({mode:'choice',audio:true,audioText:sentence,prompt:tr('Từ nào có trong câu vừa nghe?','Which word occurs in the sentence you heard?'),sourcePrompt:'sound-context:'+sentence,options:[rec.target,peer.char],answer:rec.target,dimension:dim})});
      if(peer)for(const position of [0,1])add({mode:'choice',audio:true,audioText:position?peer.char+'。'+rec.target:rec.target+'。'+peer.char,prompt:position?tr('Chọn cách đọc của từ thứ hai.','Choose the Pinyin of the second word.'):tr('Chọn cách đọc của từ thứ nhất.','Choose the Pinyin of the first word.'),sourcePrompt:'sound-sequence:'+position,options:[py,peer.pinyin],answer:py,dimension:dim});
    }else if(dim==='MEANING'){
      const options=[m,...others.map(meaning).filter(x=>x&&x!==m)].slice(0,4);
      add({mode:'choice',prompt:tr('Chọn nghĩa của ','Choose the meaning of ')+rec.target,sourcePrompt:'meaning-word',options,answer:m,dimension:dim});
      examples.forEach(sentence=>add({mode:'choice',prompt:tr('Trong câu sau, từ “','In this sentence, what does “')+rec.target+tr('” có nghĩa gì? ','” mean? ')+sentence,sourcePrompt:'meaning-context:'+sentence,options:[...options],answer:m,dimension:dim}));
    }else if(dim==='FORM'){
      add({mode:'typing',prompt:tr('Gõ chữ Hán theo Pinyin: ','Type the Chinese word for: ')+py+' · '+m,sourcePrompt:'form-dictation',answer:rec.target,dimension:dim});
      examples.forEach(sentence=>add({mode:'typing',prompt:tr('Điền chữ Hán còn thiếu: ','Fill in the missing Chinese word: ')+sentence.replaceAll(rec.target,'____')+' ('+py+')',sourcePrompt:'form-context:'+sentence,answer:rec.target,dimension:dim}));
    }else{
      const contexts=[['kể một trải nghiệm của bạn','describe a personal experience'],['hỏi một người bạn một câu hỏi','ask a friend a question'],['viết một lời nhắn ngắn','write a short message'],['nêu một dự định ngày mai','describe a plan for tomorrow']];
      contexts.forEach(([vi,eng],i)=>add({mode:'production',prompt:tr('Dùng “','Use “')+rec.target+tr('” để '+vi+'.','” to '+eng+'.'),sourcePrompt:'production-context:'+i,reference:'',dimension:dim}));
      examples.forEach(sentence=>add({mode:'typing',prompt:tr('Điền từ phù hợp với nghĩa ','Fill the blank using the word meaning ')+m+': '+sentence.replaceAll(rec.target,'____'),sourcePrompt:'usage-context:'+sentence,answer:rec.target,dimension:dim}));
    }
    const seen=seenQuestions(rec),unique=new Set();const prior=(window.PanTutorAttemptHistory?.allRows?.()||[]).flatMap(r=>r.items||[]).filter(i=>(i.target||i.char||i.word)===rec.target&&(i.dimension===dim||dim==='SOUND'&&i.kind==='pinyin'));return bank.sort((a,b)=>(a.mode==='production')-(b.mode==='production')).filter(q=>{const id=questionId(q);if(seen.has(id)||unique.has(id)||prior.some(i=>i.prompt===q.prompt)||!q.sourcePrompt.includes('context:')&&q.sourcePrompt.startsWith('sound-')&&!q.sourcePrompt.startsWith('sound-sequence')&&prior.some(i=>!i.questionId&&i.verified!==false)||q.mode==='choice'&&new Set(q.options).size<2)return false;unique.add(id);return true}).slice(0,1);
  }
  function ensurePracticeStyle(){
    if(document.getElementById("ptTenPracticeStyle"))return;
    const style=document.createElement("style");style.id="ptTenPracticeStyle";
    style.textContent=`#ptTenLayerOverlay{position:fixed;inset:0;z-index:130000;background:rgba(9,23,43,.56);backdrop-filter:blur(5px);display:grid;place-items:center;padding:18px;font-family:inherit;color:#172033}
#ptTenLayerOverlay .ptt-panel{width:min(980px,100%);max-height:94vh;overflow:auto;background:#f7f9fc;border:1px solid #dfe6f0;border-radius:24px;box-shadow:0 30px 90px rgba(7,23,48,.28)}
#ptTenLayerOverlay .ptt-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:20px 22px;background:#fff;border-bottom:1px solid #e5ebf4}#ptTenLayerOverlay .ptt-title{font-size:23px;font-weight:900;color:#102a43}#ptTenLayerOverlay .ptt-sub{margin-top:4px;font-size:15px;color:#66758a}#ptTenLayerOverlay .ptt-close{border:1px solid #dfe6f0;background:#fff;border-radius:12px;padding:9px 12px;font-weight:800;color:#536174}
#ptTenLayerOverlay .ptt-body{padding:20px 22px 24px}#ptTenLayerOverlay .ptt-banner{padding:13px 15px;border-radius:15px;background:#eef5ff;border:1px solid #dbeafe;color:#23456f;font-size:15px;line-height:1.55;margin-bottom:15px}#ptTenLayerOverlay .ptt-progress{display:flex;align-items:center;gap:12px;margin-bottom:15px;font-size:14px;font-weight:800;color:#526173}#ptTenLayerOverlay .ptt-bar{height:8px;flex:1;background:#e6ebf2;border-radius:99px}#ptTenLayerOverlay .ptt-bar span{display:block;width:100%;height:100%;background:#2563eb;border-radius:99px}
#ptTenLayerOverlay .ptt-card{background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:22px;box-shadow:0 8px 28px rgba(16,42,67,.06)}#ptTenLayerOverlay .ptt-kicker{display:inline-block;padding:6px 9px;border-radius:99px;background:#eef5ff;color:#1d4ed8;font-size:14px;font-weight:900}#ptTenLayerOverlay .ptt-question{margin:14px 0 8px;color:#102a43;font-size:24px;font-weight:900}#ptTenLayerOverlay .ptt-help{color:#6b778c;font-size:15px;line-height:1.55}#ptTenLayerOverlay .ptt-orb{width:120px;height:120px;margin:17px auto;display:grid;place-items:center;border-radius:50%;background:linear-gradient(145deg,#dbeafe,#eff6ff);border:1px solid #bfdbfe;font-size:48px;cursor:pointer}#ptTenLayerOverlay .ptt-actions{display:flex;gap:9px;justify-content:center;flex-wrap:wrap;margin:12px 0}#ptTenLayerOverlay .ptt-primary{border:1px solid #2563eb;background:#2563eb;color:#fff;border-radius:12px;padding:10px 14px;font-weight:850;cursor:pointer}#ptTenLayerOverlay .ptt-secondary{border:1px solid #dfe6f0;background:#fff;color:#16304e;border-radius:12px;padding:10px 14px;font-weight:800;cursor:pointer}
#ptTenLayerOverlay .ptt-options{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:15px}#ptTenLayerOverlay .ptt-option{min-height:58px;text-align:left;border:1px solid #dfe6f0;background:#fff;border-radius:13px;padding:12px 13px;color:#172033;font-weight:700;cursor:pointer}#ptTenLayerOverlay .ptt-option:hover{border-color:#9fc0ff;background:#f8fbff}#ptTenLayerOverlay .ptt-option:disabled{cursor:default}#ptTenLayerOverlay .ptt-option.correct{border-color:#86efac;background:#ecfdf3;color:#166534}#ptTenLayerOverlay .ptt-option.wrong{border-color:#fecaca;background:#fff1f2;color:#b91c1c}#ptTenLayerOverlay .ptt-input{box-sizing:border-box;width:100%;min-height:100px;margin:15px 0;padding:12px;border:1px solid #dfe6f0;border-radius:12px;font:inherit}#ptTenLayerOverlay .ptt-result{margin-top:14px;padding:14px;border-radius:14px;background:#eef5ff;color:#23456f;line-height:1.6}#ptTenLayerOverlay .ptt-result:empty{display:none}
@media(max-width:680px){#ptTenLayerOverlay{padding:0;place-items:stretch}#ptTenLayerOverlay .ptt-panel{max-height:100vh;border-radius:0}#ptTenLayerOverlay .ptt-head,#ptTenLayerOverlay .ptt-body{padding:15px}#ptTenLayerOverlay .ptt-options{grid-template-columns:1fr}#ptTenLayerOverlay .ptt-title{font-size:21px}}`;
    document.head.appendChild(style);
  }
  function open(rec,step=0){
    if(!rec)return;
    const reviewed=decisions.get(recommendationId(rec));
    if(rec.diagnosisClass!==7&&reviewed?.status==="approved"&&reviewed.teacherRoute&&!rec._teacherApplied){
      const cls=({hanzi_form:5,tone_practice:8,listening:9,meaning_contrast:3,learn:6,usage_rewrite:10})[reviewed.teacherRoute];
      if(cls&&cls!==rec.diagnosisClass){open({...rec,diagnosisClass:cls,_teacherApplied:true},step);return}
    }
    if(rec.diagnosisClass===7){const status=decisions.get(recommendationId(rec))?.status;if(status==="approved"){const route=decisions.get(recommendationId(rec))?.teacherRoute||rec.route;const cls=({hanzi_form:5,tone_practice:8,listening:9,meaning_contrast:3,learn:6,usage_rewrite:10})[route]||6;open({...rec,diagnosisClass:cls});return}if(status==="pending"||status==="rejected")return;sendTeacher(rec);return}
    const questions=rec._questions||practiceQuestions(rec),q=questions[step];if(!q||q.mode==="choice"&&new Set(q.options.map(norm)).size<2){alert(tr("Bạn đã làm hết các đề khác nhau hiện có cho kỹ năng này. Hãy chọn mục khác trong lúc chờ giáo viên bổ sung đề mới.","You have completed the available distinct questions for this skill. Choose another review item while your teacher adds more material."));return}
    const memoryReview=[2,3,4,5,6,8,9,10].includes(rec.diagnosisClass)&&DIMS.includes(q.dimension)&&q.mode!=="production";
    const state=window.PanTutorMemory?.getState(rec.target,q.dimension);
    const priorLearned=state?.learned===true||(window.PanTutorAttemptHistory?.allRows?.()||[]).some(r=>r.taskId==="vocab-intro"&&(r.items||[]).some(i=>(i.char||i.target)===rec.target&&i.correct===true));
    if(memoryReview&&!priorLearned){
      ensurePracticeStyle();document.getElementById("ptTenLayerOverlay")?.remove();const learn=document.createElement("div");learn.id="ptTenLayerOverlay";const w=word(rec.target);
      learn.innerHTML=`<section class="ptt-panel" role="dialog" aria-modal="true" aria-label="Học mẫu"><header class="ptt-head"><b class="ptt-title">${tr('Học mẫu trước khi kiểm tra','Learn before testing')}</b><button class="ptt-close" type="button">${tr('✕ Thoát','✕ Close')}</button></header><div class="ptt-body"><div class="ptt-card"><h2>${ESC(rec.target)}</h2><p>${ESC(w?.pinyin||"")} · ${ESC(meaning(w))}</p><p>${ESC(w?.examples?.[0]?.[0]||"")}</p><p class="ptt-help">${tr('Xem mẫu chưa được tính là nhớ. Khi sẵn sàng, hãy làm câu kiểm tra không nhìn đáp án.','Viewing the model is not a recall test. When ready, answer without hints.')}</p><button class="ptt-secondary" data-sample type="button">${tr('Nghe mẫu','Listen to model')}</button><button class="ptt-primary" data-learned type="button">${tr('Đã học mẫu · Bắt đầu kiểm tra','Ready · Start test')}</button><div role="status"></div></div></div></section>`;
      document.body.appendChild(learn);learn.querySelector('.ptt-close').onclick=()=>learn.remove();learn.querySelector('[data-sample]').onclick=()=>speak(q.audioText||rec.target);
      learn.querySelector('[data-learned]').onclick=async()=>{const b=learn.querySelector('[data-learned]');b.disabled=true;try{await window.PanTutorAttemptHistory.save({dayNumber:rec.dayNumber,taskId:"memory_learning",scorePercent:0,passed:false,completeSet:false,total:0,items:[{target:rec.target,dimension:q.dimension,input:"Đã học mẫu",expected:"",prompt:"Xem từ, nghe mẫu và đọc ví dụ",verified:false}],scheduleSaved:false});learn.remove();open(rec,step)}catch(e){b.disabled=false;learn.querySelector('[role="status"]').textContent=tr("Chưa lưu được: ","Could not save: ")+e.message}};
      return;
    }
    rememberQuestion(rec,q);
    if(q.mode==="choice")for(let i=q.options.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[q.options[i],q.options[j]]=[q.options[j],q.options[i]]}
    if(q.audio&&!("speechSynthesis" in window)){alert(tr("Thiết bị chưa phát được âm thanh tiếng Trung; hãy mở bài nghe có audio.","Chinese speech playback is unavailable. Please open a listening lesson with recorded audio."));return}
    ensurePracticeStyle();document.getElementById("ptTenLayerOverlay")?.remove();
    const ov=document.createElement("div");ov.id="ptTenLayerOverlay";
    const existing=rec.diagnosisClass===9||rec.diagnosisClass===4?{type:"listening",label:"Mở bài nghe đúng từ đang luyện"}:rec.diagnosisClass===10||rec.diagnosisClass===1?{type:"reading_writing",label:"Mở bài viết của ngày"}:rec.diagnosisClass===6?{type:"vocab-intro",label:"Mở bài học từ vựng"}:null;
    ov.innerHTML=`<section class="ptt-panel" role="dialog" aria-modal="true" aria-label="Bài luyện bổ sung"><header class="ptt-head"><div><div class="ptt-title">${q.audio?tr("🎧 AI Coach · Luyện nghe","🎧 AI Coach · Listening"):tr("📝 AI Coach · Luyện thêm","📝 AI Coach · Practice")}</div><div class="ptt-sub">${tr("Ngày","Day")} ${Number(rec.dayNumber)} · ${q.audio?tr("Nghe trước khi xem chữ","Listen before reading"):ESC(rec.target)} · ${ESC(en()?englishNames[q.dimension]:DIM_NAMES[q.dimension]||q.dimension)}</div></div><button id="ptTenClose" class="ptt-close" type="button">${tr('✕ Thoát','✕ Close')}</button></header><div class="ptt-body"><div class="ptt-banner">${tr("Luyện đúng phần cần củng cố:","Practise the skill that needs attention:")} <b>${ESC(en()?englishNames[q.dimension]:DIM_NAMES[q.dimension])}</b></div><div class="ptt-progress"><div class="ptt-bar"><span style="width:${Math.round((step+1)/questions.length*100)}%"></span></div><span>${step+1} / ${questions.length}</span></div><div class="ptt-card"><span class="ptt-kicker">${q.audio?tr("LUYỆN NGHE · NGHE TRƯỚC","LISTEN FIRST"):tr("LUYỆN TẬP · LÀM LẠI","TARGETED PRACTICE")}</span><h2 class="ptt-question">${ESC(q.prompt)}</h2>${q.audio?`<p class="ptt-help">${tr('Nghe mẫu rồi chọn một đáp án. Bạn có thể nghe lại nhiều lần.','Listen, then select an answer. You can replay the audio.')}</p><button id="ptTenOrb" class="ptt-orb" type="button" aria-label="Nghe mẫu">🔊</button><div class="ptt-actions"><button id="ptTenAudio" class="ptt-primary" type="button">${tr('▶ Nghe lại audio','▶ Replay audio')}</button></div>`:""}${q.mode==="choice"?`<div id="ptTenChoices" class="ptt-options">${q.options.map((o,i)=>`<button type="button" class="ptt-option" data-i="${i}">${ESC(o)}</button>`).join("")}</div>`:`<textarea id="ptTenInput" class="ptt-input" rows="3" placeholder="${tr('Nhập câu trả lời','Enter your answer')}"></textarea><div class="ptt-actions"><button id="ptTenSubmit" class="ptt-primary" type="button">${tr('Nộp bài','Submit')}</button></div>`}<div id="ptTenResult" class="ptt-result" aria-live="polite"></div>${existing?`<div class="ptt-actions"><button id="ptTenExisting" class="ptt-secondary" type="button">${ESC(en()?({listening:"Open listening practice",reading_writing:"Open writing practice","vocab-intro":"Open vocabulary lesson"}[existing.type]):existing.label)}</button></div>`:""}</div></div></section>`;
    document.body.appendChild(ov);ov.querySelector("#ptTenClose").onclick=()=>ov.remove();ov.onclick=e=>{if(e.target===ov)ov.remove()};
    const audio=ov.querySelector("#ptTenAudio");if(audio)audio.onclick=()=>speak(q.audioText||rec.target);const orb=ov.querySelector("#ptTenOrb");if(orb)orb.onclick=()=>speak(q.audioText||rec.target);
    const existingBtn=ov.querySelector("#ptTenExisting");if(existingBtn)existingBtn.onclick=()=>{ov.remove();if(existing.type==="listening"&&window.PandaHanCoachSkills?.openListening)window.PandaHanCoachSkills.openListening(window.PandaHanMission?.mission?.(),rec.target);else if(existing.type==="vocab-intro"&&window.PandaHanCoachSkills?.openVocabulary)window.PandaHanCoachSkills.openVocabulary(window.PandaHanMission?.mission?.(),rec.target);else window.PandaHanMission?.startTask?.(existing.type)};
    const confidence=document.createElement("label");confidence.className="ptt-help";confidence.innerHTML=`<span>${tr('Mức chắc chắn của bạn:','How confident are you?')} </span><select id="ptMemoryConfidence"><option value="unsure">${tr('Chưa chắc','Not sure')}</option><option value="certain">${tr('Chắc chắn','Confident')}</option></select>`;ov.querySelector('.ptt-card').appendChild(confidence);
    let done=false;
    async function grade(input){if(done||!String(input||"").trim())return;done=true;
      ov.querySelectorAll("#ptTenChoices button,#ptTenSubmit").forEach(x=>x.disabled=true);
      try{
      const verified=q.mode!=="production",correct=verified&&norm(input)===norm(q.answer);
      const message=en()?(verified?(correct?"Correct. You answered this question successfully.":"Not quite. Reference answer: "+q.answer+". Compare it with your response before trying a new question."):"Your sentence has been saved. Teacher verification is required before it affects memory scores."):verified?(correct?`Đúng. ${q.explain||"Bạn đã trả lời đúng phần "+(DIM_NAMES[q.dimension]||q.dimension)+"."}`:`Chưa đúng. Đáp án: ${q.answer}. ${q.explain||"Nghe/xem lại mẫu rồi làm lại."}`):"Đã nhận câu mới. Cần giáo viên kiểm tra nghĩa và ngữ pháp trước khi tính kết quả.";
      let saved=null;
      if(verified)saved=await submit(rec,input,q.answer,correct,q.dimension,{verified:true,questionId:questionId(q),audioText:q.audioText||null,prompt:q.prompt,memoryReview,learnCompleted:priorLearned,confidence:ov.querySelector("#ptMemoryConfidence")?.value||"unsure",responseMs:Date.now()-started,recommendationId:rec.id||recommendationId(rec),questionIndex:step,questionCount:questions.length});
      else await window.PanTutorAttemptHistory?.save?.({dayNumber:rec.dayNumber,taskId:"teacherDraft",scorePercent:0,passed:false,completeSet:false,total:1,items:[{target:rec.target,dimension:q.dimension,input,expected:q.reference,verified:false,prompt:q.prompt,questionId:questionId(q),status:"pending_review",sourceAttemptId:rec.attemptId}],scheduleSaved:false});
      ov.querySelector("#ptTenResult").innerHTML=`<p>${ESC(message)}</p>${saved?window.PanTutorMemory?.feedback(saved)||"":""}<button id="ptTenAgain" class="ptt-secondary" type="button">${tr('Làm lại','Try a new question')}</button>`;
      ov.querySelectorAll("#ptTenChoices button").forEach(x=>{x.classList.add(norm(x.textContent)===norm(q.answer)?"correct":"wrong")});
      const resultsBtn=ov.querySelector("[data-memory-results]");if(resultsBtn)resultsBtn.onclick=()=>{ov.remove();window.switchTab?.("dashboard");const panel=document.getElementById("memoryResultsPanel");if(panel){const outer=document.getElementById("retentionRubric");if(outer)outer.open=true;panel.open=true;panel.scrollIntoView({behavior:"smooth"})}};
      ov.querySelector("#ptTenAgain").onclick=()=>{ov.remove();open(rec)};
      if(step+1<questions.length){const next=document.createElement("button");next.className="ptt-primary";next.type="button";next.textContent=tr("Câu tiếp theo","Next question");next.onclick=()=>open(rec,step+1);ov.querySelector("#ptTenResult").appendChild(next)}
      ov.querySelectorAll("#ptTenChoices button,#ptTenSubmit").forEach(x=>x.disabled=true);
      }catch(e){done=false;ov.querySelectorAll("#ptTenChoices button,#ptTenSubmit").forEach(x=>x.disabled=false);ov.querySelector("#ptTenResult").textContent=tr("Chưa lưu được kết quả. Hãy thử nộp lại: ","Could not save your answer. Please submit again: ")+e.message}
    }
    const started=Date.now();ov.querySelectorAll("#ptTenChoices button").forEach(btn=>btn.onclick=()=>grade(q.options[Number(btn.dataset.i)]));const submitBtn=ov.querySelector("#ptTenSubmit");if(submitBtn)submitBtn.onclick=()=>grade(ov.querySelector("#ptTenInput").value);
  }
  async function sendTeacher(rec,quiet=false){
    const uid=window.firebase?.auth?.().currentUser?.uid,db=window.PandaHanFirebase?.firestore;
    if(!uid||!db){if(!quiet)alert("Hãy đăng nhập để gửi đề xuất cho giáo viên.");return}
    const key=recommendationId(rec);
    const ref=db.collection("learningRecommendations").doc(uid).collection("items").doc(key);
    try{const snap=await ref.get();if(snap.exists){if(!quiet)alert("Đề xuất này đã được gửi. Giáo viên sẽ xem bằng chứng và quyết định.");return}
      const evidence=diagnose(window.PanTutorAttemptHistory.allRows()).filter(x=>x.target===rec.target&&x.dimension===rec.dimension&&(rec.diagnosisClass!==7||!x.correct)).slice(-3);
      const required=rec.diagnosisClass===7?3:1;
      if(new Set(evidence.map(x=>x.attemptId)).size<required){if(!quiet)alert("Cần thêm bài làm được lưu trước khi gửi đề xuất.");return}
      await ref.set({ownerId:uid,dayNumber:rec.dayNumber,target:rec.target,dimension:rec.dimension,diagnosisClass:rec.diagnosisClass,sourceAttemptIds:evidence.map(x=>x.attemptId),route:rec.dimension==="FORM"?"hanzi_form":rec.dimension==="SOUND"?"tone_practice":rec.dimension==="USAGE"?"usage_rewrite":"meaning_contrast",reason:rec.reason,status:"pending",action:rec.action||ACTIONS[7],dimensions:rec.dimensions||{},confidence:rec.confidence,createdAt:Date.now()});decisions.set(key,{status:"pending"});if(!quiet)alert("Đã gửi bài làm và đề xuất cho giáo viên.");loadDecisions()
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
          const verified=sources.filter(x=>x.exists&&x.data()?.ownerId===student.uid&&(x.data()?.items||[]).some(item=>String(item.word||item.char||item.target||"").includes(r.target)&&(r.diagnosisClass!==7||item.correct===false||Number.isFinite(Number(item.score))&&Number(item.score)<75||!!item.correction?.reason)));
          const skills=r.dimensions||{};
          const scoreText=DIMS.filter(d=>skills[d]).map(d=>`${DIM_NAMES[d]}: ${skills[d].evidenceCount} bài, ${Math.round(skills[d].value*100)}%`).join(" · ");
          const evidenceText=verified.map(x=>{const item=x.data().items.find(i=>String(i.word||i.char||i.target||"").includes(r.target));return `${new Date(x.data().createdAt).toLocaleString("vi-VN")}: ${item?.input||"(chưa trả lời)"} → ${item?.expected||""}`}).join(" | ");
          line.innerHTML=`<b>${ESC(student.name)} · ${ESC(r.target)} · ${ESC(DIM_NAMES[r.dimension]||r.dimension)}</b><div>${ESC(r.reason)}</div><div>Đề xuất: ${ESC(r.action||ACTIONS[7])} · Kiểm tra được ${verified.length}/${ids.length} bài làm</div><small>${ESC(evidenceText)}</small><p>${ESC(scoreText||"Chưa có điểm kỹ năng đáng tin cậy")}</p>${verified.length>=(r.diagnosisClass===7?3:1)?`<label>Cách luyện giáo viên đề xuất<input data-teacher-action style="display:block;width:100%;box-sizing:border-box;margin:5px 0" value="${ESC(r.action||ACTIONS[7])}" maxlength="300"></label><label>Lý do quyết định<input data-teacher-reason style="display:block;width:100%;box-sizing:border-box;margin:5px 0" placeholder="Nêu lý do cho người học" maxlength="600"></label><label>Chọn dạng bài<select data-teacher-route><option value="hanzi_form" ${r.route==="hanzi_form"?"selected":""}>Nhận diện chữ Hán</option><option value="tone_practice" ${r.route==="tone_practice"?"selected":""}>Phân biệt thanh điệu</option><option value="listening" ${r.route==="listening"?"selected":""}>Nghe chọn từ</option><option value="meaning_contrast" ${r.route==="meaning_contrast"?"selected":""}>Phân biệt nghĩa</option><option value="learn" ${r.route==="learn"?"selected":""}>Học mẫu lại</option><option value="usage_rewrite" ${r.route==="usage_rewrite"?"selected":""}>Sửa cách dùng từ</option></select></label><button data-decision="approved">Đồng ý</button> <button data-decision="edit">Sửa đề xuất và duyệt</button> <button data-decision="rejected">Không đồng ý</button>`:"Chưa đủ bằng chứng để duyệt"}`;section.appendChild(line);
          line.querySelectorAll("[data-decision]").forEach(btn=>btn.onclick=async()=>{const reason=line.querySelector("[data-teacher-reason]")?.value.trim(),action=line.querySelector("[data-teacher-action]")?.value.trim();if(!reason||reason.length<3){alert("Vui lòng nhập lý do ít nhất ba ký tự.");return}if(btn.dataset.decision==="edit"&&!action){alert("Vui lòng nhập bài luyện thay thế.");return}try{await doc.ref.update({status:btn.dataset.decision==="rejected"?"rejected":"approved",teacherAction:action||r.action||ACTIONS[7],teacherRoute:line.querySelector("[data-teacher-route]").value,teacherReason:reason,reviewedAt:Date.now(),reviewedBy:window.firebase.auth().currentUser.uid});line.remove()}catch(e){alert("Không lưu được quyết định: "+e.message)}})

        }
      }catch(e){console.warn("Teacher recommendations:",e?.code||e?.message||e)}
    }
  }
  window.PanTutorTenLayer={practiceQuestions,questionId,rememberQuestion,errorDetails,diagnose,model,recommendations,quality,render,bind,open,renderTeacher,question,loadDecisions,choose};
  window.firebase?.auth?.().onAuthStateChanged(user=>{if(user)loadDecisions()});
  window.addEventListener("pantutor-attempt-saved",event=>{
    if(document.querySelector("[data-ai-coach-plan]")&&event.detail?.dayNumber){
      const panel=document.querySelector("[data-ai-coach-plan]")?.parentElement;
      if(panel)window.requestAnimationFrame?.(()=>window.PandaHanMission?.renderCoach?.(panel));
    }
    if(event.detail?.restored||!event.detail?.attemptId)return;
    const rows=window.PanTutorAttemptHistory?.allRows?.()||[];
    const match=recommendations(event.detail.dayNumber,rows).find(r=>r.diagnosisClass===7&&r.attemptId===event.detail.attemptId);
    if(match&&!decisions.has(recommendationId(match)))sendTeacher(match,true);
  });
})();
