// Chuẩn hoá file GLB do AI tạo từ ảnh sản phẩm (TRELLIS / Hugging Face) để dùng cho <model-viewer> / AR.
// Chạy: node scripts/fix-ai-glb.mjs <vào.glb> <ra.glb> [--front +x|-x|+z|-z] [--height 0.356] [--depth 0.25]
//         [--logo models-src/decals/logo-vio-green.png --logo-box x0,y0,x1,y1 --logo-height 0.07]
//   - Xoay để mặt trước (mặt có vòm) quay về +Z (hướng camera mặc định của model-viewer)
//   - Đưa về kích thước thật: cao --height (m); độ sâu --depth (m, AI chỉ đoán được vì ảnh không có mặt bên)
//     bề rộng giữ theo tỉ lệ ảnh. Căn giữa, đáy chạm sàn.
//   - --logo-box: vùng logo méo do AI vẽ trên mặt trước (toạ độ x,y tính bằng m sau khi chuẩn hoá) → tô lại
//     bằng màu vỏ xung quanh ngay trong ảnh màu, rồi dán logo sạch (PNG nền trong suốt) ôm theo bề mặt.
//   - Nén: ảnh màu → WebP 1024px, hình học → meshopt.
import fs from 'node:fs';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, prune, dedup, meshopt, textureCompress, flatten } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';

const args = process.argv.slice(2);
const [input, output] = args;
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const front = opt('front', '+x'), H = +opt('height', 0.356), D = +opt('depth', 0.25);
const logo = opt('logo'), logoH = +opt('logo-height', 0.07);
let logoBox = opt('logo-box')?.split(',').map(Number);

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
const doc = await io.read(input);
await doc.transform(flatten());
const prims = doc.getRoot().listMeshes().flatMap((m) => m.listPrimitives());
if (prims.length !== 1) throw new Error(`cần đúng 1 primitive, có ${prims.length}`);
const prim = prims[0];
const posAcc = prim.getAttribute('POSITION');
const P = posAcc.getArray().slice();

// 1) Xoay quanh trục Y để mặt trước về +Z
const rot = { '+x': (x, z) => [-z, x], '-x': (x, z) => [z, -x], '+z': (x, z) => [x, z], '-z': (x, z) => [-x, -z] }[front];
for (let i = 0; i < P.length; i += 3) { const [x, z] = rot(P[i], P[i + 2]); P[i] = x; P[i + 2] = z; }
// 2) Kích thước thật
const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
for (let i = 0; i < P.length; i++) { mn[i % 3] = Math.min(mn[i % 3], P[i]); mx[i % 3] = Math.max(mx[i % 3], P[i]); }
const s = H / (mx[1] - mn[1]), sz = D / (mx[2] - mn[2]);
for (let i = 0; i < P.length; i += 3) {
  P[i] = (P[i] - (mn[0] + mx[0]) / 2) * s;
  P[i + 1] = (P[i + 1] - mn[1]) * s;
  P[i + 2] = (P[i + 2] - (mn[2] + mx[2]) / 2) * sz;
}
// --flatten-x x0,y0,z0,x1,y1,z1 (m), lặp được: là phẳng các đỉnh trong hộp về mặt phẳng x = trung vị x của chúng
// (xoá khối nổi/lõm của cụm nút, cổng AI nặn trên mặt bên trái/phải)
// Mép hộp mờ dần (--flatten-feather m, mặc định 1,2 cm) để chỗ giáp mặt xung quanh không bị nhăn
// --flatten-z: như trên nhưng là phẳng theo trục Z (mặt trước / sau), VD vết lõm trên viền nắp phía sau
for (const [flag, ax] of [['--flatten-x', 0], ['--flatten-z', 2]]) for (let i = args.indexOf(flag); i >= 0; i = args.indexOf(flag, i + 1)) {
  // số thứ 7 (tuỳ chọn) = độ mờ mép riêng cho hộp này; số thứ 8 (tuỳ chọn) = mặt phẳng đích cố định thay cho trung vị
  // (dùng khi hộp chỉ ôm phần nhô ra, VD gờ nổi trên mặt lưng: ép về đúng mặt lưng xung quanh)
  const [x0, y0, z0, x1, y1, z1, f7, t8] = args[i + 1].split(',').map(Number), F = f7 ?? +opt('flatten-feather', 0.012), core = [], ring = [];
  const lo = [x0, y0, z0], hi = [x1, y1, z1], o1 = ax === 0 ? 2 : 0;
  const dOut = (v, a, b) => Math.max(a - v, 0, v - b);
  for (let j = 0; j < P.length; j += 3) {
    if (P[j + ax] < lo[ax] || P[j + ax] > hi[ax]) continue;
    const d = Math.hypot(dOut(P[j + 1], y0, y1), dOut(P[j + o1], lo[o1], hi[o1]));
    if (d === 0) core.push(j); else if (d < F) ring.push([j, 1 - d / F]);
  }
  const xs = core.map((j) => P[j + ax]).sort((p, q) => p - q), xm = Number.isFinite(t8) ? t8 : xs[xs.length >> 1];
  for (const j of core) P[j + ax] = xm;
  for (const [j, w] of ring) P[j + ax] = P[j + ax] * (1 - w) + xm * w;
  console.log(`đã là phẳng ${core.length} đỉnh (+${ring.length} đỉnh mép) về ${'xyz'[ax]} = ${(xm * 100).toFixed(2)} cm`);
}
posAcc.setArray(P);
for (const n of doc.getRoot().listNodes()) n.setTranslation([0, 0, 0]).setRotation([0, 0, 0, 1]).setScale([1, 1, 1]);
const W = (mx[0] - mn[0]) * s;
console.log(`kích thước: rộng ${(W * 100).toFixed(1)} × sâu ${(D * 100).toFixed(1)} × cao ${(H * 100).toFixed(1)} cm`);

const idx = prim.getIndices()?.getArray();
const uvs = prim.getAttribute('TEXCOORD_0')?.getArray();
const triCount = idx ? idx.length / 3 : P.length / 9;
const vi = (t, k) => (idx ? idx[t * 3 + k] : t * 3 + k);
const V = (v) => [P[v * 3], P[v * 3 + 1], P[v * 3 + 2]];


// mặt trước gần nhất (z lớn nhất) mà tia song song trục Z chạm tại (x, y)
function frontZ(x, y) {
  let best = null;
  for (let t = 0; t < triCount; t++) {
    const [a, b, c] = [V(vi(t, 0)), V(vi(t, 1)), V(vi(t, 2))];
    const d = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
    if (Math.abs(d) < 1e-12) continue;
    const l1 = ((b[1] - c[1]) * (x - c[0]) + (c[0] - b[0]) * (y - c[1])) / d;
    const l2 = ((c[1] - a[1]) * (x - c[0]) + (a[0] - c[0]) * (y - c[1])) / d;
    const l3 = 1 - l1 - l2;
    if (l1 < -1e-6 || l2 < -1e-6 || l3 < -1e-6) continue;
    const z = l1 * a[2] + l2 * b[2] + l3 * c[2];
    if (best === null || z > best) best = z;
  }
  return best;
}

const texture = prim.getMaterial()?.getBaseColorTexture();
const texRaw = texture ? await sharp(Buffer.from(texture.getImage())).ensureAlpha().raw().toBuffer({ resolveWithObject: true }) : null;
// BODY: màu vỏ thân thật (trung vị điểm ảnh sáng, trung tính, lấy từ tâm các tam giác mặt đứng) – mặc định cho mọi chỗ tô "trắng",
// để chỗ tô / vỏ phủ / mảng vá khớp màu phần còn lại (đặt tay bằng --body-color r,g,b nếu cần)
const BODY = (() => {
  if (opt('body-color') && opt('body-color') !== 'auto') return opt('body-color').split(',').map(Number);
  if (!texRaw) return [221, 221, 221];
  const { data, info } = texRaw, acc = [[], [], []];
  for (let t = 0; t < triCount; t += 3) {
    const vs = [vi(t, 0), vi(t, 1), vi(t, 2)], ps = vs.map(V), a = [0, 1, 2].map((k) => ps[1][k] - ps[0][k]), b = [0, 1, 2].map((k) => ps[2][k] - ps[0][k]);
    const ny = Math.abs(a[2] * b[0] - a[0] * b[2]) / (Math.hypot(a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]) || 1);
    if (ny > 0.4) continue;
    const u = (uvs[vs[0] * 2] + uvs[vs[1] * 2] + uvs[vs[2] * 2]) / 3, v = (uvs[vs[0] * 2 + 1] + uvs[vs[1] * 2 + 1] + uvs[vs[2] * 2 + 1]) / 3;
    const o = (Math.min(info.height - 1, Math.floor(v * info.height)) * info.width + Math.min(info.width - 1, Math.floor(u * info.width))) * 4;
    const [r, g, bl] = [data[o], data[o + 1], data[o + 2]];
    if (r + g + bl > 3 * 175 && Math.max(r, g, bl) - Math.min(r, g, bl) < 14) { acc[0].push(r); acc[1].push(g); acc[2].push(bl); }
  }
  return acc[0].length > 200 ? acc.map((c) => c.sort((p, q) => p - q)[c.length >> 1]) : [221, 221, 221];
})();
console.log('màu thân (BODY): rgb(' + BODY.join(',') + ')');
const texOrig = texRaw ? Buffer.from(texRaw.data) : null; // bản gốc: nhận dạng tấm pin / dây theo màu AI vẽ, không theo màu đã tô lại

// --probe "x,y;x,y" (m): in mọi bề mặt tia từ phía trước xuyên qua (z, màu ảnh) rồi thoát – dùng để đo trước khi dựng thêm
if (opt('probe')) {
  for (const pt of opt('probe').split(';')) {
    const [x, y] = pt.split(',').map(Number);
    const hits = [];
    for (let t = 0; t < triCount; t++) {
      const vs = [vi(t, 0), vi(t, 1), vi(t, 2)], [a, b, c] = vs.map(V);
      const d = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
      if (Math.abs(d) < 1e-12) continue;
      const l1 = ((b[1] - c[1]) * (x - c[0]) + (c[0] - b[0]) * (y - c[1])) / d, l2 = ((c[1] - a[1]) * (x - c[0]) + (a[0] - c[0]) * (y - c[1])) / d, l3 = 1 - l1 - l2;
      if (l1 < -1e-6 || l2 < -1e-6 || l3 < -1e-6) continue;
      const u = l1 * uvs[vs[0] * 2] + l2 * uvs[vs[1] * 2] + l3 * uvs[vs[2] * 2], v = l1 * uvs[vs[0] * 2 + 1] + l2 * uvs[vs[1] * 2 + 1] + l3 * uvs[vs[2] * 2 + 1];
      const o = (Math.min(texRaw.info.height - 1, Math.floor(v * texRaw.info.height)) * texRaw.info.width + Math.min(texRaw.info.width - 1, Math.floor(u * texRaw.info.width))) * 4;
      hits.push([l1 * a[2] + l2 * b[2] + l3 * c[2], [texRaw.data[o], texRaw.data[o + 1], texRaw.data[o + 2]]]);
    }
    hits.sort((p, q) => q[0] - p[0]);
    console.log(`(${(x * 100).toFixed(1)}, ${(y * 100).toFixed(1)}) cm →`, hits.map(([z, c]) => `${(z * 100).toFixed(1)}cm rgb(${c.join(',')})`).join(' | ') || 'không chạm');
  }
  process.exit(0);
}
const normalZ = (ps) => { const a = [0, 1, 2].map((k) => ps[1][k] - ps[0][k]), b = [0, 1, 2].map((k) => ps[2][k] - ps[0][k]); const n = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; return n[2] / (Math.hypot(...n) || 1); };

