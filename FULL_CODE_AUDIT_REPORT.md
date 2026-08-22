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
