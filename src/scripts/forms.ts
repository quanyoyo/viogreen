// Gửi form (đặt hàng, liên hệ, nhận tin, lead chatbot) vào Firestore.
// SDK Firebase chỉ được tải khi cần (`import('./fb')`) để các trang khác vẫn nhẹ.
// Chưa cấu hình site.firebase.projectId = chế độ thử: không gửi dữ liệu đi.
import { site } from '../data/site';
import { readCart, clearCart, totals, productBySlug } from './cart';
import { $, $$, toast } from './ui';

const SAVED = 'vg-customer';
const PHONE_RE = /^(\+?84|0)\d{9,10}$/;
export const firebaseOn = Boolean(site.firebase.projectId);
const loadFb = () => import('./fb');

const setMsg = (form: HTMLFormElement, text: string, state: 'ok' | 'error' | '' = '') => {
  const m = $('[data-form-msg]', form);
  if (m) { m.textContent = text; m.dataset.state = state; }
};
const cleanPhone = (s: string) => s.replace(/[\s().-]/g, '');

/** Lưu liên hệ / nhận tin / lead chatbot. Trả về true nếu thành công. */
export async function submitLead(type: 'contact' | 'newsletter' | 'chat-lead', data: Record<string, string>): Promise<boolean> {
  const payload: Record<string, string> = { page: location.pathname };
  for (const [k, v] of Object.entries(data)) if (v) payload[k] = k === 'phone' ? cleanPhone(v) : k === 'email' ? v.trim().toLowerCase() : v;
  if (!firebaseOn) {
    console.info('[VIO GREEN] Chế độ thử – chưa cấu hình Firebase. Dữ liệu:', type, payload);
    await new Promise((r) => setTimeout(r, 500));
    return true;
  }
  try {
    await (await loadFb()).createLead(type, payload);
    return true;
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
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const rnd = [...crypto.getRandomValues(new Uint8Array(4))].map((n) => abc[n % abc.length]).join('');
  return `VG-${ymd}-${rnd}`;
};

function validate(form: HTMLFormElement): boolean {
  const phone = form.elements.namedItem('phone') as HTMLInputElement | null;
  if (phone) phone.setCustomValidity(phone.value && !PHONE_RE.test(cleanPhone(phone.value)) ? 'Số điện thoại chưa đúng' : '');
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

const fill = (form: HTMLFormElement, values: Record<string, unknown>, onlyEmpty = false) =>
  Object.entries(values).forEach(([k, v]) => {
    const el = form.elements.namedItem(k) as HTMLInputElement | null;
    if (!el || !('value' in el) || el.type === 'radio' || el.type === 'checkbox' || !v) return;
    if (!onlyEmpty || !el.value) el.value = String(v);
  });

/** Trang đặt hàng: điền sẵn thông tin + báo trạng thái đăng nhập */
async function setupOrderForm(form: HTMLFormElement) {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVED) || 'null');
    if (saved) { fill(form, saved); (form.elements.namedItem('remember') as HTMLInputElement).checked = true; }
  } catch { /* ignore */ }
  const hint = $('[data-auth-hint]');
  if (!firebaseOn || !hint) return;
  const fb = await loadFb();
  const user = await fb.currentUser();
  if (!user) { hint.hidden = false; return; }
  const who = $('[data-auth-who]');
  if (who) { who.textContent = user.email || user.displayName || ''; who.parentElement!.hidden = false; }
  fill(form, { name: user.displayName, email: user.email }, true);
  try { fill(form, { ...(await fb.getProfile(user.uid)) }, true); } catch { /* ignore */ }
}

$$<HTMLFormElement>('form[data-form]').forEach((form) => {
  const type = form.dataset.form as 'order' | 'contact' | 'newsletter';
  form.addEventListener('input', (e) => (e.target as HTMLElement).removeAttribute('aria-invalid'));
  if (type === 'order') setupOrderForm(form);

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
      const order = {
        orderId: id,
        name: data.name.trim(), phone: cleanPhone(data.phone), email: (data.email || '').trim().toLowerCase(),
        province: data.province.trim(), ward: data.ward.trim(), address: data.address.trim(),
        shipping: data.shipping || '', note: (data.note || '').trim(),
        items: lines.map((l) => ({ slug: l.slug, name: productBySlug[l.slug].shortName, variant: l.variant || '', qty: l.qty, price: productBySlug[l.slug].price ?? null })),
        totalQty: t.qty, total: t.sum, page: location.pathname,
      };
      if (!firebaseOn) {
        console.info('[VIO GREEN] Chế độ thử – chưa cấu hình Firebase. Đơn:', order);
        ok = true;
      } else {
        try { await (await loadFb()).createOrder(order); ok = true; } catch (err) { console.error(err); }
      }
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
      ok = await submitLead(type, data);
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