// --top-fill: tô lại mặt trên cùng (nắp) bằng 1 màu đều – xoá đốm sáng do AI vẽ
/** Tô các điểm ảnh của những tam giác thoả `pick` bằng `color` (hoặc trung vị màu của chính chúng) */
function paintTriangles(pick, color, grow = 0.08) {
  const { data, info } = texRaw;
  const TW = info.width, TH = info.height, mask = new Uint8Array(TW * TH);
  for (let t = 0; t < triCount; t++) {
    const vs = [vi(t, 0), vi(t, 1), vi(t, 2)];
    if (!pick(vs.map(V), vs)) continue;
    const uv = vs.map((v) => [uvs[v * 2] * TW, uvs[v * 2 + 1] * TH]);
    const [a, b, q] = uv; const d = (b[1] - q[1]) * (a[0] - q[0]) + (q[0] - b[0]) * (a[1] - q[1]);
    if (Math.abs(d) < 1e-9) continue;
    for (let py = Math.max(0, Math.floor(Math.min(a[1], b[1], q[1])) - 1); py <= Math.min(TH - 1, Math.ceil(Math.max(a[1], b[1], q[1])) + 1); py++)
      for (let px = Math.max(0, Math.floor(Math.min(a[0], b[0], q[0])) - 1); px <= Math.min(TW - 1, Math.ceil(Math.max(a[0], b[0], q[0])) + 1); px++) {
        const X = px + 0.5, Y = py + 0.5;
        const l1 = ((b[1] - q[1]) * (X - q[0]) + (q[0] - b[0]) * (Y - q[1])) / d, l2 = ((q[1] - a[1]) * (X - q[0]) + (a[0] - q[0]) * (Y - q[1])) / d;
        if (l1 >= -grow && l2 >= -grow && 1 - l1 - l2 >= -grow) mask[py * TW + px] = 1;
      }
  }
  const idxs = []; for (let i = 0; i < mask.length; i++) if (mask[i]) idxs.push(i);
  const fill = color ?? [0, 1, 2].map((k) => { const v = idxs.map((i) => data[i * 4 + k]).sort((p, q) => p - q); return v[v.length >> 1]; });
  for (const i of idxs) for (let k = 0; k < 3; k++) data[i * 4 + k] = fill[k];
  return { count: idxs.length, fill };
}
if (args.includes('--top-fill')) {
  const texColor = (vs) => { const u = (uvs[vs[0] * 2] + uvs[vs[1] * 2] + uvs[vs[2] * 2]) / 3, v = (uvs[vs[0] * 2 + 1] + uvs[vs[1] * 2 + 1] + uvs[vs[2] * 2 + 1]) / 3; const o = (Math.min(texRaw.info.height - 1, Math.floor(v * texRaw.info.height)) * texRaw.info.width + Math.min(texRaw.info.width - 1, Math.floor(u * texRaw.info.width))) * 4; return [texRaw.data[o], texRaw.data[o + 1], texRaw.data[o + 2]]; };
  const r = paintTriangles((ps, vs) => {
    const [cr, cg, cb] = texColor(vs);
    if (!(cg > cr + 20 && cg > cb)) return false; // chỉ phần nắp xanh
    const a = [0, 1, 2].map((k) => ps[1][k] - ps[0][k]), b = [0, 1, 2].map((k) => ps[2][k] - ps[0][k]);
    const n = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    return n[1] / (Math.hypot(...n) || 1) > 0.9 && Math.min(ps[0][1], ps[1][1], ps[2][1]) > +opt('top-min', 0.97) * H && Math.max(ps[0][1], ps[1][1], ps[2][1]) < +opt('top-max', 1.01) * H;
  }, opt('top-color')?.split(',').map(Number) ?? null, 0.02);
  texture.setImage(await sharp(texRaw.data, { raw: { width: texRaw.info.width, height: texRaw.info.height, channels: 4 } }).png().toBuffer());
  console.log(`đã tô lại nắp: ${r.count} điểm ảnh, rgb(${r.fill.join(',')})`);
}

// --back-shade: mặt sau tô 1 màu trơn nhìn "phẳng lì" khác phần còn lại (AI vẽ sẵn bóng đổ, tối dần ra mép).
// → đo độ sáng ảnh màu gốc ở mặt TRƯỚC theo ô 5 mm (x, cao), chuẩn hoá thành hệ số sáng/tối, rồi nhân vào màu mặt sau
// (cả phần tô trong ảnh màu lẫn lớp vỏ --back-cover). Vùng logo / vòm xanh không lấy, lấp bằng ô xung quanh.
let shadeAt = null;
if (args.includes('--back-shade') && texRaw) {
  const C = 0.005, nx = Math.ceil(W / C) + 2, ny = Math.ceil(H / C) + 2, cells = Array.from({ length: nx * ny }, () => []);
  const { info } = texRaw, TW = info.width, TH = info.height;
  for (let t = 0; t < triCount; t++) {
    const vs = [vi(t, 0), vi(t, 1), vi(t, 2)], ps = vs.map(V);
    const n = norm3(cross3(sub3(ps[1], ps[0]), sub3(ps[2], ps[0])));
    if (n[2] < 0.5) continue;
    for (let i = 0; i <= 4; i++) for (let j = 0; j <= 4 - i; j++) {
      const a = i / 4, b = j / 4, c = 1 - a - b;
      const p = [0, 1, 2].map((k) => a * ps[0][k] + b * ps[1][k] + c * ps[2][k]);
      const u = a * uvs[vs[0] * 2] + b * uvs[vs[1] * 2] + c * uvs[vs[2] * 2], v = a * uvs[vs[0] * 2 + 1] + b * uvs[vs[1] * 2 + 1] + c * uvs[vs[2] * 2 + 1];
      const o = (Math.min(TH - 1, Math.floor(v * TH)) * TW + Math.min(TW - 1, Math.floor(u * TW))) * 4;
      const [r, g, bl] = [texOrig[o], texOrig[o + 1], texOrig[o + 2]];
      if (Math.max(r, g, bl) - Math.min(r, g, bl) > 14 || r + g + bl < 3 * 140) continue; // bỏ chữ / logo / vòm xanh / hốc tối
      const cx = Math.floor((p[0] + W / 2) / C) + 1, cy = Math.floor(p[1] / C) + 1;
      if (cx >= 0 && cx < nx && cy >= 0 && cy < ny) cells[cy * nx + cx].push((r + g + bl) / 3);
    }
  }
  let L = cells.map((c) => (c.length ? c.sort((p, q) => p - q)[c.length >> 1] : null));
  for (let pass = 0; pass < 40 && L.includes(null); pass++) L = L.map((v, i) => { if (v !== null) return v; const x = i % nx, y = (i / nx) | 0, nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => (x + dx >= 0 && x + dx < nx && y + dy >= 0 && y + dy < ny ? L[(y + dy) * nx + x + dx] : null)).filter((q) => q !== null); return nb.length ? nb.reduce((s2, q) => s2 + q, 0) / nb.length : null; });
  for (let pass = 0; pass < 2; pass++) L = L.map((v, i) => { const x = i % nx, y = (i / nx) | 0; let sum = 0, k = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const q = L[(y + dy) * nx + x + dx]; if (x + dx >= 0 && x + dx < nx && y + dy >= 0 && y + dy < ny && q !== null) { sum += q; k++; } } return k ? sum / k : v; });
  // Tách thành 2 chiều để không chép hình vòm / logo sang mặt sau:
  //  fx(x) = độ sáng theo bề ngang, đo ở dải giữa vòm và logo (--shade-band y0,y1);
  //  fy(y) = độ sáng theo chiều cao, đo ở 2 bên ngoài vòm (--shade-cols x0,x1 = khoảng x của vòm, bỏ qua).
  const [by0, by1] = opt('shade-band', '0.19,0.25').split(',').map(Number), [ax0, ax1] = opt('shade-cols', '-0.06,0.08').split(',').map(Number);
  const med = (a) => { const b = a.filter((v) => v !== null).sort((p, q) => p - q); return b.length ? b[b.length >> 1] : null; };
  const colOf = (x) => Math.min(nx - 1, Math.max(0, Math.floor((x + W / 2) / C) + 1)), rowOf = (y) => Math.min(ny - 1, Math.max(0, Math.floor(y / C) + 1));
  const fxRaw = Array.from({ length: nx }, (_, cx) => med(Array.from({ length: rowOf(by1) - rowOf(by0) + 1 }, (_, k) => L[(rowOf(by0) + k) * nx + cx])));
  const mid = med(fxRaw.slice(colOf(-W / 4), colOf(W / 4) + 1));
  const fx = fxRaw.map((v) => (v === null ? 1 : v / mid));
  const fy = Array.from({ length: ny }, (_, cy) => { const v = med(Array.from({ length: nx }, (_, cx) => { const x = (cx - 1) * C - W / 2; return x > ax0 && x < ax1 || Math.abs(x) > W / 2 - 0.03 ? null : L[cy * nx + cx] / (fxRaw[cx] ?? mid) * mid; })); return v === null ? 1 : v / mid; });
  const lo = +opt('shade-min', 0.88), hi = +opt('shade-max', 1.03);
  shadeAt = (x, y) => Math.min(hi, Math.max(lo, fx[colOf(x)] * fy[rowOf(y)]));
  const all = []; for (let cx = 0; cx < nx; cx++) all.push(fx[cx]);
  console.log(`đã đo bóng đổ mặt trước: ngang ${Math.min(...all).toFixed(2)}…${Math.max(...all).toFixed(2)}, dọc ${Math.min(...fy).toFixed(2)}…${Math.max(...fy).toFixed(2)} (giới hạn ${lo}…${hi})`);
}

// --back-fill: AI tự đoán mặt sau (ảnh chỉ có mặt trước) và hay vẽ hốc tối → tô các mảng tối ở 1/4 phía sau
// bằng màu vỏ (chừa chân đế). Máy thật mặt sau là tấm phẳng trắng (theo file CAD).
if (args.includes('--back-fill')) {
  const body = opt('back-color') ? opt('back-color').split(',').map(Number) : BODY;
  const maxLum = +opt('back-max-lum', 150); // 256 = tô cả mảng sáng (toàn bộ mặt sau 1 màu)
  const tc = (vs) => { const u = (uvs[vs[0] * 2] + uvs[vs[1] * 2] + uvs[vs[2] * 2]) / 3, v = (uvs[vs[0] * 2 + 1] + uvs[vs[1] * 2 + 1] + uvs[vs[2] * 2 + 1]) / 3; const o = (Math.min(texRaw.info.height - 1, Math.floor(v * texRaw.info.height)) * texRaw.info.width + Math.min(texRaw.info.width - 1, Math.floor(u * texRaw.info.width))) * 4; return texRaw.data[o] + texRaw.data[o + 1] + texRaw.data[o + 2]; };
  const r = paintTriangles((ps, vs) => {
    const cz = (ps[0][2] + ps[1][2] + ps[2][2]) / 3, cy = (ps[0][1] + ps[1][1] + ps[2][1]) / 3;
    return cz < -0.25 * D && cy > 0.05 * H && cy < +opt('back-ymax', 0.95) * H && tc(vs) < 3 * maxLum;
  }, body, 0.1);
  if (shadeAt) paintTexels((ps) => { const cz = (ps[0][2] + ps[1][2] + ps[2][2]) / 3, cy = (ps[0][1] + ps[1][1] + ps[2][1]) / 3; return cz < -0.25 * D && cy > 0.05 * H && cy < +opt('back-ymax', 0.95) * H; },
    // mặt quay hẳn ra sau dùng --back-color (đã hạ cho khỏi loá), mặt cong sang hông chuyển dần về màu thân BODY
    (p, nrm) => { const w = Math.min(1, Math.max(0, (-nrm[2] - 0.4) / 0.45)); return body.map((c, k) => Math.round((BODY[k] + (c - BODY[k]) * w) * (1 + (shadeAt(p[0], p[1]) - 1) * w))); });
  texture.setImage(await sharp(texRaw.data, { raw: { width: texRaw.info.width, height: texRaw.info.height, channels: 4 } }).png().toBuffer());
  console.log(`đã tô lại mảng tối phía sau: ${r.count} điểm ảnh${shadeAt ? ' (có bóng đổ)' : ''}`);
}

