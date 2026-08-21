# PandaHán Pro — Recovery Auth, Student Data và Adaptive Schedule

## Phạm vi bản sửa

Bản này dùng nguyên giao diện Lite_v12 làm nền. Các file core `app-02.js` và `app-03.js` được giữ nguyên checksum; phần khôi phục được tách vào `auth-bridge.js`, `app-04-adaptive-schedule.js`, `app-07-quest-parts-loader.js`, Firebase Rules và Cloud Functions.

## Đăng nhập và dữ liệu người học

Màn hình đăng nhập đã được khôi phục với email/mật khẩu, đăng ký học viên mới, tên hiển thị, Google popup và lựa chọn Offline. Mặc định ứng dụng chờ xác thực; Offline chỉ là fallback rõ ràng. Khi đăng nhập thành công, `auth-bridge.js` tạo hoặc cập nhật hồ sơ tại Firestore `users/{uid}` với email, tên, role, status, `createdAt`, `lastSeen` và `updatedAt`. Tiến độ từ Firestore `progress/{uid}` tiếp tục được app hiện có đồng bộ vào localStorage cache.

RTDB là nguồn sự thật cho lịch học tại `studentSchedules/{uid}`, log tại `reviewLogs/{uid}` và thông báo tại `notifications/{uid}`. LocalStorage chỉ được dùng làm cache hoặc fallback Offline. Học viên chỉ có thể đọc dữ liệu của chính mình; giáo viên/master teacher được quyền theo quan hệ trong Rules.

## Lộ trình 120 ngày và kéo dài

State machine dùng chung `todayVietnam()` với múi giờ `Asia/Ho_Chi_Minh`. Ngày đầu tiên được mở, các ngày sau bị khóa. Submit chỉ tìm bài có trạng thái `unlocked`; submit bài khóa trả lỗi `LOCKED_DAY`. Ngày thường dùng ngưỡng 80, review tuần dùng 70, review tháng dùng 75. Fail tạo repeat tương ứng: ngày thường 1 repeat, weekly 2 repeat, monthly 3 repeat.

Cloud Function `dailyScheduleExtension` chạy lúc `00:00` theo `Asia/Ho_Chi_Minh`. Nếu bài unlocked quá hạn, backend đổi bài thành `extended`, chèn đúng một repeat sau nó và dùng `last_extension_date` để idempotent khi cron chạy lại. Vì repeat giữ `day_number` của bài nguồn và có `sequence_index` mới, lộ trình có thể kéo dài thành ngày 121, 122… mà vẫn phân phối đúng bài chưa hoàn thành.

## Pinyin Tone Quest

Loader ghép nguyên byte ba part Quest thành Blob URL. Khi iframe báo ready, parent gửi gate gồm ngày unlocked/completed. Quest tự khóa mọi `data-day` chưa được mở bằng `disabled`, `aria-disabled=true`, CSS khóa và thông báo tiếng Việt. Kết quả màn hoàn thành được gửi qua `postMessage`; parent gọi `PandaHanSchedule.submitDayResult(day, scorePercent)`, sau đó refresh gate. Vì server state machine cũng kiểm tra `unlocked`, việc mở bằng chỉnh giao diện không thể vượt khóa schedule.

## Kế hoạch hằng ngày và mục Nhắn tin giáo viên

Cron tạo notification `daily_plan` trong `notifications/{uid}` để học viên thấy trên chuông thông báo. Nếu tồn tại quan hệ `studentTeachers/{uid}` với `teacherUid`, `teacher_id`, `teacherId` hoặc key teacher có giá trị `true`, cron đồng thời tạo tin nhắn idempotent tại `chats/{studentUid_teacherUid}/messages/daily_plan_{date}_{sequence}`. Tin nhắn có `senderId: system`, `senderName: PandaHán Pro`, `planDate` và nội dung kế hoạch ngày đó; schema participants/lastMessage tương thích với khu vực Nhắn tin hiện có.

## Kiểm thử đã chạy

| Hạng mục | Kết quả |
|---|---|
| State machine bảy ca biên | 7/7 PASS |
| Timezone Việt Nam | PASS |
| Locked guard | PASS |
| Daily/weekly/monthly review | PASS |
| Missed day và extension idempotent | PASS |
| Firebase app/Auth/Firestore/RTDB bridge | Đã kiểm tra runtime |
| Auth overlay | Đã kiểm tra trực quan |
| Quest day gate | Ngày 1 mở, ngày 2–120 khóa khi chưa hoàn thành ngày 1 |
| Guest fallback | Chỉ ghi local cache, không ghi RTDB |
| Core app-02 checksum | Giữ nguyên bản Lite_v12 |

## Deploy

Đưa thư mục frontend lên GitHub Pages như các bản trước. Firebase Rules và Scheduled Function triển khai từ thư mục gốc bằng Firebase CLI trong đúng Firebase project:

```bash
firebase use <project-id>
firebase deploy --only database,firestore,functions
```

Không chạy deploy nếu chưa kiểm tra project đang được chọn. Sau deploy, xác nhận Cloud Functions có `dailyScheduleExtension` ở region `asia-southeast1`, timezone `Asia/Ho_Chi_Minh`. Nếu chưa có quan hệ `studentTeachers/{uid}`, hệ thống vẫn gửi notification RTDB nhưng không tự tạo tin nhắn vào cuộc trò chuyện giáo viên.
