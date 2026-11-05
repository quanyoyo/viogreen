// Trang chi tiết sản phẩm: đổi ảnh trong khung ảnh, khung xem ảnh phóng to, giá theo lựa chọn, chọn sẵn dòng máy (?may=).
import { $, $$, openLayer, closeLayer } from './ui';

const vnd = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' ₫';

/* ---------- Ảnh nhỏ → ảnh lớn ---------- */
const main = $<HTMLButtonElement>('[data-gallery-main]');
const mainImg = $<HTMLImageElement>('[data-gallery-img]');
const thumbs = $$<HTMLButtonElement>('[data-thumb]');
thumbs.forEach((t) => t.addEventListener('click', () => {
  if (!main || !mainImg) return;
  mainImg.src = t.dataset.src!;
  if (t.dataset.srcset) mainImg.srcset = t.dataset.srcset; else mainImg.removeAttribute('srcset');
  main.dataset.zoomOpen = t.dataset.thumb;
  thumbs.forEach((o) => o.setAttribute('aria-current', String(o === t)));
}));

/* ---------- Giá theo lựa chọn (ECOBOX: Máy S / Plus / Pro) ---------- */
const box = $('[data-price-box]');
const prices: (number | null)[] | null = box?.dataset.prices ? JSON.parse(box.dataset.prices) : null;
const options = $$<HTMLButtonElement>('[data-pdp] [data-variant]');
function showPrice() {
  if (!box || !prices) return;
  const i = Math.max(0, options.findIndex((o) => o.getAttribute('aria-checked') === 'true'));
  const price = prices[i] ?? null;
  const text = $('[data-price-text]', box)!;
  text.textContent = price ? vnd(price) : box.dataset.fallback || 'Liên hệ';
  text.classList.toggle('text-ink', !!price);
  text.classList.toggle('text-brand', !price);
  $('[data-price-note]', box)!.hidden = !!price;
}
// ui.ts đổi aria-checked trên chính nút trước, sự kiện nổi lên document sau → đọc được lựa chọn mới
document.addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('[data-pdp] [data-variant]')) showPrice(); });

// Link từ trang máy ECOHUB: /san-pham/bio-tank/?may=pro → chọn sẵn "Máy Pro"
const may = new URLSearchParams(location.search).get('may')?.toLowerCase();
if (may) options.find((o) => o.dataset.variant?.toLowerCase().endsWith(' ' + may))?.click();

