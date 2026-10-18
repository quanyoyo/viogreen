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
  // Ảnh sản phẩm
  { src: 'ecohub-sol-nen-o-co.png', out: 'products/ecohub-sol.webp', width: 1000, clearChecker: true },
  { src: 'ecohub-grid-nen-trang.png', out: 'products/ecohub-grid.webp', width: 1000 },
  { src: 'ecohub-sol-va-grid-nen-trang.png', out: 'assets/ecohub-sol-va-grid.webp', width: 1200 },
];

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
