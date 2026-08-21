# Validation log

## Practice UI

Mở `http://127.0.0.1:4173/` và chọn **Luyện tập**. DOM/screenshot chỉ còn hai thẻ `pCardAdvanced` (Đề HSK3 3.0) và `pCardPinyinQuest` (Pinyin Tone Quest). Bốn thẻ khoanh đỏ `pCardMc`, `pCardUnscramble`, `pCardMatch`, `pCardWrite` không còn trong HTML. Core `app-02.js` giữ nguyên checksum theo Lite_v12; các handler cũ không còn phần tử tương ứng nên không thể hiển thị/kích hoạt trên giao diện.

## Quest and Ngữ âm

Mở **Pinyin Tone Quest** thành công; iframe hiển thị trang Quest 120 ngày, audio/content offline được ghép từ ba part. Mở tab **Ngữ âm** thành công; loader hiển thị `5/5 phần đã tải`, sau đó mount `Pinyin Bootcamp` với các ô zhi/chi/shi, flashcard/game/quiz và 10 buổi học. Đây là bundle năm part đã kiểm tra checksum và syntax trước khi tích hợp.

## Runtime console

Console sau khi mở Ngữ âm không có lỗi tải Firebase, Quest hoặc adaptive schedule. Chỉ xuất hiện cảnh báo React về `key` ở một danh sách trong bundle phonetics; bundle vẫn mount và hiển thị đúng nội dung. Không chỉnh bundle minified vì yêu cầu giữ nguyên toàn bộ nội dung Ngữ âm.

## Adaptive schedule

`node test_schedule_engine_core.js` trả về `status: PASS`, `tests: 7`, gồm pass/unlock, locked guard, daily repeat, weekly review repeat, monthly review threshold, missed day 121 idempotent và timezone `Asia/Ho_Chi_Minh`.

Runtime console xác nhận `firebase.apps.length === 1`, `PandaHanFirebase`, `PandaHanScheduleCore` và `PandaHanSchedule` đã tồn tại. Schedule local cache chỉ được tạo cho guest/offline fallback; curriculum có 120 ngày, ngày 1 `unlocked`, ngày 2 trở đi `locked`. Kiểm tra timezone qua API schedule dùng ngày Việt Nam; không gọi submit/import và không ghi production trong kiểm thử.
