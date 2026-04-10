// [VI] Nhập (import) các phụ thuộc cho file.
import { AxiosError } from 'axios';

// [VI] Nhập (import) các phụ thuộc cho file.
import { api } from '@/services/api';
// [VI] Nhập (import) các phụ thuộc cho file.
import type { ServiceApiClient } from '@/services/serviceApiClient';
// [VI] Nhập (import) các phụ thuộc cho file.
import { logServiceWarn } from '@/services/serviceLogger';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type MetadataSuggestResponse = {
// [VI] Thực thi một bước trong luồng xử lý.
  ethnicity?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  region?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  instruments?: string[] | null;
// [VI] Thực thi một bước trong luồng xử lý.
  message?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Thực thi một bước trong luồng xử lý.
/** Chuẩn hóa response từ backend (hỗ trợ cả camelCase và PascalCase). */
// [VI] Khai báo hàm/biểu thức hàm.
function normalizeResponse(raw: Record<string, unknown> | null): MetadataSuggestResponse {
// [VI] Rẽ nhánh điều kiện (if).
  if (!raw || typeof raw !== 'object') return {};
// [VI] Khai báo biến/hằng số.
  const r = raw as Record<string, unknown>;
// [VI] Khai báo biến/hằng số.
  const instrumentsRaw = r.instruments ?? r.Instruments;
// [VI] Khai báo biến/hằng số.
  const instruments = Array.isArray(instrumentsRaw)
// [VI] Khai báo hàm/biểu thức hàm.
    ? instrumentsRaw.filter((x): x is string => typeof x === 'string')
// [VI] Thực thi một bước trong luồng xử lý.
    : null;
// [VI] Trả về kết quả từ hàm.
  return {
// [VI] Thực thi một bước trong luồng xử lý.
    ethnicity: ((r.ethnicity ?? r.Ethnicity) as string | undefined) ?? null,
// [VI] Thực thi một bước trong luồng xử lý.
    region: ((r.region ?? r.Region) as string | undefined) ?? null,
// [VI] Thực thi một bước trong luồng xử lý.
    instruments: instruments && instruments.length > 0 ? instruments : null,
// [VI] Thực thi một bước trong luồng xử lý.
    message: ((r.message ?? r.Message) as string | undefined) ?? null,
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Gọi API gợi ý metadata (dân tộc, vùng miền, nhạc cụ) từ AI cho luồng đóng góp.
// [VI] Thực thi một bước trong luồng xử lý.
 * Backend dùng Gemini khi đã cấu hình; nếu lỗi hoặc chưa cấu hình trả về fallback/rỗng.
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function createMetadataSuggestService(client: ServiceApiClient) {
// [VI] Trả về kết quả từ hàm.
  return {
// [VI] Thực thi một bước trong luồng xử lý.
    suggestMetadata: async (params: {
// [VI] Thực thi một bước trong luồng xử lý.
      genre?: string;
// [VI] Thực thi một bước trong luồng xử lý.
      title?: string;
// [VI] Thực thi một bước trong luồng xử lý.
      description?: string;
// [VI] Khai báo hàm/biểu thức hàm.
    }): Promise<MetadataSuggestResponse> => {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
      try {
// [VI] Khai báo biến/hằng số.
        const data = await client.post<Record<string, unknown>>('MetadataSuggest', {
// [VI] Thực thi một bước trong luồng xử lý.
          genre: params.genre || '',
// [VI] Thực thi một bước trong luồng xử lý.
          title: params.title || '',
// [VI] Thực thi một bước trong luồng xử lý.
          description: params.description || '',
// [VI] Thực thi một bước trong luồng xử lý.
        });
// [VI] Trả về kết quả từ hàm.
        return normalizeResponse(data ?? {});
// [VI] Thực thi một bước trong luồng xử lý.
      } catch (err) {
// [VI] Khai báo biến/hằng số.
        const msg =
// [VI] Thực thi một bước trong luồng xử lý.
          (err as AxiosError)?.response?.data != null &&
// [VI] Thực thi một bước trong luồng xử lý.
          typeof (err as AxiosError).response?.data === 'object' &&
// [VI] Thực thi một bước trong luồng xử lý.
          'message' in ((err as AxiosError).response!.data as object)
// [VI] Thực thi một bước trong luồng xử lý.
            ? (((err as AxiosError).response!.data as { message?: string })?.message ??
// [VI] Thực thi một bước trong luồng xử lý.
              'Lỗi không xác định')
// [VI] Thực thi một bước trong luồng xử lý.
            : ((err as Error)?.message ?? 'Không kết nối được dịch vụ gợi ý.');
// [VI] Thực thi một bước trong luồng xử lý.
        logServiceWarn('MetadataSuggest API error', err);
// [VI] Trả về kết quả từ hàm.
        return { message: msg };
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo biến/hằng số.
const metadataSuggestService = createMetadataSuggestService(api);
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const suggestMetadata = metadataSuggestService.suggestMetadata;
