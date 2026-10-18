// Đánh giá khách hàng — CHỈ dùng đánh giá THẬT (CLAUDE.md mục 2: không dùng đánh giá giả).
// Danh sách trống = mục "Khách hàng nói gì" tự ẩn khỏi trang chủ.
// Thêm đánh giá, ví dụ:
//   { name: 'Chị Lan', place: 'Ban công căn hộ, Hà Nội', product: 'ECOHUB Sol', rating: 5, text: '…', date: '2026-11-02' }
// photo (tuỳ chọn): ảnh đặt trong public/reviews/, ghi '/reviews/ten-anh.webp'.
export interface Review {
  name: string;
  place?: string;
  product?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  date?: string;
  photo?: string;
}

export const reviews: Review[] = [];
