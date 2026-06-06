import { GitCompare } from 'lucide-react';
import React, { useMemo } from 'react';

import LoadingSpinner from '@/components/common/LoadingSpinner';
import {
  getEthnicityLabel,
  getInstrumentLabel,
  getPerformerLabel,
  getRegionLabel,
} from '@/features/researcher/researcherRecordingUtils';
import { Recording } from '@/types';

export interface CompareSelectStepProps {
  searchLoading: boolean;
  approvedRecordings: Recording[];
  compareLeftId: string;
  compareRightId: string;
  setCompareLeftId: React.Dispatch<React.SetStateAction<string>>;
  setCompareRightId: React.Dispatch<React.SetStateAction<string>>;
  normalizeBaseSongKey: (input: string) => string;
  getBaseSongTitle: (rec: Recording | undefined) => string;
  onCompare: () => void;
}

type SortedRecording = Recording & { _sameSongGroup?: boolean };

export default function CompareSelectStep({
  searchLoading,
  approvedRecordings,
  compareLeftId,
  compareRightId,
  setCompareLeftId,
  setCompareRightId,
  normalizeBaseSongKey,
  getBaseSongTitle,
  onCompare,
}: CompareSelectStepProps) {
  const sortedRecordings = useMemo((): SortedRecording[] => {
    const anchor = approvedRecordings.find((r) => r.id === compareLeftId);
    const anchorKey = anchor ? normalizeBaseSongKey(getBaseSongTitle(anchor)) : '';

    return [...approvedRecordings]
      .map((r) => {
        const key = normalizeBaseSongKey(getBaseSongTitle(r));
        const sameSongGroup = Boolean(anchorKey && key && key === anchorKey && r.id !== compareLeftId);
        return { ...r, _sameSongGroup: sameSongGroup };
      })
      .sort((a, b) => {
        if (a._sameSongGroup && !b._sameSongGroup) return -1;
        if (!a._sameSongGroup && b._sameSongGroup) return 1;
        return (a.title ?? '').localeCompare(b.title ?? '', 'vi');
      });
  }, [approvedRecordings, compareLeftId, normalizeBaseSongKey, getBaseSongTitle]);

  const canCompare = Boolean(compareLeftId && compareRightId && compareLeftId !== compareRightId);

  if (searchLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (approvedRecordings.length === 0) {
    return (
      <p className="text-sm text-neutral-600 py-8 text-center">
        Không có bản thu nào khớp bộ lọc. Hãy điều chỉnh bộ lọc ở bước trước.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-600">
          Chọn 2 bản thu để so sánh. Các bản cùng base song (nếu có) được ưu tiên hiển thị đầu danh
          sách.
        </p>
        <button
          type="button"
          onClick={onCompare}
          disabled={!canCompare}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <GitCompare className="h-4 w-4" />
          So sánh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sortedRecordings.map((rec) => {
          const isA = rec.id === compareLeftId;
          const isB = rec.id === compareRightId;
          const isSelected = isA || isB;

          return (
            <div
              key={rec.id}
              className={`rounded-xl border p-4 transition-all ${
                isSelected
                  ? 'border-primary-400 bg-primary-50/60 ring-2 ring-primary-200'
                  : 'border-neutral-200 bg-white hover:border-primary-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <h4 className="font-semibold text-neutral-900 truncate">{rec.title}</h4>
                  <p className="text-xs text-neutral-500 truncate">{getPerformerLabel(rec) || '—'}</p>
                </div>
                <div className="flex flex-shrink-0 gap-1">
                  {isA && (
                    <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      A
                    </span>
                  )}
                  {isB && (
                    <span className="rounded-full bg-secondary-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      B
                    </span>
                  )}
                  {rec._sameSongGroup && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      Cùng bài
                    </span>
                  )}
                </div>
              </div>
              <div className="text-xs text-neutral-600 space-y-0.5 mb-3">
                <p>
                  {getEthnicityLabel(rec)} · {getRegionLabel(rec)}
                </p>
                <p>{getInstrumentLabel(rec) || '—'}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCompareLeftId(rec.id)}
                  disabled={rec.id === compareRightId}
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    isA
                      ? 'border-primary-500 bg-primary-100 text-primary-800'
                      : 'border-primary-200 text-primary-700 hover:bg-primary-50'
                  }`}
                >
                  Chọn làm A
                </button>
                <button
                  type="button"
                  onClick={() => setCompareRightId(rec.id)}
                  disabled={rec.id === compareLeftId}
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    isB
                      ? 'border-secondary-500 bg-secondary-100 text-secondary-800'
                      : 'border-secondary-200 text-secondary-700 hover:bg-secondary-50'
                  }`}
                >
                  Chọn làm B
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