/** Tô từng điểm ảnh theo vị trí 3D của nó: color(pos, normal) trả về [r,g,b] hoặc null (giữ nguyên).
 *  pre(ps, normal) lọc nhanh theo tam giác. Khác paintTriangles: ranh giới cắt ngang tam giác được → mép gọn. */
function paintTexels(pre, color) {
  const { data, info } = texRaw, TW = info.width, TH = info.height;
  let count = 0;
  for (let t = 0; t < triCount; t++) {
    const vs = [vi(t, 0), vi(t, 1), vi(t, 2)], ps = vs.map(V);
    const nrm = norm3(cross3(sub3(ps[1], ps[0]), sub3(ps[2], ps[0])));
    if (!pre(ps, nrm)) continue;
    const uv = vs.map((v) => [uvs[v * 2] * TW, uvs[v * 2 + 1] * TH]);
    const [a, b, q] = uv; const d = (b[1] - q[1]) * (a[0] - q[0]) + (q[0] - b[0]) * (a[1] - q[1]);
    if (Math.abs(d) < 1e-12) continue;
    const g = 0.6 / Math.sqrt(Math.abs(d)); // nới ~0.6 px để không hở đường may giữa các tam giác
    for (let py = Math.max(0, Math.floor(Math.min(a[1], b[1], q[1])) - 1); py <= Math.min(TH - 1, Math.ceil(Math.max(a[1], b[1], q[1])) + 1); py++)
      for (let px = Math.max(0, Math.floor(Math.min(a[0], b[0], q[0])) - 1); px <= Math.min(TW - 1, Math.ceil(Math.max(a[0], b[0], q[0])) + 1); px++) {
        const X = px + 0.5, Y = py + 0.5;
        const l1 = ((b[1] - q[1]) * (X - q[0]) + (q[0] - b[0]) * (Y - q[1])) / d, l2 = ((q[1] - a[1]) * (X - q[0]) + (a[0] - q[0]) * (Y - q[1])) / d, l3 = 1 - l1 - l2;
        if (l1 < -g || l2 < -g || l3 < -g) continue;
        const pos = [0, 1, 2].map((k) => l1 * ps[0][k] + l2 * ps[1][k] + l3 * ps[2][k]);
        const o = (py * TW + px) * 4;
        const c = color(pos, nrm, o);
        if (!c) continue; data[o] = c[0]; data[o + 1] = c[1]; data[o + 2] = c[2]; count++;
      }
  }
  return count;
}
async function flushTexture() { texture.setImage(await sharp(texRaw.data, { raw: { width: texRaw.info.width, height: texRaw.info.height, channels: 4 } }).png().toBuffer()); }
const inRoundRect = (x, z, [x0, z0, x1, z1, r]) => { const dx = Math.max(x0 + r - x, 0, x - (x1 - r)), dz = Math.max(z0 + r - z, 0, z - (z1 - r)); return x >= x0 && x <= x1 && z >= z0 && z <= z1 && dx * dx + dz * dz <= r * r; };

// --pad x0,z0,x1,z1,r (m) --pad-y y0,y1 (m): mặt nắp (mặt hướng lên, cao y0…y1) → trong hình chữ nhật bo góc
// tô xanh (--top-color), ngoài tô trắng (--body-color). Thay cho vùng xanh méo do AI / --top-fill.
if (opt('pad')) {
  const pad = opt('pad').split(',').map(Number), [py0, py1] = opt('pad-y').split(',').map(Number);
  const green = opt('top-color', '40,100,62').split(',').map(Number);
  // --pad-white-y y0,y1: dải cao rộng hơn để tô trắng đều cả các mặt trên khác (bình nước, khối sau) – mặc định = --pad-y
  const [wy0, wy1] = (opt('pad-white-y') ?? opt('pad-y')).split(',').map(Number);
  // --pad-dot x,z,r (m): chấm tròn xanh sáng giữa nắp (như ảnh SP)
  const dot = opt('pad-dot')?.split(',').map(Number), dotColor = opt('dot-color', '62,132,84').split(',').map(Number);
  const preTop = (ps, nrm) => nrm[1] > 0.6 && ps.some((p) => p[1] > Math.min(py0, wy0) && p[1] < Math.max(py1, wy1));
  // màu trắng = trung vị các điểm ảnh sáng sẵn có ngoài vùng xanh (khớp độ sáng mép nắp, không thành viền loang lổ)
  const light = [];
  paintTexels(preTop, (p, _n, o) => { const d = texRaw.data; if (p[1] >= wy0 && p[1] <= wy1 && !inRoundRect(p[0], p[2], pad) && d[o] + d[o + 1] + d[o + 2] > 3 * 170 && Math.abs(d[o] - d[o + 1]) < 12) light.push([d[o], d[o + 1], d[o + 2]]); return null; });
  const white = light.length > 100 ? [0, 1, 2].map((k) => light.map((c) => c[k]).sort((a, b) => a - b)[light.length >> 1]) : BODY;
  const n = paintTexels(preTop,
    (p) => (p[1] >= py0 && p[1] <= py1 && inRoundRect(p[0], p[2], pad) ? (dot && Math.hypot(p[0] - dot[0], p[2] - dot[1]) < dot[2] ? dotColor : green) : p[1] >= wy0 && p[1] <= wy1 ? white : null));
  // --pad-walls [m]: tô cả vách dựng đứng quanh mảng xanh (rãnh / bậc giữa mảng xanh và viền trắng AI nặn, vẽ màu tối → thành
  // đường viền đen quanh mảng xanh). Trong hình chữ nhật → xanh, ngoài (trong phạm vi m, mặc định 1,2 cm) → trắng.
  if (args.includes('--pad-walls')) {
    const e = +(opt('pad-walls')?.match(/^[\d.]+$/) ? opt('pad-walls') : 0.012), big = [pad[0] - e, pad[1] - e, pad[2] + e, pad[3] + e, pad[4] + e];
    const m = paintTexels((ps, nrm) => nrm[1] <= 0.6 && ps.some((p) => p[1] > wy0 && p[1] < wy1),
      (p) => (p[1] < wy0 || p[1] > wy1 || !inRoundRect(p[0], p[2], big) ? null : inRoundRect(p[0], p[2], pad) ? green : white));
    console.log(`đã tô vách quanh mảng xanh: ${m} điểm ảnh`);
  }
  await flushTexture();
  console.log(`đã tô nắp: ${n} điểm ảnh, trắng rgb(${white.join(',')}) (xanh trong ${pad.slice(0, 4).map((v) => (v * 100).toFixed(1)).join(', ')} cm, bo ${(pad[4] * 100).toFixed(1)} cm)`);
}

// --top-recolor y0 (m): đổi màu các điểm ảnh xanh lá trên mặt hướng lên (cao hơn y0) sang --top-color, giữ nguyên hình
// vùng xanh AI vẽ (khi hình đã gọn, chỉ sai màu). Chấm sáng giữa nắp (xanh sáng) → --dot-color.
if (opt('top-recolor')) {
  const y0 = +opt('top-recolor'), green = opt('top-color', '40,100,62').split(',').map(Number), dot = opt('dot-color', '62,132,84').split(',').map(Number);
  const n = paintTexels((ps, nrm) => nrm[1] > 0.5 && ps.some((p) => p[1] > y0), (p, _n, o) => {
    const d = texRaw.data, r = d[o], g = d[o + 1], b = d[o + 2];
    if (p[1] <= y0 || !(g > r + 6 && g >= b)) return null;
    return g > 110 ? dot : green;
  });
  await flushTexture();
  console.log(`đã đổi màu nắp: ${n} điểm ảnh`);
}

// --white-box x0,y0,z0,x1,y1,z1 (m), lặp được: tô trắng mọi điểm ảnh trong hộp (VD xoá cụm cổng AI vẽ nhoè)
for (let i = args.indexOf('--white-box'); i >= 0; i = args.indexOf('--white-box', i + 1)) {
  const [x0, y0, z0, x1, y1, z1] = args[i + 1].split(',').map(Number);
  const inBox = (p) => p[0] >= x0 && p[0] <= x1 && p[1] >= y0 && p[1] <= y1 && p[2] >= z0 && p[2] <= z1;
  // màu tô = trung vị các điểm ảnh sáng sẵn có trong hộp (khớp độ sáng mặt xung quanh, không thành mảng trắng loá)
  const pre = (ps) => Math.min(...ps.map((p) => p[0])) <= x1 && Math.max(...ps.map((p) => p[0])) >= x0 && Math.min(...ps.map((p) => p[1])) <= y1 && Math.max(...ps.map((p) => p[1])) >= y0 && Math.min(...ps.map((p) => p[2])) <= z1 && Math.max(...ps.map((p) => p[2])) >= z0;
  const light = [];
  paintTexels(pre, (p, _n, o) => { const d = texRaw.data; if (inBox(p) && d[o] + d[o + 1] + d[o + 2] > 3 * 150) light.push([d[o], d[o + 1], d[o + 2]]); return null; });
  // có --unify thì tô thẳng màu thân (nếu không, mảng tô xám hơn sẽ bị --unify giữ lại một nửa độ tối)
  const white = args.includes('--unify') ? BODY : light.length > 50
    ? [0, 1, 2].map((k) => light.map((c) => c[k]).sort((a, b) => a - b)[light.length >> 1])
    : BODY;
  const n = paintTexels(pre, (p) => (inBox(p) ? white : null));
  await flushTexture();
  console.log(`đã tô hộp ${[x0, y0, z0, x1, y1, z1].map((v) => (v * 100).toFixed(1)).join(', ')} cm: ${n} điểm ảnh, rgb(${white.join(',')})`);
}

if (logo && !logoBox) throw new Error('--logo cần --logo-box x0,y0,x1,y1 (m): đo vùng logo méo trên ảnh chụp thẳng mặt trước');

