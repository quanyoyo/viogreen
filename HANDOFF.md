# VIO GREEN web – bàn giao giữa các phiên chat (cập nhật 18/10/2026)

**Nguồn sự thật là `CLAUDE.md`** (quy tắc, stack, trạng thái mục 7, việc tiếp theo mục 8, chờ khách mục 9). File này chỉ tóm tắt nhanh để mở phiên mới.

## Đang ở đâu
- Web chạy thật ở **https://viogreen.com** (Cloudflare Pages trong tài khoản khách `viogreen102@gmail.com`; `www` 301 về đây; `viogreen.pages.dev` vẫn vào được). Repo `github.com/quanyoyo/viogreen`, push `main` là tự deploy.
- **Chế độ trước ra mắt đang BẬT** (`site.ts → prelaunch: true` = noindex toàn web). Cách tắt: CLAUDE.md mục 8 "Ra mắt".
- Firebase `viogreen-44a7f` (Auth Google + Email/mật khẩu, Firestore) chạy thật: đặt đơn, liên hệ, lead, tài khoản, `/quan-tri/`. Sửa `firestore.rules` thì chủ web phải dán lại vào Console **trước khi push**.
- Đã xong gần đây: thanh toán COD (SPX Express) / chuyển khoản + QR; email, TikTok, YouTube, Shopee; tên miền + sitemap + prelaunch; chọn Tỉnh/thành → Phường/xã theo danh mục mới 34 tỉnh (`npm run dvhc`); bỏ nút "Mua trên Shopee".
- **18/10/2026 – đợt sửa lớn theo "Thông tin làm web.docx" bản mới** (chi tiết CLAUDE.md mục 7): màu #037700 / #ebf2e3, chữ chạy ngang, hero ảnh thật + thời tiết/giờ, nội dung trang chủ mới, **đổi tên SP** (Sol / Grid / Plus / Pro, ECOBOX S / Plus / Pro, bỏ VIO-Care → chọn gói bảo hành 12/18/24 tháng ở trang máy), lọc theo **số lượng cây**, chatbot có lời chào nổi + câu hỏi soạn sẵn, đánh giá + blog dựng sẵn (ẩn). Ảnh gốc ở `images-src/` (không commit) → `npm run images`.

## Đang dở / chờ
- **AR:** `npm run models` chuyển STL → GLB đã chạy được. 12 STL trong `models-src/` = **1 máy bản Sol** → `public/models/ecohub-mau.glb` (**chưa commit, chưa gắn**). Chờ khách: máy này là model nào (Sol / Sol Plus / Sol Pro? – tên mới từ 18/10), màu từng bộ phận đúng chưa, ảnh + kích thước các model khác (hoặc file CAD từng model) để dựng biến thể.
- **Đăng ký tài khoản bằng email:** code xong, chưa ai test thật (Claude không được tạo tài khoản) → chủ web tự thử theo các bước đã gửi trong chat.
- **Địa chỉ cửa hàng** trong `site.ts` vẫn theo đơn vị hành chính cũ ("…Hạ Bằng, Thạch Thất, TP Hà Nội") → chờ khách xác nhận cách ghi mới (Xã Hạ Bằng, Thành phố Hà Nội).
- Việc treo bàn giao (thẻ thanh toán Cloudflare, Firebase support email, UID khách vào `admins`, xoá 3 đơn test, App Check, email báo đơn cần gói Blaze, Chính sách bảo mật): CLAUDE.md mục 8.
- Chờ khách gửi: giá, ảnh SP, ảnh hero, thông số, logo gốc, tên công ty + MST, link Messenger/Zalo/Instagram, nội dung 5 trang chính sách còn thiếu: CLAUDE.md mục 9.

## Lưu ý khi làm việc
- Mỗi thay đổi: `npm run check` → `npm run build` → commit (tác giả `quanyoyo`, email noreply) → push `main`.
- Chạy thử xong phải tắt dev server; nếu cổng 4321 do chủ web tự chạy thì dùng luôn, không tắt.
- Không bịa nội dung kinh doanh (giá, thông số, địa chỉ, đánh giá) – thiếu thì ghi vào "Chờ khách".
- `Thông tin làm web.docx`: bản mới nhất chủ web để ở `D:\Thông tin làm web.docx` (ngoài repo); đọc bằng Python (`zipfile` + XML) vì máy chưa có pandoc. Ảnh trong file là ảnh chụp màn hình có chú thích yêu cầu sửa.
