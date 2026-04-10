// [VI] Nhập (import) các phụ thuộc cho file.
import { describe, expect, it, vi } from 'vitest';

// [VI] Nhập (import) các phụ thuộc cho file.
import { createGeocodeService } from '@/services/geocodeService';
// [VI] Nhập (import) các phụ thuộc cho file.
import { createMetadataSuggestService } from '@/services/metadataSuggestService';
// [VI] Nhập (import) các phụ thuộc cho file.
import type { ServiceApiClient } from '@/services/serviceApiClient';

// [VI] Khai báo hàm/biểu thức hàm.
function createMockClient(): ServiceApiClient & {
// [VI] Thực thi một bước trong luồng xử lý.
  get: ReturnType<typeof vi.fn>;
// [VI] Thực thi một bước trong luồng xử lý.
  post: ReturnType<typeof vi.fn>;
// [VI] Thực thi một bước trong luồng xử lý.
  put: ReturnType<typeof vi.fn>;
// [VI] Thực thi một bước trong luồng xử lý.
} {
// [VI] Trả về kết quả từ hàm.
  return {
// [VI] Thực thi một bước trong luồng xử lý.
    get: vi.fn(),
// [VI] Thực thi một bước trong luồng xử lý.
    post: vi.fn(),
// [VI] Thực thi một bước trong luồng xử lý.
    put: vi.fn(),
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Khai báo hàm/biểu thức hàm.
describe('ai utility service factories', () => {
// [VI] Khai báo hàm/biểu thức hàm.
  it('normalizes metadata suggest response using injected client', async () => {
// [VI] Khai báo biến/hằng số.
    const client = createMockClient();
// [VI] Khai báo biến/hằng số.
    const service = createMetadataSuggestService(client);
// [VI] Thực thi một bước trong luồng xử lý.
    client.post.mockResolvedValueOnce({
// [VI] Thực thi một bước trong luồng xử lý.
      Ethnicity: 'Kinh',
// [VI] Thực thi một bước trong luồng xử lý.
      Region: 'Mien Bac',
// [VI] Thực thi một bước trong luồng xử lý.
      Instruments: ['Dan tranh', 123, 'Sao truc'],
// [VI] Thực thi một bước trong luồng xử lý.
    });

// [VI] Khai báo biến/hằng số.
    const result = await service.suggestMetadata({
// [VI] Thực thi một bước trong luồng xử lý.
      genre: 'folk',
// [VI] Thực thi một bước trong luồng xử lý.
      title: 'Song',
// [VI] Thực thi một bước trong luồng xử lý.
      description: 'Desc',
// [VI] Thực thi một bước trong luồng xử lý.
    });

// [VI] Thực thi một bước trong luồng xử lý.
    expect(client.post).toHaveBeenCalledWith('MetadataSuggest', {
// [VI] Thực thi một bước trong luồng xử lý.
      genre: 'folk',
// [VI] Thực thi một bước trong luồng xử lý.
      title: 'Song',
// [VI] Thực thi một bước trong luồng xử lý.
      description: 'Desc',
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Thực thi một bước trong luồng xử lý.
    expect(result).toEqual({
// [VI] Thực thi một bước trong luồng xử lý.
      ethnicity: 'Kinh',
// [VI] Thực thi một bước trong luồng xử lý.
      region: 'Mien Bac',
// [VI] Thực thi một bước trong luồng xử lý.
      instruments: ['Dan tranh', 'Sao truc'],
// [VI] Thực thi một bước trong luồng xử lý.
      message: null,
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Thực thi một bước trong luồng xử lý.
  });

// [VI] Khai báo hàm/biểu thức hàm.
  it('returns backend error message for metadata suggest failure', async () => {
// [VI] Khai báo biến/hằng số.
    const client = createMockClient();
// [VI] Khai báo biến/hằng số.
    const service = createMetadataSuggestService(client);
// [VI] Thực thi một bước trong luồng xử lý.
    client.post.mockRejectedValueOnce({
// [VI] Thực thi một bước trong luồng xử lý.
      response: {
// [VI] Thực thi một bước trong luồng xử lý.
        data: { message: 'Gemini unavailable' },
// [VI] Thực thi một bước trong luồng xử lý.
      },
// [VI] Thực thi một bước trong luồng xử lý.
    });

// [VI] Thực thi một bước trong luồng xử lý.
    await expect(service.suggestMetadata({})).resolves.toEqual({
// [VI] Thực thi một bước trong luồng xử lý.
      message: 'Gemini unavailable',
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Thực thi một bước trong luồng xử lý.
  });

// [VI] Khai báo hàm/biểu thức hàm.
  it('falls back to coordinate text for geocode failure', async () => {
// [VI] Khai báo biến/hằng số.
    const client = createMockClient();
// [VI] Khai báo biến/hằng số.
    const service = createGeocodeService(client);
// [VI] Thực thi một bước trong luồng xử lý.
    client.get.mockRejectedValueOnce(new Error('network down'));

// [VI] Khai báo biến/hằng số.
    const result = await service.getAddressFromCoordinates(10.1234567, 106.7654321);

// [VI] Thực thi một bước trong luồng xử lý.
    expect(result).toEqual({
// [VI] Thực thi một bước trong luồng xử lý.
      address: 'Tọa độ: 10.123457, 106.765432',
// [VI] Thực thi một bước trong luồng xử lý.
      coordinates: '10.123457, 106.765432',
// [VI] Thực thi một bước trong luồng xử lý.
      addressFromService: false,
// [VI] Thực thi một bước trong luồng xử lý.
      message: 'network down',
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Thực thi một bước trong luồng xử lý.
  });
// [VI] Thực thi một bước trong luồng xử lý.
});
