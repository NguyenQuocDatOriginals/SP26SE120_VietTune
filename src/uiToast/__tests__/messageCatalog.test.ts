// [VI] Nhập (import) các phụ thuộc cho file.
import { describe, expect, it } from 'vitest';

// [VI] Nhập (import) các phụ thuộc cho file.
import { MESSAGE_CATALOG, resolveCatalogMessage } from '../messageCatalog';

// [VI] Khai báo hàm/biểu thức hàm.
describe('MESSAGE_CATALOG + resolveCatalogMessage', () => {
// [VI] Khai báo hàm/biểu thức hàm.
  it('moderation.wizard.step_incomplete interpolates step', () => {
// [VI] Thực thi một bước trong luồng xử lý.
    expect(resolveCatalogMessage('moderation.wizard.step_incomplete', { step: 3 })).toContain(
// [VI] Thực thi một bước trong luồng xử lý.
      'Bước 3',
// [VI] Thực thi một bước trong luồng xử lý.
    );
// [VI] Thực thi một bước trong luồng xử lý.
  });

// [VI] Khai báo hàm/biểu thức hàm.
  it('every catalog entry is non-empty string', () => {
// [VI] Vòng lặp (for).
    for (const [key, value] of Object.entries(MESSAGE_CATALOG)) {
// [VI] Thực thi một bước trong luồng xử lý.
      expect(typeof value, key).toBe('string');
// [VI] Thực thi một bước trong luồng xử lý.
      expect(value.trim().length, key).toBeGreaterThan(0);
// [VI] Thực thi một bước trong luồng xử lý.
    }
// [VI] Thực thi một bước trong luồng xử lý.
  });
// [VI] Thực thi một bước trong luồng xử lý.
});
