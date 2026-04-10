// [VI] Nhập (import) các phụ thuộc cho file.
import { api } from './api';

// [VI] Nhập (import) các phụ thuộc cho file.
import { Recording } from '@/types';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface SemanticSearchResult {
// [VI] Thực thi một bước trong luồng xử lý.
  recording: Recording;
// [VI] Thực thi một bước trong luồng xử lý.
  similarityScore: number;
// [VI] Thực thi một bước trong luồng xử lý.
  matchedText?: string;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface SemanticSearchRequestParams {
// [VI] Thực thi một bước trong luồng xử lý.
  q: string;
// [VI] Thực thi một bước trong luồng xử lý.
  topK?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  minScore?: number;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Calls the backend Semantic Search endpoint
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const searchSemantic = async (
// [VI] Thực thi một bước trong luồng xử lý.
  params: SemanticSearchRequestParams,
// [VI] Khai báo hàm/biểu thức hàm.
): Promise<SemanticSearchResult[]> => {
// [VI] Trả về kết quả từ hàm.
  return api.get<SemanticSearchResult[]>('/api/search/semantic', {
// [VI] Thực thi một bước trong luồng xử lý.
    params: {
// [VI] Thực thi một bước trong luồng xử lý.
      q: params.q,
// [VI] Thực thi một bước trong luồng xử lý.
      topK: params.topK ?? 10,
// [VI] Thực thi một bước trong luồng xử lý.
      minScore: params.minScore ?? 0.5,
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
  });
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const semanticSearchService = {
// [VI] Thực thi một bước trong luồng xử lý.
  searchSemantic,
// [VI] Thực thi một bước trong luồng xử lý.
};
