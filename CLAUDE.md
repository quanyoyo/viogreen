# CLAUDE.md – VIO GREEN Website

Tài liệu định hướng cho Claude Code. Đọc file này trước khi làm bất kỳ việc gì trong repo.

## 1. Dự án là gì

Website giới thiệu và bán hàng cho **VIO GREEN ECOHUB**, hệ thống chăm sóc cây thông minh cho ban công, sân thượng và không gian xanh đô thị (tưới tự động, quản lý dinh dưỡng, năng lượng mặt trời, AR ướm thử).

- **Ngôn ngữ web:** tiếng Việt.
- **Quy mô:** dự án nhỏ. Ưu tiên đơn giản, tải nhanh, dễ bàn giao. Không thêm database, CMS hay đăng nhập nếu chưa được yêu cầu.
- **Mô hình bán hàng v1:** khách gửi *yêu cầu đặt hàng*. Nhân viên gọi xác nhận giá, phí vận chuyển và hình thức thanh toán. **Chưa có thanh toán online.**

## 2. Quy tắc làm việc (bắt buộc)

1. **Gặp trở ngại thì báo trước, chờ quyết định rồi mới làm tiếp.** Ví dụ trở ngại: không cài được package, mạng bị chặn, thiếu quyền truy cập Figma. Không tự ý đổi stack hay hướng làm.
2. **Không bịa nội dung kinh doanh:** giá, thông số kỹ thuật, đánh giá khách hàng, địa chỉ, số liệu. Thiếu thì dùng placeholder rõ ràng và ghi vào mục "Chờ khách" bên dưới.
3. **Không dùng đánh giá khách hàng giả.** Mục đánh giá ẩn cho tới khi có đánh giá thật.
4. **Mọi thông tin liên hệ và cấu hình lấy từ `src/data/site.ts`.** Không hardcode trong component.
5. Sau mỗi thay đổi đáng kể, chạy lần lượt `npm run check` rồi `npm run build`. Chỉ báo xong khi cả hai pass.
6. Cập nhật mục **Trạng thái** của file này khi hoàn thành một hạng mục.

## 3. Stack và lệnh

- **Framework:** Astro 7 (xuất trang tĩnh) + Tailwind CSS 4 (`@tailwindcss/vite`) + TypeScript.
- **Icon:** `lucide-static` (import `?raw`) + icon thương hiệu trong `src/components/icons.ts`.
- **JS phía trình duyệt:** TypeScript thuần trong `src/scripts/`. Không dùng React/Vue.
- **Firebase** (project `viogreen-44a7f`, config trong `site.ts → firebase`): Auth (Google + Email/mật khẩu) + Firestore. Form đặt hàng/liên hệ/nhận tin/lead chatbot ghi vào Firestore (`src/scripts/forms.ts` → `fb.ts`). Quy tắc bảo mật: `firestore.rules` (dán vào Console, **không** tự deploy). Cloud Functions gửi email báo đơn: chưa làm (cần gói Blaze). Hosting **vẫn là Cloudflare Pages**.
- **`src/scripts/fb.ts` kéo theo SDK ~540KB**: chỉ import tĩnh ở trang `/dang-nhap/`, `/tai-khoan/`, `/quan-tri/`; nơi khác dùng `await import('./fb')`. Không import tĩnh từ BaseLayout.
- **AR:** `<model-viewer>`, chỉ tải khi sản phẩm có file 3D.
- **Hosting:** Cloudflare Pages trong **tài khoản Cloudflare của khách** (`viogreen102@gmail.com`; quanyoyo là thành viên quyền Administrator). Build `npm run build`, output `dist`. Repo vẫn là `github.com/quanyoyo/viogreen`; **push lên `main` là tự deploy**.
- **Tên miền chính:** `https://viogreen.com` (mua qua Cloudflare Registrar, 4 năm). `www.viogreen.com` phải 301 về `viogreen.com` (Redirect Rule trong dashboard, xem mục 8). URL gốc khai báo ở `astro.config.mjs → site` và `site.ts → website` (giữ hai chỗ khớp nhau).
- **Sitemap:** `@astrojs/sitemap` → `/sitemap-index.xml` (bỏ các trang noindex, danh sách `NO_SITEMAP` trong `astro.config.mjs`); `robots.txt` có dòng `Sitemap:` và **không chặn trang nào**.
- **Chế độ trước ra mắt:** `site.ts → prelaunch`. **Đã tắt (`false`) ngày 05/11/2026 – web đã mở cho Google.** Bật lại (`true`) = mọi trang có `<meta name="robots" content="noindex">`.
- **Node:** 22 trở lên.

```bash
npm install
npm run dev      # http://localhost:4321
npm run check    # astro check (type + template)
npm run build    # xuất ra dist/
npm run preview
npm run images   # ảnh gốc images-src/ → WebP trong public/ (scripts/optimize-images.mjs)
```

