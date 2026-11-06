// Chuyển STL (CAD, đơn vị mm, trục Z hướng lên) → GLB cho <model-viewer> / AR.
// Chạy: npm run models   (đọc models-src/models.json, xuất vào public/models/)
//
// Mỗi model trong models.json:
//   { "out": "ten-file", "dir": ".", "parts": { "Component2": "solar", ... }, "default": "body" }
//   - dir: thư mục chứa STL (tương đối models-src/); mọi file .stl trong đó là bộ phận của 1 model
//   - parts: tên file STL (không đuôi) → tên chất liệu trong "materials"; file không khai báo dùng "default"
//   - regions (tuỳ chọn): tô màu khác cho 1 vùng của 1 bộ phận, VD lòng vòm xanh trên bình nước trắng:
//       { "part": "Body1", "material": "green", "min": [x, y, z], "max": [x, y, z], "normals": ["+x", "-z"] }
//     min/max: hộp toạ độ gốc của file STL (mm, Z hướng lên); tam giác có tâm nằm trong hộp → đổi chất liệu.
//     normals (tuỳ chọn): chỉ đổi tam giác có mặt quay về các hướng này (+x -x +y -y +z -z).
//     normal + minDot (tuỳ chọn): chỉ đổi tam giác có hướng mặt lệch với "normal" ít hơn ngưỡng (VD [0,0,1] + 0.85 = mặt
//     hướng lên trong khoảng 30°) – tránh mép bo bị răng cưa khi ranh giới rơi đúng giữa mép bo 45°.
//   - extras (tuỳ chọn): khối tự dựng thêm khi file CAD thiếu bộ phận (toạ độ như STL: mm, Z hướng lên):
//       { "name": "...", "shape": "box", "size": [sx, sy, sz], "center": [x, y, z], "material": "white",
//         "grid": [cột, hàng, khe_mm],            ← tuỳ chọn: chia mặt hộp thành ô (VD ô pin mặt trời)
//         "rotX": 30, "pivot": [x, y, z] }        ← tuỳ chọn: xoay quanh trục X (độ) qua điểm pivot (mặc định center)
//       { "name": "...", "shape": "cylinder", "radius": r, "axis": "x" | "y" | "z", "from": [x, y, z], "length": l,
//         "material": "grey", "segments": 32 }    ← trụ: tâm đáy ở "from", kéo dài "length" theo trục
//       { "name": "...", "shape": "band", "size": [w, d], "radius": r, "center": [x, y], "z": [z0, z1], "offset": 1,
//         "skip": { "min": [x, y], "max": [x, y] }, "material": "green" }
//                                                 ← vòng bo quanh thân hình chữ nhật bo góc (VD sọc xanh), nổi ra "offset" mm;
//                                                   "skip": bỏ đoạn nằm trong vùng này (VD chỗ hộp bên hông che)
//       { "name": "...", "shape": "decal", "image": "decals/logo.png", "center": [x, z], "height": h, "width": w?,
//         "offset": 0.8, "grid": [48, 24], "parts": ["Body1 aa"] }
//                                                 ← miếng dán ảnh (PNG nền trong suốt) ở mặt trước (nhìn từ -y): chiếu thẳng
//                                                   lên bề mặt các bộ phận STL ("parts", mặc định tất cả) nên ôm theo mặt cong;
//                                                   width bỏ trống = theo tỉ lệ ảnh. Ảnh đặt trong models-src/.
//                                                   Không có "image" mà có "material" + "width" = miếng vá trơn (bịt lỗ trên vỏ).
//   - stripes (tuỳ chọn): sọc màu sơn thẳng lên vách thân (cắt tam giác đúng tại z0, z1 nên mép sọc thẳng, liền thân):
//       { "parts": ["Component19", "Component21"], "z": [z0, z1], "material": "green", "skip": { "min": [x, y], "max": [x, y] } }
//   - exclude (tuỳ chọn): danh sách file STL (không đuôi) bỏ qua, VD tấm pin / cột cũ thay bằng bản dựng lại.
//   - extends (tuỳ chọn): tên "out" của model khác → kế thừa dir, default, parts, regions, extras, exclude rồi cộng thêm
//     của mình (VD Sol Plus = Grid Plus + tấm pin).
// Các bước: đọc STL → mm sang m, Z-up sang Y-up (chuẩn glTF) → căn giữa theo thân máy (STL), đáy chạm sàn (y = 0)
//   → gán chất liệu → hàn đỉnh trùng → giảm đa giác nếu quá ngân sách → nén meshopt → kiểm tra < 5MB.
import fs from 'node:fs';
import path from 'node:path';
import { Document, NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions';
import { weld, simplify, meshopt, prune, dedup, cloneDocument } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'models-src');
const OUT = path.join(ROOT, 'public', 'models');
const MAX_BYTES = 5 * 1024 * 1024;
const config = JSON.parse(fs.readFileSync(path.join(SRC, 'models.json'), 'utf8'));
const MAX_TRIS = config.maxTriangles ?? 150_000; // ngân sách tam giác mỗi model trước khi nén

