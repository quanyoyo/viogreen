// Đọc đánh giá ĐÃ DUYỆT của 1 sản phẩm qua Firestore REST API – không tải SDK Firebase (~540KB),
// để trang sản phẩm vẫn nhẹ. Quy tắc: firestore.rules → match /reviews (truy vấn phải lọc approved == true).
import { site } from '../data/site';

export interface PublicReview { id: string; name: string; place?: string; rating: number; text: string; date: string }

type Val = { stringValue?: string; integerValue?: string; doubleValue?: number; timestampValue?: string };

/** yyyy-mm-dd theo giờ máy khách */
export const localDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export async function approvedReviews(product: string): Promise<PublicReview[]> {
  const { projectId, apiKey } = site.firebase;
  if (!projectId) return [];
  const eq = (field: string, value: Val | { booleanValue: boolean }) => ({ fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value } });
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'reviews' }],
          where: { compositeFilter: { op: 'AND', filters: [eq('product', { stringValue: product }), eq('approved', { booleanValue: true })] } },
          limit: 200,
        },
      }),
    },
  );
  if (!res.ok) throw new Error(`Firestore ${res.status}`);
  const rows: { document?: { name: string; fields: Record<string, Val>; createTime: string } }[] = await res.json();
  return rows
    .filter((r) => r.document)
    .map(({ document: d }) => {
      const f = d!.fields;
      const created = f.createdAt?.timestampValue ?? d!.createTime;
      return {
        id: d!.name.split('/').pop()!,
        name: f.name?.stringValue ?? '',
        place: f.place?.stringValue,
        rating: Number(f.rating?.integerValue ?? f.rating?.doubleValue ?? 5),
        text: f.text?.stringValue ?? '',
        date: created,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((r) => ({ ...r, date: localDate(new Date(r.date)) }));
}
