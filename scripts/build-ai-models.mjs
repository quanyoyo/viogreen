// Dựng lại bản 3D AI (TRELLIS) đã chỉnh cho web: npm run models:ai [grid-plus|sol-plus] [--out file.glb]
// Mỗi cấu hình = file nguồn trong models-src/ai/ + bộ tuỳ chọn cho scripts/fix-ai-glb.mjs (giải thích từng tuỳ chọn ở đầu
// mỗi khối trong file đó). Toạ độ tính bằng mét, máy quay mặt trước ra +z, đáy y = 0.
//  - grid-plus: ĐANG DÙNG trên web (public/models/ecohub-grid-plus.glb), chủ web duyệt 07/11/2026.
//  - sol-plus: bản thử, CHƯA duyệt lên web (web vẫn dùng bản CAD của npm run models) → phải truyền --out.
import { spawnSync } from 'node:child_process';

const CONFIGS = {
  'grid-plus': {
    src: 'models-src/ai/grid-plus-trellis.glb',
    out: 'public/models/ecohub-grid-plus.glb',
    args: [
      '--front', '+x',
      // là phẳng: chỗ cụm cổng AI nặn (trái), cục tròn đen + khe đen (phải), 1 rãnh dọc bên phải, vết lõm viền nắp sau
      '--flatten-feather', '0.02',
      '--flatten-x', '-0.19,0.03,-0.046,-0.13,0.2,0.04',
      '--flatten-x', '0.12,0.288,-0.046,0.25,0.347,0.018,0.008',
      '--flatten-x', '0.12,0.02,0.042,0.25,0.33,0.059,0.006',
      '--flatten-x', '0.12,0.172,-0.027,0.25,0.205,0.012,0.006',
      '--flatten-z', '-0.072,0.336,-0.16,-0.055,0.356,-0.10,0.005',
      // nắp: mảng xanh bo góc + chấm giữa, viền trắng, tô cả vách quanh mảng xanh
      '--pad', '-0.070,-0.103,0.105,0.105,0.035', '--pad-y', '0.352,0.359', '--pad-white-y', '0.345,0.36',
      '--pad-dot', '0.0175,0.001,0.008', '--pad-walls', '0.02', '--top-color', '40,100,62',
      '--back-fill', '--back-max-lum', '256', '--back-ymax', '0.985',
      // tô trắng: cụm cổng cũ, chỗ cục tròn đen, viền nắp sau, 2 dải rãnh phải, nắp hộp Bio-Tank, khe đen phải, vết nhỏ ở lưng
      '--white-box', '-0.17,0.03,-0.05,-0.12,0.203,0.045',
      '--white-box', '0.12,0.284,-0.05,0.25,0.35,0.022',
      '--white-box', '-0.074,0.336,-0.135,-0.054,0.362,-0.105',
      '--white-box', '0.12,0.015,0.044,0.25,0.345,0.057',
      '--white-box', '0.12,0.015,-0.103,0.25,0.345,-0.090',
      '--white-box', '-0.165,0.30,-0.10,-0.08,0.40,0.025',
      '--white-box', '0.12,0.172,-0.027,0.25,0.205,0.012',
      '--white-box', '0.058,0.13,-0.2,0.08,0.165,-0.08',
      '--white-box', '-0.08,0.012,-0.2,0.08,0.035,-0.09',
      // đồng bộ màu vỏ trắng (giữ 35% bóng đổ mềm) + xoá vệt mảnh
      '--unify', '--unify-k', '0.35', '--clean-lines', '--seam-fill',
      // mặt lưng: nắn chính thân AI về biên dạng trơn (không dán vỏ riêng), ron ngang ở 25,7 cm, che 2 khe ở mép mảng nổi cũ
      '--back-cover', '0.03,0.335,0.257', '--back-snap', '--snap-bottom-feather', '0.02', '--snap-smooth', '3',
      '--back-patch', '0.069,0.035,0.20', '--back-patch', '-0.067,0.19,0.335',
      // cụm nút / USB / đèn / nút nguồn vẽ lại theo vị trí CAD; logo
      '--ports', '-0.045,0.10,0.045,0.20',
      '--logo', 'models-src/decals/logo-vio-green.png', '--logo-box', '-0.058,0.272,0.06,0.347',
      '--logo-height', '0.068', '--logo-center', '0.006,0.293',
      '--fill-box', '-0.044,0.026,-0.10,0.069,0.187,0.085',
      '--smooth-normals',
    ],
  },
  'sol-plus': {
    src: 'models-src/ai/sol-plus-trellis.glb',
    out: null, // chưa duyệt lên web
    args: [
      '--front', '+z', '--height', '0.50', '--depth', '0.25',
      '--pad', '-0.108,0.015,0.108,0.113,0.04', '--pad-y', '0.330,0.3385', '--pad-white-y', '0.330,0.356', '--top-color', '40,100,62',
      '--back-fill', '--back-max-lum', '256', '--back-ymax', '0.69',
      '--white-box', '-0.09,0.33,-0.13,-0.035,0.365,-0.085', '--white-box', '0.0,0.33,-0.13,0.09,0.365,-0.085',
      '--seam-fill',
      '--logo', 'models-src/decals/logo-vio-green.png', '--logo-box', '-0.052,0.266,0.066,0.341', '--logo-height', '0.066', '--logo-center', '0.0,0.286',
      '--fill-box', '-0.06,0.026,-0.10,0.06,0.206,0.08',
      '--panel-grid', '6,5', '--rods-remove', '--rods-ymin', '0.69', '--pole', '-0.067,-0.106,0.33,0.009',
    ],
  },
};

const argv = process.argv.slice(2);
const oi = argv.indexOf('--out'), outArg = oi >= 0 ? argv[oi + 1] : null;
const names = argv.filter((a, i) => !a.startsWith('--') && i !== oi + 1);
for (const name of names.length ? names : ['grid-plus']) {
  const c = CONFIGS[name];
  if (!c) { console.error(`Không có cấu hình "${name}" (có: ${Object.keys(CONFIGS).join(', ')})`); process.exit(1); }
  const out = outArg ?? c.out;
  if (!out) { console.error(`${name}: chưa duyệt lên web → cần --out <file.glb>`); process.exit(1); }
  console.log(`== ${name} → ${out}`);
  const r = spawnSync(process.execPath, ['scripts/fix-ai-glb.mjs', c.src, out, ...c.args], { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
