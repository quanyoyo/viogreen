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
- **Hosting:** Cloudflare Pages (build `npm run build`, output `dist`).
- **Node:** 22 trở lên.

```bash
npm install
npm run dev      # http://localhost:4321
npm run check    # astro check (type + template)
npm run build    # xuất ra dist/
npm run preview
```

## 4. Cấu trúc thư mục

```
src/
  pages/                 index, san-pham/(index|[slug]), gio-hang, dat-hang, dat-hang-thanh-cong,
                         gioi-thieu, trai-nghiem-ar, lien-he, chinh-sach/[slug], 404,
                         dang-nhap, tai-khoan, quan-tri (3 trang này dùng Firebase, noindex)
  layouts/BaseLayout.astro   head/SEO, Header, Footer, Chatbot, AR modal
  components/            Header, Footer, ProductCard, PolicyStrip, CtaBand, SectionHead, Ph (ảnh tạm),
                         Chatbot, ArModal, ContactForm, Breadcrumbs, Logo, Social, Icon
  scripts/               ui.ts (reveal, carousel, menu), cart.ts, forms.ts, ar.ts, chatbot.ts, data.ts,
                         fb.ts (Firebase: auth, đơn, lead, quản trị), order-view.ts (hiển thị đơn dùng chung)
  data/                  site.ts (cấu hình), products.ts (16 SP), faq.ts, chatbot-kb.ts
  content/policies/      van-chuyen, doi-tra, bao-hanh, bao-mat (.md; {{address}} {{email}}… thay từ site.ts)
  styles/global.css      design tokens + hiệu ứng
firestore.rules          quy tắc bảo mật Firestore (dán vào Console → Firestore → Rules → Publish)
public/                  favicon-48.png, apple-touch-icon.png, robots.txt, _headers,
                         assets/ (logo.png, mio-*.webp), products/, models/
.claude/launch.json      cấu hình dev server cho Browser pane (tên "dev")
```

## 5. Design system

- **Nguồn thiết kế:** Figma file `QuAedwzzxIiw4feFi7PJWX`. Màu, layout và nội dung lấy từ Figma.
- **Màu:** xanh chủ đạo `#355e3b`, nền kem `#fcfbf7`, chữ đậm `#181e19`, nền thông số xanh nhạt. Ảnh tạm dùng component `Ph`.
- **Font:** Inter.
- **Phong cách và hiệu ứng** (tham khảo banhcaynguvi.com, *chỉ lấy cảm giác và chuyển động, không lấy màu*):
  - reveal khi cuộn: fade-up 28px, stagger
  - Ken Burns "breath" 12s và light sweep trên ảnh hero
  - nút chat nổi = MIO đứng toàn thân (cao 75px mobile / 96px desktop), nhún nhẹ `animate-mio-float` + bóng chân `animate-mio-shadow` (không còn pill xanh + chữ "MIO giúp gì cho bạn?")
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
- `images: []` → hiển thị ảnh tạm. Ảnh thật đặt trong `public/products/`.
- `model: null` → nút "Thử với AR" hiện "Đang cập nhật". File 3D đặt trong `public/models/`, dạng `{ glb, usdz }`.
- **Sản phẩm (16)** chia 5 nhóm:
  - ECOHUB (6, đều có AR): X10 Sol, X10 Grid, X10 Hydro Sol, X10 Hydro Grid, X20 Sol, X20 Grid
  - ECOBOX (4)
  - Phụ kiện tưới (2): Bio-Dripper, Hose 6/8/10mm có biến thể
  - Dinh dưỡng (2)
  - VIO-Care (2)
- **Bộ lọc ECOHUB:** diện tích (`<10` / `10-20`), nguồn điện (`solar` / `grid`), nguồn nước (`tank` / `direct`).
- **Mã đơn:** `VG-yymmdd-XXXX`. Đơn lưu ở Firestore `orders/{mã đơn}`; `site.firebase.projectId` trống = chế độ thử, không gửi dữ liệu đi.

