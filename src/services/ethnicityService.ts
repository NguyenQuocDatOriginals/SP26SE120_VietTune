import { api } from './api';
import { Ethnicity, PaginatedResponse, ApiResponse } from '@/types';

export const ethnicityService = {
  // Get all ethnicities
  getEthnicities: async (page: number = 1, pageSize: number = 100) => {
    return api.get<PaginatedResponse<Ethnicity>>(`/ethnicities?page=${page}&pageSize=${pageSize}`);
  },

  // Get ethnicity by ID
  getEthnicityById: async (id: string) => {
    return api.get<ApiResponse<Ethnicity>>(`/ethnicities/${id}`);
  },

  // Create ethnicity (admin)
  createEthnicity: async (data: Partial<Ethnicity>) => {
    return api.post<ApiResponse<Ethnicity>>('/ethnicities', data);
  },

  // Update ethnicity (admin)
  updateEthnicity: async (id: string, data: Partial<Ethnicity>) => {
    return api.put<ApiResponse<Ethnicity>>(`/ethnicities/${id}`, data);
  },

  // Delete ethnicity (admin)
  deleteEthnicity: async (id: string) => {
    return api.delete<ApiResponse<void>>(`/ethnicities/${id}`);
  },
};
