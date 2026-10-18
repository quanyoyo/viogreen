// ============================================================
//  DỮ LIỆU SẢN PHẨM — nguồn: "Thông tin làm web.docx" (bản 18/10/2026: tên Sol / Plus / Pro, ECOBOX S / Plus / Pro)
//  Mô tả lấy từ tài liệu, đã bỏ các ghi chú nội bộ ("Lưu ý kỹ thuật… chưa được xác nhận", "Thông tin cần xác nhận").
//  price: null  => hiển thị "Liên hệ" (site.priceFallback)
//  images: []   => hiển thị khung ảnh tạm. Đặt ảnh vào public/products/ rồi ghi '/products/ten-anh.webp'
//  model: null  => nút AR hiện "Đang cập nhật". Khi có file 3D: { glb: '/models/ecohub-sol.glb' }
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
  variants?: { label: string; options: string[]; hint?: string };
  note?: string;
  price: number | null;
  images: string[];
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
const warranty = { label: 'Gói bảo hành', options: warrantyOptions, hint: 'Bảo hành tiêu chuẩn 12 tháng. Nhân viên sẽ xác nhận gói bảo hành cùng đơn hàng.' };

const accS = ['bio-tank-s', 'aqua-tank-s', 'bio-dripper', 'vio-green-hose', 'bio-nutri-25g'];
const accPlus = ['bio-tank-plus', 'aqua-tank-plus', 'bio-dripper', 'vio-green-hose', 'bio-nutri-25g'];
const accPro = ['bio-tank-pro', 'aqua-tank-pro', 'bio-dripper', 'vio-green-hose', 'bio-nutri-25g'];
const ecoboxNote = 'Chỉ sử dụng nước hoặc dịch xử lý phù hợp với hướng dẫn kỹ thuật của VIO GREEN và đảm bảo vệ sinh hộp chứa trong quá trình sử dụng.';

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
    accessories: accS,
    variants: warranty,
    images: ['/products/ecohub-sol.webp'],
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
    accessories: accS,
    variants: warranty,
    images: ['/products/ecohub-grid.webp'],
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
    accessories: accPlus,
    variants: warranty,
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
    // Tài liệu ghi "Aqua-Tank Pro" cho Grid Plus – hiểu là Aqua-Tank Plus (Aqua-Tank Plus ghi tương thích Sol Plus, Grid Plus)
    accessories: accPlus,
    variants: warranty,
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
    accessories: accPro,
    variants: warranty,
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
    accessories: accPro,
    variants: warranty,
  },

  // ---------------- ECOBOX ----------------
  {
    slug: 'bio-tank-s',
    name: 'VIO GREEN ECOBOX Bio-Tank S',
    shortName: 'Bio-Tank S',
    category: 'ecobox',
    fits: 'ECOHUB Sol, Grid',
    summary: 'Bình chứa dung dịch dinh dưỡng cho cấu hình ECOHUB Sol và Grid.',
    description: [
      'VIO GREEN ECOBOX Bio-Tank S là bình hoặc hộp chứa dung dịch dinh dưỡng dành cho cấu hình hệ thống ECOHUB tương thích. Sản phẩm được định hướng phục vụ việc lưu trữ và hỗ trợ cấp dung dịch dinh dưỡng cho cây trong quá trình vận hành.',
      'Bio-Tank S hướng đến các cấu hình có quy mô nhỏ, giúp việc chuẩn bị và bổ sung dung dịch dinh dưỡng trở nên thuận tiện hơn khi hệ thống được thiết kế hỗ trợ chức năng này.',
    ],
    highlights: { title: 'Công dụng', items: [
      'Lưu trữ dung dịch dinh dưỡng theo cấu hình tương thích.',
      'Hỗ trợ cấp dung dịch cho hệ thống khi thiết kế thực tế có tích hợp chức năng.',
      'Có thể sử dụng để thay thế hoặc bổ sung bình chứa theo nhu cầu.',
    ] },
    accessories: ['ecohub-sol', 'ecohub-grid'],
    note: ecoboxNote,
  },
  {
    slug: 'bio-tank-plus',
    name: 'VIO GREEN ECOBOX Bio-Tank Plus',
    shortName: 'Bio-Tank Plus',
    category: 'ecobox',
    fits: 'ECOHUB Sol Plus, Grid Plus',
    summary: 'Bình chứa dung dịch dinh dưỡng cho cấu hình ECOHUB Sol Plus và Grid Plus.',
    description: [
      'VIO GREEN ECOBOX Bio-Tank Plus là bình hoặc hộp chứa dung dịch dinh dưỡng dành cho cấu hình ECOHUB tương thích.',
      'Sản phẩm hướng đến việc hỗ trợ lưu trữ và bổ sung dung dịch dinh dưỡng cho hệ thống chăm sóc cây. Bình chứa có thể được sử dụng để thay thế hoặc bổ sung cho cấu hình tương thích theo nhu cầu vận hành.',
    ],
    highlights: { title: 'Công dụng', items: [
      'Lưu trữ dung dịch dinh dưỡng theo thiết kế được hỗ trợ.',
      'Hỗ trợ việc bổ sung dinh dưỡng trong quá trình chăm sóc cây.',
      'Phục vụ cấu hình ECOHUB được xác nhận tương thích.',
    ] },
    accessories: ['ecohub-sol-plus', 'ecohub-grid-plus'],
    note: ecoboxNote,
  },
  {
    slug: 'bio-tank-pro',
    name: 'VIO GREEN ECOBOX Bio-Tank Pro',
    shortName: 'Bio-Tank Pro',
    category: 'ecobox',
    fits: 'ECOHUB Sol Pro, Grid Pro',
    summary: 'Bình chứa ECOBOX cho cấu hình ECOHUB Sol Pro và Grid Pro – thông tin chi tiết đang cập nhật.',
    description: [
      'VIO GREEN ECOBOX Bio-Tank Pro là bình chứa thuộc dòng ECOBOX, dùng cho cấu hình ECOHUB Sol Pro và ECOHUB Grid Pro.',
      'Thông tin chi tiết về công dụng, dung tích và kích thước đang được VIO GREEN cập nhật. Bạn vui lòng liên hệ để được tư vấn cấu hình phù hợp.',
    ],
    accessories: ['ecohub-sol-pro', 'ecohub-grid-pro'],
    note: ecoboxNote,
  },
  {
    slug: 'aqua-tank-s',
    name: 'VIO GREEN ECOBOX Aqua-Tank S',
    shortName: 'Aqua-Tank S',
    category: 'ecobox',
    fits: 'ECOHUB Sol, Grid',
    summary: 'Bình chứa nước cho cấu hình ECOHUB Sol và Grid dùng nguồn chứa riêng.',
    description: [
      'VIO GREEN ECOBOX Aqua-Tank S là bình chứa nước hoặc dung dịch phù hợp với cấu hình ECOHUB sử dụng nguồn chứa riêng. Sản phẩm hướng đến việc giúp người dùng chuẩn bị nguồn nước phục vụ quá trình tưới cây theo cấu hình hệ thống.',
      'Aqua-Tank S có thể được sử dụng như phụ kiện bổ sung hoặc thay thế khi hệ thống được thiết kế tương thích. Việc sử dụng bình chứa giúp người dùng chủ động chuẩn bị nguồn nước tại khu vực trồng cây mà không nhất thiết phải kết nối nguồn cấp nước trực tiếp.',
    ],
    highlights: { title: 'Công dụng', items: [
      'Lưu trữ nước theo cấu hình hệ thống tương thích.',
      'Hỗ trợ cung cấp nước cho quá trình tưới cây.',
      'Có thể thay thế hoặc bổ sung khi cần thiết.',
    ] },
    accessories: ['ecohub-sol', 'ecohub-grid'],
    note: ecoboxNote,
  },
  {
    slug: 'aqua-tank-plus',
    name: 'VIO GREEN ECOBOX Aqua-Tank Plus',
    shortName: 'Aqua-Tank Plus',
    category: 'ecobox',
    fits: 'ECOHUB Sol Plus, Grid Plus',
    summary: 'Bình chứa nước cho cấu hình ECOHUB Sol Plus và Grid Plus.',
    description: [
      'VIO GREEN ECOBOX Aqua-Tank Plus là bình chứa nước hoặc dung dịch dành cho cấu hình ECOHUB tương thích. Sản phẩm hướng đến nhu cầu chuẩn bị và lưu trữ nguồn nước phục vụ hệ thống tưới tại các khu vực trồng cây đô thị.',
      'Aqua-Tank Plus có thể được sử dụng để thay thế hoặc bổ sung bình chứa khi cần thiết, giúp người dùng chủ động hơn trong quá trình vận hành hệ thống chăm sóc cây.',
    ],
    highlights: { title: 'Công dụng', items: [
      'Lưu trữ nước cho cấu hình tương thích.',
      'Hỗ trợ cung cấp nước cho hệ thống tưới.',
      'Phục vụ các cấu hình ECOHUB được xác nhận phù hợp.',
    ] },
    accessories: ['ecohub-sol-plus', 'ecohub-grid-plus'],
    note: ecoboxNote,
  },
  {
    slug: 'aqua-tank-pro',
    name: 'VIO GREEN ECOBOX Aqua-Tank Pro',
    shortName: 'Aqua-Tank Pro',
    category: 'ecobox',
    fits: 'ECOHUB Sol Pro, Grid Pro',
    summary: 'Bình chứa nước cho cấu hình ECOHUB Sol Pro và Grid Pro.',
    description: [
      'VIO GREEN ECOBOX Aqua-Tank Pro là bình chứa nước hoặc dung dịch dành cho cấu hình ECOHUB Pro tương thích. Sản phẩm hướng đến nhu cầu chuẩn bị và lưu trữ nguồn nước phục vụ hệ thống tưới tại các khu vực trồng cây đô thị.',
      'Aqua-Tank Pro có thể được sử dụng để thay thế hoặc bổ sung bình chứa khi cần thiết, giúp người dùng chủ động hơn trong quá trình vận hành hệ thống chăm sóc cây.',
    ],
    highlights: { title: 'Công dụng', items: [
      'Lưu trữ nước cho cấu hình tương thích.',
      'Hỗ trợ cung cấp nước cho hệ thống tưới.',
      'Phục vụ các cấu hình ECOHUB được xác nhận phù hợp.',
    ] },
    accessories: ['ecohub-sol-pro', 'ecohub-grid-pro'],
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
    note: 'Các cỡ ống không mặc định thay thế trực tiếp cho nhau – vui lòng chọn đúng đường kính theo cấu hình hệ thống hoặc liên hệ để được tư vấn.',
  },

  // ---------------- DINH DƯỠNG ----------------
  {
    slug: 'bio-nutri-25g',
    name: 'VIO GREEN Bio-Nutri – Phân bón sinh học gói 25 g',
    shortName: 'Bio-Nutri 25 g',
    category: 'nutrition',
    fits: 'Mọi dòng ECOHUB',
    specs: [['Quy cách', '01 gói 25 g']],
    summary: 'Dinh dưỡng cho cây đóng gói 25 g – tiện bảo quản và chuẩn bị cho từng lần sử dụng.',
    description: [
      'VIO GREEN Bio-Nutri 25 g là sản phẩm dinh dưỡng cho cây được đóng gói theo đơn vị 25 g, hướng đến nhu cầu bổ sung dinh dưỡng trong quá trình chăm sóc cây trồng.',
      'Quy cách gói nhỏ giúp người dùng thuận tiện trong việc bảo quản và chuẩn bị sản phẩm cho từng lần sử dụng. Bio-Nutri có thể được sử dụng cùng hệ thống ECOHUB theo cấu hình phù hợp.',
      'Sản phẩm được định hướng trở thành một phần trong giải pháp chăm sóc cây của VIO GREEN, hỗ trợ người dùng tổ chức việc bổ sung dinh dưỡng thuận tiện hơn.',
    ],
    highlights: { title: 'Đặc điểm chính', items: [
      'Quy cách gói 25 g.',
      'Hướng đến việc bổ sung dinh dưỡng cho cây trồng.',
      'Có thể kết hợp với hệ thống ECOHUB khi cấu hình và hướng dẫn sử dụng cho phép.',
      'Thuận tiện cho việc bảo quản và sử dụng theo từng gói.',
    ] },
    note: 'Sử dụng theo nhãn sản phẩm và hướng dẫn chính thức của VIO GREEN. Không tự ý tăng liều lượng hoặc sử dụng theo cách chưa được hướng dẫn.',
  },
  {
    slug: 'bio-nutri-multi-pack',
    name: 'VIO GREEN Bio-Nutri – Multi-Pack',
    shortName: 'Bio-Nutri Multi-Pack',
    category: 'nutrition',
    fits: 'Mọi dòng ECOHUB',
    specs: [['Quy cách', 'Hộp nhiều gói (số gói trong hộp đang cập nhật)']],
    summary: 'Hộp nhiều gói Bio-Nutri riêng lẻ – dự trữ dinh dưỡng cho nhiều lần chăm sóc cây.',
    description: [
      'VIO GREEN Bio-Nutri Multi-Pack là quy cách đóng gói gồm nhiều gói Bio-Nutri riêng lẻ, hướng đến người dùng có nhu cầu dự trữ sản phẩm dinh dưỡng để sử dụng trong nhiều lần chăm sóc cây.',
      'Việc đóng gói thành nhiều gói nhỏ giúp người dùng thuận tiện trong việc bảo quản và lấy sản phẩm theo từng lần sử dụng. Multi-Pack phù hợp với người dùng ECOHUB muốn chủ động chuẩn bị nguồn dinh dưỡng cho quá trình chăm sóc cây.',
    ],
    highlights: { title: 'Đặc điểm chính', items: [
      'Đóng gói nhiều gói Bio-Nutri riêng lẻ.',
      'Hỗ trợ dự trữ sản phẩm cho các lần sử dụng tiếp theo.',
      'Thuận tiện cho việc bảo quản và sử dụng theo từng gói.',
      'Có thể kết hợp với ECOHUB theo hướng dẫn và cấu hình phù hợp.',
    ] },
    note: 'Bảo quản sản phẩm theo hướng dẫn trên bao bì và sử dụng đúng liều lượng được khuyến nghị.',
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

export const formatPrice = (p: Product, fallback = 'Liên hệ') =>
  p.price ? new Intl.NumberFormat('vi-VN').format(p.price) + ' ₫' : fallback;

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
  image: p.images[0] ?? null,
  hasAR: p.hasAR,
  model: p.model,
  summary: p.summary,
  variants: p.variants?.options ?? null,
}));
export type ClientProduct = (typeof clientProducts)[number];
