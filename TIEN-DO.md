# VIO GREEN – Tiến độ dự án website

*Cập nhật: 07/11/2026. Chi tiết kỹ thuật đầy đủ ở `CLAUDE.md`; tóm tắt cho phiên làm việc mới ở `HANDOFF.md`.*

## 1. Tóm tắt nhanh

| | |
|---|---|
| **Web** | https://viogreen.com (đang chạy thật, **đã ra mắt 05/11/2026**, Google được lập chỉ mục) |
| **Mục đích** | Giới thiệu và nhận *yêu cầu đặt hàng* hệ thống chăm sóc cây thông minh **VIO GREEN ECOHUB**. Nhân viên gọi xác nhận giá, phí ship, thanh toán. Chưa có thanh toán online. |
| **Quy mô** | 34 trang, 12 sản phẩm, 5 bài blog, chatbot MIO, đăng nhập + quản trị đơn |
| **Hosting** | Cloudflare Pages trong tài khoản khách `viogreen102@gmail.com`. Repo `github.com/quanyoyo/viogreen`, push nhánh `main` là tự deploy. `www.viogreen.com` chuyển 301 về `viogreen.com`. |
| **Dữ liệu đơn / liên hệ** | Firebase `viogreen-44a7f` (Auth Google + Email/mật khẩu, Firestore) |
| **Công nghệ** | Astro 7 (trang tĩnh), Tailwind CSS 4, TypeScript, `<model-viewer>` cho AR |

**Tình trạng chung:** phần web đã hoàn thiện và chạy ổn định. Việc còn lại chủ yếu là **chờ khách gửi nội dung** (giá còn thiếu, thông số, ảnh, file 3D gốc, thông tin công ty) và **một số việc bàn giao trong Console** (mục 7).

## 2. Mốc thời gian

| Ngày | Việc |
|---|---|
| 06/10/2026 | Chốt dùng Firebase thay Google Sheet để lưu đơn và liên hệ |
| 07/10/2026 | Firebase chạy thật (đặt đơn, liên hệ, lead, tài khoản, trang quản trị); ảnh MIO tách nền; hero trang chủ 3 slide |
| 14/10/2026 | Chuyển Cloudflare Pages sang tài khoản khách; gắn tên miền `viogreen.com`; chọn địa chỉ theo danh mục hành chính mới (34 tỉnh/thành) |
| 18/10/2026 | Đợt sửa lớn theo "Thông tin làm web.docx": màu mới `#037700` / `#ebf2e3`, chữ chạy ngang, hero ảnh thật + thời tiết, đổi tên sản phẩm, lọc theo số cây, chọn gói bảo hành |
| 05/11/2026 | Sửa theo `web_information.docx`: giá thật 8 mục, gộp ECOBOX theo máy (16 → 12 SP), Bio-Nutri Box, ảnh SP thật + phóng to, 5 bài blog; **ra mắt** (mở cho Google); AR bản tạm cho 4 máy Plus / Pro |
| 06/11/2026 | Tạm tắt AR Sol Pro / Grid Pro (khách chỉ cần AR bản Plus) |
| 07/11/2026 | **AR Grid Plus thay bằng bản 3D AI đã chỉnh** (chủ web duyệt) |

## 3. Đã xong

