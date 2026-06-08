import { useCallback, useEffect, useRef, useState } from 'react';

import { useUploadAiAdvisory } from '@/features/upload/hooks/useUploadAiAdvisory';
import { reconcileLanguageFields } from '@/features/upload/languageUtils';
import {
  hasValidDetectedInstruments,
  normalizePerformanceTypeKey,
  PERFORMANCE_TYPE,
} from '@/features/upload/performanceTypeUtils';
import type { DetectedInstrument } from '@/types/instrumentDetection';

/**
 * Contributor metadata fields, optional “gợi ý metadata” button, and submit/error UI for UploadMusic.
 * Media file state stays in `useMediaUpload`.
 * Upload-time Gemini advisory (instrument bars + suggestion list) lives in `useUploadAiAdvisory` and is
 * exposed as `aiAdvisory` plus backward-compatible top-level aliases (`instrumentPredictions`, …).
 */
export function useUploadForm() {
  const aiAdvisory = useUploadAiAdvisory();

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [artistUnknown, setArtistUnknown] = useState(false);
  const [composer, setComposer] = useState('');
  const [composerUnknown, setComposerUnknown] = useState(false);
  const [language, setLanguage] = useState('');
  const [noLanguage, setNoLanguage] = useState(false);
  const [customLanguage, setCustomLanguage] = useState('');
  const [recordingDate, setRecordingDate] = useState('');
  const [dateEstimated, setDateEstimated] = useState(false);
  const [dateNote, setDateNote] = useState('');
  const [recordingLocation, setRecordingLocation] = useState('');

  const [ethnicity, setEthnicity] = useState('');
  const [customEthnicity, setCustomEthnicity] = useState('');

  const [region, setRegion] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [commune, setCommune] = useState('');

  const [initialCommuneId, setInitialCommuneId] = useState<string | null>(null);
  const [initialEthnicGroupId, setInitialEthnicGroupId] = useState<string | null>(null);
  const [initialCeremonyId, setInitialCeremonyId] = useState<string | null>(null);
  const [initialVocalStyleId, setInitialVocalStyleId] = useState<string | null>(null);
  const [initialMusicalScaleId, setInitialMusicalScaleId] = useState<string | null>(null);
  const [initialInstrumentIds, setInitialInstrumentIds] = useState<string[]>([]);

  const [vocalStyle, setVocalStyle] = useState('');
  const [musicalScale, setMusicalScale] = useState('');

  const [eventType, setEventType] = useState('');
  const [customEventType, setCustomEventType] = useState('');
  const [performanceType, setPerformanceType] = useState('');
  const performanceTypeManuallySetRef = useRef(false);
  const [instruments, setInstruments] = useState<string[]>([]);

  const setPerformanceTypeFromUser = useCallback((value: string) => {
    performanceTypeManuallySetRef.current = true;
    setPerformanceType(value);
  }, []);

  const applyPerformanceTypeFromAi = useCallback((value: string) => {
    if (performanceTypeManuallySetRef.current) return;
    const key = normalizePerformanceTypeKey(value);
    if (key) setPerformanceType(key);
  }, []);

  const maybeApplyInstrumentalFromDetectedInstruments = useCallback(
    (detected: DetectedInstrument[]) => {
      if (performanceTypeManuallySetRef.current) return;
      if (!hasValidDetectedInstruments(detected)) return;
      setPerformanceType(PERFORMANCE_TYPE.INSTRUMENTAL);
    },
    [],
  );

  const handleLanguageSelect = useCallback(
    (val: string) => {
      if (noLanguage) return;
      setLanguage(val);
      if (val !== 'Khác') setCustomLanguage('');
    },
    [noLanguage],
  );

  const handleNoLanguageChange = useCallback((checked: boolean) => {
    setNoLanguage(checked);
    if (checked) {
      setLanguage('');
      setCustomLanguage('');
    }
  }, []);

  useEffect(() => {
    const next = reconcileLanguageFields(language, customLanguage, noLanguage);
    if (next.noLanguage && !noLanguage) {
      setNoLanguage(true);
    }
    if (next.language !== language || next.customLanguage !== customLanguage) {
      setLanguage(next.language);
      setCustomLanguage(next.customLanguage);
    }
  }, [language, customLanguage, noLanguage]);

  const [description, setDescription] = useState('');
  const [fieldNotes, setFieldNotes] = useState('');
  const [transcription, setTranscription] = useState('');
  const [lyricsFile, setLyricsFile] = useState<File | null>(null);
  const [recordingImages, setRecordingImages] = useState<File[]>([]);
  const [recordingImagePreviews, setRecordingImagePreviews] = useState<string[]>([]);
  const [existingRecordingImageUrls, setExistingRecordingImageUrls] = useState<string[]>([]);

  const handleRecordingImagesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []).filter((file) => file.type.startsWith('image/'));
    if (picked.length === 0) return;

    void (async () => {
      const previewPromises = picked.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve((ev.target?.result as string) || '');
            reader.onerror = () => resolve('');
            reader.readAsDataURL(file);
          }),
      );
      const previews = (await Promise.all(previewPromises)).filter(Boolean);
      setRecordingImages((prev) => [...prev, ...picked]);
      setRecordingImagePreviews((prev) => [...prev, ...previews]);
    })();
  }, []);

  const removeRecordingImage = useCallback((index: number) => {
    setRecordingImages((prev) => prev.filter((_, i) => i !== index));
    setRecordingImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const [collector, setCollector] = useState('');
  const [copyright, setCopyright] = useState('');
  const [archiveOrg, setArchiveOrg] = useState('');
  const [catalogId, setCatalogId] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [capturedGpsLat, setCapturedGpsLat] = useState<number | null>(null);
  const [capturedGpsLon, setCapturedGpsLon] = useState<number | null>(null);
  const [capturedGpsAccuracy, setCapturedGpsAccuracy] = useState<number | null>(null);
  const requiresInstruments =
    performanceType === 'instrumental' || performanceType === 'vocal_accompaniment';
  const allowsLyrics = performanceType === 'acappella' || performanceType === 'vocal_accompaniment';

  return {
    title,
    setTitle,
    artist,
    setArtist,
    artistUnknown,
    setArtistUnknown,
    composer,
    setComposer,
    composerUnknown,
    setComposerUnknown,
    language,
    setLanguage,
    handleLanguageSelect,
    noLanguage,
    setNoLanguage,
    handleNoLanguageChange,
    customLanguage,
    setCustomLanguage,
    recordingDate,
    setRecordingDate,
    dateEstimated,
    setDateEstimated,
    dateNote,
    setDateNote,
    recordingLocation,
    setRecordingLocation,
    ethnicity,
    setEthnicity,
    customEthnicity,
    setCustomEthnicity,
    region,
    setRegion,
    province,
    setProvince,
    district,
    setDistrict,
    commune,
    setCommune,
    initialCommuneId,
    setInitialCommuneId,
    initialEthnicGroupId,
    setInitialEthnicGroupId,
    initialCeremonyId,
    setInitialCeremonyId,
    initialVocalStyleId,
    setInitialVocalStyleId,
    initialMusicalScaleId,
    setInitialMusicalScaleId,
    initialInstrumentIds,
    setInitialInstrumentIds,
    vocalStyle,
    setVocalStyle,
    musicalScale,
    setMusicalScale,
    eventType,
    setEventType,
    customEventType,
    setCustomEventType,
    performanceType,
    setPerformanceType,
    setPerformanceTypeFromUser,
    applyPerformanceTypeFromAi,
    maybeApplyInstrumentalFromDetectedInstruments,
    performanceTypeManuallySetRef,
    instruments,
    setInstruments,
    /** Advisory AI state (upload analyze-*); same refs as top-level aliases below. */
    aiAdvisory,
    instrumentPredictions: aiAdvisory.instrumentPredictions,
    setInstrumentPredictions: aiAdvisory.setInstrumentPredictions,
    aiMetadataSuggestions: aiAdvisory.aiMetadataSuggestions,
    setAiMetadataSuggestions: aiAdvisory.setAiMetadataSuggestions,
    aiAnalysisLoading: aiAdvisory.aiAnalysisLoading,
    setAiAnalysisLoading: aiAdvisory.setAiAnalysisLoading,
    aiAnalysisError: aiAdvisory.aiAnalysisError,
    setAiAnalysisError: aiAdvisory.setAiAnalysisError,
    aiAnalysisSuccess: aiAdvisory.aiAnalysisSuccess,
    setAiAnalysisSuccess: aiAdvisory.setAiAnalysisSuccess,
    aiAnalysisEmpty: aiAdvisory.aiAnalysisEmpty,
    setAiAnalysisEmpty: aiAdvisory.setAiAnalysisEmpty,
    description,
    setDescription,
    fieldNotes,
    setFieldNotes,
    transcription,
    setTranscription,
    lyricsFile,
    setLyricsFile,
    recordingImages,
    setRecordingImages,
    recordingImagePreviews,
    setRecordingImagePreviews,
    existingRecordingImageUrls,
    setExistingRecordingImageUrls,
    handleRecordingImagesChange,
    removeRecordingImage,
    collector,
    setCollector,
    copyright,
    setCopyright,
    archiveOrg,
    setArchiveOrg,
    catalogId,
    setCatalogId,
    errors,
    setErrors,
    submitStatus,
    setSubmitStatus,
    submitMessage,
    setSubmitMessage,
    isSubmitting,
    setIsSubmitting,
    capturedGpsLat,
    setCapturedGpsLat,
    capturedGpsLon,
    setCapturedGpsLon,
    capturedGpsAccuracy,
    setCapturedGpsAccuracy,
    requiresInstruments,
    allowsLyrics,
  };
}
