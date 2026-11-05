// Chuyển ảnh gốc khách gửi (images-src/, không commit – bản gốc nằm trên Google Drive "Ảnh làm web")
// sang WebP đã thu nhỏ trong public/. Chạy: npm run images
//  - Mỗi mục: src (trong images-src/) → out (trong public/), width tối đa, có thêm bản nhỏ (-800) cho điện thoại hay không.
//  - clearChecker: ảnh có nền "ô cờ" giả trong suốt in liền vào ảnh → tô trắng phần nền nối với mép ảnh.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'images-src';
const jobs = [
  // Hero trang chủ (3 slide) + ảnh dùng lại ở các mục khác
  { src: 'slide-1-2-may-san-thuong-hoang-hon.png', out: 'assets/hero-1.webp', width: 1680, small: true },
  { src: 'bia-2-ban-cong-hoa.png', out: 'assets/hero-2.webp', width: 1680, small: true },
  { src: 'bia-3-sanh-trong-nha.png', out: 'assets/hero-3.webp', width: 1680, small: true },
  { src: 'bia-1-san-thuong-luong-rau.png', out: 'assets/bia-1.webp', width: 1680, small: true },
  // Banner trang Sản phẩm (nửa phải mờ trắng để đặt chữ)
  { src: 'banner-san-pham-mo-phai.png', out: 'assets/banner-san-pham.webp', width: 1680, small: true },
  { src: 'ecohub-sol-va-grid-nen-trang.png', out: 'assets/ecohub-sol-va-grid.webp', width: 1200 },
  // Ảnh sản phẩm (05/11/2026, Drive "ảnh sản phẩm"): bản 1600px để phóng to + bản -800 cho thẻ sản phẩm.
  // Ảnh nền trắng → khung ảnh (phóng to được); ảnh có chữ (-info) → phần mô tả (ECOHUB) hoặc đứng đầu khung ảnh (phụ kiện).
  ...product('thường.png', 'ecohub-sol'),
  ...product('thường (2).png', 'ecohub-grid'),
  ...product('plus.png', 'ecohub-sol-plus'),
  ...product('plus (2).png', 'ecohub-grid-plus'),
  ...product('pro.png', 'ecohub-sol-pro'),
  ...product('pro (2).png', 'ecohub-grid-pro'),
  ...product('ECOHUB Sol.png', 'ecohub-sol-info'),
  ...product('ECOHUB Grid.png', 'ecohub-grid-info'),
  ...product('ECOHUB Sol Plu.png', 'ecohub-sol-plus-info'),
  ...product('ECOHUB Grid Plus.png', 'ecohub-grid-plus-info'),
  ...product('ECOHUB Sol Pro.png', 'ecohub-sol-pro-info'),
  ...product('ECOHUB Grid Pro.png', 'ecohub-grid-pro-info'),
  ...product('SẢN PHẨM PHỤ KIỆN/hộp nước/8.png', 'aqua-tank-info'),
  ...product('SẢN PHẨM PHỤ KIỆN/hộp nước/hộp nước.png', 'aqua-tank'),
  ...product('SẢN PHẨM PHỤ KIỆN/hộp phân/6.png', 'bio-tank-info'),
  ...product('SẢN PHẨM PHỤ KIỆN/hộp phân/Hộp phân.png', 'bio-tank'),
  ...product('SẢN PHẨM PHỤ KIỆN/ống dây/4.png', 'hose-info'),
  ...product('SẢN PHẨM PHỤ KIỆN/ống dây/ống nước.png', 'hose-1'),
  ...product('SẢN PHẨM PHỤ KIỆN/ống dây/ống nước (2).png', 'hose-2'),
  ...product('SẢN PHẨM PHỤ KIỆN/vòi nước/1.png', 'dripper-info'),
  ...product('SẢN PHẨM PHỤ KIỆN/vòi nước/bộ vòi nước.png', 'dripper-set'),
  ...product('SẢN PHẨM PHỤ KIỆN/vòi nước/bộ vòi nước (2).png', 'dripper-set-2'),
  ...product('SẢN PHẨM PHỤ KIỆN/vòi nước/vòi tưới.png', 'dripper'),
  // Ảnh bài blog (05/11/2026, lấy từ web_information.docx – trùng Drive "Ảnh cho bài SEO"). Ảnh bìa có thêm bản -800 cho thẻ bài viết.
  ...['ban-cong-cover.jpg', 'tuoi-cay-cover.png', 'he-thong-tuoi-cover.png', 'web-app-theo-doi.png', 'ecohub-ban-cong.png', 'ecohub-san-thuong.png']
    .map((f) => ({ src: `2026-11/blog-doc/${f}`, out: `blog/${f.replace(/\.\w+$/, '.webp')}`, width: 1600, small: true })),
  ...['ban-cong-chon-cay.jpg', 'ban-cong-tuoi-cay.png', 'ban-cong-anh-sang.jpg', 'ban-cong-dinh-duong.jpg', 'ban-cong-sau-benh.jpg', 'ban-cong-cong-nghe.jpg',
    'tuoi-cay-qua-nhieu.png', 'tuoi-cay-do-am.png', 'tuoi-cay-thoi-diem.png', 'tuoi-cay-ung-re.png', 'tuoi-cay-nguoi-moi.png',
    'cam-bien-do-am.png', 'ecohub-web-app.png', 'ecohub-khong-gian.png', 'ecohub-sanh.png']
    .map((f) => ({ src: `2026-11/blog-doc/${f}`, out: `blog/${f.replace(/\.\w+$/, '.webp')}`, width: 1200 })),
];

