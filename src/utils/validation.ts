// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function validateAudioFile(file: File): { valid: boolean; error?: string } {
// [VI] Khai báo biến/hằng số.
  const maxSize = 100 * 1024 * 1024; // 100MB
// [VI] Khai báo biến/hằng số.
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/ogg'];

// [VI] Rẽ nhánh điều kiện (if).
  if (!allowedTypes.includes(file.type)) {
// [VI] Trả về kết quả từ hàm.
    return {
// [VI] Thực thi một bước trong luồng xử lý.
      valid: false,
// [VI] Thực thi một bước trong luồng xử lý.
      error: 'Invalid file type. Allowed types: MP3, WAV, FLAC, OGG',
// [VI] Thực thi một bước trong luồng xử lý.
    };
// [VI] Thực thi một bước trong luồng xử lý.
  }

// [VI] Rẽ nhánh điều kiện (if).
  if (file.size > maxSize) {
// [VI] Trả về kết quả từ hàm.
    return {
// [VI] Thực thi một bước trong luồng xử lý.
      valid: false,
// [VI] Thực thi một bước trong luồng xử lý.
      error: 'File size exceeds 100MB limit',
// [VI] Thực thi một bước trong luồng xử lý.
    };
// [VI] Thực thi một bước trong luồng xử lý.
  }

// [VI] Trả về kết quả từ hàm.
  return { valid: true };
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function validateImageFile(file: File): { valid: boolean; error?: string } {
// [VI] Khai báo biến/hằng số.
  const maxSize = 5 * 1024 * 1024; // 5MB
// [VI] Khai báo biến/hằng số.
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

// [VI] Rẽ nhánh điều kiện (if).
  if (!allowedTypes.includes(file.type)) {
// [VI] Trả về kết quả từ hàm.
    return {
// [VI] Thực thi một bước trong luồng xử lý.
      valid: false,
// [VI] Thực thi một bước trong luồng xử lý.
      error: 'Invalid file type. Allowed types: JPEG, PNG, WebP',
// [VI] Thực thi một bước trong luồng xử lý.
    };
// [VI] Thực thi một bước trong luồng xử lý.
  }

// [VI] Rẽ nhánh điều kiện (if).
  if (file.size > maxSize) {
// [VI] Trả về kết quả từ hàm.
    return {
// [VI] Thực thi một bước trong luồng xử lý.
      valid: false,
// [VI] Thực thi một bước trong luồng xử lý.
      error: 'File size exceeds 5MB limit',
// [VI] Thực thi một bước trong luồng xử lý.
    };
// [VI] Thực thi một bước trong luồng xử lý.
  }

// [VI] Trả về kết quả từ hàm.
  return { valid: true };
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function validateEmail(email: string): boolean {
// [VI] Khai báo biến/hằng số.
  const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
// [VI] Trả về kết quả từ hàm.
  return regex.test(email);
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
// [VI] Khai báo biến/hằng số.
  const errors: string[] = [];

// [VI] Rẽ nhánh điều kiện (if).
  if (password.length < 6) {
// [VI] Thực thi một bước trong luồng xử lý.
    errors.push('Password must be at least 6 characters');
// [VI] Thực thi một bước trong luồng xử lý.
  }

// [VI] Rẽ nhánh điều kiện (if).
  if (!/[A-Z]/.test(password)) {
// [VI] Thực thi một bước trong luồng xử lý.
    errors.push('Password must contain at least one uppercase letter');
// [VI] Thực thi một bước trong luồng xử lý.
  }

// [VI] Rẽ nhánh điều kiện (if).
  if (!/[a-z]/.test(password)) {
// [VI] Thực thi một bước trong luồng xử lý.
    errors.push('Password must contain at least one lowercase letter');
// [VI] Thực thi một bước trong luồng xử lý.
  }

// [VI] Rẽ nhánh điều kiện (if).
  if (!/[0-9]/.test(password)) {
// [VI] Thực thi một bước trong luồng xử lý.
    errors.push('Password must contain at least one number');
// [VI] Thực thi một bước trong luồng xử lý.
  }

// [VI] Trả về kết quả từ hàm.
  return {
// [VI] Thực thi một bước trong luồng xử lý.
    valid: errors.length === 0,
// [VI] Thực thi một bước trong luồng xử lý.
    errors,
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
}
