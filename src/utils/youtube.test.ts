// [VI] Nhập (import) các phụ thuộc cho file.
import { describe, expect, it } from 'vitest';

// [VI] Nhập (import) các phụ thuộc cho file.
import { getYouTubeId, isYouTubeUrl } from './youtube';

// [VI] Khai báo hàm/biểu thức hàm.
describe('youtube utils', () => {
// [VI] Khai báo hàm/biểu thức hàm.
  it('detects youtube urls', () => {
// [VI] Thực thi một bước trong luồng xử lý.
    expect(isYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
// [VI] Thực thi một bước trong luồng xử lý.
    expect(isYouTubeUrl('https://example.com/video.mp4')).toBe(false);
// [VI] Thực thi một bước trong luồng xử lý.
  });

// [VI] Khai báo hàm/biểu thức hàm.
  it('extracts video id from supported formats', () => {
// [VI] Thực thi một bước trong luồng xử lý.
    expect(getYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
// [VI] Thực thi một bước trong luồng xử lý.
    expect(getYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
// [VI] Thực thi một bước trong luồng xử lý.
    expect(getYouTubeId('invalid-url')).toBeNull();
// [VI] Thực thi một bước trong luồng xử lý.
  });
// [VI] Thực thi một bước trong luồng xử lý.
});
