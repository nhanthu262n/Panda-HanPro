(() => {
  "use strict";

  const EXACT = new Map(Object.entries({
    "Home":"Trang chủ","Dictionary":"Từ điển","Practice":"Luyện tập","Progress":"Tiến độ","Phonetics":"Ngữ âm",
    "Messages":"Nhắn tin","AI Tutor":"AI Tutor","Teacher":"Giáo viên","Close":"Đóng","Exit":"Thoát","Back":"Quay lại",
    "Start":"Bắt đầu","Continue":"Tiếp tục","Completed":"Đã hoàn thành","Open":"Mở","Retry":"Làm lại",
    "Check":"Kiểm tra","Check answer":"Kiểm tra đáp án","Answer":"Đáp án","Correct":"Đúng","Incorrect":"Sai","Score":"Điểm",
    "Question":"Câu hỏi","Result":"Kết quả","Guide":"Hướng dẫn","Save":"Lưu","Saved":"Đã lưu","Listen":"Nghe",
    "Next":"Tiếp theo","Next →":"Tiếp theo →","Next word →":"Từ tiếp theo →","Next audio →":"Audio tiếp theo →","Next card →":"Thẻ tiếp theo →",
    "Finish vocabulary":"Hoàn thành từ vựng","Finish SRS":"Hoàn thành SRS","Finish Listening":"Hoàn thành bài nghe",
    "Finish Speaking":"Hoàn thành bài nói","Finish Phonetics":"Hoàn thành ngữ âm","Finish Reading / Writing":"Hoàn thành Đọc / Viết",
    "Preparing task…":"Đang chuẩn bị nhiệm vụ…","Preparing today's task…":"Đang chuẩn bị nhiệm vụ hôm nay…",
    "Excel curriculum task:":"Nhiệm vụ theo lộ trình Excel:","Teacher feedback":"Nhận xét của giáo viên",
    "Teacher summary":"Tổng kết của giáo viên","Overall comment":"Nhận xét tổng quan","Model / reference":"Mẫu / tham chiếu",
    "Next practice":"Bài luyện tiếp theo","Analysis":"Phân tích","Strongest evidence:":"Điểm mạnh nhất:",
    "Priority correction:":"Ưu tiên cần sửa:","Priority practice:":"Ưu tiên luyện tập:",
    "Choose the correct meaning.":"Chọn nghĩa chính xác.","Read and choose the best meaning.":"Đọc và chọn nghĩa phù hợp nhất.",
    "Type the Hanzi from memory.":"Nhập chữ Hán từ trí nhớ.","Type Hanzi":"Nhập chữ Hán",
    "Type Pinyin with tone marks":"Nhập Pinyin có dấu thanh","Write a complete Chinese sentence":"Viết một câu tiếng Trung hoàn chỉnh",
    "Compare & grade":"So sánh và chấm điểm","Which meaning best matches the audio?":"Nghĩa nào phù hợp nhất với audio?",
    "Replay audio":"Nghe lại audio","Record again":"Ghi âm lại","Play model":"Nghe mẫu","Replay my recording":"Nghe lại bản ghi",
    "Start recording":"Bắt đầu ghi âm","Stop & grade":"Dừng và chấm điểm",
    "RECALL SUCCESS":"NHỚ ĐÚNG","RELEARNING NEEDED":"CẦN HỌC LẠI","CORRECT — EXPLAINED":"ĐÚNG — CÓ GIẢI THÍCH",
    "INCORRECT — EXPLAINED":"SAI — CÓ GIẢI THÍCH","REVIEW SOUND":"CẦN ÔN ÂM","RESOLVED":"ĐÃ SỬA",
    "STILL UNRESOLVED":"CHƯA SỬA XONG","EXCELLENT":"XUẤT SẮC","GOOD":"TỐT","PASS":"ĐẠT","REVISE":"CẦN SỬA",
    "Task /20":"Hoàn thành nhiệm vụ /20","Organization /20":"Bố cục /20","Grammar /30":"Ngữ pháp /30",
    "Vocabulary /15":"Từ vựng /15","Naturalness /15":"Độ tự nhiên /15",
    "Tone /35":"Thanh điệu /35","Initial–final /35":"Âm đầu–vần /35","Articulation /20":"Cấu âm /20","Fluency /10":"Độ trôi chảy /10",
    "Your answer vs target":"Câu trả lời và đáp án mục tiêu","Your answer:":"Câu trả lời của bạn:",
    "Your choice:":"Lựa chọn của bạn:","Correct answer:":"Đáp án đúng:","Correct meaning:":"Nghĩa đúng:",
    "Target:":"Mục tiêu:","Target word:":"Từ mục tiêu:","Pinyin:":"Pinyin:","Hanzi:":"Chữ Hán:",
    "Why":"Giải thích","Why this score":"Lý do cho điểm","Answer evidence":"Bằng chứng đáp án",
    "Word analysis":"Phân tích từ","Recall evidence":"Bằng chứng ghi nhớ","SRS consequence":"Tác động đến SRS",
    "Attempt history":"Lịch sử làm bài","Sound evidence":"Bằng chứng âm thanh","Answer comparison":"So sánh đáp án",
    "What the audio contained":"Nội dung audio","Evidence from your sentence":"Bằng chứng từ câu bạn viết",
    "Required corrections / cautions":"Nội dung cần sửa / lưu ý","Teacher notes":"Ghi chú của giáo viên",
    "Pass mark:":"Ngưỡng đạt:","Return to AI Coach":"Quay lại AI Coach","Redo task":"Làm lại nhiệm vụ",
    "Needs another attempt":"Cần làm lại","Score passed, but evidence was not saved":"Điểm đạt nhưng evidence chưa được lưu",
    "Verified — green check saved":"Đã xác nhận — đã lưu dấu tích xanh",
    "FULL COMPATIBILITY":"TƯƠNG THÍCH HOÀN TOÀN","AUDIO-ONLY RUBRIC":"RUBRIC CHỈ DỰA TRÊN ÂM THANH",
    "RUBRIC ANALYSIS":"PHÂN TÍCH THEO RUBRIC","PRONUNCIATION RUBRIC":"RUBRIC PHÁT ÂM"
  }));

  const REPLACERS = [
    [/^Day (\d+)$/i,(_,n)=>`Ngày ${n}`],
    [/^Day (\d+) · /i,(_,n)=>`Ngày ${n} · `],
    [/^(\d+) of (\d+) /i,(_,a,b)=>`${a} / ${b} `],
    [/^Overall:\s*/i,()=> "Tổng quan: "],
    [/^Pass mark:\s*/i,()=> "Ngưỡng đạt: "],
    [/^Learner sentence:\s*/i,()=> "Câu của người học: "],
    [/^Required word:\s*/i,()=> "Từ bắt buộc: "],
    [/^Chinese characters detected:\s*/i,()=> "Số chữ Hán nhận diện: "],
    [/^Recognized:\s*/i,()=> "Nhận diện được: "],
    [/^Signal quality:\s*/i,()=> "Chất lượng tín hiệu: "],
    [/^Estimated syllables:\s*/i,()=> "Số âm tiết ước lượng: "],
    [/^Previous answer:\s*/i,()=> "Đáp án trước: "],
    [/^Current retry:\s*/i,()=> "Lần làm lại hiện tại: "],
    [/^Expected answer:\s*/i,()=> "Đáp án mong đợi: "],
    [/^Original prompt:\s*/i,()=> "Câu hỏi ban đầu: "]
  ];

  function translateText(text){
    const raw=String(text??"");
    const trim=raw.trim();
    if(!trim) return raw;
    if(EXACT.has(trim)) return raw.replace(trim,EXACT.get(trim));
    let out=trim;
    for(const [re,fn] of REPLACERS) out=out.replace(re,fn);
    return raw.replace(trim,out);
  }

  function apply(root=document.body){
    if(window.LANG_MODE!=="vi" || !root) return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let n=walker.nextNode();
    while(n){
      const p=n.parentElement;
      if(p && !p.closest("script,style,textarea,input,[data-keep-pinyin]")){
        n.nodeValue=translateText(n.nodeValue);
      }
      n=walker.nextNode();
    }
    root.querySelectorAll?.("[placeholder]").forEach(el=>{
      const v=EXACT.get(String(el.placeholder||"").trim());
      if(v) el.placeholder=v;
    });
    root.querySelectorAll?.("[aria-label]").forEach(el=>{
      const v=EXACT.get(String(el.getAttribute("aria-label")||"").trim());
      if(v) el.setAttribute("aria-label",v);
    });
  }

  window.PanTutorV57Vietnamese={apply,translateText};

  document.addEventListener("click",()=>setTimeout(()=>apply(document.body),0),true);
  window.addEventListener("pandahan-language-changed",()=>setTimeout(()=>apply(document.body),0));
  document.addEventListener("DOMContentLoaded",()=>setTimeout(()=>apply(document.body),20));
})();