/** Đọc STL nhị phân hoặc ASCII → Float32Array toạ độ tam giác (9 số / tam giác, đơn vị gốc) */
function readStl(file) {
  const b = fs.readFileSync(file);
  if (b.length >= 84) {
    const n = b.readUInt32LE(80);
    if (84 + n * 50 === b.length) {
      const pos = new Float32Array(n * 9);
      for (let i = 0; i < n; i++) for (let k = 0; k < 9; k++) pos[i * 9 + k] = b.readFloatLE(84 + i * 50 + 12 + k * 4);
      return pos;
    }
  }
  const nums = [...b.toString('latin1').matchAll(/vertex\s+(\S+)\s+(\S+)\s+(\S+)/g)].flatMap((m) => [+m[1], +m[2], +m[3]]);
  if (!nums.length || nums.length % 9) throw new Error(`Không đọc được STL: ${file}`);
  return new Float32Array(nums);
}

const sub = (a, b) => a.map((v, k) => v - b[k]);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Chất liệu của vùng (regions) chứa tam giác này – theo tâm tam giác và hướng mặt; không thuộc vùng nào → undefined */
function regionMaterial(tri, regions) {
  if (!regions.length) return undefined;
  const c = [0, 1, 2].map((k) => (tri[k] + tri[k + 3] + tri[k + 6]) / 3);
  const n = cross([tri[3] - tri[0], tri[4] - tri[1], tri[5] - tri[2]], [tri[6] - tri[0], tri[7] - tri[1], tri[8] - tri[2]]);
  const big = [0, 1, 2].reduce((m, k) => (Math.abs(n[k]) > Math.abs(n[m]) ? k : m), 0);
  const dir = (n[big] >= 0 ? '+' : '-') + 'xyz'[big];
  const l = Math.hypot(...n) || 1;
  const r = regions.find((r) => c.every((v, k) => v >= r.min[k] && v <= r.max[k]) && (!r.normals || r.normals.includes(dir))
    && (!r.normal || dot(n, r.normal) / l >= (r.minDot ?? 0.7)));
  return r?.material;
}

/* ---------- Sọc màu sơn thẳng lên bề mặt (stripes) ---------- */
/** Tam giác có thuộc sọc không: chạm dải z, mặt quay ngang (vách ngoài/trong), không nằm trong vùng skip */
function stripeApplies(tri, s) {
  const zs = [tri[2], tri[5], tri[8]];
  if (Math.max(...zs) <= s.z[0] || Math.min(...zs) >= s.z[1]) return false;
  const n = cross([tri[3] - tri[0], tri[4] - tri[1], tri[5] - tri[2]], [tri[6] - tri[0], tri[7] - tri[1], tri[8] - tri[2]]);
  const l = Math.hypot(...n) || 1;
  if (Math.abs(n[2] / l) > 0.7) return false; // bỏ mặt nằm ngang
  if (s.skip) {
    const cx = (tri[0] + tri[3] + tri[6]) / 3, cy = (tri[1] + tri[4] + tri[7]) / 3;
    if (cx >= s.skip.min[0] && cx <= s.skip.max[0] && cy >= s.skip.min[1] && cy <= s.skip.max[1]) return false;
  }
  return true;
}
/** Cắt đa giác bởi mặt phẳng z = c, giữ phần phía trên (above) hoặc dưới */
function clipZ(poly, c, above) {
  const out = [];
  const inside = (p) => (above ? p[2] >= c : p[2] <= c);
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    if (inside(a)) out.push(a);
    if (inside(a) !== inside(b)) { const t = (c - a[2]) / (b[2] - a[2]); out.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1]), c]); }
  }
  return out;
}
/** Tách tam giác thành các mảnh dưới z0 / giữa z0..z1 / trên z1 → [[toạ độ 9n số, trong dải?], ...] (giữ chiều quay mặt) */
function splitByZ(tri, z0, z1) {
  const poly = [[tri[0], tri[1], tri[2]], [tri[3], tri[4], tri[5]], [tri[6], tri[7], tri[8]]];
  const fan = (p) => { const r = []; for (let i = 1; i + 1 < p.length; i++) r.push(...p[0], ...p[i], ...p[i + 1]); return r; };
  return [[clipZ(poly, z0, false), false], [clipZ(clipZ(poly, z0, true), z1, false), true], [clipZ(poly, z1, true), false]]
    .filter(([p]) => p.length >= 3).map(([p, inside]) => [fan(p), inside]);
}

