import { ImageIcon } from 'lucide-react';
import { memo, useState } from 'react';

import { useRecordingImages } from '@/hooks/useRecordingImages';
import { cn } from '@/utils/helpers';
import ImageLightbox from '@/components/common/ImageLightbox';

type RecordingImageGalleryProps = {
  recordingId?: string;
  className?: string;
  title?: string;
};

function RecordingImageGalleryInner({
  recordingId,
  className,
  title = 'Hình ảnh bản thu',
}: RecordingImageGalleryProps) {
  const { images, loading, error } = useRecordingImages(recordingId);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (!recordingId) return null;

  return (
    <section
      className={cn('rounded-xl border border-neutral-200/80 bg-white/70 p-3', className)}
      aria-label={title}
    >
      <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-600">
        <ImageIcon className="h-3.5 w-3.5" aria-hidden />
        {title}
      </h4>

      {loading ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
              <div className="aspect-video animate-pulse bg-neutral-200/70" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-xs text-amber-700">{error}</p>
      ) : images.length === 0 ? (
        <p className="text-xs text-neutral-500">Bản thu này chưa có hình ảnh.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map((image, index) => (
            <figure
              key={image.id}
              className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm cursor-pointer hover:ring-2 hover:ring-primary-500 hover:ring-offset-1 transition-all"
              onClick={() => handleImageClick(index)}
            >
              <img
                src={image.imageUrl}
                alt={image.caption?.trim() || `Hình ảnh bản thu ${index + 1}`}
                className="aspect-video h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              {image.caption?.trim() ? (
                <figcaption className="line-clamp-2 px-2 py-1 text-[11px] text-neutral-600">
                  {image.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      )}
      
      <ImageLightbox
        isOpen={lightboxOpen}
        images={images.map(img => img.imageUrl)}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />
    </section>
  );
}

export default memo(RecordingImageGalleryInner);

