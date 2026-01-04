export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
export const APP_NAME = import.meta.env.VITE_APP_NAME || "VietTune Archive";

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
  NORTHERN_MOUNTAINS: "Northern Mountains",
  RED_RIVER_DELTA: "Red River Delta",
  NORTH_CENTRAL: "North Central Coast",
  SOUTH_CENTRAL_COAST: "South Central Coast",
  CENTRAL_HIGHLANDS: "Central Highlands",
  SOUTHEAST: "Southeast",
  MEKONG_DELTA: "Mekong Delta",
};

export const RECORDING_TYPE_NAMES = {
  INSTRUMENTAL: "Instrumental",
  VOCAL: "Vocal",
  CEREMONIAL: "Ceremonial",
  FOLK_SONG: "Folk Song",
  EPIC: "Epic",
  LULLABY: "Lullaby",
  WORK_SONG: "Work Song",
  OTHER: "Other",
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