/* ---------- Khối tự dựng (extras) ---------- */
/** Thêm tứ giác a-b-c-d (2 tam giác), tự đảo chiều để mặt quay ra ngoài theo hướng `out` */
function quad(list, a, b, c, d, out) {
  const ok = dot(cross(sub(b, a), sub(c, a)), out) >= 0;
  const [p, q, r, s] = ok ? [a, b, c, d] : [a, d, c, b];
  list.push(...p, ...q, ...r, ...p, ...r, ...s);
}
function boxTris(size, center, list = []) {
  const h = size.map((v) => v / 2);
  const P = (sx, sy, sz) => [center[0] + sx * h[0], center[1] + sy * h[1], center[2] + sz * h[2]];
  for (const [axis, sign] of [[0, 1], [0, -1], [1, 1], [1, -1], [2, 1], [2, -1]]) {
    const [u, v] = [0, 1, 2].filter((k) => k !== axis);
    const corner = (su, sv) => { const s = [0, 0, 0]; s[axis] = sign; s[u] = su; s[v] = sv; return P(...s); };
    const out = [0, 0, 0]; out[axis] = sign;
    quad(list, corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1), out);
  }
  return list;
}
function cylinderTris({ radius, axis = 'z', from, length, segments = 32 }) {
  const ax = 'xyz'.indexOf(axis);
  const [u, v] = [0, 1, 2].filter((k) => k !== ax);
  const pt = (ang, t) => { const p = [...from]; p[u] += radius * Math.cos(ang); p[v] += radius * Math.sin(ang); p[ax] += t; return p; };
  const list = [];
  const end = (t) => { const p = [...from]; p[ax] += t; return p; };
  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * Math.PI * 2, a1 = ((i + 1) / segments) * Math.PI * 2;
    const mid = (a0 + a1) / 2; const out = [0, 0, 0]; out[u] = Math.cos(mid); out[v] = Math.sin(mid);
    quad(list, pt(a0, 0), pt(a1, 0), pt(a1, length), pt(a0, length), out);
    for (const [t, sgn] of [[0, -1], [length, 1]]) {   // 2 nắp
      const c = end(t), o = [0, 0, 0]; o[ax] = sgn;
      const tri = [c, pt(a0, t), pt(a1, t)];
      if (dot(cross(sub(tri[1], tri[0]), sub(tri[2], tri[0])), o) < 0) tri.reverse();
      list.push(...tri.flat());
    }
  }
  return list;
}
/** Vòng bo quanh thân hình chữ nhật bo góc (mặt ngoài + gờ trên/dưới), nổi ra ngoài `offset` mm */
function bandTris({ size, radius: r, center = [0, 0], z: [z0, z1], offset = 1, skip, segments = 10 }) {
  const [hw, hd] = [size[0] / 2 - r, size[1] / 2 - r];
  const corners = [[hw, hd, 0], [-hw, hd, Math.PI / 2], [-hw, -hd, Math.PI], [hw, -hd, (3 * Math.PI) / 2]];
  const ring = (rad) => corners.flatMap(([cx, cy, a0]) => Array.from({ length: segments + 1 }, (_, i) => {
    const a = a0 + (i / segments) * (Math.PI / 2);
    return [center[0] + cx + rad * Math.cos(a), center[1] + cy + rad * Math.sin(a)];
  }));
  const outer = ring(r + offset), inner = ring(r);
  const list = [];
  for (let i = 0; i < outer.length; i++) {
    const j = (i + 1) % outer.length;
    const [p, q] = [outer[i], outer[j]];
    const mid = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    if (skip && mid[0] >= skip.min[0] && mid[0] <= skip.max[0] && mid[1] >= skip.min[1] && mid[1] <= skip.max[1]) continue;
    const out = [mid[0] - center[0], mid[1] - center[1], 0];
    quad(list, [p[0], p[1], z0], [q[0], q[1], z0], [q[0], q[1], z1], [p[0], p[1], z1], out);
    const [pi, qi] = [inner[i], inner[j]];
    quad(list, [pi[0], pi[1], z1], [qi[0], qi[1], z1], [q[0], q[1], z1], [p[0], p[1], z1], [0, 0, 1]);
    quad(list, [pi[0], pi[1], z0], [qi[0], qi[1], z0], [q[0], q[1], z0], [p[0], p[1], z0], [0, 0, -1]);
  }
  return list;
}

