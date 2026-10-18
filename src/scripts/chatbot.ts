// Chatbot MIO v1 — trả lời theo kịch bản & từ khóa, chạy hoàn toàn trên trình duyệt.
// Nâng cấp v2: thay hàm `answer()` bằng lời gọi tới Cloudflare Worker có AI, dùng cùng bộ kiến thức.
import { clientProducts, type ClientProduct } from './data';
import { faq } from '../data/faq';
import { site, telHref } from '../data/site';
import { kb, greetings, thanks, humanKeys, pickKeys, accessoryKeys, quickQuestions } from '../data/chatbot-kb';
import { addToCart } from './cart';
import { submitLead } from './forms';
import { $, openLayer, closeLayer, toast } from './ui';

const chat = $('[data-chat]');
const log = $('[data-chat-log]');
const chipsBox = $('[data-chat-chips]');
const form = $<HTMLFormElement>('[data-chat-form]');
const KEY = 'vg-chat';

type Msg = { from: 'bot' | 'me'; html: string; t: number };
type Mode = { kind: 'idle' } | { kind: 'pick'; step: 'plants' | 'power' | 'water'; plants?: string; power?: string } | { kind: 'lead'; step: 'name' | 'phone'; name?: string; topic: string };
let mode: Mode = { kind: 'idle' };
let history: Msg[] = [];

/* ---------- Tiện ích ---------- */
export const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9.+-]+/g, ' ').trim();
const has = (text: string, key: string) => ` ${text} `.includes(` ${key} `);
const score = (text: string, keys: string[]) => keys.reduce((s, k) => s + (has(text, k) ? k.split(' ').length : 0), 0);
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const nl = (s: string) => esc(s).replace(/\n/g, '<br>');
const time = (t: number) => new Date(t).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
const link = (label: string, href: string) => `<a href="${href}" class="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand hover:bg-brand hover:text-white">${esc(label)} →</a>`;

function isWorkingHours(d = new Date()) {
  // Giờ Việt Nam (UTC+7) bất kể máy người dùng ở múi giờ nào
  const vn = new Date(d.getTime() + (d.getTimezoneOffset() + 420) * 60000);
  const [sh, sm] = site.workingHours.start.split(':').map(Number);
  const [eh, em] = site.workingHours.end.split(':').map(Number);
  const mins = vn.getHours() * 60 + vn.getMinutes();
  return site.workingHours.days.includes(vn.getDay()) && mins >= sh * 60 + sm && mins <= eh * 60 + em;
}

/* ---------- Hiển thị ---------- */
function bubble(m: Msg) {
  const me = m.from === 'me';
  return `<div class="flex ${me ? 'justify-end' : 'items-end gap-2'}">
    ${me ? '' : `<img src="${site.mio.head}" alt="MIO" width="32" height="32" class="mb-5 size-8 shrink-0 rounded-full bg-white object-cover ring-1 ring-line">`}
    <div class="max-w-[82%]">
      <div class="${me ? 'rounded-2xl rounded-br-md bg-brand text-white' : 'rounded-2xl rounded-bl-md bg-white text-ink ring-1 ring-line'} px-3.5 py-2.5 text-sm leading-relaxed [&_a]:mt-1">${m.html}</div>
      <p class="mt-1 text-[10px] text-muted ${me ? 'text-right' : ''}">${time(m.t)}</p>
    </div></div>`;
}
const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify({ history: history.slice(-40), mode })); } catch { /* ignore */ } };
const scroll = () => log && (log.scrollTop = log.scrollHeight);

function push(from: Msg['from'], html: string) {
  log?.querySelector('[data-chat-welcome]')?.remove(); // bắt đầu trò chuyện → bỏ màn hình chào
  const m = { from, html, t: Date.now() };
  history.push(m);
  log?.insertAdjacentHTML('beforeend', bubble(m));
  scroll();
  save();
}

