// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type MessageRole = 'user' | 'assistant';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface Message {
// [VI] Thực thi một bước trong luồng xử lý.
  id: string;
// [VI] Thực thi một bước trong luồng xử lý.
  role: MessageRole;
// [VI] Thực thi một bước trong luồng xử lý.
  content: string;
// [VI] Thực thi một bước trong luồng xử lý.
  timestamp: Date;
// [VI] Thực thi một bước trong luồng xử lý.
  sourceRecordingIdsJson?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  sourceKBEntryIdsJson?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  expertCorrection?: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  flaggedByExpert?: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
}
