// Chuyển STL (CAD, đơn vị mm, trục Z hướng lên) → GLB cho <model-viewer> / AR.
// Chạy: npm run models   (đọc models-src/models.json, xuất vào public/models/)
//
// Mỗi model trong models.json:
//   { "out": "ten-file", "dir": ".", "parts": { "Component2": "solar", ... }, "default": "body" }
//   - dir: thư mục chứa STL (tương đối models-src/); mọi file .stl trong đó là bộ phận của 1 model
//   - parts: tên file STL (không đuôi) → tên chất liệu trong "materials"; file không khai báo dùng "default"
// Các bước: đọc STL → mm sang m, Z-up sang Y-up (chuẩn glTF) → căn giữa, đáy chạm sàn (y = 0)
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

/** Màu hex sRGB → hệ số tuyến tính cho glTF */
const linear = (hex) => {
  const c = hex.replace('#', '').match(/../g).map((h) => parseInt(h, 16) / 255);
  return [...c.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)), 1];
};

async function build(model) {
  const dir = path.join(SRC, model.dir ?? '.');
  const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.stl')).sort();
  if (!files.length) throw new Error(`Không có file STL trong ${dir}`);
  const s = (model.unitScale ?? 0.001); // mm → m

  // 1) Đọc + đổi trục: CAD (x, y, z↑) → glTF (x, y↑, z) = (x, z, -y)
  const parts = files.map((f) => {
    const raw = readStl(path.join(dir, f));
    const pos = new Float32Array(raw.length);
    for (let i = 0; i < raw.length; i += 3) { pos[i] = raw[i] * s; pos[i + 1] = raw[i + 2] * s; pos[i + 2] = -raw[i + 1] * s; }
    return { name: path.basename(f, path.extname(f)), pos };
  });

  // 2) Căn giữa theo X/Z, đáy chạm sàn
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const { pos } of parts) for (let i = 0; i < pos.length; i++) { const k = i % 3; min[k] = Math.min(min[k], pos[i]); max[k] = Math.max(max[k], pos[i]); }
  const shift = [-(min[0] + max[0]) / 2, -min[1], -(min[2] + max[2]) / 2];
  for (const { pos } of parts) for (let i = 0; i < pos.length; i++) pos[i] += shift[i % 3];

  // 3) Dựng glTF: mỗi file STL = 1 node, chất liệu theo models.json
  const doc = new Document();
  const buffer = doc.createBuffer();
  const mats = {};
  const material = (key) => (mats[key] ??= (() => {
    const m = config.materials[key];
    if (!m) throw new Error(`Chưa khai báo chất liệu "${key}" trong models.json`);
    return doc.createMaterial(key).setBaseColorFactor(linear(m.color)).setRoughnessFactor(m.roughness ?? 0.8).setMetallicFactor(m.metalness ?? 0);
  })());
  const root = doc.createNode(model.out);
  doc.createScene(model.out).addChild(root);
  let tris = 0;
  for (const { name, pos } of parts) {
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
      .setMaterial(material(model.parts?.[name] ?? model.default ?? 'body'));
    root.addChild(doc.createNode(name).setMesh(doc.createMesh(name).addPrimitive(prim)));
  }

  // 4) Tối ưu: hàn đỉnh → giảm đa giác (nếu cần) → nén meshopt; giảm tiếp nếu vẫn > 5MB
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
      fs.mkdirSync(OUT, { recursive: true });
      fs.writeFileSync(path.join(OUT, `${model.out}.glb`), glb);
      const size = max.map((v, k) => ((v - min[k]) * 100).toFixed(1));
      console.log(`✔ ${model.out}.glb  ${(glb.byteLength / 1024).toFixed(0)} KB  ${files.length} bộ phận  ${tris} tam giác` +
        `${ratio < 1 ? ` → giảm còn ~${Math.round(tris * ratio)}` : ''}  kích thước ${size[0]}×${size[2]}×${size[1]} cm (rộng×sâu×cao)`);
      if (glb.byteLength > MAX_BYTES) console.warn(`  ⚠ vẫn lớn hơn 5MB`);
      return;
    }
    ratio *= 0.6;
  }
}

for (const model of config.models) await build(model);