async function bot(html: string, chips?: string[]) {
  const typing = document.createElement('div');
  typing.className = 'flex items-center gap-2';
  typing.innerHTML = `<img src="${site.mio.head}" alt="MIO" width="32" height="32" class="size-8 shrink-0 rounded-full bg-white object-cover ring-1 ring-line"><span class="flex gap-1 rounded-2xl bg-white px-3 py-3 ring-1 ring-line"><i class="size-1.5 animate-bounce rounded-full bg-brand-300"></i><i class="size-1.5 animate-bounce rounded-full bg-brand-300 [animation-delay:.15s]"></i><i class="size-1.5 animate-bounce rounded-full bg-brand-300 [animation-delay:.3s]"></i></span>`;
  log?.append(typing);
  scroll();
  await new Promise((r) => setTimeout(r, Math.min(900, 300 + html.length * 2)));
  typing.remove();
  push('bot', html);
  setChips(chips ?? MAIN_CHIPS);
}

const MAIN_CHIPS = ['Tư vấn chọn máy', 'Phụ kiện đi kèm', 'Giao hàng', 'Đổi trả', 'Bảo hành', 'Gặp nhân viên'];
function setChips(list: string[]) {
  if (!chipsBox) return;
  chipsBox.innerHTML = list.map((c) => `<button type="button" class="chip min-h-9 shrink-0 px-3.5 py-1.5 text-xs" data-chip="${esc(c)}">${esc(c)}</button>`).join('');
  chipsBox.hidden = list.length === 0;
  chipsBox.scrollLeft = 0;
}
const kbHtml = (k: (typeof kb)[number]) =>
  nl(k.answer) + (k.links?.length ? `<div class="mt-2 flex flex-wrap gap-1.5">${k.links.map(([l, h]) => link(l, h)).join('')}</div>` : '');

/* ---------- Gợi ý sản phẩm ---------- */
const productCard = (p: ClientProduct) => `
  <div class="mt-2 rounded-xl bg-cream p-3 ring-1 ring-line">
    <p class="font-semibold">${esc(p.shortName)}</p>
    <p class="mt-0.5 text-xs text-muted">${esc(p.summary)}</p>
    <div class="mt-2 flex flex-wrap gap-1.5">${link('Xem chi tiết', `/san-pham/${p.slug}/`)}
      <button type="button" data-chat-add="${p.slug}" class="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white hover:bg-brand-700">+ Thêm vào giỏ</button>
      ${p.hasAR ? `<button type="button" data-ar="${p.slug}" class="rounded-full px-3 py-1 text-xs font-semibold text-brand ring-1 ring-brand-200 hover:bg-brand-50">Thử AR</button>` : ''}</div>
  </div>`;

function findProducts(text: string): ClientProduct[] {
  const t = norm(text).replace(/-/g, ' ');
  // khớp tên rút gọn: "sol plus", "grid pro", "bio tank s", "aqua tank pro"… (bỏ chữ chung ecohub / vio / green)
  const scored = clientProducts.map((p) => {
    const words = norm(p.shortName).replace(/-/g, ' ').replace(/\b(ecohub|vio|green)\b/g, ' ').split(' ').filter((w) => w.length > 1 || w === 's');
    const hit = words.filter((w) => has(t, w)).length;
    return { p, s: hit / words.length, hit };
  }).filter((x) => x.hit > 0 && x.s >= 0.66).sort((a, b) => b.s - a.s || b.hit - a.hit);
  if (!scored.length) return [];
  // "sol plus" khớp trọn cả Sol lẫn Sol Plus → lấy bản khớp nhiều chữ hơn
  const { s: best, hit: most } = scored[0];
  return scored.filter((x) => x.s === best && x.hit === most).map((x) => x.p).slice(0, 3);
}

