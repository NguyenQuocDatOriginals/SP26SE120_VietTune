/**
 * Recording Image API — multipart upload & management.
 *
 * Endpoints aligned with `docs/recording_image_api_guide.md`.
 * GET/PUT/DELETE use `openapi-fetch` (`apiFetch`); multipart upload uses `legacyPost`
 * so the browser sets the multipart boundary (no manual Content-Type).
 */

import { apiFetch, apiOk, asApiEnvelope, openApiQueryRecord } from '@/api';
import { legacyPost } from '@/api/legacyHttp';

// ── Types ──────────────────────────────────────────────────────────────────

export interface RecordingImage {
  id: string;
  recordingId: string;
  imageUrl: string;
  caption: string | null;
  sortOrder: number;
}

interface ServiceEnvelope<T> {
  success?: boolean;
  isSuccess?: boolean;
  message?: string;
  data?: T;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function unwrap<T>(envelope: unknown): T {
  const e = envelope as ServiceEnvelope<T>;
  if (e && typeof e === 'object' && e.data !== undefined) return e.data;
  return envelope as unknown as T;
}

function mapDtoToRecordingImage(row: unknown): RecordingImage | null {
  if (!row || typeof row !== 'object') return null;
  const r = row as Record<string, unknown>;
  const id = String(r.id ?? '').trim();
  if (!id) return null;
  return {
    id,
    recordingId: String(r.recordingId ?? '').trim(),
    imageUrl: String(r.imageUrl ?? ''),
    caption: r.caption == null ? null : String(r.caption),
    sortOrder: typeof r.sortOrder === 'number' ? r.sortOrder : Number(r.sortOrder ?? 0),
  };
}

/** Sort ascending by sortOrder; primary is sortOrder === 0 or first item. */
function sortRecordingImages(images: RecordingImage[]): RecordingImage[] {
  return [...images].sort((a, b) => a.sortOrder - b.sortOrder);
}

function pickPrimaryRecordingImage(images: RecordingImage[]): RecordingImage | null {
  if (images.length === 0) return null;
  const sorted = sortRecordingImages(images);
  return sorted.find((img) => img.sortOrder === 0) ?? sorted[0] ?? null;
}

// ── Service ────────────────────────────────────────────────────────────────

export const recordingImageService = {
  /**
   * 1. Upload image for a recording (multipart/form-data).
   *    POST /api/RecordingImage/{recordingId}/upload
   */
  uploadImage: async (
    recordingId: string,
    file: File,
    caption?: string,
  ): Promise<RecordingImage> => {
    const formData = new FormData();
    formData.append('file', file);
    if (caption) formData.append('caption', caption);

    const res = await legacyPost<ServiceEnvelope<RecordingImage | Record<string, unknown>>>(
      `/RecordingImage/${encodeURIComponent(recordingId)}/upload`,
      formData,
    );
    const raw = unwrap<RecordingImage | Record<string, unknown>>(res);
    const mapped = mapDtoToRecordingImage(raw);
    if (!mapped) {
      throw new Error('Upload response missing image id');
    }
    return mapped;
  },

  /**
   * 2. Get all images for a recording (sorted by sortOrder asc).
   *    GET /api/RecordingImage/by-recording/{recordingId}
   */
  getByRecording: async (recordingId: string): Promise<RecordingImage[]> => {
    const envelope = await apiOk(
      asApiEnvelope<unknown>(
        apiFetch.GET('/api/RecordingImage/by-recording/{recordingId}', {
          params: { path: { recordingId } },
        }),
      ),
    );
    const raw = unwrap<unknown[]>(envelope) ?? [];
    if (!Array.isArray(raw)) return [];
    return raw.map(mapDtoToRecordingImage).filter((x): x is RecordingImage => x !== null);
  },

  /**
   * 3. Primary image (sortOrder = 0). Derived from `/by-recording` so missing
   *    primary does not trigger HTTP 404 (BE returns NotFound on `/primary`).
   */
  getPrimary: async (recordingId: string): Promise<RecordingImage | null> => {
    const images = await recordingImageService.getByRecording(recordingId);
    return pickPrimaryRecordingImage(images);
  },

  /**
   * 4. Reorder images — first element becomes primary (sortOrder = 0).
   *    PUT /api/RecordingImage/reorder/{recordingId}
   */
  reorder: async (recordingId: string, imageIds: string[]): Promise<boolean> => {
    const envelope = await apiOk(
      asApiEnvelope<unknown>(
        apiFetch.PUT('/api/RecordingImage/reorder/{recordingId}', {
          params: { path: { recordingId } },
          body: imageIds,
        }),
      ),
    );
    const v = unwrap<boolean>(envelope);
    return Boolean(v ?? true);
  },

  /**
   * 5. Delete a single image (also removes file from Supabase).
   *    DELETE /api/RecordingImage/{id}
   */
  deleteImage: async (imageId: string): Promise<boolean> => {
    const envelope = await apiOk(
      asApiEnvelope<unknown>(
        apiFetch.DELETE('/api/RecordingImage/{id}', {
          params: { path: { id: imageId } },
        }),
      ),
    );
    const v = unwrap<boolean>(envelope);
    return Boolean(v ?? true);
  },

  /**
   * 6. Delete orphaned cloud file by URL (safe no-op if invalid).
   *    DELETE /api/RecordingImage/cloud-file?url={publicUrl}
   */
  deleteCloudFile: async (publicUrl: string): Promise<void> => {
    await apiOk(
      asApiEnvelope<unknown>(
        apiFetch.DELETE('/api/RecordingImage/cloud-file', {
          params: { query: openApiQueryRecord({ url: publicUrl }) },
        }),
      ),
    );
  },
};

/** URLs for UI gallery: primary (lowest sortOrder) first via single `/by-recording` call. */
export async function fetchRecordingImageDisplayUrls(recordingId: string): Promise<string[]> {
  const images = await recordingImageService.getByRecording(recordingId);
  return sortRecordingImages(images)
    .map((img) => img.imageUrl.trim())
    .filter((url) => url.length > 0);
}
