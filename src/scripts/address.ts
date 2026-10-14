// Chọn địa chỉ theo danh mục hành chính MỚI (34 tỉnh/thành, 3.321 phường/xã/đặc khu – hiệu lực 01/07/2025).
// Dữ liệu: public/data/dvhc.json (tạo bằng `npm run dvhc`), chỉ tải khi trang có <select data-province>.
// Cách dùng trong form:
//   <select name="province" data-province>…</select>  +  <select name="ward" data-ward>…</select> (ward tuỳ chọn)
// Điền sẵn (thông tin đã lưu, hồ sơ khách): await setAddress(form, 'Hà Nội', 'Phường Ba Đình') – tự khớp tên gần đúng.
import { $$ } from './ui';

type Dvhc = { v: string; p: [string, string[]][] };
let cache: Promise<Dvhc> | null = null;
const loadDvhc = () =>
  (cache ??= fetch('/data/dvhc.json').then((r) => {
    if (!r.ok) throw new Error(`dvhc ${r.status}`);
    return r.json() as Promise<Dvhc>;
  }));

/** So khớp tên không phân biệt dấu và tiền tố ("Hà Nội" = "Thành phố Hà Nội", "Ba Đình" = "Phường Ba Đình") */
const key = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
  .replace(/^(thanh pho|tinh|tp\.?|phuong|xa|dac khu|thi tran)\s+/, '').replace(/\s+/g, ' ').trim();
const find = (list: string[], name?: string | null) => (name ? list.find((x) => x === name) ?? list.find((x) => key(x) === key(name)) : undefined);

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const options = (placeholder: string, list: string[]) =>
  `<option value="">${esc(placeholder)}</option>` + list.map((x) => `<option>${esc(x)}</option>`).join('');

const wardSelect = (form: HTMLElement) => form.querySelector<HTMLSelectElement>('select[data-ward]');

function fillWards(form: HTMLElement, data: Dvhc, province: string) {
  const ward = wardSelect(form);
  if (!ward) return;
  const list = data.p.find(([p]) => p === province)?.[1] ?? [];
  ward.innerHTML = options(list.length ? 'Chọn phường / xã' : 'Chọn tỉnh / thành phố trước', list);
  ward.disabled = !list.length;
}

/** Đặt tỉnh + phường/xã (tên cũ hoặc thiếu tiền tố vẫn khớp được; không khớp thì để trống cho khách chọn) */
export async function setAddress(form: HTMLElement, province?: string | null, ward?: string | null) {
  const sel = form.querySelector<HTMLSelectElement>('select[data-province]');
  if (!sel || !province) return;
  const data = await loadDvhc().catch(() => null);
  if (!data) return;
  await ready(sel);
  const p = find(data.p.map(([n]) => n), province);
  if (!p) return;
  sel.value = p;
  fillWards(form, data, p);
  const wards = data.p.find(([n]) => n === p)![1];
  const w = find(wards, ward);
  const wsel = wardSelect(form);
  if (w && wsel) wsel.value = w;
}

const readyMap = new WeakMap<HTMLSelectElement, Promise<void>>();
const ready = (sel: HTMLSelectElement) => readyMap.get(sel) ?? Promise.resolve();

function init(sel: HTMLSelectElement) {
  if (sel.dataset.dvhcInit) return; // tránh khởi tạo 2 lần khi script được nạp ở nhiều chỗ
  sel.dataset.dvhcInit = '1';
  const form = sel.form ?? sel.closest('form') ?? document.body;
  readyMap.set(sel, loadDvhc().then((data) => {
    const current = sel.value;
    sel.innerHTML = options('Chọn tỉnh / thành phố', data.p.map(([n]) => n));
    sel.disabled = false;
    if (current) sel.value = current;
    sel.addEventListener('change', () => fillWards(form, data, sel.value));
  }).catch(() => {
    // Không tải được danh mục → đổi về ô nhập tay để khách vẫn đặt hàng được
    [sel, wardSelect(form)].forEach((s) => {
      if (!s) return;
      const input = document.createElement('input');
      input.className = 'input';
      input.name = s.name;
      input.required = s.required;
      input.placeholder = s.name === 'province' ? 'VD: Thành phố Hà Nội' : 'VD: Phường Ba Đình';
      s.replaceWith(input);
    });
  }));
}

$$<HTMLSelectElement>('select[data-province]').forEach(init);
