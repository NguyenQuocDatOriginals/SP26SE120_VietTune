// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface Ethnicity {
// [VI] Thực thi một bước trong luồng xử lý.
  id: string;
// [VI] Thực thi một bước trong luồng xử lý.
  name: string;
// [VI] Thực thi một bước trong luồng xử lý.
  nameVietnamese: string;
// [VI] Thực thi một bước trong luồng xử lý.
  description?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  region: Region;
// [VI] Thực thi một bước trong luồng xử lý.
  population?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  language?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  musicalTraditions?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  thumbnail?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  recordingCount: number;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export enum Region {
// [VI] Thực thi một bước trong luồng xử lý.
  NORTHERN_MOUNTAINS = 'NORTHERN_MOUNTAINS',
// [VI] Thực thi một bước trong luồng xử lý.
  RED_RIVER_DELTA = 'RED_RIVER_DELTA',
// [VI] Thực thi một bước trong luồng xử lý.
  NORTH_CENTRAL = 'NORTH_CENTRAL',
// [VI] Thực thi một bước trong luồng xử lý.
  SOUTH_CENTRAL_COAST = 'SOUTH_CENTRAL_COAST',
// [VI] Thực thi một bước trong luồng xử lý.
  CENTRAL_HIGHLANDS = 'CENTRAL_HIGHLANDS',
// [VI] Thực thi một bước trong luồng xử lý.
  SOUTHEAST = 'SOUTHEAST',
// [VI] Thực thi một bước trong luồng xử lý.
  MEKONG_DELTA = 'MEKONG_DELTA',
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface Instrument {
// [VI] Thực thi một bước trong luồng xử lý.
  id: string;
// [VI] Thực thi một bước trong luồng xử lý.
  name: string;
// [VI] Thực thi một bước trong luồng xử lý.
  nameVietnamese: string;
// [VI] Thực thi một bước trong luồng xử lý.
  description?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  category: InstrumentCategory;
// [VI] Thực thi một bước trong luồng xử lý.
  construction?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  playingTechnique?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  images: string[];
// [VI] Thực thi một bước trong luồng xử lý.
  ethnicity?: Ethnicity;
// [VI] Thực thi một bước trong luồng xử lý.
  audioSamples?: string[];
// [VI] Thực thi một bước trong luồng xử lý.
  recordingCount: number;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export enum InstrumentCategory {
// [VI] Thực thi một bước trong luồng xử lý.
  STRING = 'STRING',
// [VI] Thực thi một bước trong luồng xử lý.
  WIND = 'WIND',
// [VI] Thực thi một bước trong luồng xử lý.
  PERCUSSION = 'PERCUSSION',
// [VI] Thực thi một bước trong luồng xử lý.
  IDIOPHONE = 'IDIOPHONE',
// [VI] Thực thi một bước trong luồng xử lý.
  VOICE = 'VOICE',
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export interface Performer {
// [VI] Thực thi một bước trong luồng xử lý.
  id: string;
// [VI] Thực thi một bước trong luồng xử lý.
  name: string;
// [VI] Thực thi một bước trong luồng xử lý.
  nameVietnamese?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  title?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  ethnicity?: Ethnicity;
// [VI] Thực thi một bước trong luồng xử lý.
  specialization?: string[];
// [VI] Thực thi một bước trong luồng xử lý.
  biography?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  birthYear?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  deathYear?: number;
// [VI] Thực thi một bước trong luồng xử lý.
  photo?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  recordingCount: number;
// [VI] Thực thi một bước trong luồng xử lý.
  isVerified: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
}
