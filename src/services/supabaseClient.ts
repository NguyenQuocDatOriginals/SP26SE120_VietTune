// [VI] Nhập (import) các phụ thuộc cho file.
import { createClient } from '@supabase/supabase-js';

// [VI] Khai báo biến/hằng số.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// [VI] Khai báo biến/hằng số.
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// [VI] Rẽ nhánh điều kiện (if).
if (!supabaseUrl || !supabaseAnonKey) {
// [VI] Ném lỗi (throw) để báo hiệu thất bại.
  throw new Error('Missing Supabase credentials in .env');
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
