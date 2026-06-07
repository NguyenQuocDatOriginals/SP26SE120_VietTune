import { AlertCircle, Check, Info } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import MetadataSuggestionCard from '@/components/features/upload/metadata-suggestions/MetadataSuggestionCard';
import {
  AIAnalysisState,
  AI_STATE_MESSAGES_VI,
} from '@/features/moderation/constants/aiAnalysisState';
import { instrumentDetectionFlags } from '@/services/instrumentDetectionService';
import type { MetadataSuggestion, MetadataSuggestionField } from '@/types/instrumentDetection';
import { groupMetadataSuggestionsForAdvisory, normalizeInstrumentMatchKey } from '@/utils/instrumentMetadataMapper';
import {
  advisoryFieldToLegacyField,
  normalizeMetadataSuggestionGroups,
  type MetadataSuggestionGroup,
} from '@/utils/metadataSuggestionNormalize';

type MetadataSuggestionPanelProps = {
  suggestions: MetadataSuggestion[];
  readOnly?: boolean;
  loading?: boolean;
  error?: string | null;
  httpStatus?: number | null;
  disabledFields?: Partial<Record<MetadataSuggestionField, boolean>>;
  onApply?: (field: MetadataSuggestionField, value: string) => void;
};

const FIELD_LABELS: Record<MetadataSuggestionField, string> = {
  ethnicity: 'Dân tộc',
  region: 'Khu vực',
  vocalStyle: 'Lối hát / Thể loại',
  eventType: 'Loại sự kiện',
  musicalScale: 'Âm giai',
};

function ApplyButton({
  field,
  value,
  disabled,
  onApply,
}: {
  field: MetadataSuggestionField;
  value: string;
  disabled: boolean;
  onApply: (field: MetadataSuggestionField, value: string) => void;
}) {
  const [applied, setApplied] = useState(false);

  const handleClick = useCallback(() => {
    onApply(field, value);
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  }, [field, value, onApply]);

  if (applied) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
        <Check className="h-3 w-3" strokeWidth={3} />
        Đã áp dụng
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="rounded-md bg-primary-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-primary-700 active:bg-primary-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
    >
      Áp dụng
    </button>
  );
}

function pickBestRowForValue(
  rows: MetadataSuggestion[],
  value: string | null,
): MetadataSuggestion | null {
  if (!value) return null;
  const key = normalizeInstrumentMatchKey(value);
  const byExact = rows
    .filter((row) => normalizeInstrumentMatchKey(row.value) === key)
    .sort((a, b) => b.confidence - a.confidence);
  if (byExact.length > 0) return byExact[0];

  const byPrefix = rows
    .filter((row) => {
      const rk = normalizeInstrumentMatchKey(row.value);
      return key.startsWith(`${rk} `) || rk.startsWith(`${key} `);
    })
    .sort((a, b) => b.confidence - a.confidence);
  return byPrefix[0] ?? null;
}

function resolveTopValue(
  rows: MetadataSuggestion[],
  uiGroup: MetadataSuggestionGroup | undefined,
): string | null {
  if (uiGroup?.primary?.label) {
    const topCandidate = uiGroup.primary.label;
    if (pickBestRowForValue(rows, topCandidate)) return topCandidate;
  }
  if (rows.length > 0) return rows[0].value;
  return null;
}