if (logoBox) {
  // 3) Xoá logo méo trong ảnh màu: tô các tam giác mặt trước nằm trong vùng logo bằng màu vỏ xung quanh
  const tex = texture;
  const { data, info } = texRaw;
  const TW = info.width, TH = info.height;
  const mask = new Uint8Array(TW * TH);
  const [x0, y0, x1, y1] = logoBox;
  for (let t = 0; t < triCount; t++) {
    const vs = [vi(t, 0), vi(t, 1), vi(t, 2)], ps = vs.map(V);
    const c = [0, 1, 2].map((k) => (ps[0][k] + ps[1][k] + ps[2][k]) / 3);
    if (c[0] < x0 || c[0] > x1 || c[1] < y0 || c[1] > y1) continue;
    const zf = frontZ(c[0], c[1]);
    if (zf === null || c[2] < zf - 0.01) continue; // chỉ mặt ngoài phía trước
    // vẽ tam giác UV vào mask
    const uv = vs.map((v) => [uvs[v * 2] * TW, uvs[v * 2 + 1] * TH]);
    const [bx0, by0] = [Math.floor(Math.min(...uv.map((p) => p[0]))) - 1, Math.floor(Math.min(...uv.map((p) => p[1]))) - 1];
    const [bx1, by1] = [Math.ceil(Math.max(...uv.map((p) => p[0]))) + 1, Math.ceil(Math.max(...uv.map((p) => p[1]))) + 1];
    const [a, b, q] = uv; const d = (b[1] - q[1]) * (a[0] - q[0]) + (q[0] - b[0]) * (a[1] - q[1]);
    for (let py = Math.max(0, by0); py <= Math.min(TH - 1, by1); py++) for (let px = Math.max(0, bx0); px <= Math.min(TW - 1, bx1); px++) {
      const X = px + 0.5, Y = py + 0.5;
      const l1 = ((b[1] - q[1]) * (X - q[0]) + (q[0] - b[0]) * (Y - q[1])) / d, l2 = ((q[1] - a[1]) * (X - q[0]) + (a[0] - q[0]) * (Y - q[1])) / d;
      if (l1 >= -0.08 && l2 >= -0.08 && 1 - l1 - l2 >= -0.08) mask[py * TW + px] = 1;
    }
  }
  // màu vỏ: trung vị các điểm sáng (vỏ trắng) trong vùng mask
  const lum = [];
  for (let i = 0; i < mask.length; i++) if (mask[i]) { const l = data[i * 4] + data[i * 4 + 1] + data[i * 4 + 2]; lum.push([l, i]); }
  lum.sort((p, q) => p[0] - q[0]);
  const bright = lum.slice(Math.floor(lum.length * 0.6)).map(([, i]) => i);
  const fill = [0, 1, 2].map((k) => { const v = bright.map((i) => data[i * 4 + k]).sort((p, q) => p - q); return v[v.length >> 1]; });
  for (let i = 0; i < mask.length; i++) if (mask[i]) for (let k = 0; k < 3; k++) data[i * 4 + k] = fill[k];
  tex.setImage(await sharp(data, { raw: { width: TW, height: TH, channels: 4 } }).png().toBuffer()).setMimeType('image/png');
  console.log(`đã xoá logo méo: ${lum.length} điểm ảnh, màu vỏ rgb(${fill.join(',')})`);
}

if (logo) {
  // 4) Dán logo sạch ôm mặt trước, tâm = giữa logoBox (hoặc --logo-center x,y)
  const png = fs.readFileSync(logo);
  const aspect = png.readUInt32BE(16) / png.readUInt32BE(20);
  const [cx, cy] = (opt('logo-center')?.split(',').map(Number)) ?? [(logoBox[0] + logoBox[2]) / 2, (logoBox[1] + logoBox[3]) / 2];
  const h = logoH, w = h * aspect, nx = 40, ny = 30, off = 0.0006;
  const grid = [];
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
    const x = cx - w / 2 + (w * i) / nx, y = cy - h / 2 + (h * j) / ny, z = frontZ(x, y);
    grid.push(z === null ? null : [x, y, z + off, i / nx, 1 - j / ny]);
  }
  // vá điểm không chạm bằng trung bình lân cận
  for (let pass = 0; pass < 10 && grid.includes(null); pass++) for (let k = 0; k < grid.length; k++) if (!grid[k]) {
    const i = k % (nx + 1), j = Math.floor(k / (nx + 1));
    const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => grid[(j + b) * (nx + 1) + i + a]).filter((g, n) => g && i + [1, -1, 0, 0][n] >= 0 && i + [1, -1, 0, 0][n] <= nx);
    if (nb.length) grid[k] = [cx - w / 2 + (w * i) / nx, cy - h / 2 + (h * j) / ny, nb.reduce((s2, g) => s2 + g[2], 0) / nb.length, i / nx, 1 - j / ny];
  }
  const pos = [], uv = [];
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const a = grid[j * (nx + 1) + i], b = grid[j * (nx + 1) + i + 1], c = grid[(j + 1) * (nx + 1) + i + 1], d = grid[(j + 1) * (nx + 1) + i];
    if (!a || !b || !c || !d) continue;
    for (const v of [a, b, c, a, c, d]) { pos.push(v[0], v[1], v[2]); uv.push(v[3], v[4]); }
  }
  const buffer = doc.getRoot().listBuffers()[0];
  const ltex = doc.createTexture('logo').setImage(png).setMimeType('image/png');
  const lmat = doc.createMaterial('logo').setBaseColorTexture(ltex).setAlphaMode('BLEND').setRoughnessFactor(0.6).setMetallicFactor(0);
  lmat.getBaseColorTextureInfo().setWrapS(33071).setWrapT(33071);
  const lprim = doc.createPrimitive()
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(pos)).setBuffer(buffer))
    .setAttribute('TEXCOORD_0', doc.createAccessor().setType('VEC2').setArray(new Float32Array(uv)).setBuffer(buffer))
    .setMaterial(lmat);
  const node = doc.createNode('logo').setMesh(doc.createMesh('logo').addPrimitive(lprim));
  doc.getRoot().listScenes()[0].addChild(node);
  console.log(`đã dán logo ${(w * 100).toFixed(1)}×${(h * 100).toFixed(1)} cm tại x ${(cx * 100).toFixed(1)}, cao ${(cy * 100).toFixed(1)} cm`);
}

// --unify [--unify-k 0.5] [--unify-ymax m]: đồng bộ màu toàn bộ vỏ trắng. Ảnh màu AI có nhiễu, vệt, mảng xám/ngả màu khác nhau;
// cộng thêm các chỗ đã tô lại (mặt sau, cụm cổng, viền nắp, chỗ xoá logo) mỗi chỗ 1 màu → nhìn loang. Ở đây mọi điểm ảnh trắng
// (trung tính, đủ sáng) được tô lại = màu thân BODY × bóng đổ mềm. Bóng đổ = độ sáng trung bình theo ô 2 cm trong không gian 3D
// (làm mượt), giữ lại --unify-k phần chênh lệch (0 = 1 màu phẳng, 1 = giữ nguyên độ tương phản AI). Mặt quay ra sau hạ thêm
// theo --back-color như phần tô mặt sau (để khi xem không loá hơn mặt trước). Lớp vỏ sau (--back-cover) dùng cùng bản đồ.
let unifyAt = null;
if (args.includes('--unify') && texRaw) {
  const k = +opt('unify-k', 0.5), ymax = +opt('unify-ymax', 9), V3 = 0.02;
  const isWhite = (r, g, b) => Math.max(r, g, b) - Math.min(r, g, b) < 18 && r + g + b > 3 * 120;
  const vox = new Map(), key = (p) => p.map((c) => Math.floor(c / V3)).join(',');
  const pre = (ps) => Math.min(ps[0][1], ps[1][1], ps[2][1]) < ymax;
  paintTexels(pre, (p, _n, o) => { const d = texRaw.data; if (p[1] > ymax || !isWhite(d[o], d[o + 1], d[o + 2])) return null; const kk = key(p), v = vox.get(kk) ?? [0, 0]; v[0] += d[o] + d[o + 1] + d[o + 2]; v[1]++; vox.set(kk, v); return null; });
  const raw = new Map([...vox].map(([kk, [sum, n]]) => [kk, sum / n / 3]));
  const sm = new Map();
  for (const kk of raw.keys()) { const [x, y, z] = kk.split(',').map(Number); let sum = 0, n = 0; for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) { const v = raw.get(`${x + dx},${y + dy},${z + dz}`); if (v !== undefined) { sum += v; n++; } } sm.set(kk, sum / n); }
  const vals = [...sm.values()].sort((a, b) => a - b), mid = vals[Math.floor(vals.length * 0.6)];
  const backC = opt('back-color')?.split(',').map(Number);
  // nội suy 3 chiều giữa tâm 8 ô lân cận (trước đây lấy thẳng giá trị ô → thân máy hiện thành ô vuông 2 cm sáng/xám)
  const near = (p) => {
    const g = p.map((c) => c / V3 - 0.5), i0 = g.map(Math.floor), f = g.map((c, k) => c - i0[k]);
    let sum = 0, wsum = 0;
    for (let dx = 0; dx <= 1; dx++) for (let dy = 0; dy <= 1; dy++) for (let dz = 0; dz <= 1; dz++) {
      const q = sm.get(`${i0[0] + dx},${i0[1] + dy},${i0[2] + dz}`); if (q === undefined) continue;
      const w = (dx ? f[0] : 1 - f[0]) * (dy ? f[1] : 1 - f[1]) * (dz ? f[2] : 1 - f[2]); sum += q * w; wsum += w;
    }
    return wsum > 1e-6 ? sum / wsum : mid;
  };
  // --back-snap: mặt lưng sẽ bị nắn phẳng sau bước này → bóng đổ tính theo vị trí cũ (mảng nổi / rãnh lệch nhau 1–2 cm) để lại
  // vạch sáng/tối ở mép mảng cũ → vùng lưng (mặt quay ra sau, trong dải cao --back-cover) dùng thẳng màu thân, không nhân bóng.
  const [sb0, sb1] = args.includes('--back-snap') && opt('back-cover') ? opt('back-cover').split(',').map(Number) : [9, -9];
  unifyAt = (p, nrm) => {
    const flatBack = nrm && nrm[2] < -0.5 && p[1] >= sb0 - 0.01 && p[1] <= sb1 + 0.01;
    const f = flatBack ? 1 : Math.min(1.05, Math.max(0.8, 1 + (near(p) / mid - 1) * k));
    const w = backC && nrm ? Math.min(1, Math.max(0, (-nrm[2] - 0.4) / 0.45)) : 0;
    return BODY.map((c, i) => Math.min(255, Math.round((c + ((backC?.[i] ?? c) - c) * w) * f)));
  };
  // --clean-lines: điểm ảnh xám/tối trung tính nằm trong ô 2 cm gần như toàn trắng (≥ --clean-min, mặc định 0.9) = đường kẻ,
  // vệt mảnh AI vẽ → tô trắng luôn. Mảng tối lớn (khe, cổng, chân đế, viền nắp xám) không đủ điều kiện nên giữ nguyên.
  const clean = args.includes('--clean-lines'), cmin = +opt('clean-min', 0.9);
  if (clean) for (const kk of vox.keys()) vox.get(kk)[2] = 0;
  if (clean) paintTexels(pre, (p, _n, o) => { const v = vox.get(key(p)); if (v && p[1] <= ymax) v[2]++; return null; });
  const isLine = (p, d, o) => { if (!clean || p[1] > ymax) return false; const v = vox.get(key(p)); if (!v || v[1] / v[2] < cmin) return false; return Math.max(d[o], d[o + 1], d[o + 2]) - Math.min(d[o], d[o + 1], d[o + 2]) < 30; };
  let lines = 0;
  const n = paintTexels(pre, (p, nrm, o) => { const d = texRaw.data; if (p[1] > ymax) return null; if (isWhite(d[o], d[o + 1], d[o + 2])) return unifyAt(p, nrm); if (isLine(p, d, o)) { lines++; return unifyAt(p, nrm); } return null; });
  if (clean) console.log(`đã xoá đường kẻ / vệt mảnh: ${lines} điểm ảnh`);
  await flushTexture();
  console.log(`đã đồng bộ màu vỏ: ${n} điểm ảnh về rgb(${BODY.join(',')}), bóng đổ giữ ${k * 100}% (${(vals[Math.floor(vals.length * 0.05)] / mid).toFixed(2)}…${(vals[Math.floor(vals.length * 0.95)] / mid).toFixed(2)})`);
}

