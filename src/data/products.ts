// ============================================================
//  DỮ LIỆU SẢN PHẨM — nguồn: "Thông tin làm web.docx" (bản 18/10/2026: tên Sol / Plus / Pro)
//  và "web_information.docx" (05/11/2026: giá, gộp ECOBOX theo máy S / Plus / Pro, Bio-Nutri Box, ảnh sản phẩm).
//  Mô tả lấy từ tài liệu, đã bỏ các ghi chú nội bộ ("Lưu ý kỹ thuật… chưa được xác nhận", "Thông tin cần xác nhận").
//  price: null  => hiển thị "Liên hệ" (site.priceFallback)
//  variants.prices: giá riêng từng lựa chọn (cùng thứ tự options; null = Liên hệ). Không có thì dùng price.
//  images: []   => hiển thị khung ảnh tạm. Ảnh trong public/products/ (tạo bằng `npm run images`, mỗi ảnh có bản -800)
//               ảnh đầu tiên hiện to; bấm vào để phóng to.
//  thumb        => ảnh trên thẻ sản phẩm / giỏ hàng (mặc định images[0])
//  info         => ảnh có chữ, hiện trong phần mô tả (ECOHUB)
//  model: null  => nút AR hiện "Đang cập nhật". Khi có file 3D: { glb: '/models/ecohub-sol-plus.glb' } (tạo bằng npm run models)
//  Đổi slug → nhớ thêm dòng chuyển hướng 301 trong public/_redirects.
// ============================================================

export type CategoryKey = 'ecohub' | 'ecobox' | 'irrigation' | 'nutrition';
export type Plants = '<15' | '<30';
export type Power = 'solar' | 'grid';
export type Water = 'tank' | 'direct';

export interface Product {
  slug: string;
  name: string;
  shortName: string;
  edition?: string;
  category: CategoryKey;
  plants?: Plants;
  power?: Power;
  water?: Water;
  fits?: string;
  hasAR: boolean;
  summary: string;
  description: string[];
  highlights?: { title: string; items: string[] };
  accessories: string[];
  specs: [string, string][];
  /** pick: khách phải chọn ở trang chi tiết (nút + trên thẻ sản phẩm mở trang chi tiết thay vì thêm ngay) */
  variants?: { label: string; options: string[]; hint?: string; prices?: (number | null)[]; pick?: boolean };
  note?: string;
  price: number | null;
  images: string[];
  thumb?: string;
  info?: string[];
  model: { glb: string; usdz?: string } | null;
}

export const categories: { key: CategoryKey; label: string; short: string }[] = [
  { key: 'ecohub', label: 'Hệ thống ECOHUB', short: 'ECOHUB' },
  { key: 'ecobox', label: 'Bình chứa ECOBOX', short: 'ECOBOX' },
  { key: 'irrigation', label: 'Phụ kiện tưới', short: 'Phụ kiện tưới' },
  { key: 'nutrition', label: 'Dinh dưỡng Bio-Nutri', short: 'Dinh dưỡng' },
];

// Số lượng cây thay cho diện tích (khách yêu cầu 18/10/2026): dưới 10 m² → dưới 15 cây; 10–20 m² → dưới 30 cây
export const plantLabels: Record<Plants, string> = { '<15': 'Dưới 15 cây', '<30': 'Dưới 30 cây' };
export const powerLabels: Record<Power, string> = { solar: 'Năng lượng mặt trời', grid: 'Điện lưới' };
export const waterLabels: Record<Water, string> = { tank: 'Bình chứa nước', direct: 'Nước trực tiếp' };

// Gói bảo hành chọn ở trang chi tiết máy ECOHUB (lưu vào đơn như một biến thể). 12 tháng = tiêu chuẩn.
export const warrantyOptions = ['Bảo hành 12 tháng', 'Bảo hành 18 tháng', 'Bảo hành 24 tháng'];
const warranty = { label: 'Gói bảo hành', options: warrantyOptions, hint: 'Giá trên kèm bảo hành tiêu chuẩn 12 tháng. Phí gói 18 / 24 tháng (nếu có) nhân viên sẽ báo khi xác nhận đơn hàng.' };

