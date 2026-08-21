## Quest split validation

Ba phần Quest được tạo ở `assets/pinyin-tone-quest.part-00`, `part-01`, `part-02`, lần lượt 39,000,000; 39,000,000; và 36,220,218 bytes. Nối ba phần bằng thứ tự tên file cho kết quả khớp byte với `pinyin-tone-quest.html` gốc.

Không còn file nào vượt 99 MB trong thư mục web. `app-07-quest-parts-loader.js` đã kiểm tra cú pháp. Server tĩnh trả HTTP 200 cho index; trang đăng nhập/Auth vẫn hiển thị bình thường.

Browser smoke test: login/Auth mở bình thường; chế độ offline vào được giao diện chính; mục Practice vẫn hiển thị đầy đủ các bài cũ cùng thẻ Pinyin Tone Quest sau khi chuyển iframe sang loader split.

Sau khi bấm Pinyin Tone Quest, nội dung 120 ngày hiển thị đúng. Console xác nhận `PandaHanQuestParts` đã nạp ba URL part-00/01/02 và iframe đang dùng `blob:` URL được ghép từ ba phần.