/* ---------- Khung xem ảnh phóng to ---------- */
const lb = $('[data-lightbox]');
if (lb) {
  const list: string[] = JSON.parse(lb.dataset.images || '[]');
  const stage = $('[data-lb-stage]', lb)!;
  const img = $<HTMLImageElement>('[data-lb-img]', lb)!;
  const count = $('[data-lb-count]', lb)!;
  const level = $('[data-lb-level]', lb)!;
  const MIN = 1, MAX = 4;
  let idx = 0, s = 1, tx = 0, ty = 0;

  const clamp = () => {
    const maxX = Math.max(0, (img.offsetWidth * s - stage.clientWidth) / 2);
    const maxY = Math.max(0, (img.offsetHeight * s - stage.clientHeight) / 2);
    tx = Math.min(maxX, Math.max(-maxX, tx));
    ty = Math.min(maxY, Math.max(-maxY, ty));
  };
  const apply = () => {
    clamp();
    img.style.transform = `translate(-50%, -50%) translate(${tx}px, ${ty}px) scale(${s})`;
    level.textContent = Math.round(s * 100) + '%';
    stage.style.cursor = s > 1 ? 'grab' : 'zoom-in';
  };
  /** Phóng/thu quanh điểm (x, y) tính từ tâm khung; điểm ảnh dưới con trỏ giữ nguyên chỗ */
  const zoomTo = (next: number, x = 0, y = 0) => {
    next = Math.min(MAX, Math.max(MIN, next));
    tx = x - ((x - tx) * next) / s;
    ty = y - ((y - ty) * next) / s;
    s = next;
    if (s === 1) tx = ty = 0;
    apply();
  };
  const fromCenter = (cx: number, cy: number) => {
    const r = stage.getBoundingClientRect();
    return [cx - r.left - r.width / 2, cy - r.top - r.height / 2] as const;
  };
  const show = (i: number) => {
    idx = (i + list.length) % list.length;
    s = 1; tx = ty = 0;
    img.src = list[idx];
    count.textContent = list.length > 1 ? `${idx + 1} / ${list.length}` : '';
    apply();
  };
  const open = (i: number) => {
    show(i);
    openLayer(lb);
    document.body.style.overflow = 'hidden';
    setTimeout(() => $<HTMLButtonElement>('[data-lb-close]', lb)?.focus(), 50);
  };
  const close = () => { closeLayer(lb); document.body.style.overflow = ''; };

  document.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-zoom-open]');
    if (t) open(Number(t.dataset.zoomOpen) || 0);
  });
  $('[data-lb-close]', lb)!.addEventListener('click', close);
  $$<HTMLButtonElement>('[data-lb-step]', lb).forEach((b) => b.addEventListener('click', () => show(idx + Number(b.dataset.lbStep))));
  $$<HTMLButtonElement>('[data-lb-zoom]', lb).forEach((b) => b.addEventListener('click', () => zoomTo(s * (Number(b.dataset.lbZoom) > 0 ? 1.5 : 1 / 1.5))));
  img.addEventListener('load', apply);
  window.addEventListener('resize', () => !lb.hidden && apply());

  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight' && list.length > 1) show(idx + 1);
    else if (e.key === 'ArrowLeft' && list.length > 1) show(idx - 1);
    else if (e.key === '+' || e.key === '=') zoomTo(s * 1.5);
    else if (e.key === '-') zoomTo(s / 1.5);
  });

  // Cuộn chuột để phóng/thu quanh con trỏ
  stage.addEventListener('wheel', (e) => {
    e.preventDefault();
    zoomTo(s * (e.deltaY < 0 ? 1.2 : 1 / 1.2), ...fromCenter(e.clientX, e.clientY));
  }, { passive: false });
  // Nhấp đúp: 100% ↔ 250%
  stage.addEventListener('dblclick', (e) => zoomTo(s > 1 ? 1 : 2.5, ...fromCenter(e.clientX, e.clientY)));

  // Kéo (1 ngón / chuột) để xem chỗ khác, chụm 2 ngón để phóng/thu
  const pts = new Map<number, { x: number; y: number }>();
  let pinch: { d: number; s: number } | null = null;
  let moved = false;
  const dist = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
  stage.addEventListener('pointerdown', (e) => {
    stage.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved = false;
    if (pts.size === 2) pinch = { d: dist(), s };
  });
  stage.addEventListener('pointermove', (e) => {
    const prev = pts.get(e.pointerId);
    if (!prev) return;
    const cur = { x: e.clientX, y: e.clientY };
    pts.set(e.pointerId, cur);
    if (pinch && pts.size === 2) {
      const [a, b] = [...pts.values()];
      zoomTo((pinch.s * dist()) / pinch.d, ...fromCenter((a.x + b.x) / 2, (a.y + b.y) / 2));
      moved = true;
    } else if (pts.size === 1 && s > 1) {
      tx += cur.x - prev.x; ty += cur.y - prev.y;
      if (Math.abs(cur.x - prev.x) + Math.abs(cur.y - prev.y) > 1) moved = true;
      apply();
    }
  });
  const end = (e: PointerEvent) => {
    pts.delete(e.pointerId);
    if (pts.size < 2) pinch = null;
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);
  // Bấm ra ngoài ảnh (khi chưa phóng to) để đóng
  stage.addEventListener('click', (e) => { if (!moved && s === 1 && e.target === stage) close(); });
}
