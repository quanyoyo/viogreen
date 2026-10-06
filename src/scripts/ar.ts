// Xem 3D / AR bằng <model-viewer> (Google). Chỉ tải thư viện khi sản phẩm đã có file 3D.
// Khai báo file trong src/data/products.ts: model: { glb: '/models/x10-sol.glb', usdz: '/models/x10-sol.usdz' }
import { clientProducts } from './data';
import { $, $$, openLayer, closeLayer } from './ui';

const MV_SRC = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@4.3.1/dist/model-viewer.min.js';
const bySlug = Object.fromEntries(clientProducts.map((p) => [p.slug, p]));
const modal = $('[data-ar-modal]');
let mvLoaded: Promise<void> | null = null;

const loadModelViewer = () =>
  (mvLoaded ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.type = 'module';
    s.src = MV_SRC;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.append(s);
  }));

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

async function openAR(slug: string) {
  const p = bySlug[slug];
  if (!modal || !p) return;
  const stage = $('[data-ar-stage]', modal)!;
  const hint = $('[data-ar-hint]', modal)!;
  $('[data-ar-title]', modal)!.textContent = p.shortName;

  if (p.model) {
    stage.innerHTML = `<div class="flex aspect-square items-center justify-center text-sm text-muted sm:aspect-[4/3]">Đang tải mô hình 3D…</div>`;
    hint.textContent = 'Kéo để xoay 360°, chụm hai ngón để phóng to. Trên điện thoại bấm “Xem trong không gian của bạn”.';
    openLayer(modal);
    try {
      await loadModelViewer();
      stage.innerHTML = `<model-viewer src="${esc(p.model.glb)}" ${p.model.usdz ? `ios-src="${esc(p.model.usdz)}"` : ''}
        alt="Mô hình 3D ${esc(p.shortName)}" ar ar-modes="webxr scene-viewer quick-look" ar-placement="floor"
        camera-controls auto-rotate shadow-intensity="1" touch-action="pan-y"
        style="width:100%;aspect-ratio:4/3;background:var(--color-cream)">
        <button slot="ar-button" class="btn btn-primary absolute bottom-4 left-1/2 -translate-x-1/2">Xem trong không gian của bạn</button>
      </model-viewer>`;
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
    if (t.closest('[data-ar-close]') && !modal.hidden) { closeLayer(modal); $('[data-ar-stage]', modal)!.innerHTML = ''; }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) $$('[data-ar-close]', modal)[0]?.click();
  });
}
