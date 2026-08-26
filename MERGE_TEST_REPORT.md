# Báo cáo hợp nhất PandaHán

## Nền tảng và phạm vi

Bản tổng hợp sử dụng `PandaHan_AI_Coach_Vocab60_Sequence_MistakeGate_Final` làm nền. Toàn bộ các module chấm điểm, adaptive-learning, phân bổ nhiệm vụ, schedule gate, Quest UI/loader, Firebase/auth và nhắn tin giáo viên được giữ từ bản nền.

Từ `PandaHan_Coach_Quest_Sync_20260826_Final`, bản tổng hợp tích hợp phần AI Teacher đổi thành AI Tutor, workspace luyện tập trên tab/thanh tiêu đề, thư viện chủ đề HSK, chủ đề nâng cao, gói ngữ pháp Offline, Tutor-aware response helpers, SRS tự nguyện và highlight có phạm vi riêng cho đoạn đọc/hội thoại AI Tutor.

## Kiểm thử đã thực hiện

| Hạng mục | Kết quả |
|---|---|
| Kiểm tra cú pháp các JavaScript độc lập | PASS |
| Route tab AI Teacher/AI Tutor mở workspace | PASS |
| Workspace AI Tutor và heading giao diện | PASS |
| Nạp thư viện HSK cơ bản/nâng cao và grammar pack | PASS |
| API `formatTopicForTutor` và Tutor-aware reply | PASS |
| Tutor SRS và đoạn đọc tương tác | PASS |
| Scoped highlight cho AI Tutor | PASS |
| Adaptive-learning engine giữ nguyên byte | PASS |
| Schedule engine giữ nguyên byte | PASS |
| Quest UI và Quest loader giữ nguyên byte | PASS |

Các file mảnh `pinyin-phonetics.part-*.js` là dữ liệu được nạp ghép theo thiết kế ban đầu, nên không được kiểm tra như JavaScript độc lập.

## Các file được chỉnh có chủ đích

`index.html`, `css/style.css`, `js/app-02.js`, `js/app-03.js`, `js/daily-missions.js`, cùng ba module nội dung mới: `js/hsk-topic-library.js`, `js/hsk-topic-library-advanced.js`, `js/ai-tutor-grammar-pack.js`.
