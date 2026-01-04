import { api } from './api';
import { Instrument, PaginatedResponse, ApiResponse } from '@/types';

export const instrumentService = {
  // Get all instruments
  getInstruments: async (page: number = 1, pageSize: number = 50) => {
    return api.get<PaginatedResponse<Instrument>>(`/instruments?page=${page}&pageSize=${pageSize}`);
  },

  // Get instrument by ID
  getInstrumentById: async (id: string) => {
    return api.get<ApiResponse<Instrument>>(`/instruments/${id}`);
  },

  // Search instruments
  searchInstruments: async (query: string) => {
    return api.get<ApiResponse<Instrument[]>>(`/instruments/search?q=${query}`);
  },

  // Create instrument (admin)
  createInstrument: async (data: Partial<Instrument>) => {
    return api.post<ApiResponse<Instrument>>('/instruments', data);
  },

  // Update instrument (admin)
  updateInstrument: async (id: string, data: Partial<Instrument>) => {
    return api.put<ApiResponse<Instrument>>(`/instruments/${id}`, data);
  },

  // Delete instrument (admin)
  deleteInstrument: async (id: string) => {
    return api.delete<ApiResponse<void>>(`/instruments/${id}`);
  },
};
