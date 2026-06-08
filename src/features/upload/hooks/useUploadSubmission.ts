import { useCallback, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import type { RecordingUploadDto } from '@/api';
import { legacyPost } from '@/api/legacyHttp';
import { applyAiAnalyzeOnlyMetadata } from '@/features/upload/applyAiAnalyzeOnlyMetadata';
import {
  debugLogAiAnalyzeOnly,
  hasMeaningfulNormalizedAiData,
  normalizeAiAnalyzeOnlyResponse,
  type NormalizedAiAnalysisPayload,
} from '@/features/upload/normalizeAiAnalysisResponse';
import { mergeInstrumentDetectionSignals } from '@/features/upload/performanceTypeUtils';
import { reportError, toReportableError } from '@/services/errorReporting';
import { instrumentDetectionFlags } from '@/services/instrumentDetectionService';
import { recordingImageService, fetchRecordingImageDisplayUrls } from '@/services/recordingImageService';
import { recordingService } from '@/services/recordingService';
import type {
  EthnicGroupItem,
  InstrumentItem,
  VocalStyleItem,
} from '@/services/referenceDataService';
import { submissionService } from '@/services/submissionService';
import { submissionVersionApi } from '@/services/submissionVersionApi';
import { uploadFileToSupabase } from '@/services/uploadService';
import type { DetectedInstrument, MetadataSuggestion } from '@/types/instrumentDetection';
import { UserRole } from '@/types';
import { uiToast } from '@/uiToast';
import {
  buildAiDirectSuggestions,
  dedupeAndSortMetadataSuggestions,
  mapInstrumentsToMetadataSuggestions,
} from '@/utils/instrumentMetadataMapper';

/** Never use a sentinel id (e.g. `'1'`) — misattributes ownership if JWT/session is missing. */
const MISSING_CONTRIBUTOR_USER_ID = 'MISSING_CONTRIBUTOR_USER_ID';

function resolveContributorUserId(userId: string | number | undefined | null): string {
  if (userId === undefined || userId === null) {
    throw new Error(MISSING_CONTRIBUTOR_USER_ID);
  }
  const s = String(userId).trim();
  if (s === '') {
    throw new Error(MISSING_CONTRIBUTOR_USER_ID);
  }
  return s;
}

type NameItem = { id?: string; name: string };
type IdNameItem = { id: string; name: string };
type DistrictLike = { id: string; name: string; provinceId: string };
type CommuneLike = { id: string; name: string; districtId: string };

type MediaInfo = {
  duration?: number;
  type?: string;
  size?: number;
  name?: string;
};

type UseUploadSubmissionOptions = {
  isEditMode: boolean;
  currentUserId?: string | number;
  currentUserRole?: UserRole;
  mediaType: 'audio' | 'video';
  file: File | null;
  recordingImages: File[];
  createdRecordingId: string | null;
  setCreatedRecordingId: (value: string | null) => void;
  setCurrentSubmissionId: (value: string | null) => void;
  currentSubmissionId: string | null;
  editingRecordingId: string | null;
  setIsUploadingMedia: (value: boolean) => void;
  setUploadProgress: Dispatch<SetStateAction<number>>;
  setErrors: Dispatch<SetStateAction<Record<string, string>>>;
  setNewUploadedUrl: (value: string | null) => void;
  useAiAnalysis: boolean;
  setNoLanguage: (value: boolean) => void;
  setLanguage: (value: string) => void;
  setCustomLanguage: (value: string) => void;
  setRecordingLocation: Dispatch<SetStateAction<string>>;
  setTranscription: (value: string) => void;
  setInstruments: Dispatch<SetStateAction<string[]>>;
  setInstrumentPredictions: Dispatch<SetStateAction<DetectedInstrument[]>>;
  setAiMetadataSuggestions: Dispatch<SetStateAction<MetadataSuggestion[]>>;
  setAiAnalysisLoading?: (value: boolean) => void;
  setAiAnalysisError?: (value: string | null) => void;
  setAiAnalysisSuccess?: (value: boolean) => void;
  setAiAnalysisEmpty?: (value: boolean) => void;
  setEthnicity: (value: string) => void;
  setCustomEthnicity: (value: string) => void;
  setVocalStyle: (value: string) => void;
  setMusicalScale: (value: string) => void;
  setEventType: (value: string) => void;
  setCustomEventType: (value: string) => void;
  setPerformanceType: (value: string) => void;
  applyPerformanceTypeFromAi?: (value: string) => void;
  maybeApplyInstrumentalFromDetectedInstruments?: (detected: DetectedInstrument[]) => void;
  region: string;
  setRegion?: (value: string) => void;
  setTitle: (value: string) => void;
  setComposer: (value: string) => void;
  setComposerUnknown: (value: boolean) => void;
  ethnicGroupsData: EthnicGroupItem[];
  ceremoniesData: NameItem[];
  provincesData: IdNameItem[];
  districtsData: DistrictLike[];
  communesData: CommuneLike[];
  vocalStylesData: VocalStyleItem[];
  musicalScalesData: IdNameItem[];
  instrumentsData: InstrumentItem[];
  REGIONS: string[];
  title: string;
  description: string;
  artist: string;
  artistUnknown: boolean;
  composer: string;
  composerUnknown: boolean;
  language: string;
  noLanguage: boolean;
  customLanguage: string;
  recordingDate: string;
  recordingLocation: string;
  performanceType: string;
  transcription: string;
  ethnicity: string;
  customEthnicity: string;
  eventType: string;
  customEventType: string;
  commune: string;
  district: string;
  province: string;
  vocalStyle: string;
  musicalScale: string;
  instruments: string[];
  audioInfo: MediaInfo | null;
  existingMediaInfo: MediaInfo | null;
  existingMediaSrc: string | null;
  newUploadedUrl: string | null;
  capturedGpsLat: number | null;
  capturedGpsLon: number | null;
  setSubmitStatus: (value: 'idle' | 'success' | 'error') => void;
  setSubmitMessage: (value: string) => void;
  setIsSubmitting: (value: boolean) => void;
  setExistingRecordingImageUrls: Dispatch<SetStateAction<string[]>>;
  setRecordingImages: Dispatch<SetStateAction<File[]>>;
  setRecordingImagePreviews: Dispatch<SetStateAction<string[]>>;
};

export function useUploadSubmission(options: UseUploadSubmissionOptions) {
  /** Prevents concurrent draft uploads (double-click before createdRecordingId is set → duplicate recordings). */
  const draftUploadInFlightRef = useRef(false);
  /** Prevents double submit (rapid clicks on Đóng góp / Lưu / dialog Gửi before React commits isSubmitting). */
  const submitInFlightRef = useRef(false);

  const handleUploadAndCreateDraft = useCallback(async () => {
    if (!options.file || options.createdRecordingId) return;
    if (draftUploadInFlightRef.current) return;
    draftUploadInFlightRef.current = true;

    try {
      options.setIsUploadingMedia(true);
    options.setUploadProgress(0);
    options.setErrors((prev) => {
      const next = { ...prev };
      delete next.file;
      return next;
    });

    const progressInterval = setInterval(() => {
      options.setUploadProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + (95 - prev) * 0.1 + 1;
      });
    }, 500);

    try {
      let publicUrl = '';
      let aiRes: NormalizedAiAnalysisPayload | null = null;
      let detectedInstruments: DetectedInstrument[] = [];
      let aiAnalyzeRawOk = false;

      if (options.useAiAnalysis) {
        options.setAiAnalysisLoading?.(true);
        options.setAiAnalysisError?.(null);
        options.setAiAnalysisSuccess?.(false);
        options.setAiAnalysisEmpty?.(false);
        try {
          const formData = new FormData();
          formData.append('audioFile', options.file);

          // Upload + single analyze-only (metadata + instruments share one Gemini call).
          const [uploadResult, aiResult] = await Promise.allSettled([
            uploadFileToSupabase(options.file),
            legacyPost('/AIAnalysis/analyze-only', formData, {
              timeout: 300000,
            }),
          ]);

          if (uploadResult.status === 'fulfilled') {
            publicUrl = uploadResult.value as string;
          } else {
            throw uploadResult.reason;
          }

          if (aiResult.status === 'fulfilled' && aiResult.value) {
            aiAnalyzeRawOk = true;
            aiRes = normalizeAiAnalyzeOnlyResponse(aiResult.value);
            debugLogAiAnalyzeOnly(aiResult.value, aiRes);
          } else {
            reportError(
              toReportableError(
                aiResult.status === 'rejected' ? aiResult.reason : 'No value',
                'AI analysis failed',
              ),
              undefined,
              { region: 'upload', stage: 'ai_analysis' },
            );
            uiToast.warning('upload.ai.partial_fail');
          }

          if (aiResult.status === 'rejected') {
            options.setAiAnalysisError?.(
              aiResult.reason instanceof Error ? aiResult.reason.message : String(aiResult.reason),
            );
            options.setAiAnalysisSuccess?.(false);
            options.setAiAnalysisEmpty?.(false);
          }
        } finally {
          options.setAiAnalysisLoading?.(false);
        }
      } else {
        publicUrl = await uploadFileToSupabase(options.file);
        options.setInstrumentPredictions([]);
        options.setAiMetadataSuggestions([]);
      }

      options.setUploadProgress(99);
      options.setNewUploadedUrl(publicUrl);

      let recordingIdForImages: string | null = options.isEditMode ? options.editingRecordingId : null;
      if (!options.isEditMode) {
        const uploaderId = resolveContributorUserId(options.currentUserId);
        const res = await recordingService.createSubmission({
          audioFileUrl: publicUrl,
          videoFileUrl: options.mediaType === 'video' ? publicUrl : undefined,
          uploadedById: uploaderId,
        });
        const recordingId = res?.data?.recordingId;
        const submissionId = res?.data?.submissionId;
        if (!recordingId) throw new Error('Không nhận được ID bản thu từ hệ thống.');
        options.setCreatedRecordingId(recordingId);
        recordingIdForImages = recordingId;
        if (submissionId) options.setCurrentSubmissionId(submissionId);
      } else {
        options.setCreatedRecordingId('EDIT_MODE_UPLOADED');
      }

      if (options.recordingImages.length > 0 && recordingIdForImages) {
        const imageResults = await Promise.allSettled(
          options.recordingImages.map(async (imageFile) =>
            recordingImageService.uploadImage(recordingIdForImages, imageFile),
          ),
        );
        const failedCount = imageResults.filter((result) => result.status === 'rejected').length;
        if (failedCount > 0) {
          uiToast.warning('Một số ảnh minh họa chưa tải lên được. Bạn có thể thử lại sau.');
        }
      }

      if (recordingIdForImages) {
        try {
          const urls = await fetchRecordingImageDisplayUrls(recordingIdForImages);
          options.setExistingRecordingImageUrls(urls);
        } catch {
          /* ignore refresh errors */
        }
      }
      options.setRecordingImages([]);
      options.setRecordingImagePreviews([]);

      let aiInstrumentNamesApplied: string[] = [];

      if (aiRes) {
        const meaningful = hasMeaningfulNormalizedAiData(aiRes);
        if (meaningful) {
          options.setAiAnalysisSuccess?.(true);
          options.setAiAnalysisEmpty?.(false);
          uiToast.success('upload.ai.success_detail');
        } else {
          options.setAiAnalysisSuccess?.(false);
          options.setAiAnalysisEmpty?.(true);
        }

        const applyResult = applyAiAnalyzeOnlyMetadata({
          ai: aiRes,
          title: options.title,
          composer: options.composer,
          composerUnknown: options.composerUnknown,
          recordingLocation: options.recordingLocation,
          language: options.language,
          customLanguage: options.customLanguage,
          noLanguage: options.noLanguage,
          ethnicity: options.ethnicity,
          customEthnicity: options.customEthnicity,
          vocalStyle: options.vocalStyle,
          musicalScale: options.musicalScale,
          eventType: options.eventType,
          customEventType: options.customEventType,
          instruments: options.instruments,
          performanceType: options.performanceType,
          region: options.region,
          setTitle: options.setTitle,
          setComposer: options.setComposer,
          setComposerUnknown: options.setComposerUnknown,
          setRecordingLocation: options.setRecordingLocation,
          setLanguage: options.setLanguage,
          setCustomLanguage: options.setCustomLanguage,
          setNoLanguage: options.setNoLanguage,
          setEthnicity: options.setEthnicity,
          setCustomEthnicity: options.setCustomEthnicity,
          setVocalStyle: options.setVocalStyle,
          setMusicalScale: options.setMusicalScale,
          setEventType: options.setEventType,
          setCustomEventType: options.setCustomEventType,
          setInstruments: options.setInstruments,
          setRegion: options.setRegion,
          applyPerformanceTypeFromAi: options.applyPerformanceTypeFromAi,
          maybeApplyInstrumentalFromDetectedInstruments:
            options.maybeApplyInstrumentalFromDetectedInstruments,
          ethnicGroupsData: options.ethnicGroupsData,
          ceremoniesData: options.ceremoniesData,
          REGIONS: options.REGIONS,
        });

        detectedInstruments = applyResult.detectedInstruments;
        aiInstrumentNamesApplied = applyResult.aiInstrumentNamesApplied;
      } else if (options.useAiAnalysis && aiAnalyzeRawOk) {
        options.setAiAnalysisSuccess?.(false);
        options.setAiAnalysisEmpty?.(true);
      }
      options.setInstrumentPredictions(detectedInstruments);
      options.maybeApplyInstrumentalFromDetectedInstruments?.(
        mergeInstrumentDetectionSignals(detectedInstruments, aiInstrumentNamesApplied),
      );

      // Build the read-only "Suggested Metadata" panel from two complementary sources:
      //   1. AI-direct fields from Gemini's analyze-only response (ethnicGroup, vocalStyle,
      //      musicalScale, ceremony, regionSuggestion). These outrank fallback rows.
      //   2. Instrument-name → DB join + INSTRUMENT_METADATA_FALLBACK heuristics.
      // Both lists are deduped by (field, canonical value); rankCandidates surfaces
      // AI-direct values to the "Primary" slot regardless of nominal confidence.
      if (instrumentDetectionFlags.confidenceEnabled) {
        const aiDirect = aiRes
          ? buildAiDirectSuggestions(aiRes, options.REGIONS)
          : ([] as MetadataSuggestion[]);
        const fromInstruments =
          detectedInstruments.length > 0
            ? mapInstrumentsToMetadataSuggestions({
                detected: detectedInstruments,
                instrumentsData: options.instrumentsData,
                ethnicGroupsData: options.ethnicGroupsData,
                vocalStylesData: options.vocalStylesData,
                availableRegions: options.REGIONS,
              })
            : ([] as MetadataSuggestion[]);
        const merged = dedupeAndSortMetadataSuggestions([...aiDirect, ...fromInstruments]);
        options.setAiMetadataSuggestions(merged);
      } else {
        options.setAiMetadataSuggestions([]);
      }
      options.setUploadProgress(100);
    } catch (error: unknown) {
      reportError(toReportableError(error, 'Upload media or create recording failed'), undefined, {
        region: 'upload',
        stage: 'upload_media',
      });
      const ownershipMissing =
        error instanceof Error && error.message === MISSING_CONTRIBUTOR_USER_ID;
      options.setErrors((prev) => ({
        ...prev,
        file: ownershipMissing
          ? 'Không xác định người đăng tải. Vui lòng đăng nhập lại và thử lần nữa.'
          : 'Có lỗi khi tải lên. Vui lòng thử lại sau.',
      }));
    } finally {
      clearInterval(progressInterval);
      options.setIsUploadingMedia(false);
    }
    } finally {
      draftUploadInFlightRef.current = false;
    }
  }, [options]);

  const handleConfirmSubmit = useCallback(
    async (isFinal: boolean) => {
      if (submitInFlightRef.current) return;
      submitInFlightRef.current = true;

      try {
      options.setIsSubmitting(true);
      options.setSubmitStatus('idle');
      options.setSubmitMessage('');

      const targetId = options.isEditMode ? options.editingRecordingId : options.createdRecordingId;
      if (!targetId) {
        options.setSubmitStatus('error');
        options.setSubmitMessage('Không tìm thấy ID bản thu. Vui lòng thử tải lại file ở Bước 1.');
        options.setIsSubmitting(false);
        return;
      }

      let uploadedByIdStr: string;
      try {
        uploadedByIdStr = resolveContributorUserId(options.currentUserId);
      } catch {
        options.setSubmitStatus('error');
        options.setSubmitMessage(
          'Không xác định được tài khoản đóng góp. Vui lòng đăng nhập lại.',
        );
        options.setIsSubmitting(false);
        reportError(new Error(MISSING_CONTRIBUTOR_USER_ID), undefined, {
          region: 'upload',
          stage: 'submit',
          reason: 'missing_current_user_id',
        });
        return;
      }

      try {
        const finalEthnicity =
          options.ethnicity === 'Khác' ? options.customEthnicity : options.ethnicity;
        const ethnicGroupId = options.ethnicGroupsData.find((e) => e.name === finalEthnicity)?.id;
        const finalEventType =
          options.eventType === 'Khác' ? options.customEventType : options.eventType;
        const ceremonyId = options.ceremoniesData.find((c) => c.name === finalEventType)?.id;
        const provinceId = options.provincesData.find((p) => p.name === options.province)?.id;
        const districtId = options.districtsData.find(
          (d) => d.name === options.district && d.provinceId === provinceId,
        )?.id;
        const selectedCommuneId = options.communesData.find(
          (c) => c.name === options.commune && c.districtId === districtId,
        )?.id;
        const selectedVocalStyleId = options.vocalStylesData.find(
          (v) => v.name === options.vocalStyle,
        )?.id;
        const selectedMusicalScaleId = options.musicalScalesData.find(
          (m) => m.name === options.musicalScale,
        )?.id;
        const selectedInstrumentIds = options.instruments
          .map((name) => options.instrumentsData.find((i: InstrumentItem) => i.name === name)?.id)
          .filter((id): id is string => !!id);

        const durationSeconds =
          options.audioInfo?.duration || options.existingMediaInfo?.duration || 0;
        const audioFormat =
          options.audioInfo?.type || options.existingMediaInfo?.type || options.file?.type || '';
        const fileSizeBytes =
          options.audioInfo?.size || options.existingMediaInfo?.size || options.file?.size || 0;
        const resolvedMedia = (options.newUploadedUrl || options.existingMediaSrc || '').trim();

        const payload: RecordingUploadDto = {
          title: options.title || undefined,
          description: options.description || undefined,
          audioFileUrl: options.mediaType === 'audio' ? resolvedMedia || undefined : undefined,
          videoFileUrl: options.mediaType === 'video' ? resolvedMedia || undefined : undefined,
          audioFormat: audioFormat || undefined,
          durationSeconds,
          fileSizeBytes,
          uploadedById: uploadedByIdStr,
          communeId: selectedCommuneId || undefined,
          ethnicGroupId: ethnicGroupId || undefined,
          ceremonyId: ceremonyId || undefined,
          vocalStyleId: selectedVocalStyleId || undefined,
          musicalScaleId: selectedMusicalScaleId || undefined,
          performanceContext: options.performanceType || undefined,
          lyricsOriginal: options.transcription || undefined,
          lyricsVietnamese: undefined,
          performerName: options.artistUnknown ? 'Không rõ nghệ sĩ' : options.artist || undefined,
          recordingDate: options.recordingDate
            ? new Date(options.recordingDate).toISOString()
            : new Date().toISOString(),
          gpsLatitude: options.capturedGpsLat ?? null,
          gpsLongitude: options.capturedGpsLon ?? null,
          keySignature: undefined,
          instrumentIds: selectedInstrumentIds,
          composer: options.composerUnknown
            ? 'Dân gian/Không rõ'
            : options.composer || undefined,
          language: options.noLanguage
            ? 'Không có ngôn ngữ'
            : options.language === 'Khác'
              ? options.customLanguage
              : options.language || undefined,
          recordingLocation: options.recordingLocation || undefined,
          ...(isFinal && !options.isEditMode ? { status: 1 as const } : {}),
        };

        await recordingService.updateRecording(targetId, payload);

        // Upload images if any new ones are selected
        if (options.recordingImages.length > 0 && targetId) {
          const imageResults = await Promise.allSettled(
            options.recordingImages.map(async (imageFile) =>
              recordingImageService.uploadImage(targetId, imageFile),
            ),
          );
          const failedCount = imageResults.filter((result) => result.status === 'rejected').length;
          if (failedCount > 0) {
            uiToast.warning('Một số ảnh minh họa chưa tải lên được. Bạn có thể thử lại sau.');
          }

          // Refresh existing image URLs
          try {
            const urls = await fetchRecordingImageDisplayUrls(targetId);
            options.setExistingRecordingImageUrls(urls);
          } catch {
            /* ignore refresh errors */
          }
          options.setRecordingImages([]);
          options.setRecordingImagePreviews([]);
        }

        const createSubmissionVersionBestEffort = async () => {
          const isContributorEdit =
            options.isEditMode &&
            options.currentUserRole === UserRole.CONTRIBUTOR &&
            Boolean(options.currentSubmissionId);
          if (!isContributorEdit) return;
          const changes = {
            note: isFinal
              ? 'Contributor submitted edited submission'
              : 'Contributor saved edited submission draft',
            fields: [
              { field: 'title', after: options.title || null },
              { field: 'description', after: options.description || null },
              {
                field: 'performerName',
                after: options.artistUnknown ? 'Không rõ nghệ sĩ' : options.artist || null,
              },
              {
                field: 'composer',
                after: options.composerUnknown
                  ? 'Dân gian/Không rõ'
                  : options.composer || null,
              },
              {
                field: 'language',
                after: options.noLanguage
                  ? 'Không có ngôn ngữ'
                  : options.language === 'Khác'
                    ? options.customLanguage || null
                    : options.language || null,
              },
              { field: 'recordingLocation', after: options.recordingLocation || null },
              { field: 'updatedAt', after: new Date().toISOString() },
            ],
          };
          try {
            await submissionVersionApi.create({
              submissionId: options.currentSubmissionId!,
              changesJson: JSON.stringify(changes),
            });
          } catch (err) {
            reportError(toReportableError(err, 'Submission version create failed'), undefined, {
              region: 'upload',
              stage: 'submission_version',
            });
          }
        };

        if (isFinal) {
          const subIdToConfirm = options.currentSubmissionId;
          if (!subIdToConfirm) {
            throw new Error(
              'Không tìm thấy mã đóng góp để xác nhận. Vui lòng thử lại từ đầu hoặc mở lại từ trang Đóng góp.',
            );
          }
          const confirmRes = await submissionService.confirmSubmission(subIdToConfirm);
          if (!confirmRes || !confirmRes.isSuccess) {
            throw new Error(
              confirmRes?.message || 'Không thể xác nhận bản đóng góp. Vui lòng thử lại.',
            );
          }
          // Backend auto-notification: NewRecordingPending → tránh tạo thông báo kép ở FE.
          // NOTE: nhánh edit-mode có thể cần notification riêng (submission_updated) nếu backend KHÔNG gửi.
          // Hiện giữ behavior tối giản để tránh duplicate; UI vẫn báo submit thành công như trước.
          await createSubmissionVersionBestEffort();
          options.setSubmitStatus('success');
          options.setSubmitMessage(
            options.isEditMode
              ? 'Cập nhật bản thu thành công!'
              : 'Tải lên thành công! Bản thu của bạn đã được gửi để duyệt.',
          );
        } else {
          await createSubmissionVersionBestEffort();
          uiToast.success(
            options.isEditMode ? 'upload.save.success_edit' : 'upload.save.success_draft',
          );
        }
      } catch (error: unknown) {
        reportError(toReportableError(error, 'Save submission failed'), undefined, {
          region: 'upload',
          stage: 'submit',
        });
        let errorDetail = 'Lỗi không xác định khi lưu dữ liệu. Vui lòng thử lại.';
        const serverData = (error as { response?: { data?: unknown } }).response?.data;
        if (serverData !== undefined) {
          const data = serverData;
          if (typeof data === 'string') {
            errorDetail = `Lỗi từ server: ${data}`;
          } else if (typeof data === 'object' && data !== null) {
            const rec = data as Record<string, unknown>;
            const rawErrors = rec.errors;
            if (Array.isArray(rawErrors)) {
              const msgs = rawErrors.map((e: unknown) =>
                typeof e === 'string' ? e : JSON.stringify(e),
              );
              const msg = typeof rec.message === 'string' ? rec.message : '';
              errorDetail = `Lỗi hệ thống: ${msg} - ${msgs.join(' | ')}`;
            } else if (rawErrors && typeof rawErrors === 'object') {
              const validationErrors = Object.entries(rawErrors as Record<string, unknown>)
                .map(([field, msgs]) =>
                  Array.isArray(msgs)
                    ? `${field}: ${msgs.join(', ')}`
                    : `${field}: ${JSON.stringify(msgs)}`,
                )
                .join(' | ');
              errorDetail = `Lỗi dữ liệu: ${validationErrors}`;
            } else if (typeof rec.message === 'string') {
              errorDetail = rec.message;
            } else {
              errorDetail = `Lỗi từ server: ${JSON.stringify(data)}`;
            }
          }
        } else if (error instanceof Error) {
          errorDetail = `Lỗi: ${error.message}. Vui lòng thử lại.`;
        }
        options.setSubmitStatus('error');
        options.setSubmitMessage(errorDetail);
      } finally {
        options.setIsSubmitting(false);
      }
      } finally {
        submitInFlightRef.current = false;
      }
    },
    [options],
  );

  return { handleUploadAndCreateDraft, handleConfirmSubmit };
}