function recommend(plants: string, power: string, water: string): ClientProduct[] {
  const hubs = clientProducts.filter((p) => p.category === 'ecohub');
  let list = hubs.filter((p) => (plants === 'any' || p.plants === plants) && (power === 'any' || p.power === power) && (water === 'any' || p.water === water));
  if (!list.length) list = hubs.filter((p) => (plants === 'any' || p.plants === plants) && (power === 'any' || p.power === power));
  if (!list.length) list = hubs.filter((p) => plants === 'any' || p.plants === plants);
  return list.slice(0, 3);
}

/* ---------- Kịch bản ---------- */
const startPick = () => {
  mode = { kind: 'pick', step: 'plants' };
  return bot('Mình hỏi nhanh 3 câu để gợi ý đúng ECOHUB nhé 🌱<br><b>1/3.</b> Bạn chăm khoảng bao nhiêu cây (chậu)?', ['Dưới 15 cây', 'Dưới 30 cây', 'Trên 30 cây', 'Chưa rõ']);
};
const startLead = (topic: string, intro?: string) => {
  mode = { kind: 'lead', step: 'name', topic };
  const off = isWorkingHours() ? '' : `<br><i class="text-muted">Hiện đang ngoài giờ làm việc (${esc(site.hours)}), nhân viên sẽ gọi lại ngay đầu giờ làm việc tiếp theo.</i>`;
  return bot(`${intro ?? 'Để nhân viên VIO GREEN gọi lại tư vấn,'} bạn cho MIO xin <b>tên</b> của bạn nhé?${off}`, ['Gọi hotline luôn', 'Thôi, để sau']);
};

async function handlePick(text: string) {
  if (mode.kind !== 'pick') return;
  const t = norm(text);
  if (mode.step === 'plants') {
    // Số cây: "duoi 15 cay", "20 chau", "tren 30"… Khách ghi diện tích (m2) thì quy đổi: <10m² → <15 cây, 10–20m² → <30 cây
    const sqm = /\d\s*m\b|m2|met/.test(t);
    const nums = (t.match(/\d+/g) ?? []).map(Number).filter((n) => n !== 2 || !/m2/.test(t));
    const max = nums.length ? Math.max(...nums) : NaN;
    const plants = sqm
      ? (max < 10 ? '<15' : max <= 20 ? '<30' : max > 20 ? 'big' : 'any')
      : t.includes('duoi 15') || max < 15 ? '<15'
      : t.includes('tren 30') || max > 30 ? 'big'
      : max >= 15 ? '<30' : 'any';
    if (plants === 'big') {
      mode = { kind: 'idle' };
      return startLead('Tư vấn trên 30 cây', 'Với hơn 30 cây, VIO GREEN sẽ khảo sát và đề xuất cấu hình nhiều ECOHUB phù hợp.<br>');
    }
    mode = { kind: 'pick', step: 'power', plants };
    return bot('<b>2/3.</b> Vị trí đặt máy có sẵn ổ điện không, hay bạn muốn dùng năng lượng mặt trời?', ['Dùng năng lượng mặt trời', 'Có sẵn điện lưới', 'Chưa rõ']);
  }
  if (mode.step === 'power') {
    const power = has(t, 'mat troi') || has(t, 'solar') ? 'solar' : has(t, 'dien luoi') || has(t, 'o dien') || has(t, 'co san') ? 'grid' : 'any';
    mode = { kind: 'pick', step: 'water', plants: mode.plants, power };
    return bot('<b>3/3.</b> Bạn có thể nối ống từ vòi nước gần đó không, hay dùng bình chứa nước?', ['Nối nước trực tiếp', 'Dùng bình chứa', 'Chưa rõ']);
  }
  const water = has(t, 'truc tiep') || has(t, 'noi') || has(t, 'voi') ? 'direct' : has(t, 'binh') ? 'tank' : 'any';
  const list = recommend(mode.plants ?? 'any', mode.power ?? 'any', water);
  mode = { kind: 'idle' };
  return bot(`Dựa trên lựa chọn của bạn, MIO gợi ý:${list.map(productCard).join('')}<p class="mt-2">Mỗi bộ ECOHUB nên dùng kèm bình chứa ECOBOX, đầu tưới Bio-Dripper, ống Hose và phân bón Bio-Nutri.</p>`,
    ['Phụ kiện đi kèm', 'Giá bao nhiêu?', 'Gặp nhân viên', 'Tư vấn lại']);
}

