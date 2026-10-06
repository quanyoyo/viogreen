// Gửi form (đặt hàng, liên hệ, nhận tin) tới Google Apps Script → Google Sheet.
// URL cấu hình ở src/data/site.ts (formEndpoint). Để trống = chế độ thử: không gửi dữ liệu đi.
import { site } from '../data/site';
import { readCart, clearCart, totals, lineLabel, productBySlug } from './cart';
import { $, $$, toast } from './ui';

const SAVED = 'vg-customer';
const PHONE_RE = /^(\+?84|0)\d{9,10}$/;

const setMsg = (form: HTMLFormElement, text: string, state: 'ok' | 'error' | '' = '') => {
  const m = $('[data-form-msg]', form);
  if (m) { m.textContent = text; m.dataset.state = state; }
};

export async function submitToSheet(type: string, data: Record<string, unknown>): Promise<boolean> {
  const payload = { type, ...data, page: location.pathname, sentAt: new Date().toISOString() };
  if (!site.formEndpoint) {
    console.info('[VIO GREEN] Chế độ thử – chưa cấu hình formEndpoint. Dữ liệu:', payload);
    await new Promise((r) => setTimeout(r, 500));
    return true;
  }
  try {
    // text/plain để tránh preflight CORS với Apps Script
    const res = await fetch(site.formEndpoint, { method: 'POST', body: JSON.stringify(payload) });
    const json = await res.json().catch(() => ({ ok: res.ok }));
    return Boolean(json.ok);
  } catch (err) {
    console.error(err);
    return false;
  }
}

const formData = (form: HTMLFormElement) => {
  const fd = new FormData(form);
  const out: Record<string, string> = {};
  for (const key of new Set(fd.keys())) {
    if (key === 'website') continue;
    out[key] = fd.getAll(key).map(String).filter(Boolean).join(', ');
  }
  return out;
};

const orderId = () => {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `VG-${ymd}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
};

function validate(form: HTMLFormElement): boolean {
  const phone = form.elements.namedItem('phone') as HTMLInputElement | null;
  if (phone) phone.setCustomValidity(phone.value && !PHONE_RE.test(phone.value.replace(/[\s().-]/g, '')) ? 'Số điện thoại chưa đúng' : '');
  if (form.checkValidity()) return true;
  const bad = $$<HTMLInputElement>(':invalid', form).filter((el) => el.matches('input,textarea,select'));
  bad.forEach((el) => el.setAttribute('aria-invalid', 'true'));
  bad[0]?.focus();
  const label = bad[0]?.closest('label')?.firstChild?.textContent?.replace('*', '').trim();
  const v = bad[0]?.validity;
  setMsg(form, v?.valueMissing ? `Vui lòng nhập ${label?.toLowerCase() || 'thông tin bắt buộc'}.`
    : v?.customError ? `${bad[0].validationMessage}, vui lòng kiểm tra lại.`
    : `${label || 'Thông tin'} chưa hợp lệ, vui lòng kiểm tra lại.`, 'error');
  return false;
}

$$<HTMLFormElement>('form[data-form]').forEach((form) => {
  const type = form.dataset.form!;
  form.addEventListener('input', (e) => (e.target as HTMLElement).removeAttribute('aria-invalid'));

  // Điền sẵn thông tin đã lưu ở trang đặt hàng
  if (type === 'order') {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVED) || 'null');
      if (saved) {
        Object.entries(saved).forEach(([k, v]) => {
          const el = form.elements.namedItem(k) as HTMLInputElement | null;
          if (el && 'value' in el && el.type !== 'radio' && el.type !== 'checkbox') el.value = String(v);
        });
        (form.elements.namedItem('remember') as HTMLInputElement).checked = true;
      }
    } catch { /* ignore */ }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if ((form.elements.namedItem('website') as HTMLInputElement | null)?.value) return; // bot
    setMsg(form, '');
    if (!validate(form)) return;

    const btn = $<HTMLButtonElement>('button[type="submit"]', form)!;
    const btnHtml = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = 'Đang gửi…';
    const data = formData(form);

    let ok = false;
    if (type === 'order') {
      const lines = readCart();
      if (!lines.length) { setMsg(form, 'Giỏ hàng đang trống.', 'error'); btn.disabled = false; btn.innerHTML = btnHtml; return; }
      const id = orderId();
      const t = totals(lines);
      ok = await submitToSheet('order', {
        orderId: id,
        ...data,
        items: lines.map((l) => `${lineLabel(l)} × ${l.qty}`).join('\n'),
        itemsJson: lines.map((l) => ({ slug: l.slug, name: productBySlug[l.slug].name, variant: l.variant || '', qty: l.qty, price: productBySlug[l.slug].price })),
        totalQty: t.qty,
        total: t.sum ?? 'Chờ báo giá',
      });
      if (ok) {
        try {
          if (data.remember) {
            const { name, phone, email, province, ward, address } = data;
            localStorage.setItem(SAVED, JSON.stringify({ name, phone, email, province, ward, address }));
          } else localStorage.removeItem(SAVED);
          sessionStorage.setItem('vg-last-order', id);
        } catch { /* ignore */ }
        clearCart();
        location.href = `/dat-hang-thanh-cong/?ma=${encodeURIComponent(id)}`;
        return;
      }
    } else {
      ok = await submitToSheet(type, data);
      if (ok) {
        form.reset();
        const msg = type === 'newsletter' ? 'Cảm ơn bạn đã đăng ký nhận tin!' : 'Đã gửi! VIO GREEN sẽ liên hệ lại với bạn sớm nhất.';
        setMsg(form, msg, 'ok');
        toast(msg);
      }
    }
    if (!ok) setMsg(form, `Chưa gửi được, vui lòng thử lại hoặc gọi ${site.phone}.`, 'error');
    btn.disabled = false;
    btn.innerHTML = btnHtml;
  });
});
