// Blog / tin tức: mỗi bài là 1 file .md trong src/content/blog/ (xem mẫu src/content/blog/_mau-bai-viet.md).
// File bắt đầu bằng "_" hoặc có `draft: true` bị bỏ qua.
// Chưa có bài nào = mục Tin tức tự ẩn khỏi menu và trang chủ; trang /tin-tuc/ để noindex.
export interface PostMeta { title: string; date: string; excerpt: string; cover?: string; draft?: boolean }
type PostModule = { frontmatter: PostMeta; compiledContent: () => string | Promise<string> };

const files = import.meta.glob<PostModule>('../content/blog/*.md', { eager: true });

// YAML đọc `date: 2026-10-18` thành Date → đổi về chuỗi năm-tháng-ngày để sắp xếp
const ymd = (d: unknown) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d ?? ''));

export const posts = Object.entries(files)
  .map(([path, mod]) => ({ slug: path.split('/').pop()!.replace(/\.md$/, ''), ...mod.frontmatter, date: ymd(mod.frontmatter.date), mod }))
  .filter((p) => !p.slug.startsWith('_') && !p.draft)
  .sort((a, b) => b.date.localeCompare(a.date));

export type Post = (typeof posts)[number];

export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' });
