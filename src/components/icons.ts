// Bộ icon dùng trên web: Lucide (MIT/ISC) + vài icon thương hiệu vẽ tay.
// Thêm icon mới: import '…/icons/<ten>.svg?raw' từ lucide-static rồi khai báo trong `lucide`.
import leaf from 'lucide-static/icons/leaf.svg?raw';
import search from 'lucide-static/icons/search.svg?raw';
import help from 'lucide-static/icons/circle-help.svg?raw';
import cart from 'lucide-static/icons/shopping-cart.svg?raw';
import menu from 'lucide-static/icons/menu.svg?raw';
import close from 'lucide-static/icons/x.svg?raw';
import sparkles from 'lucide-static/icons/sparkles.svg?raw';
import chevronRight from 'lucide-static/icons/chevron-right.svg?raw';
import chevronDown from 'lucide-static/icons/chevron-down.svg?raw';
import phone from 'lucide-static/icons/phone.svg?raw';
import clock from 'lucide-static/icons/clock.svg?raw';
import pin from 'lucide-static/icons/map-pin.svg?raw';
import email from 'lucide-static/icons/mail.svg?raw';
import truck from 'lucide-static/icons/truck.svg?raw';
import warranty from 'lucide-static/icons/shield-check.svg?raw';
import exchange from 'lucide-static/icons/refresh-cw.svg?raw';
import support from 'lucide-static/icons/headset.svg?raw';
import ar from 'lucide-static/icons/scan.svg?raw';
import arrowCircle from 'lucide-static/icons/circle-arrow-right.svg?raw';
import arrowRight from 'lucide-static/icons/arrow-right.svg?raw';
import arrowLeft from 'lucide-static/icons/arrow-left.svg?raw';
import camera from 'lucide-static/icons/camera.svg?raw';
import bag from 'lucide-static/icons/shopping-bag.svg?raw';
import drop from 'lucide-static/icons/droplets.svg?raw';
import solar from 'lucide-static/icons/sun.svg?raw';
import mobile from 'lucide-static/icons/smartphone.svg?raw';
import sprout from 'lucide-static/icons/sprout.svg?raw';
import home from 'lucide-static/icons/house.svg?raw';
import hourglass from 'lucide-static/icons/hourglass.svg?raw';
import maximize from 'lucide-static/icons/maximize.svg?raw';
import settings from 'lucide-static/icons/settings.svg?raw';
import product from 'lucide-static/icons/package.svg?raw';
import science from 'lucide-static/icons/flask-conical.svg?raw';
import warning from 'lucide-static/icons/triangle-alert.svg?raw';
import minus from 'lucide-static/icons/minus.svg?raw';
import plus from 'lucide-static/icons/plus.svg?raw';
import info from 'lucide-static/icons/info.svg?raw';
import box from 'lucide-static/icons/box.svg?raw';
import user from 'lucide-static/icons/user.svg?raw';
import check from 'lucide-static/icons/check.svg?raw';
import quote from 'lucide-static/icons/quote.svg?raw';
import layers from 'lucide-static/icons/layers.svg?raw';
import move from 'lucide-static/icons/move.svg?raw';
import chat from 'lucide-static/icons/message-circle.svg?raw';
import send from 'lucide-static/icons/send.svg?raw';
import refresh from 'lucide-static/icons/rotate-ccw.svg?raw';
import tree from 'lucide-static/icons/tree-deciduous.svg?raw';
import globe from 'lucide-static/icons/globe.svg?raw';
import trash from 'lucide-static/icons/trash-2.svg?raw';
import mouse from 'lucide-static/icons/mouse-pointer-click.svg?raw';
import logout from 'lucide-static/icons/log-out.svg?raw';
import lock from 'lucide-static/icons/lock.svg?raw';
import copy from 'lucide-static/icons/copy.svg?raw';
import wallet from 'lucide-static/icons/wallet.svg?raw';

const lucide = {
  leaf, search, help, cart, menu, close, sparkles, chevronRight, chevronDown, phone, clock, pin, email,
  truck, warranty, exchange, support, ar, arrowCircle, arrowRight, arrowLeft, camera, bag, drop, solar,
  mobile, sprout, home, hourglass, maximize, settings, product, science, warning, minus, plus, info, box,
  user, check, quote, layers, move, chat, send, refresh, tree, globe, trash, mouse, logout, lock, copy, wallet,
};

