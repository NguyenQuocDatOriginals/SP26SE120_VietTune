// [VI] Nhập (import) các phụ thuộc cho file.
import type { Recording, RecordingType, VerificationStatus } from '@/types/recording';
// [VI] Nhập (import) các phụ thuộc cho file.
import type { Region } from '@/types/reference';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface SearchFilters {
// [VI] Thực thi một bước trong luồng xử lý.
  query?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  ethnicityIds?: string[];
// [VI] Thực thi một bước trong luồng xử lý.
  regions?: Region[];
// [VI] Thực thi một bước trong luồng xử lý.
  recordingTypes?: RecordingType[];
// [VI] Thực thi một bước trong luồng xử lý.
  instrumentIds?: string[];
// [VI] Thực thi một bước trong luồng xử lý.
  performerIds?: string[];
// [VI] Thực thi một bước trong luồng xử lý.
  verificationStatus?: VerificationStatus[];
// [VI] Thực thi một bước trong luồng xử lý.
  dateFrom?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  dateTo?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  tags?: string[];
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface SearchResult {
// [VI] Thực thi một bước trong luồng xử lý.
  recordings: Recording[];
// [VI] Thực thi một bước trong luồng xử lý.
  total: number;
// [VI] Thực thi một bước trong luồng xử lý.
  page: number;
// [VI] Thực thi một bước trong luồng xử lý.
  pageSize: number;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface ApiResponse<T> {
// [VI] Thực thi một bước trong luồng xử lý.
  data: T;
// [VI] Thực thi một bước trong luồng xử lý.
  message?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  success: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface PaginatedResponse<T> {
// [VI] Thực thi một bước trong luồng xử lý.
  items: T[];
// [VI] Thực thi một bước trong luồng xử lý.
  total: number;
// [VI] Thực thi một bước trong luồng xử lý.
  page: number;
// [VI] Thực thi một bước trong luồng xử lý.
  pageSize: number;
// [VI] Thực thi một bước trong luồng xử lý.
  totalPages: number;
// [VI] Thực thi một bước trong luồng xử lý.
}
