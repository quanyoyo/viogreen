// Giỏ hàng lưu trên trình duyệt (localStorage) — không cần server.
import { clientProducts, type ClientProduct } from './data';
import { site } from '../data/site';
import { $, $$, toast } from './ui';

export interface CartLine { slug: string; qty: number; variant?: string }
const KEY = 'vg-cart';
const bySlug = Object.fromEntries(clientProducts.map((p) => [p.slug, p])) as Record<string, ClientProduct>;

const safe = <T>(fn: () => T, fallback: T): T => { try { return fn(); } catch { return fallback; } };

export const readCart = (): CartLine[] =>
  safe(() => (JSON.parse(localStorage.getItem(KEY) || '[]') as CartLine[]).filter((l) => bySlug[l.slug] && l.qty > 0), []);
const writeCart = (lines: CartLine[]) => {
  safe(() => localStorage.setItem(KEY, JSON.stringify(lines)), undefined);
  render();
  window.dispatchEvent(new CustomEvent('cart:change'));
};
export const clearCart = () => writeCart([]);

const sameLine = (a: CartLine, slug: string, variant?: string) => a.slug === slug && (a.variant || '') === (variant || '');

export function addToCart(slug: string, qty = 1, variant?: string) {
  const lines = readCart();
  const line = lines.find((l) => sameLine(l, slug, variant));
  if (line) line.qty = Math.min(99, line.qty + qty);
  else lines.push({ slug, qty, ...(variant ? { variant } : {}) });
  writeCart(lines);
}
const setQty = (idx: number, qty: number) => {
  const lines = readCart();
  if (!lines[idx]) return;
  if (qty <= 0) lines.splice(idx, 1);
  else lines[idx].qty = Math.min(99, qty);
  writeCart(lines);
};

/* ---------- Tiền ---------- */
const vnd = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' ₫';
export const priceText = (p: ClientProduct) => (p.price ? vnd(p.price) : site.priceFallback);
export function totals(lines = readCart()) {
  const qty = lines.reduce((s, l) => s + l.qty, 0);
  const allPriced = lines.every((l) => bySlug[l.slug].price);
  const sum = lines.reduce((s, l) => s + (bySlug[l.slug].price || 0) * l.qty, 0);
  return { qty, text: lines.length && allPriced ? vnd(sum) : 'Chờ báo giá', sum: allPriced ? sum : null };
}
export const lineLabel = (l: CartLine) => bySlug[l.slug].shortName + (l.variant ? ` (${l.variant})` : '');
export { bySlug as productBySlug };

/* ---------- Giao diện ---------- */
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const svg = (d: string) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true">${d}</svg>`;
const I = { minus: svg('<path d="M5 12h14"/>'), plus: svg('<path d="M5 12h14M12 5v14"/>'), trash: svg('<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>') };
const thumb = (p: ClientProduct) => p.image
  ? `<img src="${p.image}" alt="" class="size-20 shrink-0 rounded-2xl object-cover" loading="lazy">`
  : `<span class="ph size-20 shrink-0 rounded-2xl p-1 text-[10px] font-bold leading-tight">${esc(p.shortName)}</span>`;

function render() {
  const lines = readCart();
  const t = totals(lines);

  // Badge
  $$('[data-cart-count]').forEach((b) => { b.textContent = String(t.qty); b.hidden = t.qty === 0; });
  $$('[data-cart-qty]').forEach((b) => (b.textContent = String(t.qty)));
  $$('[data-cart-total]').forEach((b) => (b.textContent = t.text));
  $$('[data-cart-empty]').forEach((b) => (b.hidden = lines.length > 0));
  $$('[data-cart-wrap]').forEach((b) => (b.hidden = lines.length === 0));

  // Trang giỏ hàng
  const rows = $('[data-cart-rows]');
  if (rows) {
    rows.innerHTML = lines.map((l, i) => {
      const p = bySlug[l.slug];
      const sub = p.price ? vnd(p.price * l.qty) : site.priceFallback;
      return `<li class="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 py-5 md:grid-cols-[1fr_120px_140px_120px_44px]">
        <div class="flex min-w-0 items-center gap-4">${thumb(p)}
          <div class="min-w-0"><a href="/san-pham/${p.slug}/" class="font-semibold hover:text-brand">${esc(p.shortName)}</a>
          ${l.variant ? `<p class="text-sm text-muted">${esc(l.variant)}</p>` : ''}
          <p class="text-sm text-muted md:hidden">${priceText(p)}</p></div></div>
        <span class="hidden text-sm md:block">${priceText(p)}</span>
        <div class="col-start-1 inline-flex w-fit items-center rounded-full border border-line md:col-start-auto">
          <button type="button" class="inline-flex size-10 items-center justify-center rounded-full hover:bg-brand-50" data-dec="${i}" aria-label="Giảm">${I.minus}</button>
          <span class="w-8 text-center font-semibold" aria-live="polite">${l.qty}</span>
          <button type="button" class="inline-flex size-10 items-center justify-center rounded-full hover:bg-brand-50" data-inc="${i}" aria-label="Tăng">${I.plus}</button></div>
        <span class="text-right font-semibold text-brand md:text-left">${sub}</span>
        <button type="button" class="col-start-2 row-start-1 inline-flex size-10 items-center justify-center justify-self-end rounded-full text-muted hover:bg-red-50 hover:text-red-600 md:col-start-auto md:row-start-auto" data-del="${i}" aria-label="Xóa ${esc(p.shortName)}">${I.trash}</button>
      </li>`;
    }).join('');
  }

  // Tóm tắt ở trang đặt hàng
  const sum = $('[data-summary-rows]');
  if (sum) {
    sum.innerHTML = lines.map((l) => {
      const p = bySlug[l.slug];
      return `<li class="flex items-center gap-3 py-3">${thumb(p).replace(/size-20/g, 'size-14')}
        <div class="min-w-0 flex-1"><p class="truncate text-sm font-semibold">${esc(lineLabel(l))}</p><p class="text-xs text-muted">SL: ${l.qty}</p></div>
        <span class="text-sm font-medium">${p.price ? vnd(p.price * l.qty) : site.priceFallback}</span></li>`;
    }).join('');
  }
}

/* ---------- Sự kiện ---------- */
document.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-add-cart],[data-buy-now],[data-inc],[data-dec],[data-del]');
  if (!el) return;
  const d = el.dataset;
  if (d.inc) return setQty(+d.inc, readCart()[+d.inc].qty + 1);
  if (d.dec) return setQty(+d.dec, readCart()[+d.dec].qty - 1);
  if (d.del) { const name = lineLabel(readCart()[+d.del]); setQty(+d.del, 0); return toast(`Đã xóa ${name}`); }

  const slug = d.addCart || d.buyNow!;
  const pdp = el.closest('[data-pdp]');
  const qty = pdp && (d.withQty !== undefined || d.buyNow) ? Number($<HTMLInputElement>('[data-qty-input]', pdp)?.value) || 1 : 1;
  const variant = (pdp && $('[data-variant][aria-checked="true"]', pdp)?.dataset.variant) || bySlug[slug]?.variants?.[0] || undefined;
  addToCart(slug, qty, variant);
  if (d.buyNow) { location.href = '/dat-hang/'; return; }
  toast(`Đã thêm ${bySlug[slug].shortName}${variant ? ` (${variant})` : ''} vào giỏ`);
  const badge = $('[data-cart-count]');
  badge?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.5)' }, { transform: 'scale(1)' }], { duration: 400 });
});
window.addEventListener('storage', (e) => e.key === KEY && render());
render();
