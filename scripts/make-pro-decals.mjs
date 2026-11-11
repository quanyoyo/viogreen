// Ảnh dán cho AR Sol Pro / Grid Pro dựng theo máy thật (ảnh chủ web gửi 11/11/2026, images-src/2026-11/may-that/):
//   1) models-src/decals/pin-mat-tren.png  – bề mặt tấm pin: 6×2 khối ô pin, khe + viền trắng, đường chia dải, đường bus
//      (bố cục đo trên ảnh nlmt/01 chụp từ trên xuống; kích thước = lòng khay C2 532×352 mm)
//   2) models-src/decals/logo-may-that.png – logo + dòng "Smart care for Urban Green Spaces" tách nền từ ảnh nlmt/06
//      (chụp thẳng mặt trước). Màu chữ giữ đúng màu trên ảnh, quy đổi theo màu thân `proBody` trong models.json
//      để logo cùng độ sáng với vỏ khi lên trình xem.
// Chạy: node scripts/make-pro-decals.mjs   rồi npm run models -- ecohub-sol-pro ecohub-grid-pro
// Màu PIN.colors và proBody đã hiệu chỉnh bằng ảnh chụp model-viewer so với ảnh thật (ΔE2000) – xem CLAUDE.md mục 8.4.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'models-src', 'decals');

/* ---------- 1) Bề mặt tấm pin ---------- */
export const PIN = {
  mm: [532, 352],          // lòng khay C2: u (ngang máy) × v (dọc dốc)
  pxPerMm: 3,
  marginU: 45.2,           // viền trắng mỗi đầu theo u (ảnh 01: ~49 mm tính cả vành 4 mm)
  marginV: 22.25,
  groupU: 68.4, gapU: 6.25, // 6 khối theo u
  groupV: 152.5, gapV: 2.5, // 2 khối theo v
  strips: 4,               // mỗi khối 4 dải ô, ngăn bằng đường sáng
  busPerStrip: 4,          // mỗi dải 4 đường bus mảnh (chạy theo u)
  lineMm: { strip: 1.0, bus: 0.5 },
  colors: { cell: '#3a3d45', white: '#e0f1ff', strip: '#c9d3df', bus: '#7d8594' },
};

function pinSvg(p = PIN) {
  const k = p.pxPerMm, W = Math.round(p.mm[0] * k), H = Math.round(p.mm[1] * k);
  const r = (x, y, w, h, fill) => `<rect x="${(x * k).toFixed(2)}" y="${(y * k).toFixed(2)}" width="${(w * k).toFixed(2)}" height="${(h * k).toFixed(2)}" fill="${fill}"/>`;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">` + r(0, 0, p.mm[0], p.mm[1], p.colors.white);
  for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) {
    const x0 = p.marginU + i * (p.groupU + p.gapU), y0 = p.marginV + j * (p.groupV + p.gapV);
    s += r(x0, y0, p.groupU, p.groupV, p.colors.cell);
    const sw = p.groupV / p.strips;
    for (let t = 0; t < p.strips; t++) {
      const ys = y0 + t * sw;
      if (t > 0) s += r(x0, ys - p.lineMm.strip / 2, p.groupU, p.lineMm.strip, p.colors.strip);
      for (let b = 1; b <= p.busPerStrip; b++) s += r(x0, ys + (b * sw) / (p.busPerStrip + 1) - p.lineMm.bus / 2, p.groupU, p.lineMm.bus, p.colors.bus);
    }
  }
  return s + '</svg>';
}