async function handleLead(text: string) {
  if (mode.kind !== 'lead') return;
  const t = norm(text);
  if (['thoi', 'thoi de sau', 'de sau', 'huy bo', 'khong'].includes(t)) { mode = { kind: 'idle' }; return bot('Không sao ạ! Bạn cần gì cứ nhắn MIO nhé.'); }
  if (has(t, 'hotline')) { mode = { kind: 'idle' }; return bot(`Bạn gọi <a href="${telHref}" class="font-semibold text-brand underline">${esc(site.phone)}</a> (${esc(site.hours)}) nhé!`); }
  if (mode.step === 'name') {
    const name = text.trim().slice(0, 60);
    if (name.length < 2) return bot('Bạn cho MIO xin tên để tiện xưng hô nhé?');
    mode = { ...mode, step: 'phone', name };
    return bot(`Cảm ơn ${esc(name)}! Cho MIO xin <b>số điện thoại</b> để nhân viên gọi lại nhé?`, ['Thôi, để sau']);
  }
  const phone = text.replace(/[^\d+]/g, '');
  if (!/^(\+?84|0)\d{9,10}$/.test(phone)) return bot('Số điện thoại có vẻ chưa đúng, bạn kiểm tra lại giúp MIO nhé (VD: 0901234567).', ['Thôi, để sau']);
  const { name, topic } = mode;
  mode = { kind: 'idle' };
  const recent = history.filter((m) => m.from === 'me').slice(-6).map((m) => m.html.replace(/<[^>]+>/g, '')).join(' | ');
  const ok = await submitLead('chat-lead', { name: name ?? '', phone, topic, message: recent.slice(0, 3000) });
  return bot(ok
    ? `Đã ghi nhận! Nhân viên VIO GREEN sẽ gọi cho ${esc(name ?? 'bạn')} theo số ${esc(phone)} ${isWorkingHours() ? 'trong ít phút tới' : 'vào đầu giờ làm việc tiếp theo'}. 💚`
    : `Xin lỗi, MIO chưa gửi được thông tin. Bạn gọi trực tiếp <a href="${telHref}" class="font-semibold underline">${esc(site.phone)}</a> giúp MIO nhé.`);
}

