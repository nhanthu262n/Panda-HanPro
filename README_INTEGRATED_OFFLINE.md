# PandaHán Pro — Bản hợp nhất Offline

Bản này dùng `index.html` có sẵn trang đăng nhập Firebase Auth và toàn bộ giao diện/thuật toán PandaHán làm nền. Đã tích hợp thêm Pinyin Tone Quest offline, bundle Ngữ âm Pinyin offline, app-04 adaptive schedule, module RTDB Khối 1 và curriculum 120 ngày.

## Đã tích hợp

| Thành phần | Vị trí |
|---|---|
| Đăng nhập Email/Password và Google | `index.html` |
| Chat Firestore hiện có | `index.html` |
| Pinyin Tone Quest offline | `assets/pinyin-tone-quest.part-00/01/02` + `js/app-07-quest-parts-loader.js` |
| Pinyin phonetics offline | `js/pinyin-phonetics.part-01.js` đến `part-05.js` |
| Loader Ngữ âm | `js/pinyin-phonetics-loader.js` |
| Adaptive schedule local/catch-up | `js/app-04-adaptive-schedule.js` |
| RTDB Khối 1 | `js/app-05-rtdb-block1.js` |
| Quest Practice bridge | `js/app-06-quest-ui.js` + `js/app-07-quest-parts-loader.js` |
| Curriculum thật | `assets/curriculum_days.json` |
| Rules RTDB mẫu | `database.rules.json` |

## Cách test

Mở `index.html` qua một server tĩnh, không nên mở trực tiếp bằng `file://` nếu muốn kiểm tra Firebase/Auth. Ví dụ:

```bash
python3 -m http.server 8000
```

Sau đó mở `http://localhost:8000/`. Đăng nhập bằng tài khoản Firebase đã có. Kiểm tra tab **Luyện tập**: thẻ Pinyin Tone Quest mở được iframe offline. Kiểm tra tab **Ngữ âm**: nội dung 10 buổi hiện có của index vẫn giữ nguyên.

Sau khi đăng nhập bằng teacher/master teacher, import curriculum bằng DevTools Console:

```js
await PandaHanRtdbSchedule.importCurriculum()
```

Sau khi curriculum đã import, đăng nhập bằng học viên mới và chạy:

```js
await PandaHanRtdbSchedule.initStudentSchedule()
```

Module không tự ghi dữ liệu ngay khi mở trang. Hãy backup Realtime Database trước khi import hoặc dán rules mới.

## Audio và credential

Audio Quest và Pinyin được giữ nguyên offline. Credential Google Drive upload không còn được lưu hardcoded trong HTML; cần đặt upload qua backend/proxy an toàn trước khi bật lại gửi file chat. Firebase Web Config vẫn nằm trong frontend theo cơ chế Firebase Web SDK; không đưa service-account private key vào repository.

## Giới hạn

Quest không còn lưu thành một HTML duy nhất vượt giới hạn GitHub. Ba part được ghép nguyên byte thành Blob URL khi người dùng mở Quest; nội dung và audio vẫn giữ nguyên offline. Cron 00:00, review server-side và RTDB schedule nằm trong `functions/` và cần deploy riêng.

## Adaptive schedule v2

Bản mới dùng `js/schedule-engine-core.js` làm state machine chung cho frontend và Functions. `app-04-adaptive-schedule.js` dùng `Asia/Ho_Chi_Minh` qua `todayVietnam()`, chỉ cho submit bài có trạng thái `unlocked`, và phân biệt `daily`, `weekly`, `monthly` review. Khi fail, hệ thống tạo repeat theo loại review; khi bỏ lỡ ngày, hệ thống chèn extension một lần với `last_extension_date` để tránh cron chạy lặp tạo thêm ngày trùng.

Schedule được đọc/ghi ở `studentSchedules/{uid}` bằng RTDB transaction; localStorage chỉ là cache/fallback offline. Review log nằm ở `reviewLogs/{uid}`. Scheduled Job production nằm trong `functions/index.js`, chạy `0 0 * * *` với timezone `Asia/Ho_Chi_Minh`, tạo notification và review log khi thêm ngày ôn.

Chạy test state machine local:

```bash
node test_schedule_engine_core.js
```

Test này bao gồm pass ngày thường, chặn bài locked, fail ngày thường, fail ngày review, monthly review, bỏ lỡ ngày 120 tạo ngày 121 đúng một lần và kiểm tra ranh giới timezone Việt Nam.