## 7. Trạng thái (cập nhật 07/10/2026)

**Đã xong:** 32 trang build OK, `astro check` 0 lỗi, đã thử trên mobile và desktop.

- **Trang:**
  - Trang chủ, Sản phẩm (nhóm, bộ lọc, tìm kiếm `?q=` không dấu)
  - 16 trang chi tiết, Giỏ hàng, Đặt hàng, Đặt hàng thành công
  - Giới thiệu, AR, Liên hệ, 4 chính sách, 404
  - Đăng nhập, Tài khoản, Quản trị (Firebase – code xong, chưa test thật)
- **Hiệu ứng:** đủ theo mục 5. Carousel hero tự chạy, vuốt được, có chấm chuyển slide.
- **Giỏ hàng:** lưu localStorage, có biến thể và số lượng, nhớ thông tin khách.
- **Form:** gửi vào Firestore (xem mục 8 bước 2).
- **AR:** modal với `<model-viewer>`.
- **Chatbot MIO v1:**
  - Nút gợi ý: Tư vấn chọn máy, Phụ kiện, Giao hàng, Đổi trả, Bảo hành, Gặp nhân viên
  - Tư vấn chọn máy qua 3 câu hỏi
  - Trả lời FAQ và chính sách theo từ khoá
  - Không hiểu câu hỏi thì xin tên và SĐT, lưu vào Firestore `leads` (type `chat-lead`)
  - Báo ngoài giờ làm việc
- **SEO:** meta, OG, JSON-LD (Organization, FAQPage, Product, Breadcrumb), robots.txt, `_headers`.

## 8. Việc tiếp theo (theo thứ tự ưu tiên)

1. ~~**Deploy bản xem thử**~~ **Xong 06/10/2026:** https://viogreen.pages.dev (Cloudflare Pages, repo `github.com/quanyoyo/viogreen`, nhánh `main` – push là tự build). Đã kiểm tra 28 trang + asset trả về 200, trang lạ trả 404, canonical đúng.
2. **Chuyển sang Firebase** (thay cho Google Sheet; quyết định 06/10/2026). Lựa chọn đã chốt:
   - Đăng nhập: **Google + Email/mật khẩu** (không dùng SMS OTP). Đăng nhập là **tuỳ chọn** – khách vẫn đặt hàng không cần tài khoản.
   - Lịch sử đơn: đơn có `uid` nếu đặt khi đã đăng nhập; đơn khách vãng lai hiện trong lịch sử nếu **email đơn = email đã xác minh** của tài khoản.
   - Nhân viên xử lý đơn ở trang **`/quan-tri/`** (chỉ tài khoản có trong `admins/{uid}`), đổi trạng thái: Mới → Đã xác nhận → Đang giao → Hoàn tất / Đã huỷ.
   - **Email tự động** báo đơn mới qua Cloud Function (gói Blaze).
   - Các giai đoạn:
     - ✅ **2a.** Project `viogreen-44a7f` đã tạo, config đã lưu ở `site.ts → firebase` (`projectId` rỗng = chế độ thử).
     - ✅ **2b (code).** `firestore.rules`: `orders` (tạo: ai cũng được, kiểm tra dữ liệu; đọc: chủ đơn theo uid/email đã xác minh, hoặc admin; sửa trạng thái: admin), `leads` (chỉ tạo; admin đọc/sửa trạng thái), `users/{uid}`, `admins/{uid}` (chỉ sửa trong Console). **Chờ chủ web dán rules vào Console.** Chưa làm: App Check chống spam (cần đăng ký reCAPTCHA).
     - ✅ **2c (code).** `forms.ts` ghi Firestore; `/dang-nhap/` (Google, email, quên mật khẩu), `/tai-khoan/` (lịch sử + trạng thái đơn, hồ sơ giao hàng, xác minh email); icon tài khoản ở Header; trang đặt hàng điền sẵn khi đã đăng nhập. Đã gỡ `apps-script/`.
     - ✅ **2d (code).** `/quan-tri/`: đơn realtime, lọc + đổi trạng thái, tab liên hệ/lead; tài khoản chưa có quyền thì hiện UID để thêm vào `admins`.
     - **Chưa test thật** đăng nhập / ghi đơn trên Firebase: cần rules đã publish + chủ web đăng nhập thử.
     - **Chưa push** các commit Firebase/MIO lên `main`: phải đợi chủ web publish `firestore.rules` trước (Firestore đang Production mode = chặn ghi → push sớm thì đơn trên web thật bị lỗi).
     - **2e.** Cloud Function `onOrderCreated` gửi email cho nhân viên (cần email nhận + tài khoản gửi SMTP do chủ web cung cấp).
     - **2f.** Cập nhật Chính sách bảo mật theo cách lưu dữ liệu mới (Nghị định 13/2023) – nội dung cần khách duyệt.
   - **Xong khi:** đặt thử đơn khi chưa đăng nhập và khi đã đăng nhập → đơn hiện ở `/quan-tri/` và `/tai-khoan/`, nhân viên nhận email, khách không đọc được đơn người khác.
