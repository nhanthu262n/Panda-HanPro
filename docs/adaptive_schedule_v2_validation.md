# Adaptive Schedule v2 — Validation

State machine tests: PASS (7/7).

Covered cases: pass ngày thường mở ngày kế tiếp; locked day bị chặn; fail daily tạo repeat; fail weekly review tạo 2 repeat; monthly review dùng ngưỡng 75%; bỏ lỡ ngày 120 tạo ngày 121 đúng một lần; timezone Asia/Ho_Chi_Minh tại ranh giới 00:00.

Browser smoke test: login overlay/Auth tải bình thường; core, schedule v2, RTDB bridge và Quest UI đều được nạp; schedule local có 120 ngày; console không có lỗi khởi tạo.

Firebase write/cron thật chưa được chạy trên dữ liệu production. Cần deploy Functions và áp dụng rules sau khi backup RTDB.
