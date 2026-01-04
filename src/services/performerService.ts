import { api } from './api';
import { Performer, PaginatedResponse, ApiResponse } from '@/types';

export const performerService = {
  // Get all performers/masters
  getPerformers: async (page: number = 1, pageSize: number = 50) => {
    return api.get<PaginatedResponse<Performer>>(`/performers?page=${page}&pageSize=${pageSize}`);
  },

  // Get performer by ID
  getPerformerById: async (id: string) => {
    return api.get<ApiResponse<Performer>>(`/performers/${id}`);
  },

  // Search performers
  searchPerformers: async (query: string) => {
    return api.get<ApiResponse<Performer[]>>(`/performers/search?q=${query}`);
  },

  // Create performer
  createPerformer: async (data: Partial<Performer>) => {
    return api.post<ApiResponse<Performer>>('/performers', data);
  },

  // Update performer
  updatePerformer: async (id: string, data: Partial<Performer>) => {
    return api.put<ApiResponse<Performer>>(`/performers/${id}`, data);
  },

  // Delete performer
  deletePerformer: async (id: string) => {
    return api.delete<ApiResponse<void>>(`/performers/${id}`);
  },
};
