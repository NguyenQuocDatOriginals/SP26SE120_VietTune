import { Loader2 } from 'lucide-react';

import { ContributorName } from '@/hooks/useUserFullName';
import type { LocalRecordingMini } from '@/features/moderation/types/localRecordingQueue.types';
import { getModerationStatusLabel } from '@/utils/helpers';

type SimilarRecordingsPanelProps = {
  items: LocalRecordingMini[];
  loading: boolean;
  error: string | null;
};

function resolveTitle(item: LocalRecordingMini): string {
  return item.basicInfo?.title || item.title || 'Không có tiêu đề';
}

export default function SimilarRecordingsPanel({
  items,
  loading,
  error,
}: SimilarRecordingsPanelProps) {
  return (
    <section
      className="rounded-2xl border border-neutral-200/80 bg-surface-panel p-4 shadow-sm"
      aria-label="Bản thu tương tự"
    >
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-neutral-900">Bản thu tương tự</h3>
        <p className="text-xs text-neutral-600">Gợi ý để đối chiếu ngữ cảnh và nhạc cụ liên quan.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang tải bản thu tương tự...
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Chưa tải được danh sách tương tự: {error}
        </div>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-3 py-3 text-xs text-neutral-600">
          Chưa có bản thu tương tự phù hợp.
        </div>
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <ul className="space-y-3" aria-label="Danh sách bản thu tương tự">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors shadow-sm"
            >
              <a
                href={`/recordings/${item.recordingId || item.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3.5 space-y-2 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors">
                    {resolveTitle(item)}
                  </p>
                  <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-800 border border-neutral-200">
                    {getModerationStatusLabel(item.moderation?.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-neutral-600">
                  <div>
                    <span className="font-medium text-neutral-400">Nghệ sĩ:</span>{' '}
                    <span className="text-neutral-800">{item.basicInfo?.artist || 'Không rõ'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-neutral-400">Dân tộc:</span>{' '}
                    <span className="text-neutral-800">{item.culturalContext?.ethnicity || 'Không rõ'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-neutral-400">Địa điểm:</span>{' '}
                    <span className="text-neutral-800">
                      {item.culturalContext?.province || item.culturalContext?.region || 'Không rõ'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-neutral-400">Thể loại:</span>{' '}
                    <span className="text-neutral-800">{item.basicInfo?.genre || 'Không rõ'}</span>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <span className="font-medium text-neutral-400">Nhạc cụ:</span>{' '}
                    <span className="text-neutral-800">
                      {item.culturalContext?.instruments && item.culturalContext.instruments.length > 0
                        ? item.culturalContext.instruments.join(', ')
                        : 'Không rõ'}
                    </span>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <span className="font-medium text-neutral-400">Người đóng góp:</span>{' '}
                    <span className="text-neutral-800">
                      {item.uploader ? (
                        <ContributorName
                          userId={item.uploader.id}
                          fallback={
                            (item.uploader as { fullName?: string })?.fullName ||
                            item.uploader.username
                          }
                        />
                      ) : (
                        'Không rõ'
                      )}
                    </span>
                  </div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
