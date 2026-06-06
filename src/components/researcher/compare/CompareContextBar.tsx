import { Pencil } from 'lucide-react';
import React, { useMemo } from 'react';

import SearchableDropdown from '@/components/common/SearchableDropdown';
import type { CompareWizardStep, SearchFiltersState } from '@/features/researcher/researcherPortalTypes';
import { Recording } from '@/types';

export interface CompareContextBarProps {
  step: CompareWizardStep;
  filters: SearchFiltersState;
  activeFilterCount: number;
  resultCount: number;
  compareLeftId: string;
  compareRightId: string;
  setCompareLeftId: React.Dispatch<React.SetStateAction<string>>;
  setCompareRightId: React.Dispatch<React.SetStateAction<string>>;
  approvedRecordings: Recording[];
  onEditFilters: () => void;
  onChangeSelection?: () => void;
}

function buildFilterChips(filters: SearchFiltersState): string[] {
  const chips: string[] = [];
  if (filters.ethnicity.trim()) chips.push(`Dân tộc: ${filters.ethnicity.trim()}`);
  if (filters.instrument.trim()) chips.push(`Nhạc cụ: ${filters.instrument.trim()}`);
  if (filters.ceremony.trim()) chips.push(`Nghi lễ: ${filters.ceremony.trim()}`);
  if (filters.region.trim()) chips.push(`Vùng: ${filters.region.trim()}`);
  if (filters.commune.trim()) chips.push(`Xã/Phường: ${filters.commune.trim()}`);
  return chips;
}

function getRecordingLabel(rec: Recording | undefined): string {
  if (!rec) return '';
  const performer = (rec.performers ?? [])
    .map((p) => p.nameVietnamese ?? p.name)
    .filter(Boolean)
    .join(', ');
  const title = rec.title?.trim() || 'Không có tiêu đề';
  return performer ? `${title} — ${performer}` : title;
}

export default function CompareContextBar({
  step,
  filters,
  activeFilterCount,
  resultCount,
  compareLeftId,
  compareRightId,
  setCompareLeftId,
  setCompareRightId,
  approvedRecordings,
  onEditFilters,
  onChangeSelection,
}: CompareContextBarProps) {
  const chips = useMemo(() => buildFilterChips(filters), [filters]);

  const compareOptionMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of approvedRecordings) {
      map.set(r.id, getRecordingLabel(r));
    }
    return map;
  }, [approvedRecordings]);

  const compareOptionIds = useMemo(() => approvedRecordings.map((r) => r.id), [approvedRecordings]);
  const leftRecording = approvedRecordings.find((r) => r.id === compareLeftId);
  const rightRecording = approvedRecordings.find((r) => r.id === compareRightId);

  return (
    <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 mb-4 bg-cream-50/95 backdrop-blur-sm border-b border-primary-200/60">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {chips.length > 0 ? (
            chips.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center rounded-full border border-primary-200 bg-white px-2.5 py-1 text-xs font-medium text-primary-800"
              >
                {chip}
              </span>
            ))
          ) : (
            <span className="text-xs text-neutral-500">Chưa áp dụng bộ lọc</span>
          )}
          <span className="text-xs text-neutral-600">
            {resultCount} bản khớp
            {activeFilterCount > 0 ? ` · ${activeFilterCount} bộ lọc` : ''}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onEditFilters}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-50 transition-colors cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" />
            Sửa bộ lọc
          </button>
          {step === 3 && onChangeSelection && (
            <button
              type="button"
              onClick={onChangeSelection}
              className="inline-flex items-center gap-1.5 rounded-lg border border-secondary-200 px-3 py-1.5 text-xs font-semibold text-secondary-700 hover:bg-secondary-50 transition-colors cursor-pointer"
            >
              Đổi bản
            </button>
          )}
        </div>
      </div>

      {step === 3 && (leftRecording || rightRecording) && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-lg border border-primary-200 bg-white p-2.5">
            <p className="text-[11px] font-semibold text-primary-700 mb-1.5">Bản A</p>
            <SearchableDropdown
              value={compareLeftId}
              onChange={setCompareLeftId}
              options={compareOptionIds}
              labelMap={compareOptionMap}
              placeholder="Chọn bản A..."
              searchable
            />
          </div>
          <div className="rounded-lg border border-secondary-200 bg-white p-2.5">
            <p className="text-[11px] font-semibold text-secondary-700 mb-1.5">Bản B</p>
            <SearchableDropdown
              value={compareRightId}
              onChange={setCompareRightId}
              options={compareOptionIds.filter((id) => id !== compareLeftId)}
              labelMap={compareOptionMap}
              placeholder="Chọn bản B..."
              searchable
            />
          </div>
        </div>
      )}
    </div>
  );
}
