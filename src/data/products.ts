// ============================================================
//  DỮ LIỆU SẢN PHẨM — nguồn: "Thông tin làm web.docx"
//  price: null  => hiển thị "Liên hệ" (site.priceFallback)
//  images: []   => hiển thị khung ảnh tạm. Đặt ảnh vào public/products/ rồi ghi '/products/ten-anh.jpg'
//  model: null  => nút AR hiện "Đang cập nhật". Khi có file 3D: { glb: '/models/x10-sol.glb', usdz: '/models/x10-sol.usdz' }
// ============================================================

export type CategoryKey = 'ecohub' | 'ecobox' | 'irrigation' | 'nutrition' | 'service';
export type Area = '<10' | '10-20';
export type Power = 'solar' | 'grid';
export type Water = 'tank' | 'direct';

export interface Product {
  slug: string;
  name: string;
  shortName: string;
  edition?: string;
  category: CategoryKey;
  area?: Area;
  power?: Power;
  water?: Water;
  fits?: string;
  hasAR: boolean;
  summary: string;
  description: string[];
  accessories: string[];
  specs: [string, string][];
  variants?: { label: string; options: string[] };
  note?: string;
  price: number | null;
  images: string[];
  model: { glb: string; usdz?: string } | null;
}

export const categories: { key: CategoryKey; label: string; short: string }[] = [
  { key: 'ecohub', label: 'Hệ thống ECOHUB', short: 'ECOHUB' },
  { key: 'ecobox', label: 'Hộp chứa ECOBOX', short: 'ECOBOX' },
  { key: 'irrigation', label: 'Phụ kiện tưới', short: 'Phụ kiện tưới' },
  { key: 'nutrition', label: 'Dinh dưỡng Bio-Nutri', short: 'Dinh dưỡng' },
  { key: 'service', label: 'Gói bảo hành VIO-Care', short: 'Dịch vụ' },
];

export const areaLabels: Record<Area, string> = { '<10': 'Dưới 10m²', '10-20': '10–20m²' };
export const powerLabels: Record<Power, string> = { solar: 'Năng lượng mặt trời', grid: 'Điện lưới' };
export const waterLabels: Record<Water, string> = { tank: 'Bình chứa nước', direct: 'Nước trực tiếp' };

const ecohubCommonX10 = ['bio-tank-x10', 'aqua-tank-x10', 'bio-dripper', 'vio-green-hose', 'bio-nutri-25g'];
const ecohubCommonX20 = ['bio-tank-x20', 'aqua-tank-x20', 'bio-dripper', 'vio-green-hose', 'bio-nutri-25g'];
const ecohubDirectX10 = ['bio-tank-x10', 'bio-dripper', 'vio-green-hose', 'bio-nutri-25g'];

type Raw = Partial<Product> & Pick<Product, 'slug' | 'name' | 'shortName' | 'category' | 'summary' | 'description'>;

