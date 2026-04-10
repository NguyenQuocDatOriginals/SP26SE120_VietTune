// [VI] Nhập (import) các phụ thuộc cho file.
import { supabase } from './supabaseClient';

// [VI] Nhập (import) các phụ thuộc cho file.
import { logServiceError, logServiceInfo, logServiceWarn } from '@/services/serviceLogger';

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Uploads an audio or video file to the Supabase specified bucket and returns the public URL.
// [VI] Thực thi một bước trong luồng xử lý.
 *
// [VI] Thực thi một bước trong luồng xử lý.
 * @param file The file object to upload
// [VI] Thực thi một bước trong luồng xử lý.
 * @param bucketName The name of the Supabase storage bucket
// [VI] Thực thi một bước trong luồng xử lý.
 * @returns The public URL of the uploaded file
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const uploadFileToSupabase = async (
// [VI] Thực thi một bước trong luồng xử lý.
  file: File,
// [VI] Thực thi một bước trong luồng xử lý.
  bucketName: string = import.meta.env.VITE_SUPABASE_BUCKET || 'audio',
// [VI] Khai báo hàm/biểu thức hàm.
): Promise<string> => {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
  try {
// [VI] Thực thi một bước trong luồng xử lý.
    // Generate a unique file name to avoid collisions
// [VI] Khai báo biến/hằng số.
    const fileExt = file.name.split('.').pop();
// [VI] Khai báo biến/hằng số.
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
// [VI] Khai báo biến/hằng số.
    const filePath = `${fileName}`;

// [VI] Thực thi một bước trong luồng xử lý.
    // Upload the file to Supabase storage
// [VI] Khai báo biến/hằng số.
    const { error } = await supabase.storage.from(bucketName).upload(filePath, file, {
// [VI] Thực thi một bước trong luồng xử lý.
      cacheControl: '3600',
// [VI] Thực thi một bước trong luồng xử lý.
      upsert: false,
// [VI] Thực thi một bước trong luồng xử lý.
    });

// [VI] Rẽ nhánh điều kiện (if).
    if (error) {
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceError('Supabase upload error', error.message);
// [VI] Ném lỗi (throw) để báo hiệu thất bại.
      throw new Error(`Upload failed: ${error.message}`);
// [VI] Thực thi một bước trong luồng xử lý.
    }

// [VI] Thực thi một bước trong luồng xử lý.
    // Get the public URL for the uploaded file
// [VI] Khai báo biến/hằng số.
    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);

// [VI] Trả về kết quả từ hàm.
    return publicUrlData.publicUrl;
// [VI] Thực thi một bước trong luồng xử lý.
  } catch (error) {
// [VI] Thực thi một bước trong luồng xử lý.
    logServiceError('Error uploading file to Supabase', error);
// [VI] Ném lỗi (throw) để báo hiệu thất bại.
    throw error;
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Deletes a file from the Supabase specified bucket using its public URL.
// [VI] Thực thi một bước trong luồng xử lý.
 *
// [VI] Thực thi một bước trong luồng xử lý.
 * @param publicUrl The public URL of the file to delete
// [VI] Thực thi một bước trong luồng xử lý.
 * @param bucketName The name of the Supabase storage bucket
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const deleteFileFromSupabase = async (
// [VI] Thực thi một bước trong luồng xử lý.
  publicUrl: string,
// [VI] Thực thi một bước trong luồng xử lý.
  _defaultBucketName: string = 'VietTuneArchive',
// [VI] Khai báo hàm/biểu thức hàm.
): Promise<void> => {
// [VI] Bắt đầu khối xử lý lỗi (try/catch).
  try {
// [VI] Rẽ nhánh điều kiện (if).
    if (!publicUrl) {
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceWarn('[Supabase Delete] No URL provided');
// [VI] Thực thi một bước trong luồng xử lý.
      return;
// [VI] Thực thi một bước trong luồng xử lý.
    }

// [VI] Thực thi một bước trong luồng xử lý.
    // 1. Parse URL to get bucket and path
// [VI] Thực thi một bước trong luồng xử lý.
    // Example: https://.../storage/v1/object/public/BucketName/folder/file.mp3
// [VI] Khai báo biến/hằng số.
    const parts = publicUrl.split('/');
// [VI] Khai báo biến/hằng số.
    const publicIndex = parts.indexOf('public');
// [VI] Khai báo biến/hằng số.
    const filenameFromUrl = parts[parts.length - 1];

// [VI] Khai báo biến/hằng số.
    let bucketName = _defaultBucketName;
// [VI] Khai báo biến/hằng số.
    let filePath = filenameFromUrl;

// [VI] Rẽ nhánh điều kiện (if).
    if (publicIndex !== -1 && parts.length > publicIndex + 2) {
// [VI] Thực thi một bước trong luồng xử lý.
      bucketName = parts[publicIndex + 1];
// [VI] Thực thi một bước trong luồng xử lý.
      filePath = parts.slice(publicIndex + 2).join('/');
// [VI] Thực thi một bước trong luồng xử lý.
    }

// [VI] Thực thi một bước trong luồng xử lý.
    logServiceInfo(`[Supabase Delete] Attempting deletion...
// [VI] Thực thi một bước trong luồng xử lý.
      URL: ${publicUrl}
// [VI] Thực thi một bước trong luồng xử lý.
      Bucket: ${bucketName}
// [VI] Thực thi một bước trong luồng xử lý.
      Path: ${filePath}`);

// [VI] Thực thi một bước trong luồng xử lý.
    // Attempt 1: Standard path (no leading slash)
// [VI] Khai báo biến/hằng số.
    const { data: d1, error: e1 } = await supabase.storage.from(bucketName).remove([filePath]);

// [VI] Rẽ nhánh điều kiện (if).
    if (e1) {
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceError(`[Supabase Delete] Attempt 1 Error (${filePath})`, e1.message);
// [VI] Thực thi một bước trong luồng xử lý.
    } else if (d1 && d1.length > 0) {
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceInfo('[Supabase Delete] Success (Attempt 1)', d1);
// [VI] Thực thi một bước trong luồng xử lý.
      return;
// [VI] Thực thi một bước trong luồng xử lý.
    } else {
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceWarn(
// [VI] Thực thi một bước trong luồng xử lý.
        '[Supabase Delete] Attempt 1 returned empty data (not found or permission denied)',
// [VI] Thực thi một bước trong luồng xử lý.
      );
// [VI] Thực thi một bước trong luồng xử lý.
    }

// [VI] Thực thi một bước trong luồng xử lý.
    // Attempt 2: Path with leading slash (some older versions or specific setups)
// [VI] Khai báo biến/hằng số.
    const altPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
// [VI] Thực thi một bước trong luồng xử lý.
    logServiceInfo(`[Supabase Delete] Attempt 2 with leading slash: ${altPath}`);
// [VI] Khai báo biến/hằng số.
    const { data: d2, error: e2 } = await supabase.storage.from(bucketName).remove([altPath]);

// [VI] Rẽ nhánh điều kiện (if).
    if (!e2 && d2 && d2.length > 0) {
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceInfo('[Supabase Delete] Success (Attempt 2)', d2);
// [VI] Thực thi một bước trong luồng xử lý.
      return;
// [VI] Thực thi một bước trong luồng xử lý.
    }

// [VI] Thực thi một bước trong luồng xử lý.
    // Attempt 3: Just the filename in the default bucket (Final fallback)
// [VI] Rẽ nhánh điều kiện (if).
    if (filePath !== filenameFromUrl || bucketName !== _defaultBucketName) {
// [VI] Thực thi một bước trong luồng xử lý.
      logServiceInfo(
// [VI] Thực thi một bước trong luồng xử lý.
        `[Supabase Delete] Attempt 3 (Fallback) using filename in default bucket: ${filenameFromUrl}`,
// [VI] Thực thi một bước trong luồng xử lý.
      );
// [VI] Khai báo biến/hằng số.
      const { data: d3, error: e3 } = await supabase.storage
// [VI] Thực thi một bước trong luồng xử lý.
        .from(_defaultBucketName)
// [VI] Thực thi một bước trong luồng xử lý.
        .remove([filenameFromUrl]);

// [VI] Rẽ nhánh điều kiện (if).
      if (!e3 && d3 && d3.length > 0) {
// [VI] Thực thi một bước trong luồng xử lý.
        logServiceInfo('[Supabase Delete] Success (Attempt 3)', d3);
// [VI] Thực thi một bước trong luồng xử lý.
        return;
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    }

// [VI] Thực thi một bước trong luồng xử lý.
    logServiceError(
// [VI] Thực thi một bước trong luồng xử lý.
      `[Supabase Delete] All attempts failed for ${publicUrl}. Check if the file exists and if the ANON key has DELETE permissions for bucket '${bucketName}'.`,
// [VI] Thực thi một bước trong luồng xử lý.
    );
// [VI] Thực thi một bước trong luồng xử lý.
  } catch (error) {
// [VI] Thực thi một bước trong luồng xử lý.
    logServiceError('[Supabase Delete] unexpected crash', error);
// [VI] Thực thi một bước trong luồng xử lý.
  }
// [VI] Thực thi một bước trong luồng xử lý.
};
