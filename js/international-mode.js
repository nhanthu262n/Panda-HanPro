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
"TAP TO START":"TAP TO START","PLAY AGAIN":"PLAY AGAIN",
"1. 4 thanh điệu cơ bản với MA":"1. Four core tones with MA",
"1. 4 thanh điệu + nguyên âm đơn a / o / e / i / u":"1. Four tones + simple vowels a / o / e / i / u",
"2. Luyện với BA (b + a)":"2. Practise with BA (b + a)",
"3. Nguyên âm a / o / e — qua 4 thanh":"3. Vowels a / o / e across all four tones",
"4. Nguyên âm i / u — qua 4 thanh":"4. Vowels i / u across all four tones",
"mẹ — T1: cao đều":"mother — T1: high and level",
"gai/tê — T2: vút lên":"numb / tingling — T2: rising",
"ngựa — T3: xuống→lên":"horse — T3: dipping (fall–rise)",
"mắng — T4: rơi xuống":"scold — T4: sharp falling",
"số tám":"eight","nhổ, rút":"pull out; extract",
"Khẩu hình: \"a\" mở miệng rộng, hàm hạ thấp; \"o\" tròn môi vừa; \"e\" miệng hơi mở, lưỡi rút về sau (KHÔNG như \"e\" tiếng Việt).":"Articulation: for a, open the mouth widely and lower the jaw; for o, round the lips moderately; for e, keep the mouth slightly open and retract the tongue. Do not use the Vietnamese e quality.",
"âm luyện thanh T1":"tone-practice syllable — T1",
"trán — T2":"forehead — T2",
"âm luyện thanh T3":"tone-practice syllable — T3",
"đói — T4":"hungry — T4",
"\"i\" mím môi, lưỡi sát ngạc trên; \"u\" tròn môi, đẩy ra trước. Khi đứng đầu âm tiết: i → yi, u → wu.":"For i, spread the lips and raise the tongue close to the hard palate; for u, round and protrude the lips. At syllable onset: i → yi, u → wu.",
"dùng T3":"use — T3","ý nghĩa T4":"meaning — T4","căn phòng T1":"room — T1","không có T2":"not have — T2","năm T3":"five — T3","nhiệm vụ T4":"task — T4",
"2. Nhóm âm đầu lưỡi: d / t / n / l + a":"2. Tongue-tip initials: d / t / n / l + a",
"đầu lưỡi chạm lợi trên: d không bật hơi (gần \"đ\" nhẹ), t bật hơi mạnh (gần \"th\"), n là âm mũi, l là âm biên (lưỡi cong nhẹ).":"Place the tongue tip at the upper alveolar ridge: d is unaspirated, t is strongly aspirated, n is nasal, and l is lateral with a light tongue-tip contact.",
"3. Ghép phụ âm với o / e / i / u":"3. Combine initials with o / e / i / u",
"Mỗi ô chỉ luyện một âm tiết. T1 giữ cao ngang; T2 đi lên; T3 hạ xuống rồi bật lên; T4 rơi mạnh. b/p/m/f không ghép với ua; hãy luyện đúng vận mẫu hiển thị.":"Practise one syllable per card. T1 stays high and level; T2 rises; T3 dips then rises; T4 falls sharply. Follow the final shown on each card.",
"2. Nhóm KHÔNG uốn lưỡi: z / c / s + i":"2. Non-retroflex group: z / c / s + i",
"3. Tương phản cặp đôi zh↔z, ch↔c, sh↔s":"3. Contrast pairs zh↔z, ch↔c, sh↔s",
"2. Vận mẫu kết thúc -ng (mũi sau)":"2. Finals ending in -ng (back nasal)",
"Âm cuối -ng: cuống lưỡi nâng về phía vòm mềm, đầu lưỡi không chạm răng. Với eng, giữ nguyên khẩu hình e rồi đưa hơi vang ra phía sau.":"For final -ng, raise the back of the tongue toward the soft palate while keeping the tongue tip away from the teeth. For eng, maintain the e vowel shape and direct resonance toward the back.",
"3. Tương phản -n vs -ng (cặp cần chú ý)":"3. Contrast -n vs -ng (high-priority pair)",
"Đây là lỗi phổ biến với người học tiếng Việt: -n khóa ở phía trước miệng, còn -ng vang ở phía sau. Hãy nghe từng mẫu rồi lặp lại chậm.":"Contrast front nasal -n with back nasal -ng: -n closes at the front of the oral cavity, while -ng resonates farther back. Listen to each model and repeat slowly.",
"Đang kiểm tra bản ghi, đối chiếu với mẫu giáo viên và phân tích âm đầu · vận mẫu · thanh điệu…":"Analyzing the recording against the instructor model: initial · final · tone contour…",
"Đánh giá tự động theo rubric":"Automated pronunciation-rubric assessment",
"Xếp loại rubric: ":"Rubric classification: ",
"Thanh điệu":"Tone contour","Âm đầu – âm cuối":"Initials and finals","Khẩu hình – vị trí lưỡi":"Articulation and tongue placement","Ngữ điệu & độ trôi chảy":"Prosody and fluency",
"Nhận xét: ":"Feedback: ","Bản ghi gốc của người học":"Learner's original recording",
"Chưa có bản thu gốc để phát lại. Hãy ghi âm rồi bấm “Dừng”.":"No learner recording is available yet. Record a sample and press Stop first.",
"Micro đang bị chặn. Hãy bấm biểu tượng ổ khóa cạnh địa chỉ trang, cho phép Microphone rồi thử lại.":"Microphone access is blocked. Allow Microphone permission in the browser site settings, then try again.",
"Không tìm thấy micro. Hãy kết nối hoặc chọn micro khác trong cài đặt thiết bị rồi thử lại.":"No microphone was detected. Connect or select another microphone, then try again.",
"Không thể mở micro. Hãy kiểm tra quyền microphone của trình duyệt rồi thử lại.":"The microphone could not be opened. Check browser microphone permissions and try again.",
"Kiểm tra đạt: đã nhận giọng nói từ ${je.label||\"microphone\"}. Bạn có thể bấm “Ghi âm” để luyện và nhận chấm điểm.":"Microphone check passed. Voice input was detected; you can now record for pronunciation assessment.",
"Mức tín hiệu micro":"Microphone input level","Mức tín hiệu microphone":"Microphone input level","Đã nhận giọng nói":"Voice detected","Chờ tín hiệu giọng nói…":"Waiting for voice input…"

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
function convert(raw){const s=String(raw||"");const map=window.PandaHanEnglishMap||{};if(map[s])return map[s];if(exact[s])return exact[s];let out=s;reps.forEach(([a,b])=>out=out.replace(a,b));return out}
function text(n){if(!n||n.nodeType!==3)return;const raw=n.nodeValue||"",s=raw.trim();if(s==="English learning guidance"){if(raw!=="")n.nodeValue="";return;}if(!s||!hasVi(s))return;let out=convert(s);if(hasVi(out)){
  // Never delete lesson content. More importantly, do NOT write the same untranslated
  // string back into the DOM, otherwise MutationObserver would retrigger forever.
  return;
}
const next=(raw.match(/^\s*/)?.[0]||"")+out+(raw.match(/\s*$/)?.[0]||"");
if(next!==raw)n.nodeValue=next}
function attrs(el){["placeholder","title","aria-label"].forEach(a=>{const v=el.getAttribute?.(a);if(v&&hasVi(v)){let x=convert(v);if(hasVi(x))return;if(x!==v)el.setAttribute(a,x)}})}
const observed=new WeakSet();
function observe(scope){if(!scope||observed.has(scope))return;observed.add(scope);scan(scope);new MutationObserver(ms=>ms.forEach(m=>{if(m.type==="characterData")text(m.target);m.addedNodes.forEach(n=>n.nodeType===3?text(n):scan(n))})).observe(scope,{subtree:true,childList:true,characterData:true})}
function scan(root){if(!root)return;if(root.nodeType===3){text(root);return}const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode())text(n);root.querySelectorAll?.("*").forEach(el=>{attrs(el);if(el.shadowRoot)observe(el.shadowRoot)})}
// Critical v24 fix: Phonetics creates its Shadow DOM after page boot. Observe every newly attached shadow root.
const nativeAttach=Element.prototype.attachShadow;Element.prototype.attachShadow=function(init){const sr=nativeAttach.call(this,init);queueMicrotask(()=>observe(sr));return sr};
localStorage.setItem("pandahan_lang","en");try{window.LANG_MODE="en"}catch(_){}document.documentElement.lang="en";
const boot=()=>{try{window.setLangMode?.("en")}catch(_){}observe(document.body);document.querySelectorAll("*").forEach(el=>{if(el.shadowRoot)observe(el.shadowRoot)})};
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",boot):boot();
})();