- **Ảnh gốc khách gửi:** `images-src/` (không commit; bản gốc ở Google Drive "Ảnh làm web"). Đã đổi tên cho rõ nghĩa. Danh sách ảnh nào → file nào trong `public/` khai báo ở `scripts/optimize-images.mjs`; ảnh máy Sol có nền "ô cờ" giả in liền → script tự tô trắng (`clearChecker`).
  - Đợt 05/11/2026: `images-src/2026-11/san-pham/` (Drive "ảnh sản phẩm" + thư mục con "SẢN PHẨM PHỤ KIỆN"), `images-src/2026-11/blog-doc/` (ảnh bài blog, lấy từ `web_information.docx`). Các thư mục Drive trong tài liệu để chế độ "ai có link cũng xem được" → tải được thẳng bằng script, không cần khách tải hộ.
- **Tài liệu khách:** `docs/web_information.docx` (05/11/2026, bản mới nhất; `docs/` không commit) = bản `D:\Thông tin làm web.docx` (18/10) + phần mới ở đầu (giá, ECOBOX theo máy, Bio-Nutri Box, ảnh, bố cục) + 5 bài blog. Máy chưa có pandoc → đọc bằng `zipfile`/unzip + XML.

## 4. Cấu trúc thư mục

```
src/
  pages/                 index, san-pham/(index|[slug]), gio-hang, dat-hang, dat-hang-thanh-cong,
                         gioi-thieu, trai-nghiem-ar, lien-he, chinh-sach/[slug], 404,
                         tin-tuc/(index|[slug]) (blog – ẩn khỏi menu/sitemap khi chưa có bài),
                         dang-nhap, tai-khoan, quan-tri (3 trang này dùng Firebase, noindex)
  layouts/BaseLayout.astro   head/SEO, Header, NoticeBar, Footer, Chatbot, AR modal
  components/            Header, NoticeBar (chữ chạy ngang), Footer, ProductCard, PolicyStrip, CtaBand, SectionHead,
                         Ph (ảnh tạm), Chatbot, ArModal, ContactForm, Breadcrumbs, Logo, Social, Icon,
                         Coverflow (băng ảnh trượt: ảnh giữa to, 2 ảnh bên nằm một phần dưới – đầu trang Sản phẩm)
  scripts/               ui.ts (reveal, carousel, menu), cart.ts, forms.ts, ar.ts, chatbot.ts, data.ts,
                         fb.ts (Firebase: auth, đơn, lead, quản trị), order-view.ts (hiển thị đơn dùng chung),
                         address.ts (chọn Tỉnh/thành → Phường/xã),
                         product-page.ts (trang chi tiết: đổi ảnh, khung phóng to ảnh, giá theo lựa chọn, ?may=s|plus|pro)
  data/                  site.ts (cấu hình, notice, weather), products.ts (12 SP), faq.ts, chatbot-kb.ts (+ quickQuestions),
                         reviews.ts (đánh giá THẬT – trống = ẩn), blog.ts (đọc src/content/blog)
  content/policies/      van-chuyen, doi-tra, bao-hanh, bao-mat (.md; {{address}} {{email}}… thay từ site.ts)
  content/blog/          bài viết .md (mẫu: _mau-bai-viet.md; file "_…" hoặc draft: true không hiện) – 5 bài từ 05/11/2026
  styles/global.css      design tokens + hiệu ứng
firestore.rules          quy tắc bảo mật Firestore (dán vào Console → Firestore → Rules → Publish)
public/                  favicon-48.png, apple-touch-icon.png, robots.txt, _headers, _redirects (301 slug cũ),
                         assets/ (logo.png, mio-*.webp, hero-1..3, bia-1, banner-san-pham, ecohub-sol-va-grid – có bản -800),
                         products/ (ảnh SP 1600px + bản -800; "-info" = ảnh có chữ), blog/ (ảnh bài viết), models/,
                         data/dvhc.json (34 tỉnh/thành + 3.321 phường/xã – tạo bằng `npm run dvhc`)
.claude/launch.json      cấu hình dev server cho Browser pane (tên "dev")
```

## 5. Design system

- **Nguồn thiết kế:** Figma file `QuAedwzzxIiw4feFi7PJWX`. Layout và nội dung lấy từ Figma; các sửa đổi sau đó theo "Thông tin làm web.docx".
- **Màu (đổi 18/10/2026 theo yêu cầu khách):** xanh chủ đạo (primary) `#037700` (thang `brand-50…900` pha từ màu này), nền "be" cũ → `#ebf2e3` (`cream`, `cream-200`), chữ đậm `#1b2a1c`. Token trong `src/styles/global.css`. Ảnh tạm dùng component `Ph`.
- **Font:** Inter.
- **Phong cách và hiệu ứng** (tham khảo banhcaynguvi.com, *chỉ lấy cảm giác và chuyển động, không lấy màu*):
  - reveal khi cuộn: fade-up 28px, stagger
  - Ken Burns "breath" 12s và light sweep trên ảnh hero
  - nút chat nổi = MIO đứng toàn thân (cao 75px mobile / 96px desktop), nhún nhẹ `animate-mio-float` + bóng chân `animate-mio-shadow`; bong bóng lời chào "Xin chào, mình là MIO! MIO giúp gì cho bạn?" cạnh MIO (xem mục 7 Chatbot)
  - chữ chạy ngang dưới menu (`NoticeBar`, `animate-marquee`, dừng khi rê chuột); menu: mục đang mở là khung trắng viền xanh
  - hover thẻ: nổi lên, bóng mềm màu xanh, đổi viền; easing `cubic-bezier(.25,.8,.25,1)` khoảng 0.35s
  - eyebrow chữ hoa giãn chữ, số thứ tự 01–0n, icon trong vòng tròn viền mảnh
