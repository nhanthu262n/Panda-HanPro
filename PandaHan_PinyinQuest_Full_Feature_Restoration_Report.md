# Báo cáo khôi phục đầy đủ Pinyin Tone Quest

## Phạm vi

Bản này dùng `PandaHan_AI_Coach_ReadingWriting_Day31_20260828_Final.zip` làm mã nguồn web gốc và dùng `pinyin-tone-quest-updated-latest.zip` làm nguồn chức năng/nội dung Pinyin Tone Quest. Chỉ ba asset Quest offline và chuỗi version cache của loader được thay đổi; 38 tệp còn lại của web gốc được giữ nguyên byte-for-byte.

## Các điểm đã khôi phục

| Hạng mục | Kết quả |
|---|---:|
| Bộ dữ liệu Quest nguồn | 105 ngày nguồn, Ngày 16–120 |
| Bộ Hán tự đầu lộ trình | 15 ngày, 300 câu |
| Tổng câu nguồn ngày 16–120 | 4.174 câu |
| Số câu/ngày sau tích hợp | Không còn cắt cố định 25 câu; dao động 22–73 theo dữ liệu nguồn |
| Đủ nghe–nói–đọc–viết | 105/105 ngày nguồn |
| Nói | Có ghi âm microphone, nghe lại, speech recognition tiếng Trung và AI chấm rubric |
| Đọc | Có nhiệm vụ đọc, ghi âm, speech recognition và AI chấm rubric |
| Viết | Có ô nhập, AI chấm viết/ngữ pháp/dịch và rubric cục bộ dự phòng |
| Dịch Trung–Anh | Có nút dịch AI cho passage/prompt/câu Hán tự |
| Tiến độ | Giữ cầu nối `PANDAHAN_QUEST_PROGRESS` và lưu local theo namespace người dùng |
| Audio | Giữ 1.932 khóa audio nhúng và cơ chế phát offline |

## Bảo toàn ngoài phạm vi

Các thuật toán schedule, AI Coach hiện có, auth, Firebase Functions hiện có, tiến độ ngoài Quest, chat, giao diện web chính và toàn bộ 38 tệp không thuộc Quest không bị chỉnh sửa. Loader vẫn dùng cơ chế ghép ba phần offline; chỉ version query được cập nhật để chống cache bản cũ.

## Kiểm thử

Artifact runtime đã vượt qua `node --check`. Ba phần Quest ghép lại khớp byte-for-byte với artifact được sinh. Firebase Functions gốc cũng vượt qua `node --check`. Báo cáo máy sinh ghi nhận: `sourceDays=105`, `sourceItems=4174`, `hanziQuestions=300`, `allFourSkillDays=105`, `hasWritingAI=true`, `hasSpeakingAI=true`, `hasReadingAI=true`, `hasTranslation=true`, `hasProgressBridge=true`.

## Lưu ý vận hành

AI chấm và dịch dùng endpoint `aiChat` hiện có của web gốc, yêu cầu người học đã đăng nhập và Firebase Functions đã được triển khai với secret AI hiện hành. Khi AI hoặc microphone không khả dụng, giao diện báo rõ trạng thái và dùng fallback cục bộ ở phần viết; không tự động ghi nhận hoàn thành giả.