// --side-gaps z0,z1[,xmin] (m) [--gap-shade 0.7]: vùng bình Bio-Tank ở 2 bên hông (z0…z1, |x| > xmin, mặc định 8,5 cm). AI vẽ
// viền tối quanh bình mỗi bên một kiểu, lại đậm và dày. (1) Lấy màu bên trái (−x) theo ô 1,5 mm trong không gian (|x|, y, z);
// ô "khe" = tối hơn 70% màu thân tại chỗ. (2) Khe mảnh (≤ ~3 mm) giữ nguyên nét, tô 1 mức xám chung = màu thân × --gap-shade; dải khe
// dày chỉ giữ phần giữa, phần mép gần như về màu thân. (3) Tô lại cả 2 bên theo bản đồ này (bên phải = soi gương bên trái)
// → 2 bình giống nhau, khe mảnh và nhạt hơn. Chỉ đụng điểm ảnh trung tính (trắng/xám/đen), không đụng mảng xanh.
if (opt('side-gaps') && texRaw) {
  const [z0, z1, xmin = 0.085] = opt('side-gaps').split(',').map(Number), C = 0.0015, gapShade = +opt('gap-shade', 0.7);
  const neutral = (d, o) => Math.max(d[o], d[o + 1], d[o + 2]) - Math.min(d[o], d[o + 1], d[o + 2]) < 30;
  const inZone = (p) => Math.abs(p[0]) > xmin && p[2] >= z0 && p[2] <= z1 && p[1] < 0.37;
  const pre = (ps) => ps.some(inZone);
  const tgt = (p, nrm) => (unifyAt ? unifyAt(p, nrm) : BODY), lum3 = (c) => (c[0] + c[1] + c[2]) / 3;
  // ô theo vị trí + hướng mặt (trục chính, dấu; bên phải lật dấu x): AI hay dựng vỏ 2 lớp sát nhau (ngoài trắng, trong đen)
  // → không tách theo hướng thì 1 ô gộp cả 2 lớp thành xám loang lổ
  const ck = (a, b, c, nn = '') => `${a},${b},${c},${nn}`;
  const nkey = (p, n) => { const m = [Math.abs(n[0]), Math.abs(n[1]), Math.abs(n[2])], ax = m.indexOf(Math.max(...m)); const sg = Math.sign(n[ax]) * (ax === 0 && p[0] > 0 ? -1 : 1); return 'xyz'[ax] + (sg < 0 ? '-' : '+'); };
  const cell = (p, n) => [Math.round(Math.abs(p[0]) / C), Math.round(p[1] / C), Math.round(p[2] / C), nkey(p, n)];
  const cells = new Map(); // [r, g, b, tổng độ sáng màu thân, số điểm]
  paintTexels(pre, (p, nrm, o) => {
    const d = texRaw.data; if (p[0] > 0 || !inZone(p) || !neutral(d, o)) return null;
    const k = ck(...cell(p, nrm)), v = cells.get(k) ?? [0, 0, 0, 0, 0];
    v[0] += d[o]; v[1] += d[o + 1]; v[2] += d[o + 2]; v[3] += lum3(tgt(p, nrm)); v[4]++; cells.set(k, v); return null;
  });
  const avg = (v) => [0, 1, 2].map((i) => v[i] / v[4]);
  const gap = new Map([...cells].map(([k, v]) => [k, lum3(avg(v)) < 0.7 * (v[3] / v[4])]));
  // khoảng cách (số ô) từ ô khe tới ô thân gần nhất (tối đa 6)
  const dist = new Map();
  for (const [k, g] of gap) {
    if (!g) continue;
    const [a, b, c, nn] = k.split(','), [A, B, Cc] = [a, b, c].map(Number); let best = 7;
    for (let r = 1; r <= 6 && best > r; r++) for (let i = -r; i <= r; i++) for (let j = -r; j <= r; j++) for (let l = -r; l <= r; l++)
      if (Math.max(Math.abs(i), Math.abs(j), Math.abs(l)) === r && gap.get(ck(A + i, B + j, Cc + l, nn)) === false) best = r;
    dist.set(k, best);
  }
  // mức giữ của mỗi ô khe: khe mảnh (bề dày lớn nhất quanh đó ≤ 1 ô) → giữ nét; dải dày → chỉ phần giữa giữ nét
  const keep = new Map();
  for (const [k, dk] of dist) {
    const [a, b, c, nn] = k.split(','), [A, B, Cc] = [a, b, c].map(Number); let mx = 0;
    for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) for (let l = -2; l <= 2; l++) mx = Math.max(mx, dist.get(ck(A + i, B + j, Cc + l, nn)) ?? 0);
    keep.set(k, mx <= 1 || dk >= mx);
  }
  let nL = 0, nR = 0, nMiss = 0, nGap = 0;
  const n = paintTexels(pre, (p, nrm, o) => {
    const d = texRaw.data; if (!inZone(p) || !neutral(d, o)) return null;
    const target = tgt(p, nrm), [a, b, c, nn] = cell(p, nrm); let k = null;
    for (const dx of [0, -1, 1, -2, 2, -3, 3, -4, 4]) { if (cells.has(ck(a + dx, b, c, nn))) { k = ck(a + dx, b, c, nn); break; } }
    if (p[0] < 0) nL++; else nR++;
    if (!k) { nMiss++; return lum3([d[o], d[o + 1], d[o + 2]]) < 0.7 * lum3(target) ? target : null; } // vệt tối riêng bên phải → màu thân
    const col = avg(cells.get(k));
    if (!gap.get(k)) return col.map(Math.round);
    nGap++;
    // 1 mức xám chung cho cả khe (giữ độ tối riêng từng ô thì nét lấm tấm đậm nhạt)
    const sh = keep.get(k) ? gapShade : 0.95;
    return target.map((v) => Math.round(v * sh));
  });
  await flushTexture();
  console.log(`đã làm khe bình 2 bên: ${n} điểm ảnh (trái ${nL}, phải ${nR} soi gương, ${nMiss} không khớp), ${dist.size} ô khe, ${nGap} điểm ảnh khe nhạt đi`);
}

// --ports z0,y0,z1,y1 (m): vẽ lại cụm nút / cổng USB / nút nguồn trên mặt TRÁI (−x) theo ảnh SP: 2 nút tròn ở trên, cổng USB,
// lỗ nhỏ bên phải, nút nguồn xanh bên dưới. Ảnh vẽ bằng SVG rồi dán ôm mặt trái (chiếu tia song song trục X).
// Dùng cùng --white-box để xoá cụm AI vẽ cũ trong ảnh màu trước.
if (opt('ports')) {
  const [z0, y0, z1, y1] = opt('ports').split(',').map(Number), wcm = (z1 - z0) * 100, hcm = (y1 - y0) * 100, K = 100;
  // Toạ độ tuyệt đối (cm) trên mặt trái; SVG: X theo z (+ = hướng mặt trước), Y theo độ cao.
  // Vị trí lấy từ file CAD (models-src/models.json → ecohub-grid-plus.extras): nút ×2 cùng độ cao, USB dưới nút, đèn báo
  // (lỗ nhỏ) bên phải USB, nút nguồn bên dưới; neo theo bình nước (z) và độ cao nút (y) của mô hình AI.
  const X = (z) => ((z - z0 * 100) * K).toFixed(1), Y = (y) => ((y1 * 100 - y) * K).toFixed(1), R = (r) => (r * K).toFixed(1);
  const dark = '#1d1f20', rim = '#c4c8c9', face = '#eceeee';
  const [bz1, bz2, by] = [-0.10, -2.64, 17.4];            // 2 nút bấm
  const [uz, uy, uw, uh] = [-1.08, 14.7, 2.7, 1.32];       // cổng USB (tâm, rộng, cao)
  const [hz, hy] = [1.63, 14.74];                          // đèn báo
  const [pz, py2] = [-0.56, 11.64];                        // nút nguồn
  const btn = (cz, cy) => `<circle cx="${X(cz)}" cy="${Y(cy)}" r="${R(0.7)}" fill="${dark}"/><circle cx="${X(cz)}" cy="${Y(cy)}" r="${R(0.62)}" fill="${face}" stroke="${rim}" stroke-width="3"/><circle cx="${X(cz)}" cy="${Y(cy)}" r="${R(0.2)}" fill="none" stroke="#9aa0a2" stroke-width="3"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(wcm * K)}" height="${Math.round(hcm * K)}">`
    + btn(bz1, by) + btn(bz2, by)
    + `<rect x="${X(uz - uw / 2 - 0.05)}" y="${Y(uy + uh / 2 + 0.4)}" width="${R(0.45)}" height="${R(0.4)}" fill="${dark}"/>`
    + `<rect x="${X(uz - uw / 2)}" y="${Y(uy + uh / 2)}" width="${R(uw)}" height="${R(uh)}" rx="6" fill="${rim}"/>`
    + `<rect x="${X(uz - uw / 2 + 0.12)}" y="${Y(uy + uh / 2 - 0.12)}" width="${R(uw - 0.24)}" height="${R(uh - 0.24)}" rx="4" fill="${dark}"/>`
    + `<rect x="${X(uz - uw / 2 + 0.4)}" y="${Y(uy - 0.05)}" width="${R(uw - 0.8)}" height="${R(0.3)}" fill="#3a3d3f"/>`
    + `<circle cx="${X(hz)}" cy="${Y(hy)}" r="${R(0.36)}" fill="${rim}"/><circle cx="${X(hz)}" cy="${Y(hy)}" r="${R(0.26)}" fill="${dark}"/>`
    + `<circle cx="${X(pz)}" cy="${Y(py2)}" r="${R(0.95)}" fill="#0c5a2d"/><circle cx="${X(pz)}" cy="${Y(py2)}" r="${R(0.84)}" fill="#128a45"/>`
    + `<path d="M ${X(pz - 0.34)} ${Y(py2 + 0.3)} A ${R(0.46)} ${R(0.46)} 0 1 0 ${X(pz + 0.34)} ${Y(py2 + 0.3)}" fill="none" stroke="#fff" stroke-width="${R(0.09)}" stroke-linecap="round"/>`
    + `<line x1="${X(pz)}" y1="${Y(py2 + 0.15)}" x2="${X(pz)}" y2="${Y(py2 + 0.65)}" stroke="#fff" stroke-width="${R(0.09)}" stroke-linecap="round"/></svg>`;
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  const leftX = (z, y) => { let best = null; for (let t = 0; t < triCount; t++) { const [a, b, c] = [V(vi(t, 0)), V(vi(t, 1)), V(vi(t, 2))]; const d = (b[2] - c[2]) * (a[1] - c[1]) + (c[1] - b[1]) * (a[2] - c[2]); if (Math.abs(d) < 1e-12) continue; const l1 = ((b[2] - c[2]) * (y - c[1]) + (c[1] - b[1]) * (z - c[2])) / d, l2 = ((c[2] - a[2]) * (y - c[1]) + (a[1] - c[1]) * (z - c[2])) / d, l3 = 1 - l1 - l2; if (l1 < -1e-6 || l2 < -1e-6 || l3 < -1e-6) continue; const x = l1 * a[0] + l2 * b[0] + l3 * c[0]; if (x < 0 && (best === null || x < best)) best = x; } return best; };
  const nx = 36, ny = 40, off = 0.0007, xs = [];
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) { const z = z0 + ((z1 - z0) * i) / nx, y = y0 + ((y1 - y0) * j) / ny; xs.push(leftX(z, y)); }
  // mặt trái là 1 tấm gần phẳng: dùng độ cao trung vị cho cả tấm (nút nổi / lõm AI nặn không làm ảnh vênh), ô trống lấy trung vị
  const known = xs.filter((v) => v !== null).sort((p, q) => p - q), flatX = known[Math.floor(known.length * 0.3)] ?? -0.14;
  const pos = [], uv = [], at = (i, j) => { const v = xs[j * (nx + 1) + i]; return [(v === null ? flatX : Math.min(v, flatX + 0.004)) - off, y0 + ((y1 - y0) * j) / ny, z0 + ((z1 - z0) * i) / nx, i / nx, 1 - j / ny]; };
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const a = at(i, j), b = at(i + 1, j), c = at(i + 1, j + 1), d = at(i, j + 1);
    for (const v of [a, c, b, a, d, c]) { pos.push(v[0], v[1], v[2]); uv.push(v[3], v[4]); }  // mặt quay ra −x
  }
  const buffer = doc.getRoot().listBuffers()[0];
  const lmat = doc.createMaterial('ports').setBaseColorTexture(doc.createTexture('ports').setImage(png).setMimeType('image/png')).setAlphaMode('BLEND').setRoughnessFactor(0.55).setMetallicFactor(0).setDoubleSided(true);
  lmat.getBaseColorTextureInfo().setWrapS(33071).setWrapT(33071);
  const lprim = doc.createPrimitive().setMaterial(lmat)
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(pos)).setBuffer(buffer))
    .setAttribute('TEXCOORD_0', doc.createAccessor().setType('VEC2').setArray(new Float32Array(uv)).setBuffer(buffer));
  doc.getRoot().listScenes()[0].addChild(doc.createNode('ports').setMesh(doc.createMesh('ports').addPrimitive(lprim)));
  console.log(`đã vẽ cụm cổng ${wcm.toFixed(1)}×${hcm.toFixed(1)} cm trên mặt trái, x ≈ ${(flatX * 100).toFixed(1)} cm`);
}