- **Responsive:** Figma chỉ có bản desktop 1440px, bản mobile tự chuyển đổi. Phải dùng tốt ở 360px.

### Figma frame IDs

| Trang | Node | Trang | Node |
|---|---|---|---|
| Trang chủ | 18:90 | Giỏ hàng | 280:4032 |
| Sản phẩm | 254:584 | Đặt hàng | 280:4258 |
| Chi tiết | 278:1460 | Giới thiệu | 264:1521 |
| Vận chuyển | 276:222 | Trải nghiệm AR | 263:1259 |
| Đổi trả | 278:704 | Liên hệ | 265:1813 |
| Bảo mật | 278:832 | Logo | 265:1852 |
| Bảo hành | 278:972 | | |

Hai file Figma "Web thương mại" (`en71kyh7uPWqtgZL5FAdpu`) và "Web App 360x640" (`kQZER9RCJ7Wdr4t04YFbFK`) **chưa có quyền truy cập**.

## 6. Quy ước dữ liệu

- `price: null` → hiển thị "Liên hệ"; giỏ hàng ghi "Nhân viên sẽ báo giá".
- **Giá (05/11/2026, bảng giá khách gửi):** Grid 1.499.000, Sol 1.999.000, Grid Plus 1.799.000, Sol Plus 2.299.000, Grid Pro 2.499.000, Sol Pro 3.399.000, Bio-Tank máy S và máy Plus 39.000 (đ). Còn lại "Liên hệ" (khách dặn chưa có giá thì để Liên hệ; Bio-Nutri chưa cần giá).
- `variants.prices` = giá riêng từng lựa chọn (cùng thứ tự `options`, `null` = Liên hệ); thẻ SP hiện "Từ …" khi các lựa chọn khác giá. Giỏ hàng + đơn lưu **đơn giá theo lựa chọn** (`cart.ts → unitPrice`). `variants.pick: true` = nút trên thẻ SP thành "Chọn máy" (mở trang chi tiết) thay vì thêm ngay.
- `images` = khung ảnh trang chi tiết (ảnh đầu hiện to, bấm để phóng to: nút +/−, cuộn chuột, chụm 2 ngón, nhấp đúp, kéo). `thumb` = ảnh trên thẻ SP / giỏ hàng (mặc định `images[0]`, dùng bản `-800`). `info` = ảnh có chữ, hiện trong phần mô tả (ECOHUB). Phụ kiện: ảnh có chữ đứng **trước**, ảnh nền trắng sau (khách yêu cầu). `images: []` → ảnh tạm.
- `model: null` → nút "Thử với AR" hiện "Đang cập nhật". File 3D đặt trong `public/models/`, dạng `{ glb, usdz }`.
- **Sản phẩm (12)** chia 4 nhóm (slug cũ có 301 trong `public/_redirects`):
  - ECOHUB (6, đều có AR): Sol, Grid, Sol Plus, Grid Plus (nước trực tiếp), Sol Pro, Grid Pro (không gian lớn). Cũ: X10 → bỏ chữ X10, Hydro → Plus, X20 → Pro.
  - ECOBOX (2, gộp 05/11/2026, giữ tên ECOBOX): `bio-tank`, `aqua-tank`, chọn **Máy S / Máy Plus / Máy Pro** (S ↔ Sol/Grid, Plus ↔ Sol Plus/Grid Plus, Pro ↔ Sol Pro/Grid Pro). Link từ trang máy ECOHUB tự chọn sẵn đúng dòng (`?may=pro`). Slug cũ `bio-tank-s`… → 301 về trang mới kèm `?may=`.
  - Phụ kiện tưới (2): Bio-Dripper, Hose 6/8/10mm có biến thể
  - Dinh dưỡng (2): **Bio-Nutri 25g pack** (slug `bio-nutri-25g`), **Bio-Nutri Box** 250g (thay Multi-Pack 05/11/2026; `bio-nutri-multi-pack` → 301 `bio-nutri-box`)
- **Viết khối lượng:** số và "g" viết liền: **25g, 250g** (khách yêu cầu 05/11/2026). Riêng chữ "gram" trong mô tả giữ nguyên.
  - ~~VIO-Care (2)~~ đã bỏ: bảo hành chọn ngay ở trang chi tiết máy ECOHUB (`variants` = `warrantyOptions`: 12 / 18 / 24 tháng, lưu vào đơn như biến thể "Bảo hành 18 tháng"). Giá máy kèm gói 12 tháng; phí gói 18/24 tháng chờ khách.
