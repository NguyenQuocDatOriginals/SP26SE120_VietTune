// [VI] Nhập (import) các phụ thuộc cho file.
import { create } from 'zustand';

// [VI] Thực thi một bước trong luồng xử lý.
/**
// [VI] Thực thi một bước trong luồng xử lý.
 * Global "single active media" state for the page.
// [VI] Thực thi một bước trong luồng xử lý.
 * When one AudioPlayer or VideoPlayer plays, its id is set here;
// [VI] Thực thi một bước trong luồng xử lý.
 * all other players (audio and video) subscribe and pause themselves.
// [VI] Thực thi một bước trong luồng xử lý.
 */
// [VI] Khai báo interface để ràng buộc cấu trúc dữ liệu.
interface MediaFocusState {
// [VI] Thực thi một bước trong luồng xử lý.
  activeMediaId: string | null;
// [VI] Khai báo hàm/biểu thức hàm.
  setActiveMediaId: (id: string | null) => void;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const useMediaFocusStore = create<MediaFocusState>((set) => ({
// [VI] Thực thi một bước trong luồng xử lý.
  activeMediaId: null,
// [VI] Khai báo hàm/biểu thức hàm.
  setActiveMediaId: (id) => set({ activeMediaId: id }),
// [VI] Thực thi một bước trong luồng xử lý.
}));
