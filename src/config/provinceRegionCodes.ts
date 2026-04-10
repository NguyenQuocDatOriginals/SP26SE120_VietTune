// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Maps ReferenceData `province.regionCode` (compact codes used in upload form) to display names for “vùng / miền”.
// [VI] Thực thi một bước trong luồng xử lý.
 * Keep in sync with contributor flow expectations.
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const PROVINCE_REGION_CODE_TO_NAME: Record<string, string> = {
// [VI] Thực thi một bước trong luồng xử lý.
  TN: 'Tây Nguyên',
// [VI] Thực thi một bước trong luồng xử lý.
  DNB: 'Đông Nam Bộ',
// [VI] Thực thi một bước trong luồng xử lý.
  DBSCL: 'Đồng bằng sông Cửu Long',
// [VI] Thực thi một bước trong luồng xử lý.
  TB: 'Tây Bắc',
// [VI] Thực thi một bước trong luồng xử lý.
  DBSH: 'Đồng bằng sông Hồng',
// [VI] Thực thi một bước trong luồng xử lý.
  ĐB: 'Đông Bắc',
// [VI] Thực thi một bước trong luồng xử lý.
  BTB: 'Bắc Trung Bộ',
// [VI] Thực thi một bước trong luồng xử lý.
  NTB: 'Nam Trung Bộ',
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Thực thi một bước trong luồng xử lý.
/** Human label for upload/reference `regionCode`; empty string if missing (matches legacy `getRegionName`). */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function macroRegionDisplayNameFromProvinceRegionCode(
// [VI] Thực thi một bước trong luồng xử lý.
  code: string | undefined | null,
// [VI] Thực thi một bước trong luồng xử lý.
): string {
// [VI] Rẽ nhánh điều kiện (if).
  if (code == null || !String(code).trim()) return '';
// [VI] Khai báo biến/hằng số.
  const c = String(code).trim();
// [VI] Trả về kết quả từ hàm.
  return PROVINCE_REGION_CODE_TO_NAME[c] ?? c;
// [VI] Thực thi một bước trong luồng xử lý.
}
