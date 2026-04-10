// [VI] Nhập (import) các phụ thuộc cho file.
import { useCallback, useState } from 'react';

// [VI] Nhập (import) các phụ thuộc cho file.
import type { LocalRecordingMini } from '@/features/moderation/types/localRecordingQueue.types';
// [VI] Nhập (import) các phụ thuộc cho file.
import { expertWorkflowService } from '@/services/expertWorkflowService';
// [VI] Nhập (import) các phụ thuộc cho file.
import type { ModerationVerificationData } from '@/services/expertWorkflowService';
// [VI] Nhập (import) các phụ thuộc cho file.
import { uiToast, resolveCatalogMessage } from '@/uiToast';

// [VI] Xuất (export) thành phần/giá trị để module khác sử dụng.
export function useModerationWizard(opts: {
// [VI] Thực thi một bước trong luồng xử lý.
  allItems: LocalRecordingMini[];
// [VI] Thực thi một bước trong luồng xử lý.
  userId: string | undefined;
// [VI] Khai báo hàm/biểu thức hàm.
  onRequireApproveConfirm: (submissionId: string) => void;
// [VI] Khai báo hàm/biểu thức hàm.
  load: () => Promise<void>;
// [VI] Thực thi một bước trong luồng xử lý.
}) {
// [VI] Khai báo biến/hằng số.
  const { allItems, userId, onRequireApproveConfirm, load } = opts;
// [VI] Khai báo biến/hằng số.
  const [verificationStep, setVerificationStep] = useState<Record<string, number>>({});
// [VI] Khai báo biến/hằng số.
  const [verificationForms, setVerificationForms] = useState<
// [VI] Thực thi một bước trong luồng xử lý.
    Record<string, ModerationVerificationData>
// [VI] Thực thi một bước trong luồng xử lý.
  >({});

// [VI] Khai báo biến/hằng số.
  const primeClaimState = useCallback(
// [VI] Khai báo hàm/biểu thức hàm.
    (submissionId: string, moderationData?: ModerationVerificationData) => {
// [VI] Khai báo hàm/biểu thức hàm.
      setVerificationStep((prev) => ({ ...prev, [submissionId]: 1 }));
// [VI] Rẽ nhánh điều kiện (if).
      if (moderationData) {
// [VI] Khai báo hàm/biểu thức hàm.
        setVerificationForms((prev) => ({
// [VI] Thực thi một bước trong luồng xử lý.
          ...prev,
// [VI] Thực thi một bước trong luồng xử lý.
          [submissionId]: moderationData,
// [VI] Thực thi một bước trong luồng xử lý.
        }));
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
    [],
// [VI] Thực thi một bước trong luồng xử lý.
  );

// [VI] Khai báo biến/hằng số.
  const validateStep = useCallback(
// [VI] Khai báo hàm/biểu thức hàm.
    (id: string | null, step: number): boolean => {
// [VI] Rẽ nhánh điều kiện (if).
      if (!id) return false;
// [VI] Khai báo biến/hằng số.
      const formData = verificationForms[id];
// [VI] Rẽ nhánh điều kiện (if).
      if (!formData) return false;

// [VI] Rẽ nhánh điều kiện (if).
      if (step === 1) {
// [VI] Khai báo biến/hằng số.
        const step1 = formData.step1;
// [VI] Trả về kết quả từ hàm.
        return !!(step1?.infoComplete && step1?.infoAccurate && step1?.formatCorrect);
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Rẽ nhánh điều kiện (if).
      if (step === 2) {
// [VI] Khai báo biến/hằng số.
        const step2 = formData.step2;
// [VI] Trả về kết quả từ hàm.
        return !!(step2?.culturalValue && step2?.authenticity && step2?.accuracy);
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Rẽ nhánh điều kiện (if).
      if (step === 3) {
// [VI] Khai báo biến/hằng số.
        const step3 = formData.step3;
// [VI] Trả về kết quả từ hàm.
        return !!(step3?.crossChecked && step3?.sourcesVerified && step3?.finalApproval);
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Trả về kết quả từ hàm.
      return false;
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
    [verificationForms],
// [VI] Thực thi một bước trong luồng xử lý.
  );

// [VI] Khai báo biến/hằng số.
  const allVerificationStepsComplete = useCallback(
// [VI] Khai báo hàm/biểu thức hàm.
    (id: string | null): boolean => {
// [VI] Rẽ nhánh điều kiện (if).
      if (!id) return false;
// [VI] Trả về kết quả từ hàm.
      return validateStep(id, 1) && validateStep(id, 2) && validateStep(id, 3);
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
    [validateStep],
// [VI] Thực thi một bước trong luồng xử lý.
  );

// [VI] Khai báo biến/hằng số.
  const getCurrentVerificationStep = useCallback(
// [VI] Khai báo hàm/biểu thức hàm.
    (id: string | null): number => {
// [VI] Rẽ nhánh điều kiện (if).
      if (!id) return 1;
// [VI] Khai báo biến/hằng số.
      const item = allItems.find((it) => it.id === id);
// [VI] Trả về kết quả từ hàm.
      return verificationStep[id] || item?.moderation?.verificationStep || 1;
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
    [allItems, verificationStep],
// [VI] Thực thi một bước trong luồng xử lý.
  );

// [VI] Khai báo biến/hằng số.
  const prevVerificationStep = useCallback(
// [VI] Khai báo hàm/biểu thức hàm.
    async (id?: string) => {
// [VI] Rẽ nhánh điều kiện (if).
      if (!id || !userId) return;
// [VI] Khai báo biến/hằng số.
      const currentStep = getCurrentVerificationStep(id);
// [VI] Rẽ nhánh điều kiện (if).
      if (currentStep <= 1) return;

// [VI] Khai báo biến/hằng số.
      const prevStep = currentStep - 1;
// [VI] Khai báo hàm/biểu thức hàm.
      setVerificationStep((prev) => ({ ...prev, [id]: prevStep }));

// [VI] Khai báo biến/hằng số.
      const it = allItems.find((x) => x.id === id);
// [VI] Rẽ nhánh điều kiện (if).
      if (it?.moderation?.claimedBy !== userId) return;
// [VI] Khai báo biến/hằng số.
      const currentFormData = verificationForms[id] || {};
// [VI] Khai báo biến/hằng số.
      const verificationData = {
// [VI] Thực thi một bước trong luồng xử lý.
        ...(it.moderation?.verificationData || {}),
// [VI] Thực thi một bước trong luồng xử lý.
        ...currentFormData,
// [VI] Thực thi một bước trong luồng xử lý.
      } as ModerationVerificationData;
// [VI] Khai báo biến/hằng số.
      const ok = await expertWorkflowService.updateVerificationStep(id, {
// [VI] Thực thi một bước trong luồng xử lý.
        verificationStep: prevStep,
// [VI] Thực thi một bước trong luồng xử lý.
        verificationData,
// [VI] Thực thi một bước trong luồng xử lý.
      });
// [VI] Rẽ nhánh điều kiện (if).
      if (ok) await load();
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
    [allItems, getCurrentVerificationStep, load, userId, verificationForms],
// [VI] Thực thi một bước trong luồng xử lý.
  );

// [VI] Khai báo biến/hằng số.
  const nextVerificationStep = useCallback(
// [VI] Khai báo hàm/biểu thức hàm.
    async (id?: string) => {
// [VI] Rẽ nhánh điều kiện (if).
      if (!id || !userId) return;
// [VI] Khai báo biến/hằng số.
      const currentStep = getCurrentVerificationStep(id);

// [VI] Rẽ nhánh điều kiện (if).
      if (currentStep < 3) {
// [VI] Khai báo biến/hằng số.
        const nextStep = currentStep + 1;
// [VI] Khai báo hàm/biểu thức hàm.
        setVerificationStep((prev) => ({ ...prev, [id]: nextStep }));

// [VI] Khai báo biến/hằng số.
        const it = allItems.find((x) => x.id === id);
// [VI] Rẽ nhánh điều kiện (if).
        if (it?.moderation?.claimedBy !== userId) return;
// [VI] Khai báo biến/hằng số.
        const currentFormData = verificationForms[id] || {};
// [VI] Khai báo biến/hằng số.
        const verificationData = {
// [VI] Thực thi một bước trong luồng xử lý.
          ...(it.moderation?.verificationData || {}),
// [VI] Thực thi một bước trong luồng xử lý.
          ...currentFormData,
// [VI] Thực thi một bước trong luồng xử lý.
        } as ModerationVerificationData;
// [VI] Khai báo biến/hằng số.
        const ok = await expertWorkflowService.updateVerificationStep(id, {
// [VI] Thực thi một bước trong luồng xử lý.
          verificationStep: nextStep,
// [VI] Thực thi một bước trong luồng xử lý.
          verificationData,
// [VI] Thực thi một bước trong luồng xử lý.
        });
// [VI] Rẽ nhánh điều kiện (if).
        if (ok) await load();
// [VI] Thực thi một bước trong luồng xử lý.
        return;
// [VI] Thực thi một bước trong luồng xử lý.
      }

// [VI] Rẽ nhánh điều kiện (if).
      if (!validateStep(id, currentStep)) {
// [VI] Thực thi một bước trong luồng xử lý.
        uiToast.warning(
// [VI] Thực thi một bước trong luồng xử lý.
          resolveCatalogMessage('moderation.wizard.step_incomplete', { step: currentStep }),
// [VI] Thực thi một bước trong luồng xử lý.
        );
// [VI] Thực thi một bước trong luồng xử lý.
        return;
// [VI] Thực thi một bước trong luồng xử lý.
      }
// [VI] Thực thi một bước trong luồng xử lý.
      uiToast.info('moderation.wizard.ready_for_approve');
// [VI] Thực thi một bước trong luồng xử lý.
      onRequireApproveConfirm(id);
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
    [
// [VI] Thực thi một bước trong luồng xử lý.
      allItems,
// [VI] Thực thi một bước trong luồng xử lý.
      getCurrentVerificationStep,
// [VI] Thực thi một bước trong luồng xử lý.
      load,
// [VI] Thực thi một bước trong luồng xử lý.
      onRequireApproveConfirm,
// [VI] Thực thi một bước trong luồng xử lý.
      userId,
// [VI] Thực thi một bước trong luồng xử lý.
      validateStep,
// [VI] Thực thi một bước trong luồng xử lý.
      verificationForms,
// [VI] Thực thi một bước trong luồng xử lý.
    ],
// [VI] Thực thi một bước trong luồng xử lý.
  );

// [VI] Khai báo biến/hằng số.
  const updateVerificationForm = useCallback(
// [VI] Khai báo hàm/biểu thức hàm.
    (id: string | null, step: number, field: string, value: boolean | string) => {
// [VI] Rẽ nhánh điều kiện (if).
      if (!id) return;
// [VI] Khai báo hàm/biểu thức hàm.
      setVerificationForms((prev) => {
// [VI] Khai báo biến/hằng số.
        const current = prev[id] || {};
// [VI] Khai báo biến/hằng số.
        const stepData = current[`step${step}` as keyof ModerationVerificationData] || {};
// [VI] Trả về kết quả từ hàm.
        return {
// [VI] Thực thi một bước trong luồng xử lý.
          ...prev,
// [VI] Thực thi một bước trong luồng xử lý.
          [id]: {
// [VI] Thực thi một bước trong luồng xử lý.
            ...current,
// [VI] Thực thi một bước trong luồng xử lý.
            [`step${step}`]: {
// [VI] Thực thi một bước trong luồng xử lý.
              ...stepData,
// [VI] Thực thi một bước trong luồng xử lý.
              [field]: value,
// [VI] Thực thi một bước trong luồng xử lý.
              completedAt: new Date().toISOString(),
// [VI] Thực thi một bước trong luồng xử lý.
            },
// [VI] Thực thi một bước trong luồng xử lý.
          },
// [VI] Thực thi một bước trong luồng xử lý.
        };
// [VI] Thực thi một bước trong luồng xử lý.
      });
// [VI] Thực thi một bước trong luồng xử lý.
    },
// [VI] Thực thi một bước trong luồng xử lý.
    [],
// [VI] Thực thi một bước trong luồng xử lý.
  );

// [VI] Trả về kết quả từ hàm.
  return {
// [VI] Thực thi một bước trong luồng xử lý.
    verificationStep,
// [VI] Thực thi một bước trong luồng xử lý.
    setVerificationStep,
// [VI] Thực thi một bước trong luồng xử lý.
    verificationForms,
// [VI] Thực thi một bước trong luồng xử lý.
    setVerificationForms,
// [VI] Thực thi một bước trong luồng xử lý.
    primeClaimState,
// [VI] Thực thi một bước trong luồng xử lý.
    validateStep,
// [VI] Thực thi một bước trong luồng xử lý.
    allVerificationStepsComplete,
// [VI] Thực thi một bước trong luồng xử lý.
    getCurrentVerificationStep,
// [VI] Thực thi một bước trong luồng xử lý.
    prevVerificationStep,
// [VI] Thực thi một bước trong luồng xử lý.
    nextVerificationStep,
// [VI] Thực thi một bước trong luồng xử lý.
    updateVerificationForm,
// [VI] Thực thi một bước trong luồng xử lý.
  };
// [VI] Thực thi một bước trong luồng xử lý.
}
