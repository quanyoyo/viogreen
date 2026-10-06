# Kết nối form của web với Google Sheet

Đơn hàng, form liên hệ, đăng ký nhận tin và số điện thoại khách để lại qua chatbot MIO sẽ tự ghi vào một Google Sheet (mỗi loại 1 tab).

## Cài đặt (khoảng 5 phút)

1. Tạo một Google Sheet mới, đặt tên ví dụ **VIO GREEN – Đơn hàng web**.
2. Trong Sheet: **Tiện ích mở rộng → Apps Script**.
3. Xóa code mẫu, dán toàn bộ nội dung file `Code.gs` vào. (Tùy chọn) điền email vào `NOTIFY_EMAIL` để nhận thông báo khi có đơn mới.
4. Bấm **Triển khai → Tùy chọn triển khai mới**:
   - Loại: **Ứng dụng web**
   - Thực thi dưới dạng: **Tôi**
   - Người có quyền truy cập: **Bất kỳ ai**
5. Bấm **Triển khai**, cấp quyền khi Google hỏi, rồi sao chép **URL ứng dụng web** (dạng `https://script.google.com/macros/s/…/exec`).
6. Mở `src/data/site.ts` trong code web, dán URL vào `formEndpoint: '…'`, rồi build/deploy lại web.

Kiểm tra: mở URL ở bước 5 trên trình duyệt, thấy `{"ok":true,...}` là được. Gửi thử một đơn trên web → tab **Đơn hàng** xuất hiện trong Sheet.

## Lưu ý

- Khi sửa `Code.gs` sau này, phải **Triển khai → Quản lý triển khai → Chỉnh sửa → Phiên bản mới** thì thay đổi mới có hiệu lực (URL giữ nguyên).
- Cột **Trạng thái** mặc định là "Mới" — nhân viên tự đổi thành "Đã gọi", "Đã chốt"… để theo dõi.
- Khi `formEndpoint` để trống, web chạy ở **chế độ thử**: form vẫn báo thành công nhưng không gửi dữ liệu đi.
