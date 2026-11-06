# VIO GREEN web – bàn giao giữa các phiên chat (cập nhật 07/11/2026)

**Nguồn sự thật là `CLAUDE.md`** (quy tắc, stack, trạng thái mục 7, việc tiếp theo mục 8, chờ khách mục 9). File này chỉ tóm tắt nhanh để mở phiên mới. Báo cáo tiến độ cho chủ web / khách: `TIEN-DO.md`.

## Đang ở đâu
- Web chạy thật ở **https://viogreen.com** (Cloudflare Pages trong tài khoản khách `viogreen102@gmail.com`; `www` 301 về đây; `viogreen.pages.dev` vẫn vào được). Repo `github.com/quanyoyo/viogreen`, push `main` là tự deploy.
- **Đã ra mắt 05/11/2026** (`site.ts → prelaunch: false`): Google được lập chỉ mục. Còn bước Google Search Console (CLAUDE.md mục 8 "Ra mắt", bước 4).
- Firebase `viogreen-44a7f` (Auth Google + Email/mật khẩu, Firestore) chạy thật: đặt đơn, liên hệ, lead, tài khoản, `/quan-tri/`. Sửa `firestore.rules` thì chủ web phải dán lại vào Console **trước khi push**.
- Đã xong gần đây: thanh toán COD (SPX Express) / chuyển khoản + QR; email, TikTok, YouTube, Shopee; tên miền + sitemap + prelaunch; chọn Tỉnh/thành → Phường/xã theo danh mục mới 34 tỉnh (`npm run dvhc`); bỏ nút "Mua trên Shopee".
- **18/10/2026 – đợt sửa lớn theo "Thông tin làm web.docx" bản mới** (chi tiết CLAUDE.md mục 7): màu #037700 / #ebf2e3, chữ chạy ngang, hero ảnh thật + thời tiết/giờ, nội dung trang chủ mới, **đổi tên SP** (Sol / Grid / Plus / Pro, ECOBOX S / Plus / Pro, bỏ VIO-Care → chọn gói bảo hành 12/18/24 tháng ở trang máy), lọc theo **số lượng cây**, chatbot có lời chào nổi + câu hỏi soạn sẵn, đánh giá + blog dựng sẵn (ẩn). Ảnh gốc ở `images-src/` (không commit) → `npm run images`.

- **05/11/2026 – đợt sửa theo `docs/web_information.docx`** (chi tiết CLAUDE.md mục 6–7): giá 6 ECOHUB + Bio-Tank S/Plus, gộp ECOBOX theo máy S/Plus/Pro (12 SP), Bio-Nutri Box 250 g, ảnh thật + khung phóng to, đầu trang Sản phẩm (băng ảnh trượt) ↔ Liên hệ (ảnh bìa), viền chia rõ menu / chữ chạy / breadcrumb, 5 bài blog. Ảnh tải thẳng từ Drive (link công khai) vào `images-src/2026-11/`.

## Đang dở / chờ
- **Thông số trên ảnh khách gửi lệch dữ liệu web** (số chậu, Sol Pro/Grid Pro dùng nước trực tiếp, công suất, kích thước) – chờ chủ web quyết (CLAUDE.md mục 9).
- **AR:** `npm run models` chuyển STL → GLB. Đã gắn 3D (bản tạm 05/11, dựng thêm tấm pin, hộp Bio-Tank, nút bấm, sọc, logo theo ảnh SP vì CAD thiếu): Sol Plus + Grid Plus (`models-src/may-nho/`), Sol Pro + Grid Pro (12 STL gốc trong `models-src/`, thân 40×40×50 cm). Còn thiếu 3D bản thường Sol / Grid. Chờ khách: file 3D dùng để render ảnh SP (để giống hoàn toàn).
  **07/11/2026: Grid Plus và Sol Plus trên web = bản 3D AI đã chỉnh** (`npm run models:ai`, chi tiết CLAUDE.md mục 8.4); Sol Pro / Grid Pro tạm tắt AR. Với 3D: chủ web muốn **giải thích + hỏi trước khi sửa**, chỉ sửa đúng máy được yêu cầu, kiểm tra ảnh mọi góc trước khi báo xong.
- **Đăng ký tài khoản bằng email:** code xong, chưa ai test thật (Claude không được tạo tài khoản) → chủ web tự thử theo các bước đã gửi trong chat.
- **Địa chỉ cửa hàng** trong `site.ts` vẫn theo đơn vị hành chính cũ ("…Hạ Bằng, Thạch Thất, TP Hà Nội") → chờ khách xác nhận cách ghi mới (Xã Hạ Bằng, Thành phố Hà Nội).
- Việc treo bàn giao (thẻ thanh toán Cloudflare, Firebase support email, UID khách vào `admins`, xoá 3 đơn test, App Check, email báo đơn cần gói Blaze, Chính sách bảo mật): CLAUDE.md mục 8.
- Chờ khách gửi: giá còn lại (Aqua-Tank, Bio-Tank Pro, phụ kiện tưới, phí gói bảo hành 18/24 tháng), ảnh Bio-Nutri, thông số, logo gốc, tên công ty + MST, link Messenger/Zalo/Instagram, nội dung 5 trang chính sách còn thiếu: CLAUDE.md mục 9.

## Lưu ý khi làm việc
- Mỗi thay đổi: `npm run check` → `npm run build` → commit (tác giả `quanyoyo`, email noreply) → push `main`.
- Chạy thử xong phải tắt dev server; nếu cổng 4321 do chủ web tự chạy thì dùng luôn, không tắt.
- Không bịa nội dung kinh doanh (giá, thông số, địa chỉ, đánh giá) – thiếu thì ghi vào "Chờ khách".
- Tài liệu khách: bản mới nhất `docs/web_information.docx` (05/11/2026, `docs/` không commit); bản 18/10 ở `D:\Thông tin làm web.docx` (ngoài repo); đọc bằng Python (`zipfile` + XML) vì máy chưa có pandoc. Ảnh trong file là ảnh chụp màn hình có chú thích yêu cầu sửa.
