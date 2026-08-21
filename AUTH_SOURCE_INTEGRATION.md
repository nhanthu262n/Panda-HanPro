# Tích hợp Auth nguyên mẫu từ `index.html` người dùng gửi

Bản này chỉ thay ba vùng liên quan đăng nhập: CSS Auth, markup `#proAuthOverlay` và khối Firebase/Auth trong `js/app-01.js`. Nội dung học tập, Practice, Quest, Ngữ âm, adaptive schedule, Firestore chat và các module core khác không được thay đổi.

## Auth đã lấy nguyên mẫu

Giao diện giữ đúng các phần: logo PandaHán, nút Google Identity Services, dấu phân cách “hoặc”, ô Email, ô Mật khẩu, nút Đăng nhập ngay, lỗi đăng nhập, Tiếp tục Offline và loading indicator. Cơ chế giữ đúng Firebase Auth email/password, Google credential/popup/redirect, Firestore profile theo `users/{uid}`, role master và listener `auth.onAuthStateChanged` của file nguồn.

## Kiểm tra bảo toàn nội dung

| Module | Kết quả |
|---|---|
| `app-02.js` | Checksum trùng bản trước |
| `app-03.js` | Checksum trùng bản trước |
| `app-04-adaptive-schedule.js` | Checksum trùng bản trước |
| `app-05-rtdb-block1.js` | Checksum trùng bản trước |
| `app-06-quest-ui.js` | Checksum trùng bản trước |
| `app-07-quest-parts-loader.js` | Checksum trùng bản trước |
| `auth-bridge.js` | Checksum trùng bản trước |
| JavaScript syntax | PASS |
| Trang login trên trình duyệt | Hiển thị đúng Auth overlay và Google button |
| Console runtime | Không có lỗi console |
