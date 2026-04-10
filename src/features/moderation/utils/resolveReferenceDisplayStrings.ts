// [VI] Nhập (import) các phụ thuộc cho file.
import type { LocalRecordingMini } from '@/features/moderation/types/localRecordingQueue.types';
// [VI] Nhập (import) các phụ thuộc cho file.
import { referenceDataService } from '@/services/referenceDataService';

// [VI] Khai báo hàm/biểu thức hàm.
function normalizeId(v: unknown): string {
// [VI] Trả về kết quả từ hàm.
  return String(v ?? '')
// [VI] Thực thi một bước trong luồng xử lý.
    .trim()
// [VI] Thực thi một bước trong luồng xử lý.
    .toLowerCase();
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/** Chuỗi dạng `ID:<uuid>` từ mapper khi chưa có tên trong lookup lúc map submission. */
// [VI] Khai báo hàm/biểu thức hàm.
function idKeyFromPlaceholder(label: string): string | null {
// [VI] Khai báo biến/hằng số.
  const t = label.trim();
// [VI] Rẽ nhánh điều kiện (if).
  if (!t.toUpperCase().startsWith('ID:')) return null;
// [VI] Khai báo biến/hằng số.
  const rest = t.slice(3).trim();
// [VI] Trả về kết quả từ hàm.
  return rest ? normalizeId(rest) : null;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo hàm/biểu thức hàm.
function resolveOne(value: string | undefined, byId: Record<string, string>): string | undefined {
// [VI] Rẽ nhánh điều kiện (if).
  if (!value) return undefined;
// [VI] Khai báo biến/hằng số.
  const key = idKeyFromPlaceholder(value);
// [VI] Rẽ nhánh điều kiện (if).
  if (key && byId[key]) return byId[key];
// [VI] Trả về kết quả từ hàm.
  return value;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo hàm/biểu thức hàm.
function resolveInstrumentList(
// [VI] Thực thi một bước trong luồng xử lý.
  list: string[] | undefined,
// [VI] Thực thi một bước trong luồng xử lý.
  instrumentById: Record<string, string>,
// [VI] Thực thi một bước trong luồng xử lý.
): string[] | undefined {
// [VI] Rẽ nhánh điều kiện (if).
  if (!list?.length) return list;
// [VI] Khai báo hàm/biểu thức hàm.
  return list.map((entry) => {
// [VI] Khai báo biến/hằng số.
    const key = idKeyFromPlaceholder(entry);
// [VI] Rẽ nhánh điều kiện (if).
    if (key && instrumentById[key]) return instrumentById[key];
// [VI] Trả về kết quả từ hàm.
    return entry;
// [VI] Thực thi một bước trong luồng xử lý.
  });
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Thay `ID:uuid` trong culturalContext bằng tên từ API danh mục (dân tộc, nghi lễ, nhạc cụ).
// [VI] Thực thi một bước trong luồng xử lý.
 * Dùng cho UI wizard / chi tiết khi payload gốc chỉ có UUID.
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export async function resolveCulturalContextForDisplay(
// [VI] Thực thi một bước trong luồng xử lý.
  ctx: LocalRecordingMini['culturalContext'] | undefined,
// [VI] Thực thi một bước trong luồng xử lý.
): Promise<LocalRecordingMini['culturalContext'] | undefined> {
// [VI] Rẽ nhánh điều kiện (if).
  if (!ctx) return undefined;
// [VI] Khai báo biến/hằng số.
  const needsResolve = [ctx.ethnicity, ctx.eventType, ...(ctx.instruments ?? [])].some(
// [VI] Khai báo hàm/biểu thức hàm.
    (s) => !!s && String(s).trim().toUpperCase().startsWith('ID:'),
// [VI] Thực thi một bước trong luồng xử lý.
  );
// [VI] Rẽ nhánh điều kiện (if).
  if (!needsResolve) return ctx;

// [VI] Khai báo biến/hằng số.
  const [ethnics, ceremonies, instruments] = await Promise.all([
// [VI] Thực thi một bước trong luồng xử lý.
    referenceDataService.getEthnicGroups(),
// [VI] Thực thi một bước trong luồng xử lý.
    referenceDataService.getCeremonies(),
// [VI] Thực thi một bước trong luồng xử lý.
    referenceDataService.getInstruments(),
// [VI] Thực thi một bước trong luồng xử lý.
  ]);
// [VI] Khai báo biến/hằng số.
  const ethnicById = Object.fromEntries(ethnics.map((e) => [normalizeId(e.id), e.name]));
// [VI] Khai báo biến/hằng số.
  const ceremonyById = Object.fromEntries(ceremonies.map((c) => [normalizeId(c.id), c.name]));
// [VI] Khai báo biến/hằng số.
  const instrumentById = Object.fromEntries(instruments.map((i) => [normalizeId(i.id), i.name]));

// [VI] Trả về kết quả từ hàm.
  return {
// [VI] Thực thi một bước trong luồng xử lý.
    ...ctx,
// [VI] Thực thi một bước trong luồng xử lý.
    ethnicity: resolveOne(ctx.ethnicity, ethnicById),
// [VI] Thực thi một bước trong luồng xử lý.
    eventType: resolveOne(ctx.eventType, ceremonyById),
// [VI] Thực thi một bước trong luồng xử lý.
    instruments: resolveInstrumentList(ctx.instruments, instrumentById),
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
}
