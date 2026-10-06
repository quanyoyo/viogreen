// Dữ liệu sản phẩm gọn được nhúng vào trang (BaseLayout → #vg-data) để JS không phải chở cả mô tả dài.
import type { ClientProduct } from '../data/products';
export type { ClientProduct };
export const clientProducts: ClientProduct[] = (() => {
  try { return JSON.parse(document.getElementById('vg-data')?.textContent || '[]'); } catch { return []; }
})();