/* ---------- 2) Logo tách nền từ ảnh ---------- */
const LOGO = {
  photo: path.join(ROOT, 'images-src', '2026-11', 'may-that', 'nlmt', '06.jpg'),
  crop: [772, 716, 420, 412],  // x, y, rộng, cao (px ảnh gốc sau xoay EXIF) – logo nằm ở x 789–1174, y 731–1113
  d0: 3, d1: 16,               // ΔE2000 so với nền: ≤ d0 = trong suốt, ≥ d1 = đục
  gain: [0.5352, 0.9112, 0.2824],             // hệ số tuyến tính R, G, B cho màu logo: lớp phản xạ bề mặt trên trình xem làm logo nhạt hơn ảnh → bù lại (hiệu chỉnh ΔE)
};
const toLin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const toSrgb = (l) => { l = Math.min(1, Math.max(0, l)); return 255 * (l <= 0.0031308 ? l * 12.92 : 1.055 * l ** (1 / 2.4) - 0.055); };
function lab([r, g, b]) {
  const [R, G, B] = [r, g, b].map(toLin);
  const X = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047, Y = 0.2126 * R + 0.7152 * G + 0.0722 * B, Z = (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883;
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}
function dE00(c1, c2) {
  const [L1, a1, b1] = lab(c1), [L2, a2, b2] = lab(c2), rad = Math.PI / 180;
  const Cb = (Math.hypot(a1, b1) + Math.hypot(a2, b2)) / 2, G = 0.5 * (1 - Math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)));
  const a1p = (1 + G) * a1, a2p = (1 + G) * a2, C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
  const h = (a, b) => { const v = Math.atan2(b, a) / rad; return v < 0 ? v + 360 : v; };
  const h1p = h(a1p, b1), h2p = h(a2p, b2);
  let dhp = 0; if (C1p * C2p) { dhp = h2p - h1p; if (dhp > 180) dhp -= 360; else if (dhp < -180) dhp += 360; }
  const dLp = L2 - L1, dCp = C2p - C1p, dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * rad);
  const Lbp = (L1 + L2) / 2, Cbp = (C1p + C2p) / 2;
  let hbp = h1p + h2p; if (C1p * C2p) { if (Math.abs(h1p - h2p) > 180) hbp = hbp < 360 ? hbp + 360 : hbp - 360; hbp /= 2; }
  const T = 1 - 0.17 * Math.cos((hbp - 30) * rad) + 0.24 * Math.cos(2 * hbp * rad) + 0.32 * Math.cos((3 * hbp + 6) * rad) - 0.2 * Math.cos((4 * hbp - 63) * rad);
  const Rc = 2 * Math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7)), dTh = 30 * Math.exp(-(((hbp - 275) / 25) ** 2));
  const Sl = 1 + (0.015 * (Lbp - 50) ** 2) / Math.sqrt(20 + (Lbp - 50) ** 2), Sc = 1 + 0.045 * Cbp, Sh = 1 + 0.015 * Cbp * T;
  return Math.sqrt((dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2 - Math.sin(2 * dTh * rad) * Rc * (dCp / Sc) * (dHp / Sh));
}

async function logo() {
  const materials = JSON.parse(fs.readFileSync(path.join(ROOT, 'models-src', 'models.json'), 'utf8')).materials;
  const body = materials.proBody.color.replace('#', '').match(/../g).map((h) => toLin(parseInt(h, 16)));
  const [x0, y0, w, h] = LOGO.crop;
  const { data } = await sharp(LOGO.photo).rotate().extract({ left: x0, top: y0, width: w, height: h }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = (x, y) => [0, 1, 2].map((k) => data[(y * w + x) * 3 + k]);
  // nền (thân trắng) = mặt phẳng a + b·x + c·y khớp theo viền 8 px quanh khung cắt (bình phương tối thiểu)
  const S = Array.from({ length: 3 }, () => ({ n: 0, x: 0, y: 0, xx: 0, yy: 0, xy: 0, v: 0, xv: 0, yv: 0 }));
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (x >= 8 && x < w - 8 && y >= 8 && y < h - 8) continue;
    const c = px(x, y);
    for (let k = 0; k < 3; k++) { const s = S[k], v = c[k]; s.n++; s.x += x; s.y += y; s.xx += x * x; s.yy += y * y; s.xy += x * y; s.v += v; s.xv += x * v; s.yv += y * v; }
  }
  const solve3 = (A, b) => { // Cramer 3×3
    const det = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    const D = det(A); return [0, 1, 2].map((i) => det(A.map((row, r) => row.map((v, c) => (c === i ? b[r] : v)))) / D);
  };
  const fit = S.map((s) => solve3([[s.n, s.x, s.y], [s.x, s.xx, s.xy], [s.y, s.xy, s.yy]], [s.v, s.xv, s.yv]));
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const c = px(x, y), B = fit.map(([a, b, cc]) => a + b * x + cc * y);
    const a = Math.min(1, Math.max(0, (dE00(c, B) - LOGO.d0) / (LOGO.d1 - LOGO.d0)));
    const F = a > 0 ? c.map((v, k) => Math.min(255, Math.max(0, (v - (1 - a) * B[k]) / a))) : B;
    const i = (y * w + x) * 4;
    for (let k = 0; k < 3; k++) out[i + k] = Math.round(toSrgb((toLin(F[k]) * body[k] * (1 + (LOGO.gain[k] - 1) * a)) / toLin(B[k]))); // cùng tỉ lệ sáng với thân
    out[i + 3] = Math.round(a * 255);
  }
  await sharp(out, { raw: { width: w, height: h, channels: 4 } }).png().toFile(path.join(OUT, 'logo-may-that.png'));
  console.log(`✔ logo-may-that.png ${w}×${h}  nền ảnh ~rgb(${fit.map(([a, b, c]) => Math.round(a + (b * w) / 2 + (c * h) / 2)).join(',')}) → thân ${materials.proBody.color}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  await sharp(Buffer.from(pinSvg())).png().toFile(path.join(OUT, 'pin-mat-tren.png'));
  console.log(`✔ pin-mat-tren.png ${Math.round(PIN.mm[0] * PIN.pxPerMm)}×${Math.round(PIN.mm[1] * PIN.pxPerMm)}`);
  await logo();
}
