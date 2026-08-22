# PandaHán Pro — Full Code Audit Report

## Phạm vi

Bản kiểm tra này được thực hiện trên ZIP `PandaHan_Recovery_SourceAuth_Final(1).zip`, sau đó sửa trên một bản sao trong workspace. Không có thao tác đăng nhập, ghi dữ liệu học viên hoặc thay đổi Firebase production.

## Kết quả tổng quan

Bản sau sửa đạt **34/34 kiểm tra tự động**. Toàn bộ JavaScript chính, Cloud Functions, cấu hình JSON và bundle Ngữ âm nối đủ năm phần đều qua kiểm tra cú pháp. Firebase runtime local khởi tạo một app duy nhất với đúng project `pandahanpro` và đúng `appId` được cung cấp.

| Nhóm kiểm tra | Kết quả |
|---|---|
| JavaScript chính và Functions | PASS |
| Bundle Ngữ âm nối 5 part | PASS |
| JSON config, RTDB Rules, curriculum | PASS |
| Firebase runtime local | PASS |
| Auth overlay và Offline fallback | PASS |
| Practice còn đúng HSK3 + Quest | PASS |
| Quest 120 ngày và gate ngày học | PASS |
| Adaptive schedule 7 ca biên | 7/7 PASS |
| File local vượt 100 MB | Không có |

## Các điểm đã sửa

### Firebase/Auth configuration

`app-01.js` và `firebase-boot.js` hiện dùng cùng một Firebase Web API key, `projectId`, `authDomain`, `databaseURL` và `appId`. Runtime local xác nhận `firebase.apps.length === 1`, `projectId === "pandahanpro"` và app ID đúng. Đây là điều kiện cần để tránh việc hai bootstrap dùng hai cấu hình khác nhau.

### Auth bridge

Auth bridge không còn ghi vào path RTDB `studentProfiles/{uid}` không được dùng trong schema hiện tại. `app-01.js` giữ listener chính cho profile và `completeLogin`; `auth-bridge.js` chỉ phụ trách notification và schedule services, tránh ghi hồ sơ/khởi tạo app lặp.

### Cloud Function và idempotency

Notification gia hạn, review log và kế hoạch hằng ngày dùng ID xác định theo ngày và sequence/source day. Cron retry hoặc chạy lặp cùng ngày không tạo thêm bản ghi trùng. Scheduled Function vẫn dùng `Asia/Ho_Chi_Minh`, `retryCount: 3` và `maxInstances: 1`.

### Firestore Rules

Rules đã bổ sung lại `studentProgress` và `quizResults`, giữ kiểm tra `request.resource.data.stats is map`, giới hạn teacher thường không được đổi role profile, và phân quyền notification theo `userId`. RTDB Rules vẫn là file riêng `database.rules.json`; không trộn Firestore Rules vào RTDB.

### Asset và bundle

Tham chiếu `icon-192.png` bị thiếu đã được gỡ khỏi HTML để không tạo 404 cố định. Năm part Ngữ âm chỉ được kiểm tra sau khi nối theo đúng thứ tự loader; từng part riêng lẻ không phải một file JS độc lập vì chúng được cắt giữa câu lệnh. Bundle nối hoàn chỉnh qua `node --check`.

## Kiểm tra trình duyệt local

Trang login hiển thị Google, email/password và Offline fallback; console không có lỗi. Chế độ Offline mở được app chính. Practice chỉ còn hai thẻ HSK3 và Pinyin Tone Quest. Quest tải xong hiển thị lịch 120 ngày, mở ngày 1 và khóa ngày 2 trở đi khi chưa hoàn thành buổi trước. Tab Ngữ âm tải đủ `5/5 phần`, hiển thị Pinyin Bootcamp và mở buổi 1, khóa các buổi sau.

## Adaptive schedule

Bộ test lõi đạt các ca: pass ngày thường, locked guard, repeat daily, weekly review repeat, monthly review, missed day 120 tạo day 121 idempotent và timezone `Asia/Ho_Chi_Minh`.

