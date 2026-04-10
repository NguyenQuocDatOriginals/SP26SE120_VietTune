// [VI] Nhập (import) các phụ thuộc cho file.
import { ModerationStatus, type LocalRecording } from '@/types';

// [VI] Khai báo biến/hằng số.
const now = Date.now();

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function buildMockExpertQueue(): LocalRecording[] {
// [VI] Trả về kết quả từ hàm.
  return [
// [VI] Thực thi một bước trong luồng xử lý.
    {
// [VI] Thực thi một bước trong luồng xử lý.
      id: 'mock-sub-001',
// [VI] Thực thi một bước trong luồng xử lý.
      submissionId: 'mock-sub-001',
// [VI] Thực thi một bước trong luồng xử lý.
      title: 'Hát Then - Lạng Sơn',
// [VI] Thực thi một bước trong luồng xử lý.
      mediaType: 'audio',
// [VI] Thực thi một bước trong luồng xử lý.
      audioUrl: 'https://samplelib.com/lib/preview/mp3/sample-3s.mp3',
// [VI] Thực thi một bước trong luồng xử lý.
      uploadedDate: new Date(now - 1000 * 60 * 20).toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
      basicInfo: { title: 'Hát Then - Lạng Sơn', artist: 'Nông Văn A' },
// [VI] Thực thi một bước trong luồng xử lý.
      uploader: { id: 'u-mock-01', username: 'khach_001' },
// [VI] Thực thi một bước trong luồng xử lý.
      culturalContext: {
// [VI] Thực thi một bước trong luồng xử lý.
        ethnicity: 'Tày',
// [VI] Thực thi một bước trong luồng xử lý.
        region: 'Đông Bắc',
// [VI] Thực thi một bước trong luồng xử lý.
        eventType: 'Nghi lễ',
// [VI] Thực thi một bước trong luồng xử lý.
        instruments: ['Đàn tính'],
// [VI] Thực thi một bước trong luồng xử lý.
      },
// [VI] Thực thi một bước trong luồng xử lý.
      moderation: { status: ModerationStatus.PENDING_REVIEW },
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
    {
// [VI] Thực thi một bước trong luồng xử lý.
      id: 'mock-sub-002',
// [VI] Thực thi một bước trong luồng xử lý.
      submissionId: 'mock-sub-002',
// [VI] Thực thi một bước trong luồng xử lý.
      title: 'Múa cồng chiêng Tây Nguyên',
// [VI] Thực thi một bước trong luồng xử lý.
      mediaType: 'video',
// [VI] Thực thi một bước trong luồng xử lý.
      videoData: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
// [VI] Thực thi một bước trong luồng xử lý.
      uploadedDate: new Date(now - 1000 * 60 * 90).toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
      basicInfo: { title: 'Múa cồng chiêng Tây Nguyên', artist: 'Y Bih' },
// [VI] Thực thi một bước trong luồng xử lý.
      uploader: { id: 'u-mock-02', username: 'khach_002' },
// [VI] Thực thi một bước trong luồng xử lý.
      culturalContext: {
// [VI] Thực thi một bước trong luồng xử lý.
        ethnicity: 'Ê Đê',
// [VI] Thực thi một bước trong luồng xử lý.
        region: 'Tây Nguyên',
// [VI] Thực thi một bước trong luồng xử lý.
        eventType: 'Lễ hội',
// [VI] Thực thi một bước trong luồng xử lý.
        instruments: ['Cồng chiêng'],
// [VI] Thực thi một bước trong luồng xử lý.
      },
// [VI] Thực thi một bước trong luồng xử lý.
      moderation: { status: ModerationStatus.IN_REVIEW, claimedBy: 'expert-mock-01' },
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
    {
// [VI] Thực thi một bước trong luồng xử lý.
      id: 'mock-sub-003',
// [VI] Thực thi một bước trong luồng xử lý.
      submissionId: 'mock-sub-003',
// [VI] Thực thi một bước trong luồng xử lý.
      title: 'Lý kéo chài',
// [VI] Thực thi một bước trong luồng xử lý.
      mediaType: 'audio',
// [VI] Thực thi một bước trong luồng xử lý.
      audioUrl: 'https://samplelib.com/lib/preview/mp3/sample-6s.mp3',
// [VI] Thực thi một bước trong luồng xử lý.
      uploadedDate: new Date(now - 1000 * 60 * 180).toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
      basicInfo: { title: 'Lý kéo chài', artist: 'Trần Thị B' },
// [VI] Thực thi một bước trong luồng xử lý.
      uploader: { id: 'u-mock-03', username: 'khach_003' },
// [VI] Thực thi một bước trong luồng xử lý.
      culturalContext: {
// [VI] Thực thi một bước trong luồng xử lý.
        ethnicity: 'Kinh',
// [VI] Thực thi một bước trong luồng xử lý.
        region: 'Nam Trung Bộ',
// [VI] Thực thi một bước trong luồng xử lý.
        eventType: 'Sinh hoạt cộng đồng',
// [VI] Thực thi một bước trong luồng xử lý.
        instruments: ['Trống', 'Sáo'],
// [VI] Thực thi một bước trong luồng xử lý.
      },
// [VI] Thực thi một bước trong luồng xử lý.
      moderation: { status: ModerationStatus.TEMPORARILY_REJECTED, reviewerId: 'expert-mock-02' },
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
  ];
// [VI] Thực thi một bước trong luồng xử lý.
}
