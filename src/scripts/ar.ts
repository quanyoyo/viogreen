// Xem 3D / AR bằng <model-viewer> (Google). Chỉ tải thư viện khi sản phẩm đã có file 3D.
// Khai báo file trong src/data/products.ts: model: { glb: '/models/ecohub-sol-plus.glb' } (usdz tuỳ chọn — không có thì model-viewer tự tạo cho iPhone).
// File GLB tạo bằng `npm run models` từ STL trong models-src/ (xem scripts/stl-to-glb.mjs).
import { clientProducts } from './data';
import { $, $$, openLayer, closeLayer } from './ui';

const MV_SRC = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@4.3.1/dist/model-viewer.min.js';
// File GLB do `npm run models` xuất ra được nén meshopt. model-viewer có sẵn bộ giải nén, nhưng chỉ bật khi khai báo
// meshoptDecoderLocation: nó nạp file này bằng <script> thường rồi dùng bộ giải nén có sẵn. Vì vậy file phải là script
// thường hợp lệ – dùng bản UMD tự host (chép từ node_modules/meshoptimizer/meshopt_decoder.cjs, v1.3.0).
// Không dùng bản .mjs trên CDN (lỗi "Unexpected token 'export'") hay .cjs trên jsDelivr (bị chặn vì sai kiểu MIME).
const MESHOPT_SRC = '/vendor/meshopt_decoder.js';
const bySlug = Object.fromEntries(clientProducts.map((p) => [p.slug, p]));
const modal = $('[data-ar-modal]');
let mvLoaded: Promise<void> | null = null;

const loadModelViewer = () =>
  (mvLoaded ??= new Promise<void>((resolve, reject) => {
    // Cấu hình phải có trước khi thư viện chạy
    (self as unknown as { ModelViewerElement: Record<string, string> }).ModelViewerElement = { meshoptDecoderLocation: MESHOPT_SRC };
    const s = document.createElement('script');
    s.type = 'module';
    s.src = MV_SRC;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.append(s);
  }));

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

// Trên iPhone, chế độ ướm (AR Quick Look của Apple) chỉ chạy trong Safari (chủ web kiểm chứng 12/11/2026).
// Trong mã model-viewer: điều kiện bật quick-look là `Gd && !kd && (!Od || ios-src != null)`, với Od = Chrome /
// Edge / Firefox / DuckDuckGo / ứng dụng Google trên iPhone. Tức các trình duyệt đó chỉ chạy được nếu web tự
// cung cấp sẵn file .usdz qua `ios-src`; web đang để model-viewer tự chuyển đổi nên nút bị ẩn ở đó.
const laIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const iosKhongPhaiSafari = laIOS && /CriOS\/|EdgiOS\/|FxiOS\/|GSA\/|DuckDuckGo\//.test(navigator.userAgent);

/**
 * Chrome / Edge / Firefox trên iPhone chỉ ướm được khi web đưa sẵn file .usdz.
 * File này nặng hơn hẳn GLB (vài MB vì ghi hình khối dạng chữ) nên không gắn mặc định:
 * mời Safari trước, ai vẫn muốn dùng trình duyệt hiện tại thì bấm nút để tải.
 */
async function moiTaiUsdz(mv: HTMLElement & { canActivateAR?: boolean }, usdz: string, hint: Element) {
  const chon = $('[data-ar-chon]', modal!) as HTMLElement | null;
  if (!chon) return;
  let mb = '';
  try {
    const n = +((await fetch(usdz, { method: 'HEAD' })).headers.get('content-length') ?? 0);
    if (n) mb = ` ~${(n / 1048576).toFixed(1)} MB`;
  } catch { /* không đọc được dung lượng thì thôi, vẫn cho bấm */ }
  chon.innerHTML = `<button type="button" class="btn btn-light" data-tai-usdz>Vẫn dùng trình duyệt này (tải thêm${esc(mb)})</button>`;
  chon.hidden = false;
  $('[data-tai-usdz]', chon)!.addEventListener('click', async (e) => {
    const nut = e.currentTarget as HTMLButtonElement;
    nut.disabled = true;
    nut.textContent = 'Đang tải…';
    hint.textContent = CHI_DAN.dangTai;
    try {
      // tải trước để khách biết đã xong, rồi mới giao đường dẫn cho model-viewer
      if (!(await fetch(usdz)).ok) throw new Error('tải hỏng');
      mv.setAttribute('ios-src', usdz);
      for (let i = 0; i < 80 && !mv.canActivateAR; i++) await new Promise((r) => setTimeout(r, 100));
      if (!mv.canActivateAR) throw new Error('vẫn không bật được');
      chon.hidden = true;
      hint.textContent = CHI_DAN.sanSang;
    } catch {
      hint.textContent = CHI_DAN.loi;
      chon.hidden = true;
    }
  }, { once: true });
}