let removeTris = null; // tam giác cần xoá (--rods-remove), áp dụng trước khi nén

/** Thêm 1 mesh (toạ độ đã chuẩn hoá, m) với chất liệu màu trơn hoặc ảnh */
function addMesh(name, pos, { color, png, uv, metal, double, normal, colors } = {}) {
  const buffer = doc.getRoot().listBuffers()[0];
  const mat = doc.createMaterial(name).setRoughnessFactor(metal ? 0.3 : png ? 0.55 : 0.65).setMetallicFactor(metal ? 0.7 : png ? 0.05 : 0).setDoubleSided(!!metal || !!double);
  if (png) mat.setBaseColorTexture(doc.createTexture(name).setImage(png).setMimeType('image/png'));
  else if (colors) mat.setBaseColorFactor([1, 1, 1, 1]);
  else mat.setBaseColorFactor([...color.map((c) => (c / 255 <= 0.04045 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4)), 1]);
  const p = doc.createPrimitive().setMaterial(mat)
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(pos)).setBuffer(buffer));
  if (normal) p.setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(new Float32Array(normal)).setBuffer(buffer));
  if (colors) p.setAttribute('COLOR_0', doc.createAccessor().setType('VEC3').setArray(new Float32Array(colors.map((c) => (c / 255 <= 0.04045 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4)))).setBuffer(buffer));
  if (uv) p.setAttribute('TEXCOORD_0', doc.createAccessor().setType('VEC2').setArray(new Float32Array(uv)).setBuffer(buffer));
  doc.getRoot().listScenes()[0].addChild(doc.createNode(name).setMesh(doc.createMesh(name).addPrimitive(p)));
}
/** 6 mặt hộp, mặt quay ra ngoài */
function boxTris([x0, y0, z0, x1, y1, z1]) {
  const P8 = (i) => [i & 1 ? x1 : x0, i & 2 ? y1 : y0, i & 4 ? z1 : z0];
  const faces = [[0, 2, 6, 4], [1, 5, 7, 3], [0, 4, 5, 1], [2, 3, 7, 6], [0, 1, 3, 2], [4, 6, 7, 5]];
  const c = [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], out = [];
  for (const f of faces) {
    let q = f.map(P8);
    const n = cross3(sub3(q[1], q[0]), sub3(q[2], q[0])), mid = q.reduce((s, p) => s.map((v, k) => v + p[k] / 4), [0, 0, 0]);
    if (dot3(n, sub3(mid, c)) < 0) q = [q[0], q[3], q[2], q[1]];
    out.push(...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3]);
  }
  return out;
}
function sub3(a, b) { return a.map((v, k) => v - b[k]); }
function cross3(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function dot3(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function norm3(a) { const l = Math.hypot(...a) || 1; return a.map((v) => v / l); }

// --fill-box x0,y0,z0,x1,y1,z1 (m) [--fill-color r,g,b]: khối màu trơn lấp chỗ AI để thủng (VD lòng vòm nhìn xuyên ra sau)
for (let i = args.indexOf('--fill-box'); i >= 0; i = args.indexOf('--fill-box', i + 1)) {
  const b = args[i + 1].split(',').map(Number);
  addMesh('fill-' + i, boxTris(b), { color: opt('fill-color', '29,90,52').split(',').map(Number) });
  console.log(`đã lấp khối ${b.map((v) => (v * 100).toFixed(1)).join(', ')} cm`);
}

const posKey = (x, y, z) => `${Math.round(x * 2e4)},${Math.round(y * 2e4)},${Math.round(z * 2e4)}`;
const forcedN = new Map(); // vị trí đỉnh → hướng mặt cố định (dùng ở --smooth-normals)
// --back-cover y0,y1[,ron] (m): mặt sau AI nặn lồi lõm (mảng nổi, rãnh) → phủ 1 lớp vỏ trơn màu thân bám theo biên dạng
// mặt sau (z nhỏ nhất theo từng x, đo bằng tia song song trục Z), từ cao y0 tới y1; ron = vạch ngang mảnh (chỗ nắp ghép thân).
if (opt('back-cover')) {
  const [y0, y1, seamY] = opt('back-cover').split(',').map(Number), snap = args.includes('--back-snap');
  const white = (opt('cover-color') ?? opt('back-color')) ? (opt('cover-color') ?? opt('back-color')).split(',').map(Number) : BODY, seamCol = opt('seam-color', '165,165,165').split(',').map(Number);
  const tris = []; for (let t = 0; t < triCount; t++) tris.push([V(vi(t, 0)), V(vi(t, 1)), V(vi(t, 2))]);
  const backZ = (x, yy) => { let best = null; for (const [a, b, c] of tris) { const d = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]); if (Math.abs(d) < 1e-12) continue; const l1 = ((b[1] - c[1]) * (x - c[0]) + (c[0] - b[0]) * (yy - c[1])) / d, l2 = ((c[1] - a[1]) * (x - c[0]) + (a[0] - c[0]) * (yy - c[1])) / d, l3 = 1 - l1 - l2; if (l1 < -1e-6 || l2 < -1e-6 || l3 < -1e-6) continue; const z = l1 * a[2] + l2 * b[2] + l3 * c[2]; if (z < 0 && (best === null || z < best)) best = z; } return best; };
  const prof = [];
  for (let x = -W / 2 + 0.002; x <= W / 2 - 0.002; x += 0.003) {
    let zmin = null, ok = true;
    for (let y = y0; y <= y1 + 1e-9; y += 0.01) { const z = backZ(x, y); if (z === null) { ok = false; break; } zmin = zmin === null ? z : Math.min(zmin, z); }
    if (ok) prof.push([x, zmin - 0.0008]);
  }
  // làm mượt biên dạng (trung bình trượt 5 điểm) để mặt vỏ không gợn
  let sm = prof.map(([x], i) => { const w = prof.slice(Math.max(0, i - 2), i + 3); return [x, w.reduce((s2, p) => s2 + p[1], 0) / w.length]; });
  // --snap-smooth n: làm mượt thêm n lượt (cửa sổ ±4 điểm = ±1,2 cm) – biên dạng còn gãy nhẹ thì cả mặt lưng hiện đường dọc
  // khi ánh sáng chiếu xiên. Chỉ làm mượt trong từng đoạn liền (không san chỗ đứt quãng ở 2 bên hông).
  for (let pass = 0; pass < +opt('snap-smooth', 0); pass++) sm = sm.map(([x, z], i) => {
    let s = 0, n = 0;
    for (let k = -4; k <= 4; k++) { const q = sm[i + k]; if (!q) continue; let ok = true; for (let m = Math.min(i, i + k); m < Math.max(i, i + k); m++) if (Math.abs(sm[m + 1][1] - sm[m][1]) > 0.01 || sm[m + 1][0] - sm[m][0] > 0.0045) ok = false; if (ok) { s += q[1]; n++; } }
    return [x, s / n];
  });
  // Làm mượt kéo vỏ vào trong ở chỗ có gờ hẹp → gờ thân AI đâm xuyên ra ngoài thành vệt tối. Đẩy các đỉnh thân AI
  // nhô quá vỏ (tối đa 8 mm) vào sau vỏ 1,2 mm. Chỉ xét đoạn vỏ liền (bỏ chỗ đứt quãng hai bên hông).
  {
    const shellZ = (x) => { const i = sm.findIndex((p, k) => k + 1 < sm.length && p[0] <= x && sm[k + 1][0] >= x); if (i < 0) return null; const [xa, za] = sm[i], [xb, zb] = sm[i + 1]; if (xb - xa > 0.0045 || Math.abs(zb - za) > 0.01) return null; return za + ((zb - za) * (x - xa)) / (xb - xa); };
    let moved = 0;
    if (snap) {
      // --back-snap: không dán vỏ riêng nữa (nhìn như "dán 1 mảng trắng": khác cách bắt sáng, lộ mép ở 2 góc sau) → kéo
      // chính các đỉnh mặt sau của thân AI về đúng biên dạng trơn đó; mép trên / dưới chuyển dần trong 8 mm cho liền thân.
      const F = 0.008, F0 = +opt('snap-bottom-feather', 0.003), [dIn, dOut] = (opt('snap-depth') ?? '0.04,0.02').split(',').map(Number);
      // biên dạng liền: chỗ đứt quãng / thiếu (gần hộp Bio-Tank) ≤ 4 cm → nội suy thẳng giữa 2 đoạn liền kề
      const good = sm.filter((p, i) => { const q = sm[i + 1] ?? sm[i - 1]; return Math.abs(q[1] - p[1]) <= 0.01; });
      const snapZ = (x) => { const s = shellZ(x); if (s !== null) return s; let a = null, b = null; for (const p of good) { if (p[0] <= x) a = p; else { b = p; break; } } if (!a || !b || b[0] - a[0] > 0.04) return null; return a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0]); };
      for (let j = 0; j < P.length; j += 3) {
        const y = P[j + 1]; if (y < y0 - F0 || y > y1 + F || P[j + 2] >= 0) continue;
        const s = snapZ(P[j]); if (s === null) continue;
        const target = s + 0.0008; if (P[j + 2] < target - dOut || P[j + 2] > target + dIn) continue;
        const w = y < y0 ? 1 - (y0 - y) / F0 : y > y1 ? 1 - (y - y1) / F : 1;
        P[j + 2] = P[j + 2] * (1 - w) + target * w; moved++;
        // hướng mặt lấy theo biên dạng trơn (mặt tam giác cũ của mảng nổi / rãnh bị ép dẹt → hướng lung tung → vệt sáng tối)
        if (w === 1) { const sa = snapZ(P[j] - 0.003), sb = snapZ(P[j] + 0.003); if (sa !== null && sb !== null) forcedN.set(posKey(P[j], P[j + 1], P[j + 2]), norm3([(sb - sa) / 0.006, 0, -1])); }
      }
    } else for (let j = 0; j < P.length; j += 3) {
      if (P[j + 1] < y0 - 0.002 || P[j + 1] > y1 || P[j + 2] >= 0) continue;
      const s = shellZ(P[j]); if (s === null) continue;
      if (P[j + 2] < s + 0.0012 && P[j + 2] > s - 0.008) { P[j + 2] = s + 0.0012; moved++; }
    }
    posAcc.setArray(P);
    console.log(snap ? `đã nắn ${moved} đỉnh mặt sau thân AI về biên dạng trơn (không dán vỏ riêng)` : `đã đẩy ${moved} đỉnh thân AI nhô qua vỏ sau vào trong`);
  }
  const pos = [], nor = [], seam = [], seamN = [], col = [];
  const nrmAt = (i) => { const p = sm[Math.max(0, i - 1)], q = sm[Math.min(sm.length - 1, i + 1)]; const k = (q[1] - p[1]) / (q[0] - p[0] || 1); return norm3([k, 0, -1]); };
  for (let i = 0; i + 1 < sm.length; i++) {
    const [xa, za] = sm[i], [xb, zb] = sm[i + 1];
    if (Math.abs(zb - za) > 0.01) continue; // đứt quãng (hai bên hông) → bỏ đoạn
    const na = nrmAt(i), nb = nrmAt(i + 1);
    // mặt quay ra sau (−z): thứ tự đỉnh ngược chiều kim đồng hồ khi nhìn từ phía sau
    const rows = Math.max(1, Math.round((y1 - y0) / 0.01));
    for (let r = 0; r < rows; r++) {
      const ya = y0 + ((y1 - y0) * r) / rows, yb = y0 + ((y1 - y0) * (r + 1)) / rows;
      pos.push(xa, ya, za, xb, yb, zb, xb, ya, zb, xa, ya, za, xa, yb, za, xb, yb, zb);
      nor.push(...na, ...nb, ...nb, ...na, ...na, ...nb);
      const cc = (x, y) => (unifyAt ? unifyAt([x, y, (za + zb) / 2 + 0.004], [0, 0, -1]) : white.map((c) => Math.round(c * (shadeAt ? shadeAt(x, y) : 1))));
      col.push(...cc(xa, ya), ...cc(xb, yb), ...cc(xb, ya), ...cc(xa, ya), ...cc(xa, yb), ...cc(xb, yb));
    }
    if (seamY) { const hw = 0.0006, o = snap ? -0.0004 : 0.0003; /* nắn thân: mặt thật ở sm + 0,8 mm → ron nổi 0,4 mm */ seam.push(xa, seamY - hw, za - o, xb, seamY + hw, zb - o, xb, seamY - hw, zb - o, xa, seamY - hw, za - o, xa, seamY + hw, za - o, xb, seamY + hw, zb - o); seamN.push(...na, ...nb, ...nb, ...na, ...na, ...nb); }
  }
  if (!snap) addMesh('back-cover', pos, { color: white, normal: nor, double: true, colors: col });
  // --back-patch x,y0,y1[,rộng] (m), lặp được: dải trắng hẹp dán sát mặt lưng đã nắn (nổi 0,3 mm), che khe hở giữa các mảnh
  // thân AI (mép mảng nổi cũ, nhìn xuyên vào ruột máy thành vạch tối). Cùng hướng mặt + cùng màu với lưng → không lộ.
  if (snap) for (let i = args.indexOf('--back-patch'); i >= 0; i = args.indexOf('--back-patch', i + 1)) {
    const [px, py0, py1, pw = 0.006] = args[i + 1].split(',').map(Number), ppos = [], pnor = [];
    const zAt = (x) => { const k = sm.findIndex((p, j) => j + 1 < sm.length && p[0] <= x && sm[j + 1][0] >= x); return k < 0 ? null : sm[k][1] + ((sm[k + 1][1] - sm[k][1]) * (x - sm[k][0])) / (sm[k + 1][0] - sm[k][0]); };
    for (let x = px - pw / 2; x < px + pw / 2 - 1e-9; x += 0.001) {
      const xa = x, xb = Math.min(x + 0.001, px + pw / 2), za = zAt(xa), zb = zAt(xb); if (za === null || zb === null) continue;
      const n = norm3([(zb - za) / (xb - xa), 0, -1]), o = 0.0008 - 0.0003; // mặt thật ở sm + 0,8 mm → dải ở sm + 0,5 mm
      ppos.push(xa, py0, za + o, xb, py1, zb + o, xb, py0, zb + o, xa, py0, za + o, xa, py1, za + o, xb, py1, zb + o);
      pnor.push(...n, ...n, ...n, ...n, ...n, ...n);
    }
    // dùng đúng vật liệu thân AI (vật liệu riêng có độ nhám khác → dải sáng hẳn lên); toạ độ ảnh màu = 1 điểm giữa lưng
    // (đã tô màu thân trơn) → cùng màu, cùng cách bắt sáng
    let uvRef = null;
    for (let t = 0; t < triCount && !uvRef; t++) {
      const vs = [vi(t, 0), vi(t, 1), vi(t, 2)], ps = vs.map(V), n = norm3(cross3(sub3(ps[1], ps[0]), sub3(ps[2], ps[0])));
      const c = [0, 1, 2].map((k) => (ps[0][k] + ps[1][k] + ps[2][k]) / 3);
      if (n[2] < -0.95 && c[1] > 0.08 && c[1] < 0.14 && Math.abs(c[0]) < 0.04) uvRef = [0, 1].map((k) => (uvs[vs[0] * 2 + k] + uvs[vs[1] * 2 + k] + uvs[vs[2] * 2 + k]) / 3);
    }
    if (ppos.length && uvRef) {
      const buffer = doc.getRoot().listBuffers()[0], nv = ppos.length / 3;
      const pp = doc.createPrimitive().setMaterial(prim.getMaterial())
        .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(ppos)).setBuffer(buffer))
        .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(new Float32Array(pnor)).setBuffer(buffer))
        .setAttribute('TEXCOORD_0', doc.createAccessor().setType('VEC2').setArray(new Float32Array(Array.from({ length: nv }, () => uvRef).flat())).setBuffer(buffer));
      doc.getRoot().listScenes()[0].addChild(doc.createNode('back-patch').setMesh(doc.createMesh('back-patch').addPrimitive(pp)));
    } else if (ppos.length) addMesh('back-patch', ppos, { color: BODY, normal: pnor, double: true });
    console.log(`đã dán dải che khe ở x = ${(px * 100).toFixed(1)} cm, cao ${(py0 * 100).toFixed(1)}…${(py1 * 100).toFixed(1)} cm`);
  }
  if (seam.length) addMesh('back-seam', seam, { color: seamCol, normal: seamN, double: true });
  console.log(`đã phủ vỏ sau trơn: x ${(sm[0][0] * 100).toFixed(1)}…${(sm[sm.length - 1][0] * 100).toFixed(1)} cm, cao ${(y0 * 100).toFixed(1)}…${(y1 * 100).toFixed(1)} cm${seamY ? `, ron ở ${(seamY * 100).toFixed(1)} cm` : ''}`);
}

