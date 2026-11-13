// Xuất sẵn file .usdz (định dạng AR của Apple) cho từng model, để Chrome / Edge / Firefox trên iPhone
// cũng ướm được. Safari không cần file này: model-viewer tự chuyển đổi từ GLB ngay trên máy, nhẹ hơn nhiều.
// Vì vậy web chỉ dùng .usdz khi khách chủ động chọn (xem src/scripts/ar.ts).
//
// Chạy: npm run models:usdz            (tất cả model trong public/models, bỏ các file *-tam nếu muốn: thêm tên)
//       npm run models:usdz -- ecohub-sol-pro
//
// Cách làm: mở model-viewer trong Edge chạy ngầm rồi gọi chính hàm mv.prepareUSDZ() của nó – đúng bằng
// file mà iPhone vẫn tự tạo, nên không sợ lệch. Cần Microsoft Edge (có sẵn trên Windows).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIR = path.join(ROOT, 'public', 'models');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const MV = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@4.3.1/dist/model-viewer.min.js';

const chon = process.argv.slice(2);
const ten = fs.readdirSync(DIR).filter((f) => f.endsWith('.glb')).map((f) => f.replace(/\.glb$/, ''))
  .filter((n) => !chon.length || chon.includes(n));
if (!ten.length) { console.error('Không có model nào khớp:', chon.join(', ')); process.exit(1); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PORT = 9700 + Math.floor(Math.random() * 200);
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'usdz-'));
const proc = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${prof}`,
  '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-first-run', '--no-default-browser-check',
  '--window-size=900,900', 'about:blank'], { stdio: 'ignore' });

let ws, id = 0; const pending = new Map();
const send = (method, params = {}) => new Promise((ok, fail) => { const i = ++id; pending.set(i, { ok, fail }); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error('JS: ' + (r.exceptionDetails.exception?.description ?? r.exceptionDetails.text));
  return r.result.value;
};

// Trang trống chỉ để nạp model-viewer; bộ giải nén meshopt lấy từ public/vendor như trên web thật
const TRANG = 'data:text/html;charset=utf-8,' + encodeURIComponent(`<!doctype html><meta charset="utf-8">
<script>self.ModelViewerElement = { meshoptDecoderLocation: 'MESHOPT' };</script>
<script type="module" src="${MV}"></script>
<body><model-viewer id="mv" style="width:600px;height:600px"></model-viewer></body>`);

try {
  let target;
  for (let i = 0; i < 60 && !target; i++) { await sleep(500); try { const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); target = list.find((t) => t.type === 'page'); } catch {} }
  if (!target) throw new Error('Không mở được Edge chạy ngầm');
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((ok, fail) => { ws.onopen = ok; ws.onerror = fail; });
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { const p = pending.get(d.id); pending.delete(d.id); d.error ? p.fail(new Error(d.error.message)) : p.ok(d.result); } };
  await send('Page.enable');
  const meshopt = 'data:text/javascript;base64,' + fs.readFileSync(path.join(ROOT, 'public', 'vendor', 'meshopt_decoder.js')).toString('base64');
  await send('Page.navigate', { url: TRANG.replace('MESHOPT', encodeURIComponent(meshopt)) });
  for (let i = 0; i < 120; i++) { await sleep(500); if (await evaluate("!!customElements.get('model-viewer')")) break; }

  for (const n of ten) {
    const glb = fs.readFileSync(path.join(DIR, `${n}.glb`)).toString('base64');
    const b64 = await evaluate(`(async () => {
      const mv = document.getElementById('mv');
      const bin = atob(${JSON.stringify(glb)}), u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      await new Promise((ok, fail) => {
        mv.addEventListener('load', ok, { once: true });
        mv.addEventListener('error', () => fail(new Error('không đọc được GLB')), { once: true });
        mv.src = URL.createObjectURL(new Blob([u8], { type: 'model/gltf-binary' }));
      });
      const url = await mv.prepareUSDZ();
      const buf = new Uint8Array(await (await fetch(url)).arrayBuffer());
      let t = ''; for (let i = 0; i < buf.length; i++) t += String.fromCharCode(buf[i]);
      return btoa(t);
    })()`);
    const file = path.join(DIR, `${n}.usdz`);
    fs.writeFileSync(file, Buffer.from(b64, 'base64'));
    console.log(`✔ ${n}.usdz  ${(fs.statSync(file).size / 1024 / 1024).toFixed(1)} MB`);
  }
} finally {
  try { ws?.close(); } catch {}
  proc.kill();
  await sleep(800);
  try { fs.rmSync(prof, { recursive: true, force: true }); } catch {}
}