// ECOBOX: mỗi loại 1 sản phẩm, khách chọn theo dòng máy (05/11/2026). Thứ tự khớp variants.prices.
export const machineOptions = ['Máy S', 'Máy Plus', 'Máy Pro'];
const machineHint = 'Máy S: ECOHUB Sol, Grid · Máy Plus: ECOHUB Sol Plus, Grid Plus · Máy Pro: ECOHUB Sol Pro, Grid Pro';

const acc = ['bio-tank', 'aqua-tank', 'bio-dripper', 'vio-green-hose', 'bio-nutri-25g'];
const ecoboxNote = 'Chỉ sử dụng nước hoặc dịch xử lý phù hợp với hướng dẫn kỹ thuật của VIO GREEN và đảm bảo vệ sinh hộp chứa trong quá trình sử dụng.';
/** Ảnh sản phẩm trong public/products/ */
const img = (name: string) => `/products/${name}.webp`;

type Raw = Partial<Product> & Pick<Product, 'slug' | 'name' | 'shortName' | 'category' | 'summary' | 'description'>;

const raw: Raw[] = [
  // ---------------- ECOHUB ----------------
  {
    slug: 'ecohub-sol',
    name: 'VIO GREEN ECOHUB Sol – Solar Edition',
    shortName: 'ECOHUB Sol',
    edition: 'Solar Edition',
    category: 'ecohub',
    plants: '<15', power: 'solar', water: 'tank',
    hasAR: true,
    summary: 'Hệ thống chăm sóc cây đô thị dùng năng lượng mặt trời, cho ban công và góc trồng cây nhỏ.',
    description: [
      'VIO GREEN ECOHUB Sol – Solar Edition là hệ thống chăm sóc cây đô thị sử dụng năng lượng mặt trời để hỗ trợ vận hành. Sản phẩm hướng đến những người dùng sống tại đô thị, có nhu cầu duy trì không gian xanh nhưng không có nhiều thời gian để tưới và chăm sóc cây thủ công mỗi ngày.',
      'ECOHUB Sol được định hướng tích hợp giải pháp tưới nước và hỗ trợ quản lý việc bổ sung dinh dưỡng cho cây trong cùng một hệ thống. Sản phẩm giúp giảm các thao tác chăm sóc lặp lại, tạo sự thuận tiện hơn trong quá trình duy trì cây xanh tại nhà.',
      'ECOHUB Sol phù hợp với những không gian trồng cây có diện tích dưới 10 m², chẳng hạn ban công căn hộ hoặc khu vực trồng cây nhỏ. Việc sử dụng năng lượng mặt trời hướng đến tận dụng nguồn năng lượng tái tạo trong quá trình vận hành.',
    ],
    highlights: { title: 'Đặc điểm chính', items: [
      'Sử dụng năng lượng mặt trời để hỗ trợ vận hành.',
      'Hướng đến nhu cầu tưới và chăm sóc cây trong không gian đô thị.',
      'Hỗ trợ giảm các thao tác tưới cây thủ công.',
      'Phù hợp với cấu hình lắp đặt có quy mô nhỏ theo định vị sản phẩm.',
    ] },
    accessories: acc,
    variants: warranty,
    price: 1_999_000,
    images: [img('ecohub-sol')],
    info: [img('ecohub-sol-info')],
  },
  {
    slug: 'ecohub-grid',
    name: 'VIO GREEN ECOHUB Grid – Electric Edition',
    shortName: 'ECOHUB Grid',
    edition: 'Electric Edition',
    category: 'ecohub',
    plants: '<15', power: 'grid', water: 'tank',
    hasAR: true,
    summary: 'Hệ thống chăm sóc cây dùng nguồn điện trực tiếp, cho ban công và sân thượng nhỏ có sẵn ổ điện.',
    description: [
      'VIO GREEN ECOHUB Grid – Electric Edition là hệ thống chăm sóc cây sử dụng nguồn điện trực tiếp để vận hành, hướng đến người dùng đô thị muốn đơn giản hóa quá trình tưới cây và bổ sung dinh dưỡng.',
      'Hệ thống được định hướng hỗ trợ dẫn nước hoặc dung dịch tưới qua hệ thống ống và đầu tưới phù hợp, giúp phân phối nước đến khu vực cây trồng theo cấu hình lắp đặt. Nhờ đó, người dùng có thể giảm sự phụ thuộc vào việc tưới cây thủ công thường xuyên.',
      'ECOHUB Grid phù hợp với các khu vực như ban công căn hộ, sân thượng nhỏ hoặc không gian trồng cây đô thị có sẵn nguồn điện, dành cho khu vực xanh dưới 10 m².',
    ],
    highlights: { title: 'Đặc điểm chính', items: [
      'Sử dụng nguồn điện trực tiếp.',
      'Hỗ trợ tổ chức việc tưới cây thông qua hệ thống dẫn nước và đầu tưới.',
      'Hướng đến việc giảm thời gian chăm sóc cây thủ công.',
      'Phù hợp với không gian trồng cây nhỏ có điều kiện cấp điện phù hợp.',
    ] },
    accessories: acc,
    variants: warranty,
    price: 1_499_000,
    images: [img('ecohub-grid')],
    info: [img('ecohub-grid-info')],
  },
  {
    slug: 'ecohub-sol-plus',
    name: 'VIO GREEN ECOHUB Sol Plus – Solar & Direct Water Edition',
    shortName: 'ECOHUB Sol Plus',
    edition: 'Solar & Direct Water Edition',
    category: 'ecohub',
    plants: '<15', power: 'solar', water: 'direct',
    hasAR: true,
    summary: 'Kết hợp năng lượng mặt trời và kết nối nguồn nước trực tiếp, cho ban công, sân thượng nhỏ.',
    description: [
      'VIO GREEN ECOHUB Sol Plus – Solar & Direct Water Edition là phiên bản kết hợp năng lượng mặt trời với khả năng kết nối nguồn nước trực tiếp, hướng đến nhu cầu chăm sóc cây trong các không gian đô thị có điều kiện cấp nước phù hợp.',
      'Sản phẩm được định hướng hỗ trợ đưa nước từ nguồn cấp đến khu vực trồng cây thông qua hệ thống tưới. Tùy theo cấu hình thực tế, hệ thống có thể kết hợp với giải pháp quản lý dinh dưỡng để hỗ trợ quá trình chăm sóc cây.',
      'Việc kết nối nguồn nước trực tiếp có thể giúp giảm nhu cầu chuẩn bị và bổ sung nước vào bình chứa chính trong những cấu hình được thiết kế phù hợp. Năng lượng mặt trời được sử dụng để hỗ trợ vận hành hệ thống.',
      'ECOHUB Sol Plus phù hợp với ban công, sân thượng hoặc khu vực trồng cây dưới 10 m² có điều kiện kết nối nguồn nước trực tiếp.',
    ],
    highlights: { title: 'Đặc điểm chính', items: [
      'Kết hợp năng lượng mặt trời và nguồn nước trực tiếp.',
      'Hỗ trợ đưa nước đến khu vực trồng cây thông qua hệ thống tưới.',
      'Hướng đến việc giảm thao tác tưới cây thủ công.',
      'Phù hợp với các không gian nhỏ có điều kiện kết nối nguồn nước.',
    ] },
    accessories: acc,
    variants: warranty,
    price: 2_299_000,
    images: [img('ecohub-sol-plus')],
    // 3D bản Plus (Drive '3D máy nhỏ', 25×25×35,6 cm). Tấm pin, hộp Bio-Tank, nút bấm dựng tay theo ảnh (file CAD thiếu) – bản tạm 05/11/2026
    model: { glb: '/models/ecohub-sol-plus.glb' },
    info: [img('ecohub-sol-plus-info')],
  },
  {
    slug: 'ecohub-grid-plus',
    name: 'VIO GREEN ECOHUB Grid Plus – Electric & Direct Water Edition',
    shortName: 'ECOHUB Grid Plus',
    edition: 'Electric & Direct Water Edition',
    category: 'ecohub',
    plants: '<15', power: 'grid', water: 'direct',
    hasAR: true,
    summary: 'Dùng điện trực tiếp và nước trực tiếp – cho không gian nhỏ có sẵn cả nguồn điện và nguồn nước.',
    description: [
      'VIO GREEN ECOHUB Grid Plus – Electric & Direct Water Edition là hệ thống chăm sóc cây sử dụng nguồn điện trực tiếp và kết nối nguồn nước trực tiếp. Sản phẩm hướng đến các khu vực trồng cây đô thị có sẵn cả nguồn điện và nguồn nước, giúp đơn giản hóa quá trình tưới cây.',
      'Hệ thống được định hướng hỗ trợ đưa nước từ nguồn cấp đến khu vực trồng cây thông qua đường ống và đầu tưới tương thích. Tùy cấu hình thực tế, hệ thống có thể kết hợp với các phụ kiện quản lý dinh dưỡng nhằm hỗ trợ quá trình chăm sóc cây.',
      'ECOHUB Grid Plus phù hợp với ban công căn hộ, sân thượng hoặc khu vực trồng cây nhỏ có điều kiện kết nối điện và nước, với phạm vi sử dụng dưới 10 m².',
    ],
    highlights: { title: 'Đặc điểm chính', items: [
      'Sử dụng nguồn điện trực tiếp.',
      'Kết nối với nguồn nước trực tiếp theo cấu hình phù hợp.',
      'Hỗ trợ phân phối nước qua hệ thống tưới.',
      'Hướng đến việc giảm thao tác tưới thủ công tại các không gian đô thị nhỏ.',
    ] },
    accessories: acc,
    variants: warranty,
    price: 1_799_000,
    images: [img('ecohub-grid-plus')],
    model: { glb: '/models/ecohub-grid-plus.glb' },
    info: [img('ecohub-grid-plus-info')],
    note: 'Việc lắp đặt phải tuân thủ hướng dẫn kỹ thuật của sản phẩm.',
  },
  {
    slug: 'ecohub-sol-pro',
    name: 'VIO GREEN ECOHUB Sol Pro – Solar Edition',
    shortName: 'ECOHUB Sol Pro',
    edition: 'Solar Edition',
    category: 'ecohub',
    plants: '<30', power: 'solar', water: 'tank',
    hasAR: true,
    summary: 'Bản năng lượng mặt trời cho không gian xanh lớn hơn: sân thượng, ban công lớn, nhiều chậu cây.',
    description: [
      'VIO GREEN ECOHUB Sol Pro – Solar Edition là hệ thống chăm sóc cây sử dụng năng lượng mặt trời để hỗ trợ vận hành, hướng đến những không gian trồng cây đô thị có quy mô lớn hơn dòng Sol tiêu chuẩn.',
      'Sản phẩm được định hướng hỗ trợ tưới nước và quản lý việc bổ sung dinh dưỡng cho cây thông qua hệ thống tưới và các phụ kiện tương thích. Việc tự động hóa một phần quá trình chăm sóc giúp người dùng giảm thời gian dành cho các thao tác lặp lại, đặc biệt tại những khu vực có nhiều chậu cây.',
      'ECOHUB Sol Pro phù hợp với các không gian xanh từ 10–20 m², chẳng hạn sân thượng, ban công lớn hoặc khu vực trồng cây tại nhà.',
    ],
    highlights: { title: 'Đặc điểm chính', items: [
      'Sử dụng năng lượng mặt trời để hỗ trợ vận hành.',
      'Hướng đến không gian trồng cây có quy mô lớn hơn dòng Sol.',
      'Hỗ trợ tổ chức việc tưới và bổ sung dinh dưỡng theo cấu hình.',
      'Phù hợp với các khu vực có nhiều cây cần được chăm sóc thường xuyên.',
    ] },
    accessories: acc,
    variants: warranty,
    price: 3_399_000,
    images: [img('ecohub-sol-pro')],
    // 3D bản Pro (12 STL gốc, thân 40×40×50 cm). Cột + tấm pin, sọc xanh, nút bấm, logo dựng thêm theo ảnh – bản tạm 05/11/2026
    model: { glb: '/models/ecohub-sol-pro.glb' },
    info: [img('ecohub-sol-pro-info')],
  },
  {
    slug: 'ecohub-grid-pro',
    name: 'VIO GREEN ECOHUB Grid Pro – Electric Edition',
    shortName: 'ECOHUB Grid Pro',
    edition: 'Electric Edition',
    category: 'ecohub',
    plants: '<30', power: 'grid', water: 'tank',
    hasAR: true,
    summary: 'Bản điện lưới cho không gian xanh lớn hơn có sẵn nguồn điện: sân thượng, ban công lớn.',
    description: [
      'VIO GREEN ECOHUB Grid Pro – Electric Edition là hệ thống chăm sóc cây sử dụng nguồn điện trực tiếp, hướng đến các khu vực trồng cây đô thị có quy mô lớn hơn dòng Grid tiêu chuẩn.',
      'Sản phẩm được định hướng hỗ trợ dẫn và phân phối nước đến các vị trí trồng cây thông qua hệ thống ống và đầu tưới tương thích. Khi được lắp đặt với cấu hình phù hợp, hệ thống có thể hỗ trợ quá trình quản lý việc tưới và bổ sung dinh dưỡng cho nhiều chậu cây trong cùng một khu vực.',
      'ECOHUB Grid Pro phù hợp với các không gian xanh từ 10–20 m², chẳng hạn sân thượng hoặc ban công lớn có sẵn nguồn điện.',
    ],
    highlights: { title: 'Đặc điểm chính', items: [
      'Sử dụng nguồn điện trực tiếp.',
      'Hướng đến khu vực trồng cây có quy mô lớn hơn dòng Grid tiêu chuẩn.',
      'Hỗ trợ phân phối nước qua hệ thống dẫn và đầu tưới.',
      'Giúp giảm các thao tác tưới cây thủ công lặp lại.',
    ] },
    accessories: acc,
    variants: warranty,
    price: 2_499_000,
    images: [img('ecohub-grid-pro')],
    model: { glb: '/models/ecohub-grid-pro.glb' },
    info: [img('ecohub-grid-pro-info')],
  },

  // ---------------- ECOBOX ----------------
  // 05/11/2026: gộp S / Plus / Pro thành 1 sản phẩm mỗi loại, khách chọn "Máy S / Máy Plus / Máy Pro" (giữ tên ECOBOX).
  // Giá theo bảng giá khách gửi: Bio-Tank S, Plus 39.000đ; Bio-Tank Pro và Aqua-Tank chưa có giá → Liên hệ.
  {
    slug: 'aqua-tank',
    name: 'VIO GREEN ECOBOX Aqua-Tank',
    shortName: 'ECOBOX Aqua-Tank',
    category: 'ecobox',
    fits: 'ECOHUB S / Plus / Pro',
    summary: 'Hộp nước thay thế cho 3 dòng ECOHUB – chọn theo máy S, Plus hoặc Pro.',
    description: [
      'VIO GREEN ECOBOX Aqua-Tank là bình chứa nước hoặc dung dịch dành cho các cấu hình ECOHUB tương thích. Sản phẩm hướng đến việc giúp người dùng chuẩn bị và lưu trữ nguồn nước phục vụ quá trình tưới cây theo cấu hình hệ thống.',
      'Aqua-Tank có thể được sử dụng như phụ kiện bổ sung hoặc thay thế khi cần thiết. Việc sử dụng bình chứa giúp người dùng chủ động chuẩn bị nguồn nước tại khu vực trồng cây mà không nhất thiết phải kết nối nguồn cấp nước trực tiếp.',
      'Sản phẩm có 3 phiên bản theo dòng máy: Máy S (ECOHUB Sol, Grid), Máy Plus (ECOHUB Sol Plus, Grid Plus) và Máy Pro (ECOHUB Sol Pro, Grid Pro).',
    ],
    highlights: { title: 'Công dụng', items: [
      'Lưu trữ nước theo cấu hình hệ thống tương thích.',
      'Hỗ trợ cung cấp nước cho quá trình tưới cây.',
      'Có thể thay thế hoặc bổ sung khi cần thiết.',
    ] },
    variants: { label: 'Dùng cho máy', options: machineOptions, hint: machineHint, prices: [null, null, null], pick: true },
    accessories: ['ecohub-sol', 'ecohub-grid', 'ecohub-sol-plus', 'ecohub-grid-plus', 'ecohub-sol-pro', 'ecohub-grid-pro'],
    images: [img('aqua-tank-info'), img('aqua-tank')],
    thumb: img('aqua-tank'),
    note: ecoboxNote,
  },
  {
    slug: 'bio-tank',
    name: 'VIO GREEN ECOBOX Bio-Tank',
    shortName: 'ECOBOX Bio-Tank',
    category: 'ecobox',
    fits: 'ECOHUB S / Plus / Pro',
    summary: 'Hộp chứa dung dịch dinh dưỡng thay thế cho 3 dòng ECOHUB – chọn theo máy S, Plus hoặc Pro.',
    description: [
      'VIO GREEN ECOBOX Bio-Tank là bình hoặc hộp chứa dung dịch dinh dưỡng dành cho các cấu hình hệ thống ECOHUB tương thích. Sản phẩm được định hướng phục vụ việc lưu trữ và hỗ trợ cấp dung dịch dinh dưỡng cho cây trong quá trình vận hành.',
      'Bình chứa giúp việc chuẩn bị và bổ sung dung dịch dinh dưỡng trở nên thuận tiện hơn, có thể được sử dụng để thay thế hoặc bổ sung cho cấu hình tương thích theo nhu cầu vận hành.',
      'Sản phẩm có 3 phiên bản theo dòng máy: Máy S (ECOHUB Sol, Grid), Máy Plus (ECOHUB Sol Plus, Grid Plus) và Máy Pro (ECOHUB Sol Pro, Grid Pro).',
    ],
    highlights: { title: 'Công dụng', items: [
      'Lưu trữ dung dịch dinh dưỡng theo cấu hình tương thích.',
      'Hỗ trợ việc bổ sung dinh dưỡng trong quá trình chăm sóc cây.',
      'Có thể sử dụng để thay thế hoặc bổ sung bình chứa theo nhu cầu.',
    ] },
    variants: { label: 'Dùng cho máy', options: machineOptions, hint: machineHint, prices: [39_000, 39_000, null], pick: true },
    price: 39_000,
    accessories: ['ecohub-sol', 'ecohub-grid', 'ecohub-sol-plus', 'ecohub-grid-plus', 'ecohub-sol-pro', 'ecohub-grid-pro'],
    images: [img('bio-tank-info'), img('bio-tank')],
    thumb: img('bio-tank'),
    note: ecoboxNote,
  },

  // ---------------- PHỤ KIỆN TƯỚI ----------------
  {
    slug: 'bio-dripper',
    name: 'VIO GREEN Bio-Dripper – Bộ 10 đầu tưới nhỏ giọt',
    shortName: 'Bio-Dripper (bộ 10)',
    category: 'irrigation',
    fits: 'Mọi dòng ECOHUB',
    summary: 'Bộ 10 đầu tưới nhỏ giọt, đưa nước hoặc dung dịch tưới đến từng gốc cây, chậu cây.',
    specs: [['Quy cách', '01 bộ gồm 10 đầu tưới nhỏ giọt']],
    description: [
      'VIO GREEN Bio-Dripper là bộ đầu tưới nhỏ giọt được thiết kế để phân phối nước hoặc dung dịch tưới đến từng vị trí trồng cây. Sản phẩm hướng đến việc đưa nước đến khu vực gốc cây hoặc chậu cây thông qua hệ thống ống dẫn, giúp bố trí điểm tưới phù hợp với cách sắp xếp cây trồng.',
      'Bio-Dripper có thể kết hợp với ống VIO GREEN Hose và hệ thống ECOHUB tương thích. Việc sử dụng đầu tưới nhỏ giọt giúp xây dựng hệ thống tưới theo từng điểm, thay vì phải tưới thủ công riêng lẻ từng chậu.',
    ],
    highlights: { title: 'Đặc điểm chính', items: [
      'Dùng để phân phối nước hoặc dung dịch tưới đến vị trí cây trồng.',
      'Có thể lắp đặt theo từng chậu hoặc từng điểm tưới.',
      'Kết nối với hệ thống ống dẫn tương thích.',
      'Hướng đến việc tổ chức tưới cây thuận tiện hơn.',
    ] },
    accessories: ['vio-green-hose'],
    // Phụ kiện: ảnh có chữ đứng trước, ảnh nền trắng sau (khách yêu cầu 05/11/2026)
    images: [img('dripper-info'), img('dripper-set'), img('dripper-set-2'), img('dripper')],
    thumb: img('dripper-set'),
  },
  {
    slug: 'vio-green-hose',
    name: 'VIO GREEN Hose 6/8/10 mm – Ống dẫn tưới nhỏ giọt',
    shortName: 'VIO GREEN Hose',
    category: 'irrigation',
    fits: 'Mọi dòng ECOHUB',
    variants: { label: 'Đường kính', options: ['6 mm', '8 mm', '10 mm'] },
    specs: [['Quy cách', '6 mm, 8 mm và 10 mm']],
    summary: 'Ống dẫn nước hoặc dung dịch tưới, kết nối ECOHUB với đầu tưới và từng vị trí cây trồng.',
    description: [
      'VIO GREEN Hose là dòng ống dẫn nước hoặc dung dịch tưới sử dụng trong hệ thống chăm sóc cây VIO GREEN. Sản phẩm có chức năng kết nối hệ thống ECOHUB với các đầu tưới và vị trí cây trồng, hỗ trợ dẫn nước theo bố trí thực tế.',
      'Tùy theo đường kính và cấu hình lắp đặt, ống có thể được sử dụng làm đường dẫn chính hoặc đường dẫn nhánh đến các chậu cây. Sản phẩm được định hướng kết hợp với Bio-Dripper và các phụ kiện tưới tương thích để xây dựng hệ thống tưới phù hợp với không gian xanh đô thị.',
    ],
    highlights: { title: 'Đặc điểm chính', items: [
      'Dẫn nước hoặc dung dịch tưới đến vị trí cây trồng.',
      'Hỗ trợ kết nối giữa hệ thống và các đầu tưới.',
      'Có thể bố trí theo đường dẫn chính hoặc nhánh.',
      'Có các cỡ đường kính 6 mm, 8 mm và 10 mm.',
    ] },
    accessories: ['bio-dripper'],
    images: [img('hose-info'), img('hose-1'), img('hose-2')],
    thumb: img('hose-1'),
    note: 'Các cỡ ống không mặc định thay thế trực tiếp cho nhau – vui lòng chọn đúng đường kính theo cấu hình hệ thống hoặc liên hệ để được tư vấn.',
  },

  // ---------------- DINH DƯỠNG ----------------
  {
    slug: 'bio-nutri-25g',
    name: 'VIO GREEN Bio-Nutri 25g pack – Phân bón sinh học gói 25g',
    shortName: 'Bio-Nutri 25g pack',
    category: 'nutrition',
    fits: 'Mọi dòng ECOHUB',
    specs: [['Quy cách', '01 gói 25g']],
    summary: 'Dinh dưỡng cho cây đóng gói 25g – tiện bảo quản và chuẩn bị cho từng lần sử dụng.',
    description: [
      'VIO GREEN Bio-Nutri 25g pack là sản phẩm dinh dưỡng cho cây được đóng gói theo đơn vị 25g, hướng đến nhu cầu bổ sung dinh dưỡng trong quá trình chăm sóc cây trồng.',
      'Quy cách gói nhỏ giúp người dùng thuận tiện trong việc bảo quản và chuẩn bị sản phẩm cho từng lần sử dụng. Bio-Nutri có thể được sử dụng cùng hệ thống ECOHUB theo cấu hình phù hợp.',
      'Sản phẩm được định hướng trở thành một phần trong giải pháp chăm sóc cây của VIO GREEN, hỗ trợ người dùng tổ chức việc bổ sung dinh dưỡng thuận tiện hơn.',
    ],
    highlights: { title: 'Đặc điểm chính', items: [
      'Quy cách gói 25g.',
      'Hướng đến việc bổ sung dinh dưỡng cho cây trồng.',
      'Có thể kết hợp với hệ thống ECOHUB khi cấu hình và hướng dẫn sử dụng cho phép.',
      'Thuận tiện cho việc bảo quản và sử dụng theo từng gói.',
    ] },
    note: 'Sử dụng theo nhãn sản phẩm và hướng dẫn chính thức của VIO GREEN. Không tự ý tăng liều lượng hoặc sử dụng theo cách chưa được hướng dẫn.',
  },
  {
    // 05/11/2026: thay "Bio-Nutri Multi-Pack" (slug cũ có 301). Mô tả theo tài liệu, bỏ dòng "Lưu ý kỹ thuật" nội bộ.
    slug: 'bio-nutri-box',
    name: 'VIO GREEN Bio-Nutri Box – Hộp 250g',
    shortName: 'Bio-Nutri Box',
    category: 'nutrition',
    fits: 'Mọi dòng ECOHUB',
    specs: [['Quy cách', '01 hộp Bio-Nutri, khối lượng tịnh 250 gram']],
    summary: 'Dinh dưỡng cho cây đóng hộp 250g – tiện bảo quản, dự trữ và dùng cho nhiều lần chăm sóc.',
    description: [
      'VIO GREEN Bio-Nutri Box là sản phẩm dinh dưỡng dành cho cây trồng, được đóng gói trong hộp có khối lượng 250 gram, hướng đến người dùng ECOHUB có nhu cầu bổ sung dinh dưỡng cho cây trong quá trình chăm sóc.',
      'Quy cách hộp 250 gram giúp người dùng thuận tiện trong việc bảo quản, dự trữ và lấy sản phẩm theo lượng cần thiết cho từng lần sử dụng. Bio-Nutri có thể kết hợp với hệ thống ECOHUB để hỗ trợ quá trình bổ sung dinh dưỡng cho cây thông qua cơ chế châm phân tự động, tùy theo hướng dẫn sử dụng và cấu hình tương thích.',
    ],
    highlights: { title: 'Đặc điểm chính', items: [
      'Quy cách đóng gói: Hộp 250 gram.',
      'Cung cấp sản phẩm dinh dưỡng hỗ trợ chăm sóc và phát triển cây trồng.',
      'Thuận tiện cho việc bảo quản và sử dụng trong nhiều lần.',
      'Có thể kết hợp với hệ thống bổ sung dinh dưỡng tự động của ECOHUB.',
      'Phù hợp với người dùng ECOHUB có nhu cầu bổ sung dinh dưỡng định kỳ cho cây.',
    ] },
    note: 'Sử dụng theo nhãn sản phẩm và hướng dẫn chính thức của VIO GREEN. Không tự ý tăng liều lượng hoặc sử dụng theo cách chưa được hướng dẫn.',
  },
];

