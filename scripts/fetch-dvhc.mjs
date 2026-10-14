// Tải danh mục đơn vị hành chính MỚI (34 tỉnh/thành, 3.321 phường/xã/đặc khu – hiệu lực 01/07/2025)
// từ provinces.open-api.vn (API v2, dữ liệu Tổng cục Thống kê) và rút gọn thành public/data/dvhc.json.
// Chạy: npm run dvhc   (chỉ cần chạy lại khi Nhà nước thay đổi địa giới hành chính)
//
// Định dạng xuất: { v: "2025-07-01", p: [[tên tỉnh, [tên phường/xã, …]], …] }
//   - tỉnh giữ thứ tự mã hành chính (Hà Nội đầu tiên), phường/xã sắp theo ABC tiếng Việt
//   - lưu tên đầy đủ có tiền tố ("Thành phố Hà Nội", "Phường Ba Đình") – đúng như ghi vào đơn hàng
import fs from 'node:fs';
import path from 'node:path';

const URL = 'https://provinces.open-api.vn/api/v2/?depth=2';
const OUT = path.resolve(import.meta.dirname, '..', 'public', 'data', 'dvhc.json');

const res = await fetch(URL);
if (!res.ok) throw new Error(`Không tải được ${URL}: HTTP ${res.status}`);
const data = await res.json();

const wards = data.reduce((s, p) => s + p.wards.length, 0);
// Kiểm tra theo số liệu chính thức sau sắp xếp 2025; lệch thì dừng để người kiểm tra lại nguồn
if (data.length !== 34 || wards !== 3321) throw new Error(`Số liệu lạ: ${data.length} tỉnh, ${wards} phường/xã (mong đợi 34 / 3321)`);

const vi = new Intl.Collator('vi');
const out = {
  v: '2025-07-01',
  src: 'provinces.open-api.vn/api/v2',
  p: data.sort((a, b) => a.code - b.code).map((p) => [p.name, p.wards.map((w) => w.name).sort(vi.compare)]),
};
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out));
console.log(`✔ ${path.relative(process.cwd(), OUT)}: ${out.p.length} tỉnh/thành, ${wards} phường/xã/đặc khu, ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`);