export default function MetadataSuggestionPanel({
  suggestions,
  readOnly = false,
  loading = false,
  error = null,
  httpStatus = null,
  disabledFields,
  onApply,
}: MetadataSuggestionPanelProps) {
  if (!instrumentDetectionFlags.confidenceEnabled) return null;

  const isNotAvailable =
    !loading && !!error && (httpStatus === 404 || httpStatus === 400);
  const isFailed = !loading && !!error && !isNotAvailable;
  const metadataAiState: AIAnalysisState = loading
    ? AIAnalysisState.LOADING
    : isNotAvailable
      ? AIAnalysisState.NOT_AVAILABLE
      : isFailed
        ? AIAnalysisState.FAILED
        : suggestions.length === 0
          ? AIAnalysisState.NOT_AVAILABLE
          : AIAnalysisState.READY;

  const grouped = useMemo(
    () =>
      suggestions.reduce<Record<MetadataSuggestionField, MetadataSuggestion[]>>(
        (acc, row) => {
          acc[row.field].push(row);
          return acc;
        },
        { ethnicity: [], region: [], vocalStyle: [], eventType: [], musicalScale: [] },
      ),
    [suggestions],
  );

  const uiGroups = useMemo(() => {
    const advisory = groupMetadataSuggestionsForAdvisory(suggestions);
    return normalizeMetadataSuggestionGroups(advisory);
  }, [suggestions]);

  const uiGroupByLegacyField = useMemo(() => {
    const map = new Map<MetadataSuggestionField, MetadataSuggestionGroup>();
    for (const group of uiGroups) {
      map.set(advisoryFieldToLegacyField(group.id), group);
    }
    return map;
  }, [uiGroups]);

  return (
    <div className="rounded-xl border border-neutral-200 bg-surface-muted p-3">
      <p className="text-sm font-semibold text-neutral-900">Gợi ý metadata từ AI nhạc cụ</p>
      <p className="mt-0.5 text-[11px] text-neutral-600">
        Gợi ý hỗ trợ điền form — không thay thế xác minh của chuyên gia.
      </p>

      {metadataAiState === AIAnalysisState.LOADING && (
        <p className="mt-3 text-xs text-neutral-600">
          {AI_STATE_MESSAGES_VI[AIAnalysisState.LOADING].metadata}
        </p>
      )}

      {metadataAiState === AIAnalysisState.NOT_AVAILABLE && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-dashed border-neutral-300 bg-white px-2.5 py-2">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-500" />
          <p className="text-xs text-neutral-600">
            {AI_STATE_MESSAGES_VI[AIAnalysisState.NOT_AVAILABLE].metadata}
          </p>
        </div>
      )}

      {metadataAiState === AIAnalysisState.FAILED && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50/60 px-2.5 py-2">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />
          <p className="text-xs text-red-700">
            {AI_STATE_MESSAGES_VI[AIAnalysisState.FAILED].metadata}
          </p>
        </div>
      )}

      {metadataAiState === AIAnalysisState.READY && (
        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
          {(Object.keys(FIELD_LABELS) as MetadataSuggestionField[]).map((field) => {
            const rows = grouped[field];
            if (rows.length === 0) return null;

            const uiGroup = uiGroupByLegacyField.get(field);
            if (!uiGroup) return null;

            const topValue = resolveTopValue(rows, uiGroup);
            const topRow = pickBestRowForValue(rows, topValue);

            const displayGroup: MetadataSuggestionGroup = {
              ...uiGroup,
              title: FIELD_LABELS[field],
              primary: topValue
                ? {
                    label: topValue,
                    confidence: topRow?.confidence ?? uiGroup.primary?.confidence ?? null,
                    source: topRow
                      ? topRow.sourceInstrument.startsWith('Nguồn suy luận:')
                        ? topRow.sourceInstrument
                        : `Nguồn suy luận: ${topRow.sourceInstrument}`
                      : (uiGroup.primary?.source ?? null),
                  }
                : uiGroup.primary,
            };

            return (
              <MetadataSuggestionCard
                key={field}
                group={displayGroup}
                primaryAction={
                  !readOnly && onApply && topValue ? (
                    <ApplyButton
                      field={field}
                      value={topValue}
                      disabled={!!disabledFields?.[field]}
                      onApply={onApply}
                    />
                  ) : undefined
                }
              />
            );
          })}
        </div>
      )}

      {!loading && !error && suggestions.length > 0 && (
        <p className="mt-4 text-[11px] leading-relaxed text-neutral-500">
          Độ tin cậy phản ánh mức phát hiện nhạc cụ. Gợi ý dân tộc, vùng, lối hát và loại sự kiện
          được suy ra từ danh mục nhạc cụ, không phải từ mô hình dự đoán độc lập.
        </p>
      )}
    </div>
  );
}
