import { create } from 'zustand';
import { SearchFilters } from '@/types';

interface SearchState {
  filters: SearchFilters;
  setFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
}

const initialFilters: SearchFilters = {
  query: '',
  ethnicityIds: [],
  regions: [],
  recordingTypes: [],
  instrumentIds: [],
  performerIds: [],
  verificationStatus: [],
  tags: [],
};

export const useSearchStore = create<SearchState>((set) => ({
  filters: initialFilters,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  clearFilters: () => {
    set({ filters: initialFilters });
  },
}));
