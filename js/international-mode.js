(()=>{"use strict";
const VI=/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/;
const WORDS=/\b(?:ngay|buoi|tuan|hoc|nghe|noi|tu vung|on tap|cau sai|giao vien|hoc vien|lo trinh|tien do|thanh dieu|phat am|trac nghiem|doc|viet|nghia|chu de|giai doan|hoan thanh|mo khoa|quay lai|tiep tuc|huong dan|khau hinh|ghi am|luyen|dap an|dung|sai|mau|am tiet|luoi|nham|van mau|phu am)\b/i;
const exact={
"Chế độ Offline":"Offline mode","Streak sắp mất!":"Your streak is at risk!","Thoát / Log out":"Log out",
"NỘI DUNG BUỔI HỌC":"SESSION CONTENT","TỪ SẮP HỌC HÔM NAY":"TODAY'S TARGET WORDS","FLASHCARD ĐANG HỌC":"CURRENT FLASHCARD",
"NGHĨA TIẾNG VIỆT":"ENGLISH MEANING","Nghĩa tiếng Việt":"English meaning","Hình riêng":"Image",
"Nghe mẫu giáo viên":"Play instructor model","Nghe mẫu đơn":"Play model","Kiểm tra micro":"Test microphone","Ghi âm":"Record",
"Dùng mic laptop":"Use laptop microphone","Tải lại":"Reload","1 đã nghe":"1 listened",
"Nghe mẫu → thu âm → nghe lại → nhận xét theo rubric phát âm":"Play model → record → replay → receive pronunciation-rubric feedback",
"Phát âm sai/cần luyện lại":"Pronunciation needs improvement","Sai âm đầu/âm cuối":"Initial/final error",
"3 giai đoạn: Học → Luyện đọc → Trắc nghiệm":"3 stages: Learn → Reading drill → Quiz","Cần ≥30% (6/20) để qua buổi":"Pass requirement: ≥30% (6/20)",
"Tuần 1 · Buổi 3":"Week 1 · Session 3","Tuần 1 · Buổi 2":"Week 1 · Session 2","Tuần 1 · Buổi 1":"Week 1 · Session 1",
"Vận mẫu mũi -n vs -ng (an/ang, in/ing, en/eng)":"Nasal finals -n vs -ng (an/ang, in/ing, en/eng)",
"Âm mặt lưỡi — dễ nhầm với zh/ch/sh":"Blade-palatal initials — often confused with zh/ch/sh",
"j/q/x thuộc nhóm mặt lưỡi (舌面音): lưỡi áp vào ngạc cứng. KHÔNG uốn lưỡi.":"j/q/x are blade-palatal initials (舌面音): the tongue contacts the hard palate. Do NOT retroflex the tongue.",
"j/q/x chỉ đi với i và ü. zh/ch/sh đi với a, o, e, i (đặc biệt), u. Cặp dễ nhầm cần luyện đối chiếu.":"j/q/x combine mainly with i and ü, while zh/ch/sh combine with a, o, e, the special apical i, and u. Practise these contrasts side by side.",
"j/q/x so với zh/ch/sh (cẩn thận nhầm!)":"j/q/x vs zh/ch/sh — high-confusion contrast",
"lưỡi áp vào ngạc cứng":"tongue contacts the hard palate","không bật hơi":"unaspirated","bật hơi rõ":"clearly aspirated",
"Đọc trọn âm tiết, chú ý đường thanh điệu rồi luyện lại bằng giọng của bạn.":"Read the complete syllable, track the tone contour carefully, then reproduce it with your own voice.",
"Khẩu hình":"Articulation","lưỡi nâng sát ngạc cứng":"raise the tongue close to the hard palate","không bật hơi":"unaspirated","bật hơi rõ":"strong aspiration","xát nhẹ":"light frication",
"gà":"chicken","kịp thời":"in time; promptly","mấy":"how many; several","ghi nhớ":"remember; memorize","bảy":"seven","kỳ lạ":"strange; unusual","đứng dậy":"stand up","hơi thở":"breath",
"Đề Ôn Tập & Kiểm Tra":"Review & Assessment","ĐỀ ÔN TẬP & KIỂM TRA":"REVIEW & ASSESSMENT","Ngày kiểm tra":"Assessment day","Từ vựng kế hoạch":"Planned vocabulary","Từ vựng giáo trình tham khảo":"Reference textbook vocabulary","Chủ đề":"Topic","Thời gian gợi ý":"Suggested duration","Quy tắc":"Instructions",
"Phần 1":"Section 1","Phần 2":"Section 2","Phần 3":"Section 3","Phần 4":"Section 4","Phụ lục nói":"Speaking appendix","đánh giá bổ sung, không tính vào số câu HSK":"supplementary assessment, not included in the HSK item count",
"Tự giới thiệu bằng 2–4 câu theo vốn từ của tuần.":"Give a 2–4 sentence self-introduction using this week's vocabulary.",
"Trả lời một câu hỏi về thời gian, địa điểm hoặc hoạt động của tuần.":"Answer one question about time, location, or a weekly activity.",
"Đóng vai hội thoại ngắn trong một tình huống của tuần.":"Role-play a short dialogue based on this week's scenario.",
"Nói một câu phủ định và một câu hỏi phù hợp chủ đề.":"Produce one negative sentence and one topic-appropriate question.",
"Nói lại một thông tin vừa nghe bằng câu của em.":"Retell one piece of information you just heard in your own sentence.",
"Viết lại 10 âm đã nghe với dấu thanh đúng.":"Write the 10 heard syllables using correct tone marks.",
"Nghe":"Listening","Đọc":"Reading","Nói":"Speaking","Viết":"Writing","Trắc nghiệm":"Quiz","Ôn tập":"Review","Học":"Learn","Luyện đọc":"Reading drill",
"TAP TO START":"TAP TO START","PLAY AGAIN":"PLAY AGAIN"
};
const reps=[
[/Ôn tập 120 ngày/gi,"120-Day Review"],[/Ngữ âm/gi,"Phonetics"],[/Từ vựng liên kết/gi,"Linked vocabulary"],[/Ôn lại câu sai/gi,"Redo wrong items"],[/câu sai/gi,"wrong items"],
[/Giáo viên/gi,"Instructor"],[/Học viên/gi,"Learner"],[/Lộ trình học/gi,"Learning Path"],[/Lộ trình 120 ngày/gi,"120-Day Learning Path"],[/Tiến độ học tập/gi,"Learning Progress"],
[/Ngày\s*(\d+)/gi,"Day $1"],[/Buổi\s*(\d+)/gi,"Session $1"],[/Tuần\s*(\d+)/gi,"Week $1"],[/Giai đoạn/gi,"Stage"],[/Hoàn thành/gi,"Completed"],[/đã xác minh/gi,"verified"],[/Vào học/gi,"Open lesson"],
[/Quay lại/gi,"Back"],[/Tiếp tục/gi,"Continue"],[/Nghe/gi,"Listening"],[/Nói/gi,"Speaking"],[/Đọc\s*\/\s*Viết/gi,"Reading / Writing"],[/Đọc/gi,"Reading"],[/Viết/gi,"Writing"],[/Trắc nghiệm/gi,"Quiz"],
[/Phát âm/gi,"Pronunciation"],[/Thanh điệu/gi,"Tones"],[/Mục tiêu/gi,"Target"],[/Điểm/gi,"Score"],[/Tìm ngày/gi,"Find day"],[/Hướng dẫn người mới/gi,"New learner guide"],
[/Nghĩa tiếng Việt/gi,"English meaning"],[/Từ sắp học hôm nay/gi,"Today's target words"],[/Nội dung buổi học/gi,"Session content"],[/Flashcard đang học/gi,"Current flashcard"],
[/Nghe mẫu/gi,"Play model"],[/Ghi âm/gi,"Record"],[/Kiểm tra micro/gi,"Test microphone"],[/Tải lại/gi,"Reload"],[/Cần luyện lại/gi,"Needs further practice"],
[/Phần\s*(\d+)/gi,"Section $1"],[/câu/gi,"items"],[/phút/gi,"min"],[/Tổng ôn/gi,"Comprehensive review"]
];
function hasVi(s){return VI.test(s)||WORDS.test(s.normalize?.("NFD").replace(/[\u0300-\u036f]/g,"")||s)}
function isQuestNode(n){
  const el=n?.parentElement;
  if(!el)return false;
  return !!el.closest?.(
    '#questOfflineRoot,#questFrame,#pinyinQuestRoot,[data-quest-root],'+
    '[data-pinyin-tone-quest],[data-120-day-review],iframe[src*="pinyin-tone-quest-app"]'
  );
}
function isPhoneticsNode(n){
  const el=n?.parentElement || (n?.nodeType===1?n:null);
  if(!el)return false;
  return !!el.closest?.('#pinyin-phonetics-root,[data-phonetics-mounted="true"],[data-phonetics-source-english="true"]');
}
function isPinyinNode(n){
  const el=n?.parentElement;
  if(!el)return false;
  return !!el.closest?.(
    '.pinyin,.d-pinyin,.fc-pinyin,.ai-tutor-reading-pinyin,.pv-flash-pinyin,'+
    '[data-pinyin],[data-keep-pinyin="true"],#dPinyin,#fcPinyin'
  );
}
function isAiTutorNode(n){return !!(n?.parentElement?.closest?.('[data-ai-tutor-workspace="true"],#aiTutorMessages,#aiTutorReadingMount,#aiTutorStudyMount'))}
function convert(raw){const s=String(raw||"");const map=window.PandaHanEnglishMap||{};if(map[s])return map[s];if(exact[s])return exact[s];let out=s;reps.forEach(([a,b])=>out=out.replace(a,b));return out}
function text(n){if(!n||n.nodeType!==3||isAiTutorNode(n)||isPinyinNode(n)||isPhoneticsNode(n)||isQuestNode(n))return;const raw=n.nodeValue||"",s=raw.trim();if(s==="English learning guidance"){n.nodeValue="";return;}if(!s||!hasVi(s))return;let out=convert(s);if(hasVi(out)){
  // Keep Chinese/Pinyin vocabulary content; replace only the Vietnamese explanatory fragment.
  if(/[一-鿿]/.test(out)){const parts=out.split(/([·|/]|\s+—\s+)/);const kept=parts.filter(p=>!hasVi(p));out=kept.join("").replace(/^[\s·|/—]+|[\s·|/—]+$/g,"").trim()||"Chinese learning item"}
  else out="";
}
n.nodeValue=(raw.match(/^\s*/)?.[0]||"")+out+(raw.match(/\s*$/)?.[0]||"")}
function attrs(el){if(isAiTutorNode(el)||isPinyinNode(el)||isPhoneticsNode(el)||isQuestNode(el))return;["placeholder","title","aria-label"].forEach(a=>{const v=el.getAttribute?.(a);if(v&&hasVi(v)){let x=convert(v);el.setAttribute(a,hasVi(x)?"Learning content":x)}})}
const observed=new WeakSet();
function observe(scope){if(!scope||observed.has(scope))return;observed.add(scope);scan(scope);new MutationObserver(ms=>ms.forEach(m=>{if(m.type==="characterData")text(m.target);m.addedNodes.forEach(n=>n.nodeType===3?text(n):scan(n))})).observe(scope,{subtree:true,childList:true,characterData:true})}
function scan(root){if(!root)return;if(root.nodeType===3){text(root);return}const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode())text(n);root.querySelectorAll?.("*").forEach(el=>{attrs(el);})}
localStorage.setItem("pandahan_lang","en");try{window.LANG_MODE="en"}catch(_){}document.documentElement.lang="en";
const boot=()=>{try{window.setLangMode?.("en")}catch(_){}observe(document.body);document.querySelectorAll("*").forEach(el=>{})};
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",boot):boot();
})();