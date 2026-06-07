import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import React, { useEffect, useState } from 'react';

type ImageLightboxProps = {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (index: number) => void;
};

export default function ImageLightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: ImageLightboxProps) {
  const [scale, setScale] = useState(1);

  // Reset scale when changing images or closing/opening
  useEffect(() => {
    setScale(1);
  }, [currentIndex, isOpen]);
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onNavigate) {
        onNavigate((currentIndex - 1 + images.length) % images.length);
      }
      if (e.key === 'ArrowRight' && onNavigate) {
        onNavigate((currentIndex + 1) % images.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Disable scrolling when lightbox is open
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen, currentIndex, images.length, onClose, onNavigate]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNavigate) onNavigate((currentIndex - 1 + images.length) % images.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNavigate) onNavigate((currentIndex + 1) % images.length);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const zoomSensitivity = 0.0015;
    const delta = e.deltaY * -zoomSensitivity;
    const newScale = Math.min(Math.max(0.5, scale * (1 + delta)), 5);
    setScale(newScale);
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.min(prev * 1.25, 5));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.max(prev / 1.25, 0.5));
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(1);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md overflow-hidden"
      onClick={onClose}
      onWheel={handleWheel}
      style={{ animation: 'fadeIn 0.2s ease-out' }}
    >
      <button
        type="button"
        className="absolute top-4 right-4 z-[101] rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Đóng"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Zoom Controls */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[101] flex items-center gap-2 bg-black/50 rounded-full p-1.5 backdrop-blur-sm">
        <button
          type="button"
          className="p-2 text-white hover:bg-black/40 rounded-full transition-colors disabled:opacity-50"
          onClick={handleZoomOut}
          disabled={scale <= 0.5}
          aria-label="Thu nhỏ"
        >
          <ZoomOut className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="p-2 text-white hover:bg-black/40 rounded-full transition-colors"
          onClick={handleResetZoom}
          aria-label="Đặt lại kích thước"
          title="Tỉ lệ gốc (1x)"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="p-2 text-white hover:bg-black/40 rounded-full transition-colors disabled:opacity-50"
          onClick={handleZoomIn}
          disabled={scale >= 5}
          aria-label="Phóng to"
        >
          <ZoomIn className="h-5 w-5" />
        </button>
        <div className="px-3 text-white/90 text-sm font-medium border-l border-white/20 ml-1">
          {Math.round(scale * 100)}%
        </div>
      </div>

      {images.length > 1 && onNavigate && (
        <button
          type="button"
          className="absolute left-4 top-1/2 z-[101] -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/70 transition-colors"
          onClick={handlePrev}
          aria-label="Ảnh trước"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
      )}

      <img
        src={currentImage}
        alt="Bản phóng to"
        className="max-h-full max-w-full object-contain shadow-2xl rounded-sm transition-transform duration-75 ease-out cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          animation: 'zoomIn 0.2s ease-out',
          transform: `scale(${scale})`
        }}
      />

      {images.length > 1 && onNavigate && (
        <button
          type="button"
          className="absolute right-4 top-1/2 z-[101] -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/70 transition-colors"
          onClick={handleNext}
          aria-label="Ảnh tiếp"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