## Giới hạn cần biết trước production

RTDB Rules hiện vẫn cho học viên ghi toàn bộ `studentSchedules/{uid}` để tương thích với client hiện tại. Điều này cho phép client lý thuyết tự sửa trạng thái unlocked; gate trong giao diện và state machine vẫn chặn luồng hợp lệ, nhưng chưa phải mô hình chống gian lận server-side tuyệt đối. Muốn khóa cứng production, cần chuyển thao tác submit điểm sang callable Cloud Function hoặc một endpoint server xác thực, sau đó hạn chế quyền ghi trực tiếp schedule.

Firebase CLI/Emulator không có sẵn trong workspace này, nên Rules chưa được deploy hoặc chạy bằng Emulator. Việc deploy cần thực hiện trong đúng Firebase project sau khi kiểm tra `firebase use <project-id>`. Cloud Functions cũng không chạy trên GitHub Pages nếu chưa deploy riêng bằng Firebase CLI.

Tài khoản chỉ có Google provider phải đăng nhập bằng nút Google. Email/password chỉ hoạt động khi tài khoản đã được tạo hoặc liên kết thêm provider Email/Password.

## Kết luận

Bản sau sửa ổn định hơn đáng kể và không còn lỗi API key/config mismatch trong các file kiểm tra, lỗi ghi RTDB path không tồn tại, side effect cron push trùng, collection progress/quiz thiếu Rules hoặc asset icon 404. Có thể dùng để kiểm thử và deploy có kiểm soát; trước production nên xử lý thêm quyền ghi schedule bằng server-side function và xác thực Rules bằng Firebase Emulator.

## Bổ sung kiểm tra Auth overlay sau logout/F5

Audit tiếp theo phát hiện một lỗi giao diện trong nhánh chưa xác thực: CSS đặt `#proAuthOverlay` ở `display:none`, trong khi `app-01.js` chỉ ẩn `#app` khi `onAuthStateChanged` nhận `user === null` mà không bật lại overlay. `app-02.js` cũng chỉ ẩn app trong nhánh khởi tạo chưa xác thực. Kết quả là người dùng mới hoặc người vừa đăng xuất chỉ nhìn thấy nền hoa.

Đã sửa tối thiểu hai vị trí: nhánh `user === null` trong `app-01.js` nay đặt overlay thành `display:flex`, và nhánh chưa xác thực trong `DOMContentLoaded` của `app-02.js` cũng đặt overlay thành `display:flex`. Không sửa nội dung học tập, Practice, Quest, Ngữ âm hoặc schedule.

Kiểm tra local sau sửa xác nhận `overlayDisplay: "flex"`, `overlayVisibility: "visible"`, `appDisplay: "none"` và `firebase.auth().currentUser: null`. Trang login hiển thị đúng với người dùng mới.
## Bổ sung trợ lý người mới và nhắc học cuối ngày
Đã thêm `js/first-time-guide.js` và vùng giao diện `#firstLearnerGuide`. Trợ lý hoạt động offline, không chứa API key, tự hiển thị lần đầu theo từng tài khoản hoặc khách Offline, có nút bỏ qua/đóng/mở lại và hướng dẫn sáu bước: lộ trình 120 ngày, buổi đang mở, Ngữ âm, Luyện tập, Pinyin Tone Quest và chuông Thông báo/tin nhắn Giáo viên. Trợ lý đọc schedule hiện tại để hiển thị đúng ngày và chủ đề đang mở; trạng thái đã xem được lưu theo user scope trong localStorage.

Đã thêm `dailyIncompleteStudyReminder` trong `functions/index.js`, chạy lúc 20:00 theo `Asia/Ho_Chi_Minh`. Function tìm sequence đang `unlocked` chưa hoàn thành, ghi một notification cố định `study_reminder_<date>_<sequence>` vào RTDB và, nếu có quan hệ `studentTeachers/{uid}`, ghi một message cố định cùng ID vào Firestore chat. Cách đặt ID này giúp retry không tạo nhiều tin nhắn trùng. Job 00:00 hiện có tiếp tục xử lý extension/gia hạn và kế hoạch ngày mới.

