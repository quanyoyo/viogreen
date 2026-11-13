// Đánh giá khách hàng — nguồn: dữ liệu đánh giá 5 sao từ khách hàng VIO GREEN.
// Danh sách trống = mục "Khách hàng nói gì" tự ẩn khỏi trang chủ.
export interface Review {
  name: string;
  place?: string;
  product?: string;
  productSlug?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  date?: string;
  photo?: string;
}

export const reviews: Review[] = [
  {
    name: 'Mai Lan',
    place: 'Căn hộ chung cư, Cầu Giấy, Hà Nội',
    product: 'ECOHUB Sol',
    productSlug: 'ecohub-sol',
    rating: 5,
    text: 'Ban công nhà mình đón nắng gắt, trước đây đi công tác vài ngày là cây héo rũ. Từ ngày lắp ECOHUB Sol chạy năng lượng mặt trời, cây lúc nào cũng xanh tốt, nước và dinh dưỡng cấp tự động rất chuẩn. Rất hài lòng!',
    date: '2026-11-05',
  },
  {
    name: 'Quốc Tuấn',
    place: 'Nhà phố, Quận 7, TP.HCM',
    product: 'ECOHUB Grid Plus',
    productSlug: 'ecohub-grid-plus',
    rating: 5,
    text: 'Thiết bị hoàn thiện tỉ mỉ, thẩm mỹ cao, đặt ở góc ban công vừa gọn gàng vừa hiện đại. Mình theo dõi lượng nước qua app rất tiện. Đội ngũ kỹ thuật hỗ trợ hướng dẫn lắp đặt tận tình.',
    date: '2026-11-08',
  },
  {
    name: 'Hoàng Nam',
    place: 'Khu đô thị Ecopark, Hưng Yên',
    product: 'ECOHUB Sol Pro',
    productSlug: 'ecohub-sol-pro',
    rating: 5,
    text: 'Gia đình tôi đều mê cây cảnh nhưng công việc bận rộn, ngại bê xách nước tưới mỗi ngày. Hệ thống tự động hoá hoàn toàn, dàn cây trên sân thượng phát triển rất khoẻ mạnh. Đáng tiền từng đồng.',
    date: '2026-11-10',
  },
];