/** Miếng dán ảnh: lưới điểm chiếu từ phía trước (-y) lên bề mặt STL → tam giác + toạ độ ảnh (uv) */
function decalTris(e, targets, aspect) {
  const [nx, nz] = e.grid ?? [48, 24];
  const h = e.height, w = e.width ?? h * aspect;
  const [cx, cz] = e.center;
  const off = e.offset ?? 0.8;
  const x0 = cx - w / 2, z0 = cz - h / 2;
  // chỉ xét tam giác nằm trong khung ảnh (theo x, z)
  const tris = [];
  for (const raw of targets) for (let t = 0; t < raw.length; t += 9) {
    const xs = [raw[t], raw[t + 3], raw[t + 6]], zs = [raw[t + 2], raw[t + 5], raw[t + 8]];
    if (Math.max(...xs) < x0 || Math.min(...xs) > x0 + w || Math.max(...zs) < z0 || Math.min(...zs) > z0 + h) continue;
    tris.push(raw.subarray(t, t + 9));
  }
  // điểm (x, z) → y của bề mặt gần phía trước nhất (y nhỏ nhất) mà tia song song trục y chạm
  const surfaceY = (x, z) => {
    let best = null;
    for (const t of tris) {
      const [ax, ay, az, bx, by, bz, qx, qy, qz] = t;
      const d = (bz - qz) * (ax - qx) + (qx - bx) * (az - qz);
      if (Math.abs(d) < 1e-9) continue;
      const l1 = ((bz - qz) * (x - qx) + (qx - bx) * (z - qz)) / d;
      const l2 = ((qz - az) * (x - qx) + (ax - qx) * (z - qz)) / d;
      const l3 = 1 - l1 - l2;
      if (l1 < -1e-6 || l2 < -1e-6 || l3 < -1e-6) continue;
      const y = l1 * ay + l2 * by + l3 * qy;
      if (best === null || y < best) best = y;
    }
    return best;
  };
  // độ sâu bề mặt tại từng điểm lưới; điểm rơi vào lỗ / khe nhỏ (không chạm, hoặc lõm sâu hơn hẳn xung quanh)
  // được vá bằng trung bình các điểm lân cận để miếng dán liền mạch
  const ys = [];
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) ys.push(surfaceY(x0 + (w * i) / nx, z0 + (h * j) / nz));
  const idx = (i, j) => j * (nx + 1) + i;
  const near = (i, j, src) => [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]
    .map(([di, dj]) => [i + di, j + dj]).filter(([a, b]) => a >= 0 && a <= nx && b >= 0 && b <= nz).map(([a, b]) => src[idx(a, b)]).filter((v) => v !== null);
  const med = (a) => { const s = [...a].sort((p, q) => p - q); return s[s.length >> 1]; };
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
    const v = ys[idx(i, j)], n = near(i, j, ys);
    if (v !== null && n.length >= 3 && v - med(n) > 2) ys[idx(i, j)] = null; // lõm sâu > 2mm so với xung quanh = lỗ
  }
  for (let pass = 0; pass < 20 && ys.includes(null); pass++) {
    const copy = [...ys];
    for (let k = 0; k < ys.length; k++) if (copy[k] === null) { const n = near(k % (nx + 1), Math.floor(k / (nx + 1)), copy); if (n.length >= 2) ys[k] = n.reduce((s, v) => s + v, 0) / n.length; }
  }
  const grid = [];
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
    const x = x0 + (w * i) / nx, z = z0 + (h * j) / nz, y = ys[idx(i, j)];
    grid.push(y === null ? null : { p: [x, y - off, z], uv: [i / nx, 1 - j / nz] });
  }
  const pos = [], uv = [];
  const at = (i, j) => grid[j * (nx + 1) + i];
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const a = at(i, j), b = at(i + 1, j), c = at(i + 1, j + 1), d = at(i, j + 1);
    if (!a || !b || !c || !d) continue;
    for (const tri of [[a, b, c], [a, c, d]]) {
      const n = cross(sub(tri[1].p, tri[0].p), sub(tri[2].p, tri[0].p));
      if (n[1] > 0) tri.reverse(); // mặt dán quay về phía trước (-y)
      for (const v of tri) { pos.push(...v.p); uv.push(...v.uv); }
    }
  }
  return { pos: Float32Array.from(pos), uv: Float32Array.from(uv) };
}