- **Mô tả SP** lấy từ tài liệu, đã bỏ ghi chú nội bộ ("Lưu ý kỹ thuật… chưa được xác nhận", "Thông tin cần xác nhận", "Theo định vị trong tài liệu hiện tại"). `highlights` = Đặc điểm chính / Công dụng.
- **Số lượng cây thay cho diện tích:** `plants` = `<15` ("Dưới 15 cây", máy cho không gian dưới 10 m²) / `<30` ("Dưới 30 cây", 10–20 m²). Form liên hệ: Dưới 15 / 20 / 30 / Trên 30 cây / Chưa rõ (vẫn lưu trường `area` của lead).
- **Bộ lọc ECOHUB:** số lượng cây (`<15` / `<30`), nguồn điện (`solar` / `grid`), nguồn nước (`tank` / `direct`).
- **Địa chỉ (từ 14/10/2026):** Tỉnh/thành và Phường/xã chọn từ danh sách theo **danh mục hành chính mới** (34 tỉnh/thành, 3.321 phường/xã/đặc khu, hiệu lực 01/07/2025; bỏ cấp quận/huyện). Dữ liệu `public/data/dvhc.json` tạo bằng `npm run dvhc` (`scripts/fetch-dvhc.mjs`, nguồn provinces.open-api.vn API v2; script tự kiểm tra đủ 34 / 3.321). Chỉ tải khi trang có `<select data-province>`: trang Đặt hàng, Tài khoản (hồ sơ), form Liên hệ (chỉ tỉnh). Lưu tên đầy đủ ("Thành phố Hà Nội", "Phường Ba Đình"). Địa chỉ cũ đã lưu ("Hà Nội", "Ba Đình") tự khớp gần đúng qua `setAddress()`; không khớp thì để trống cho khách chọn. Không tải được danh sách thì tự đổi về ô nhập tay.
- **Thanh toán:** `paymentMethod` = `cod` | `bank` (đơn trước 07/10/2026 không có → hiển thị "—"). Nhãn hiển thị ở `order-view.ts → PAYMENT_LABEL`.
- **Mã đơn:** `VG-yymmdd-XXXX`. Đơn lưu ở Firestore `orders/{mã đơn}`; `site.firebase.projectId` trống = chế độ thử, không gửi dữ liệu đi.

## 7. Trạng thái (cập nhật 05/11/2026)

**Đã xong:** 34 trang build OK, `astro check` 0 lỗi, đã thử trên mobile (360px) và desktop.

**Đợt sửa 05/11/2026 theo `docs/web_information.docx` (chưa commit / chưa push lúc viết):** giá 8 mục (mục 6); gộp ECOBOX thành 2 SP chọn theo máy (16 → 12 SP); Multi-Pack → Bio-Nutri Box 250 g; ảnh thật cho 6 ECOHUB + 4 phụ kiện, khung ảnh + phóng to, ảnh có chữ trong phần mô tả; trang Sản phẩm: đầu trang là băng ảnh trượt (`Coverflow`, bố cục lấy từ trang Liên hệ), mục Bio-Nutri đổi nền xanh đậm `brand-900` (trước trùng màu thanh menu); trang Liên hệ: đầu trang là ảnh bìa cũ của trang Sản phẩm + chữ "Cùng nhau vun trồng lối sống xanh."; viền chia rõ: thanh menu có viền trắng + bóng, chữ chạy ngang và breadcrumb có viền `brand-200`, breadcrumb nền trắng; AR: "Phòng khách / Ban công" → "Trong nhà / Ngoài trời"; blog: 5 bài (SEO title, meta description, slug theo tài liệu; ảnh trong `public/blog/`) → menu "Tin tức" + mục tin trên trang chủ tự hiện; chatbot trả lời giá theo dữ liệu sản phẩm.

**Đợt sửa 18/10/2026 theo "Thông tin làm web.docx" (bản mới, khách chọn phương án đề xuất):** màu #037700 / #ebf2e3; chữ chạy ngang (`site.notice`); menu: khung cho mục đang mở, nút "Chọn ECOHUB" → "Tư vấn ngay" (mở chat); hero 3 ảnh thật + lớp phủ + thẻ thời tiết/giờ Hà Nội (Open-Meteo, `site.weather`), slide 1 "Chăm sóc thông minh cho không gian xanh đô thị", eyebrow "VIO GREEN", "Chạm để chăm sóc" 1 dòng; nội dung trang chủ 1–4 thay theo tài liệu; trang Sản phẩm: banner ảnh + "ECOHUB – Thiết bị chăm sóc cây thông minh.", lọc theo số cây, bỏ mục VIO-Care; chọn gói bảo hành ở trang chi tiết; "Đặt hàng ECOHUB" → "Mua ngay"; Giới thiệu: hero ảnh nền kiểu tatagarden (Ảnh bìa 1, giữ chữ VIO GREEN), CTA tiếng Việt; AR: "Khám phá ECOHUB trong không gian của bạn."; Liên hệ: "Cùng nhau vun trồng lối sống xanh." + ảnh; footer "Chính sách bảo mật thông tin" 1 dòng; `site.tagline` đổi sang tiếng Việt; đánh giá + blog dựng sẵn, tự ẩn khi chưa có nội dung thật. Đang chạy ở `https://viogreen.com` (Pages trong tài khoản khách; `www` 301 về đây; `viogreen.pages.dev` vẫn truy cập được). ~~Chế độ trước ra mắt~~ → **đã ra mắt 05/11/2026** (Google được lập chỉ mục; trang giỏ hàng, đặt hàng, đăng nhập, tài khoản, quản trị, 404 vẫn noindex).

