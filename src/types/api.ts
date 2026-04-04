import type { Recording, RecordingType, VerificationStatus } from '@/types/recording';
import type { Region } from '@/types/reference';

export interface SearchFilters {
  query?: string;
  ethnicityIds?: string[];
  regions?: Region[];
  recordingTypes?: RecordingType[];
  instrumentIds?: string[];
  performerIds?: string[];
  verificationStatus?: VerificationStatus[];
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
}

export interface SearchResult {
  recordings: Recording[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
