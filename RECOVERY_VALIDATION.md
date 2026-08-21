# Recovery Validation Log

Ngày kiểm thử: 2026-08-21.

## Kết quả chức năng

| Kiểm tra | Kết quả |
|---|---|
| Auth overlay hiển thị khi chưa xác thực | PASS |
| Firebase app khởi tạo | PASS, 1 app |
| Auth bridge | PASS |
| Firestore bridge | PASS |
| RTDB bridge | PASS |
| App ẩn trước xác thực | PASS |
| Offline fallback | PASS |
| Practice chỉ còn HSK3 và Pinyin Tone Quest | PASS |
| Quest iframe ghép đủ nội dung | PASS |
| Quest có 120 day-card | PASS |
| Ngày 1 khi mới bắt đầu | `disabled=false` |
| Ngày 2 khi chưa hoàn thành ngày 1 | `disabled=true`, `aria-disabled=true`, class `ph-locked` |
| Submit ngày 1 đạt 90% ở guest | PASS, `action=advance`, ngày 2 chuyển `unlocked` trong local cache |
| Guest không ghi RTDB | PASS sau khi sửa `isGuest` guard |
| State machine bảy ca biên | 7/7 PASS |
| JavaScript syntax | PASS |
| app-02 checksum | Trùng bản Lite_v12 |

## Kiểm thử schedule

Output đầy đủ nằm trong `RECOVERY_SCHEDULE_TEST_OUTPUT.txt`. Các ca gồm pass mở khóa, locked guard, fail daily, fail weekly, monthly review, missed day 121 idempotent và timezone `Asia/Ho_Chi_Minh`.

## Phạm vi ghi dữ liệu

Trong quá trình kiểm thử trình duyệt không đăng nhập tài khoản người dùng và không ghi dữ liệu production. Test schedule dùng guest/local cache. Cloud Function chỉ được thêm vào code; cần deploy vào đúng Firebase project của người dùng để cron và tin nhắn kế hoạch chạy thật.