/** Ảnh sản phẩm trong images-src/2026-11/san-pham/ → public/products/<name>.webp (+ -800) */
function product(src, name) {
  return [{ src: `2026-11/san-pham/${src}`, out: `products/${name}.webp`, width: 1600, small: true }];
}

/** Tô trắng nền ô cờ: loang từ mép ảnh qua các điểm xám trung tính, sáng (≥ 236). */
async function clearChecker(input) {
  const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const bg = (i) => {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    return Math.min(r, g, b) >= 236 && Math.max(r, g, b) - Math.min(r, g, b) <= 6;
  };
  const seen = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const i = stack.pop();
    if (seen[i] || !bg(i)) continue;
    seen[i] = 1;
    const x = i % w;
    if (x > 0) stack.push(i - 1);
    if (x < w - 1) stack.push(i + 1);
    if (i >= w) stack.push(i - w);
    if (i < w * (h - 1)) stack.push(i + w);
  }
  // Dọn chấm lẻ còn sót (điểm hơi tối hơn ngưỡng nhưng bị nền bao quanh)
  const loose = (i) => {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    return Math.min(r, g, b) >= 215 && Math.max(r, g, b) - Math.min(r, g, b) <= 10;
  };
  for (let pass = 0; pass < 3; pass++) {
    const add = [];
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (seen[i] || !loose(i)) continue;
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) n += seen[i + dy * w + dx];
      if (n >= 5) add.push(i);
    }
    add.forEach((i) => (seen[i] = 1));
  }
  for (let i = 0; i < w * h; i++) if (seen[i]) data[i * 3] = data[i * 3 + 1] = data[i * 3 + 2] = 255;
  return sharp(data, { raw: { width: w, height: h, channels: 3 } }).png().toBuffer();
}

for (const j of jobs) {
  const file = path.join(SRC, j.src);
  if (!fs.existsSync(file)) { console.warn('Thiếu', file); continue; }
  const input = j.clearChecker ? await clearChecker(file) : file;
  const out = path.join('public', j.out);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await sharp(input).resize({ width: j.width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(out);
  const sizes = [`${(fs.statSync(out).size / 1024).toFixed(0)} KB`];
  if (j.small) {
    const outS = out.replace(/\.webp$/, '-800.webp');
    await sharp(input).resize({ width: 800 }).webp({ quality: 78 }).toFile(outS);
    sizes.push(`-800: ${(fs.statSync(outS).size / 1024).toFixed(0)} KB`);
  }
  console.log(j.out, sizes.join(', '));
}
