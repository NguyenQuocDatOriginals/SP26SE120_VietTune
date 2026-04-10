// [VI] Nhập (import) các phụ thuộc cho file.
import { useCallback, useState } from 'react';

// [VI] Khai báo kiểu (type) để mô tả dữ liệu.
type UseUploadWizardParams = {
// [VI] Thực thi một bước trong luồng xử lý.
  isFormDisabled: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
  isEditMode: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
  file: File | null;
// [VI] Thực thi một bước trong luồng xử lý.
  existingMediaSrc: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  createdRecordingId: string | null;
// [VI] Thực thi một bước trong luồng xử lý.
  title: string;
// [VI] Thực thi một bước trong luồng xử lý.
  artist: string;
// [VI] Thực thi một bước trong luồng xử lý.
  artistUnknown: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
  composer: string;
// [VI] Thực thi một bước trong luồng xử lý.
  composerUnknown: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
  performanceType: string;
// [VI] Thực thi một bước trong luồng xử lý.
  vocalStyle: string;
// [VI] Thực thi một bước trong luồng xử lý.
  requiresInstruments: boolean;
// [VI] Thực thi một bước trong luồng xử lý.
  instruments: string[];
// [VI] Thực thi một bước trong luồng xử lý.
};

// [VI] Khai báo hàm/biểu thức hàm.
function scrollToTopRespectMotion(): void {
// [VI] Khai báo biến/hằng số.
  const behavior =
// [VI] Thực thi một bước trong luồng xử lý.
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
// [VI] Thực thi một bước trong luồng xử lý.
      ? 'auto'
// [VI] Thực thi một bước trong luồng xử lý.
      : 'smooth';
// [VI] Thực thi một bước trong luồng xử lý.
  window.scrollTo({ top: 0, behavior });
// [VI] Thực thi một bước trong luồng xử lý.
}

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function useUploadWizard(params: UseUploadWizardParams) {
// [VI] Khai báo biến/hằng số.
  const {
// [VI] Thực thi một bước trong luồng xử lý.
    isFormDisabled,
// [VI] Thực thi một bước trong luồng xử lý.
    isEditMode,
// [VI] Thực thi một bước trong luồng xử lý.
    file,
// [VI] Thực thi một bước trong luồng xử lý.
    existingMediaSrc,
// [VI] Thực thi một bước trong luồng xử lý.
    createdRecordingId,
// [VI] Thực thi một bước trong luồng xử lý.
    title,
// [VI] Thực thi một bước trong luồng xử lý.
    artist,
// [VI] Thực thi một bước trong luồng xử lý.
    artistUnknown,
// [VI] Thực thi một bước trong luồng xử lý.
    composer,
// [VI] Thực thi một bước trong luồng xử lý.
    composerUnknown,
// [VI] Thực thi một bước trong luồng xử lý.
    performanceType,
// [VI] Thực thi một bước trong luồng xử lý.
    vocalStyle,
// [VI] Thực thi một bước trong luồng xử lý.
    requiresInstruments,
// [VI] Thực thi một bước trong luồng xử lý.
    instruments,
// [VI] Thực thi một bước trong luồng xử lý.
  } = params;

// [VI] Khai báo biến/hằng số.
  const [uploadWizardStep, setUploadWizardStep] = useState(1);

// [VI] Khai báo biến/hằng số.
  const canNavigateToStep = useCallback(
// [VI] Khai báo hàm/biểu thức hàm.
    (targetStep: number): boolean => {
// [VI] Rẽ nhánh điều kiện (if).
      if (isFormDisabled) return false;
// [VI] Rẽ nhánh điều kiện (if).
      if (targetStep <= uploadWizardStep) return true;

// [VI] Rẽ nhánh điều kiện (if).
      if (targetStep >= 2) {
// [VI] Khai báo biến/hằng số.
        const hasMedia = file || (isEditMode && !!existingMediaSrc);
// [VI] Rẽ nhánh điều kiện (if).
        if (!hasMedia) return false;
// [VI] Rẽ nhánh điều kiện (if).
        if (!isEditMode && !createdRecordingId) return false;
// [VI] Thực thi một bước trong luồng xử lý.
      }

// [VI] Rẽ nhánh điều kiện (if).
      if (isEditMode) return true;

// [VI] Rẽ nhánh điều kiện (if).
      if (targetStep >= 3) {
// [VI] Rẽ nhánh điều kiện (if).
        if (!title.trim()) return false;
// [VI] Rẽ nhánh điều kiện (if).
        if (!artistUnknown && !artist.trim()) return false;
// [VI] Rẽ nhánh điều kiện (if).
        if (!composerUnknown && !composer.trim()) return false;
// [VI] Rẽ nhánh điều kiện (if).
        if (!performanceType) return false;
// [VI] Rẽ nhánh điều kiện (if).
        if (
// [VI] Thực thi một bước trong luồng xử lý.
          (performanceType === 'vocal_accompaniment' || performanceType === 'acappella') &&
// [VI] Thực thi một bước trong luồng xử lý.
          !vocalStyle
// [VI] Thực thi một bước trong luồng xử lý.
        ) {
// [VI] Trả về kết quả từ hàm.
          return false;
// [VI] Thực thi một bước trong luồng xử lý.
        }
// [VI] Rẽ nhánh điều kiện (if).
        if (requiresInstruments && instruments.length === 0) return false;
// [VI] Thực thi một bước trong luồng xử lý.
      }

// [VI] Trả về kết quả từ hàm.
      return true;
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
    [
// [VI] Thực thi một bước trong luồng xử lý.
      artist,
// [VI] Thực thi một bước trong luồng xử lý.
      artistUnknown,
// [VI] Thực thi một bước trong luồng xử lý.
      composer,
// [VI] Thực thi một bước trong luồng xử lý.
      composerUnknown,
// [VI] Thực thi một bước trong luồng xử lý.
      createdRecordingId,
// [VI] Thực thi một bước trong luồng xử lý.
      existingMediaSrc,
// [VI] Thực thi một bước trong luồng xử lý.
      file,
// [VI] Thực thi một bước trong luồng xử lý.
      instruments,
// [VI] Thực thi một bước trong luồng xử lý.
      isEditMode,
// [VI] Thực thi một bước trong luồng xử lý.
      isFormDisabled,
// [VI] Thực thi một bước trong luồng xử lý.
      performanceType,
// [VI] Thực thi một bước trong luồng xử lý.
      requiresInstruments,
// [VI] Thực thi một bước trong luồng xử lý.
      title,
// [VI] Thực thi một bước trong luồng xử lý.
      uploadWizardStep,
// [VI] Thực thi một bước trong luồng xử lý.
      vocalStyle,
// [VI] Thực thi một bước trong luồng xử lý.
    ],
// [VI] Thực thi một bước trong luồng xử lý.
  );

// [VI] Khai báo biến/hằng số.
  const goToStep = useCallback((step: number) => {
// [VI] Thực thi một bước trong luồng xử lý.
    setUploadWizardStep(step);
// [VI] Thực thi một bước trong luồng xử lý.
  }, []);

// [VI] Khai báo biến/hằng số.
  const goNext = useCallback(() => {
// [VI] Thực thi một bước trong luồng xử lý.
    scrollToTopRespectMotion();
// [VI] Khai báo hàm/biểu thức hàm.
    setUploadWizardStep((step) => Math.min(3, step + 1));
// [VI] Thực thi một bước trong luồng xử lý.
  }, []);

// [VI] Khai báo biến/hằng số.
  const goPrev = useCallback(() => {
// [VI] Thực thi một bước trong luồng xử lý.
    scrollToTopRespectMotion();
// [VI] Khai báo hàm/biểu thức hàm.
    setUploadWizardStep((step) => Math.max(1, step - 1));
// [VI] Thực thi một bước trong luồng xử lý.
  }, []);

// [VI] Khai báo biến/hằng số.
  const reset = useCallback(() => {
// [VI] Thực thi một bước trong luồng xử lý.
    setUploadWizardStep(1);
// [VI] Thực thi một bước trong luồng xử lý.
  }, []);

// [VI] Trả về kết quả từ hàm.
  return {
// [VI] Thực thi một bước trong luồng xử lý.
    uploadWizardStep,
// [VI] Thực thi một bước trong luồng xử lý.
    setUploadWizardStep,
// [VI] Thực thi một bước trong luồng xử lý.
    canNavigateToStep,
// [VI] Thực thi một bước trong luồng xử lý.
    goToStep,
// [VI] Thực thi một bước trong luồng xử lý.
    goNext,
// [VI] Thực thi một bước trong luồng xử lý.
    goPrev,
// [VI] Thực thi một bước trong luồng xử lý.
    reset,
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
}
