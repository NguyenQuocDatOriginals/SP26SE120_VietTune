import { isFolkComposerLabel } from '@/features/upload/composerUtils';
import { matchLanguageToDropdown } from '@/features/upload/languageUtils';
import { resolveUploadRegionLabel } from '@/features/upload/regionUtils';
import type { NormalizedAiAnalysisPayload } from '@/features/upload/normalizeAiAnalysisResponse';
import {
  hasValidDetectedInstruments,
  mergeInstrumentDetectionSignals,
  PERFORMANCE_TYPE,
} from '@/features/upload/performanceTypeUtils';
import { isUnknownValue } from '@/features/upload/unknownValueUtils';
import type { DetectedInstrument } from '@/types/instrumentDetection';

type NameItem = { name: string };

export type ApplyAiAnalyzeOnlyParams = {
  ai: NormalizedAiAnalysisPayload;
  title: string;
  composer: string;
  composerUnknown: boolean;
  recordingLocation: string;
  language: string;
  customLanguage: string;
  noLanguage: boolean;
  ethnicity: string;
  customEthnicity: string;
  vocalStyle: string;
  musicalScale: string;
  eventType: string;
  customEventType: string;
  instruments: string[];
  performanceType: string;
  setTitle: (value: string) => void;
  setComposer: (value: string) => void;
  setComposerUnknown: (value: boolean) => void;
  setRecordingLocation: (value: string) => void;
  setLanguage: (value: string) => void;
  setCustomLanguage: (value: string) => void;
  setNoLanguage: (value: boolean) => void;
  setEthnicity: (value: string) => void;
  setCustomEthnicity: (value: string) => void;
  setVocalStyle: (value: string) => void;
  setMusicalScale: (value: string) => void;
  setEventType: (value: string) => void;
  setCustomEventType: (value: string) => void;
  setInstruments: (value: string[]) => void;
  region: string;
  setRegion?: (value: string) => void;
  applyPerformanceTypeFromAi?: (value: string) => void;
  maybeApplyInstrumentalFromDetectedInstruments?: (detected: DetectedInstrument[]) => void;
  ethnicGroupsData: NameItem[];
  ceremoniesData: NameItem[];
  REGIONS: string[];
};

function canApplyLanguageFields(p: ApplyAiAnalyzeOnlyParams): boolean {
  return !p.language.trim() && !p.customLanguage.trim() && !p.noLanguage;
}

/** Maps analyze-only language to form state (does not overwrite user-entered language). */
export function applyAiLanguageToForm(p: ApplyAiAnalyzeOnlyParams): void {
  if (!canApplyLanguageFields(p)) return;
  if (p.ai.language === undefined) return;

  if (p.ai.language === null) {
    p.setNoLanguage(true);
    p.setLanguage('');
    p.setCustomLanguage('');
    return;
  }

  const langLower = p.ai.language.toLowerCase();
  if (
    langLower === 'instrumental' ||
    langLower === 'nhạc cụ' ||
    langLower === 'không có ngôn ngữ' ||
    langLower === 'none' ||
    langLower === 'không'
  ) {
    p.setNoLanguage(true);
    p.setLanguage('');
    p.setCustomLanguage('');
    return;
  }

  const matched = matchLanguageToDropdown(p.ai.language);
  if (matched) {
    p.setLanguage(matched);
    p.setCustomLanguage('');
  } else {
    p.setLanguage('Khác');
    p.setCustomLanguage(p.ai.language);
  }
  p.setNoLanguage(false);
}

export type ApplyAiAnalyzeOnlyResult = {
  detectedInstruments: DetectedInstrument[];
  aiInstrumentNamesApplied: string[];
};

/**
 * Applies normalized analyze-only metadata when target fields are still empty.
 * Performance type: only via applyPerformanceTypeFromAi / maybeApplyInstrumental (respects manual ref).
 */
export function applyAiAnalyzeOnlyMetadata(p: ApplyAiAnalyzeOnlyParams): ApplyAiAnalyzeOnlyResult {
  const detectedInstruments: DetectedInstrument[] = p.ai.instruments.map((item) => ({
    name: item.name,
    confidence:
      typeof item.confidence === 'number' && Number.isFinite(item.confidence)
        ? item.confidence
        : null,
    ...(item.id ? { id: item.id } : {}),
  }));

  let aiInstrumentNamesApplied: string[] = [];

  if (p.ai.title && !p.title.trim()) p.setTitle(p.ai.title);
  if (p.ai.composer && !p.composer.trim() && !p.composerUnknown) {
    if (isFolkComposerLabel(p.ai.composer)) {
      p.setComposerUnknown(true);
      p.setComposer('');
    } else {
      p.setComposer(p.ai.composer);
    }
  }
  if (p.ai.recordingLocation && !p.recordingLocation.trim()) {
    p.setRecordingLocation(p.ai.recordingLocation);
  }

  applyAiLanguageToForm(p);

  const instrumentNames = p.ai.instruments.map((i) => i.name).filter((n) => !isUnknownValue(n));
  if (instrumentNames.length > 0 && p.instruments.length === 0) {
    aiInstrumentNamesApplied = instrumentNames;
    p.setInstruments(instrumentNames);
  }

  if (p.ai.ethnicGroup?.name && !p.ethnicity.trim()) {
    const name = p.ai.ethnicGroup.name;
    if (p.ethnicGroupsData.find((e) => e.name === name)) {
      p.setEthnicity(name);
    } else {
      p.setEthnicity('Khác');
      p.setCustomEthnicity(name);
    }
  }

  if (p.ai.vocalStyle?.name && !p.vocalStyle.trim()) p.setVocalStyle(p.ai.vocalStyle.name);
  if (p.ai.musicalScale?.name && !p.musicalScale.trim()) p.setMusicalScale(p.ai.musicalScale.name);

  if (p.ai.ceremony?.name && !p.eventType.trim()) {
    const name = p.ai.ceremony.name;
    if (p.ceremoniesData.find((c) => c.name === name)) {
      p.setEventType(name);
    } else {
      p.setEventType('Khác');
      p.setCustomEventType(name);
    }
  }

  const regionRaw = p.ai.regionSuggestion?.region;
  if (regionRaw && !p.region.trim() && p.setRegion) {
    p.setRegion(resolveUploadRegionLabel(regionRaw, p.REGIONS));
  }

  if (p.applyPerformanceTypeFromAi) {
    const ptFromClassification = p.ai.classification?.performanceType;
    if (ptFromClassification) {
      p.applyPerformanceTypeFromAi(ptFromClassification);
    }

    const langLower = p.ai.language?.toLowerCase() ?? '';
    const isInstrumentalLang = langLower === 'instrumental' || langLower === 'nhạc cụ';
    if (isInstrumentalLang) {
      p.applyPerformanceTypeFromAi(PERFORMANCE_TYPE.INSTRUMENTAL);
    } else if (p.ai.performanceContext) {
      p.applyPerformanceTypeFromAi(p.ai.performanceContext);
    }
  }

  const mergedSignals = mergeInstrumentDetectionSignals(detectedInstruments, aiInstrumentNamesApplied);
  if (hasValidDetectedInstruments(mergedSignals)) {
    p.maybeApplyInstrumentalFromDetectedInstruments?.(mergedSignals);
  }

  return { detectedInstruments, aiInstrumentNamesApplied };
}