async function answer(raw: string) {
  const text = raw.trim();
  if (!text) return;
  if (mode.kind === 'pick') {
    if (norm(text) === 'tu van lai') return startPick();
    return handlePick(text);
  }
  if (mode.kind === 'lead') return handleLead(text);

  const t = norm(text);
  if (t === 'tu van lai' || score(t, pickKeys) || t === 'tu van chon may') return startPick();
  if (score(t, humanKeys) || t === 'gap nhan vien') return startLead(text);

  // Hỏi về sản phẩm cụ thể
  const prods = findProducts(text);
  if (prods.length && !score(t, ['gia', 'bao hanh', 'doi tra', 'giao'])) {
    return bot(`Đây là thông tin về ${prods.length > 1 ? 'các sản phẩm' : 'sản phẩm'} bạn hỏi:${prods.map(productCard).join('')}`);
  }
  if (score(t, accessoryKeys) || t === 'phu kien di kem') {
    return bot(`Phụ kiện đi kèm ECOHUB gồm:<br>• <b>ECOBOX</b>: Bio-Tank (dinh dưỡng) & Aqua-Tank (nước) – bản S / Plus / Pro theo dòng máy<br>• <b>Tưới</b>: Bio-Dripper (bộ 10 đầu nhỏ giọt), Hose 6/8/10 mm<br>• <b>Dinh dưỡng</b>: Bio-Nutri 25 g & Multi-Pack<div class="mt-2 flex flex-wrap gap-1.5">${link('ECOBOX', '/san-pham/#ecobox')}${link('Phụ kiện tưới', '/san-pham/#irrigation')}${link('Bio-Nutri', '/san-pham/#nutrition')}</div>`,
      ['Tư vấn chọn máy', 'Giá bao nhiêu?', 'Giao hàng', 'Gặp nhân viên']);
  }

  if (t === 'de lai so dien thoai') return startLead('Báo giá');

  // Tìm câu trả lời khớp nhất trong FAQ + kiến thức chính sách
  const chipMap: Record<string, string> = { 'giao hang': 'ship-time', 'doi tra': 'return', 'bao hanh': 'warranty', 'gia bao nhieu': 'price' };
  const direct = kb.find((k) => k.id === chipMap[t]);
  const candidates = [
    ...kb.map((k) => ({ s: score(t, k.keys), html: kbHtml(k), id: k.id })),
    ...faq.map((f, i) => ({ s: score(t, f.keys), html: `<b>${esc(f.q)}</b><br>${esc(f.a)}`, id: 'faq' + i })),
  ].sort((a, b) => b.s - a.s);
  const best = direct ? candidates.find((c) => c.id === direct.id)! : candidates[0];
  if (best && (direct || best.s > 0)) {
    const follow = best.id === 'price' ? ['Để lại số điện thoại', 'Tư vấn chọn máy', 'Cách đặt hàng'] : undefined;
    return bot(best.html, follow);
  }
  if (score(t, thanks)) return bot('Rất vui được hỗ trợ bạn! 🌿 Cần gì thêm cứ nhắn MIO nhé.');
  if (score(t, greetings)) return bot('Chào bạn! MIO có thể giúp bạn chọn ECOHUB, xem phụ kiện, hoặc giải đáp về giao hàng, đổi trả, bảo hành.');

  // Không hiểu → xin liên hệ
  return startLead(text, `MIO chưa chắc trả lời đúng câu này 😅. Bạn có thể gọi <a href="${telHref}" class="font-semibold text-brand underline">${esc(site.phone)}</a>, hoặc để nhân viên gọi lại –`);
}

/* ---------- Màn hình chào: MIO + câu hỏi soạn sẵn ---------- */
const chevron = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 shrink-0 text-muted" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';
function welcome() {
  log!.innerHTML = `<div class="flex flex-col items-center px-1 pt-1 text-center" data-chat-welcome>
    <img src="${site.mio.full}" alt="" width="120" height="146" class="h-32 w-auto animate-mio-float drop-shadow-[0_8px_12px_rgb(3_119_0/0.25)]">
    <p class="mt-3 text-lg font-bold text-ink">👋 Xin chào!</p>
    <p class="mt-1 text-sm text-muted">Mình là <b class="text-brand">MIO</b> – trợ lý của VIO GREEN. Chọn câu hỏi bên dưới hoặc nhập câu hỏi của bạn nhé.</p>
    <p class="mt-5 self-start text-[11px] font-bold tracking-[0.16em] text-brand uppercase">Câu hỏi thường gặp</p>
    <ul class="mt-2 w-full space-y-2 text-left">${quickQuestions.map((x, i) => `<li><button type="button" data-quick="${i}" class="flex w-full items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-ink ring-1 ring-line transition-colors hover:text-brand hover:ring-brand">${esc(x.q)}${chevron}</button></li>`).join('')}</ul>
  </div>`;
  setChips([]);
  log!.scrollTop = 0;
}

async function quick(i: number) {
  const x = quickQuestions[i];
  if (!x) return;
  push('me', esc(x.q));
  if (x.action === 'pick') return startPick();
  if (x.action === 'lead') return startLead('Gặp nhân viên tư vấn');
  if (x.faq !== undefined && faq[x.faq]) return bot(`<b>${esc(faq[x.faq].q)}</b><br>${esc(faq[x.faq].a)}`);
  const k = kb.find((e) => e.id === x.kb);
  if (k) return bot(kbHtml(k));
}

