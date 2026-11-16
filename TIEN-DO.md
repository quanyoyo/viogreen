# VIO GREEN – Tiến độ dự án website

*Cập nhật: 17/11/2026. Chi tiết kỹ thuật đầy đủ ở `CLAUDE.md`; tóm tắt cho phiên làm việc mới ở `HANDOFF.md`.*

## 1. Tóm tắt nhanh

| | |
|---|---|
| **Web** | https://viogreen.com (đang chạy thật, **đã ra mắt 05/11/2026**, Google được lập chỉ mục) |
| **Mục đích** | Giới thiệu và nhận *yêu cầu đặt hàng* hệ thống chăm sóc cây thông minh **VIO GREEN ECOHUB**. Nhân viên gọi xác nhận giá, phí ship, thanh toán. Chưa có thanh toán online. |
| **Quy mô** | 35 trang, 12 sản phẩm, 5 bài blog, chatbot MIO, AR cho cả 6 máy, đăng nhập + quản trị đơn |
| **Hosting** | Cloudflare Pages trong tài khoản khách `viogreen102@gmail.com`. Repo `github.com/quanyoyo/viogreen`, push nhánh `main` là tự deploy. `www.viogreen.com` chuyển 301 về `viogreen.com`. |
| **Dữ liệu đơn / liên hệ** | Firebase `viogreen-44a7f` (Auth Google + Email/mật khẩu, Firestore) |
| **Công nghệ** | Astro 7 (trang tĩnh), Tailwind CSS 4, TypeScript, `<model-viewer>` cho AR |

**Tình trạng chung:** web đã hoàn thiện và chạy ổn định, giá đủ cho mọi sản phẩm đang bán. Việc còn lại chủ yếu là **chờ khách gửi / xác nhận nội dung** (mục 5–6) và **một số việc bàn giao trong Console** (mục 7).

## 2. Mốc thời gian

| Ngày | Việc |
|---|---|
| 06/10/2026 | Chốt dùng Firebase thay Google Sheet để lưu đơn và liên hệ |
| 07/10/2026 | Firebase chạy thật (đặt đơn, liên hệ, lead, tài khoản, trang quản trị); ảnh MIO tách nền; hero trang chủ 3 slide |
| 14/10/2026 | Chuyển Cloudflare Pages sang tài khoản khách; gắn tên miền `viogreen.com`; chọn địa chỉ theo danh mục hành chính mới (34 tỉnh/thành) |
| 18/10/2026 | Đợt sửa lớn theo "Thông tin làm web.docx": màu mới `#037700` / `#ebf2e3`, chữ chạy ngang, hero ảnh thật + thời tiết, đổi tên sản phẩm, lọc theo số cây, chọn gói bảo hành |
| 05/11/2026 | Sửa theo `web_information.docx`: giá thật, gộp ECOBOX theo máy (16 → 12 SP), Bio-Nutri Box, ảnh SP thật + phóng to, 5 bài blog; **ra mắt** (mở cho Google) |
| 07/11/2026 | AR Grid Plus và Sol Plus dùng bản 3D AI đã chỉnh (từ 11/11 thay bằng bản Pro thu nhỏ, xem dưới) |
| 11/11/2026 | Sửa theo `Thông tin làm web.docx` bản 11/11 (15 yêu cầu): **giá mới**, 4 phụ kiện thành **hàng tặng – không bán**, bộ lọc theo số chậu / chế độ cấp nước, địa chỉ mới, chữ và bố cục nhiều trang. **AR Sol Pro / Grid Pro dựng lại theo ảnh máy thật và bật lại**; Sol, Grid, Sol Plus, Grid Plus tạm dùng model Pro thu nhỏ đúng kích thước thật |
| 12/11/2026 | AR: sửa mặt trước quanh logo (hết ô vuông lệch màu, kể cả trên iPhone); dòng hướng dẫn tự đổi theo loại máy; trang chẩn đoán `/kiem-tra-ar/` |
| 13/11/2026 | Chrome trên iPhone cũng ướm AR được (khách tự chọn tải thêm file); vòng xoay chờ khi mở AR; rút gọn trang chủ (bỏ 3 khối); hiện đánh giá khách hàng + form nhận xét ở từng sản phẩm |
| 14/11/2026 | **Ảnh Bio-Nutri mới** (ảnh dựng sẵn từ Drive): gói 25g mặt trước + mặt sau; Box = hộp đơn 250g + ảnh 3 hộp |
| 17/11/2026 | Form đánh giá: sửa lỗi mất đánh giá khi khách nhập email dài, sửa ngày lệch trước 7h sáng. **Đánh giá khách gửi hiện công khai sau khi chủ web duyệt** ở `/quan-tri/` (tab Đánh giá) |

