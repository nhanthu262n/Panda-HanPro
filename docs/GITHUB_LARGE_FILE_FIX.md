# Xử lý lỗi GitHub file vượt 100 MB

## Vì sao bị lỗi

GitHub giới hạn kích thước **từng file** ở 100 MB. Quest cũ `assets/pinyin-tone-quest.html` khoảng 108,93 MB nên GitHub Desktop từ chối push, dù tổng repository hoặc file ZIP có thể khác.

Bản này đã xóa file Quest lớn và thay bằng:

```text
assets/pinyin-tone-quest.part-00   39,000,000 bytes
assets/pinyin-tone-quest.part-01   39,000,000 bytes
assets/pinyin-tone-quest.part-02   36,220,218 bytes
```

`js/app-07-quest-parts-loader.js` sẽ tải ba phần khi người dùng bấm Pinyin Tone Quest, ghép nguyên byte thành Blob URL rồi mở trong iframe. Không cần file HTML Quest đơn lẻ nữa.

## Cách làm sạch lịch sử commit

Vì file lớn đã từng được commit, chỉ xóa file ở commit mới nhất là chưa đủ. Hãy sao lưu thư mục repository trước, đóng GitHub Desktop, sau đó chạy trong Git Bash/PowerShell:

```bash
cd "DUONG_DAN_TOI_REPOSITORY"

# Sao lưu branch hiện tại
 git branch backup-before-quest-split

# Nếu máy chưa có git-filter-repo:
python -m pip install --user git-filter-repo

# Xóa file lớn khỏi toàn bộ lịch sử Git
 git filter-repo --path assets/pinyin-tone-quest.html --invert-paths --force

# Kiểm tra không còn file lớn trong history hiện tại
 git rev-list --objects --all | grep 'assets/pinyin-tone-quest.html' || true

# Kiểm tra file tracked hiện tại
 find . -type f -size +99M -not -path './.git/*'
```

Sau đó chép các file trong bản ZIP mới vào đúng thư mục repository. Kiểm tra phải có ba file `pinyin-tone-quest.part-*` và không có `assets/pinyin-tone-quest.html`. Cuối cùng:

```bash
git add -A
git commit -m "Split Quest asset below GitHub file limit"
git push --force-with-lease origin main
```

## Lưu ý về force push

`git push --force-with-lease` viết lại lịch sử branch `main`. Chỉ thực hiện khi đây là repository cá nhân hoặc mọi cộng tác viên đã đồng ý. Nếu repository có người khác đang làm, hãy tạo branch mới hoặc repository mới thay vì force push branch chính.

## Kiểm tra sau khi push

Mở GitHub Pages, vào **Luyện tập → Pinyin Tone Quest**. Loader phải tải ba part và iframe phải hiển thị màn hình Quest 120 ngày. Nếu thấy lỗi tải part, kiểm tra đường dẫn phân biệt chữ hoa/chữ thường và bảo đảm ba file nằm đúng trong thư mục `assets/`.
