// Kết nối Firebase (Auth + Firestore). File này kéo theo SDK Firebase (~vài trăm KB),
// nên chỉ import trực tiếp ở trang tài khoản / quản trị; các form khác dùng `await import('./fb')` khi gửi.
// Quy tắc bảo mật tương ứng: firestore.rules (gốc repo).
import { initializeApp } from 'firebase/app';
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  updateProfile, sendEmailVerification, sendPasswordResetEmail, signOut, type User,
} from 'firebase/auth';
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, addDoc, collection, query, where, orderBy, limit,
  onSnapshot, getDocs, serverTimestamp, type Timestamp,
} from 'firebase/firestore';
import { site } from '../data/site';

const app = initializeApp(site.firebase);
export const auth = getAuth(app);
auth.languageCode = 'vi';
export const db = getFirestore(app);

/** Trạng thái đơn — phải khớp danh sách trong firestore.rules */
export const ORDER_STATUS = ['Mới', 'Đã xác nhận', 'Đang giao', 'Hoàn tất', 'Đã huỷ'] as const;
export const LEAD_STATUS = ['Mới', 'Đã liên hệ', 'Xong'] as const;

export interface OrderItem { slug: string; name: string; variant: string; qty: number; price: number | null }
export interface Order {
  orderId: string; uid: string | null; name: string; phone: string; email: string;
  province: string; ward: string; address: string; shipping: string; note: string;
  items: OrderItem[]; totalQty: number; total: number | null; status: string; page: string;
  createdAt?: Timestamp; staffNote?: string;
}
export interface Lead {
  id: string; type: 'contact' | 'newsletter' | 'chat-lead'; status: string; createdAt?: Timestamp;
  [k: string]: unknown;
}
export interface Profile { name?: string; phone?: string; province?: string; ward?: string; address?: string }

/* ---------- Đăng nhập ---------- */
export async function currentUser(): Promise<User | null> {
  await auth.authStateReady();
  return auth.currentUser;
}
export const loginGoogle = () => signInWithPopup(auth, new GoogleAuthProvider());
export const loginEmail = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);
export async function register(name: string, email: string, pass: string) {
  const { user } = await createUserWithEmailAndPassword(auth, email, pass);
  await updateProfile(user, { displayName: name });
  await verifyEmail(user);
  return user;
}
export const verifyEmail = (user: User) => sendEmailVerification(user, { url: `${location.origin}/tai-khoan/` });
export const resetPassword = (email: string) => sendPasswordResetEmail(auth, email, { url: `${location.origin}/dang-nhap/` });
export const logout = () => signOut(auth);

const AUTH_ERRORS: Record<string, string> = {
  'auth/invalid-credential': 'Email hoặc mật khẩu chưa đúng.',
  'auth/wrong-password': 'Email hoặc mật khẩu chưa đúng.',
  'auth/user-not-found': 'Email hoặc mật khẩu chưa đúng.',
  'auth/invalid-email': 'Email chưa hợp lệ.',
  'auth/missing-password': 'Vui lòng nhập mật khẩu.',
  'auth/email-already-in-use': 'Email này đã có tài khoản. Bạn hãy đăng nhập, hoặc dùng "Quên mật khẩu".',
  'auth/weak-password': 'Mật khẩu cần ít nhất 6 ký tự.',
  'auth/too-many-requests': 'Bạn thử quá nhiều lần. Vui lòng đợi vài phút rồi thử lại.',
  'auth/network-request-failed': 'Không kết nối được mạng. Vui lòng kiểm tra Internet.',
  'auth/popup-blocked': 'Trình duyệt đã chặn cửa sổ đăng nhập Google. Hãy cho phép popup rồi thử lại.',
  'auth/popup-closed-by-user': '',
  'auth/cancelled-popup-request': '',
  'auth/user-disabled': 'Tài khoản này đã bị khoá. Vui lòng liên hệ VIO GREEN.',
  'auth/account-exists-with-different-credential': 'Email này đã đăng ký bằng cách khác. Hãy đăng nhập bằng email + mật khẩu.',
};
/** Thông báo lỗi tiếng Việt; chuỗi rỗng = người dùng tự huỷ, không cần báo */
export function authError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  return code in AUTH_ERRORS ? AUTH_ERRORS[code] : 'Có lỗi xảy ra, vui lòng thử lại.';
}

/* ---------- Đơn hàng & liên hệ (khách) ---------- */
export async function createOrder(order: Omit<Order, 'uid' | 'status' | 'createdAt'>) {
  await setDoc(doc(db, 'orders', order.orderId), {
    ...order,
    uid: auth.currentUser?.uid ?? null,
    status: ORDER_STATUS[0],
    createdAt: serverTimestamp(),
  });
}
export async function createLead(type: Lead['type'], data: Record<string, string>) {
  await addDoc(collection(db, 'leads'), { ...data, type, status: LEAD_STATUS[0], createdAt: serverTimestamp() });
}

/** Đơn của khách: đơn đặt khi đã đăng nhập + đơn vãng lai có email trùng email đã xác minh */
export async function myOrders(user: User): Promise<Order[]> {
  const col = collection(db, 'orders');
  const queries = [query(col, where('uid', '==', user.uid))];
  if (user.emailVerified && user.email) queries.push(query(col, where('email', '==', user.email)));
  const snaps = await Promise.all(queries.map((q) => getDocs(q)));
  const byId = new Map<string, Order>();
  snaps.forEach((s) => s.forEach((d) => byId.set(d.id, d.data() as Order)));
  return [...byId.values()].sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
}

export async function getProfile(uid: string): Promise<Profile> {
  const s = await getDoc(doc(db, 'users', uid));
  return (s.data() as Profile) ?? {};
}
export const saveProfile = (uid: string, p: Profile) => setDoc(doc(db, 'users', uid), { ...p, updatedAt: serverTimestamp() });

/* ---------- Quản trị ---------- */
export async function isAdmin(uid: string) {
  try { return (await getDoc(doc(db, 'admins', uid))).exists(); } catch { return false; }
}
export const watchOrders = (cb: (orders: Order[]) => void, onError: (e: Error) => void) =>
  onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(300)),
    (s) => cb(s.docs.map((d) => d.data() as Order)), onError);
export const watchLeads = (cb: (leads: Lead[]) => void, onError: (e: Error) => void) =>
  onSnapshot(query(collection(db, 'leads'), orderBy('createdAt', 'desc'), limit(300)),
    (s) => cb(s.docs.map((d) => ({ id: d.id, ...d.data() }) as Lead)), onError);
export const setOrderStatus = (id: string, status: string) => updateDoc(doc(db, 'orders', id), { status, updatedAt: serverTimestamp() });
export const setLeadStatus = (id: string, status: string) => updateDoc(doc(db, 'leads', id), { status, updatedAt: serverTimestamp() });