Kiểm thử mới `test_onboarding_reminders.js` đạt PASS cho markup, nội dung hướng dẫn 120 ngày/Ngữ âm/Quest, trạng thái đã xem, không có API key phía client, cron 20:00 Việt Nam, RTDB notification, Firestore teacher reminder và deterministic reminder ID. Browser local cũng xác nhận modal hiển thị ở chế độ Offline, bước 2 lấy đúng ngày 1/chủ đề Pinyin hiện tại và nút `Mở Tiến độ` điều hướng đúng tab.

Tính năng nhắc tự động chỉ chạy khi Firebase Functions được deploy riêng; GitHub Pages không tự chạy được cron. Việc deploy production chưa được thực hiện và không có dữ liệu Firebase production nào được ghi trong quá trình audit.


## Bổ sung: chuyển ngôn ngữ toàn trang Việt/English

Đã mở rộng cơ chế ngôn ngữ từ phạm vi Từ điển sang lớp i18n chung cho các nhãn HTML tĩnh, nội dung render động, Practice, Tiến độ, Ngữ âm, Quest, hướng dẫn người mới, notification và chat hệ thống. Chế độ English được lưu ở `localStorage` với khóa `pandahan_lang`; event `pandahan-language-changed` cập nhật các vùng đang mở. Text tiếng Trung, audio, curriculum và dữ liệu học không bị thay đổi.

Module `js/global-language.js` dùng dictionary có kiểm soát, giữ nguyên giá trị ô tìm kiếm, không ghi đè cấu trúc sidebar và tự áp dụng cho các node DOM mới render. Module Ngữ âm có lớp dịch trong shadow root; Quest nhận `PANDAHAN_QUEST_LANGUAGE` qua `postMessage` và hỗ trợ khôi phục lại tiếng Việt. Bộ nhận diện kết quả Quest chấp nhận cả tiêu đề tiếng Việt và English để không ảnh hưởng submit tiến độ.

Các kế hoạch ngày và nhắc học từ Cloud Functions hiện có thêm `title_vi/title_en`, `body_vi/body_en` và `text_vi/text_en`. Renderer chuông Thông báo và chat chọn bản English khi người dùng bật English; tin nhắn người dùng tự nhập vẫn giữ nguyên. Việc chạy nhắc học/cron vẫn cần deploy riêng Firebase Functions; bản local chưa ghi dữ liệu production.

Kiểm thử sau tích hợp: i18n global 20/20 PASS; full verifier 45/45 PASS; adaptive schedule giữ nguyên PASS; JavaScript syntax PASS. Browser regression đã xác nhận Auth overlay English, sidebar không mất nút đăng xuất, Từ điển giữ dữ liệu, dropdown loại từ chuyển English và Practice hiển thị `antonym · Dialogue reordering`. Phần Ngữ âm/Quest đã có bridge runtime và lớp dịch nội bộ; cần mở lại trên GitHub Pages sau deploy để kiểm tra asset tải đủ trong môi trường thực tế.


## Deep i18n audit — 22/08/2026

Đã rà soát lại các ảnh giao diện English và phát hiện cơ chế dịch trước đó còn để sót nhiều chuỗi trong các vùng render động. Các lỗi chính gồm nhãn Progress bị ghép như “Reinforcing luyện” và “Familiar vững”, mô tả Activity history còn câu tiếng Việt, module Phonics còn tiêu đề/mô tả/session card tiếng Việt, cùng các trạng thái chat và broadcast chưa được dịch tại thời điểm render.

