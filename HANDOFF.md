# VIO GREEN web – trạng thái code (06/10/2026, phiên 2)

**Đã chuyển sang Astro 7 + Tailwind CSS 4** (npm hoạt động). Mã cũ dạng .mjs đã gỡ – nội dung được chuyển hết sang cấu trúc mới.
Bản đầy đủ (kèm logo PNG, package-lock) nằm trong file zip `viogreen-astro.zip` gửi trong chat; Project lưu các file văn bản (logo PNG không lưu được ở đây).

## Đã xong (build 29 trang, `astro check` 0 lỗi, đã chạy thử trên Chromium mobile + desktop)
- Trang: Trang chủ, Sản phẩm (nhóm + bộ lọc diện tích/điện/nước + tìm kiếm ?q= không dấu), 16 trang Chi tiết, Giỏ hàng, Đặt hàng, Đặt hàng thành công, Giới thiệu, Trải nghiệm AR, **Liên hệ (mới, theo Figma 265:1813)**, **4 trang chính sách từ 1 template** (menu chính sách + mục lục), **404**.
- Hiệu ứng: reveal khi cuộn (fade-up + stagger), Ken Burns "breath", light sweep, pulse ring nút chat, hover lift thẻ, carousel hero (tự chạy, vuốt, chấm).
- Giỏ hàng localStorage (biến thể Hose 6/8/10mm, số lượng), nhớ thông tin khách, mã đơn VG-yymmdd-XXXX.
- Form đặt hàng / liên hệ / nhận tin / số ĐT từ chatbot → Google Apps Script (`apps-script/Code.gs` + README). `formEndpoint` trống = chế độ thử.
- AR: nút "Thử với AR" trên 6 ECOHUB → modal; có file 3D thì tải `<model-viewer>` 4.3.1 (glb + usdz), chưa có thì hiện "đang cập nhật" + Hỏi MIO.
- Chatbot MIO v1: chips (Tư vấn chọn máy · Phụ kiện · Giao hàng · Đổi trả · Bảo hành · Gặp nhân viên); tư vấn 3 câu (diện tích → điện → nước) gợi ý model + thêm giỏ/AR; trả lời FAQ + chính sách theo từ khóa (`src/data/chatbot-kb.ts`); không hiểu → xin tên + SĐT gửi về Sheet; báo ngoài giờ (giờ VN).
- SEO: title/description/canonical/OG, JSON-LD Organization + FAQPage + Product + Breadcrumb, robots.txt, `_headers` cache cho Cloudflare.
- Logo thật lấy từ Figma (135px, độ phân giải thấp – cần file gốc).

## Còn chờ / bước tiếp
- ✅ Deploy (06/10/2026): https://viogreen.pages.dev – repo github.com/quanyoyo/viogreen, push `main` là Cloudflare tự build.
- Tạo Google Sheet + dán URL Apps Script vào `src/data/site.ts`.
- Chờ khách: giá, ảnh SP, file 3D, logo gốc, thông tin liên hệ chính thức, link mạng xã hội.
- ✅ Ảnh MIO (06/10/2026): đã thay vào nút chat, avatar chat, favicon (`site.mio`).
- Chưa có: sitemap.xml (thêm @astrojs/sitemap khi có tên miền), chatbot AI v2 (Cloudflare Worker).

## Ghi chú kỹ thuật
- Dữ liệu SP gửi xuống trình duyệt qua `<script id="vg-data">` (bản rút gọn), không nhúng mô tả dài vào JS.
- Icon: lucide-static (import ?raw) + icon thương hiệu tự vẽ trong `src/components/icons.ts`.
- Sandbox không tải được Google Fonts/Figma asset URL; ảnh Figma lấy bằng screenshot base64.

## Figma frame IDs (file QuAedwzzxIiw4feFi7PJWX)
Trang chủ 18:90 · Sản phẩm 254:584 · Chi tiết 278:1460 · Giỏ hàng 280:4032 · Đặt hàng 280:4258 · Giới thiệu 264:1521
Vận chuyển 276:222 · Đổi trả 278:704 · Bảo mật 278:832 · Bảo hành 278:972 · AR 263:1259 · Liên hệ 265:1813 · Logo node 265:1852