const raw: Raw[] = [
  // ---------------- ECOHUB ----------------
  {
    slug: 'ecohub-x10-sol',
    name: 'VIO GREEN ECOHUB X10 Sol – Solar Edition',
    shortName: 'ECOHUB X10 Sol',
    edition: 'Solar Edition',
    category: 'ecohub',
    area: '<10', power: 'solar', water: 'tank',
    hasAR: true,
    summary: 'Hệ thống chăm sóc cây thông minh cho không gian dưới 10m², vận hành bằng năng lượng mặt trời.',
    description: [
      'VIO GREEN ECOHUB X10 Sol – Solar Edition là hệ thống chăm sóc cây thông minh dành cho không gian xanh dưới 10m², sử dụng năng lượng mặt trời để hỗ trợ vận hành. Sản phẩm được phát triển cho nhu cầu chăm sóc cây trong môi trường đô thị, nơi người dùng thường có diện tích trồng cây hạn chế nhưng không có nhiều thời gian theo dõi và tưới cây thủ công mỗi ngày.',
      'ECOHUB X10 Sol tích hợp giải pháp tưới, quản lý nước và dinh dưỡng trong một hệ thống nhỏ gọn, hỗ trợ cung cấp nước và dưỡng chất cho cây theo điều kiện chăm sóc. Thay vì phụ thuộc hoàn toàn vào thao tác tưới thủ công, hệ thống giúp giảm bớt công việc chăm sóc lặp lại và tạo sự thuận tiện hơn trong quá trình duy trì không gian xanh.',
      'Sản phẩm phù hợp với các khu vực như ban công, sân thượng hoặc những không gian trồng cây đô thị có diện tích dưới 10m². ECOHUB X10 Sol là lựa chọn dành cho người dùng muốn duy trì cây xanh ổn định, đồng thời tận dụng nguồn năng lượng mặt trời trong quá trình vận hành.',
    ],
    accessories: ecohubCommonX10,
    note: 'Phạm vi sử dụng, cấu hình lắp đặt và lượng nước/dinh dưỡng cần được thực hiện theo hướng dẫn kỹ thuật của VIO GREEN và nhu cầu thực tế của từng loại cây.',
  },
  {
    slug: 'ecohub-x10-grid',
    name: 'VIO GREEN ECOHUB X10 Grid – Electric Edition',
    shortName: 'ECOHUB X10 Grid',
    edition: 'Electric Edition',
    category: 'ecohub',
    area: '<10', power: 'grid', water: 'tank',
    hasAR: true,
    summary: 'Hệ thống chăm sóc cây thông minh cho không gian dưới 10m², dùng nguồn điện trực tiếp.',
    description: [
      'VIO GREEN ECOHUB X10 Grid – Electric Edition là hệ thống chăm sóc cây thông minh dành cho không gian xanh dưới 10m², sử dụng nguồn điện trực tiếp để vận hành. Sản phẩm hướng đến người dùng đô thị muốn tự động hóa một phần quá trình chăm sóc cây, đặc biệt tại các khu vực có sẵn nguồn điện và diện tích trồng cây nhỏ.',
      'ECOHUB X10 Grid tích hợp giải pháp tưới và quản lý dinh dưỡng trong một hệ thống, hỗ trợ đưa nước và dưỡng chất đến khu vực cây trồng thông qua hệ thống dẫn và đầu tưới. Việc tự động hóa quá trình chăm sóc giúp giảm sự phụ thuộc vào thao tác tưới thủ công hằng ngày, đồng thời tạo sự thuận tiện hơn cho người dùng bận rộn.',
      'Sản phẩm phù hợp với ban công, sân thượng và các khu vực trồng cây có diện tích dưới 10m². Với nguồn điện trực tiếp, ECOHUB X10 Grid phù hợp với những vị trí đã có hệ thống điện ổn định và cần một giải pháp chăm sóc cây thuận tiện, liên tục.',
    ],
    accessories: ecohubCommonX10,
    note: 'Sản phẩm cần được lắp đặt và sử dụng theo hướng dẫn của VIO GREEN, đồng thời đảm bảo điều kiện nguồn điện phù hợp với yêu cầu kỹ thuật của hệ thống.',
  },
  {
    slug: 'ecohub-x10-hydro-sol',
    name: 'VIO GREEN ECOHUB X10 Hydro Sol – Solar & Direct Water Edition',
    shortName: 'ECOHUB X10 Hydro Sol',
    edition: 'Solar & Direct Water Edition',
    category: 'ecohub',
    area: '<10', power: 'solar', water: 'direct',
    hasAR: true,
    summary: 'Kết hợp năng lượng mặt trời và nguồn nước trực tiếp cho không gian dưới 10m².',
    description: [
      'VIO GREEN ECOHUB X10 Hydro Sol – Solar & Direct Water Edition là hệ thống chăm sóc cây thông minh dành cho không gian dưới 10m², kết hợp sử dụng năng lượng mặt trời với nguồn nước trực tiếp. Sản phẩm được thiết kế nhằm đơn giản hóa quá trình chăm sóc cây tại các không gian đô thị có sẵn nguồn nước và cần giảm thao tác tưới thủ công.',
      'Hệ thống hỗ trợ đưa nước trực tiếp từ nguồn cấp đến khu vực trồng cây thông qua hệ thống tưới, đồng thời kết hợp giải pháp quản lý dinh dưỡng để hỗ trợ nhu cầu chăm sóc cây. Việc sử dụng nguồn nước trực tiếp giúp giảm nhu cầu phụ thuộc vào bình chứa nước riêng trong cấu hình phù hợp, trong khi năng lượng mặt trời hỗ trợ quá trình vận hành của hệ thống.',
      'ECOHUB X10 Hydro Sol phù hợp với ban công, sân thượng và các khu vực cây xanh dưới 10m² có thể kết nối với nguồn nước trực tiếp. Đây là lựa chọn phù hợp cho người dùng muốn kết hợp tự động hóa chăm sóc cây với việc tận dụng nguồn năng lượng mặt trời.',
    ],
    accessories: ecohubDirectX10,
    note: 'Sản phẩm yêu cầu điều kiện kết nối nguồn nước phù hợp. Việc lắp đặt và vận hành cần tuân thủ hướng dẫn kỹ thuật của VIO GREEN.',
  },
  {
    slug: 'ecohub-x10-hydro-grid',
    name: 'VIO GREEN ECOHUB X10 Hydro Grid – Electric & Direct Water Edition',
    shortName: 'ECOHUB X10 Hydro Grid',
    edition: 'Electric & Direct Water Edition',
    category: 'ecohub',
    area: '<10', power: 'grid', water: 'direct',
    hasAR: true,
    summary: 'Dùng điện trực tiếp và nước trực tiếp – vận hành ổn định cho không gian dưới 10m².',
    description: [
      'VIO GREEN ECOHUB X10 Hydro Grid – Electric & Direct Water Edition là hệ thống chăm sóc cây thông minh dành cho không gian dưới 10m², sử dụng điện trực tiếp và kết nối với nguồn nước trực tiếp. Sản phẩm phù hợp với những khu vực trồng cây đô thị có sẵn cả nguồn điện và nguồn nước, giúp đơn giản hóa quá trình tưới và chăm sóc cây.',
      'ECOHUB X10 Hydro Grid hỗ trợ đưa nước từ nguồn cấp trực tiếp đến khu vực trồng cây thông qua hệ thống tưới, đồng thời kết hợp quản lý dinh dưỡng để hỗ trợ quá trình chăm sóc. Hệ thống giúp giảm các thao tác tưới cây thủ công lặp lại, đặc biệt phù hợp với người dùng bận rộn hoặc thường xuyên không có mặt tại nhà.',
      'Sản phẩm có thể được sử dụng cho ban công, sân thượng và các khu vực xanh dưới 10m² có điều kiện kết nối điện và nước phù hợp. Đây là giải pháp hướng đến sự thuận tiện và ổn định trong quá trình chăm sóc cây đô thị.',
    ],
    accessories: ecohubDirectX10,
    note: 'Cần đảm bảo nguồn điện và nguồn nước đáp ứng yêu cầu kỹ thuật trước khi lắp đặt.',
  },
  {
    slug: 'ecohub-x20-sol',
    name: 'VIO GREEN ECOHUB X20 Sol – Solar Edition',
    shortName: 'ECOHUB X20 Sol',
    edition: 'Solar Edition',
    category: 'ecohub',
    area: '10-20', power: 'solar', water: 'tank',
    hasAR: true,
    summary: 'Hệ thống chăm sóc cây thông minh cho không gian 10–20m², vận hành bằng năng lượng mặt trời.',
    description: [
      'VIO GREEN ECOHUB X20 Sol – Solar Edition là hệ thống chăm sóc cây thông minh dành cho không gian xanh từ 10–20m², sử dụng năng lượng mặt trời để hỗ trợ vận hành. Sản phẩm được phát triển cho các khu vực trồng cây đô thị có quy mô lớn hơn dòng X10 nhưng vẫn cần một giải pháp chăm sóc thuận tiện và giảm thao tác thủ công.',
      'ECOHUB X20 Sol tích hợp giải pháp tưới và quản lý dinh dưỡng trong một hệ thống, hỗ trợ cung cấp nước và dưỡng chất đến khu vực cây trồng. Hệ thống giúp người dùng giảm thời gian dành cho các công việc chăm sóc lặp lại, đồng thời tận dụng nguồn năng lượng mặt trời trong quá trình vận hành.',
      'Sản phẩm phù hợp với sân thượng, ban công lớn hoặc các khu vực cây xanh có diện tích từ 10–20m². Đây là lựa chọn phù hợp cho người dùng đô thị muốn duy trì không gian xanh có quy mô lớn hơn mà vẫn hướng đến phương thức chăm sóc thuận tiện và tiết kiệm nguồn lực.',
    ],
    accessories: ecohubCommonX20,
    note: 'Cấu hình lắp đặt và nhu cầu nước/dinh dưỡng cần được xác định dựa trên diện tích và loại cây thực tế.',
  },
  {
    slug: 'ecohub-x20-grid',
    name: 'VIO GREEN ECOHUB X20 Grid – Electric Edition',
    shortName: 'ECOHUB X20 Grid',
    edition: 'Electric Edition',
    category: 'ecohub',
    area: '10-20', power: 'grid', water: 'tank',
    hasAR: true,
    summary: 'Hệ thống chăm sóc cây thông minh cho không gian 10–20m², dùng nguồn điện trực tiếp.',
    description: [
      'VIO GREEN ECOHUB X20 Grid – Electric Edition là hệ thống chăm sóc cây thông minh dành cho không gian xanh từ 10–20m², sử dụng nguồn điện trực tiếp. Sản phẩm hướng đến những không gian trồng cây có diện tích lớn hơn dòng X10 và có sẵn nguồn điện để vận hành hệ thống.',
      'ECOHUB X20 Grid hỗ trợ tự động hóa quá trình tưới và quản lý dinh dưỡng, giúp nước và dưỡng chất được phân phối đến khu vực cây trồng thông qua hệ thống dẫn và đầu tưới. Nhờ đó, người dùng có thể giảm bớt các thao tác chăm sóc thủ công và duy trì không gian xanh thuận tiện hơn trong sinh hoạt hằng ngày.',
      'Sản phẩm phù hợp với sân thượng, ban công lớn và các khu vực cây xanh từ 10–20m². ECOHUB X20 Grid đặc biệt phù hợp với người dùng muốn quản lý nhiều cây trong cùng một khu vực bằng một hệ thống chăm sóc tích hợp.',
    ],
    accessories: ecohubCommonX20,
    note: 'Sản phẩm sử dụng nguồn điện trực tiếp và cần được lắp đặt theo yêu cầu kỹ thuật của VIO GREEN.',
  },

  // ---------------- ECOBOX ----------------
  {
    slug: 'bio-tank-x10',
    name: 'VIO GREEN ECOBOX Bio-Tank X10',
    shortName: 'Bio-Tank X10',
    category: 'ecobox',
    fits: 'ECOHUB X10',
    summary: 'Hộp chứa phân sinh học cỡ tiêu chuẩn cho hệ thống ECOHUB X10 (dưới 10m²).',
    description: [
      'VIO GREEN ECOBOX Bio-Tank X10 là hộp chứa phân sinh học cỡ tiêu chuẩn dành cho hệ thống ECOHUB sử dụng trong không gian dưới 10m². Sản phẩm có chức năng lưu trữ và hỗ trợ cung cấp nguồn dinh dưỡng sinh học cho hệ thống chăm sóc cây, giúp quá trình bổ sung dinh dưỡng trở nên thuận tiện và đồng bộ hơn.',
      'Bio-Tank X10 được sử dụng cùng cấu hình ECOHUB X10 phù hợp, hỗ trợ hệ thống quản lý dinh dưỡng cho cây trong quá trình vận hành. Hộp có thể được thay thế hoặc bổ sung theo nhu cầu sử dụng và chu kỳ chăm sóc thực tế.',
      'Sản phẩm phù hợp với người dùng ECOHUB X10 cần bổ sung hoặc thay thế hộp chứa phân sinh học.',
    ],
    note: 'Chỉ sử dụng loại dinh dưỡng và cấu hình được VIO GREEN khuyến nghị; thực hiện việc thay thế theo hướng dẫn kỹ thuật của sản phẩm.',
  },
  {
    slug: 'bio-tank-x20',
    name: 'VIO GREEN ECOBOX Bio-Tank X20',
    shortName: 'Bio-Tank X20',
    category: 'ecobox',
    fits: 'ECOHUB X20',
    summary: 'Hộp chứa phân sinh học cỡ lớn cho hệ thống ECOHUB X20 (10–20m²).',
    description: [
      'VIO GREEN ECOBOX Bio-Tank X20 là hộp chứa phân sinh học cỡ lớn dành cho hệ thống ECOHUB sử dụng trong không gian từ 10–20m². Sản phẩm được thiết kế để lưu trữ và hỗ trợ cung cấp nguồn dinh dưỡng sinh học cho hệ thống chăm sóc cây, phù hợp với nhu cầu vận hành ở quy mô lớn hơn dòng X10.',
      'Bio-Tank X20 hỗ trợ quá trình quản lý dinh dưỡng trong hệ thống ECOHUB X20, giúp người dùng thuận tiện hơn trong việc bổ sung và thay thế nguồn dinh dưỡng cho cây. Sản phẩm là phụ kiện thay thế/bổ sung dành cho cấu hình tương thích.',
      'Phù hợp với người dùng ECOHUB X20 và các hệ thống có cấu hình tương ứng.',
    ],
    note: 'Việc sử dụng và thay thế cần thực hiện theo hướng dẫn của VIO GREEN để đảm bảo hệ thống hoạt động đúng cấu hình.',
  },
  {
    slug: 'aqua-tank-x10',
    name: 'VIO GREEN ECOBOX Aqua-Tank X10',
    shortName: 'Aqua-Tank X10',
    category: 'ecobox',
    fits: 'ECOHUB X10',
    summary: 'Hộp chứa nước/dịch xử lý cỡ tiêu chuẩn cho hệ thống ECOHUB X10.',
    description: [
      'VIO GREEN ECOBOX Aqua-Tank X10 là hộp chứa nước/dịch xử lý cỡ tiêu chuẩn dành cho hệ thống ECOHUB X10. Sản phẩm có chức năng lưu trữ và hỗ trợ cung cấp nước hoặc dịch xử lý cho hệ thống chăm sóc cây, phù hợp với những cấu hình ECOHUB sử dụng nguồn nước từ bình chứa.',
      'Aqua-Tank X10 giúp người dùng chủ động chuẩn bị nguồn nước cho quá trình chăm sóc cây mà không cần thực hiện việc tưới thủ công thường xuyên. Hộp có thể được sử dụng, bổ sung hoặc thay thế tùy theo cấu hình và nhu cầu thực tế của hệ thống.',
      'Sản phẩm phù hợp với ECOHUB X10 và các cấu hình tương thích.',
    ],
    note: 'Chỉ sử dụng nước hoặc dịch xử lý phù hợp với hướng dẫn kỹ thuật của VIO GREEN và đảm bảo vệ sinh hộp chứa trong quá trình sử dụng.',
  },
  {
    slug: 'aqua-tank-x20',
    name: 'VIO GREEN ECOBOX Aqua-Tank X20',
    shortName: 'Aqua-Tank X20',
    category: 'ecobox',
    fits: 'ECOHUB X20',
    summary: 'Hộp chứa nước/dịch xử lý cỡ lớn cho hệ thống ECOHUB X20.',
    description: [
      'VIO GREEN ECOBOX Aqua-Tank X20 là hộp chứa nước/dịch xử lý cỡ lớn dành cho hệ thống ECOHUB X20. Sản phẩm hỗ trợ lưu trữ và cung cấp nước hoặc dịch xử lý cho hệ thống chăm sóc cây, đáp ứng nhu cầu sử dụng ở các không gian xanh từ 10–20m².',
      'Aqua-Tank X20 giúp người dùng chủ động chuẩn bị nguồn nước cho hệ thống, đồng thời hỗ trợ quá trình tưới và chăm sóc cây theo cấu hình ECOHUB tương ứng. Đây là phụ kiện phù hợp cho người dùng cần thay thế hoặc bổ sung hộp chứa nước trong quá trình sử dụng.',
      'Sản phẩm tương thích với cấu hình ECOHUB X20 phù hợp.',
    ],
    note: 'Dung dịch sử dụng trong hộp cần tuân thủ hướng dẫn của VIO GREEN; không tự ý sử dụng các loại dung dịch không được khuyến nghị.',
  },

  // ---------------- PHỤ KIỆN TƯỚI ----------------
  {
    slug: 'bio-dripper',
    name: 'VIO GREEN Bio-Dripper – Bộ 10 đầu tưới nhỏ giọt định lượng',
    shortName: 'Bio-Dripper (bộ 10)',
    category: 'irrigation',
    fits: 'Mọi dòng ECOHUB',
    summary: 'Bộ 10 đầu tưới nhỏ giọt, điều chỉnh được lưu lượng, đưa nước/dịch đến từng gốc cây.',
    specs: [['Quy cách', '01 bộ gồm 10 đầu tưới nhỏ giọt']],
    description: [
      'VIO GREEN Bio-Dripper là bộ 10 đầu tưới nhỏ giọt dùng để phân phối nước hoặc dịch sinh học trực tiếp đến từng gốc cây/chậu cảnh. Sản phẩm được thiết kế để hỗ trợ tưới nhỏ giọt có kiểm soát, giúp nguồn nước hoặc dịch dinh dưỡng được đưa đến đúng vị trí cần thiết thay vì tưới dàn trải trên toàn bộ bề mặt.',
      'Đầu tưới có khả năng điều chỉnh lưu lượng, cho phép người dùng điều chỉnh lượng nước/dịch phù hợp với cấu hình hệ thống và nhu cầu chăm sóc cây. Bio-Dripper có thể được sử dụng cùng hệ thống ECOHUB và kết nối thông qua VIO GREEN Hose.',
      'Phù hợp với chậu cây, khu vực trồng cây và hệ thống chăm sóc cây đô thị.',
    ],
    accessories: ['vio-green-hose'],
    note: 'Lưu lượng thực tế phụ thuộc vào cấu hình hệ thống và điều kiện vận hành; cần lắp đặt đúng hướng dẫn để đảm bảo hiệu quả phân phối nước/dịch.',
  },
  {
    slug: 'vio-green-hose',
    name: 'VIO GREEN Hose 6/8/10 mm – Ống dây tưới nhỏ giọt',
    shortName: 'VIO GREEN Hose',
    category: 'irrigation',
    fits: 'Mọi dòng ECOHUB',
    variants: { label: 'Đường kính', options: ['6 mm', '8 mm', '10 mm'] },
    summary: 'Ống dây dẫn nước và dịch sinh học, kết nối ECOHUB với từng vị trí tưới.',
    description: [
      'VIO GREEN Hose 6/8/10 mm là ống dây dẫn nước và dịch sinh học được sử dụng trong hệ thống tưới của VIO GREEN. Sản phẩm đóng vai trò kết nối giữa hệ thống ECOHUB với các vị trí tưới, giúp đưa nước hoặc dịch dinh dưỡng đến từng khu vực cây trồng.',
      'Tùy theo cấu hình, VIO GREEN Hose có thể được sử dụng làm dây dẫn nhánh đến từng gốc cây/chậu cảnh, dây dẫn chính cho hệ thống chăm sóc không gian nhỏ dưới 10m² hoặc dây dẫn trục chính cho hệ thống có diện tích 10–20m².',
      'Thiết kế dạng ống dẫn giúp hệ thống có thể triển khai linh hoạt theo bố trí thực tế của khu vực trồng cây. Sản phẩm có thể kết hợp với Bio-Dripper và các phụ kiện tưới tương thích của VIO GREEN.',
    ],
    accessories: ['bio-dripper'],
    note: 'Cần xác nhận đúng đường kính ống và cấu hình trước khi mua; lắp đặt theo sơ đồ kỹ thuật của hệ thống để đảm bảo khả năng kết nối và dẫn nước phù hợp.',
  },

  // ---------------- DINH DƯỠNG ----------------
  {
    slug: 'bio-nutri-25g',
    name: 'VIO GREEN Bio-Nutri – Phân bón sinh học gói 25g',
    shortName: 'Bio-Nutri 25g',
    category: 'nutrition',
    fits: 'Mọi dòng ECOHUB',
    specs: [['Quy cách', '01 gói 25g']],
    summary: 'Phân bón sinh học dạng gói lẻ 25g, dễ bảo quản, dễ chia theo từng chu kỳ chăm sóc.',
    description: [
      'VIO GREEN Bio-Nutri 25g là phân bón sinh học dạng gói lẻ, được thiết kế để bổ sung dinh dưỡng cho cây trong hệ thống chăm sóc VIO GREEN. Quy cách 25g giúp người dùng dễ bảo quản, dễ sử dụng và thuận tiện trong việc chuẩn bị lượng dinh dưỡng theo từng chu kỳ chăm sóc.',
      'Bio-Nutri có thể được sử dụng cùng hệ thống ECOHUB theo cấu hình phù hợp, hỗ trợ quá trình quản lý và bổ sung dinh dưỡng cho cây. Dạng gói lẻ phù hợp với người dùng muốn chủ động thay thế hoặc bổ sung dinh dưỡng định kỳ mà không cần mở toàn bộ lượng sản phẩm cùng lúc.',
    ],
    note: 'Liều lượng, cách pha/trộn, tần suất sử dụng và đối tượng cây trồng cần thực hiện theo hướng dẫn chính thức của VIO GREEN. Không tự ý tăng liều lượng khi chưa có hướng dẫn kỹ thuật.',
  },
  {
    slug: 'bio-nutri-multi-pack',
    name: 'VIO GREEN Bio-Nutri – Hộp phân bón sinh học Multi-Pack',
    shortName: 'Bio-Nutri Multi-Pack',
    category: 'nutrition',
    fits: 'Mọi dòng ECOHUB',
    specs: [['Quy cách', 'Hộp nhiều gói lẻ theo quy cách đóng gói chính thức của VIO GREEN']],
    summary: 'Hộp nhiều gói lẻ – dự trữ dinh dưỡng cho nhiều chu kỳ chăm sóc.',
    description: [
      'VIO GREEN Bio-Nutri Multi-Pack là hộp phân bón sinh học gồm nhiều gói lẻ, được thiết kế để đáp ứng nhu cầu sử dụng dinh dưỡng định kỳ cho hệ thống chăm sóc cây VIO GREEN. Quy cách Multi-Pack giúp người dùng chủ động dự trữ lượng phân bón cần thiết cho nhiều chu kỳ chăm sóc, đồng thời thuận tiện trong việc bảo quản và sử dụng từng gói theo nhu cầu.',
      'Bio-Nutri Multi-Pack phù hợp với người dùng ECOHUB muốn duy trì nguồn dinh dưỡng ổn định trong quá trình chăm sóc cây. Các gói lẻ có thể được sử dụng theo chu kỳ và liều lượng được khuyến nghị, giúp việc bổ sung dinh dưỡng trở nên đơn giản và dễ kiểm soát hơn.',
    ],
    note: 'Bảo quản sản phẩm theo hướng dẫn trên bao bì và sử dụng đúng liều lượng được khuyến nghị.',
  },

  // ---------------- DỊCH VỤ ----------------
  {
    slug: 'vio-care-6m',
    name: 'VIO GREEN VIO-Care – Gói bảo hành mở rộng 6 tháng',
    shortName: 'VIO-Care 6 tháng',
    category: 'service',
    specs: [['Thời hạn', '6 tháng theo điều kiện của gói dịch vụ']],
    summary: 'Gói bảo hành mở rộng 6 tháng cho sản phẩm VIO GREEN đủ điều kiện.',
    description: [
      'VIO GREEN VIO-Care 6M là gói dịch vụ bảo hành mở rộng trong thời gian 6 tháng dành cho sản phẩm VIO GREEN đủ điều kiện áp dụng. Gói dịch vụ được xây dựng nhằm hỗ trợ khách hàng yên tâm hơn trong quá trình sử dụng sản phẩm và duy trì khả năng vận hành ổn định trong thời gian dài hơn.',
      'VIO-Care 6M cung cấp quyền lợi bảo hành và/hoặc bảo dưỡng theo phạm vi, điều kiện và chính sách dịch vụ hiện hành của VIO GREEN. Gói dịch vụ có thể được áp dụng cho sản phẩm đủ điều kiện theo quy định tại thời điểm mua hàng.',
    ],
    note: 'Gói bảo hành không mặc nhiên áp dụng cho mọi trường hợp hư hỏng. Các trường hợp được bảo hành, loại trừ bảo hành, phương thức tiếp nhận và phạm vi hỗ trợ thực hiện theo chính sách VIO-Care chính thức của VIO GREEN.',
  },
  {
    slug: 'vio-care-12m',
    name: 'VIO GREEN VIO-Care – Gói bảo hành mở rộng 12 tháng',
    shortName: 'VIO-Care 12 tháng',
    category: 'service',
    specs: [['Thời hạn', '12 tháng theo điều kiện của gói dịch vụ']],
    summary: 'Gói bảo hành mở rộng 12 tháng cho khách hàng sử dụng lâu dài.',
    description: [
      'VIO GREEN VIO-Care 12M là gói dịch vụ bảo hành mở rộng trong thời gian 12 tháng dành cho sản phẩm VIO GREEN đủ điều kiện áp dụng. Đây là gói dịch vụ dành cho khách hàng có nhu cầu sử dụng sản phẩm trong thời gian dài và mong muốn có thêm thời gian hỗ trợ bảo hành/bảo dưỡng sau thời hạn tiêu chuẩn.',
      'VIO-Care 12M hỗ trợ quyền lợi bảo hành và/hoặc bảo dưỡng theo phạm vi và điều kiện được VIO GREEN quy định. Gói dịch vụ giúp khách hàng chủ động hơn trong việc duy trì và xử lý các vấn đề kỹ thuật thuộc phạm vi được bảo hành trong thời gian hiệu lực.',
    ],
    note: 'Quyền lợi, phạm vi bảo hành, trường hợp loại trừ, phương thức tiếp nhận và các điều kiện áp dụng được thực hiện theo chính sách VIO-Care chính thức của VIO GREEN.',
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
  if (p.category === 'ecohub' && p.area && p.power && p.water)
    return [areaLabels[p.area], powerLabels[p.power], waterLabels[p.water]];
  if (p.fits) return ['Dùng cho ' + p.fits.replace(/^Mọi/, 'mọi')];
  return [];
};

/** Dữ liệu gọn gửi xuống trình duyệt (giỏ hàng, chatbot, AR) */
export const clientProducts = products.map((p) => ({
  slug: p.slug,
  name: p.name,
  shortName: p.shortName,
  category: p.category,
  area: p.area ?? null,
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
