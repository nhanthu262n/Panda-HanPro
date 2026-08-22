# Báo cáo đối chiếu kiểm thử lộ trình PandaHán Pro

## Kết luận ngắn

**Chưa đủ để khẳng định toàn bộ chức năng đã được kiểm thử hoàn chỉnh.** Bộ test hiện tại có 7 ca và đã kiểm tra tốt các quy tắc lõi của state machine: mở ngày kế tiếp khi đạt, chặn ngày khóa, tạo bài repeat khi không đạt, review tuần, đánh giá review tháng, gia hạn sau ngày 120 và timezone Việt Nam. Tuy nhiên, các luồng tích hợp thực tế với Firebase Scheduled Function, RTDB, Firestore và mục Giáo viên chưa được kiểm thử end-to-end.

## Đối chiếu yêu cầu

| Yêu cầu | Trạng thái | Bằng chứng trong bản hiện tại | Nhận xét |
|---|---|---|---|
| Lộ trình ban đầu có đúng 120 ngày | Đã kiểm tra gián tiếp | `test_schedule_engine_core.js:5`, `schedule-engine-core.js:20-22` | Curriculum được yêu cầu có đúng 120 ngày; test tạo schedule từ dữ liệu này. |
| Ngày thường đạt điểm thì mở ngày kế tiếp | Đã test | `test_schedule_engine_core.js:9-13` | PASS; ngày 2 chuyển sang `unlocked`. |
| Không được làm ngày chưa mở khóa | Đã test | `test_schedule_engine_core.js:15-17` | PASS; ném lỗi `LOCKED_DAY`. |
| Ngày thường không đạt thì phải học lại | Đã test một phần | `test_schedule_engine_core.js:19-26` | PASS; tạo 1 repeat, repeat đầu tiên được mở và ngày sau bị đẩy sequence. Chưa test chuỗi repeat đạt rồi mới mở bài gốc tiếp theo. |
| Review hằng tuần | Đã test một phần | `test_schedule_engine_core.js:28-38` | PASS cho trường hợp ngày 7 không đạt, tạo 2 repeat. Chưa test review tuần đạt và chưa test hoàn tất lần lượt các repeat để mở lộ trình tiếp. |
| Review hằng tháng | Đã test một phần | `test_schedule_engine_core.js:40-51` | Chỉ test hàm `evaluateReview` với trung bình 20 ngày đạt ngưỡng 75. Chưa test tháng không đạt, tạo 3 repeat, hoặc tháng đạt thì mở ngày tiếp theo qua `applySubmit`. |
| Đạt review mới được mở tiến độ mới | Đã có trong code, chưa đủ test | `schedule-engine-core.js:148-151` | Code chỉ gọi `unlockNextDay` khi pass. Cần test riêng cho daily, weekly và monthly pass để chứng minh đầy đủ. |
| Không đạt thì khóa bài gốc và bắt học lại trước khi đi tiếp | Đã có trong code, chưa đủ test | `schedule-engine-core.js:153-157` | Code đặt bài fail thành `failed_review`, chèn repeat đầu tiên ở trạng thái `unlocked`. Chưa có test kiểm tra bài gốc kế tiếp vẫn bị khóa cho đến khi repeat đạt. |
| Ngày 120 bỏ lỡ thì tạo ngày 121 | Đã test | `test_schedule_engine_core.js:53-62` | PASS; tạo sequence 121 và tăng `extension_count`. |
| Cron chạy lại không tạo extension trùng | Đã test ở core, chưa test cron thật | `test_schedule_engine_core.js:63-66` | PASS cho `applyDailyExtension` chạy hai lần. Chưa gọi Cloud Function hoặc mô phỏng transaction RTDB và retry thực tế. |
| Tiếp tục ngày 122, 123… khi tiếp tục bỏ lỡ | Chưa đủ test | `schedule-engine-core.js:173-198` | Code có thể tạo extension tiếp theo khi ngày mới quá hạn, nhưng bộ test chỉ xác nhận đến ngày 121. Cần test nhiều ngày liên tiếp và sequence liên tục. |
| Phân phối bài dựa trên bài chưa hoàn thành | Chưa được test đầy đủ | `schedule-engine-core.js:180-189` | Code chọn bài `unlocked` quá hạn đầu tiên và tạo một repeat. Chưa có test nhiều bài chưa hoàn thành, nhiều ngày bỏ lỡ, hoặc xác nhận thứ tự/phân phối toàn bộ backlog. |
| Mỗi ngày gửi kế hoạch vào thông báo | Có code, chưa có test | `functions/index.js:60-75` | Cloud Function ghi `daily_plan_YYYY-MM-DD_sequence` vào RTDB. Chưa có test xác nhận dữ liệu được ghi và không trùng khi retry. |
| Gửi kế hoạch vào mục Giáo viên | Có code, chưa có test end-to-end | `functions/index.js:87-104`, `106-125` | Code tìm quan hệ `studentTeachers/{uid}` rồi ghi chat Firestore với message ID cố định. Chưa kiểm thử tài khoản có giáo viên, không có giáo viên, quyền Rules, hoặc giao diện đọc được tin nhắn. |
| Job chạy lúc 00:00 Việt Nam | Có cấu hình, chưa chạy production | `functions/index.js:106-113` | Đã cấu hình `0 0 * * *`, timezone `Asia/Ho_Chi_Minh`. Chưa deploy hoặc chạy Firebase Emulator/production nên chưa thể khẳng định lịch thực thi thực tế. |
| Mở app đúng thời điểm giao ngày | Chỉ test hàm ngày | `test_schedule_engine_core.js:68-69` | PASS cho chuyển UTC sang ngày Việt Nam. Chưa test tải lại app ngay trước/sau 00:00 và catch-up client với RTDB. |
| RTDB là nguồn sự thật, localStorage là cache | Có code, chưa có test tích hợp | `js/app-04-adaptive-schedule.js:74-120`, `225-247` | Code ưu tiên đọc RTDB và dùng localStorage fallback/cache. Chưa test xung đột version, mất mạng, server mới hơn cache, hoặc transaction thất bại. |

