// Kiến thức cho chatbot MIO v1 (trả lời theo từ khóa). Sửa câu trả lời ở đây.
// keys: viết KHÔNG dấu, chữ thường. Câu hỏi khớp càng nhiều từ khóa càng được ưu tiên.
// Nội dung tóm tắt từ 4 trang chính sách — khi chính sách đổi, cập nhật cả ở đây.
import { site } from './site';

export interface KbEntry { id: string; keys: string[]; answer: string; links?: [string, string][] }

export const kb: KbEntry[] = [
  {
    id: 'ship-fee',
    keys: ['phi ship', 'phi van chuyen', 'phi giao', 'tien ship', 'mien phi ship', 'freeship', 'free ship', 'ship bao nhieu'],
    answer: 'Phí vận chuyển được nhân viên báo trước khi xác nhận đơn. Giao tiêu chuẩn: miễn phí nội thành Hà Nội cho đơn trên 4.000.000đ; miễn phí nội & ngoại thành Hà Nội cho đơn trên 2.000.000đ. Giao nhanh/hỏa tốc và tỉnh khác tính theo biểu phí hãng vận chuyển.',
    links: [['Chính sách vận chuyển', '/chinh-sach/van-chuyen/']],
  },
  {
    id: 'ship-time',
    keys: ['bao lau', 'may ngay', 'thoi gian giao', 'khi nao nhan', 'giao hang', 'van chuyen', 'giao toan quoc', 'hoa toc', 'ship'],
    answer: 'VIO GREEN giao hàng toàn quốc. Dự kiến: Giao tiêu chuẩn – nội thành HN 1–2 ngày, ngoại thành 2 ngày, tỉnh khác 5–7 ngày. Giao nhanh/hỏa tốc – nội thành HN 2–4 giờ, ngoại thành 1 ngày, tỉnh khác khoảng 3 ngày.',
    links: [['Chính sách vận chuyển', '/chinh-sach/van-chuyen/']],
  },
  {
    id: 'return',
    keys: ['doi tra', 'doi hang', 'tra hang', 'hoan tien', 'tra lai', 'doi san pham', 'loi san pham'],
    answer: 'Đổi hàng trong 30 ngày (mua trực tiếp hoặc online), trả hàng trong 7 ngày (chỉ đơn online). Sản phẩm cần chính hãng, chưa qua sử dụng, còn nguyên hộp/tem, bị lỗi từ nhà sản xuất. Lỗi nhà sản xuất: VIO GREEN chịu 100% phí vận chuyển hai chiều. Không áp dụng cho hàng giảm giá trên 30% hoặc quà tặng.',
    links: [['Chính sách đổi trả', '/chinh-sach/doi-tra/']],
  },
  {
    id: 'warranty',
    keys: ['bao hanh', 'sua chua', 'hong', 'hu hong', 'khong chay', 'loi may', 'vio-care', 'vio care', 'bao duong', 'goi bao hanh'],
    answer: 'Máy ECOHUB được bảo hành tiêu chuẩn 12 tháng; bạn có thể chọn gói bảo hành 18 hoặc 24 tháng ngay ở trang sản phẩm khi đặt hàng. Bảo hành áp dụng cho sản phẩm chính hãng còn hạn, nguyên trạng, chưa tự ý sửa chữa. Thời gian xử lý tiêu chuẩn trong 7 ngày làm việc. Lỗi nhà sản xuất trong 15 ngày đầu được đổi mới.',
    links: [['Chính sách bảo hành', '/chinh-sach/bao-hanh/'], ['Xem các dòng ECOHUB', '/san-pham/#ecohub']],
  },
  {
    id: 'privacy',
    keys: ['bao mat', 'thong tin ca nhan', 'du lieu ca nhan', 'rieng tu'],
    answer: 'VIO GREEN chỉ dùng thông tin của bạn để tư vấn, xử lý đơn hàng, giao hàng và bảo hành; không bán hay trao đổi thông tin cho bên thứ ba vì mục đích thương mại.',
    links: [['Chính sách bảo mật', '/chinh-sach/bao-mat/']],
  },
  {
    id: 'price',
    keys: ['gia', 'bao nhieu tien', 'gia ban', 'bao gia', 'chi phi', 'gia bao nhieu', 'mac khong', 're khong'],
    answer: 'Giá các dòng ECOHUB và phụ kiện đang được VIO GREEN cập nhật. Bạn cứ thêm sản phẩm vào giỏ và gửi đơn – nhân viên sẽ gọi báo giá chính xác kèm phí vận chuyển trước khi bạn quyết định. Hoặc để lại số điện thoại để được báo giá ngay.',
  },
  {
    id: 'payment',
    keys: ['thanh toan', 'chuyen khoan', 'tra gop', 'cod', 'tien mat', 'the', 'hinh thuc thanh toan'],
    answer: `Khi đặt hàng bạn chọn một trong hai cách:\n• COD – thanh toán khi nhận hàng, giao qua ${site.payment.codCarrier}.\n• Chuyển khoản ${site.payment.bank} – số tài khoản và mã QR hiện ngay sau khi gửi đơn, nội dung chuyển khoản là mã đơn.\nNhân viên VIO GREEN sẽ gọi xác nhận sản phẩm và phí vận chuyển trước khi giao.`,
    links: [['Xem sản phẩm', '/san-pham/']],
  },
  {
    id: 'how-order',
    keys: ['dat hang', 'mua hang', 'cach mua', 'dat mua', 'order', 'mua o dau', 'mua nhu the nao'],
    answer: 'Đặt hàng chỉ 3 bước: (1) bấm “Thêm vào giỏ” ở sản phẩm bạn chọn, (2) vào Giỏ hàng → “Tiến hành đặt hàng”, (3) điền thông tin nhận hàng và xác nhận. Nhân viên sẽ gọi lại để chốt đơn.',
    links: [['Xem sản phẩm', '/san-pham/'], ['Giỏ hàng', '/gio-hang/']],
  },
  {
    id: 'install',
    keys: ['lap dat', 'lap rap', 'huong dan lap', 'tu lap'],
    answer: 'ECOHUB cần lắp đặt theo hướng dẫn kỹ thuật của VIO GREEN (cấu hình ống dẫn, đầu tưới, nguồn điện/nước). Khi đặt hàng, bạn ghi chú nhu cầu lắp đặt – nhân viên sẽ tư vấn cụ thể theo không gian của bạn.',
  },
  {
    id: 'ar',
    keys: ['ar', 'thuc te ao', 'uom thu', '3d', 'xem truoc', 'xoay 360'],
    answer: 'Bạn có thể ướm thử ECOHUB trong không gian thật bằng AR ngay trên trình duyệt điện thoại, không cần cài app. Mô hình 3D đang được cập nhật cho từng phiên bản.',
    links: [['Trải nghiệm AR', '/trai-nghiem-ar/']],
  },
  {
    id: 'contact',
    keys: ['dia chi', 'van phong', 'showroom', 'o dau', 'hotline', 'so dien thoai', 'email', 'lien he', 'gio lam', 'mo cua'],
    answer: `Bạn có thể liên hệ VIO GREEN:\n• Hotline: ${site.phone}\n• Email: ${site.email}\n• Địa chỉ: ${site.address}\n• Giờ làm việc: ${site.hours}`,
    links: [['Trang liên hệ', '/lien-he/']],
  },
  {
    id: 'about',
    keys: ['vio green la', 'cong ty', 'thuong hieu', 'gioi thieu'],
    answer: 'VIO GREEN phát triển giải pháp chăm sóc không gian xanh đô thị – kết nối công nghệ, con người và thiên nhiên – với sản phẩm chủ lực là hệ thống ECOHUB: tưới tự động, quản lý dinh dưỡng, năng lượng mặt trời và giám sát qua app.',
    links: [['Giới thiệu', '/gioi-thieu/']],
  },
  {
    id: 'difference',
    keys: ['khac nhau', 'khac gi', 'so sanh', 'sol va grid', 'plus la gi', 'pro la gi', 'ban pro', 'ban plus', 'nen chon'],
    answer: 'Các phiên bản ECOHUB khác nhau ở 3 điểm:\n• Sol, Grid, Sol Plus, Grid Plus cho dưới 15 cây (không gian dưới 10m²); Sol Pro, Grid Pro cho dưới 30 cây (10–20m²).\n• Sol dùng năng lượng mặt trời, Grid dùng điện lưới.\n• Bản Plus nối thẳng nguồn nước; các bản còn lại dùng bình chứa (Aqua-Tank).\nMIO có thể hỏi bạn 3 câu để gợi ý đúng model nhé!',
  },
];

