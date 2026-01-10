export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
export const APP_NAME = import.meta.env.VITE_APP_NAME || "VietTune";

export const ITEMS_PER_PAGE = 20;
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const SUPPORTED_AUDIO_FORMATS = [
  "audio/mpeg",
  "audio/wav",
  "audio/flac",
  "audio/ogg",
];
export const SUPPORTED_IMAGE_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const VIETNAMESE_ETHNICITIES = [
  "Kinh",
  "Tày",
  "Thái",
  "Mường",
  "Khmer",
  "Hoa",
  "Nùng",
  "H'Mông",
  "Dao",
  "Gia Rai",
  "Ê Đê",
  "Ba Na",
  "Sán Chay",
  "Chăm",
  "Cơ Ho",
  "Xơ Đăng",
  "Sán Dìu",
  "Hrê",
  "Ra Glai",
  "Mnông",
  "Thổ",
  "Stiêng",
  "Khơ Mú",
  "Bru Vân Kiều",
  "Cơ Tu",
  "Giáy",
  "Tà Ôi",
  "Mạ",
  "Giẻ Triêng",
  "Co",
  "Chơ Ro",
  "Xinh Mun",
  "Hà Nhì",
  "Chu Ru",
  "Lào",
  "La Chí",
  "Kháng",
  "Phù Lá",
  "La Hủ",
  "La Ha",
  "Pà Thẻn",
  "Lự",
  "Ngái",
  "Chứt",
  "Lô Lô",
  "Mảng",
  "Cơ Lao",
  "Bố Y",
  "Cống",
  "Si La",
  "Pu Péo",
  "Rơ Măm",
  "Brâu",
  "Ơ Đu",
];

export const REGION_NAMES = {
  NORTHERN_MOUNTAINS: "Trung du và miền núi Bắc Bộ",
  RED_RIVER_DELTA: "Đồng bằng Bắc Bộ",
  NORTH_CENTRAL: "Bắc Trung Bộ",
  SOUTH_CENTRAL_COAST: "Nam Trung Bộ",
  CENTRAL_HIGHLANDS: "Cao nguyên Trung Bộ",
  SOUTHEAST: "Đông Nam Bộ",
  MEKONG_DELTA: "Tây Nam Bộ",
};

export const RECORDING_TYPE_NAMES = {
  INSTRUMENTAL: "Nhạc không lời",
  VOCAL: "Nhạc có lời",
  CEREMONIAL: "Nhạc nghi lễ",
  FOLK_SONG: "Dân ca",
  EPIC: "Sử thi",
  LULLABY: "Hát ru",
  WORK_SONG: "Hát lao động",
  OTHER: "Loại khác",
};

export const INSTRUMENT_CATEGORY_NAMES = {
  STRING: "String",
  WIND: "Wind",
  PERCUSSION: "Percussion",
  IDIOPHONE: "Idiophone",
  VOICE: "Voice",
};

export const USER_ROLE_NAMES = {
  ADMIN: "Administrator",
  MODERATOR: "Moderator",
  RESEARCHER: "Researcher",
  CONTRIBUTOR: "Contributor",
  USER: "User",
};
