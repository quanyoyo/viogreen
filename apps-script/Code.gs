/**
 * VIO GREEN – nhận dữ liệu form từ website và ghi vào Google Sheet.
 * Mỗi loại form ghi vào 1 tab riêng: "Đơn hàng", "Liên hệ", "Nhận tin", "Chatbot".
 * Hướng dẫn cài đặt: xem README.md cùng thư mục.
 */

// (Tùy chọn) email nhận thông báo khi có đơn/liên hệ mới. Để '' nếu không cần.
const NOTIFY_EMAIL = '';

const SHEETS = {
  order: {
    name: 'Đơn hàng',
    cols: [['sentAt', 'Thời gian'], ['orderId', 'Mã đơn'], ['status', 'Trạng thái'], ['name', 'Họ tên'], ['phone', 'Điện thoại'],
      ['email', 'Email'], ['province', 'Tỉnh/TP'], ['ward', 'Phường/Xã'], ['address', 'Địa chỉ'], ['shipping', 'Giao hàng'],
      ['items', 'Sản phẩm'], ['totalQty', 'Tổng SL'], ['total', 'Tổng tiền'], ['note', 'Ghi chú'], ['page', 'Trang']],
  },
  contact: {
    name: 'Liên hệ',
    cols: [['sentAt', 'Thời gian'], ['status', 'Trạng thái'], ['name', 'Họ tên'], ['phone', 'Điện thoại'], ['email', 'Email'],
      ['company', 'Công ty'], ['province', 'Khu vực'], ['space', 'Loại không gian'], ['area', 'Diện tích'], ['message', 'Lời nhắn'],
      ['source', 'Nguồn'], ['page', 'Trang']],
  },
  newsletter: { name: 'Nhận tin', cols: [['sentAt', 'Thời gian'], ['email', 'Email'], ['page', 'Trang']] },
  'chat-lead': {
    name: 'Chatbot',
    cols: [['sentAt', 'Thời gian'], ['status', 'Trạng thái'], ['name', 'Họ tên'], ['phone', 'Điện thoại'], ['topic', 'Chủ đề'],
      ['message', 'Khách đã hỏi'], ['page', 'Trang']],
  },
};

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const data = JSON.parse(e.postData.contents || '{}');
    const cfg = SHEETS[data.type];
    if (!cfg) return json({ ok: false, error: 'unknown type' });

    // Chống spam đơn giản
    if (data.website) return json({ ok: true });
    const text = JSON.stringify(data);
    if (text.length > 20000) return json({ ok: false, error: 'too large' });

    const sheet = getSheet(cfg);
    data.status = data.status || 'Mới';
    data.sentAt = new Date(); // giờ theo múi giờ của file Sheet
    sheet.appendRow(cfg.cols.map(([k]) => clean(data[k])));

    if (NOTIFY_EMAIL && data.type !== 'newsletter') {
      const subject = `[VIO GREEN] ${cfg.name} mới${data.orderId ? ' ' + data.orderId : ''} – ${data.name || data.email || ''}`;
      const body = cfg.cols.map(([k, label]) => `${label}: ${clean(data[k])}`).join('\n');
      MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
    }
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json({ ok: true, service: 'VIO GREEN forms' });
}

function getSheet(cfg) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(cfg.name);
  if (!sh) {
    sh = ss.insertSheet(cfg.name);
    sh.appendRow(cfg.cols.map(([, label]) => label));
    sh.getRange(1, 1, 1, cfg.cols.length).setFontWeight('bold').setBackground('#355e3b').setFontColor('#ffffff');
    sh.setFrozenRows(1);
  }
  return sh;
}

// Chặn công thức độc hại (=, +, -, @ ở đầu ô)
function clean(v) {
  if (v === undefined || v === null) return '';
  if (v instanceof Date) return v;
  const s = String(v).slice(0, 5000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
