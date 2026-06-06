import { ImageIcon } from 'lucide-react';
import { memo } from 'react';

import { useRecordingImages } from '@/hooks/useRecordingImages';
import { cn } from '@/utils/helpers';

function ContributionCardThumbnailInner({ recordingId }: { recordingId?: string }) {
  const { images, loading } = useRecordingImages(recordingId);
  const firstImage = images[0];

  return (
    <div
      className={cn(
        'relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-secondary-200/80 bg-secondary-50/60 sm:h-28 sm:w-28',
      )}
      aria-hidden={!recordingId}
    >
      {loading ? (
        <div className="h-full w-full animate-pulse bg-neutral-200/70" />
      ) : firstImage?.imageUrl ? (
        <img
          src={firstImage.imageUrl}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-neutral-400">
          <ImageIcon className="h-8 w-8" strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}

export const ContributionCardThumbnail = memo(ContributionCardThumbnailInner);
