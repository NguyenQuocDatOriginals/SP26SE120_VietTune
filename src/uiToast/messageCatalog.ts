// [VI] Nhập (import) các phụ thuộc cho file.
import { interpolate } from './interpolate';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const MESSAGE_CATALOG = {
// [VI] Thực thi một bước trong luồng xử lý.
  'common.network': 'Không có kết nối mạng. Vui lòng thử lại.',
// [VI] Thực thi một bước trong luồng xử lý.
  'common.timeout': 'Yêu cầu hết thời gian chờ. Vui lòng thử lại.',
// [VI] Thực thi một bước trong luồng xử lý.
  'common.unknown': 'Đã xảy ra lỗi. Vui lòng thử lại.',

// [VI] Thực thi một bước trong luồng xử lý.
  'common.http_400': 'Yêu cầu không hợp lệ.',
// [VI] Thực thi một bước trong luồng xử lý.
  'common.http_401': 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.',
// [VI] Thực thi một bước trong luồng xử lý.
  'common.http_403': 'Bạn không có quyền thực hiện thao tác này.',
// [VI] Thực thi một bước trong luồng xử lý.
  'common.http_404': 'Không tìm thấy dữ liệu.',
// [VI] Thực thi một bước trong luồng xử lý.
  'common.http_422': 'Dữ liệu không hợp lệ.',
// [VI] Thực thi một bước trong luồng xử lý.
  'common.http_500': 'Máy chủ gặp lỗi. Vui lòng thử lại sau.',

// [VI] Thực thi một bước trong luồng xử lý.
  'moderation.delete.success': 'Đã xóa bản thu khỏi hệ thống.',
// [VI] Thực thi một bước trong luồng xử lý.
  'moderation.delete.failed':
// [VI] Thực thi một bước trong luồng xử lý.
    'Xóa thất bại. Có thể bạn không có quyền hoặc bản thu đã bị xóa trước đó.',

// [VI] Thực thi một bước trong luồng xử lý.
  'moderation.approve.local_failed': 'Không thể lưu trạng thái phê duyệt cục bộ. Thử lại.',
// [VI] Thực thi một bước trong luồng xử lý.
  'moderation.approve.server_failed':
// [VI] Thực thi một bước trong luồng xử lý.
    'Máy chủ không ghi nhận phê duyệt. Đã hoàn tác trên giao diện — vui lòng thử lại.',

// [VI] Thực thi một bước trong luồng xử lý.
  'moderation.reject.local_failed': 'Không thể lưu trạng thái từ chối cục bộ. Thử lại.',
// [VI] Thực thi một bước trong luồng xử lý.
  'moderation.reject.server_failed':
// [VI] Thực thi một bước trong luồng xử lý.
    'Máy chủ không ghi nhận từ chối. Đã hoàn tác trên giao diện — vui lòng thử lại.',

// [VI] Thực thi một bước trong luồng xử lý.
  'moderation.wizard.step_incomplete':
// [VI] Thực thi một bước trong luồng xử lý.
    'Vui lòng hoàn thành tất cả các yêu cầu bắt buộc ở Bước {{step}} trước khi hoàn thành kiểm duyệt bản thu!',
// [VI] Thực thi một bước trong luồng xử lý.
  'moderation.wizard.ready_for_approve':
// [VI] Thực thi một bước trong luồng xử lý.
    'Đã hoàn tất các bước kiểm tra. Vui lòng xác nhận phê duyệt ở hộp thoại tiếp theo.',

// [VI] Thực thi một bước trong luồng xử lý.
  'moderation.approve.success': 'Đã phê duyệt bản thu.',
// [VI] Thực thi một bước trong luồng xử lý.
  'moderation.reject.notes_required':
// [VI] Thực thi một bước trong luồng xử lý.
    'Vui lòng nhập ghi chú chuyên gia (mục xác nhận) trước khi từ chối.',

// [VI] Thực thi một bước trong luồng xử lý.
  'auth.profile.sync_success': 'Cập nhật hồ sơ đã được đồng bộ với server.',
// [VI] Thực thi một bước trong luồng xử lý.
  'auth.login.success': 'Đăng nhập thành công.',

// [VI] Thực thi một bước trong luồng xử lý.
  'upload.ai.partial_fail': 'Phân tích AI thất bại — Vẫn tiếp tục tải lên bình thường.',
// [VI] Thực thi một bước trong luồng xử lý.
  'upload.ai.success_detail': 'Phân tích AI thành công — Đã tự động điền các thông tin gợi ý.',
// [VI] Thực thi một bước trong luồng xử lý.
  'upload.save.success_edit': 'Thành công — Đã cập nhật bản chỉnh sửa.',
// [VI] Thực thi một bước trong luồng xử lý.
  'upload.save.success_draft': 'Thành công — Đã lưu bản nháp thành công.',
// [VI] Thực thi một bước trong luồng xử lý.
} as const;

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type MessageKey = keyof typeof MESSAGE_CATALOG;

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function resolveCatalogMessage(
// [VI] Thực thi một bước trong luồng xử lý.
  key: MessageKey,
// [VI] Thực thi một bước trong luồng xử lý.
  vars?: Record<string, string | number | undefined>,
// [VI] Thực thi một bước trong luồng xử lý.
): string {
// [VI] Trả về kết quả từ hàm.
  return interpolate(MESSAGE_CATALOG[key], vars);
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Thực thi một bước trong luồng xử lý.
/** Chuẩn hóa pattern cũ notify(title, message) thành một dòng cho toast. */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function notifyLine(title: string, message: string): string {
// [VI] Trả về kết quả từ hàm.
  return `${title} — ${message}`;
// [VI] Thực thi một bước trong luồng xử lý.
}
