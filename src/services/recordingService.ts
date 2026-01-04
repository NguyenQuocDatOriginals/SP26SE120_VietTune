import { api } from './api';
import { 
  Recording, 
  SearchFilters, 
  PaginatedResponse, 
  UploadRecordingForm,
  ApiResponse 
} from '@/types';

export const recordingService = {
  // Get all recordings with pagination
  getRecordings: async (page: number = 1, pageSize: number = 20) => {
    return api.get<PaginatedResponse<Recording>>(`/recordings?page=${page}&pageSize=${pageSize}`);
  },

  // Get recording by ID
  getRecordingById: async (id: string) => {
    return api.get<ApiResponse<Recording>>(`/recordings/${id}`);
  },

  // Search recordings
  searchRecordings: async (filters: SearchFilters, page: number = 1, pageSize: number = 20) => {
    return api.post<PaginatedResponse<Recording>>('/recordings/search', {
      ...filters,
      page,
      pageSize,
    });
  },

  // Upload new recording
  uploadRecording: async (formData: UploadRecordingForm) => {
    const data = new FormData();
    data.append('title', formData.title);
    if (formData.titleVietnamese) data.append('titleVietnamese', formData.titleVietnamese);
    if (formData.description) data.append('description', formData.description);
    data.append('ethnicityId', formData.ethnicityId);
    data.append('region', formData.region);
    data.append('recordingType', formData.recordingType);
    data.append('audioFile', formData.audioFile);
    if (formData.coverImage) data.append('coverImage', formData.coverImage);
    data.append('instrumentIds', JSON.stringify(formData.instrumentIds));
    data.append('performerIds', JSON.stringify(formData.performerIds));
    if (formData.recordedDate) data.append('recordedDate', formData.recordedDate);
    data.append('tags', JSON.stringify(formData.tags));
    data.append('metadata', JSON.stringify(formData.metadata));

    return api.post<ApiResponse<Recording>>('/recordings', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update recording
  updateRecording: async (id: string, data: Partial<Recording>) => {
    return api.put<ApiResponse<Recording>>(`/recordings/${id}`, data);
  },

  // Delete recording
  deleteRecording: async (id: string) => {
    return api.delete<ApiResponse<void>>(`/recordings/${id}`);
  },

  // Like recording
  likeRecording: async (id: string) => {
    return api.post<ApiResponse<void>>(`/recordings/${id}/like`);
  },

  // Get popular recordings
  getPopularRecordings: async (limit: number = 10) => {
    return api.get<ApiResponse<Recording[]>>(`/recordings/popular?limit=${limit}`);
  },

  // Get recent recordings
  getRecentRecordings: async (limit: number = 10) => {
    return api.get<ApiResponse<Recording[]>>(`/recordings/recent?limit=${limit}`);
  },
};