3. ~~**Ảnh MIO**~~ **Xong 06–07/10/2026:** đã tách nền. Trong `public/assets/`: `mio.webp` (toàn thân 640px), `mio-stand.webp` (toàn thân 280px – nút chat nổi), `mio-head-128.webp` (avatar trong khung chat), `mio-head-512.png` (bản gốc phần đầu). Favicon: `public/favicon-48.png`, `apple-touch-icon.png` (đầu MIO). Đường dẫn khai báo ở `site.mio`. `favicon.svg` cũ không còn dùng.
4. **Thay nội dung thật khi khách gửi:** giá, ảnh SP, file 3D, logo gốc, liên hệ, mạng xã hội. Chỉ sửa trong `src/data/` và `public/`.
5. **Khi có tên miền:** đổi `site` trong `astro.config.mjs`, thêm `@astrojs/sitemap`, gắn Custom domain trên Cloudflare.
6. **Sau v1 (chỉ làm khi được yêu cầu):**
   - Chatbot AI v2: Cloudflare Worker, trả lời chỉ dựa trên `chatbot-kb.ts`, `faq.ts`, `products.ts` và chính sách
   - Thanh toán VNPay/MoMo
   - Web App 360×640 (chờ quyền Figma)

## 9. Chờ khách (không tự điền)

- **Sản phẩm:**
  - Giá 16 SP; giá Hose theo từng cỡ và độ dài
  - Số gói trong Bio-Nutri Multi-Pack
  - Thông số kỹ thuật từng ECOHUB; phụ kiện **đi kèm** trong hộp từng model
  - Model nào có cảm biến / kết nối app
- **Bảo hành và thanh toán:**
  - Thời hạn bảo hành tiêu chuẩn
  - Thanh toán COD hay chuyển khoản, tài khoản nhận tiền
  - Email/Zalo nhận thông báo đơn
- **Thông tin doanh nghiệp:**
  - Email chính thức (doc ghi cả `cskh@viogreen.vn` và `viogreen@gmail.com`), tên miền
  - Địa chỉ theo đơn vị hành chính mới
  - Tên công ty, MST
- **Liên kết:** link TikTok, Instagram, Zalo, Messenger, YouTube (đang hiện icon chưa có link).
- **Nội dung 5 trang chưa có** (đang ẩn khỏi footer): Mua hàng & thanh toán, Đại lý, Điều khoản dịch vụ, Hướng dẫn mua hàng, Hướng dẫn thanh toán.
- **Hình ảnh và file:** ảnh sản phẩm, file 3D (GLB + USDZ), logo gốc SVG/PNG, đánh giá khách hàng thật.
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
