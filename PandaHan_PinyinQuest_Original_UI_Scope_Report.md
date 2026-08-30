# Báo cáo chỉnh sửa giao diện Ôn tập 120 ngày

## Phạm vi kiểm soát

Bản cập nhật sử dụng mã nguồn web gốc làm nền. Chỉ bốn tệp thuộc phạm vi Quest bị thay đổi: ba phần asset `pinyin-tone-quest.part-00/01/02` và `js/app-07-quest-parts-loader.js`. **37 tệp còn lại của web gốc không thay đổi** theo so sánh byte-for-byte.

## Giao diện đã khôi phục

Giao diện Quest được điều chỉnh theo ảnh tham chiếu và CSS gốc của Pinyin Tone Quest: sidebar dọc màu hồng với các nút biểu tượng, header Pinyin Tone Quest song ngữ, khối tiêu đề Quest/Ôn tập 120 ngày, hero Vocabulary sprint với hình đèn lồng, thanh tiến độ, các thẻ ngày roadmap xếp dọc, viền màu theo nhóm, icon minh họa đèn lồng/cổng sách/panda và nút `TAP TO START · 点击开始`. Bố cục responsive được kiểm tra ở desktop 1440×1000 và mobile 390×844.

## Bảo toàn chức năng

Dữ liệu 120 ngày, lazy-load, các câu hỏi nghe–nói–đọc–viết, AI chấm, dịch, audio, lưu tiến độ và cơ chế test mở khóa toàn bộ 120 ngày vẫn nằm trong module Quest. Các module AI Coach, lịch học, auth, Firebase, chat và các chức năng khác của web không bị sửa.

## Kiểm thử

Runtime Quest và loader đạt `node --check`. Validator xác nhận 120 payload ngày, 4.474 câu, 105 ngày nguồn có đủ bốn kỹ năng, AI viết/nói/đọc, dịch và cầu nối tiến độ. Ba asset Quest ghép lại khớp với HTML build. So sánh cây tệp xác nhận 37/37 tệp ngoài Quest giữ nguyên.