/** Toạ độ tam giác (mm, Z-up) của 1 khối extras */
function extraTris(e) {
  let list = [];
  if (e.shape === 'band') list = bandTris(e);
  else if (e.shape === 'box') {
    if (e.grid) {
      // chia mặt XY của hộp thành cột × hàng ô, cách nhau "khe" mm
      const [cols, rows, gap] = e.grid;
      const cw = (e.size[0] - gap * (cols - 1)) / cols, ch = (e.size[1] - gap * (rows - 1)) / rows;
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++)
        boxTris([cw, ch, e.size[2]], [e.center[0] - e.size[0] / 2 + cw / 2 + i * (cw + gap), e.center[1] - e.size[1] / 2 + ch / 2 + j * (ch + gap), e.center[2]], list);
    } else boxTris(e.size, e.center, list);
  } else if (e.shape === 'cylinder') list = cylinderTris(e);
  else throw new Error(`Không biết shape "${e.shape}"`);
  if (e.rotX) { // xoay quanh trục X qua pivot
    const a = (e.rotX * Math.PI) / 180, [c, s] = [Math.cos(a), Math.sin(a)];
    const pv = e.pivot ?? e.center ?? e.from;
    for (let i = 0; i < list.length; i += 3) {
      const y = list[i + 1] - pv[1], z = list[i + 2] - pv[2];
      list[i + 1] = pv[1] + y * c - z * s; list[i + 2] = pv[2] + y * s + z * c;
    }
  }
  return Float32Array.from(list);
}

/** Màu hex sRGB → hệ số tuyến tính cho glTF */
const linear = (hex) => {
  const c = hex.replace('#', '').match(/../g).map((h) => parseInt(h, 16) / 255);
  return [...c.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)), 1];
};

/** Gộp cấu hình model với model nó kế thừa (extends) */
function resolve(model) {
  if (!model.extends) return model;
  const base = resolve(config.models.find((m) => m.out === model.extends) ?? (() => { throw new Error(`extends: không có model "${model.extends}"`); })());
  return {
    ...base, ...model,
    skipWrite: model.skipWrite, // không kế thừa (Sol Plus kế thừa Grid Plus nhưng vẫn ghi bản CAD)
    parts: { ...base.parts, ...model.parts },
    regions: [...(base.regions ?? []), ...(model.regions ?? [])],
    extras: [...(base.extras ?? []), ...(model.extras ?? [])],
    exclude: [...(base.exclude ?? []), ...(model.exclude ?? [])],
  };
}

/** Kích thước ảnh PNG (đọc header) */
const pngSize = (buf) => [buf.readUInt32BE(16), buf.readUInt32BE(20)];