/* ---------- Lời chào nổi cạnh MIO ----------
   Hiện khi vào trang và mỗi lần khách đóng khung chat. Chỉ khi khách bấm × trên lời chào thì không hiện lại
   (kể cả khi chuyển trang khác) – tới lần tải lại trang hoặc phiên mới. */
const hint = $('[data-mio-hint]');
const HINT_KEY = 'vg-mio-hint-off';
let hintTimer: number | undefined;
const hintOff = () => { try { return !!sessionStorage.getItem(HINT_KEY); } catch { return false; } };
function showHint(delay: number) {
  if (!hint || hintOff()) return;
  clearTimeout(hintTimer);
  hintTimer = window.setTimeout(() => {
    if (chat && !chat.hidden) return;
    hint.hidden = false;
    void hint.offsetWidth; // ép trình duyệt tính lại bố cục để hiệu ứng hiện dần chạy (không phụ thuộc requestAnimationFrame)
    hint.setAttribute('data-show', '');
  }, delay);
}
function hideHint(remember: boolean) {
  if (remember) { try { sessionStorage.setItem(HINT_KEY, '1'); } catch { /* ignore */ } }
  clearTimeout(hintTimer);
  if (!hint || hint.hidden) return;
  hint.removeAttribute('data-show');
  setTimeout(() => { if (!hint.hasAttribute('data-show')) hint.hidden = true; }, 300);
}
function initHint() {
  try {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (nav?.type === 'reload') sessionStorage.removeItem(HINT_KEY);
  } catch { /* ignore */ }
  showHint(1500);
}

/* ---------- Mở / đóng / khởi tạo ---------- */
function restore() {
  try {
    const s = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    if (s?.history?.length) { history = s.history; mode = s.mode ?? { kind: 'idle' }; log!.innerHTML = history.map(bubble).join(''); setChips(MAIN_CHIPS); return true; }
  } catch { /* ignore */ }
  return false;
}

function openChat() {
  if (!chat) return;
  hideHint(false); // ẩn tạm khi chat đang mở; đóng chat thì hiện lại
  openLayer(chat);
  $('[data-fab]')?.classList.add('max-sm:hidden');
  if (!history.length && !restore()) welcome();
  setTimeout(() => { if (history.length) scroll(); if (matchMedia('(min-width: 640px)').matches) $<HTMLInputElement>('input', form!)?.focus(); }, 320);
}
function closeChat() {
  if (!chat) return;
  closeLayer(chat);
  $('[data-fab]')?.classList.remove('max-sm:hidden');
  showHint(800);
}

if (chat && log && form) {
  document.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('[data-mio-hint-close]')) return hideHint(true);
    if (t.closest('[data-open-chat]')) { e.preventDefault(); openChat(); return; }
    if (t.closest('[data-chat-close]')) return closeChat();
    if (t.closest('[data-chat-reset]')) {
      history = []; mode = { kind: 'idle' }; save(); welcome(); return;
    }
    const q = t.closest<HTMLElement>('[data-quick]');
    if (q) { quick(Number(q.dataset.quick)); return; }
    const chip = t.closest<HTMLElement>('[data-chip]');
    if (chip) {
      const label = chip.dataset.chip!;
      if (label === 'Gọi hotline luôn') { location.href = telHref; }
      push('me', esc(label));
      answer(label);
      return;
    }
    const add = t.closest<HTMLElement>('[data-chat-add]');
    if (add) { addToCart(add.dataset.chatAdd!); toast('Đã thêm vào giỏ hàng'); }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $<HTMLInputElement>('input', form)!;
    const v = input.value.trim();
    if (!v) return;
    input.value = '';
    push('me', esc(v));
    answer(v);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !chat.hidden) closeChat(); });
  if (!restore()) setChips(MAIN_CHIPS);
  initHint();
  // mở chat từ đường dẫn: /#chat
  if (location.hash === '#chat') openChat();
}
