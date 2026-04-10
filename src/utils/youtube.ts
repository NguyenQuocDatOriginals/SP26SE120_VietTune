// [VI] Thực thi một bước trong luồng xử lý.
// YouTube URL helpers for AudioPlayer
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function isYouTubeUrl(url?: string): boolean {
// [VI] Rẽ nhánh điều kiện (if).
  if (!url) return false;
// [VI] Trả về kết quả từ hàm.
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//.test(url);
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function getYouTubeId(url: string): string | null {
// [VI] Rẽ nhánh điều kiện (if).
  if (!url) return null;
// [VI] Thực thi một bước trong luồng xử lý.
  // Match various YouTube URL formats
// [VI] Khai báo biến/hằng số.
  const regex =
// [VI] Thực thi một bước trong luồng xử lý.
    /(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/;
// [VI] Khai báo biến/hằng số.
  const match = url.match(regex);
// [VI] Trả về kết quả từ hàm.
  return match ? match[1] : null;
// [VI] Thực thi một bước trong luồng xử lý.
}