- **Trang:**
  - Trang chủ, Sản phẩm (nhóm, bộ lọc, tìm kiếm `?q=` không dấu)
  - 12 trang chi tiết (khung ảnh phóng to được; nút Thêm vào giỏ + Mua ngay; nút "Mua trên Shopee" đã bỏ 18/10/2026, Shopee chỉ còn icon ở footer), Giỏ hàng, Đặt hàng, Đặt hàng thành công
  - Giới thiệu, AR, Liên hệ, 4 chính sách, 404
  - Đăng nhập, Tài khoản, Quản trị (Firebase – chủ web đã test: đặt đơn, liên hệ, lead, phân quyền OK)
- **Hiệu ứng:** đủ theo mục 5. Carousel hero tự chạy, vuốt được, có chấm chuyển slide.
- **Giỏ hàng:** lưu localStorage, có biến thể và số lượng, nhớ thông tin khách.
- **Địa chỉ:** chọn Tỉnh/thành → Phường/xã theo danh mục mới 34 tỉnh (xem mục 6).
- **Đặt hàng:** chọn thanh toán **COD (giao qua SPX Express)** hoặc **Chuyển khoản** → lưu `paymentMethod` (`cod`/`bank`) vào đơn. Chọn chuyển khoản thì trang thành công (`?tt=bank`) hiện QR + Techcombank / STK / chủ TK / nội dung = mã đơn, nút sao chép. Thông tin ngân hàng ở `site.payment`. QR: `public/assets/qr-chuyen-khoan.webp` (cắt từ ảnh gốc `qr-chuyen-khoan.jpg` khách gửi; thiếu file thì trang tự ẩn QR). Phương thức thanh toán hiện ở `/tai-khoan/` và `/quan-tri/`.
- **Form:** gửi vào Firestore (xem mục 8 bước 2).
- **Liên hệ & MXH:** email `viogreen102@gmail.com` (cả chính sách bảo mật qua `{{email}}`); Facebook, TikTok `@viogreen.vn`, YouTube `@VIOGREEN-vn`, Shopee có link; Messenger, Zalo, Instagram chưa có link → **ẩn** (05/11/2026, khách yêu cầu bỏ icon chưa có link; `Social.astro` chỉ hiện mạng có link trong `site.social`).
- **AR:** modal với `<model-viewer>`. **Đã gắn 3D cho 4 máy** (bản tạm 05/11/2026): Sol Plus, Grid Plus, Sol Pro, Grid Pro (`/models/ecohub-{sol,grid}-{plus,pro}.glb`); Sol / Grid (bản thường) vẫn hiện "Mô hình 3D đang được cập nhật". Sửa 05/11: khung xem 3D trước chỉ cao 150px (thêm `height:auto`), bộ giải nén meshopt tự host `public/vendor/meshopt_decoder.js` (xem chú thích trong `ar.ts`).
- **Chatbot MIO v1:**
  - Bong bóng lời chào cạnh MIO: hiện khi vào trang và mỗi lần đóng khung chat (đang mở chat thì ẩn). Chỉ khi khách bấm × trên lời chào mới không hiện lại, kể cả khi chuyển trang, cho tới lần tải lại trang / phiên mới (sessionStorage `vg-mio-hint-off`). Hiệu ứng hiện dần dùng ép reflow, không dùng requestAnimationFrame.
  - Mở chat: màn hình chào (MIO + "Câu hỏi thường gặp" soạn sẵn ở `chatbot-kb.ts → quickQuestions`), dòng lưu ý cuối khung
  - Nút gợi ý: Tư vấn chọn máy, Phụ kiện, Giao hàng, Đổi trả, Bảo hành, Gặp nhân viên
  - Tư vấn chọn máy qua 3 câu hỏi (số cây → nguồn điện → nguồn nước; trên 30 cây → xin SĐT)
  - Trả lời FAQ và chính sách theo từ khoá
  - Không hiểu câu hỏi thì xin tên và SĐT, lưu vào Firestore `leads` (type `chat-lead`)
  - Báo ngoài giờ làm việc
- **SEO:** meta, OG, JSON-LD (Organization, FAQPage, Product, Breadcrumb), robots.txt, `_headers`.

## 8. Việc tiếp theo (theo thứ tự ưu tiên)

1. ✅ **Deploy:** Cloudflare Pages đã chuyển sang **tài khoản Cloudflare của khách** (`viogreen102@gmail.com`) ngày 14/10/2026; project cũ trong tài khoản quanyoyo đã xoá. Repo vẫn `github.com/quanyoyo/viogreen`, push `main` là tự deploy. Link pages.dev: **`https://viogreen.pages.dev`** (project mới, tạo lại bằng tài khoản khách; đã kiểm tra 14/10 trả bản build mới nhất; có trong Firebase Authorized domains). Tên miền: `viogreen.com` (chính) + `www.viogreen.com`.
2. **Firebase** (thay cho Google Sheet; quyết định 06/10/2026). Lựa chọn đã chốt:
   - Đăng nhập: **Google + Email/mật khẩu** (không dùng SMS OTP). Đăng nhập là **tuỳ chọn** – khách vẫn đặt hàng không cần tài khoản.
   - Lịch sử đơn: đơn có `uid` nếu đặt khi đã đăng nhập; đơn khách vãng lai hiện trong lịch sử nếu **email đơn = email đã xác minh** của tài khoản.
   - Nhân viên xử lý đơn ở trang **`/quan-tri/`** (chỉ tài khoản có trong `admins/{uid}`), đổi trạng thái: Mới → Đã xác nhận → Đang giao → Hoàn tất / Đã huỷ.
   - ✅ **2a–2d xong và đã chạy thật (07/10/2026):** project `viogreen-44a7f`; `firestore.rules` đã publish; Auth Google + Email/Password đã bật; đã có admin; chủ web test đặt đơn / liên hệ / lead / phân quyền OK; Claude đặt thêm 1 đơn thật trên web sau khi push (`VG-261007-C7GX`, tên "TEST Claude").
   - **Mỗi lần sửa `firestore.rules`:** báo chủ web dán lại vào Console → Publish **trước khi push** code dùng trường mới. Viết rule tương thích cả bản web cũ lẫn mới (trường mới để tuỳ chọn).
