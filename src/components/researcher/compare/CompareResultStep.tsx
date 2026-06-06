import { Waves } from 'lucide-react';
import React, { useMemo } from 'react';

import DualAudioComparePlayer from '@/components/researcher/DualAudioComparePlayer';
import CompareWorkstation from '@/features/compare-engine/components/CompareWorkstation';
import type { ComparisonFacets } from '@/features/researcher/researcherPortalTypes';
import {
  buildExpertComparativeNotes,
  getTranscriptText,
  highlightTranscriptDiff,
} from '@/features/researcher/researcherRecordingUtils';
import { Recording } from '@/types';

export interface CompareResultStepProps {
  leftRecording: Recording | undefined;
  rightRecording: Recording | undefined;
  leftMediaSrc: string;
  rightMediaSrc: string;
  compareHasVideoMedia: boolean;
  showSpectrogram: boolean;
  setShowSpectrogram: React.Dispatch<React.SetStateAction<boolean>>;
  facets: ComparisonFacets;
}

export default function CompareResultStep({
  leftRecording,
  rightRecording,
  leftMediaSrc,
  rightMediaSrc,
  compareHasVideoMedia,
  showSpectrogram,
  setShowSpectrogram,
  facets,
}: CompareResultStepProps) {
  const leftTranscript = getTranscriptText(leftRecording);
  const rightTranscript = getTranscriptText(rightRecording);
  const transcriptDiff = highlightTranscriptDiff(leftTranscript, rightTranscript);
  const expertNotes = useMemo(
    () => buildExpertComparativeNotes(leftRecording, rightRecording),
    [leftRecording, rightRecording],
  );

  if (!leftRecording || !rightRecording) {
    return (
      <p className="text-sm text-neutral-600 py-6 text-center">
        Chọn đủ 2 bản thu để xem kết quả so sánh.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-primary-800">Phát &amp; phân tích âm thanh</h3>
        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showSpectrogram}
            onChange={(e) => setShowSpectrogram(e.target.checked)}
            className="h-4 w-4 rounded border-primary-300 text-primary-600 focus:ring-primary-500"
          />
          <Waves className="h-4 w-4 text-primary-600" />
          <span className="text-sm font-medium text-neutral-700">Hiển thị spectrogram</span>
        </label>
      </div>

      {compareHasVideoMedia ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4">
          <p className="text-sm text-amber-800">
            Một trong hai bản thu là nguồn video. Chế độ đồng bộ hiện áp dụng cho audio waveform;
            vui lòng mở từng bản ở thẻ tìm kiếm để xem video.
          </p>
        </div>
      ) : showSpectrogram ? (
        <CompareWorkstation
          leftRecording={leftRecording}
          rightRecording={rightRecording}
          leftSource={leftMediaSrc}
          rightSource={rightMediaSrc}
          metadataPanel={
            <p className="text-xs text-neutral-600">
              Phím tắt: Space (play/pause), 1/2/3/4 (focus/modes), A/D hoặc mũi tên (nudge).
            </p>
          }
        />
      ) : (
        <DualAudioComparePlayer
          leftRecording={leftRecording}
          rightRecording={rightRecording}
          leftSource={leftMediaSrc}
          rightSource={rightMediaSrc}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <h3 className="text-base font-semibold text-emerald-800 mb-3">Giống nhau</h3>
          {facets.same.length === 0 ? (
            <p className="text-sm text-emerald-700/80">Không có điểm trùng khớp rõ ràng.</p>
          ) : (
            <ul className="space-y-2">
              {facets.same.map((item) => (
                <li key={item.label} className="text-sm">
                  <span className="font-medium text-emerald-900">{item.label}:</span>{' '}
                  <span className="text-emerald-800">{item.value}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
          <h3 className="text-base font-semibold text-amber-800 mb-3">Khác nhau</h3>
          {facets.different.length === 0 ? (
            <p className="text-sm text-amber-700/80">Không có khác biệt đáng kể theo metadata.</p>
          ) : (
            <ul className="space-y-3">
              {facets.different.map((item) => (
                <li key={item.label} className="text-sm">
                  <p className="font-medium text-amber-900 mb-1">{item.label}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-white/80 border border-amber-100 px-2 py-1.5">
                      <span className="font-semibold text-primary-700">A: </span>
                      {item.leftValue}
                    </div>
                    <div className="rounded-lg bg-white/80 border border-amber-100 px-2 py-1.5">
                      <span className="font-semibold text-secondary-700">B: </span>
                      {item.rightValue}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-secondary-200/70 bg-white p-4">
        <h3 className="text-base font-semibold text-primary-800 mb-3">So sánh phiên âm / lời hát</h3>
        {!leftTranscript && !rightTranscript ? (
          <p className="text-sm text-neutral-600">Hai bản thu chưa có transcript/lyrics để so sánh.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-lg border border-primary-100 bg-primary-50/30 p-3">
              <p className="text-xs font-semibold text-primary-700 mb-2">Bản A</p>
              <div
                className="text-sm leading-7 text-neutral-700"
                dangerouslySetInnerHTML={{
                  __html: transcriptDiff.leftHtml || 'Chưa có dữ liệu',
                }}
              />
            </div>
            <div className="rounded-lg border border-secondary-100 bg-secondary-50/30 p-3">
              <p className="text-xs font-semibold text-secondary-700 mb-2">Bản B</p>
              <div
                className="text-sm leading-7 text-neutral-700"
                dangerouslySetInnerHTML={{
                  __html: transcriptDiff.rightHtml || 'Chưa có dữ liệu',
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <h3 className="text-base font-semibold text-primary-800 mb-3">Nhận xét từ chuyên gia</h3>
        {expertNotes.length === 0 ? (
          <p className="text-sm text-neutral-600">
            Chưa có gợi ý nhận xét tự động cho cặp bản thu này.
          </p>
        ) : (
          <ul className="text-neutral-700 leading-relaxed space-y-2 list-none pl-0">
            {expertNotes.map((note, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
