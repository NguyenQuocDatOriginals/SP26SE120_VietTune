import { ArrowRight } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import CompareContextBar from '@/components/researcher/compare/CompareContextBar';
import CompareResultStep from '@/components/researcher/compare/CompareResultStep';
import CompareSelectStep from '@/components/researcher/compare/CompareSelectStep';
import CompareStepper from '@/components/researcher/compare/CompareStepper';
import ResearcherFilterBar from '@/components/researcher/ResearcherFilterBar';
import type { CompareWizardStep, SearchFiltersState } from '@/features/researcher/researcherPortalTypes';
import {
  buildComparisonFacets,
  getBaseSongTitle,
} from '@/features/researcher/researcherRecordingUtils';
import type {
  CeremonyItem,
  CommuneItem,
  EthnicGroupItem,
  InstrumentItem,
} from '@/services/referenceDataService';
import { Recording } from '@/types';
import { isYouTubeUrl } from '@/utils/youtube';

export interface ResearcherPortalCompareTabProps {
  approvedRecordings: Recording[];
  compareLeftId: string;
  compareRightId: string;
  setCompareLeftId: React.Dispatch<React.SetStateAction<string>>;
  setCompareRightId: React.Dispatch<React.SetStateAction<string>>;
  filters: SearchFiltersState;
  setFilters: React.Dispatch<React.SetStateAction<SearchFiltersState>>;
  activeFilterCount: number;
  searchLoading: boolean;
  ethnicRefData: EthnicGroupItem[];
  instrumentRefData: InstrumentItem[];
  ceremonyRefData: CeremonyItem[];
  communeRefData: CommuneItem[];
}

function isLikelyVideoSource(src: string): boolean {
  return (
    src.length > 0 &&
    (isYouTubeUrl(src) ||
      Boolean(src.match(/\.(mp4|mov|avi|webm|mkv|mpeg|mpg|wmv|3gp|flv)$/i)) ||
      src.startsWith('data:video/'))
  );
}

function asObject(input: unknown): Record<string, unknown> | null {
  return input && typeof input === 'object' && !Array.isArray(input)
    ? (input as Record<string, unknown>)
    : null;
}

