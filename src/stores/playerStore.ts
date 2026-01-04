import { create } from 'zustand';
import { Recording } from '@/types';

interface PlayerState {
  currentRecording: Recording | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  playlist: Recording[];
  currentIndex: number;
  setCurrentRecording: (recording: Recording) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaylist: (playlist: Recording[], startIndex?: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  clearPlaylist: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentRecording: null,
  isPlaying: false,
  volume: 0.7,
  currentTime: 0,
  duration: 0,
  playlist: [],
  currentIndex: -1,

  setCurrentRecording: (recording) => {
    set({ currentRecording: recording, currentTime: 0 });
  },

  setIsPlaying: (isPlaying) => {
    set({ isPlaying });
  },

  setVolume: (volume) => {
    set({ volume: Math.max(0, Math.min(1, volume)) });
  },

  setCurrentTime: (time) => {
    set({ currentTime: time });
  },

  setDuration: (duration) => {
    set({ duration });
  },

  setPlaylist: (playlist, startIndex = 0) => {
    const index = Math.max(0, Math.min(startIndex, playlist.length - 1));
    set({ 
      playlist, 
      currentIndex: index,
      currentRecording: playlist[index] || null 
    });
  },

  playNext: () => {
    const { playlist, currentIndex } = get();
    if (playlist.length === 0) return;
    
    const nextIndex = (currentIndex + 1) % playlist.length;
    set({ 
      currentIndex: nextIndex,
      currentRecording: playlist[nextIndex],
      currentTime: 0,
      isPlaying: true,
    });
  },

  playPrevious: () => {
    const { playlist, currentIndex } = get();
    if (playlist.length === 0) return;
    
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    set({ 
      currentIndex: prevIndex,
      currentRecording: playlist[prevIndex],
      currentTime: 0,
      isPlaying: true,
    });
  },

  clearPlaylist: () => {
    set({ 
      playlist: [], 
      currentIndex: -1,
      isPlaying: false,
    });
  },
}));
