(() => {
  "use strict";

  const EXACT = new Map(Object.entries({
    /* Main UI */
    "Choose language":"Chọn ngôn ngữ","⌛ Processing, please wait...":"⌛ Đang xử lý, vui lòng chờ...","New learner guide":"Hướng dẫn người học mới",
    "🔊 Test reminder":"🔊 Thử âm thanh nhắc nhở","🔔 Enable notifications":"🔔 Bật thông báo","🌍 中文 · English":"🌍 中文 · Tiếng Việt",
    "📚 Dictionary":"📚 Từ điển","🎯 Review (SRS)":"🎯 Ôn tập (SRS)","✍️ Practice":"✍️ Luyện tập","📊 Progress & Rubric":"📊 Tiến độ & Rubric",
    "🎵 Phonics":"🎵 Ngữ âm","💬 Messages (Learning Path)":"💬 Tin nhắn (Lộ trình học)","🤖 AI Tutor":"🤖 AI Tutor","👩‍🏫 Teacher":"👩‍🏫 Giáo viên",
    "📑 All parts of speech":"📑 Tất cả từ loại","📊 All levels":"📊 Tất cả cấp độ","⚪ Not studied":"⚪ Chưa học","🔴 New":"🔴 Mới học",
    "🟡 Reinforcing":"🟡 Đang củng cố","🔵 Familiar":"🔵 Đã quen","🟢 Mastered":"🟢 Thành thạo","⏰ Due for review":"⏰ Đến hạn ôn",
    "Elementary 1":"Sơ cấp 1","353 words":"353 từ","Elementary 2":"Sơ cấp 2","672 words":"672 từ","Intermediate":"Trung cấp","1229 words":"1229 từ",
    "← Back":"← Quay lại","🔊 Listen":"🔊 Nghe","词组 · PHRASES":"词组 · CỤM TỪ","例句 · EXAMPLE SENTENCES":"例句 · CÂU VÍ DỤ",
    "📈 RETENTION LEVEL (SM-2 ALGORITHM)":"📈 MỨC ĐỘ GHI NHỚ (THUẬT TOÁN SM-2)","Review date":"Ngày ôn","Gap":"Khoảng cách","Grade":"Điểm",
    "🐼 No review data yet":"🐼 Chưa có dữ liệu ôn tập","🎯 Review now":"🎯 Ôn ngay","📝 Quiz":"📝 Trắc nghiệm","🔀 Unscramble":"🔀 Sắp xếp câu",
    "➕ Flag for review":"➕ Đánh dấu cần ôn","✕ Exit":"✕ Thoát","👁️ Reveal":"👁️ Hiện đáp án","➡️ Continue":"➡️ Tiếp tục","🎉 Completed!":"🎉 Đã hoàn thành!",
    "Good recall":"Ghi nhớ tốt","Needs redo":"Cần làm lại","📊 View progress":"📊 Xem tiến độ","↺ Clear":"↺ Xóa","✓ Check":"✓ Kiểm tra","Next →":"Tiếp theo →",
    "✍️ Trilingual Practice":"✍️ Luyện tập ba ngôn ngữ","Choose HSK level and exercise type":"Chọn cấp HSK và dạng bài","Match Hanzi with meaning":"Ghép chữ Hán với nghĩa",
    "Type the meaning you recall":"Nhập nghĩa bạn nhớ","Choose the correct tone to guide Panda to the finish":"Chọn đúng thanh điệu để đưa Panda về đích",
    "🚀 HSK3 3.0 Practice Sets":"🚀 Bộ luyện HSK3 3.0","Each set includes a paragraph cloze and synonym/antonym multiple-choice section, followed by dialogue reordering. The content uses the app's studied HSK 1–3 vocabulary.":"Mỗi bộ gồm điền từ vào đoạn văn, trắc nghiệm đồng nghĩa/trái nghĩa và sắp xếp hội thoại. Nội dung sử dụng từ vựng HSK 1–3 đã học trong ứng dụng.",
    "← Back to practice":"← Quay lại Luyện tập","Review, error log and results are saved to this account":"Lịch ôn, lỗi sai và kết quả được lưu vào tài khoản này","Find day":"Tìm ngày",
    "📒 Redo wrong items":"📒 Làm lại câu sai","🤖 AI Tutor · Practice workspace":"🤖 AI Tutor · Không gian luyện tập","Choose a topic, length and language; then chat or practise writing with AI Tutor.":"Chọn chủ đề, độ dài và ngôn ngữ; sau đó trò chuyện hoặc luyện viết với AI Tutor.",
    "中文 · English":"中文 · Tiếng Việt","💬 Direct Teacher–Student Messages":"💬 Tin nhắn trực tiếp Giáo viên–Học viên","Contacts":"Liên hệ","📢 Broadcast to all students":"📢 Gửi thông báo cho tất cả học viên",
    "Select a contact to start chatting":"Chọn một liên hệ để bắt đầu trò chuyện","No conversation selected.":"Chưa chọn cuộc trò chuyện.","👩‍🏫 Teacher Dashboard":"👩‍🏫 Bảng điều khiển giáo viên",
    "➕ Add new vocabulary":"➕ Thêm từ vựng mới","👥 Student list":"👥 Danh sách học viên","📚 Teacher-added words":"📚 Từ do giáo viên thêm","📊 Learning Progress":"📊 Tiến độ học tập",
    "Track your HSK 1–3 mastery journey":"Theo dõi quá trình làm chủ HSK 1–3","Added words":"Từ đã thêm","Remembered":"Đã nhớ","Not yet":"Chưa nhớ","Due now":"Đến hạn ôn",
    "mastered words":"từ đã thành thạo","culture / character breakdown":"văn hóa / chiết tự","📅 Learning activity":"📅 Hoạt động học","Less":"Ít","More":"Nhiều","7 days":"7 ngày","30 days":"30 ngày",
    "🎓 Retention rubric (SM-2 detail)":"🎓 Rubric ghi nhớ (chi tiết SM-2)","📋 Activity history":"📋 Lịch sử hoạt động","No activity yet":"Chưa có hoạt động","🏅 Saved certificates":"🏅 Chứng nhận đã lưu",
    "AI features are grouped here to avoid overlap with teacher messages.":"Các tính năng AI được nhóm tại đây để không trùng với tin nhắn giáo viên.",
    "📖 To look up a word or ask AI for an explanation, select a word in a lesson then press the lookup button.":"📖 Để tra từ hoặc hỏi AI giải thích, hãy chọn từ trong bài học rồi nhấn nút tra cứu.",
    "AI Coach · uses studied HSK1-3 vocabulary":"AI Coach · sử dụng từ HSK1–3 đã học","🐼 is typing...":"🐼 đang nhập...","Type Chinese or English...":"Nhập tiếng Trung hoặc tiếng Việt...",
    "Home":"Trang chủ","Dictionary":"Từ điển","Practice":"Luyện tập","Progress":"Tiến độ","Phonetics":"Ngữ âm","Messages":"Tin nhắn","Teacher":"Giáo viên",
    "Close":"Đóng","Exit":"Thoát","Back":"Quay lại","Start":"Bắt đầu","Continue":"Tiếp tục","Completed":"Đã hoàn thành","Open":"Mở","Retry":"Làm lại",
    "Check":"Kiểm tra","Check answer":"Kiểm tra đáp án","Answer":"Đáp án","Correct":"Đúng","Incorrect":"Sai","Score":"Điểm","Question":"Câu hỏi","Result":"Kết quả","Guide":"Hướng dẫn","Save":"Lưu","Saved":"Đã lưu","Listen":"Nghe",

    /* AI Coach task shell */
    "Excel curriculum task:":"Nhiệm vụ theo lộ trình Excel:","Preparing task…":"Đang chuẩn bị nhiệm vụ…","Preparing today's task…":"Đang chuẩn bị nhiệm vụ hôm nay…",
    "AI Coach Task":"Nhiệm vụ AI Coach","🎼 AI Coach Phonetics Core Lab":"🎼 AI Coach · Phòng luyện ngữ âm","🔁 AI Coach SRS Due Review":"🔁 AI Coach · Ôn SRS đến hạn",
    "📚 AI Coach Excel Vocabulary Lab":"📚 AI Coach · Từ vựng theo lộ trình Excel","📖 AI Coach Reading / Writing Lab":"📖 AI Coach · Đọc / Viết","🔄 AI Coach Mistake Review":"🔄 AI Coach · Ôn lỗi sai",
    "🗣️ AI Coach Speaking · Read-aloud Lab":"🗣️ AI Coach · Nói / Đọc thành tiếng","🎧 AI Coach Listening Lab":"🎧 AI Coach · Luyện nghe",
    "Review due SRS vocabulary.":"Ôn các từ SRS đã đến hạn.","Complete today's Reading / Writing assignment.":"Hoàn thành nhiệm vụ Đọc / Viết hôm nay.",
    "Phonetics-linked vocabulary examples for this Bootcamp Day.":"Các ví dụ từ vựng gắn với ngữ âm của ngày Bootcamp này.","Record the assigned read-aloud task.":"Ghi âm nhiệm vụ đọc thành tiếng được giao.","Complete the assigned task.":"Hoàn thành nhiệm vụ được giao.",

    /* Phonetics */
    "PINYIN BOOTCAMP · OBJECTIVE TASK":"PINYIN BOOTCAMP · BÀI NHẬN DIỆN ÂM","Listen and choose the correct answer.":"Nghe và chọn đáp án đúng.",
    "Listen and choose the tone of the first syllable.":"Nghe và chọn đáp án đúng.","Listen and choose the matching Pinyin.":"Nghe và chọn Pinyin phù hợp.",
    "This is a standalone AI Coach phonetics task. It uses the Day's linked pronunciation examples; it is not the main Pinyin Tone Quest.":"Đây là nhiệm vụ ngữ âm độc lập của AI Coach, sử dụng ví dụ phát âm liên kết với ngày học; không phải Pinyin Tone Quest chính.",
    "Listen first, then choose the matching Hanzi and Pinyin. This is a standalone AI Coach phonetics task; it is not the main Pinyin Tone Quest.":"Nghe audio trước, sau đó chọn chữ Hán và Pinyin tương ứng. Đây là nhiệm vụ ngữ âm độc lập của AI Coach, không phải Pinyin Tone Quest chính.",
    "Tone 1 — high and level":"Thanh 1 — cao và ngang","Tone 2 — rising":"Thanh 2 — đi lên","Tone 3 — low/dipping with recovery":"Thanh 3 — thấp, hạ rồi hồi lên","Tone 4 — sharp falling":"Thanh 4 — hạ mạnh","Neutral tone — short and light":"Thanh nhẹ — ngắn và nhẹ","Tone pattern not identified":"Chưa xác định được mẫu thanh điệu",
    "Phonetics recognition":"Nhận diện ngữ âm","Sound evidence":"Bằng chứng âm thanh","Tone cue":"Gợi ý thanh điệu","Finish Phonetics":"Hoàn thành Ngữ âm",

    /* SRS / Vocabulary */
    "SRS due review":"Ôn SRS đến hạn","No vocabulary is due right now. The SRS task is verified for this Day.":"Hiện không có từ nào đến hạn. Nhiệm vụ SRS của ngày này được xác nhận hoàn thành.",
    "Type the Hanzi from memory.":"Nhập chữ Hán từ trí nhớ.","Type Hanzi":"Nhập chữ Hán","Finish SRS":"Hoàn thành SRS","Recall evidence":"Bằng chứng ghi nhớ","SRS consequence":"Tác động đến SRS",
    "RECALL SUCCESS":"NHỚ ĐÚNG","RELEARNING NEEDED":"CẦN HỌC LẠI","Choose the correct meaning.":"Chọn nghĩa chính xác.","Vocabulary meaning":"Nghĩa từ vựng","Word analysis":"Phân tích từ",
    "Finish vocabulary":"Hoàn thành từ vựng","Phonetics-linked vocabulary":"Từ vựng gắn với ngữ âm","Excel vocabulary":"Từ vựng theo Excel",

    /* Reading / writing */
    "Read and choose the best meaning.":"Đọc và chọn nghĩa phù hợp nhất.","Writing is graded with five teacher criteria: task completion, organization, grammar, vocabulary, and naturalness/style.":"Bài viết được chấm theo 5 tiêu chí: hoàn thành nhiệm vụ, tổ chức, ngữ pháp, từ vựng và độ tự nhiên/phong cách.",
    "Write a complete Chinese sentence":"Viết một câu tiếng Trung hoàn chỉnh","Compare & grade":"So sánh và chấm điểm","Type Pinyin with tone marks":"Nhập Pinyin có dấu thanh","READING / WRITING · TEACHER-GRADED TASK":"ĐỌC / VIẾT · CHẤM THEO RUBRIC",
    "Finish Reading / Writing":"Hoàn thành Đọc / Viết","Reading comprehension":"Đọc hiểu","Pinyin writing":"Viết Pinyin","Reading / Writing":"Đọc / Viết","Answer evidence":"Bằng chứng đáp án",
    "Best meaning":"Nghĩa phù hợp nhất","Target vocabulary":"Từ vựng mục tiêu","Evidence from your sentence":"Bằng chứng từ câu bạn viết","Required corrections / cautions":"Nội dung cần sửa / lưu ý","Teacher notes":"Ghi chú của giáo viên",

    /* Mistake review */
    "Mistake review":"Ôn lỗi sai","No reviewable unresolved items are currently in the queue.":"Hiện không có lỗi chưa giải quyết nào cần ôn.","MISTAKE REVIEW · ACTUAL RETRY":"ÔN LỖI SAI · LÀM LẠI THỰC TẾ",
    "Redo this item.":"Làm lại câu này.","Original prompt":"Câu hỏi ban đầu","Previous answer":"Đáp án trước","Type the correct answer":"Nhập đáp án đúng","Finish review batch":"Hoàn thành lượt ôn","Next mistake →":"Lỗi tiếp theo →",
    "Mistake correction":"Sửa lỗi","STILL UNRESOLVED":"CHƯA SỬA XONG","RESOLVED":"ĐÃ SỬA","Attempt history":"Lịch sử làm bài","No previous answer text was stored.":"Không lưu được nội dung đáp án trước đó.",

    /* Listening / Speaking */
    "Which meaning best matches the audio?":"Nghĩa nào phù hợp nhất với audio?","Replay audio":"Nghe lại audio","What the audio contained":"Nội dung audio","Answer comparison":"So sánh đáp án","Curriculum model sentence":"Câu mẫu theo lộ trình",
    "Finish Listening":"Hoàn thành bài nghe","Start recording":"Bắt đầu ghi âm","Stop & grade":"Dừng và chấm điểm","Play model":"Nghe mẫu","Replay my recording":"Nghe lại bản ghi","Record again":"Ghi âm lại","Finish Speaking":"Hoàn thành bài nói","Next card →":"Thẻ tiếp theo →",
    "Recording… read the full target naturally, then press Stop & grade.":"Đang ghi âm… hãy đọc tự nhiên toàn bộ câu mục tiêu, sau đó nhấn Dừng và chấm điểm.","Microphone permission is required. Please allow microphone access and try again.":"Cần quyền truy cập microphone. Hãy cho phép rồi thử lại.",
    "Microphone permission is required for this speaking task.":"Nhiệm vụ nói cần quyền truy cập microphone.","Building canonical WAV and analyzing pronunciation…":"Đang tạo WAV chuẩn và phân tích phát âm…","Analyzing pronunciation…":"Đang phân tích phát âm…",
    "No usable audio was captured. Please record again.":"Không thu được audio hợp lệ. Vui lòng ghi âm lại.","Ready to record again.":"Sẵn sàng ghi âm lại.","No score saved for this card.":"Không lưu điểm cho thẻ này.",
    "Acoustic-only grading":"Chấm chỉ dựa trên âm học","ASR + acoustic grading":"Chấm bằng ASR + âm học","FULL COMPATIBILITY":"TƯƠNG THÍCH HOÀN TOÀN","AUDIO-ONLY RUBRIC":"RUBRIC CHỈ DỰA TRÊN ÂM THANH","RUBRIC ANALYSIS":"PHÂN TÍCH THEO RUBRIC","PRONUNCIATION RUBRIC":"RUBRIC PHÁT ÂM",
    "Tone /35":"Thanh điệu /35","Initial–final /35":"Âm đầu–vần /35","Articulation /20":"Cấu âm /20","Fluency /10":"Độ trôi chảy /10","Recognized":"Nhận diện được","Target":"Mục tiêu","Signal quality":"Chất lượng tín hiệu","Estimated syllables":"Số âm tiết ước lượng",

    /* Teacher feedback */
    "Teacher feedback":"Nhận xét của giáo viên","Teacher summary":"Tổng kết của giáo viên","Overall comment":"Nhận xét tổng quan","Model / reference":"Mẫu / tham chiếu","Next practice":"Bài luyện tiếp theo","Analysis":"Phân tích",
    "Overall":"Tổng quan","Strongest evidence":"Bằng chứng mạnh nhất","Priority correction":"Ưu tiên cần sửa","Priority practice":"Ưu tiên luyện tập","Why":"Giải thích","Why this score":"Lý do cho điểm","Your answer vs target":"Câu trả lời và đáp án mục tiêu",
    "Your answer":"Câu trả lời của bạn","Your choice":"Lựa chọn của bạn","Correct answer":"Đáp án đúng","Correct meaning":"Nghĩa đúng","Hanzi":"Chữ Hán","Pinyin":"Pinyin","Meaning":"Nghĩa","Target word":"Từ mục tiêu","Sentence":"Câu","Required word":"Từ bắt buộc",
    "Chinese characters detected":"Số chữ Hán nhận diện","Base-syllable similarity":"Độ tương đồng âm tiết cơ sở","Target tone(s)":"Thanh điệu mục tiêu","Current retry":"Lần làm lại hiện tại","Expected answer":"Đáp án mong đợi",
    "CORRECT — EXPLAINED":"ĐÚNG — CÓ GIẢI THÍCH","INCORRECT — EXPLAINED":"SAI — CÓ GIẢI THÍCH","REVIEW SOUND":"CẦN ÔN ÂM","EXCELLENT":"XUẤT SẮC","GOOD":"TỐT","PASS":"ĐẠT","REVISE":"CẦN SỬA",
    "Task /20":"Hoàn thành nhiệm vụ /20","Organization /20":"Bố cục /20","Grammar /30":"Ngữ pháp /30","Vocabulary /15":"Từ vựng /15","Naturalness /15":"Độ tự nhiên /15",
    "✓ Verified — green check saved":"✓ Đã xác nhận — đã lưu dấu tích xanh","Score passed, but evidence was not saved":"Điểm đạt nhưng evidence chưa được lưu","Needs another attempt":"Cần làm lại","Return to AI Coach":"Quay lại AI Coach","Redo task":"Làm lại nhiệm vụ",
    "Pass mark":"Ngưỡng đạt","Save error":"Lỗi lưu dữ liệu","No reliable transcript":"Không có bản nhận dạng đủ tin cậy","Unavailable — acoustic-only grading":"Không khả dụng — chấm chỉ dựa trên âm học",

    /* Common explanatory sentences */
    "Both syllable spelling and tone marks match the target.":"Cả cách viết âm tiết và dấu thanh đều khớp với mục tiêu.","The base syllable is recognized correctly.":"Âm tiết cơ sở được nhận diện đúng.","Some initials/finals or syllable letters differ from the target.":"Một số âm đầu, vần hoặc chữ cái của âm tiết khác với mục tiêu.",
    "Write the Pinyin once more from memory without looking.":"Hãy viết lại Pinyin một lần từ trí nhớ mà không nhìn đáp án.","Keep the same letters, but rebuild the tone marks from the spoken contour.":"Giữ nguyên chữ cái nhưng xác định lại dấu thanh từ đường cao độ nghe được.","Separate the syllable into initial + final, then add the tone after the spelling is secure.":"Tách âm tiết thành âm đầu + vần, sau đó thêm thanh điệu khi đã chắc cách viết.",
    "Initial/final spelling matches the target base syllable.":"Cách viết âm đầu/vần khớp với âm tiết mục tiêu.","The base syllable spelling does not fully match the target.":"Cách viết âm tiết cơ sở chưa khớp hoàn toàn với mục tiêu.","Tone mark sequence matches.":"Chuỗi dấu thanh khớp.","Tone mark sequence is different or incomplete.":"Chuỗi dấu thanh khác hoặc chưa đầy đủ.",
    "Sentence-ending punctuation is present.":"Câu có dấu kết thúc phù hợp.","No Chinese sentence-ending punctuation was detected.":"Chưa phát hiện dấu kết thúc câu tiếng Trung.","No high-confidence local grammar error was detected. The sentence is still evaluated against the task rather than assumed perfect.":"Chưa phát hiện lỗi ngữ pháp cục bộ có độ tin cậy cao. Câu vẫn được đánh giá theo yêu cầu nhiệm vụ, không mặc định là hoàn hảo.",
    "The selected option is a distractor from the vocabulary pool and does not match this word.":"Lựa chọn này là phương án nhiễu trong kho từ vựng và không khớp với từ mục tiêu.","The selected option is a distractor from the vocabulary pool rather than the meaning of this sentence.":"Lựa chọn này là phương án nhiễu từ kho từ vựng, không phải nghĩa của câu.",
    "The chosen meaning matches the curriculum translation/context for this model sentence.":"Nghĩa đã chọn phù hợp với bản dịch/ngữ cảnh của câu mẫu trong lộ trình.","The audio was heard, but the selected meaning does not match the curriculum sentence.":"Bạn đã nghe audio nhưng nghĩa đã chọn không khớp với câu trong lộ trình.","Your choice matches the sentence meaning.":"Lựa chọn của bạn khớp với nghĩa câu.","The selected option is a distractor; it does not match the sentence that was played.":"Lựa chọn này là phương án nhiễu; không khớp với câu đã phát.",
    "The current retry matches the stored expected answer closely enough to resolve the mistake.":"Lần làm lại hiện tại khớp đủ gần với đáp án mong đợi để đánh dấu lỗi đã được sửa.","The current retry is still outside the accepted match range, so marking it resolved would hide a real learning gap.":"Lần làm lại hiện tại vẫn ngoài phạm vi chấp nhận; đánh dấu đã sửa lúc này có thể che mất lỗ hổng học tập thực tế.",
    "Tone contours are strong and close to the target.":"Đường thanh điệu rõ và gần với mục tiêu.","Most tone directions are usable, but one or more contours need clearer height/slope.":"Phần lớn hướng thanh điệu đạt yêu cầu, nhưng một số đường cao độ cần rõ hơn.","Tone direction is inconsistent; practise syllable by syllable first.":"Hướng thanh điệu chưa ổn định; hãy luyện từng âm tiết trước.","Tone evidence is weak or conflicts with the target pattern.":"Bằng chứng thanh điệu còn yếu hoặc không khớp mẫu mục tiêu.",
    "Initial/final identity is strongly supported by recognition.":"Âm đầu/vần được nhận dạng hỗ trợ tốt.","Most syllable content is recognized, with some segmental uncertainty.":"Phần lớn nội dung âm tiết được nhận diện, nhưng vẫn có một số bất định về âm đoạn.","No reliable transcript was available, so initial/final identity is only estimated from acoustic timing.":"Không có transcript đủ tin cậy nên âm đầu/vần chỉ được ước lượng từ đặc trưng thời gian âm học.","Several recognized syllables differ from the target; rebuild initials/finals slowly.":"Một số âm tiết nhận diện khác mục tiêu; hãy luyện lại âm đầu/vần chậm hơn.",
    "Acoustic clarity is stable.":"Độ rõ âm học ổn định.","Clarity is usable but consonant/vowel definition can be sharper.":"Độ rõ đạt yêu cầu nhưng ranh giới phụ âm/nguyên âm có thể rõ hơn.","Acoustic evidence suggests blurred or unstable articulation; microphone-only scoring cannot directly see tongue/lip position.":"Bằng chứng âm học cho thấy cấu âm chưa rõ hoặc chưa ổn định; chấm bằng microphone không quan sát trực tiếp vị trí lưỡi/môi.",
    "Pacing and continuity are natural for this target.":"Nhịp độ và độ liền mạch tự nhiên với câu mục tiêu.","The sentence is understandable but timing/pauses are uneven.":"Câu vẫn hiểu được nhưng thời lượng/khoảng dừng chưa đều.","Speech is too fragmented or timing differs substantially from the target.":"Lời nói còn rời rạc hoặc thời lượng khác đáng kể so với mục tiêu.",
    "The read-aloud is close to the model across the available evidence.":"Bài đọc thành tiếng gần với mẫu trên các bằng chứng hiện có.","The sentence is mostly stable, with a small number of pronunciation weaknesses.":"Câu nhìn chung ổn định, còn một số ít điểm phát âm cần cải thiện.","The attempt passes, but at least one pronunciation component still needs focused practice.":"Lượt đọc đạt ngưỡng nhưng ít nhất một thành phần phát âm vẫn cần luyện tập có trọng tâm.","The recording is valid, but pronunciation is not yet stable enough for this target.":"Bản ghi hợp lệ nhưng phát âm chưa đủ ổn định với mục tiêu này.",
    "Replay the model and copy only the pitch direction first; then add the words.":"Nghe lại mẫu và bắt chước hướng cao độ trước, sau đó mới thêm từ.","Slow down and rebuild the unclear initial/final syllables before restoring normal speed.":"Giảm tốc độ và luyện lại những âm đầu/vần chưa rõ trước khi trở về tốc độ bình thường.","Read in short meaning groups, then reconnect them without long pauses.":"Đọc theo các cụm nghĩa ngắn rồi nối lại mà không dừng quá lâu.","Record one more attempt aiming for the same clarity at a slightly more natural pace.":"Ghi âm thêm một lần, giữ độ rõ nhưng dùng nhịp tự nhiên hơn một chút.",

    /* v57.1 full Vietnamese synchronization */
    "SRS · REAL RECALL":"SRS · TRUY HỒI THỰC TẾ","LEARN ALL EXCEL WORDS · PHASE 1/2":"HỌC TOÀN BỘ TỪ EXCEL · GIAI ĐOẠN 1/2","EXCEL VOCABULARY · SCORED QUIZ":"TỪ VỰNG EXCEL · BÀI CHẤM ĐIỂM",
    "Example":"Ví dụ","Start scored quiz →":"Bắt đầu bài chấm điểm →","Next word →":"Từ tiếp theo →","Finish vocabulary":"Hoàn thành từ vựng","Next mistake →":"Lỗi tiếp theo →",
    "No Excel vocabulary is assigned to this Day.":"Không có từ vựng Excel được giao cho ngày này.","No phonetics-linked items are available for this Day.":"Không có mục ngữ âm liên kết với ngày học này.",
    "No curriculum-linked audio items are available for this day.":"Không có mục nghe liên kết với lộ trình cho ngày này.","No curriculum-linked speaking cards are available for this day.":"Không có thẻ nói liên kết với lộ trình cho ngày này.",
    "LISTENING · AUDIO FIRST":"LUYỆN NGHE · NGHE TRƯỚC","The model audio plays automatically. Replay it as many times as needed, then choose one answer.":"Audio mẫu sẽ tự phát. Có thể nghe lại nhiều lần rồi chọn một đáp án.",
    "SPEAKING · LISTEN → READ → RECORD → SCORE":"LUYỆN NÓI · NGHE → ĐỌC → GHI ÂM → CHẤM","Record":"Ghi âm","Replay":"Nghe lại","Replay audio":"Nghe lại audio",
    "Listen to the model, then record the complete target.":"Nghe mẫu, sau đó ghi âm đầy đủ nội dung mục tiêu.","Recording graded. Replay it, compare with the model, then continue.":"Đã chấm bản ghi. Hãy nghe lại, so sánh với mẫu rồi tiếp tục.",
    "SRS recall":"Truy hồi SRS","Vocabulary meaning":"Nghĩa từ vựng","Listening comprehension":"Đọc hiểu nghe","Speaking / Read-aloud":"Nói / Đọc thành tiếng",
    "Recall evidence":"Bằng chứng truy hồi","SRS consequence":"Tác động đến SRS","Correct Hanzi":"Chữ Hán đúng","Word analysis":"Phân tích từ","Answer evidence":"Bằng chứng đáp án",
    "The existing SM-2 engine receives a successful recall grade, so the interval can expand.":"Bộ máy SM-2 nhận kết quả truy hồi thành công nên khoảng ôn có thể được kéo dài.",
    "The existing SM-2 engine receives a relearning grade, so this word remains due sooner instead of being treated as mastered.":"Bộ máy SM-2 nhận trạng thái cần học lại nên từ này sẽ đến hạn sớm hơn, không được xem là đã thành thạo.",
    "The selected meaning is the stored curriculum meaning for this word.":"Nghĩa đã chọn là nghĩa được lưu trong lộ trình cho từ này.",
    "Performance is consistently strong; focus on precision and naturalness.":"Kết quả ổn định; tiếp tục tập trung vào độ chính xác và tự nhiên.",
    "The core skill is working, but one or two recurring weaknesses still need targeted practice.":"Kỹ năng cốt lõi đã hình thành nhưng vẫn còn một vài điểm yếu cần luyện có mục tiêu.",
    "The task is passed, but the pattern is not yet stable enough for automatic production.":"Nhiệm vụ đã đạt ngưỡng nhưng mẫu kỹ năng chưa đủ ổn định để sử dụng tự động.",
    "The task needs another focused attempt before the skill is reliable.":"Cần thêm một lượt luyện tập có trọng tâm trước khi kỹ năng ổn định.",
    "Repeat the lowest-scoring item and explain the answer before moving on.":"Làm lại mục có điểm thấp nhất và tự giải thích đáp án trước khi tiếp tục.",
    "A repeated function word/particle was detected; remove the duplicate and reread the clause.":"Phát hiện từ chức năng/trợ từ bị lặp; hãy bỏ phần lặp và đọc lại mệnh đề.",
    "The 把 construction does not show a clear result, direction, location or completion marker.":"Cấu trúc 把 chưa thể hiện rõ kết quả, phương hướng, vị trí hoặc dấu hiệu hoàn thành.",
    "The response is too short to show a stable Chinese sentence structure.":"Câu trả lời quá ngắn để thể hiện cấu trúc câu tiếng Trung ổn định.",
    "Some Chinese content is present, but the required target word is missing.":"Có nội dung tiếng Trung nhưng thiếu từ mục tiêu bắt buộc.",
    "Fix the grammar issue identified above, then reread the sentence for Chinese word order.":"Sửa lỗi ngữ pháp đã nêu, sau đó đọc lại để kiểm tra trật tự từ tiếng Trung.",
    "Expand the sentence with a clear subject/context and finish it with natural punctuation.":"Mở rộng câu với chủ ngữ/ngữ cảnh rõ và kết thúc bằng dấu câu tự nhiên.",
    "Write a second sentence with the same target word in a different context to prove flexible use.":"Viết thêm một câu với cùng từ mục tiêu trong ngữ cảnh khác để chứng minh khả năng vận dụng.",
    "Full compatibility detected across content recognition and acoustic checks: 100/100.":"Phát hiện tương thích hoàn toàn giữa nhận dạng nội dung và kiểm tra âm học: 100/100.",
    "Full compatibility detected. The recognized Mandarin matches the target exactly: 100/100.":"Phát hiện tương thích hoàn toàn. Nội dung tiếng Trung được nhận dạng khớp chính xác mục tiêu: 100/100.",
    "The recording was captured, but Mandarin speech recognition could not verify the target. Replay the model, speak closer to the microphone and try again.":"Đã thu được bản ghi nhưng nhận dạng tiếng Trung chưa xác minh được mục tiêu. Hãy nghe lại mẫu, nói gần microphone hơn và thử lại.",
    "The recognized content differs substantially from the target. Rebuild the sentence slowly, then repeat with the model.":"Nội dung nhận dạng khác đáng kể so với mục tiêu. Hãy đọc lại câu chậm rồi lặp theo mẫu.",
    "The target is partly compatible. Focus on the mismatched syllables, tone direction and sentence rhythm.":"Nội dung chỉ tương thích một phần. Hãy tập trung vào âm tiết chưa khớp, hướng thanh điệu và nhịp câu.",
    "Very close. A small pronunciation or recognition mismatch remains; compare once more with the model.":"Rất gần. Vẫn còn sai lệch nhỏ về phát âm hoặc nhận dạng; hãy so sánh thêm một lần với mẫu.",
    "Tone contour is close to the target.":"Đường thanh điệu gần với mục tiêu.","Tone direction is mostly usable but needs clearer pitch movement.":"Hướng thanh điệu phần lớn đạt yêu cầu nhưng chuyển động cao độ cần rõ hơn.","Tone direction needs focused retraining.":"Hướng thanh điệu cần được luyện lại có trọng tâm.",
    "Initial/final content is strongly supported.":"Nội dung âm đầu/vần được hỗ trợ tốt.","Most syllables are supported, with some uncertainty.":"Phần lớn âm tiết được hỗ trợ nhưng vẫn có một số bất định.","Several syllables or segmental cues differ from the target.":"Một số âm tiết hoặc tín hiệu âm đoạn khác với mục tiêu.",
    "Acoustic clarity is strong.":"Độ rõ âm học tốt.","Clarity is usable but can be sharper.":"Độ rõ đạt yêu cầu nhưng có thể sắc nét hơn.","Clarity/articulation evidence is weak; microphone scoring is only an acoustic proxy for tongue/lip position.":"Bằng chứng độ rõ/cấu âm còn yếu; chấm bằng microphone chỉ là chỉ báo âm học gián tiếp cho vị trí lưỡi/môi.",
    "Rhythm and pacing are natural.":"Nhịp và tốc độ tự nhiên.","Pacing is understandable but uneven.":"Tốc độ vẫn hiểu được nhưng chưa đều.","The read-aloud is too fragmented or timing is unstable.":"Bài đọc thành tiếng còn rời rạc hoặc thời lượng chưa ổn định."
  }));

  const PATTERNS = [
    [/^Day (\d+)$/i,(_,n)=>`Ngày ${n}`],
    [/^Day (\d+) · (.+)$/i,(_,n,x)=>`Ngày ${n} · ${x}`],
    [/^(\d+) unresolved item\(s\) in the mistake queue\.$/i,(_,n)=>`${n} lỗi chưa xử lý trong hàng đợi ôn lỗi.`],
    [/^(.+) · objective recognition task for Day (\d+)\.$/i,(_,topic,n)=>`${topic} · bài nhận diện âm cho Ngày ${n}.`],
    [/^Learn the complete Excel vocabulary set assigned to Day (\d+) and feed actual answers into SRS\.$/i,(_,n)=>`Học đầy đủ bộ từ vựng Excel của Ngày ${n} và đưa kết quả thực tế vào SRS.`],
    [/^(\d+) of (\d+) objective items correct\.$/i,(_,a,b)=>`${a}/${b} câu nhận diện đúng.`],
    [/^(\d+) of (\d+) due words recalled correctly\. SM-2 was updated from these actual answers\.$/i,(_,a,b)=>`${a}/${b} từ đến hạn được nhớ đúng. SM-2 đã được cập nhật từ các câu trả lời thực tế.`],
    [/^(\d+) of (\d+) words correct\. Actual answers were saved into the existing SM-2 SRS engine\.$/i,(_,a,b)=>`${a}/${b} từ trả lời đúng. Câu trả lời thực tế đã được lưu vào bộ máy SRS SM-2.`],
    [/^(\d+) of (\d+) pronunciation-linked examples correct\. Day 1–10 does not add these items to general SRS\.$/i,(_,a,b)=>`${a}/${b} ví dụ gắn với phát âm đúng. Ngày 1–10 không đưa các mục này vào SRS từ vựng chung.`],
    [/^(\d+) curriculum-linked items completed with teacher-style feedback\.$/i,(_,n)=>`${n} mục theo lộ trình đã hoàn thành với phản hồi kiểu giáo viên.`],
    [/^(\d+) of (\d+) retry items corrected\. Remaining queue: (\d+)\.$/i,(_,a,b,c)=>`${a}/${b} lỗi đã được sửa. Còn ${c} lỗi trong hàng đợi.`],
    [/^(\d+) of (\d+) audio questions correct\. Each item includes an explanation and a targeted listening cue\.$/i,(_,a,b)=>`${a}/${b} câu nghe đúng. Mỗi câu có giải thích và gợi ý nghe có mục tiêu.`],
    [/^(\d+) of (\d+) cards received rubric scores\. Each graded card includes criterion-level teacher feedback\.$/i,(_,a,b)=>`${a}/${b} thẻ đã được chấm theo rubric. Mỗi thẻ có phản hồi chi tiết theo tiêu chí.`],
    [/^(\d+) of (\d+) cards were recorded and graded with criterion-level feedback\.$/i,(_,a,b)=>`${a}/${b} thẻ đã được ghi âm và chấm với phản hồi theo tiêu chí.`],
    [/^Your answer:\s*(.*)$/i,(_,x)=>`Câu trả lời của bạn: ${x}`],
    [/^Your choice:\s*(.*)$/i,(_,x)=>`Lựa chọn của bạn: ${x}`],
    [/^Correct answer:\s*(.*)$/i,(_,x)=>`Đáp án đúng: ${x}`],
    [/^Correct meaning:\s*(.*)$/i,(_,x)=>`Nghĩa đúng: ${x}`],
    [/^Best meaning:\s*(.*)$/i,(_,x)=>`Nghĩa phù hợp nhất: ${x}`],
    [/^Hanzi:\s*(.*)$/i,(_,x)=>`Chữ Hán: ${x}`],
    [/^Meaning:\s*(.*)$/i,(_,x)=>`Nghĩa: ${x}`],
    [/^Target:\s*(.*)$/i,(_,x)=>`Mục tiêu: ${x}`],
    [/^Tone cue:\s*(.*)$/i,(_,x)=>`Gợi ý thanh điệu: ${translateText(x)}`],
    [/^Target tone\(s\):\s*(.*)$/i,(_,x)=>`Thanh điệu mục tiêu: ${translateText(x)}`],
    [/^Base-syllable similarity:\s*(.*)$/i,(_,x)=>`Độ tương đồng âm tiết cơ sở: ${x}`],
    [/^Learner sentence:\s*(.*)$/i,(_,x)=>`Câu của người học: ${x}`],
    [/^Required word:\s*(.*)$/i,(_,x)=>`Từ bắt buộc: ${x}`],
    [/^Chinese characters detected:\s*(.*)$/i,(_,x)=>`Số chữ Hán nhận diện: ${x}`],
    [/^Previous answer:\s*(.*)$/i,(_,x)=>`Đáp án trước: ${x}`],
    [/^Current retry:\s*(.*)$/i,(_,x)=>`Lần làm lại hiện tại: ${x}`],
    [/^Expected answer:\s*(.*)$/i,(_,x)=>`Đáp án mong đợi: ${x}`],
    [/^Original prompt:\s*(.*)$/i,(_,x)=>`Câu hỏi ban đầu: ${x}`],
    [/^Recognized:\s*(.*)$/i,(_,x)=>`Nhận diện được: ${x}`],
    [/^Signal quality:\s*(.*)$/i,(_,x)=>`Chất lượng tín hiệu: ${x}`],
    [/^Estimated syllables:\s*(.*)$/i,(_,x)=>`Số âm tiết ước lượng: ${x}`],
    [/^Acoustic tone compatibility:\s*(.*)$/i,(_,x)=>`Độ tương thích thanh điệu âm học: ${x}`],
    [/^Pass mark:\s*(\d+)%\. This task records learning evidence only; Pinyin Tone Quest remains the only next-day unlock gate\.$/i,(_,n)=>`Ngưỡng đạt: ${n}%. Nhiệm vụ này chỉ ghi nhận evidence học tập; Pinyin Tone Quest vẫn là cổng duy nhất mở ngày tiếp theo.`],
    [/^✓ Verified — green check saved to Day (\d+)$/i,(_,n)=>`✓ Đã xác nhận — đã lưu dấu tích xanh cho Ngày ${n}`],
    [/^Type the tone-marked Pinyin for (.+)\.$/i,(_,x)=>`Nhập Pinyin có dấu thanh cho ${x}.`],
    [/^Type the Pinyin for (.+)\.$/i,(_,x)=>`Nhập Pinyin cho ${x}.`],
    [/^Write one Chinese sentence using “(.+)” \((.+)\)\.$/i,(_,a,b)=>`Viết một câu tiếng Trung sử dụng “${a}” (${b}).`],
    [/^Replay “(.+)” and trace the pitch direction: (.+)\.$/i,(_,a,b)=>`Nghe lại “${a}” và chú ý hướng cao độ: ${translateText(b)}.`],
    [/^Say “(.+)” slowly, separate its initial\/final, then locate the tone mark\.$/i,(_,a)=>`Đọc chậm “${a}”, tách âm đầu–vần rồi xác định dấu thanh.`],
    [/^The tone mark in (.+) corresponds to (.+)\.$/i,(_,a,b)=>`Dấu thanh trong ${a} tương ứng với ${translateText(b)}.`],
    [/^The correct learner transcription for this item is (.+); both syllable letters and the tone mark matter\.$/i,(_,a)=>`Pinyin đúng của mục này là ${a}; cả chữ cái âm tiết và dấu thanh đều quan trọng.`],
    [/^You retrieved “(.+)” from Pinyin\/meaning without seeing the Hanzi\.$/i,(_,x)=>`Bạn đã nhớ lại “${x}” từ Pinyin/nghĩa mà không nhìn chữ Hán.`],
    [/^The retrieval cue was recognized, but the Hanzi form “(.+)” was not recalled accurately\.$/i,(_,x)=>`Bạn nhận ra gợi ý nhưng chưa nhớ chính xác chữ Hán “${x}”.`],
    [/^Repeat the word once aloud, then let the normal SRS interval handle the next review\.$/i,()=>`Đọc to từ một lần rồi để khoảng ôn SRS bình thường xác định lần ôn tiếp theo.`],
    [/^Copy “(.+)” once while saying (.+); then close it and retrieve the Hanzi again\.$/i,(_,a,b)=>`Chép “${a}” một lần khi đọc ${b}; sau đó che lại và nhớ lại chữ Hán.`],
    [/^You matched “(.+)” \((.+)\) to its curriculum meaning\.$/i,(_,a,b)=>`Bạn đã ghép đúng “${a}” (${b}) với nghĩa trong lộ trình.`],
    [/^The form “(.+)” is not yet linked reliably to its meaning\.$/i,(_,x)=>`Dạng chữ “${x}” chưa được liên kết ổn định với nghĩa.`],
    [/^Read the sentence once more and retell the meaning without looking at the options\.$/i,()=>`Đọc lại câu một lần và tự nói nghĩa mà không nhìn các lựa chọn.`],
    [/^You corrected the item on a fresh retrieval attempt, so the mistake can be resolved\.$/i,()=>`Bạn đã sửa đúng ở lần truy hồi mới nên lỗi này có thể được đánh dấu đã giải quyết.`],
    [/^The retry still does not match the expected answer closely enough, so the mistake stays in the review queue\.$/i,()=>`Lần làm lại vẫn chưa khớp đủ với đáp án mong đợi nên lỗi tiếp tục nằm trong hàng đợi ôn tập.`],
    [/^Explain in your own words why the corrected answer works; this helps prevent the same error from returning\.$/i,()=>`Tự giải thích vì sao đáp án sửa là đúng để giảm khả năng lặp lại lỗi.`],
    [/^Recording could not be graded reliably: (.+)\. Record again; no low score is saved\.$/i,(_,x)=>`Không thể chấm bản ghi một cách tin cậy: ${x}. Hãy ghi âm lại; hệ thống không lưu điểm thấp giả tạo.`],
    [/^Speech recognition did not return a reliable transcript \((.+)\)\. This card was still graded from the canonical WAV using tone contour, syllable timing, signal clarity and fluency\. Audio-only grading is capped at 84\/100 because target word identity cannot be fully verified\.$/i,(_,x)=>`Nhận dạng giọng nói không trả về transcript đủ tin cậy (${x}). Thẻ vẫn được chấm từ WAV chuẩn dựa trên đường thanh điệu, thời gian âm tiết, độ rõ tín hiệu và độ trôi chảy. Điểm chỉ dựa trên audio được giới hạn tối đa 84/100 vì chưa thể xác minh đầy đủ từ mục tiêu.`]
  ];

  const textPairs = new WeakMap();
  const attrPairs = new WeakMap();
  let observer = null;
  let scheduled = false;
  const pending = new Set();

  function legacyVi(text){
    try { return window.PandaHanVietnameseMap?.[text] || ""; } catch (_) { return ""; }
  }
  function legacyEn(text){
    try { return window.PandaHanEnglishMap?.[text] || ""; } catch (_) { return ""; }
  }
  function translateText(text){
    const raw=String(text??""); const trim=raw.trim(); if(!trim) return raw;
    const direct=EXACT.get(trim) || legacyVi(trim); if(direct) return raw.replace(trim,direct);
    let out=trim;
    for(const [re,fn] of PATTERNS){ if(re.test(out)){ re.lastIndex=0; out=out.replace(re,fn); break; } }
    return raw.replace(trim,out);
  }
  function isProtected(parent){
    if(!parent) return true;
    return !!parent.closest("script,style,textarea,[data-keep-pinyin],[lang='zh'],.ptcs-pinyin,.ai-tutor-reading-pinyin,.pinyin,.pinyin-text");
  }
  function pairForNode(node){
    const parent=node.parentElement; const current=String(node.nodeValue||""); const trim=current.trim(); if(!trim) return null;
    const el=parent;
    if(el){
      const enAttr=el.getAttribute?.("data-lang-en"), viAttr=el.getAttribute?.("data-lang-vi");
      if(enAttr && viAttr) return {en:current.replace(trim,enAttr),vi:current.replace(trim,viAttr)};
    }
    const vi=translateText(current);
    if(vi!==current) return {en:current,vi};
    const en=legacyEn(trim);
    if(en) return {en:current.replace(trim,en),vi:current};
    return null;
  }
  function processText(node){
    const parent=node.parentElement; if(isProtected(parent)) return;
    let pair=textPairs.get(node);
    if(!pair){ pair=pairForNode(node); if(pair) textPairs.set(node,pair); }
    if(!pair) return;
    const wanted=window.LANG_MODE==="vi"?pair.vi:pair.en;
    if(node.nodeValue!==wanted) node.nodeValue=wanted;
  }
  function processAttributes(root){
    if(!root?.querySelectorAll) return;
    const els=[]; if(root.nodeType===1) els.push(root); els.push(...root.querySelectorAll("[placeholder],[aria-label],[title],[data-lang-en]"));
    els.forEach(el=>{
      let pair=attrPairs.get(el); if(!pair){ pair={};
        ["placeholder","aria-label","title"].forEach(attr=>{const val=el.getAttribute(attr); if(!val) return; const vi=translateText(val); const en=legacyEn(String(val).trim()); if(vi!==val) pair[attr]={en:val,vi}; else if(en) pair[attr]={en,vi:val};});
        const den=el.getAttribute("data-lang-en"), dvi=el.getAttribute("data-lang-vi"); if(den&&dvi) pair.__text={en:den,vi:dvi}; else if(den){const vi=translateText(den); if(vi!==den) pair.__text={en:den,vi};}
        attrPairs.set(el,pair);
      }
      ["placeholder","aria-label","title"].forEach(attr=>{if(pair[attr]) el.setAttribute(attr,window.LANG_MODE==="vi"?pair[attr].vi:pair[attr].en);});
      if(pair.__text && el.children.length===0){const v=window.LANG_MODE==="vi"?pair.__text.vi:pair.__text.en; if(el.textContent!==v) el.textContent=v;}
    });
  }
  function walkText(root){
    if(!root) return;
    if(root.nodeType===3){processText(root);return;}
    if(root.nodeType!==1 && root.nodeType!==9 && root.nodeType!==11) return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT); let n=walker.nextNode(); while(n){processText(n); n=walker.nextNode();}
    processAttributes(root);
    if(root.shadowRoot) apply(root.shadowRoot);
    root.querySelectorAll?.("*").forEach(el=>{if(el.shadowRoot)apply(el.shadowRoot)});
  }
  function apply(root=document.body){
    if(!root) return; walkText(root);
  }
  function scheduleApply(node){ pending.add(node||document.body); if(scheduled)return; scheduled=true; requestAnimationFrame(()=>{scheduled=false; const items=[...pending];pending.clear(); items.forEach(apply);}); }
  function startObserver(){
    if(observer||!document.body)return;
    observer=new MutationObserver(muts=>{for(const m of muts){for(const n of m.addedNodes){if(n.nodeType===1||n.nodeType===3)scheduleApply(n)}}});
    observer.observe(document.body,{childList:true,subtree:true});
  }

  window.PanTutorV57Vietnamese={apply,translateText,version:"v57.1-vi-sync-20260924"};
  window.addEventListener("pandahan-language-changed",()=>setTimeout(()=>apply(document.body),0));
  document.addEventListener("DOMContentLoaded",()=>{setTimeout(()=>{apply(document.body);startObserver();},30)});
  if(document.readyState!=="loading") setTimeout(()=>{apply(document.body);startObserver();},30);
})();
