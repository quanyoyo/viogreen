// Model 3D TẠM cho các máy chưa có model riêng: thu nhỏ bản Pro cho đúng cỡ từng máy (chủ web yêu cầu 11/11/2026).
// Chạy: npm run models:tam   (chạy lại sau mỗi lần dựng lại ecohub-sol-pro / ecohub-grid-pro bằng npm run models)
//
// Thu nhỏ bằng 1 node cha có scale ngay trong file GLB (không dùng thuộc tính scale của <model-viewer>):
// AR trên Android (Scene Viewer) mở thẳng file GLB, bỏ qua thuộc tính của trang.
// Gốc toạ độ của bản Pro nằm ở tâm đáy máy → thu nhỏ quanh gốc thì máy vẫn đứng trên sàn.
//
// Kích thước lấy từ ảnh thông số khách gửi (public/products/ecohub-*-info.webp), là cỡ THÂN máy
// (không tính cột + tấm pin): Sol / Grid 30×30×40 cm · Plus 25×25×35 cm · Pro 40×40×50 cm.
// Thân Pro trong file CAD = 40×40×50,6 cm. Thân Pro cao hơn so với bề ngang (40/50,6) so với 2 dòng kia
// (30/40 và 25/35) → phải thu theo chiều ngang và chiều cao khác nhau thì kích thước mới đúng.
// Chênh lệch tỉ lệ: Sol / Grid 5%, Plus 11% (máy hơi cao hơn bản Pro thu đều) — chấp nhận được với bản tạm,
// vì AR cần đúng kích thước thật để khách ướm vào chỗ định đặt.
import fs from 'node:fs';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

const DIR = path.resolve(import.meta.dirname, '..', 'public', 'models');
const PRO = { rong: 40, cao: 50.6 };                      // thân Pro trong file CAD (cm)
const JOBS = [
  { from: 'ecohub-sol-pro', out: 'ecohub-sol-tam', rong: 30, cao: 40 },
  { from: 'ecohub-grid-pro', out: 'ecohub-grid-tam', rong: 30, cao: 40 },
  { from: 'ecohub-sol-pro', out: 'ecohub-sol-plus-tam', rong: 25, cao: 35 },
  { from: 'ecohub-grid-pro', out: 'ecohub-grid-plus-tam', rong: 25, cao: 35 },
];

await MeshoptDecoder.ready;
await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });

for (const job of JOBS) {
  const doc = await io.read(path.join(DIR, `${job.from}.glb`));
  const scene = doc.getRoot().getDefaultScene() ?? doc.getRoot().listScenes()[0];
  const ngang = job.rong / PRO.rong, doc_ = job.cao / PRO.cao;     // GLB trục Y hướng lên
  const holder = doc.createNode('thu-nho').setScale([ngang, doc_, ngang]);
  for (const n of scene.listChildren()) { scene.removeChild(n); holder.addChild(n); }
  scene.addChild(holder);
  const file = path.join(DIR, `${job.out}.glb`);
  await io.write(file, doc);
  console.log(`✔ ${job.out}.glb  thân ${job.rong}×${job.rong}×${job.cao} cm`
    + `  (ngang ×${ngang.toFixed(3)}, cao ×${doc_.toFixed(3)})  ${Math.round(fs.statSync(file).size / 1024)} KB`);
}