async function build(input) {
  const model = resolve(input);
  const dir = path.join(SRC, model.dir ?? '.');
  const exclude = new Set(model.exclude ?? []);
  const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.stl') && !exclude.has(path.basename(f, path.extname(f)))).sort();
  if (!files.length) throw new Error(`Không có file STL trong ${dir}`);
  const rawByName = {}; // toạ độ gốc từng bộ phận – dùng để chiếu decal
  const s = (model.unitScale ?? 0.001); // mm → m
  // CAD (x, y, z↑) → glTF (x, y↑, z) = (x, z, -y), đổi đơn vị
  const toGltf = (raw) => { const pos = new Float32Array(raw.length); for (let i = 0; i < raw.length; i += 3) { pos[i] = raw[i] * s; pos[i + 1] = raw[i + 2] * s; pos[i + 2] = -raw[i + 1] * s; } return pos; };

  // 1) Đọc STL + tách vùng tô màu riêng (regions, theo toạ độ gốc)
  const parts = files.flatMap((f) => {
    const name = path.basename(f, path.extname(f));
    const raw = readStl(path.join(dir, f));
    rawByName[name] = raw;
    const base = model.parts?.[name] ?? model.default ?? 'body';
    const regions = (model.regions ?? []).filter((r) => r.part === name);
    const stripes = (model.stripes ?? []).filter((s) => s.parts.includes(name));
    const groups = new Map(); // chất liệu → toạ độ tam giác
    const add = (mat, tri) => { if (!groups.has(mat)) groups.set(mat, []); groups.get(mat).push(...tri); };
    for (let t = 0; t < raw.length; t += 9) {
      const tri = raw.subarray(t, t + 9);
      const st = stripes.find((s) => stripeApplies(tri, s));
      if (st) { // cắt tam giác tại z0, z1: phần giữa tô màu sọc, phần còn lại tô như thường
        for (const [piece, inside] of splitByZ(tri, st.z[0], st.z[1])) add(inside ? st.material : (regionMaterial(piece, regions) ?? base), piece);
      } else add(regionMaterial(tri, regions) ?? base, tri);
    }
    return [...groups].map(([mat, list]) => ({ name: groups.size > 1 ? `${name}-${mat}` : name, mat, pos: toGltf(Float32Array.from(list)) }));
  });
  const stlCount = parts.length;
  // 2) Khối tự dựng
  for (const e of model.extras ?? []) {
    if (e.shape === 'decal') {
      // decal không có ảnh ("material" + "width"): miếng vá ôm mặt cong, VD bịt lỗ bắt vít trên vỏ
      const [iw, ih] = e.image ? pngSize(fs.readFileSync(path.join(SRC, e.image))) : [e.width, e.height];
      const targets = (e.parts ?? Object.keys(rawByName)).map((n) => rawByName[n] ?? (() => { throw new Error(`decal: không có bộ phận "${n}"`); })());
      const { pos, uv } = decalTris(e, targets, iw / ih);
      if (!pos.length) throw new Error(`decal "${e.name}": không chiếu được lên bề mặt nào – kiểm tra center/height`);
      if (e.image) parts.push({ name: e.name ?? 'decal', mat: `decal:${e.image}`, pos: toGltf(pos), uv });
      else parts.push({ name: e.name ?? 'patch', mat: e.material ?? model.default ?? 'body', pos: toGltf(pos) });
    } else parts.push({ name: e.name ?? e.shape, mat: e.material ?? model.default ?? 'body', pos: toGltf(extraTris(e)) });
  }

  // 3) Căn giữa theo X/Z và đáy chạm sàn – tính theo thân máy (STL), để bản có / không có tấm pin đứng cùng chỗ
  const bounds = (list) => {
    const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
    for (const { pos } of list) for (let i = 0; i < pos.length; i++) { const k = i % 3; mn[k] = Math.min(mn[k], pos[i]); mx[k] = Math.max(mx[k], pos[i]); }
    return [mn, mx];
  };
  const [min, max] = bounds(parts.slice(0, stlCount));
  const shift = [-(min[0] + max[0]) / 2, -min[1], -(min[2] + max[2]) / 2];
  for (const { pos } of parts) for (let i = 0; i < pos.length; i++) pos[i] += shift[i % 3];
  const [allMin, allMax] = bounds(parts);

  // 4) Dựng glTF: mỗi bộ phận = 1 node, chất liệu theo models.json
  const doc = new Document();
  const buffer = doc.createBuffer();
  const mats = {};
  const material = (key) => (mats[key] ??= (() => {
    if (key.startsWith('decal:')) { // ảnh PNG nền trong suốt
      const file = key.slice(6);
      const tex = doc.createTexture(path.basename(file)).setImage(fs.readFileSync(path.join(SRC, file))).setMimeType('image/png');
      const mat = doc.createMaterial(key).setBaseColorTexture(tex).setAlphaMode('BLEND').setRoughnessFactor(0.55).setMetallicFactor(0);
      // không lặp ảnh ở mép (lặp sẽ kéo màu mép đối diện vào, thành vệt lạ quanh logo)
      mat.getBaseColorTextureInfo().setWrapS(33071).setWrapT(33071);
      return mat;
    }
    const m = config.materials[key];
    if (!m) throw new Error(`Chưa khai báo chất liệu "${key}" trong models.json`);
    return doc.createMaterial(key).setBaseColorFactor(linear(m.color)).setRoughnessFactor(m.roughness ?? 0.8).setMetallicFactor(m.metalness ?? 0);
  })());
  const root = doc.createNode(model.out);
  doc.createScene(model.out).addChild(root);
  let tris = 0;
  for (const { name, mat, pos, uv } of parts) {
    // Pháp tuyến phẳng theo mặt (không tin pháp tuyến trong STL); hàn đỉnh sau đó giữ cạnh sắc của CAD
    const nor = new Float32Array(pos.length);
    for (let t = 0; t < pos.length; t += 9) {
      const ax = pos[t + 3] - pos[t], ay = pos[t + 4] - pos[t + 1], az = pos[t + 5] - pos[t + 2];
      const bx = pos[t + 6] - pos[t], by = pos[t + 7] - pos[t + 1], bz = pos[t + 8] - pos[t + 2];
      let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
      const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
      for (let v = 0; v < 3; v++) { nor[t + v * 3] = nx; nor[t + v * 3 + 1] = ny; nor[t + v * 3 + 2] = nz; }
    }
    tris += pos.length / 9;
    const prim = doc.createPrimitive()
      .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(pos).setBuffer(buffer))
      .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(nor).setBuffer(buffer))
      .setMaterial(material(mat));
    if (uv) prim.setAttribute('TEXCOORD_0', doc.createAccessor().setType('VEC2').setArray(uv).setBuffer(buffer));
    root.addChild(doc.createNode(name).setMesh(doc.createMesh(name).addPrimitive(prim)));
  }

  // 5) Tối ưu: hàn đỉnh → giảm đa giác (nếu cần) → nén meshopt; giảm tiếp nếu vẫn > 5MB
  await MeshoptSimplifier.ready;
  await MeshoptEncoder.ready;
  await doc.transform(dedup(), weld());
  let ratio = Math.min(1, MAX_TRIS / tris);
  const io = new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization]).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
  for (let attempt = 0; ; attempt++) {
    const work = cloneDocument(doc);
    if (ratio < 1) await work.transform(simplify({ simplifier: MeshoptSimplifier, ratio, error: 0.001 }));
    await work.transform(prune(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
    const glb = await io.writeBinary(work);
    if (glb.byteLength <= MAX_BYTES || attempt >= 6) {
      // "skipWrite": web đang dùng bản khác (VD Grid Plus = bản 3D AI, scripts/build-ai-models.mjs) → không ghi đè public/models/
      if (model.skipWrite) { console.log(`– bỏ qua ghi ${model.out}.glb: ${model.skipWrite}`); return; }
      fs.mkdirSync(OUT, { recursive: true });
      fs.writeFileSync(path.join(OUT, `${model.out}.glb`), glb);
      const size = (mn, mx) => mx.map((v, k) => ((v - mn[k]) * 100).toFixed(1));
      const [b, a] = [size(min, max), size(allMin, allMax)];
      const extra = (model.extras ?? []).length;
      console.log(`✔ ${model.out}.glb  ${(glb.byteLength / 1024).toFixed(0)} KB  ${files.length} bộ phận${stlCount > files.length ? ` (+${stlCount - files.length} vùng màu)` : ''}` +
        `${extra ? ` + ${extra} khối tự dựng` : ''}  ${tris} tam giác${ratio < 1 ? ` → giảm còn ~${Math.round(tris * ratio)}` : ''}` +
        `  thân máy ${b[0]}×${b[2]}×${b[1]} cm${extra ? `, cả khối dựng thêm ${a[0]}×${a[2]}×${a[1]} cm` : ''} (rộng×sâu×cao)`);
      if (glb.byteLength > MAX_BYTES) console.warn(`  ⚠ vẫn lớn hơn 5MB`);
      return;
    }
    ratio *= 0.6;
  }
}

for (const model of config.models) await build(model);
