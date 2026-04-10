// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'VietTune';

// [VI] Thực thi một bước trong luồng xử lý.
/** Base URL cho chatbox Nghiên cứu / QA API (backend VietTune trên Render). Nếu không set thì fallback về API_BASE_URL. */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const VIETTUNE_AI_BASE_URL =
// [VI] Thực thi một bước trong luồng xử lý.
  (import.meta.env.VITE_VIETTUNE_AI_BASE_URL as string | undefined)?.trim() || API_BASE_URL;

// [VI] Thực thi một bước trong luồng xử lý.
/** Tên hiển thị cho trợ lý AI/Intelligence (thay thế "AI VietTune"). */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const INTELLIGENCE_NAME = 'VietTune Intelligence';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const ITEMS_PER_PAGE = 20;
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const SUPPORTED_AUDIO_FORMATS = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/ogg'];
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const REGION_NAMES = {
// [VI] Thực thi một bước trong luồng xử lý.
  NORTHERN_MOUNTAINS: 'Trung du và miền núi Bắc Bộ',
// [VI] Thực thi một bước trong luồng xử lý.
  RED_RIVER_DELTA: 'Đồng bằng Bắc Bộ',
// [VI] Thực thi một bước trong luồng xử lý.
  NORTH_CENTRAL: 'Bắc Trung Bộ',
// [VI] Thực thi một bước trong luồng xử lý.
  SOUTH_CENTRAL_COAST: 'Nam Trung Bộ',
// [VI] Thực thi một bước trong luồng xử lý.
  CENTRAL_HIGHLANDS: 'Cao nguyên Trung Bộ',
// [VI] Thực thi một bước trong luồng xử lý.
  SOUTHEAST: 'Đông Nam Bộ',
// [VI] Thực thi một bước trong luồng xử lý.
  MEKONG_DELTA: 'Tây Nam Bộ',
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const RECORDING_TYPE_NAMES = {
// [VI] Thực thi một bước trong luồng xử lý.
  INSTRUMENTAL: 'Nhạc không lời',
// [VI] Thực thi một bước trong luồng xử lý.
  VOCAL: 'Nhạc có lời',
// [VI] Thực thi một bước trong luồng xử lý.
  CEREMONIAL: 'Nhạc nghi lễ',
// [VI] Thực thi một bước trong luồng xử lý.
  FOLK_SONG: 'Dân ca',
// [VI] Thực thi một bước trong luồng xử lý.
  EPIC: 'Sử thi',
// [VI] Thực thi một bước trong luồng xử lý.
  LULLABY: 'Hát ru',
// [VI] Thực thi một bước trong luồng xử lý.
  WORK_SONG: 'Hát lao động',
// [VI] Thực thi một bước trong luồng xử lý.
  OTHER: 'Khác',
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const INSTRUMENT_CATEGORY_NAMES = {
// [VI] Thực thi một bước trong luồng xử lý.
  STRING: 'Dây',
// [VI] Thực thi một bước trong luồng xử lý.
  WIND: 'Hơi',
// [VI] Thực thi một bước trong luồng xử lý.
  PERCUSSION: 'Màng rung',
// [VI] Thực thi một bước trong luồng xử lý.
  IDIOPHONE: 'Thể rắn',
// [VI] Thực thi một bước trong luồng xử lý.
  VOICE: 'Giọng',
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const USER_ROLE_NAMES = {
// [VI] Thực thi một bước trong luồng xử lý.
  ADMIN: 'Administrator',
// [VI] Thực thi một bước trong luồng xử lý.
  MODERATOR: 'Moderator',
// [VI] Thực thi một bước trong luồng xử lý.
  RESEARCHER: 'Researcher',
// [VI] Thực thi một bước trong luồng xử lý.
  CONTRIBUTOR: 'Contributor',
// [VI] Thực thi một bước trong luồng xử lý.
  EXPERT: 'Expert',
// [VI] Thực thi một bước trong luồng xử lý.
  USER: 'User',
// [VI] Thực thi một bước trong luồng xử lý.
};