3. ~~**Ảnh MIO**~~ **Xong 06–07/10/2026:** đã tách nền. Trong `public/assets/`: `mio.webp` (toàn thân 640px), `mio-stand.webp` (toàn thân 280px – nút chat nổi), `mio-head-128.webp` (avatar trong khung chat), `mio-head-512.png` (bản gốc phần đầu). Favicon: `public/favicon-48.png`, `apple-touch-icon.png` (đầu MIO). Đường dẫn khai báo ở `site.mio`. `favicon.svg` cũ không còn dùng.
4. **AR:** `npm run models` (`scripts/stl-to-glb.mjs`) chuyển STL trong `models-src/` → GLB trong `public/models/`: mm→m, Z-up→Y-up, căn giữa theo thân máy + đáy chạm sàn, chất liệu theo `models-src/models.json`, giảm đa giác khi vượt `maxTriangles`, nén meshopt, kiểm tra < 5MB. Chỉ cần `glb` (model-viewer tự tạo USDZ cho iPhone). Cấu hình mỗi model: `parts` (file STL → chất liệu), `regions` (tô 1 vùng của 1 bộ phận theo hộp toạ độ + hướng mặt `normals` hoặc góc `normal`+`minDot`; chỉ cắt gọn được khi ranh giới trùng cạnh tam giác), `stripes` (sọc sơn thẳng lên vách: cắt tam giác đúng tại z0/z1 nên liền thân, mép thẳng), `extras` (khối dựng thêm: `box` (có `grid` chia ô, `rotX` xoay), `cylinder`, `band` = vòng bo rời quanh thân (không dùng nữa – nhìn như gờ nhô), `decal` = ảnh PNG dán ôm mặt trước, hoặc không ảnh = miếng vá trơn bịt lỗ), `exclude` (bỏ file STL), `extends` (kế thừa model khác). Chi tiết ở đầu script.
   **Hiện có (bản tạm 05/11/2026, chủ web duyệt hướng làm):** ảnh SP của khách là render từ thiết kế mới hơn file CAD → dựng tay phần CAD thiếu để giống ảnh. Muốn giống ảnh hoàn toàn: xin khách **file 3D dùng để render ảnh SP** (GLB/FBX/OBJ/Blender/KeyShot/STEP).
   - **Plus** (`models-src/may-nho/`, 9 STL "3D máy nhỏ" Drive, 25×25×35,6 cm khớp ảnh thông số): Body1 = bình nước trước (vòm), Body1 aa = thân trên, Body8 aa = vỏ sau/bên (lỗ nút), Body6 aa = nắp, Body25–28 = chân. Dựng thêm: hộp Bio-Tank lấp hốc sau trái (x −124…−27, y 26…117, z 200…346 mm), nút + USB + đèn + nút nguồn lấp lỗ bên trái, logo. `ecohub-grid-plus.glb`; `ecohub-sol-plus.glb` = Grid Plus + cột + tấm pin 270×170 mm nghiêng 28° ở góc sau trái.
   - **Pro** (`models-src/*.stl`, 12 STL gốc, thân 40×40×50,6 cm = thông số Pro trên ảnh khách): bỏ cột + tấm pin cũ (Component2, Component3 – đặt giữa, nằm ngang, khác ảnh), nắp lỗ cột, nắp trên xanh (mặt hướng lên của Component20 + vách hốc vít; chân vít dưới nắp ở Component19 cũng xanh để lỗ vít không lộ trắng), bịt lỗ Ø12 trên nắp hộp bên hông, lòng vòm xanh, sọc xanh `stripes` z 258…284 mm sơn lên Component19/21 (chừa đoạn hộp bên hông), nút bấm nổi bên trái (CAD không có lỗ), miếng vá trắng bịt 5 lỗ bắt vít quanh logo ở mặt trước (x ±75, z 335…405), logo. `ecohub-grid-pro.glb`; `ecohub-sol-pro.glb` = Grid Pro + cột + tấm pin 380×240 mm nghiêng 28° ở góc sau trái.
   - Logo: `models-src/decals/logo-vio-green.png` cắt từ góc trên ảnh SP gốc (`pro (2).png`, 1920px), nền trắng → trong suốt.
   - Màu: trắng `#f4f4f2`, xanh `#245c3a` (lấy mẫu từ ảnh SP), chân đen, ô pin `#1e2b45`.
