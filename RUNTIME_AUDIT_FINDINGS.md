## Runtime checkpoint

- Trang ban đầu hiển thị Auth overlay với Google, email/password và Offline.
- Console sau khi tải trang: không có output lỗi.
- Bấm Tiếp tục Offline mở được app chính.
- App hiển thị đủ các tab Từ điển, Luyện tập, Tiến độ, Ngữ âm, Nhắn tin và AI Chat Box.
- Dữ liệu HSK 1/2/3 render được ở chế độ Offline.
- Cần kiểm tra tiếp Practice, Ngữ âm, Quest và schedule event.

Ghi nhận từ browser audit local trên port 4182.
## Practice/Quest checkpoint

Tab Luyện tập hiển thị đúng hai thẻ `pCardAdvanced` và `pCardPinyinQuest`; bốn thẻ cũ không xuất hiện. Khi mở Pinyin Tone Quest, vùng iframe/Quest hiển thị tiêu đề và nút quay lại nhưng nội dung bên trong đang trắng tại thời điểm snapshot. Đây là lỗi runtime/loader cần kiểm tra tiếp, không kết luận là asset hỏng cho đến khi xem console và network.
## Quest loaded checkpoint

Sau khi chờ bundle lớn tải xong, Pinyin Tone Quest render đầy đủ phần nội dung 120 ngày. Day 1 có nút mở học; Day 2 trở đi hiển thị trạng thái khóa và hint hoàn thành buổi trước. Loader split và gate tiến độ hoạt động trong môi trường local.
## Ngữ âm checkpoint

Tab Ngữ âm tải thành công `5/5 phần đã tải`, hiển thị Pinyin Bootcamp, các nút zhi/chi/shi, lịch sử phát âm và 10 buổi. Buổi 1 mở; buổi 2–10 hiển thị khóa. Không thấy lỗi runtime trong snapshot.
## Auth fix checkpoint

- Static audit phát hiện `app-01.js` có API key sai một ký tự: `...YJd...` thay vì key nguồn `...JYd...`.
- Đã sửa app-01 dùng đúng key theo user-supplied Firebase config và firebase-boot.
- Tải lại trang local sau sửa: Auth overlay hiển thị bình thường.
- Console sau sửa: không có output lỗi.
- Đây là lỗi trực tiếp có thể giải thích `auth/api-key-not-valid` trên bản ZIP cũ.
## Post-patch Auth runtime

Sau khi sửa và reload bản local, trang Auth overlay hiển thị đúng Google/email/password/Offline. Console không có output lỗi. Chưa đăng nhập và không ghi dữ liệu production.
## Auth bridge dedup checkpoint

Sau khi loại listener Auth trùng khỏi auth-bridge, reload bản local vẫn hiển thị Auth overlay bình thường và console không có lỗi. app-01 giữ listener chính cho profile/completeLogin; auth-bridge chỉ theo dõi notifications và schedule services.
