// ============================================================
//  CẤU HÌNH CHUNG CỦA WEBSITE — sửa ở đây là cập nhật toàn web
// ============================================================
export const site = {
  name: 'VIO GREEN',
  tagline: 'Chăm sóc thông minh cho không gian xanh đô thị',
  description:
    'VIO GREEN ECOHUB – hệ thống chăm sóc cây thông minh cho ban công, sân thượng và không gian xanh đô thị: tưới tự động, quản lý dinh dưỡng, năng lượng mặt trời.',
  lang: 'vi',

  // Logo: file trong public/assets/. Để '' thì web dùng logo chữ tạm.
  // (Logo hiện tại lấy từ Figma, độ phân giải thấp — thay bằng file PNG/SVG gốc khi có)
  logo: '/assets/logo.png',
  // Linh vật chatbot MIO (đã tách nền). stand = toàn thân cỡ nhỏ cho nút chat nổi; head = avatar trong khung chat.
  mio: { stand: '/assets/mio-stand.webp', head: '/assets/mio-head-128.webp', full: '/assets/mio.webp' },

  // ---- Thông tin liên hệ (TẠM – chờ khách xác nhận) ----
  phone: '035 717 0062',
  email: 'viogreen102@gmail.com',
  address: 'Số 9, Ngõ 45, Hạ Bằng, Thạch Thất, TP Hà Nội',
  hours: 'Thứ 2 – Thứ 7: 8h00 – 16h55',
  // Giờ làm việc cho chatbot (giờ Việt Nam). day: 1 = Thứ 2 … 6 = Thứ 7
  workingHours: { days: [1, 2, 3, 4, 5, 6], start: '08:00', end: '16:55' },
  website: 'https://viogreen.com', // tên miền chính – khớp `site` trong astro.config.mjs

  // ---- Chế độ trước ra mắt ----
  // true = mọi trang có <meta name="robots" content="noindex"> → Google chưa đưa web lên kết quả tìm kiếm.
  // Ngày ra mắt: đổi thành false, chạy check + build, push lên main (xem CLAUDE.md mục "Ra mắt").
  prelaunch: true,
  companyName: 'VIO GREEN', // Tên pháp lý + MST thêm khi có

  // ---- Mạng xã hội: để '' = icon vẫn hiện nhưng chưa có link ----
  social: {
    facebook: 'https://www.facebook.com/profile.php?id=61594287003144',
    tiktok: 'https://www.tiktok.com/@viogreen.vn',
    youtube: 'https://www.youtube.com/@VIOGREEN-vn',
    shopee: 'https://shopee.vn/shop/1739793835',
    messenger: '',
    zalo: '', // ví dụ 'https://zalo.me/0357170062'
    instagram: '',
  } as Record<string, string>,

  // ---- Firebase (đơn hàng, liên hệ, tài khoản khách) ----
  // Config web của Firebase là thông tin công khai, không phải mật khẩu — bảo mật nằm ở firestore.rules.
  // Để projectId '' = chế độ thử (form chạy, không gửi dữ liệu đi, không đăng nhập được).
  firebase: {
    apiKey: 'AIzaSyCfsfq4pg_OuyYLmCurGjWuYIuSxf-N-1g',
    authDomain: 'viogreen-44a7f.firebaseapp.com',
    projectId: 'viogreen-44a7f',
    storageBucket: 'viogreen-44a7f.firebasestorage.app',
    messagingSenderId: '1072915790565',
    appId: '1:1072915790565:web:891b4ce882e83a85ff720c',
  },

  // ---- Thanh toán (trang đặt hàng + trang đặt hàng thành công) ----
  payment: {
    codCarrier: 'SPX Express',
    bank: 'Techcombank',
    account: '19070857077015', // số để sao chép
    accountDisplay: '1907 0857 0770 15',
    holder: 'NGUYEN THUY LINH',
    qr: '/assets/qr-chuyen-khoan.webp', // cắt từ qr-chuyen-khoan.jpg (ảnh gốc khách gửi); thiếu file thì trang tự ẩn QR
  },

  // ---- Giá: chưa có giá thì hiển thị chữ này ----
  priceFallback: 'Liên hệ',

  // ---- Thanh chữ chạy ngang dưới menu (mọi trang). Icon: tên trong src/components/icons.ts ----
  // Nội dung khách gửi 18/10/2026. Lưu ý: chính sách vận chuyển chỉ miễn phí đơn từ 2 triệu ở Hà Nội.
  notice: [
    { icon: 'warranty', text: 'Bảo hành 12 tháng' },
    { icon: 'truck', text: 'Giao hàng miễn phí từ 2.000.000đ' },
    { icon: 'support', text: 'Tư vấn miễn phí' },
  ],

  // ---- Thời tiết + giờ trên ảnh hero trang chủ (Open-Meteo, miễn phí, không cần khoá) ----
  weather: { label: 'Hà Nội', lat: 21.0285, lon: 105.8542 },
};

export const telHref = 'tel:' + site.phone.replace(/\s/g, '');

export const nav = [
  { href: '/', label: 'Trang chủ', key: 'home' },
  { href: '/san-pham/', label: 'Sản phẩm', key: 'products' },
  { href: '/gioi-thieu/', label: 'Giới thiệu', key: 'about' },
  { href: '/trai-nghiem-ar/', label: 'Trải nghiệm AR', key: 'ar' },
  { href: '/lien-he/', label: 'Liên hệ', key: 'contact' },
];

export const policyPages = [
  { slug: 'van-chuyen', title: 'Chính sách vận chuyển', short: 'Vận chuyển', intro: 'Phạm vi giao hàng, biểu phí và thời gian giao hàng dự kiến của VIO GREEN.' },
  { slug: 'doi-tra', title: 'Chính sách đổi trả', short: 'Đổi trả', intro: 'Điều kiện, hình thức và quy trình đổi trả sản phẩm VIO GREEN.' },
  { slug: 'bao-hanh', title: 'Chính sách bảo hành', short: 'Bảo hành', intro: 'Điều kiện bảo hành, thời gian xử lý và quy trình tiếp nhận bảo hành.' },
  { slug: 'bao-mat', title: 'Chính sách bảo mật thông tin', short: 'Bảo mật thông tin', intro: 'Cách VIO GREEN thu thập, sử dụng và bảo vệ thông tin cá nhân của khách hàng.' },
];
