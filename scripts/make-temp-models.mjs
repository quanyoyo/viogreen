// Model 3D TẠM cho các máy chưa có model riêng: thu nhỏ đều bản Pro cho đúng cỡ từng máy (chủ web yêu cầu 11/11/2026).
// Chạy: npm run models:tam   (chạy lại sau mỗi lần dựng lại ecohub-sol-pro / ecohub-grid-pro bằng npm run models)
//
// Thu nhỏ bằng 1 node cha có scale ngay trong file GLB (không dùng thuộc tính scale của <model-viewer>):
// AR trên Android (Scene Viewer) mở thẳng file GLB, bỏ qua thuộc tính của trang.
// Gốc toạ độ của bản Pro nằm ở tâm đáy máy → thu nhỏ quanh gốc thì máy vẫn đứng trên sàn.
//
// Hệ số = trung bình (rộng, cao) của cỡ máy trên ảnh thông số khách gửi so với thân Pro 40×40×50,6 cm,
// thu nhỏ đều 3 chiều để không méo nút, logo:
//   Sol / Grid 30×30×40 cm → 0,77 (≈ 30,8×30,8×39 cm)   Plus 25×25×35 cm → 0,66 (≈ 26,4×26,4×33,4 cm)
import fs from 'node:fs';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

const DIR = path.resolve(import.meta.dirname, '..', 'public', 'models');
const JOBS = [
  { from: 'ecohub-sol-pro', out: 'ecohub-sol-tam', scale: 0.77 },
  { from: 'ecohub-grid-pro', out: 'ecohub-grid-tam', scale: 0.77 },
  { from: 'ecohub-sol-pro', out: 'ecohub-sol-plus-tam', scale: 0.66 },
  { from: 'ecohub-grid-pro', out: 'ecohub-grid-plus-tam', scale: 0.66 },
];

await MeshoptDecoder.ready;
await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });

for (const job of JOBS) {
  const doc = await io.read(path.join(DIR, `${job.from}.glb`));
  const scene = doc.getRoot().getDefaultScene() ?? doc.getRoot().listScenes()[0];
  const holder = doc.createNode('thu-nho').setScale([job.scale, job.scale, job.scale]);
  for (const n of scene.listChildren()) { scene.removeChild(n); holder.addChild(n); }
  scene.addChild(holder);
  const file = path.join(DIR, `${job.out}.glb`);
  await io.write(file, doc);
  console.log(`✔ ${job.out}.glb  = ${job.from} × ${job.scale}  ${Math.round(fs.statSync(file).size / 1024)} KB`);
}