/** Dòng hướng dẫn dưới khung xem, tuỳ máy có ướm được AR hay không */
const CHI_DAN = {
  co: 'Kéo để xoay 360°, chụm hai ngón để phóng to. Bấm “Xem trong không gian của bạn” để ướm máy vào chỗ bạn định đặt.',
  iosKhacSafari: 'Kéo để xoay 360°, chụm hai ngón để phóng to. Trên iPhone, chế độ ướm vào không gian thật '
    + 'chạy sẵn trong Safari – mở lại trang này bằng Safari là bấm được ngay, không phải tải thêm gì.',
  dangTai: 'Đang chuẩn bị file cho trình duyệt này…',
  sanSang: 'Đã sẵn sàng. Bấm “Xem trong không gian của bạn” để ướm máy vào chỗ bạn định đặt.',
  loi: 'Không tải được file cho trình duyệt này. Bạn mở lại trang bằng Safari giúp nhé.',
  khong: 'Kéo để xoay 360°, lăn chuột hoặc chụm hai ngón để phóng to. Muốn ướm máy vào không gian thật, hãy mở trang này '
    + 'trên điện thoại: iPhone mở bằng Safari (đang ở trong Zalo hay Facebook thì bấm ⋯ rồi chọn “Mở trong Safari”), '
    + 'Android dùng Chrome và cần cài “Google Play Services for AR”.',
};

async function openAR(slug: string) {
  const p = bySlug[slug];
  if (!modal || !p) return;
  const stage = $('[data-ar-stage]', modal)!;
  const hint = $('[data-ar-hint]', modal)!;
  const chon = $('[data-ar-chon]', modal)!; chon.hidden = true; chon.innerHTML = '';
  $('[data-ar-title]', modal)!.textContent = p.shortName;

  if (p.model) {
    stage.innerHTML = `<div class="flex aspect-square items-center justify-center text-sm text-muted sm:aspect-[4/3]">Đang tải mô hình 3D…</div>`;
    hint.textContent = 'Kéo để xoay 360°, chụm hai ngón để phóng to.';
    openLayer(modal);
    try {
      await loadModelViewer();
      stage.innerHTML = `<model-viewer src="${esc(p.model.glb)}"
        alt="Mô hình 3D ${esc(p.shortName)}" ar ar-modes="webxr scene-viewer quick-look" ar-placement="floor"
        camera-controls auto-rotate shadow-intensity="1" touch-action="pan-y"
        style="display:block;width:100%;height:auto;aspect-ratio:4/3;background:var(--color-cream)">
        <button slot="ar-button" class="btn btn-primary absolute bottom-4 left-1/2 -translate-x-1/2">Xem trong không gian của bạn</button>
      </model-viewer>`;
      // Máy không ướm được AR thì model-viewer tự ẩn nút → dòng hướng dẫn phải nói đúng, nếu không khách
      // tưởng web hỏng. Máy tính không bao giờ có AR; trên iPhone, trình duyệt trong Zalo / Facebook cũng không.
      // canActivateAR chỉ đúng sau khi model tải xong, nên phải đợi sự kiện "load".
      const mv = $('model-viewer', stage) as (HTMLElement & { canActivateAR?: boolean; loaded?: boolean }) | null;
      const datChiDan = () => {
        hint.textContent = iosKhongPhaiSafari ? CHI_DAN.iosKhacSafari : mv?.canActivateAR ? CHI_DAN.co : CHI_DAN.khong;
        if (iosKhongPhaiSafari && mv && p.model?.usdz) moiTaiUsdz(mv, p.model.usdz, hint);
      };
      if (mv?.loaded) datChiDan(); else mv?.addEventListener('load', datChiDan, { once: true });
    } catch {
      stage.innerHTML = `<p class="p-8 text-center text-muted">Không tải được trình xem 3D. Vui lòng kiểm tra kết nối mạng và thử lại.</p>`;
    }
    return;
  }

  // Chưa có file 3D
  stage.innerHTML = `
    <div class="flex flex-col items-center gap-4 px-6 py-12 text-center">
      <span class="relative inline-flex size-20 items-center justify-center rounded-3xl bg-brand text-white shadow-lift">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="size-10" aria-hidden="true"><path d="M21 16V8l-9-5-9 5v8l9 5 9-5z"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/></svg>
        <span class="absolute inset-0 animate-pulse-ring rounded-3xl bg-brand/40"></span>
      </span>
      <p class="text-lg font-bold">Mô hình 3D đang được cập nhật</p>
      <p class="max-w-md text-sm text-muted">Tính năng ướm thử AR cho ${esc(p.shortName)} sẽ sớm ra mắt. Trong lúc chờ, MIO có thể tư vấn kích thước và cách bố trí phù hợp không gian của bạn.</p>
      <div class="flex flex-col gap-2 sm:flex-row">
        <button type="button" class="btn btn-primary" data-open-chat data-ar-close>Hỏi MIO</button>
        <a class="btn btn-outline" href="/san-pham/${p.slug}/">Xem chi tiết</a>
      </div>
    </div>`;
  hint.textContent = '';
  openLayer(modal);
}

if (modal) {
  document.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    const btn = t.closest<HTMLElement>('[data-ar]');
    if (btn) { e.preventDefault(); openAR(btn.dataset.ar!); return; }
    if (t.closest('[data-ar-close]') && !modal.hidden) { closeLayer(modal); $('[data-ar-stage]', modal)!.innerHTML = ''; const c = $('[data-ar-chon]', modal)!; c.hidden = true; c.innerHTML = ''; }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) $$('[data-ar-close]', modal)[0]?.click();
  });
}
