# PandaHán Pro — Lite_v12 đã phục hồi và tích hợp adaptive schedule

Bản này được xây dựng trực tiếp từ `PandaHan_GitHubPages_Optimized_Lite_v12.zip`. Giao diện, nội dung từ điển, audio offline và các module lõi `app-01.js`, `app-02.js`, `app-03.js` được giữ nguyên theo nền Lite_v12, ngoại trừ phần Practice được xử lý đúng theo yêu cầu: xóa bốn thẻ đã khoanh đỏ và giữ lại Đề HSK3 3.0 cùng Pinyin Tone Quest.

## Practice

Bốn thẻ đã xóa hoàn toàn khỏi HTML và handler:

```text
pCardMc
pCardUnscramble
pCardMatch
pCardWrite
```

Các file core `app-01.js`, `app-02.js`, `app-03.js` được giữ nguyên theo đúng bản Lite_v12; vì bốn phần tử đã bị xóa khỏi HTML nên handler cũ không còn phần tử để kích hoạt và không xuất hiện trong giao diện. Thẻ còn lại dùng `pCardPinyinQuest`, mở Quest offline qua iframe; nội dung Quest được ghép từ ba part nguyên byte trong `assets/`.

## Ngữ âm/Pinyin

Năm part Ngữ âm được giữ nguyên toàn bộ nội dung và checksum từ bản đã kiểm tra:

```text
js/pinyin-phonetics.part-01.js
js/pinyin-phonetics.part-02.js
js/pinyin-phonetics.part-03.js
js/pinyin-phonetics.part-04.js
js/pinyin-phonetics.part-05.js
```

`js/pinyin-phonetics-loader.js` tải đủ năm part theo đúng thứ tự, nối thành bundle và mount vào `#pinyin-phonetics-root` khi mở tab Ngữ âm. Kiểm thử trình duyệt đã xác nhận hiển thị `5/5 phần đã tải`, Pinyin Bootcamp, các ô zhi/chi/shi, flashcard/game/quiz và 10 buổi học.

## Adaptive schedule bảy bước

Cơ chế schedule nằm ở `js/schedule-engine-core.js`, `js/app-04-adaptive-schedule.js` và `js/app-05-rtdb-block1.js`.

| Bước | Trạng thái triển khai |
|---|---|
| `todayVietnam()` dùng chung | Đã dùng trong state machine; app-05 fallback delegate về cùng core |
| Chặn submit bài locked | `applySubmit()` chỉ nhận day có `status === "unlocked"` |
| Daily/weekly/monthly review riêng | `reviewTypeFor()`, `reviewThreshold()`, `evaluateReview()` và repeat count riêng |
| Bỏ lỡ ngày idempotent | `applyDailyExtension()` dùng `_meta.last_extension_date`, tạo extension một lần |
| RTDB là nguồn sự thật | app-04 đọc/ghi `studentSchedules/{uid}` bằng transaction; localStorage chỉ cache/fallback offline |
| Scheduled Job 00:00 | `functions/index.js` export `dailyScheduleExtension` tại `0 0 * * *`, timezone `Asia/Ho_Chi_Minh` |
| Test bảy ca biên | `test_schedule_engine_core.js` trả về `status: PASS`, `tests: 7` |

Các file triển khai bổ sung gồm `database.rules.json`, `firebase.json`, `functions/`, `assets/curriculum_days.json` và `js/firebase-boot.js`. Firebase Web SDK được nạp trước các module schedule; bootstrap chỉ khởi tạo app nếu chưa có app Firebase, không sửa các `const auth/db` offline trong app-01 và không đưa credential upload vào frontend.

## Kiểm thử đã thực hiện

Bản làm việc đã được chạy qua server tĩnh. Practice chỉ còn hai thẻ mục tiêu; Quest iframe hiển thị trang Quest 120 ngày; Ngữ âm mount thành công; các file JavaScript mới đều qua `node --check`; bộ test state machine bảy ca đều PASS; không có file web riêng lẻ nào vượt 100 MB.

Để test cục bộ:

```bash
python3 -m http.server 4173
```

Sau đó mở `http://127.0.0.1:4173/`. Khi triển khai thật, cần đăng nhập Firebase và deploy rules/Functions theo dự án Firebase tương ứng. Bản kiểm thử guest/offline không tự ghi dữ liệu production.
