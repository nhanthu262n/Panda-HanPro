# PandaHán Pro — Khối 1 với Firebase Realtime Database

## Phạm vi

Bản này bổ sung module `js/app-05-rtdb-block1.js` và dữ liệu `assets/curriculum_days.json`. Module không thay thế `app-01.js`, `app-02.js`, `app-03.js`; chat hiện tại vẫn dùng Firestore như trong `index.html`. Khối 2 review/cron và Khối 3 chat realtime chưa được triển khai trong module này.

## Các đường dẫn RTDB mới

| Path | Mục đích |
|---|---|
| `curriculumDays/{day_number}` | Nội dung 120 ngày gốc |
| `studentSchedules/{uid}/{day_number}` | Lộ trình riêng của học viên |
| `reviewLogs/{uid}/{log_id}` | Nền log review cho Khối 2 |
| `studentTeachers/{student_uid}/{teacher_uid}` | Quan hệ giáo viên phụ trách |
| `notifications/{student_uid}/{notification_id}` | Nền thông báo cho các khối sau |

## Cách áp dụng an toàn

Trước khi đổi rules, vào Firebase Console → Realtime Database → Data → Export JSON để backup toàn bộ database hiện tại. Lưu file backup bên ngoài repository. Không xóa các node `users`, `studentProgress`, `quizResults` và `streakTracking`.

Sau khi backup, kiểm tra tài khoản Firebase đã bật Email/Password và người dùng teacher có field `role` trong node `users/{uid}`. Rules mẫu trong `database.rules.json` dùng role ở node `users`, không dùng custom claims. Hãy dán rules vào Realtime Database Rules sau khi đã backup; không dán vào Firestore Rules.

## Import curriculum

Mở app bằng một tài khoản teacher/master_teacher đã đăng nhập, mở DevTools Console và chạy:

```js
await PandaHanRtdbSchedule.importCurriculum()
```

Kết quả mong đợi là `{ imported: 120, path: "curriculumDays" }`. Nếu bị `PERMISSION_DENIED`, kiểm tra `users/{uid}/role` và rules.

## Tạo schedule cho học viên

Sau khi curriculum đã import, đăng nhập bằng tài khoản học viên rồi chạy:

```js
await PandaHanRtdbSchedule.initStudentSchedule()
```

Kết quả mong đợi là `created: true`, `count: 120`, `firstStatus: "unlocked"`. Kiểm tra RTDB tại `studentSchedules/{studentUid}`: ngày 1 phải `unlocked`, ngày 2–120 phải `locked`, `sequence_index` bằng `day_number`, `attempt_count` bằng 0 và `best_score` là null.

Nếu chạy lại trên cùng học viên, module không tạo trùng và trả về `created: false` cùng số lượng bản ghi hiện có.

## Kiểm tra đọc realtime

```js
const stop = PandaHanRtdbSchedule.watchStudentSchedule((schedule) => {
  console.log("schedule updated", Object.keys(schedule).length)
})
// Khi không cần theo dõi nữa:
stop()
```

## Lưu ý bảo mật

Rules ban đầu bạn gửi có `.read: true` và `.write: true` cho toàn bộ database, không an toàn cho production. Rules mẫu đã tắt truy cập mặc định và yêu cầu Firebase Auth. Tài khoản admin không được đăng ký công khai; việc cấp role master/admin cần làm bằng seed hoặc công cụ quản trị riêng.

Credential Google Drive upload không được lưu trong HTML/GitHub Pages. Bản làm việc đã xóa API key cứng khỏi frontend; cần thu hồi/đổi credential cũ trước khi bật lại upload qua backend/proxy an toàn.

## Giới hạn của Khối 1

Module này chỉ import curriculum và khởi tạo schedule. Nó chưa tự unlock theo điểm, chưa chạy cron 00:00, chưa gia hạn ngày 121/122 và chưa gửi message hệ thống. Các phần đó thuộc Khối 2/3 và chỉ làm sau khi bạn xác nhận Khối 1.