// --panel-grid cột,hàng: tìm mặt tấm pin (vùng xanh than, cao trên 70%) → phủ lớp lưới ô pin mới đúng số ô
if (opt('panel-grid')) {
  const [cols, rows] = opt('panel-grid').split(',').map(Number);
  const tcol = (vs) => { const u = (uvs[vs[0] * 2] + uvs[vs[1] * 2] + uvs[vs[2] * 2]) / 3, v = (uvs[vs[0] * 2 + 1] + uvs[vs[1] * 2 + 1] + uvs[vs[2] * 2 + 1]) / 3; const o = (Math.min(texRaw.info.height - 1, Math.floor(v * texRaw.info.height)) * texRaw.info.width + Math.min(texRaw.info.width - 1, Math.floor(u * texRaw.info.width))) * 4; return [texOrig[o], texOrig[o + 1], texOrig[o + 2]]; };
  const sel = []; let nAcc = [0, 0, 0];
  for (let t = 0; t < triCount; t++) {
    const vs = [vi(t, 0), vi(t, 1), vi(t, 2)], ps = vs.map(V);
    if ((ps[0][1] + ps[1][1] + ps[2][1]) / 3 < 0.72 * H) continue;
    const n = cross3(sub3(ps[1], ps[0]), sub3(ps[2], ps[0]));
    if (norm3(n)[1] < 0.3) continue;
    const [r, g, b] = tcol(vs);
    if (!(b >= r + 8 && r + g + b < 330)) continue;
    sel.push(ps); nAcc = nAcc.map((v, k) => v + n[k]);
  }
  if (!sel.length) throw new Error('không tìm thấy mặt tấm pin');
  const n = norm3(nAcc), u = norm3(cross3([0, 1, 0], n)), v = cross3(n, u);
  const all = sel.flat(), c0 = all.reduce((s, p) => s.map((x, k) => x + p[k] / all.length), [0, 0, 0]);
  const us = all.map((p) => dot3(sub3(p, c0), u)), wsv = all.map((p) => dot3(sub3(p, c0), v));
  const [u0, u1, v0, v1] = [Math.min(...us), Math.max(...us), Math.min(...wsv), Math.max(...wsv)];
  const hOff = Math.max(...all.map((p) => dot3(sub3(p, c0), n))) + 0.0015; // nổi trên mặt pin cao nhất 1,5 mm
  const at = (a, bb) => [0, 1, 2].map((k) => c0[k] + u[k] * a + v[k] * bb + n[k] * hOff);
  const [A, B, C, D2] = [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)];
  // ảnh lưới: nền xanh than, khe trắng giữa các ô, vạch mảnh trong ô
  const W2 = 1024, H2 = Math.round(1024 * (v1 - v0) / (u1 - u0)), gap = 6, cw = W2 / cols, ch = H2 / rows;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W2}" height="${H2}"><rect width="100%" height="100%" fill="#e9ecef"/>`;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const x = i * cw + gap / 2, y = j * ch + gap / 2, w = cw - gap, h = ch - gap;
    svg += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1c2a47"/>`;
    for (let k = 1; k < 4; k++) svg += `<line x1="${x}" y1="${y + (h * k) / 4}" x2="${x + w}" y2="${y + (h * k) / 4}" stroke="#2a3b5e" stroke-width="2"/>`;
  }
  svg += '</svg>';
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  addMesh('panel-grid', [...A, ...B, ...C, ...A, ...C, ...D2], { png, uv: [0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0] });
  console.log(`đã phủ lưới pin ${cols}×${rows} ô, ${((u1 - u0) * 100).toFixed(1)}×${((v1 - v0) * 100).toFixed(1)} cm (${sel.length} tam giác mặt pin)`);

  // độ cao mặt dưới tấm pin tại (x, z): mặt phẳng pin trừ bề dày khung
  const panelY = (x, z) => c0[1] - (n[0] * (x - c0[0]) + n[2] * (z - c0[2])) / n[1] - +opt('panel-thick', 0.012);
  // --pole x,z,yBase,r (m): cột bạc đứng từ thân máy lên đỡ mặt dưới tấm pin (AI không dựng được cột như ảnh)
  if (opt('pole')) {
    const [px, pz, yb, r] = opt('pole').split(',').map(Number);
    const yt = panelY(px, pz), seg = 28, pos = [];
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * 2 * Math.PI, a1 = ((i + 1) / seg) * 2 * Math.PI;
      const p = (a, y) => [px + r * Math.cos(a), y, pz + r * Math.sin(a)];
      pos.push(...p(a0, yb), ...p(a1, yt), ...p(a1, yb), ...p(a0, yb), ...p(a0, yt), ...p(a1, yt)); // vách (quay ra ngoài)
      pos.push(px, yt, pz, ...p(a1, yt), ...p(a0, yt)); // nắp trên
    }
    addMesh('pole', pos, { color: [205, 209, 213], metal: true });
    addMesh('pole-cap', boxTris([px - r * 1.4, yt - 0.006, pz - r * 1.4, px + r * 1.4, yt + 0.004, pz + r * 1.4]), { color: [205, 209, 213], metal: true });
    console.log(`đã dựng cột bạc tại x ${(px * 100).toFixed(1)}, z ${(pz * 100).toFixed(1)} cm, cao ${(yb * 100).toFixed(1)} → ${(yt * 100).toFixed(1)} cm`);
  }
  // --rods-remove: xoá hẳn các dây / thanh tối màu AI vẽ giữa thân máy và tấm pin (xa mặt pin > 1,5 cm),
  // in vị trí chân từng dây (để đặt --pole đúng chỗ dây). Khối đỡ trắng ở giữa giữ nguyên.
  if (args.includes('--rods-remove')) {
    const dead = new Set(), pts = [];
    for (let t = 0; t < triCount; t++) {
      const vs = [vi(t, 0), vi(t, 1), vi(t, 2)], ps = vs.map(V);
      const c = [0, 1, 2].map((k) => (ps[0][k] + ps[1][k] + ps[2][k]) / 3);
      if (c[1] < +opt('rods-ymin', 0.72) * H || dot3(sub3(c, c0), n) > -0.02) continue; // chỉ phần nằm dưới tấm pin (cách mặt pin > 2 cm)
      if (c[2] > +opt('rods-zmax', -0.07) || Math.abs(c[0]) < +opt('rods-xmin', 0.035)) continue; // chỉ phía sau, lệch tâm (giữa là khối đỡ + mặt dưới tấm pin)
      const [cr, cg, cb] = tcol(vs);
      if (cr + cg + cb >= 3 * 110) continue;
      dead.add(t); pts.push(c);
    }
    removeTris = dead;
    if (args.includes('--rods-debug')) { const bins = {}; for (const p of pts) { const k = Math.round(p[0] * 50) / 50 + ',' + Math.round(p[2] * 50) / 50; bins[k] = (bins[k] || 0) + 1; } console.log('phân bố (x,z m, ô 2cm):', Object.entries(bins).sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, v]) => k + ':' + v).join('  ')); const ys = pts.map((p) => p[1]); console.log('y', Math.min(...ys).toFixed(3), Math.max(...ys).toFixed(3)); }
    for (const side of [-1, 1]) {
      const s = pts.filter((p) => Math.sign(p[0]) === side);
      if (!s.length) continue;
      const low = s.reduce((a, b) => (b[1] < a[1] ? b : a));
      console.log(`dây ${side < 0 ? 'trái' : 'phải'}: ${s.length} tam giác, chân tại x ${(low[0] * 100).toFixed(1)}, z ${(low[2] * 100).toFixed(1)}, cao ${(low[1] * 100).toFixed(1)} cm`);
    }
    console.log(`đã xoá ${dead.size} tam giác dây`);
  }
  // --rods-silver: tô bạc các thanh đỡ tối màu AI vẽ giữa thân máy và tấm pin (xa mặt pin > 1,5 cm)
  if (args.includes('--rods-silver')) {
    const r = paintTriangles((ps, vs) => {
      const c = [0, 1, 2].map((k) => (ps[0][k] + ps[1][k] + ps[2][k]) / 3);
      if (c[1] < +opt('top-max', 0.74) * H || Math.abs(dot3(sub3(c, c0), n)) < 0.015) return false;
      const [cr, cg, cb] = tcol(vs);
      return cr + cg + cb < 3 * 110;
    }, [196, 200, 205], 0.05);
    texture.setImage(await sharp(texRaw.data, { raw: { width: texRaw.info.width, height: texRaw.info.height, channels: 4 } }).png().toBuffer());
    console.log(`đã tô bạc thanh đỡ: ${r.count} điểm ảnh`);
  }
}

