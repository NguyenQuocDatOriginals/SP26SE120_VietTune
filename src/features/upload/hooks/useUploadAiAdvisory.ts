import { useState } from 'react';

import type { DetectedInstrument, MetadataSuggestion } from '@/types/instrumentDetection';

/**
 * Advisory-only state from upload-time AI (Gemini analyze-*).
 * Contributor form fields live in `useUploadForm`; this hook must not be treated as form metadata.
 */
export function useUploadAiAdvisory() {
  const [instrumentPredictions, setInstrumentPredictions] = useState<DetectedInstrument[]>([]);
  const [aiMetadataSuggestions, setAiMetadataSuggestions] = useState<MetadataSuggestion[]>([]);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [aiAnalysisError, setAiAnalysisError] = useState<string | null>(null);
  const [aiAnalysisSuccess, setAiAnalysisSuccess] = useState(false);
  /** HTTP 200 but no usable metadata/instruments after normalization (all unknown/empty). */
  const [aiAnalysisEmpty, setAiAnalysisEmpty] = useState(false);

  return {
    instrumentPredictions,
    setInstrumentPredictions,
    aiMetadataSuggestions,
    setAiMetadataSuggestions,
    aiAnalysisLoading,
    setAiAnalysisLoading,
    aiAnalysisError,
    setAiAnalysisError,
    aiAnalysisSuccess,
    setAiAnalysisSuccess,
    aiAnalysisEmpty,
    setAiAnalysisEmpty,
  };
}