const brand = (path: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${path}</svg>`;

const brands = {
  facebook: brand('<path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1z"/>'),
  tiktok: brand('<path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-1.8-2.5V9.7a5.8 5.8 0 1 0 5 5.7V9.1a7.4 7.4 0 0 0 4.3 1.4V7.4s-1.9.1-3.3-1.6z"/>'),
  instagram: brand('<path d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm6-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM21 8c-.1-1.5-.4-2.8-1.5-3.9S17.1 2.7 15.6 2.6C14 2.5 10 2.5 8.4 2.6 6.9 2.7 5.6 3 4.5 4.1S3.1 6.5 3 8c-.1 1.6-.1 6.4 0 8 .1 1.5.4 2.8 1.5 3.9s2.4 1.4 3.9 1.5c1.6.1 5.6.1 7.2 0 1.5-.1 2.8-.4 3.9-1.5s1.4-2.4 1.5-3.9c.1-1.6.1-6.4 0-8zm-2 9.7a3 3 0 0 1-1.7 1.7c-1.2.5-3.9.4-5.3.4s-4.1.1-5.3-.4A3 3 0 0 1 5 17.7c-.5-1.2-.4-3.9-.4-5.3s-.1-4.1.4-5.3A3 3 0 0 1 6.7 5.4C7.9 4.9 10.6 5 12 5s4.1-.1 5.3.4A3 3 0 0 1 19 7.1c.5 1.2.4 3.9.4 5.3s.1 4.1-.4 5.3z"/>'),
  youtube: brand('<path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.3 5 12 5 12 5s-6.3 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8c1.5.4 7.8.4 7.8.4s6.3 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z"/>'),
  messenger: brand('<path d="M12 2C6.4 2 2 6.1 2 11.7c0 2.9 1.2 5.5 3.2 7.3v3l3-1.6c1.2.3 2.5.5 3.8.5 5.6 0 10-4.1 10-9.7S17.6 2 12 2zm1 13-2.5-2.7L5.6 15 11 9.3l2.6 2.7L18.4 9 13 15z"/>'),
  // Shopee: túi mua hàng có chữ S (khoét bằng mask để đổi màu hover vẫn thấy chữ)
  shopee: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><mask id="vg-shopee-s"><rect width="24" height="24" fill="#fff"/><path d="M14.3 12.4c-.4-.7-1.2-1.1-2.3-1.1-1.2 0-2.1.6-2.1 1.5 0 2 4.5 1.1 4.5 3.2 0 1-.9 1.7-2.4 1.7-1.1 0-2-.4-2.6-1.3" fill="none" stroke="#000" stroke-width="1.6" stroke-linecap="round"/></mask><path d="M8.6 7.6V6.8a3.4 3.4 0 0 1 6.8 0v.8" fill="none" stroke="currentColor" stroke-width="1.8"/><path mask="url(#vg-shopee-s)" fill="currentColor" d="M3.8 7.6h16.4l-1.1 12.6a2 2 0 0 1-2 1.8H6.9a2 2 0 0 1-2-1.8L3.8 7.6z"/></svg>',
  zalo: brand('<path d="M12 2C6.5 2 2 6 2 11c0 2.6 1.2 5 3.2 6.6-.1.9-.5 2.2-1.5 3.1 0 0 2.6.2 4.6-1.4 1.2.4 2.4.6 3.7.6 5.5 0 10-4 10-9S17.5 2 12 2zM8.6 13.6H5.4v-.6l2-2.6h-2v-.8h3.1v.6l-2 2.6h2.1v.8zm2.8 0h-.8v-.3c-.3.2-.6.4-1 .4-.9 0-1.5-.7-1.5-1.6s.6-1.6 1.5-1.6c.4 0 .7.1 1 .4v-.3h.8v3zm1.6 0h-.9V9.4h.9v4.2zm2.6.1c-.9 0-1.7-.7-1.7-1.6s.8-1.6 1.7-1.6 1.7.7 1.7 1.6-.8 1.6-1.7 1.6zm0-2.4c-.5 0-.8.4-.8.8s.3.8.8.8.8-.4.8-.8-.3-.8-.8-.8zm-5.6 0c-.4 0-.8.4-.8.8s.4.8.8.8.8-.4.8-.8-.4-.8-.8-.8z"/>'),
};

// Logo "G" nhiều màu của Google (nút đăng nhập) — giữ màu gốc theo quy định thương hiệu Google
const google = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.7z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1z"/><path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z"/></svg>';

export const icons: Record<string, string> = { ...lucide, ...brands, google };
export type IconName = keyof typeof lucide | keyof typeof brands | 'google';

/** Trả về chuỗi SVG (đã bỏ comment license, thêm class) — dùng cả ở server lẫn client */
export function iconSvg(name: IconName | string, cls = ''): string {
  const raw = icons[name];
  if (!raw) throw new Error('Unknown icon: ' + name);
  return raw
    .replace(/<!--[\s\S]*?-->\s*/, '')
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\s(class|aria-hidden)="[^"]*"/g, '')
    .replace('<svg ', `<svg aria-hidden="true" focusable="false"${cls ? ` class="${cls}"` : ''} `);
}
