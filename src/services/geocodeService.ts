// [VI] Nhập (import) các phụ thuộc cho file.
import { api } from '@/services/api';
// [VI] Nhập (import) các phụ thuộc cho file.
import type { ServiceApiClient } from '@/services/serviceApiClient';
// [VI] Nhập (import) các phụ thuộc cho file.
import { logServiceWarn } from '@/services/serviceLogger';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export type ReverseGeocodeResponse = {
// [VI] Thực thi một bước trong luồng xử lý.
  address?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  coordinates?: string;
// [VI] Thực thi một bước trong luồng xử lý.
  /** True khi backend lấy được địa chỉ từ dịch vụ bản đồ (Nominatim). */
// [VI] Thực thi một bước trong luồng xử lý.
  addressFromService?: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
  message?: string;
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Reverse geocode: chuyển tọa độ (lat, lon) thành địa chỉ dạng chữ qua backend (Nominatim).
// [VI] Thực thi một bước trong luồng xử lý.
 * Backend luôn trả 200; khi không lấy được địa chỉ thì address = "Tọa độ: lat, lon" và addressFromService = false.
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function createGeocodeService(client: ServiceApiClient) {
// [VI] Trả về kết quả từ hàm.
  return {
// [VI] Thực thi một bước trong luồng xử lý.
    getAddressFromCoordinates: async (
// [VI] Thực thi một bước trong luồng xử lý.
      lat: number,
// [VI] Thực thi một bước trong luồng xử lý.
      lon: number,
// [VI] Khai báo hàm/biểu thức hàm.
    ): Promise<ReverseGeocodeResponse> => {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
      try {
// [VI] Khai báo biến/hằng số.
        const data = await client.get<ReverseGeocodeResponse>('Geocode/reverse', {
// [VI] Thực thi một bước trong luồng xử lý.
          params: { lat, lon },
// [VI] Thực thi một bước trong luồng xử lý.
        });
// [VI] Trả về kết quả từ hàm.
        return data ?? {};
// [VI] Thực thi một bước trong luồng xử lý.
      } catch (err) {
// [VI] Thực thi một bước trong luồng xử lý.
        logServiceWarn('Geocode reverse error', err);
// [VI] Khai báo biến/hằng số.
        const gpsText = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
// [VI] Trả về kết quả từ hàm.
        return {
// [VI] Thực thi một bước trong luồng xử lý.
          address: `Tọa độ: ${gpsText}`,
// [VI] Thực thi một bước trong luồng xử lý.
          coordinates: gpsText,
// [VI] Thực thi một bước trong luồng xử lý.
          addressFromService: false,
// [VI] Thực thi một bước trong luồng xử lý.
          message: (err as Error)?.message ?? 'Không kết nối được dịch vụ địa chỉ.',
// [VI] Thực thi một bước trong luồng xử lý.
        };
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo biến/hằng số.
const geocodeService = createGeocodeService(api);
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const getAddressFromCoordinates = geocodeService.getAddressFromCoordinates;