/** Câu hỏi soạn sẵn hiện ở màn hình chào của khung chat (bấm là trả lời ngay).
 *  kb = id trong `kb` ở trên; faq = vị trí câu trong src/data/faq.ts; action: pick = hỏi 3 câu chọn máy, lead = xin SĐT. */
export const quickQuestions: { q: string; kb?: string; faq?: number; action?: 'pick' | 'lead' }[] = [
  { q: 'Nên chọn ECOHUB nào cho không gian của tôi?', action: 'pick' },
  { q: 'Hệ thống có tự động tưới hoàn toàn không?', faq: 1 },
  { q: 'Tôi có cần biết về chăm cây để sử dụng không?', faq: 2 },
  { q: 'Bảo hành bao lâu?', kb: 'warranty' },
  { q: 'Phí vận chuyển thế nào?', kb: 'ship-fee' },
  { q: 'Giao hàng mất bao lâu?', kb: 'ship-time' },
  { q: 'Có những hình thức thanh toán nào?', kb: 'payment' },
  { q: 'Chính sách đổi trả thế nào?', kb: 'return' },
  { q: 'Gặp nhân viên tư vấn', action: 'lead' },
];

export const greetings = ['xin chao', 'chao', 'hello', 'hi', 'alo', 'hey', 'chao ban', 'chao mio'];
export const thanks = ['cam on', 'thank', 'thanks', 'ok', 'oke', 'duoc roi', 'tuyet'];
export const humanKeys = ['nhan vien', 'tu van vien', 'nguoi that', 'goi lai', 'goi cho toi', 'lien he lai', 'gap nhan vien', 'tong dai'];
export const pickKeys = ['tu van chon', 'chon may', 'nen mua', 'phu hop voi', 'goi y', 'loai nao', 'model nao', 'chon ecohub', 'mua may nao'];
export const accessoryKeys = ['phu kien', 'di kem', 'ecobox', 'bio-tank', 'bio tank', 'aqua-tank', 'aqua tank', 'dripper', 'hose', 'ong', 'dau tuoi', 'bio-nutri', 'bio nutri', 'phan bon'];