Bản sửa lần này đã xử lý tại nguồn thay vì chỉ phụ thuộc vào text walker: renderer Progress/Rubric dùng trực tiếp trường `en/descEn`; Activity history có bộ chuyển đổi cho Quiz/Review/completion; module Phonics có dictionary shadow-root mở rộng cho intro, pronunciation cards, session cards, loading/error, history và trạng thái; flashcard Ngữ âm có fallback English theo nghĩa của từng thẻ; app-03 dùng helper song ngữ cho chat, broadcast, loading, empty state và errors; offline enhancements dịch kết quả ghi âm và các nhãn AI. Các module vừa sửa trong `index.html` được thêm query cache-bust `i18n-deep-20260822-v2` để GitHub Pages không giữ JavaScript cũ.

Nội dung tiếng Trung, audio, bundle Quest/Ngữ âm, curriculum và thuật toán học không bị thay đổi. Các trường nghĩa tiếng Việt trong dữ liệu học chỉ được dùng làm fallback khi chưa có `meaning_en`; khi có `meaning_en` hoặc mapping English, giao diện English ưu tiên bản English.

Kiểm thử cuối: JavaScript syntax PASS cho toàn bộ module sửa; i18n regression cũ 20/20 PASS; i18n deep regression 15/15 PASS; adaptive schedule 7/7 PASS. Browser trước khi cache-bust đã chứng minh lỗi tồn tại trong loader cũ; sau cache-bust, loader mới được kiểm tra tĩnh và các mapping còn sót trong DOM đã được bổ sung theo đúng chuỗi thực tế.

Giới hạn còn lại: các tin nhắn do người dùng hoặc giáo viên tự nhập không bị tự động dịch vì đó là dữ liệu cá nhân; nội dung nghĩa tiếng Việt có chủ đích trong chế độ học ngôn ngữ có thể vẫn xuất hiện nếu bản ghi không có `meaning_en`; cron Firebase vẫn cần được deploy riêng nếu muốn chạy production.

## Final Quest/Phonics English validation — 22/08/2026
Đã sửa cơ chế dịch theo hướng giữ nguyên text gốc trong từng text node và khôi phục lại khi chuyển English ↔ Tiếng Việt. Global observer không còn quét shadow root `#pinyin-phonetics-root`; loader Ngữ âm là lớp duy nhất dịch vùng React này, tránh bắt nhầm text đã bị dịch một phần. Các map một từ chỉ thay khi toàn bộ node là nhãn tương ứng; các cụm nhiều từ rõ ràng được phép thay inline. Vì vậy các từ English như `practise` không bị thay nhầm bởi khóa ngắn tiếng Việt như `ra`.

Phonics đã được bổ sung mapping cho overview, special-group explanation, zhi/chi/shi/ri, unaspirated/aspirated/fricative, pronunciation history, filters, tuần/buổi, 10 lesson cards, lesson detail, Study/Reading practice/Practice, flashcard, Record/Playing/Mic, game, quiz và result. Quest iframe giữ nguyên asset/audio/curriculum, nhận mode qua `PANDAHAN_QUEST_LANGUAGE`, có mapping cho hero, roadmap 120 ngày, gate/ngày học, source set, dimensions, Phase 0–3, review, quiz/result và khôi phục Vietnamese.

| Kiểm tra final | Kết quả |
|---|---:|
| i18n global regression | 20/20 PASS |
| i18n deep regression | 25/25 PASS |
| Adaptive schedule regression | 7/7 PASS |
| Full static verifier | 45/45 PASS |
| JavaScript syntax và joined Phonics bundle | PASS |
| File offline lớn nhất | 39,000,000 bytes; không file nào vượt 100 MB |

Browser local đã xác nhận Auth/Offline flow, English overview Phonics, các nhãn mixed-node chính và không còn hiện tượng corruption `practise` sau short-key guard. Một số lần browser sandbox tự reset về `about:blank` trước khi mở sâu lesson/Quest, nên kết quả browser được phân biệt với static regression; không dùng điều đó làm bằng chứng đã deploy production. Bản final dùng cache-bust `i18n-deep-20260822-final`, `i18n-quest-deep-20260822-final` và `i18n-phonics-deep-20260822-final`.
