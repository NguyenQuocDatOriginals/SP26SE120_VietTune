// [VI] Nhập (import) các phụ thuộc cho file.
import { Region, RecordingType } from '@/types';

// [VI] Thực thi một bước trong luồng xử lý.
/** Static option lists for Explore `FilterSidebar` (aligned with SearchBar vocabulary). */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type ExploreFilterOptions = {
// [VI] Thực thi một bước trong luồng xử lý.
  ethnicities: { id: string; label: string }[];
// [VI] Thực thi một bước trong luồng xử lý.
  recordingTypes: { value: RecordingType; label: string }[];
// [VI] Thực thi một bước trong luồng xử lý.
  genreTags: { id: string; label: string }[];
// [VI] Thực thi một bước trong luồng xử lý.
  instruments: { id: string; label: string }[];
// [VI] Thực thi một bước trong luồng xử lý.
  regions: { value: Region; label: string }[];
// [VI] Thực thi một bước trong luồng xử lý.
  culturalContexts: { id: string; label: string }[];
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Khai báo biến/hằng số.
const GENRES = [
// [VI] Thực thi một bước trong luồng xử lý.
  'Dân ca',
// [VI] Thực thi một bước trong luồng xử lý.
  'Hát xẩm',
// [VI] Thực thi một bước trong luồng xử lý.
  'Ca trù',
// [VI] Thực thi một bước trong luồng xử lý.
  'Chầu văn',
// [VI] Thực thi một bước trong luồng xử lý.
  'Quan họ',
// [VI] Thực thi một bước trong luồng xử lý.
  'Hát then',
// [VI] Thực thi một bước trong luồng xử lý.
  'Cải lương',
// [VI] Thực thi một bước trong luồng xử lý.
  'Tuồng',
// [VI] Thực thi một bước trong luồng xử lý.
  'Chèo',
// [VI] Thực thi một bước trong luồng xử lý.
  'Nhã nhạc',
// [VI] Thực thi một bước trong luồng xử lý.
  'Ca Huế',
// [VI] Thực thi một bước trong luồng xử lý.
  'Đờn ca tài tử',
// [VI] Thực thi một bước trong luồng xử lý.
  'Hát bội',
// [VI] Thực thi một bước trong luồng xử lý.
  'Hò',
// [VI] Thực thi một bước trong luồng xử lý.
  'Lý',
// [VI] Thực thi một bước trong luồng xử lý.
  'Vọng cổ',
// [VI] Thực thi một bước trong luồng xử lý.
  'Hát ru',
// [VI] Thực thi một bước trong luồng xử lý.
  'Hát ví',
// [VI] Thực thi một bước trong luồng xử lý.
  'Hát giặm',
// [VI] Thực thi một bước trong luồng xử lý.
  'Bài chòi',
// [VI] Thực thi một bước trong luồng xử lý.
  'Khác',
// [VI] Thực thi một bước trong luồng xử lý.
] as const;

// [VI] Khai báo biến/hằng số.
const ETHNICITIES = [
// [VI] Thực thi một bước trong luồng xử lý.
  'Kinh',
// [VI] Thực thi một bước trong luồng xử lý.
  'Tày',
// [VI] Thực thi một bước trong luồng xử lý.
  'Thái',
// [VI] Thực thi một bước trong luồng xử lý.
  'Mường',
// [VI] Thực thi một bước trong luồng xử lý.
  'Khmer',
// [VI] Thực thi một bước trong luồng xử lý.
  "H'Mông",
// [VI] Thực thi một bước trong luồng xử lý.
  'Nùng',
// [VI] Thực thi một bước trong luồng xử lý.
  'Hoa',
// [VI] Thực thi một bước trong luồng xử lý.
  'Dao',
// [VI] Thực thi một bước trong luồng xử lý.
  'Gia Rai',
// [VI] Thực thi một bước trong luồng xử lý.
  'Ê Đê',
// [VI] Thực thi một bước trong luồng xử lý.
  'Ba Na',
// [VI] Thực thi một bước trong luồng xử lý.
  'Xơ Đăng',
// [VI] Thực thi một bước trong luồng xử lý.
  'Sán Chay',
// [VI] Thực thi một bước trong luồng xử lý.
  'Cơ Ho',
// [VI] Thực thi một bước trong luồng xử lý.
  'Chăm',
// [VI] Thực thi một bước trong luồng xử lý.
  'Sán Dìu',
// [VI] Thực thi một bước trong luồng xử lý.
  'Hrê',
// [VI] Thực thi một bước trong luồng xử lý.
  'Mnông',
// [VI] Thực thi một bước trong luồng xử lý.
  'Ra Glai',
// [VI] Thực thi một bước trong luồng xử lý.
  'Giáy',
// [VI] Thực thi một bước trong luồng xử lý.
  'Stră',
// [VI] Thực thi một bước trong luồng xử lý.
  'Bru-Vân Kiều',
// [VI] Thực thi một bước trong luồng xử lý.
  'Cơ Tu',
// [VI] Thực thi một bước trong luồng xử lý.
  'Giẻ Triêng',
// [VI] Thực thi một bước trong luồng xử lý.
  'Tà Ôi',
// [VI] Thực thi một bước trong luồng xử lý.
  'Mạ',
// [VI] Thực thi một bước trong luồng xử lý.
  'Khơ Mú',
// [VI] Thực thi một bước trong luồng xử lý.
  'Co',
// [VI] Thực thi một bước trong luồng xử lý.
  'Chơ Ro',
// [VI] Thực thi một bước trong luồng xử lý.
  'Hà Nhì',
// [VI] Thực thi một bước trong luồng xử lý.
  'Xinh Mun',
// [VI] Thực thi một bước trong luồng xử lý.
  'Chu Ru',
// [VI] Thực thi một bước trong luồng xử lý.
  'Lào',
// [VI] Thực thi một bước trong luồng xử lý.
  'La Chí',
// [VI] Thực thi một bước trong luồng xử lý.
  'Kháng',
// [VI] Thực thi một bước trong luồng xử lý.
  'Phù Lá',
// [VI] Thực thi một bước trong luồng xử lý.
  'La Hủ',
// [VI] Thực thi một bước trong luồng xử lý.
  'La Ha',
// [VI] Thực thi một bước trong luồng xử lý.
  'Pà Thẻn',
// [VI] Thực thi một bước trong luồng xử lý.
  'Lự',
// [VI] Thực thi một bước trong luồng xử lý.
  'Ngái',
// [VI] Thực thi một bước trong luồng xử lý.
  'Chứt',
// [VI] Thực thi một bước trong luồng xử lý.
  'Lô Lô',
// [VI] Thực thi một bước trong luồng xử lý.
  'Mảng',
// [VI] Thực thi một bước trong luồng xử lý.
  'Cờ Lao',
// [VI] Thực thi một bước trong luồng xử lý.
  'Bố Y',
// [VI] Thực thi một bước trong luồng xử lý.
  'Cống',
// [VI] Thực thi một bước trong luồng xử lý.
  'Si La',
// [VI] Thực thi một bước trong luồng xử lý.
  'Pu Péo',
// [VI] Thực thi một bước trong luồng xử lý.
  'Rơ Măm',
// [VI] Thực thi một bước trong luồng xử lý.
  'Brâu',
// [VI] Thực thi một bước trong luồng xử lý.
  'Ơ Đu',
// [VI] Thực thi một bước trong luồng xử lý.
  'Khác',
// [VI] Thực thi một bước trong luồng xử lý.
] as const;

// [VI] Khai báo biến/hằng số.
const EVENT_TYPES = [
// [VI] Thực thi một bước trong luồng xử lý.
  'Đám cưới',
// [VI] Thực thi một bước trong luồng xử lý.
  'Đám tang',
// [VI] Thực thi một bước trong luồng xử lý.
  'Lễ hội đình',
// [VI] Thực thi một bước trong luồng xử lý.
  'Lễ hội chùa',
// [VI] Thực thi một bước trong luồng xử lý.
  'Tết Nguyên đán',
// [VI] Thực thi một bước trong luồng xử lý.
  'Hội xuân',
// [VI] Thực thi một bước trong luồng xử lý.
  'Lễ cầu mùa',
// [VI] Thực thi một bước trong luồng xử lý.
  'Lễ cúng tổ tiên',
// [VI] Thực thi một bước trong luồng xử lý.
  'Lễ cấp sắc',
// [VI] Thực thi một bước trong luồng xử lý.
  'Lễ hội đâm trâu',
// [VI] Thực thi một bước trong luồng xử lý.
  'Lễ hội cồng chiêng',
// [VI] Thực thi một bước trong luồng xử lý.
  'Sinh hoạt cộng đồng',
// [VI] Thực thi một bước trong luồng xử lý.
  'Biểu diễn nghệ thuật',
// [VI] Thực thi một bước trong luồng xử lý.
  'Ghi âm studio',
// [VI] Thực thi một bước trong luồng xử lý.
  'Ghi âm thực địa',
// [VI] Thực thi một bước trong luồng xử lý.
  'Khác',
// [VI] Thực thi một bước trong luồng xử lý.
] as const;

// [VI] Thực thi một bước trong luồng xử lý.
/** Curated instrument labels (subset) for facet checkboxes — matches SearchBar `INSTRUMENTS`. */
// [VI] Khai báo biến/hằng số.
const INSTRUMENTS_SUBSET = [
// [VI] Thực thi một bước trong luồng xử lý.
  'Đàn bầu (Kinh)',
// [VI] Thực thi một bước trong luồng xử lý.
  'Đàn nguyệt (Kinh)',
// [VI] Thực thi một bước trong luồng xử lý.
  'Đàn nhị (Kinh)',
// [VI] Thực thi một bước trong luồng xử lý.
  'Đàn tam (Kinh)',
// [VI] Thực thi một bước trong luồng xử lý.
  'Đàn tranh (Kinh)',
// [VI] Thực thi một bước trong luồng xử lý.
  'Đàn tỳ bà (Kinh)',
// [VI] Thực thi một bước trong luồng xử lý.
  'Đàn đáy (Kinh)',
// [VI] Thực thi một bước trong luồng xử lý.
  "Đàn môi (H'Mông)",
// [VI] Thực thi một bước trong luồng xử lý.
  "Khèn (H'Mông)",
// [VI] Thực thi một bước trong luồng xử lý.
  'Bro (Ba Na)',
// [VI] Thực thi một bước trong luồng xử lý.
  'Goong (Ba Na)',
// [VI] Thực thi một bước trong luồng xử lý.
  'Cồng, chiêng (Ba Na)',
// [VI] Thực thi một bước trong luồng xử lý.
  "K'ny (Ba Na)",
// [VI] Thực thi một bước trong luồng xử lý.
  'Song lang (Kinh)',
// [VI] Thực thi một bước trong luồng xử lý.
  'Tiêu (Kinh)',
// [VI] Thực thi một bước trong luồng xử lý.
  'Mõ (Kinh)',
// [VI] Thực thi một bước trong luồng xử lý.
  'Phách (Kinh)',
// [VI] Thực thi một bước trong luồng xử lý.
  'Sênh tiền (Kinh)',
// [VI] Thực thi một bước trong luồng xử lý.
  'Trống chầu (Kinh)',
// [VI] Thực thi một bước trong luồng xử lý.
  'Trống cơm (Kinh)',
// [VI] Thực thi một bước trong luồng xử lý.
  "Đàn t'rưng (Ba Na)",
// [VI] Thực thi một bước trong luồng xử lý.
  "Đàn t'rưng (Gia Rai)",
// [VI] Thực thi một bước trong luồng xử lý.
] as const;

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const EXPLORE_FILTER_OPTIONS: ExploreFilterOptions = {
// [VI] Khai báo hàm/biểu thức hàm.
  ethnicities: ETHNICITIES.map((label) => ({ id: label, label })),
// [VI] Thực thi một bước trong luồng xử lý.
  recordingTypes: [
// [VI] Thực thi một bước trong luồng xử lý.
    { value: RecordingType.INSTRUMENTAL, label: 'Nhạc cụ (không lời)' },
// [VI] Thực thi một bước trong luồng xử lý.
    { value: RecordingType.VOCAL, label: 'Có lời / giọng hát' },
// [VI] Thực thi một bước trong luồng xử lý.
    { value: RecordingType.FOLK_SONG, label: 'Dân ca / dân ca đương đại' },
// [VI] Thực thi một bước trong luồng xử lý.
    { value: RecordingType.CEREMONIAL, label: 'Nghi lễ / tín ngưỡng' },
// [VI] Thực thi một bước trong luồng xử lý.
    { value: RecordingType.EPIC, label: 'Sử thi / hò khoan' },
// [VI] Thực thi một bước trong luồng xử lý.
    { value: RecordingType.LULLABY, label: 'Hát ru' },
// [VI] Thực thi một bước trong luồng xử lý.
    { value: RecordingType.WORK_SONG, label: 'Hò / nhịp làm việc' },
// [VI] Thực thi một bước trong luồng xử lý.
    { value: RecordingType.OTHER, label: 'Khác' },
// [VI] Thực thi một bước trong luồng xử lý.
  ],
// [VI] Khai báo hàm/biểu thức hàm.
  genreTags: GENRES.map((label) => ({ id: label, label })),
// [VI] Khai báo hàm/biểu thức hàm.
  instruments: INSTRUMENTS_SUBSET.map((label) => ({ id: label, label })),
// [VI] Thực thi một bước trong luồng xử lý.
  regions: [
// [VI] Thực thi một bước trong luồng xử lý.
    { value: Region.NORTHERN_MOUNTAINS, label: 'Trung du và miền núi Bắc Bộ' },
// [VI] Thực thi một bước trong luồng xử lý.
    { value: Region.RED_RIVER_DELTA, label: 'Đồng bằng Bắc Bộ' },
// [VI] Thực thi một bước trong luồng xử lý.
    { value: Region.NORTH_CENTRAL, label: 'Bắc Trung Bộ' },
// [VI] Thực thi một bước trong luồng xử lý.
    { value: Region.SOUTH_CENTRAL_COAST, label: 'Nam Trung Bộ' },
// [VI] Thực thi một bước trong luồng xử lý.
    { value: Region.CENTRAL_HIGHLANDS, label: 'Cao nguyên Trung Bộ' },
// [VI] Thực thi một bước trong luồng xử lý.
    { value: Region.SOUTHEAST, label: 'Đông Nam Bộ' },
// [VI] Thực thi một bước trong luồng xử lý.
    { value: Region.MEKONG_DELTA, label: 'Tây Nam Bộ' },
// [VI] Thực thi một bước trong luồng xử lý.
  ],
// [VI] Khai báo hàm/biểu thức hàm.
  culturalContexts: EVENT_TYPES.map((label) => ({ id: label, label })),
// [VI] Thực thi một bước trong luồng xử lý.
};