## Các ca test hiện có

Bộ test hiện tại gồm 7 nhóm: pass ngày thường, chặn ngày khóa, fail ngày thường, fail review tuần, đánh giá review tháng, gia hạn ngày 120 có tính idempotent, và timezone `Asia/Ho_Chi_Minh`. Toàn bộ 7/7 ca hiện PASS.

## Phần chưa đủ để gọi là kiểm thử hoàn chỉnh

Khoảng trống quan trọng nhất là chưa có kiểm thử cho **review tháng không đạt**, chưa có kiểm thử chuỗi **repeat đạt rồi mới mở bài sau**, chưa có kiểm thử gia hạn liên tiếp **121 → 122 → 123**, và chưa có kiểm thử việc phân phối nhiều bài chưa hoàn thành theo đúng thứ tự.

Ngoài ra, phần gửi kế hoạch cho học sinh và giáo viên mới dừng ở mức kiểm tra tĩnh mã Cloud Function. Chưa có kiểm thử Firebase Emulator hoặc môi trường thật để xác nhận cron 00:00, quyền RTDB/Firestore, transaction đồng thời, retry của Cloud Function và giao diện mục Giáo viên nhận đúng tin nhắn. Vì vậy không nên ghi nhận phần này là “đã test hoàn chỉnh”; chính xác hơn là **đã tích hợp code nhưng chưa nghiệm thu end-to-end**.

## Kết luận nghiệm thu

Nếu câu hỏi là **“state machine lõi đã có các cơ chế chính chưa?”**, câu trả lời là **có, phần lớn đã có và 7/7 test lõi đang PASS**.

Nếu câu hỏi là **“toàn bộ yêu cầu vận hành đã được test đủ chưa?”**, câu trả lời là **chưa**. Mức hiện tại nên ghi là **đạt kiểm thử lõi, chưa đạt kiểm thử tích hợp hoàn chỉnh**. Cần bổ sung tối thiểu các test cho review tháng pass/fail, repeat chain, gia hạn nhiều ngày, backlog nhiều bài, cron retry, RTDB transaction và teacher chat trước khi kết luận 100%.