5. ~~**Hero trang chủ 3 slide**~~ **Xong 07/10/2026** (`src/pages/index.astro` → `slides`): (1) máy trong góc xanh – "Smart Care for Urban Green Spaces", (2) điện thoại app + máy, nền tối kiểu techno – "Giám sát mọi lúc qua app", (3) tay chạm vào máy – "Chạm để chăm sóc". Chữ lấy từ nội dung sẵn có, không thêm thông số. Bố cục tham khảo hikari-mansion.com, smarthomesjapan.com, samsung.com/vn/smartthings (chữ trái – ảnh lớn phải; mobile ảnh dưới chữ). **18/10/2026:** đã thay ảnh thật khách gửi (`hero-1..3.webp`); ảnh chiếm 64% bên phải, mờ dần sang trái vì máy đứng phía trái ảnh. Slide 2/3 vẫn giữ chữ "Giám sát qua app" / "Chạm để chăm sóc" dù ảnh mới là cảnh ban công / sảnh.
6. **Thay nội dung thật khi khách gửi:** giá, ảnh SP, file 3D, logo gốc. Chỉ sửa trong `src/data/` và `public/`.
7. **Tên miền `viogreen.com` (14/10/2026):**
   - ✅ Code: `site` = `https://viogreen.com` (canonical, OG, JSON-LD, sitemap), `@astrojs/sitemap`, `Sitemap:` trong robots.txt, chế độ `prelaunch`.
   - ✅ Firebase: `viogreen102@gmail.com` là **Owner**; Authorized domains có `viogreen.com`, `www.viogreen.com`, `viogreen.pages.dev` (đã kiểm tra 14/10).
   - ✅ **Pages → Custom domains** (14/10/2026): `viogreen.com` + `www.viogreen.com` đều Active, SSL bật. `http` tự chuyển `https`.
   - ✅ **Redirect Rule "www to viogreen.com"** (dashboard → viogreen.com → Rules): Wildcard pattern `https://www.viogreen.com/*` → `https://viogreen.com/${1}`, **301**, giữ query string. Đã kiểm tra: `www.viogreen.com/san-pham/?q=ecohub` → 301 `viogreen.com/san-pham/?q=ecohub`. (Pages `_redirects` không đổi được host nên phải dùng Redirect Rule.)
   - Đã kiểm tra 14/10: `viogreen.com` mọi trang 200, trang lạ 404, canonical `https://viogreen.com/`, noindex (prelaunch); đặt đơn OK trên `www` (`VG-261014-JSMX`, chuyển khoản) và `viogreen.com` (`VG-261014-RBL4`, COD). Đăng nhập Google: chủ web tự kiểm tra (Browser pane của Claude chặn popup).
8. **Ra mắt (bật cho Google tìm thấy)** – bước 1–3 ✅ xong 05/11/2026, bước 4 chờ chủ web:
   1. `src/data/site.ts`: đổi `prelaunch: true` → `prelaunch: false`.
   2. Chạy `npm run check` rồi `npm run build`; kiểm tra `dist/index.html` **không còn** `<meta name="robots" content="noindex">` (các trang giỏ hàng, đặt hàng, tài khoản, quản trị vẫn giữ noindex – đúng).
   3. Commit + push `main` → Cloudflare tự deploy.
   4. ⏳ Google Search Console (cần tài khoản Google của khách/chủ web): thêm `viogreen.com` (xác minh bằng bản ghi DNS trong Cloudflare), gửi sitemap `https://viogreen.com/sitemap-index.xml`, yêu cầu lập chỉ mục trang chủ.
   **Việc treo (bàn giao / chủ web làm trong Console):**
   - **Thẻ thanh toán Cloudflare:** đang là thẻ của quanyoyo (tên miền tự gia hạn sau 4 năm) → đổi sang thẻ của khách (Manage Account → Billing).
   - Đổi **Firebase Project support email** sang `viogreen102@gmail.com` (Project settings → General; và Authentication → Sign-in method → Google).
   - Thêm **UID của khách** vào Firestore `admins` (khách đăng nhập web → mở `/quan-tri/` để lấy UID → tạo document `admins/<UID>`).
   - **Xoá đơn test** trong Firestore `orders` (đơn tên "TEST…", gồm `VG-261007-C7GX`, `VG-261014-JSMX`, `VG-261014-RBL4`) – rules chặn xoá từ web.
   - **App Check** chống spam form (đăng ký reCAPTCHA Enterprise / v3, bật enforce cho Firestore).
   - **Email báo đơn mới:** Cloud Function `onOrderCreated` (cần nâng gói **Blaze** + đặt Budget alert, email nhận + tài khoản gửi SMTP).
   - **Chính sách bảo mật** cập nhật theo cách lưu dữ liệu mới (Firebase, tài khoản khách; Nghị định 13/2023) – nội dung cần khách duyệt.
   - Đã xong: Cloudflare Pages + tên miền ở tài khoản khách; Firebase Owner = `viogreen102@gmail.com`. Còn lại: GitHub repo vẫn ở `quanyoyo` (chuyển khi khách cần).
9. **Sau v1 (chỉ làm khi được yêu cầu):**
   - Chatbot AI v2: Cloudflare Worker, trả lời chỉ dựa trên `chatbot-kb.ts`, `faq.ts`, `products.ts` và chính sách
   - Thanh toán online VNPay/MoMo
   - Web App 360×640 (chờ quyền Figma)

## 9. Chờ khách (không tự điền)