## 3. Đã xong

### Trang và chức năng
- **Trang:** Trang chủ, Sản phẩm (nhóm, bộ lọc, tìm kiếm không dấu), 12 trang chi tiết, Giỏ hàng, Đặt hàng, Đặt hàng thành công, Giới thiệu, Trải nghiệm AR, Liên hệ, 4 trang chính sách, Tin tức (5 bài), 404, Đăng nhập, Tài khoản, Quản trị, trang chẩn đoán AR `/kiem-tra-ar/` (ẩn, chỉ để nhờ khách kiểm tra máy).
- **Đặt hàng:** giỏ hàng lưu trên máy khách, có biến thể và số lượng, giá theo lựa chọn; chọn Tỉnh/thành → Phường/xã theo danh mục mới; thanh toán **COD (SPX Express)** hoặc **chuyển khoản** (trang thành công hiện QR + số tài khoản + nội dung = mã đơn). Mã đơn dạng `VG-yymmdd-XXXX`.
- **Tài khoản (tuỳ chọn):** đăng nhập Google hoặc email; xem lịch sử đơn; lưu hồ sơ địa chỉ.
- **Quản trị `/quan-tri/`:** nhân viên xem và đổi trạng thái đơn (Mới → Đã xác nhận → Đang giao → Hoàn tất / Đã huỷ), xem liên hệ và lead, **duyệt / ẩn / xoá đánh giá khách gửi**.
- **Đánh giá:** trang chủ hiện ngẫu nhiên 3 đánh giá 4–5 sao (lấy từ danh sách nhập tay). Mỗi trang sản phẩm có danh sách đánh giá, điểm trung bình và form để khách tự viết đánh giá. Đánh giá khách gửi chờ chủ web **duyệt** rồi mới hiện cho mọi người; người gửi thấy ngay đánh giá của mình kèm nhãn "chờ duyệt". SĐT / email người gửi không bao giờ hiện công khai.
- **Chatbot MIO:** lời chào nổi, 4 câu hỏi thường gặp, tư vấn chọn máy qua 3 câu hỏi, trả lời giá / FAQ / chính sách, xin tên + SĐT khi không hiểu câu hỏi (lưu vào Firestore), báo ngoài giờ làm việc.
- **SEO:** meta, Open Graph, JSON-LD (Organization, FAQPage, Product, Breadcrumb), sitemap, robots.txt; các trang giỏ hàng / đặt hàng / tài khoản / quản trị / 404 để noindex.
- **Giao diện:** hiệu ứng hiện dần khi cuộn, hero chuyển slide, thẻ sản phẩm nổi khi rê chuột; dùng tốt trên điện thoại 360 px và máy tính.

### Sản phẩm (12)
- **ECOHUB (6):** Sol, Grid, Sol Plus, Grid Plus, Sol Pro, Grid Pro – có giá, ảnh thật, ảnh thông số, AR.
- **ECOBOX (2):** Bio-Tank, Aqua-Tank – chọn theo máy S / Plus / Pro. **Hàng tặng – không bán.**
- **Phụ kiện tưới (2):** Bio-Dripper, Hose 6/8/10 mm. **Hàng tặng – không bán.**
- **Dinh dưỡng (2):** Bio-Nutri 25g pack (29.000đ), Bio-Nutri Box 250g (209.000đ) – ảnh mới 14/11.

### AR / 3D (bật cho cả 6 máy)
| Máy | Trạng thái AR |
|---|---|
| **Sol Pro** | Dựng lại theo ảnh máy năng lượng mặt trời thật (11/11/2026), màu đã hiệu chỉnh theo ảnh |
| **Grid Pro** | Như Sol Pro nhưng bỏ tấm pin, không sọc đen, thân 1 màu (chưa có ảnh Grid Pro thật) |
| **Sol, Grid, Sol Plus, Grid Plus** | **Tạm** dùng model Pro thu nhỏ đúng kích thước thật (Sol/Grid 30×30×40 cm, Plus 25×25×35 cm) – chờ file 3D gốc |

