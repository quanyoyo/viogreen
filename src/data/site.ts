// ============================================================
//  CẤU HÌNH CHUNG CỦA WEBSITE — sửa ở đây là cập nhật toàn web
// ============================================================
export const site = {
  name: 'VIO GREEN',
  tagline: 'Smart Care for Urban Green Spaces',
  description:
    'VIO GREEN ECOHUB – hệ thống chăm sóc cây thông minh cho ban công, sân thượng và không gian xanh đô thị: tưới tự động, quản lý dinh dưỡng, năng lượng mặt trời.',
  lang: 'vi',

  // Logo: file trong public/assets/. Để '' thì web dùng logo chữ tạm.
  // (Logo hiện tại lấy từ Figma, độ phân giải thấp — thay bằng file PNG/SVG gốc khi có)
  logo: '/assets/logo.png',
  // Linh vật chatbot MIO (đã tách nền). head = ảnh vuông cho nút chat / avatar.
  mio: { head: '/assets/mio-head-128.webp', full: '/assets/mio.webp' },

  // ---- Thông tin liên hệ (TẠM – chờ khách xác nhận) ----
  phone: '035 717 0062',
  email: 'viogreen@gmail.com',
  address: 'Số 9, Ngõ 45, Hạ Bằng, Thạch Thất, TP Hà Nội',
  hours: 'Thứ 2 – Thứ 7: 8h00 – 16h55',
  // Giờ làm việc cho chatbot (giờ Việt Nam). day: 1 = Thứ 2 … 6 = Thứ 7
  workingHours: { days: [1, 2, 3, 4, 5, 6], start: '08:00', end: '16:55' },
  website: '',
  companyName: 'VIO GREEN', // Tên pháp lý + MST thêm khi có

  // ---- Mạng xã hội: để '' = icon vẫn hiện nhưng chưa có link ----
  social: {
    facebook: 'https://www.facebook.com/profile.php?id=61594287003144',
    tiktok: '',
    messenger: '',
    instagram: '',
    zalo: '', // ví dụ 'https://zalo.me/0357170062'
    youtube: '',
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

  // ---- Giá: chưa có giá thì hiển thị chữ này ----
  priceFallback: 'Liên hệ',
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
