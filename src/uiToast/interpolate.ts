// [VI] Thực thi một bước trong luồng xử lý.
/** Thay `{{key}}` trong template bằng biến. Nếu thiếu key thì thay bằng chuỗi rỗng. */
// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function interpolate(
// [VI] Thực thi một bước trong luồng xử lý.
  template: string,
// [VI] Thực thi một bước trong luồng xử lý.
  vars: Record<string, string | number | undefined> = {},
// [VI] Thực thi một bước trong luồng xử lý.
): string {
// [VI] Khai báo hàm/biểu thức hàm.
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
// [VI] Khai báo biến/hằng số.
    const v = vars[key];
// [VI] Trả về kết quả từ hàm.
    return v != null ? String(v) : '';
// [VI] Thực thi một bước trong luồng xử lý.
  });
// [VI] Thực thi một bước trong luồng xử lý.
}
