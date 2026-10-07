// Hiển thị đơn hàng — dùng chung cho /tai-khoan/ và /quan-tri/.
import type { Order } from './fb';

export const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
export const vnd = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' ₫';
export const fmtTime = (t?: { toDate(): Date }) =>
  t ? t.toDate().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Đang ghi…';

const BADGE: Record<string, string> = {
  'Mới': 'bg-sun/25 text-ink',
  'Đã xác nhận': 'bg-brand-100 text-brand-800',
  'Đang giao': 'bg-sky-100 text-sky-800',
  'Hoàn tất': 'bg-brand text-white',
  'Đã huỷ': 'bg-red-100 text-red-700',
  'Đã liên hệ': 'bg-brand-100 text-brand-800',
  'Xong': 'bg-brand text-white',
};
export const badge = (status: string) =>
  `<span class="inline-flex rounded-full px-3 py-1 text-xs font-semibold ${BADGE[status] ?? 'bg-cream-200 text-ink'}">${esc(status)}</span>`;

export const totalText = (o: Order) => (o.total ? vnd(o.total) : 'Chờ báo giá');

/** Nhãn phương thức thanh toán — khớp giá trị `paymentMethod` trong firestore.rules */
export const PAYMENT_LABEL: Record<string, string> = { cod: 'COD – thanh toán khi nhận hàng', bank: 'Chuyển khoản' };
export const paymentText = (o: Order) => (o.paymentMethod ? PAYMENT_LABEL[o.paymentMethod] ?? o.paymentMethod : '—');

export const itemsHtml = (o: Order) => `<ul class="divide-y divide-line text-sm">${o.items.map((i) => `
  <li class="flex justify-between gap-3 py-2"><span>${esc(i.name)}${i.variant ? ` <span class="text-muted">(${esc(i.variant)})</span>` : ''} × ${i.qty}</span>
  <span class="shrink-0 text-muted">${i.price ? vnd(i.price * i.qty) : 'Liên hệ'}</span></li>`).join('')}</ul>`;