### Trang và chức năng
- **Trang:** Trang chủ, Sản phẩm (nhóm, bộ lọc, tìm kiếm không dấu), 12 trang chi tiết, Giỏ hàng, Đặt hàng, Đặt hàng thành công, Giới thiệu, Trải nghiệm AR, Liên hệ, 4 trang chính sách, Tin tức (5 bài), 404, Đăng nhập, Tài khoản, Quản trị.
- **Đặt hàng:** giỏ hàng lưu trên máy khách, có biến thể và số lượng, giá theo lựa chọn; chọn Tỉnh/thành → Phường/xã theo danh mục mới; thanh toán **COD (SPX Express)** hoặc **chuyển khoản** (trang thành công hiện QR + số tài khoản + nội dung = mã đơn). Mã đơn dạng `VG-yymmdd-XXXX`.
- **Tài khoản (tuỳ chọn):** đăng nhập Google hoặc email; xem lịch sử đơn; lưu hồ sơ địa chỉ.
- **Quản trị `/quan-tri/`:** nhân viên xem và đổi trạng thái đơn (Mới → Đã xác nhận → Đang giao → Hoàn tất / Đã huỷ), xem liên hệ và lead.
- **Chatbot MIO:** lời chào nổi, câu hỏi thường gặp, tư vấn chọn máy qua 3 câu hỏi, trả lời giá / FAQ / chính sách, xin tên + SĐT khi không hiểu câu hỏi (lưu vào Firestore), báo ngoài giờ làm việc.
- **SEO:** meta, Open Graph, JSON-LD (Organization, FAQPage, Product, Breadcrumb), sitemap, robots.txt; các trang giỏ hàng / đặt hàng / tài khoản / quản trị / 404 để noindex.
- **Giao diện:** hiệu ứng hiện dần khi cuộn, hero chuyển slide, thẻ sản phẩm nổi khi rê chuột; dùng tốt trên điện thoại 360 px và máy tính.

### Sản phẩm (12)
- **ECOHUB (6):** Sol, Grid, Sol Plus, Grid Plus, Sol Pro, Grid Pro – đã có giá và ảnh thật.
- **ECOBOX (2):** Bio-Tank, Aqua-Tank – chọn theo máy S / Plus / Pro.
- **Phụ kiện tưới (2):** Bio-Dripper, Hose 6/8/10 mm.
- **Dinh dưỡng (2):** Bio-Nutri 25g pack, Bio-Nutri Box 250g.

### AR / 3D
| Máy | Trạng thái AR |
|---|---|
| **Grid Plus** | **Bản 3D AI đã chỉnh (07/11/2026)** – dựng lại bằng `npm run models:ai` |
| Sol Plus | Bản tạm dựng từ CAD (05/11/2026). Bản AI đã làm một phần, **chưa duyệt lên web** |
| Sol Pro, Grid Pro | Có file 3D (bản tạm từ CAD) nhưng **tạm tắt AR** theo yêu cầu khách |
| Sol, Grid (bản thường) | Chưa có 3D → hiện "Đang cập nhật" |

## 4. Đang làm / việc tiếp theo

1. **3D Grid Plus – các điểm nhỏ còn lại** (chờ chủ web quyết có sửa không):
   - Khe đen ngắn ở nắp hộp Bio-Tank, chỉ thấy khi nhìn thẳng từ trên xuống.
   - Mép ngoài nắp hơi gồ ghề quanh hộp Bio-Tank.
   - Vài khía rất nhỏ ở mép dưới mặt lưng; một đường cong rất mờ ở giữa lưng.
   - Mặt đáy có một mảng đen, chỉ thấy khi nhìn từ dưới lên.
2. **3D Sol Plus:** quyết định có làm tiếp bản AI (như Grid Plus) rồi thay lên web không.
3. **Google Search Console** (cần tài khoản Google của khách / chủ web): thêm `viogreen.com`, gửi sitemap `https://viogreen.com/sitemap-index.xml`, yêu cầu lập chỉ mục trang chủ.
4. **Sau v1 (chỉ làm khi được yêu cầu):** chatbot AI, thanh toán online VNPay / MoMo, Web App 360×640 (chờ quyền Figma).

## 5. Chờ khách gửi / quyết định