if (removeTris?.size) {
  const keep = [];
  for (let t = 0; t < triCount; t++) if (!removeTris.has(t)) keep.push(vi(t, 0), vi(t, 1), vi(t, 2));
  const buffer = doc.getRoot().listBuffers()[0];
  prim.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(keep)).setBuffer(buffer));
  // bịt lỗ hở để lại ở chân dây: tìm các vòng cạnh biên (cạnh chỉ thuộc 1 tam giác còn lại, đỉnh thuộc tam giác đã xoá)
  const key = (v) => V(v).map((c) => Math.round(c * 1e4)).join(','), touched = new Set();
  for (const t of removeTris) for (let k = 0; k < 3; k++) touched.add(key(vi(t, k)));
  const dir = new Map(), pos = new Map();
  for (let i = 0; i < keep.length; i += 3) for (let k = 0; k < 3; k++) { const a = key(keep[i + k]), b = key(keep[i + (k + 1) % 3]); pos.set(a, V(keep[i + k])); dir.set(a + '>' + b, [a, b]); }
  const next = new Map();
  for (const [k, [a, b]] of dir) if (!dir.has(b + '>' + a) && touched.has(a) && touched.has(b)) next.set(b, a); // đi ngược chiều tam giác kề → mặt bịt quay ra ngoài
  const capPos = []; let loops = 0;
  while (next.size) {
    const start = next.keys().next().value, loop = [start]; let cur = next.get(start); next.delete(start);
    while (cur && cur !== start && next.has(cur) && loop.length < 500) { loop.push(cur); const nx = next.get(cur); next.delete(cur); cur = nx; }
    if (loop.length < 3) continue;
    const c = loop.reduce((s, k) => s.map((v, j) => v + pos.get(k)[j] / loop.length), [0, 0, 0]);
    for (let i = 0; i < loop.length; i++) capPos.push(...c, ...pos.get(loop[i]), ...pos.get(loop[(i + 1) % loop.length]));
    loops++;
  }
  if (capPos.length) { addMesh('rod-caps', capPos, { color: BODY, double: true }); console.log(`đã bịt ${loops} lỗ chân dây`); }
}

// Lấp khe giữa các mảnh ảnh màu (vùng không thuộc tam giác nào) bằng màu điểm ảnh liền kề, để khi thu nhỏ ảnh
// màu không bị viền tối loang vào mép các mảng vừa tô lại (thấy thành vệt đen dọc mặt sau)
if (texRaw && args.includes('--seam-fill')) {
  const { data, info } = texRaw, TW = info.width, TH = info.height, cov = new Uint8Array(TW * TH);
  for (let t = 0; t < triCount; t++) {
    const uv = [0, 1, 2].map((k) => { const v = vi(t, k); return [uvs[v * 2] * TW, uvs[v * 2 + 1] * TH]; });
    const [a, b, q] = uv; const d = (b[1] - q[1]) * (a[0] - q[0]) + (q[0] - b[0]) * (a[1] - q[1]);
    if (Math.abs(d) < 1e-12) continue;
    for (let py = Math.max(0, Math.floor(Math.min(a[1], b[1], q[1]))); py <= Math.min(TH - 1, Math.ceil(Math.max(a[1], b[1], q[1]))); py++)
      for (let px = Math.max(0, Math.floor(Math.min(a[0], b[0], q[0]))); px <= Math.min(TW - 1, Math.ceil(Math.max(a[0], b[0], q[0]))); px++) {
        const X = px + 0.5, Y = py + 0.5, l1 = ((b[1] - q[1]) * (X - q[0]) + (q[0] - b[0]) * (Y - q[1])) / d, l2 = ((q[1] - a[1]) * (X - q[0]) + (a[0] - q[0]) * (Y - q[1])) / d;
        if (l1 >= -0.02 && l2 >= -0.02 && 1 - l1 - l2 >= -0.02) cov[py * TW + px] = 1;
      }
  }
  let filled = 0;
  for (let pass = 0; pass < 6; pass++) {
    const add = [];
    for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) {
      const i = y * TW + x; if (cov[i]) continue;
      let n = 0; const s = [0, 0, 0];
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= TW || Y >= TH) continue; const j = Y * TW + X; if (!cov[j]) continue; n++; for (let k = 0; k < 3; k++) s[k] += data[j * 4 + k]; }
      if (n) add.push([i, s.map((v) => Math.round(v / n))]);
    }
    for (const [i, c] of add) { for (let k = 0; k < 3; k++) data[i * 4 + k] = c[k]; cov[i] = 1; }
    filled += add.length;
  }
  await flushTexture();
  console.log(`đã lấp khe ảnh màu: ${filled} điểm ảnh`);
}

// --smooth-normals [độ]: thân AI không có hướng mặt (normal) → trình xem tô sáng phẳng từng mặt tam giác, mỗi mặt một độ sáng
// → thân loang mảng sáng/xám. Tính normal mượt cho từng góc tam giác = trung bình các mặt chung đỉnh lệch nhau < ngưỡng
// (mặc định 40°) → mặt cong sáng tối mượt, góc sắc (mép nắp, cạnh hốc) vẫn sắc. Tách đỉnh theo tam giác; weld() khi nén gộp lại.
if (args.includes('--smooth-normals')) {
  const lim = Math.cos(((opt('smooth-normals')?.match(/^[\d.]+$/) ? +opt('smooth-normals') : 40) * Math.PI) / 180);
  const I = prim.getIndices()?.getArray(), PP = prim.getAttribute('POSITION').getArray(), UV = prim.getAttribute('TEXCOORD_0').getArray();
  const nT = I ? I.length / 3 : PP.length / 9, at = (t, k) => (I ? I[t * 3 + k] : t * 3 + k);
  const fn = new Float32Array(nT * 3), byPos = new Map(), pk = (v) => `${Math.round(PP[v * 3] * 2e4)},${Math.round(PP[v * 3 + 1] * 2e4)},${Math.round(PP[v * 3 + 2] * 2e4)}`;
  let out = 0; const ctr = [0, 0.18, 0];
  for (let t = 0; t < nT; t++) {
    const ps = [0, 1, 2].map((k) => { const v = at(t, k); return [PP[v * 3], PP[v * 3 + 1], PP[v * 3 + 2]]; });
    const c = cross3(sub3(ps[1], ps[0]), sub3(ps[2], ps[0])), n = norm3(c); // độ dài c = 2 × diện tích → trọng số
    fn.set(n, t * 3);
    const m = [0, 1, 2].map((k) => (ps[0][k] + ps[1][k] + ps[2][k]) / 3); if (n[0] * (m[0] - ctr[0]) + n[1] * (m[1] - ctr[1]) + n[2] * (m[2] - ctr[2]) > 0) out++;
    const area = Math.hypot(...c);
    for (let k = 0; k < 3; k++) { const key = pk(at(t, k)); let l = byPos.get(key); if (!l) byPos.set(key, (l = [])); l.push(t, area); }
  }
  const pos = new Float32Array(nT * 9), uv = new Float32Array(nT * 6), nor = new Float32Array(nT * 9);
  for (let t = 0; t < nT; t++) for (let k = 0; k < 3; k++) {
    const v = at(t, k), o = t * 3 + k, l = byPos.get(pk(v)), s = [0, 0, 0];
    for (let i = 0; i < l.length; i += 2) { const u = l[i], d = fn[u * 3] * fn[t * 3] + fn[u * 3 + 1] * fn[t * 3 + 1] + fn[u * 3 + 2] * fn[t * 3 + 2]; if (d < lim) continue; for (let j = 0; j < 3; j++) s[j] += fn[u * 3 + j] * l[i + 1]; }
    const n = forcedN.get(pk(v)) ?? (Math.hypot(...s) > 1e-12 ? norm3(s) : [fn[t * 3], fn[t * 3 + 1], fn[t * 3 + 2]]);
    pos.set([PP[v * 3], PP[v * 3 + 1], PP[v * 3 + 2]], o * 3); uv.set([UV[v * 2], UV[v * 2 + 1]], o * 2); nor.set(n, o * 3);
  }
  prim.getAttribute('POSITION').setArray(pos); prim.getAttribute('TEXCOORD_0').setArray(uv);
  prim.setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(nor).setBuffer(doc.getRoot().listBuffers()[0]));
  prim.setIndices(null);
  console.log(`đã tính normal mượt: ${nT} tam giác, ${((out / nT) * 100).toFixed(0)}% mặt quay ra ngoài`);
}

// 5) Nén
await MeshoptEncoder.ready;
await doc.transform(dedup(), weld(), textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], quality: 88 }), prune(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
await io.write(output, doc);
console.log(`✔ ${output} ${(fs.statSync(output).size / 1024).toFixed(0)} KB`);