- **Sản phẩm:**
  - ✅ Giá 6 ECOHUB + Bio-Tank S/Plus (05/11/2026). Còn "Liên hệ": Bio-Tank máy Pro, Aqua-Tank (cả 3), Bio-Dripper, Hose (theo cỡ, độ dài), Bio-Nutri (chủ web: chưa cần giá)
  - Phí gói bảo hành 18 / 24 tháng (nếu có) – chủ web: "update later"
  - **Thông số trên ảnh khách gửi (05/11/2026) lệch dữ liệu web – chờ quyết:** ảnh ghi Sol/Grid "< 10 chậu", Plus "< 15 chậu", Pro "< 30 chậu" (web: Sol/Grid/Plus = Dưới 15 cây, Pro = Dưới 30 cây); ảnh ghi Sol Pro/Grid Pro dùng **nước trực tiếp** (web: bình chứa nước); ảnh có công suất (100 / 130 / 250 W) và kích thước (30×30×40 / 25×25×35 / 40×40×50 cm) – web chưa đưa vào bảng thông số. Ảnh có chữ đang hiện trong phần mô tả nên khách xem trang sẽ thấy hai số khác nhau.
  - ✅ ~~Số gói trong Multi-Pack~~ → đổi thành Bio-Nutri Box 250 g
  - Phụ kiện **đi kèm** trong hộp từng model
  - ✅ Cảm biến / Web App / AI Chat: chủ web xác nhận đúng cho các dòng ECOHUB (theo nội dung blog, 05/11/2026)
  - Mô tả **Bio-Tank Pro** (dung tích, kích thước) – trang Bio-Tank hiện dùng mô tả chung cho 3 dòng máy
  - ✅ Ảnh 6 ECOHUB + Bio-Tank, Aqua-Tank, Bio-Dripper, Hose (05/11/2026). Còn thiếu: ảnh **Bio-Nutri** 25 g và Box
  - Tên trên ảnh phụ kiện khác tên trên web: "VIO Dripper Set (VIO DRIP-01)" ↔ Bio-Dripper, "VIO Micro-Hose" ↔ VIO GREEN Hose – web giữ tên cũ, hỏi khách nếu muốn đổi
- **Bảo hành / vận chuyển:**
  - ✅ Bảo hành tiêu chuẩn 12 tháng (khách ghi trong thanh chữ chạy 18/10/2026)
  - Dòng chữ chạy "Giao hàng miễn phí từ 2.000.000đ" rộng hơn chính sách vận chuyển (chỉ miễn phí ở Hà Nội) – nay đã có giá thật (Sol Plus, Grid Pro, Sol Pro trên 2 triệu) nên càng cần chốt; chủ web: "update later"
  - Email/Zalo nhận thông báo đơn (cho bước email báo đơn)
- **Thông tin doanh nghiệp:**
  - Địa chỉ theo đơn vị hành chính mới
  - Tên công ty, MST
- **Liên kết:** link Messenger, Zalo, Instagram (icon đang ẩn, điền link vào `site.social` là tự hiện).
- **Nội dung 5 trang chưa có** (đang ẩn khỏi footer): Mua hàng & thanh toán, Đại lý, Điều khoản dịch vụ, Hướng dẫn mua hàng, Hướng dẫn thanh toán.
- **Hình ảnh và file:** ảnh Bio-Nutri; **file 3D dùng để render ảnh SP** (để 3D giống ảnh hoàn toàn) hoặc CAD đầy đủ (tấm pin + cột, hộp Bio-Tank, nút bấm) cho 6 máy; 3D bản thường Sol / Grid; logo gốc SVG/PNG. Ảnh `nha-phu-cay-xanh-750px.jpg` (Drive) chưa dùng – nhỏ và có vẻ là ảnh trên mạng.
- **Đánh giá khách hàng thật** → điền vào `src/data/reviews.ts` (mục tự hiện). **Bài blog mới** → file .md trong `src/content/blog/` (đã có 5 bài, ngày đăng 05/11/2026; `seoTitle`, `excerpt` = meta description, `cover`, `order`).
- **Ô trống trong bảng phí vận chuyển** (Figma để trống): hiện đang hiển thị "—".

## 10. Ghi chú

- **Git:** repo `github.com/quanyoyo/viogreen`, nhánh `main`. Commit đứng tên `quanyoyo <quanyoyo@users.noreply.github.com>` (cấu hình riêng repo; **không** dùng Gmail của chủ web). Một số phiên PowerShell chưa có git trong PATH → gọi `& "C:\Program Files\Git\cmd\git.exe"` (Git Bash thì dùng `git` bình thường). Push dùng đăng nhập đã lưu của Windows.
- **Chạy thử:** xong phải tắt dev server (`preview_stop`). Nếu cổng 4321 đang có `astro dev` do chủ web tự chạy trong terminal thì dùng luôn, không tắt.
- **FAQ câu 2, 5, 6** đã sửa nhẹ so với Figma:
  - bỏ chữ "demo / mô phỏng trong trang này"
  - "cartridge" đổi thành ECOBOX / Bio-Nutri

  Cần khách xác nhận.
- **Tài liệu tham khảo trong Claude Project:**
  - `Thông tin làm web.docx` (mô tả SP + chính sách)
  - `claude/design-style-reference.md`
  - `claude/ke-hoach-code-v1.md`