- **Giá còn thiếu:** Bio-Tank máy Pro, Aqua-Tank (cả 3), Bio-Dripper, Hose (theo cỡ, độ dài); phí gói bảo hành 18 / 24 tháng. Bio-Nutri: chủ web nói chưa cần giá.
- **Thông số trên ảnh khách gửi lệch dữ liệu web:** số chậu theo từng dòng máy, Sol Pro / Grid Pro dùng nước trực tiếp hay bình chứa, công suất, kích thước.
- **Chính sách giao hàng:** dòng chữ chạy "Giao hàng miễn phí từ 2.000.000đ" rộng hơn chính sách vận chuyển (chỉ miễn phí ở Hà Nội) – cần chốt.
- **Sản phẩm:** phụ kiện đi kèm trong hộp từng model; mô tả Bio-Tank Pro; ảnh Bio-Nutri; tên phụ kiện trên ảnh khác tên trên web (VIO Dripper Set / VIO Micro-Hose).
- **Doanh nghiệp:** địa chỉ theo đơn vị hành chính mới, tên công ty, mã số thuế.
- **Liên kết:** Messenger, Zalo, Instagram (icon đang ẩn, có link là tự hiện).
- **Nội dung 5 trang chưa có:** Mua hàng & thanh toán, Đại lý, Điều khoản dịch vụ, Hướng dẫn mua hàng, Hướng dẫn thanh toán.
- **File:** file 3D gốc dùng để render ảnh SP (để 3D giống ảnh hoàn toàn), logo gốc SVG/PNG.
- **Đánh giá khách hàng thật** (mục đánh giá đang ẩn, có là tự hiện).
- **Email / Zalo nhận thông báo đơn mới** (cho bước email báo đơn).

## 6. Cần khách xác nhận

- FAQ câu 2, 5, 6 đã sửa nhẹ so với Figma (bỏ chữ "demo / mô phỏng", "cartridge" → ECOBOX / Bio-Nutri).
- Đăng ký tài khoản bằng email: code xong, chủ web cần tự thử một lần.

## 7. Việc bàn giao (làm trong Console, chủ web / khách thực hiện)

- **Cloudflare:** đổi thẻ thanh toán (đang là thẻ của quanyoyo; tên miền tự gia hạn sau 4 năm) sang thẻ của khách.
- **Firebase:**
  - Đổi Project support email sang `viogreen102@gmail.com`.
  - Thêm UID của khách vào `admins` để khách vào được trang quản trị.
  - Xoá 3 đơn test (`VG-261007-C7GX`, `VG-261014-JSMX`, `VG-261014-RBL4`).
  - Bật App Check chống spam form.
- **Email báo đơn mới:** cần nâng Firebase lên gói Blaze (đặt cảnh báo ngân sách), cung cấp email nhận + tài khoản gửi.
- **Chính sách bảo mật:** cập nhật theo cách lưu dữ liệu mới (Firebase, tài khoản khách; Nghị định 13/2023) – cần khách duyệt nội dung.
- **GitHub:** repo vẫn ở tài khoản `quanyoyo`, chuyển cho khách khi cần.

## 8. Cách cập nhật web

```bash
npm run dev        # chạy thử ở http://localhost:4321
npm run check      # kiểm tra lỗi
npm run build      # xuất trang ra dist/
npm run images     # ảnh gốc images-src/ → WebP trong public/
npm run models     # 3D từ CAD (STL) → public/models/ (bỏ qua Grid Plus)
npm run models:ai  # 3D AI Grid Plus → public/models/ecohub-grid-plus.glb
```

- Nội dung và cấu hình chỉ sửa trong `src/data/` (`site.ts` = liên hệ, ngân hàng, chữ chạy; `products.ts` = sản phẩm, giá) và `public/` (ảnh, 3D).
- Bài blog mới: thêm file `.md` vào `src/content/blog/`. Đánh giá thật: điền vào `src/data/reviews.ts`.
- Sửa xong: `npm run check` → `npm run build` → commit → push `main` (Cloudflare tự deploy sau khoảng 1–2 phút).
- Sửa `firestore.rules` thì phải dán lại vào Firebase Console → Publish **trước khi** push code.
