# VIO GREEN web – bàn giao giữa các phiên chat (cập nhật 24/11/2026)

**Nguồn sự thật là `CLAUDE.md`** (quy tắc, stack, trạng thái mục 7, việc tiếp theo mục 8, chờ khách mục 9). File này chỉ tóm tắt nhanh để mở phiên mới. Báo cáo tiến độ cho chủ web / khách: `TIEN-DO.md`.

## Đang ở đâu
- Web chạy thật ở **https://viogreen.com** (Cloudflare Pages trong tài khoản khách `viogreen102@gmail.com`; `www` 301 về đây; `viogreen.pages.dev` vẫn vào được). Repo `github.com/quanyoyo/viogreen`, push `main` là tự deploy (khoảng 1 phút).
- **Đã ra mắt 05/11/2026** (`site.ts → prelaunch: false`). Còn bước Google Search Console (CLAUDE.md mục 8 "Ra mắt", bước 4).
- Firebase `viogreen-44a7f` (Auth Google + Email/mật khẩu, Firestore) chạy thật: đặt đơn, liên hệ, lead, tài khoản, `/quan-tri/`. Sửa `firestore.rules` thì chủ web phải dán lại vào Console **trước khi push**.
- Tài liệu khách mới nhất: `docs/Thông tin làm web.docx` (11/11/2026). `docs/` và `images-src/` không commit.

## Các đợt gần đây (chi tiết CLAUDE.md mục 7)
- **11/11:** sửa theo tài liệu 11/11 – giá mới cho 8 mục, ECOBOX + Bio-Dripper + Hose thành **hàng tặng – không bán** (`gift: true`), bộ lọc số chậu / chế độ cấp nước, địa chỉ mới. AR Sol Pro / Grid Pro dựng lại theo ảnh máy thật; Sol, Grid, Sol Plus, Grid Plus **tạm** dùng model Pro thu nhỏ đúng cỡ (`npm run models:tam`).
- **12/11:** AR Pro sửa mặt trước quanh logo (logo dán như ảnh đục, hết ô sáng trên iPhone); dòng hướng dẫn AR tự đổi theo máy; trang `/kiem-tra-ar/`.
- **13/11:** Chrome trên iPhone ướm được nếu khách chọn tải thêm `.usdz` (`npm run models:usdz`); vòng xoay khi mở AR; trang chủ bỏ 3 khối; đánh giá khách hàng (random 3 đánh giá 4–5 sao) + form nhận xét ở trang sản phẩm.
- **14/11:** ảnh Bio-Nutri mới từ Drive (`images-src/2026-11/bio-nutri-moi/`): 25g trước/sau, Box = hộp đơn 250g + 3 hộp. Commit `704b2fc`, đã push và kiểm tra trên web.
- **17/11:** form đánh giá: email vào trường `email` (trước bị mất khi email > 20 ký tự), ngày theo giờ máy khách. **Đánh giá khách gửi → Firestore `reviews` (chờ duyệt) → chủ web duyệt ở `/quan-tri/` tab Đánh giá → hiện công khai ở trang SP** (đọc qua REST, `public-reviews.ts`). Rules mới đã publish. Đã thử đủ vòng, TEST đã xoá. Trang chủ vẫn chỉ dùng `reviews.ts`.
- **24/11:** **thẻ thông báo thu thập thông tin** (khách yêu cầu) – `PrivacyNotice.astro`, chữ ở `site.ts → privacyNotice`, chỉ có nút "Đã hiểu" (web không có công cụ theo dõi; gắn Analytics/Pixel sau này thì phải thêm nút Từ chối + tăng `version`). Điện thoại: MIO nhích lên trên thẻ, lời chào đợi bấm "Đã hiểu". Chính sách bảo mật có 2 câu chưa khớp → chờ khách duyệt (CLAUDE.md mục 9).

## Đang dở / chờ
- **Đánh giá khách hàng:** `reviews.ts` có 5 đánh giá; CLAUDE.md trước ghi là "đánh giá mẫu" → cần chủ web xác nhận là đánh giá thật (quy tắc không dùng đánh giá giả).
- **Tên 2 phụ kiện tưới** đang hỏi khách (giữ slug nếu đổi tên).
- **AR:** chờ file 3D gốc để có model riêng cho Sol / Grid / Plus; chưa làm mã QR trên máy tính. Với 3D: chủ web muốn **giải thích + hỏi trước khi sửa**, chỉ sửa đúng máy được yêu cầu, kiểm tra ảnh mọi góc trước khi báo xong.
- **Đăng ký tài khoản bằng email:** code xong, chủ web tự thử.
- Việc treo bàn giao (thẻ thanh toán Cloudflare, Firebase support email, UID khách vào `admins`, xoá 3 đơn test, App Check, email báo đơn cần gói Blaze, Chính sách bảo mật): CLAUDE.md mục 8.
- Chờ khách gửi (phí bảo hành 18/24 tháng, công suất / kích thước, giao hàng miễn phí, địa chỉ theo đơn vị mới, tên công ty + MST, link Messenger/Zalo/Instagram, 5 trang chính sách, file 3D gốc, logo gốc): CLAUDE.md mục 9.

## Lưu ý khi làm việc
- Mỗi thay đổi: `npm run check` → `npm run build` → commit (tác giả `quanyoyo`, email noreply) → push `main`.
- Xong một đợt sửa: cập nhật `CLAUDE.md` mục 7, `TIEN-DO.md` và file này.
- Chạy thử xong phải tắt dev server; nếu cổng 4321 do chủ web tự chạy thì dùng luôn, không tắt.
- Không bịa nội dung kinh doanh (giá, thông số, địa chỉ, đánh giá) – thiếu thì ghi vào "Chờ khách".
- Thư mục Drive khách gửi để "ai có link cũng xem được" → tải thẳng bằng `curl` (danh sách file: `drive.google.com/embeddedfolderview?id=<ID>`). Đọc `.docx` bằng unzip + XML (máy chưa có pandoc).