export const products: Product[] = raw.map((p) => ({
  price: null,
  images: [],
  model: null,
  hasAR: false,
  accessories: [],
  specs: [],
  ...p,
}));

export const bySlug: Record<string, Product> = Object.fromEntries(products.map((p) => [p.slug, p]));
export const inCategory = (key: CategoryKey) => products.filter((p) => p.category === key);
export const categoryOf = (p: Product) => categories.find((c) => c.key === p.category)!;

export const vnd = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' ₫';

/** Giá của một lựa chọn (biến thể). Không có giá riêng từng lựa chọn → giá chung. */
export const variantPrice = (p: Pick<Product, 'price' | 'variants'>, option?: string): number | null => {
  const v = p.variants;
  if (!v?.prices) return p.price;
  const i = option ? v.options.indexOf(option) : 0;
  return v.prices[i < 0 ? 0 : i] ?? null;
};

/** Giá trên thẻ sản phẩm: các lựa chọn khác giá (hoặc có lựa chọn chưa có giá) → "Từ …" */
export const formatPrice = (p: Product, fallback = 'Liên hệ') => {
  const list = p.variants?.prices;
  if (!list) return p.price ? vnd(p.price) : fallback;
  const known = list.filter((x): x is number => x != null);
  if (!known.length) return fallback;
  const min = Math.min(...known);
  return known.length === list.length && known.every((x) => x === min) ? vnd(min) : `Từ ${vnd(min)}`;
};

