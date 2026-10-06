// Hiệu ứng & tương tác chung: reveal khi cuộn, menu mobile, carousel, toast, số lượng, biến thể.

export const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s);
export const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => [...root.querySelectorAll<T>(s)];

/* ---------- Toast ---------- */
let toastTimer: number | undefined;
export function toast(msg: string, ms = 2600) {
  const el = $('[data-toast]');
  if (!el) return;
  el.textContent = msg;
  el.setAttribute('data-show', '');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.removeAttribute('data-show'), ms);
}

/* ---------- Mở/đóng lớp phủ (drawer, chat, modal) ---------- */
let lastFocus: HTMLElement | null = null;
export function openLayer(el: HTMLElement, ...animated: HTMLElement[]) {
  lastFocus = document.activeElement as HTMLElement;
  el.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => [el, ...animated].forEach((a) => a.setAttribute('data-open', ''))));
}
export function closeLayer(el: HTMLElement, ...animated: HTMLElement[]) {
  [el, ...animated].forEach((a) => a.removeAttribute('data-open'));
  window.setTimeout(() => (el.hidden = true), 280);
  lastFocus?.focus?.();
}

/* ---------- Reveal on scroll ---------- */
const io = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io!.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
  : null;
export const observeReveal = (root: ParentNode = document) =>
  $$('[data-reveal]:not(.is-visible)', root).forEach((el) => (io ? io.observe(el) : el.classList.add('is-visible')));
observeReveal();

/* ---------- Header: thu gọn khi cuộn ---------- */
const topbar = $('[data-topbar]');
const onScroll = () => topbar?.classList.toggle('py-0', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });

/* ---------- Menu mobile ---------- */
const drawer = $('[data-drawer]');
const panel = $('[data-drawer-panel]');
const backdrop = $('[data-drawer-backdrop]');
const menuBtn = $('[data-menu-open]');
if (drawer && panel && backdrop) {
  menuBtn?.addEventListener('click', () => {
    openLayer(drawer, panel, backdrop);
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    setTimeout(() => $<HTMLInputElement>('input', panel)?.focus(), 300);
  });
  $$('[data-menu-close]', drawer).forEach((b) => b.addEventListener('click', () => {
    closeLayer(drawer, panel, backdrop);
    menuBtn?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }));
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && drawer && !drawer.hidden) $('[data-menu-close]', drawer)?.click();
});

/* ---------- Carousel trang chủ ---------- */
$$('[data-carousel]').forEach((root) => {
  const slides = $$('[data-slide]', root);
  const dots = $$<HTMLButtonElement>('[data-dot]', root);
  if (slides.length < 2) return;
  let i = 0;
  let timer: number | undefined;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const show = (n: number) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => {
      const on = k === i;
      s.classList.toggle('opacity-0', !on);
      s.classList.toggle('translate-y-4', !on);
      s.classList.toggle('pointer-events-none', !on);
      s.classList.toggle('opacity-100', on);
      s.setAttribute('aria-hidden', String(!on));
      $$<HTMLElement>('a,button', s).forEach((a) => (on ? a.removeAttribute('tabindex') : (a.tabIndex = -1)));
    });
    dots.forEach((d, k) => d.setAttribute('aria-selected', String(k === i)));
  };
  const play = () => { if (!reduce) { clearInterval(timer); timer = window.setInterval(() => show(i + 1), 6000); } };
  dots.forEach((d) => d.addEventListener('click', () => { show(Number(d.dataset.dot)); play(); }));
  root.addEventListener('mouseenter', () => clearInterval(timer));
  root.addEventListener('mouseleave', play);
  root.addEventListener('focusin', () => clearInterval(timer));
  // vuốt trên điện thoại
  let x0: number | null = null;
  root.addEventListener('touchstart', (e) => (x0 = e.touches[0].clientX), { passive: true });
  root.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) { show(i + (dx < 0 ? 1 : -1)); play(); }
    x0 = null;
  });
  play();
});

/* ---------- Ô số lượng & biến thể (trang chi tiết) ---------- */
$$('[data-qty]').forEach((box) => {
  const input = $<HTMLInputElement>('[data-qty-input]', box)!;
  const clamp = (v: number) => Math.min(99, Math.max(1, v || 1));
  $('[data-qty-minus]', box)?.addEventListener('click', () => (input.value = String(clamp(+input.value - 1))));
  $('[data-qty-plus]', box)?.addEventListener('click', () => (input.value = String(clamp(+input.value + 1))));
  input.addEventListener('change', () => (input.value = String(clamp(+input.value))));
});
$$('[role="radiogroup"]').forEach((group) => {
  const opts = $$<HTMLButtonElement>('[data-variant]', group);
  opts.forEach((b) => b.addEventListener('click', () => opts.forEach((o) => o.setAttribute('aria-checked', String(o === b)))));
});
