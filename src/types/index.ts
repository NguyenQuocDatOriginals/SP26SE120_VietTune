// User types
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  expertise?: string[];
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
  RESEARCHER = "RESEARCHER",
  CONTRIBUTOR = "CONTRIBUTOR",
  EXPERT = "EXPERT",
  USER = "USER",
}

export enum ModerationStatus {
  PENDING_REVIEW = "PENDING_REVIEW",
  IN_REVIEW = "IN_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  TEMPORARILY_REJECTED = "TEMPORARILY_REJECTED",
}

// Recording types
export interface Recording {
  id: string;
  title: string;
  titleVietnamese?: string;
  description?: string;
  ethnicity: Ethnicity;
  region: Region;
  recordingType: RecordingType;
  duration: number; // in seconds
  audioUrl: string;
  waveformUrl?: string;
  coverImage?: string;
  instruments: Instrument[];
  performers: Performer[];
  recordedDate?: string;
  uploadedDate: string;
  uploader: User;
  tags: string[];
  metadata: RecordingMetadata;
  verificationStatus: VerificationStatus;
  verifiedBy?: User;
  viewCount: number;
  likeCount: number;
  downloadCount: number;
}

export interface RecordingMetadata {
  tuningSystem?: string;
  modalStructure?: string;
  tempo?: number;
  ritualContext?: string;
  regionalVariation?: string;
  lyrics?: string;
  lyricsTranslation?: string;
  transcription?: string;
  culturalSignificance?: string;
  historicalContext?: string;
  recordingQuality: RecordingQuality;
  originalSource?: string;
}

export enum RecordingType {
  INSTRUMENTAL = "INSTRUMENTAL",
  VOCAL = "VOCAL",
  CEREMONIAL = "CEREMONIAL",
  FOLK_SONG = "FOLK_SONG",
  EPIC = "EPIC",
  LULLABY = "LULLABY",
  WORK_SONG = "WORK_SONG",
  OTHER = "OTHER",
}

export enum RecordingQuality {
  PROFESSIONAL = "PROFESSIONAL",
  FIELD_RECORDING = "FIELD_RECORDING",
  ARCHIVE = "ARCHIVE",
  DIGITIZED = "DIGITIZED",
}

export enum VerificationStatus {
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
  UNDER_REVIEW = "UNDER_REVIEW",
}

// Ethnicity types
export interface Ethnicity {
  id: string;
  name: string;
  nameVietnamese: string;
  description?: string;
  region: Region;
  population?: number;
  language?: string;
  musicalTraditions?: string;
  thumbnail?: string;
  recordingCount: number;
}

export enum Region {
  NORTHERN_MOUNTAINS = "NORTHERN_MOUNTAINS",
  RED_RIVER_DELTA = "RED_RIVER_DELTA",
  NORTH_CENTRAL = "NORTH_CENTRAL",
  SOUTH_CENTRAL_COAST = "SOUTH_CENTRAL_COAST",
  CENTRAL_HIGHLANDS = "CENTRAL_HIGHLANDS",
  SOUTHEAST = "SOUTHEAST",
  MEKONG_DELTA = "MEKONG_DELTA",
}

// Instrument types
export interface Instrument {
  id: string;
  name: string;
  nameVietnamese: string;
  description?: string;
  category: InstrumentCategory;
  construction?: string;
  playingTechnique?: string;
  images: string[];
  ethnicity?: Ethnicity;
  audioSamples?: string[];
  recordingCount: number;
}

export enum InstrumentCategory {
  STRING = "STRING",
  WIND = "WIND",
  PERCUSSION = "PERCUSSION",
  IDIOPHONE = "IDIOPHONE",
  VOICE = "VOICE",
}

// Performer/Master types
export interface Performer {
  id: string;
  name: string;
  nameVietnamese?: string;
  title?: string; // e.g., "Nghệ nhân", "Master musician"
  ethnicity?: Ethnicity;
  specialization?: string[];
  biography?: string;
  birthYear?: number;
  deathYear?: number;
  photo?: string;
  recordingCount: number;
  isVerified: boolean;
}

// Search & Filter types
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

// API Response types
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

// Form types
export interface UploadRecordingForm {
  title: string;
  titleVietnamese?: string;
  description?: string;
  ethnicityId: string;
  region: Region;
  recordingType: RecordingType;
  audioFile: File;
  coverImage?: File;
  instrumentIds: string[];
  performerIds: string[];
  recordedDate?: string;
  tags: string[];
  metadata: Partial<RecordingMetadata>;
}

export interface LoginForm {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}
