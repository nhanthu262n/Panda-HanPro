# Báo cáo sửa lỗi Quest offline

## Nguyên nhân

Loader của web gốc chỉ tìm cấu trúc cũ gồm `main.oh-main` và phần tử `game-data`. Asset Quest mới lại dùng `main.quest-original-ui` và `game-index`, nên ba part tải được nhưng bước phân tích DOM thất bại, dẫn đến thông báo `Unable to load offline Quest`.

## Bản sửa

Loader hiện hỗ trợ cả hai cấu trúc tương thích: `main.oh-main` hoặc `main.quest-original-ui`; `game-data` hoặc `game-index`. Các script runtime được lọc đúng để không loại nhầm payload theo ngày. Giao diện Quest mới được giữ nguyên khi dựng iframe. Cache-busting của ba asset vẫn được giữ để trình duyệt không lấy bundle cũ.

## Kết quả kiểm thử

Harness chạy qua HTTP đã tải thành công cả ba asset, tổng 7,008,333 byte, nhận diện `main.quest-original-ui`, `game-index`, 121 script runtime và đủ 120 payload ngày. Loader và runtime đạt `node --check`. Validator Quest đạt 120 payload, 4.474 câu, audio, AI và cầu nối tiến độ. Kiểm tra phạm vi xác nhận 37 tệp web gốc không đổi; chỉ ba asset Quest và loader Quest thay đổi.

## Phạm vi

Không chỉnh AI Coach, AI Tutor, AI Writing, ngữ âm, Firebase, auth, lịch học hoặc các module khác. Chỉ sửa cơ chế dựng/tải module Ôn tập 120 ngày để tương thích với cấu trúc asset hiện tại.

## Cách sử dụng

Giải nén ZIP và dùng thư mục `source` để thay đúng thư mục mã nguồn web hiện tại. Sau khi triển khai, tải lại cứng trình duyệt bằng `Ctrl+F5` hoặc xóa cache site một lần.