- Chế độ "Xem trong không gian của bạn" **chỉ chạy trên điện thoại**. iPhone: Safari ướm được ngay; Chrome và trình duyệt khác hiện lời mời mở bằng Safari, hoặc bấm "Vẫn dùng trình duyệt này" để tải thêm file AR (~6–7,5 MB).
- Máy không ướm được thì dòng hướng dẫn dưới khung 3D tự đổi (mở bằng điện thoại, mở bằng Safari/Chrome, cài Google Play Services for AR…).
- Bản 3D AI của 2 máy Plus (07/11) vẫn được giữ lại, chỉ không gắn vào web.

## 4. Việc tiếp theo

1. **Google Search Console** (cần tài khoản Google của khách / chủ web): thêm `viogreen.com`, gửi sitemap `https://viogreen.com/sitemap-index.xml`, yêu cầu lập chỉ mục trang chủ.
2. **AR – mã QR trên máy tính** để quét mở trang bằng điện thoại (chờ chủ web đồng ý làm).
3. **Sau v1 (chỉ làm khi được yêu cầu):** chatbot AI, thanh toán online VNPay / MoMo, Web App 360×640 (chờ quyền Figma).

## 5. Chờ khách gửi / quyết định

- **Đánh giá khách hàng:** web đang hiện 5 đánh giá (Mai Lan, Quốc Tuấn, Hoàng Nam, Thanh Hương – 5 sao; Đức Huy – 4 sao). **Cần xác nhận đây là đánh giá thật của khách**; nếu là đánh giá mẫu thì nên gỡ xuống.
- **Phí gói bảo hành 18 / 24 tháng** (giá máy hiện kèm gói 12 tháng).
- **Tên 2 phụ kiện tưới:** tài liệu dùng cả "Bio-Dripper / VIO GREEN Hose" lẫn "VIO Dripper Set / VIO Micro-Hose" – web đang giữ tên cũ.
- **Thông số máy:** công suất (100 / 130 / 250 W) và kích thước có in trên ảnh thông số – có đưa vào bảng thông số trên web không? Sol Pro / Grid Pro nay là cấp nước "Tự động" nhưng mô tả vẫn nói bình chứa – cần chốt.
- **Grid Pro:** chưa có ảnh máy thật (màu công tắc, nút) – web tạm dùng theo máy Sol Pro.
- **Chính sách giao hàng:** dòng chữ chạy "Giao hàng miễn phí từ 2.000.000đ" rộng hơn chính sách vận chuyển (chỉ miễn phí ở Hà Nội) – cần chốt.
- **Sản phẩm:** phụ kiện đi kèm trong hộp từng model; mô tả Bio-Tank bản Pro (dung tích, kích thước).
- **Doanh nghiệp:** địa chỉ theo đơn vị hành chính mới (địa chỉ khách gửi 11/11 còn ghi "Quận Hà Đông"), tên công ty, mã số thuế.
- **Liên kết:** Messenger, Zalo, Instagram (icon đang ẩn, có link là tự hiện).
- **Nội dung 5 trang chưa có:** Mua hàng & thanh toán, Đại lý, Điều khoản dịch vụ, Hướng dẫn mua hàng, Hướng dẫn thanh toán.
- **File:** file 3D gốc dùng để render ảnh SP (để 3D giống ảnh hoàn toàn và có 3D riêng cho Sol / Grid / Plus), logo gốc SVG/PNG.
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
- **Lưu ý bàn giao:** thư mục `docs/` (tài liệu khách) và `images-src/` (ảnh gốc) không nằm trong repo – nhớ chép kèm (ảnh gốc vẫn còn trên Google Drive).

## 8. Cách cập nhật web

```bash
npm run dev          # chạy thử ở http://localhost:4321
npm run check        # kiểm tra lỗi
npm run build        # xuất trang ra dist/
npm run images       # ảnh gốc images-src/ → WebP trong public/
npm run models       # 3D từ CAD (STL) → public/models/
npm run models:tam   # 3D tạm cho Sol / Grid / Plus (bản Pro thu nhỏ)
npm run models:usdz  # file AR cho iPhone – chạy lại sau mỗi lần dựng lại 3D
```

- Nội dung và cấu hình chỉ sửa trong `src/data/` (`site.ts` = liên hệ, ngân hàng, chữ chạy; `products.ts` = sản phẩm, giá, ảnh) và `public/` (ảnh, 3D).
- Bài blog mới: thêm file `.md` vào `src/content/blog/`. Đánh giá thật: điền vào `src/data/reviews.ts`.
- Sửa xong: `npm run check` → `npm run build` → commit → push `main` (Cloudflare tự deploy sau khoảng 1–2 phút).
- Sửa `firestore.rules` thì phải dán lại vào Firebase Console → Publish **trước khi** push code.
