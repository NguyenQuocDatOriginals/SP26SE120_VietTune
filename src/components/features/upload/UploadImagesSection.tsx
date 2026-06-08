import { ImagePlus, X } from 'lucide-react';
import React, { useState } from 'react';

import { SectionHeader } from '@/components/features/upload/UploadFormPrimitives';
import ImageLightbox from '@/components/common/ImageLightbox';

type UploadImagesSectionProps = {
  show: boolean;
  isFormDisabled: boolean;
  isUploadingMedia: boolean;
  existingRecordingImageUrls: string[];
  recordingImagePreviews: string[];
  onRecordingImagesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveRecordingImage: (index: number) => void;
};

export default function UploadImagesSection({
  show,
  isFormDisabled,
  isUploadingMedia,
  existingRecordingImageUrls,
  recordingImagePreviews,
  onRecordingImagesChange,
  onRemoveRecordingImage,
}: UploadImagesSectionProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  const allImages = [...existingRecordingImageUrls, ...recordingImagePreviews];

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (!show) return null;

  return (
    <div className="rounded-2xl border border-secondary-200/50 bg-gradient-to-br from-surface-panel via-cream-50/80 to-secondary-50/45 p-5 sm:p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-secondary-300/50 hover:shadow-xl">
      <SectionHeader
        icon={ImagePlus}
        title="Thêm ảnh minh họa"
        subtitle="Bạn có thể thêm nhiều ảnh minh họa cho bản thu (không bắt buộc)"
      />
      <div className="mt-4 rounded-xl border border-secondary-200/70 bg-white/80 p-4">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onRecordingImagesChange}
          disabled={isFormDisabled || isUploadingMedia}
          className="block w-full text-sm text-neutral-700 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-700"
        />
        {existingRecordingImageUrls.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold text-neutral-700">Ảnh hiện có</p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {existingRecordingImageUrls.map((url, index) => (
                <div 
                  key={url} 
                  className="overflow-hidden rounded-lg border border-secondary-200 cursor-pointer hover:ring-2 hover:ring-primary-500 hover:ring-offset-1 transition-all"
                  onClick={() => handleImageClick(index)}
                >
                  <img src={url} alt="Ảnh bản thu hiện có" className="h-24 w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
        {recordingImagePreviews.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold text-neutral-700">Ảnh sẽ tải lên</p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {recordingImagePreviews.map((src, index) => (
                <div
                  key={`${src}-${index}`}
                  className="relative overflow-hidden rounded-lg border border-secondary-200 cursor-pointer hover:ring-2 hover:ring-primary-500 hover:ring-offset-1 transition-all"
                  onClick={() => handleImageClick(existingRecordingImageUrls.length + index)}
                >
                  <img src={src} alt={`Ảnh minh họa ${index + 1}`} className="h-24 w-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveRecordingImage(index);
                    }}
                    className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white transition hover:bg-black/80"
                    aria-label="Xóa ảnh"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <ImageLightbox
        isOpen={lightboxOpen}
        images={allImages}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}