function readExtraString(rec: Recording | undefined, keys: string[]): string {
  const row = asObject(rec);
  if (!row) return '';
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function readObjectString(obj: Record<string, unknown> | null, keys: string[]): string {
  if (!obj) return '';
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function normalizeBaseSongKey(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\((.*?)\)|\[(.*?)\]/g, ' ')
    .replace(/\b(version|ver|live|cover|remix|ban|bản)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function resolvePlayableSource(rec: Recording | undefined): string {
  if (!rec) return '';
  const metadata = asObject(rec.metadata);
  const candidates = [
    rec.audioUrl,
    readExtraString(rec, ['audioFileUrl', 'audioData', 'mediaUrl', 'url']),
    readObjectString(metadata, ['audioUrl', 'audioFileUrl', 'sourceUrl']),
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim();
  }
  return '';
}

export default function ResearcherPortalCompareTab({
  approvedRecordings,
  compareLeftId,
  compareRightId,
  setCompareLeftId,
  setCompareRightId,
  filters,
  setFilters,
  activeFilterCount,
  searchLoading,
  ethnicRefData,
  instrumentRefData,
  ceremonyRefData,
  communeRefData,
}: ResearcherPortalCompareTabProps) {
  const [step, setStep] = useState<CompareWizardStep>(1);
  const [showSpectrogram, setShowSpectrogram] = useState(true);

  const eventTypes = useMemo(() => ceremonyRefData.map((c) => c.name), [ceremonyRefData]);

  const leftRecording = useMemo(() => {
    return approvedRecordings.find((r) => r.id === compareLeftId);
  }, [approvedRecordings, compareLeftId]);

  const rightRecording = useMemo(() => {
    return approvedRecordings.find((r) => r.id === compareRightId);
  }, [approvedRecordings, compareRightId]);

  const leftMediaSrc = resolvePlayableSource(leftRecording);
  const rightMediaSrc = resolvePlayableSource(rightRecording);
  const compareHasVideoMedia =
    isLikelyVideoSource(leftMediaSrc) || isLikelyVideoSource(rightMediaSrc);

  const facets = useMemo(
    () => buildComparisonFacets(leftRecording, rightRecording, eventTypes),
    [leftRecording, rightRecording, eventTypes],
  );

  const handleStepClick = (target: CompareWizardStep) => {
    if (target < step) setStep(target);
  };

  const handleContinueFromFilter = () => {
    setStep(2);
  };

  const handleCompare = () => {
    if (compareLeftId && compareRightId && compareLeftId !== compareRightId) {
      setStep(3);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="rounded-2xl border border-secondary-200/50 bg-gradient-to-br from-surface-panel via-cream-50/80 to-secondary-50/50 shadow-lg backdrop-blur-sm p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-primary-800 mb-2">So sánh phân tích</h2>
        <p className="text-sm text-neutral-600 mb-4">
          Lọc bản thu liên quan, chọn 2 bản để so sánh metadata, spectrogram và phiên âm.
        </p>

        <CompareStepper currentStep={step} onStepClick={handleStepClick} />

        {step === 1 && (
          <div className="space-y-6">
            <ResearcherFilterBar
              filters={filters}
              setFilters={setFilters}
              activeFilterCount={activeFilterCount}
              ethnicRefData={ethnicRefData}
              instrumentRefData={instrumentRefData}
              ceremonyRefData={ceremonyRefData}
              communeRefData={communeRefData}
            />
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary-200/60 bg-white/80 p-4">
              <p className="text-sm text-neutral-700">
                {searchLoading
                  ? 'Đang tải kết quả...'
                  : `Tìm thấy ${approvedRecordings.length} bản thu khớp bộ lọc.`}
              </p>
              <button
                type="button"
                onClick={handleContinueFromFilter}
                disabled={searchLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Tiếp tục
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <>
            <CompareContextBar
              step={2}
              filters={filters}
              activeFilterCount={activeFilterCount}
              resultCount={approvedRecordings.length}
              ethnicRefData={ethnicRefData}
              instrumentRefData={instrumentRefData}
              ceremonyRefData={ceremonyRefData}
              communeRefData={communeRefData}
              compareLeftId={compareLeftId}
              compareRightId={compareRightId}
              setCompareLeftId={setCompareLeftId}
              setCompareRightId={setCompareRightId}
              approvedRecordings={approvedRecordings}
              onEditFilters={() => setStep(1)}
            />
            <CompareSelectStep
              searchLoading={searchLoading}
              approvedRecordings={approvedRecordings}
              compareLeftId={compareLeftId}
              compareRightId={compareRightId}
              setCompareLeftId={setCompareLeftId}
              setCompareRightId={setCompareRightId}
              normalizeBaseSongKey={normalizeBaseSongKey}
              getBaseSongTitle={getBaseSongTitle}
              onCompare={handleCompare}
            />
          </>
        )}

        {step === 3 && (
          <>
            <CompareContextBar
              step={3}
              filters={filters}
              activeFilterCount={activeFilterCount}
              resultCount={approvedRecordings.length}
              ethnicRefData={ethnicRefData}
              instrumentRefData={instrumentRefData}
              ceremonyRefData={ceremonyRefData}
              communeRefData={communeRefData}
              compareLeftId={compareLeftId}
              compareRightId={compareRightId}
              setCompareLeftId={setCompareLeftId}
              setCompareRightId={setCompareRightId}
              approvedRecordings={approvedRecordings}
              onEditFilters={() => setStep(1)}
              onChangeSelection={() => setStep(2)}
            />
            {(!leftRecording || !rightRecording) && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Một hoặc cả hai bản đã chọn không còn trong kết quả lọc hiện tại. Vui lòng chọn lại
                bản thu.
              </div>
            )}
            <CompareResultStep
              leftRecording={leftRecording}
              rightRecording={rightRecording}
              leftMediaSrc={leftMediaSrc}
              rightMediaSrc={rightMediaSrc}
              compareHasVideoMedia={compareHasVideoMedia}
              showSpectrogram={showSpectrogram}
              setShowSpectrogram={setShowSpectrogram}
              facets={facets}
            />
          </>
        )}
      </div>
    </div>
  );
}