/** Ảnh nhỏ (bản -800 do `npm run images` tạo) cho thẻ sản phẩm, giỏ hàng */
export const smallImage = (src: string) => (src.startsWith('/products/') ? src.replace(/\.webp$/, '-800.webp') : src);
export const thumbOf = (p: Product) => p.thumb ?? p.images[0];

export const productTags = (p: Product): string[] => {
  if (p.category === 'ecohub' && p.plants && p.power && p.water)
    return [plantLabels[p.plants], powerLabels[p.power], waterLabels[p.water]];
  if (p.fits) return ['Dùng cho ' + p.fits.replace(/^Mọi/, 'mọi')];
  return [];
};

/** Dữ liệu gọn gửi xuống trình duyệt (giỏ hàng, chatbot, AR) */
export const clientProducts = products.map((p) => ({
  slug: p.slug,
  name: p.name,
  shortName: p.shortName,
  category: p.category,
  plants: p.plants ?? null,
  power: p.power ?? null,
  water: p.water ?? null,
  price: p.price,
  image: thumbOf(p) ? smallImage(thumbOf(p)!) : null,
  hasAR: p.hasAR,
  model: p.model,
  summary: p.summary,
  variants: p.variants?.options ?? null,
  prices: p.variants?.prices ?? null,
}));
export type ClientProduct = (typeof clientProducts)[number];
