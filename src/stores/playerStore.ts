// [VI] Nhập (import) các phụ thuộc cho file.
import { create } from 'zustand';

// [VI] Nhập (import) các phụ thuộc cho file.
import { Recording } from '@/types';

// [VI] Khai báo interface để ràng buộc cấu trúc dữ liệu.
interface PlayerState {
// [VI] Thực thi một bước trong luồng xử lý.
  currentRecording: Recording | null;
// [VI] Thực thi một bước trong luồng xử lý.
  isPlaying: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
  volume: number;
// [VI] Thực thi một bước trong luồng xử lý.
  currentTime: number;
// [VI] Thực thi một bước trong luồng xử lý.
  duration: number;
// [VI] Thực thi một bước trong luồng xử lý.
  playlist: Recording[];
// [VI] Thực thi một bước trong luồng xử lý.
  currentIndex: number;
// [VI] Khai báo hàm/biểu thức hàm.
  setCurrentRecording: (recording: Recording) => void;
// [VI] Khai báo hàm/biểu thức hàm.
  setIsPlaying: (isPlaying: boolean) => void;
// [VI] Khai báo hàm/biểu thức hàm.
  setVolume: (volume: number) => void;
// [VI] Khai báo hàm/biểu thức hàm.
  setCurrentTime: (time: number) => void;
// [VI] Khai báo hàm/biểu thức hàm.
  setDuration: (duration: number) => void;
// [VI] Khai báo hàm/biểu thức hàm.
  setPlaylist: (playlist: Recording[], startIndex?: number) => void;
// [VI] Khai báo hàm/biểu thức hàm.
  playNext: () => void;
// [VI] Khai báo hàm/biểu thức hàm.
  playPrevious: () => void;
// [VI] Khai báo hàm/biểu thức hàm.
  clearPlaylist: () => void;
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export const usePlayerStore = create<PlayerState>((set, get) => ({
// [VI] Thực thi một bước trong luồng xử lý.
  currentRecording: null,
// [VI] Thực thi một bước trong luồng xử lý.
  isPlaying: false,
// [VI] Thực thi một bước trong luồng xử lý.
  volume: 0.7,
// [VI] Thực thi một bước trong luồng xử lý.
  currentTime: 0,
// [VI] Thực thi một bước trong luồng xử lý.
  duration: 0,
// [VI] Thực thi một bước trong luồng xử lý.
  playlist: [],
// [VI] Thực thi một bước trong luồng xử lý.
  currentIndex: -1,

// [VI] Khai báo hàm/biểu thức hàm.
  setCurrentRecording: (recording) => {
// [VI] Thực thi một bước trong luồng xử lý.
    set({ currentRecording: recording, currentTime: 0 });
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Khai báo hàm/biểu thức hàm.
  setIsPlaying: (isPlaying) => {
// [VI] Thực thi một bước trong luồng xử lý.
    set({ isPlaying });
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Khai báo hàm/biểu thức hàm.
  setVolume: (volume) => {
// [VI] Thực thi một bước trong luồng xử lý.
    set({ volume: Math.max(0, Math.min(1, volume)) });
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Khai báo hàm/biểu thức hàm.
  setCurrentTime: (time) => {
// [VI] Thực thi một bước trong luồng xử lý.
    set({ currentTime: time });
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Khai báo hàm/biểu thức hàm.
  setDuration: (duration) => {
// [VI] Thực thi một bước trong luồng xử lý.
    set({ duration });
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Khai báo hàm/biểu thức hàm.
  setPlaylist: (playlist, startIndex = 0) => {
// [VI] Khai báo biến/hằng số.
    const index = Math.max(0, Math.min(startIndex, playlist.length - 1));
// [VI] Thực thi một bước trong luồng xử lý.
    set({
// [VI] Thực thi một bước trong luồng xử lý.
      playlist,
// [VI] Thực thi một bước trong luồng xử lý.
      currentIndex: index,
// [VI] Thực thi một bước trong luồng xử lý.
      currentRecording: playlist[index] || null,
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Khai báo hàm/biểu thức hàm.
  playNext: () => {
// [VI] Khai báo biến/hằng số.
    const { playlist, currentIndex } = get();
// [VI] Rẽ nhánh điều kiện (if).
    if (playlist.length === 0) return;

// [VI] Khai báo biến/hằng số.
    const nextIndex = (currentIndex + 1) % playlist.length;
// [VI] Thực thi một bước trong luồng xử lý.
    set({
// [VI] Thực thi một bước trong luồng xử lý.
      currentIndex: nextIndex,
// [VI] Thực thi một bước trong luồng xử lý.
      currentRecording: playlist[nextIndex],
// [VI] Thực thi một bước trong luồng xử lý.
      currentTime: 0,
// [VI] Thực thi một bước trong luồng xử lý.
      isPlaying: true,
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Khai báo hàm/biểu thức hàm.
  playPrevious: () => {
// [VI] Khai báo biến/hằng số.
    const { playlist, currentIndex } = get();
// [VI] Rẽ nhánh điều kiện (if).
    if (playlist.length === 0) return;

// [VI] Khai báo biến/hằng số.
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
// [VI] Thực thi một bước trong luồng xử lý.
    set({
// [VI] Thực thi một bước trong luồng xử lý.
      currentIndex: prevIndex,
// [VI] Thực thi một bước trong luồng xử lý.
      currentRecording: playlist[prevIndex],
// [VI] Thực thi một bước trong luồng xử lý.
      currentTime: 0,
// [VI] Thực thi một bước trong luồng xử lý.
      isPlaying: true,
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Thực thi một bước trong luồng xử lý.
  },

// [VI] Khai báo hàm/biểu thức hàm.
  clearPlaylist: () => {
// [VI] Thực thi một bước trong luồng xử lý.
    set({
// [VI] Thực thi một bước trong luồng xử lý.
      playlist: [],
// [VI] Thực thi một bước trong luồng xử lý.
      currentIndex: -1,
// [VI] Thực thi một bước trong luồng xử lý.
      isPlaying: false,
// [VI] Thực thi một bước trong luồng xử lý.
    });
// [VI] Thực thi một bước trong luồng xử lý.
  },
// [VI] Thực thi một bước trong luồng xử lý.
}));
