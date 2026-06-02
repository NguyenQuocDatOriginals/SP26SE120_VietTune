import { AlertCircle, Check, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, Ref } from 'react';
import { createPortal } from 'react-dom';

import AudioPlayer from '@/components/features/AudioPlayer';
import VideoPlayer from '@/components/features/VideoPlayer';
import { EXPERT_API_PHASE2 } from '@/config/expertWorkflowPhase';
import { MODERATION_EXPERT_TEXTAREA_MAX_LENGTH } from '@/config/validationConstants';
import { VERIFICATION_STEPS } from '@/features/moderation/constants/verificationStepDefinitions';
import {
  getMissingStep2FieldKeys,
  getMissingStep2Fields,
} from '@/features/moderation/hooks/useModerationWizard';
import { ModerationInstrumentCatalogSelect } from '@/components/features/moderation/ModerationInstrumentCatalogSelect';
import type { LocalRecordingMini } from '@/features/moderation/types/localRecordingQueue.types';
import { buildRecordingForModerationWizard } from '@/features/moderation/utils/buildRecordingForModerationWizard';
import { resolveCulturalContextForDisplay } from '@/features/moderation/utils/resolveReferenceDisplayStrings';
import { reportError, toReportableError } from '@/services/errorReporting';
import type { ModerationVerificationData } from '@/services/expertWorkflowService';
import { referenceDataService, type InstrumentItem } from '@/services/referenceDataService';
import { detectCrossCaseWarning } from '@/utils/crossCaseInstrumentWarning';
import { isYouTubeUrl } from '@/utils/youtube';

function culturalContextDepsKey(ctx: LocalRecordingMini['culturalContext']): string {
  if (!ctx) return '';
  return [
    ctx.ethnicity ?? '',
    ctx.eventType ?? '',
    ctx.region ?? '',
    ctx.province ?? '',
    ctx.performanceType ?? '',
    (ctx.instruments ?? []).join('|'),
  ].join('\u0001');
}

function normalizeInstrumentDisplayKey(name: string): string {
  return name.trim().toLowerCase();
}

const overlayBackdropStyle: CSSProperties = {
  animation: 'fadeIn 0.3s ease-out',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100vw',
  height: '100vh',
  position: 'fixed',
};

function WizardMediaBlock({
  item,
  culturalContextForDisplay,
}: {
  item: LocalRecordingMini;
  /** Resolved UUID→tên; khi có thì tag + Recording khớp chi tiết submission. */
  culturalContextForDisplay?: LocalRecordingMini['culturalContext'];
}) {
  let mediaSrc: string | undefined;
  let isVideo = false;

  const trimStr = (s: string | null | undefined) => {
    const t = typeof s === 'string' ? s.trim() : '';
    return t.length > 0 ? t : undefined;
  };

  /** Phase 2 queue: URL từ API nằm ở `audioUrl` / `videoData`; bản cục bộ có thể dùng `audioData` (data URL). */
  const videoSrc = trimStr(item.videoData ?? undefined);
  const audioSrc = trimStr(item.audioUrl ?? undefined) ?? trimStr(item.audioData ?? undefined);

  if (item.mediaType === 'youtube' && item.youtubeUrl && item.youtubeUrl.trim()) {
    mediaSrc = item.youtubeUrl.trim();
    isVideo = true;
  } else if (
    item.youtubeUrl &&
    typeof item.youtubeUrl === 'string' &&
    item.youtubeUrl.trim() &&
    isYouTubeUrl(item.youtubeUrl)
  ) {
    mediaSrc = item.youtubeUrl.trim();
    isVideo = true;
  } else if (item.mediaType === 'video' && videoSrc) {
    mediaSrc = videoSrc;
    isVideo = true;
  } else if (item.mediaType === 'audio' && audioSrc) {
    mediaSrc = audioSrc;
    isVideo = false;
  } else if (videoSrc) {
    mediaSrc = videoSrc;
    isVideo = true;
  } else if (audioSrc) {
    mediaSrc = audioSrc;
    isVideo = mediaSrc.startsWith('data:video/');
  }

  if (!mediaSrc || mediaSrc.trim().length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-neutral-500">Không có bản thu nào để phát</p>
        <p className="text-xs text-neutral-400">
          MediaType: {item.mediaType || 'Không xác định'} | YouTube: {item.youtubeUrl ? 'Có' : 'Không'}{' '}
          | Video: {item.videoData ? `Có (${item.videoData.length} ký tự)` : 'Không'} | Audio URL:{' '}
          {item.audioUrl ? `Có (${item.audioUrl.length} ký tự)` : 'Không'} | AudioData:{' '}
          {item.audioData ? `Có (${item.audioData.length} ký tự)` : 'Không'}
        </p>
        {item.mediaType === 'video' && !item.videoData && (
          <p className="text-xs text-red-400 mt-2">
            Lưu ý: Video cần có đường dẫn (videoData) để phát. Nếu lỗi kéo dài, liên hệ quản trị.
          </p>
        )}
      </div>
    );
  }

  const convertedRecording = buildRecordingForModerationWizard(item, {
    culturalContext: culturalContextForDisplay ?? item.culturalContext,
  });
  if (isVideo) {
    return (
      <VideoPlayer
        src={mediaSrc}
        title={item.basicInfo?.title || item.title}
        artist={item.basicInfo?.artist}
        recording={convertedRecording}
        showContainer={true}
      />
    );
  }
  return (
    <AudioPlayer
      src={mediaSrc}
      title={item.basicInfo?.title || item.title}
      artist={item.basicInfo?.artist}
      recording={convertedRecording}
      showContainer={true}
    />
  );
}

export function ModerationVerificationWizardDialog({
  submissionId,
  item,
  panelRef,
  expertReviewNotesDraft,
  onExpertReviewNotesChange,
  formSlice,
  currentStep,
  onClose,
  onOpenReject,
  onPrevStep,
  onNextStep,
  onCompleteFinalStep,
  isCurrentStepValid,
  allStepsComplete,
  onUpdateVerificationForm,
}: {
  submissionId: string;
  item: LocalRecordingMini;
  panelRef: Ref<HTMLDivElement>;
  expertReviewNotesDraft: string;
  onExpertReviewNotesChange: (text: string) => void;
  formSlice: ModerationVerificationData | undefined;
  currentStep: number;
  onClose: () => void;
  onOpenReject: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  onCompleteFinalStep: () => void;
  isCurrentStepValid: boolean;
  allStepsComplete: boolean;
  onUpdateVerificationForm: (step: number, field: string, value: unknown) => void;
}) {
  const stepDef = VERIFICATION_STEPS[(currentStep === 2 || currentStep === 3 ? currentStep : 1) - 1];

  const [resolvedCulturalContext, setResolvedCulturalContext] = useState<
    LocalRecordingMini['culturalContext'] | null
  >(null);
  const culturalContextKey = culturalContextDepsKey(item.culturalContext);
  const itemRef = useRef(item);
  itemRef.current = item;
  useEffect(() => {
    const ctx = itemRef.current.culturalContext;
    setResolvedCulturalContext(null);
    if (!ctx) return;
    let cancelled = false;
    void resolveCulturalContextForDisplay(ctx)
      .then((next) => {
        if (!cancelled && next) setResolvedCulturalContext(next);
      })
      .catch((err) => {
        reportError(toReportableError(err, 'resolveCulturalContextForDisplay failed'), undefined, {
          region: 'moderation',
          stage: 'verification_wizard',
        });
      });
    return () => {
      cancelled = true;
    };
  }, [culturalContextKey, item.id]);
  const step1CulturalContext =
    item.culturalContext != null ? (resolvedCulturalContext ?? item.culturalContext) : undefined;
  const [newInstrumentOverride, setNewInstrumentOverride] = useState('');
  const [instrumentAddError, setInstrumentAddError] = useState<string | null>(null);
  const [instrumentsCatalog, setInstrumentsCatalog] = useState<InstrumentItem[]>([]);
  const [instrumentsLoading, setInstrumentsLoading] = useState(false);

  useEffect(() => {
    if (currentStep !== 2) return;
    let cancelled = false;
    setInstrumentsLoading(true);
    void referenceDataService
      .getInstruments()
      .then((items) => {
        if (!cancelled) setInstrumentsCatalog(Array.isArray(items) ? items : []);
      })
      .catch(() => {
        if (!cancelled) setInstrumentsCatalog([]);
      })
      .finally(() => {
        if (!cancelled) setInstrumentsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentStep]);

  const instrumentCatalogByNormName = useMemo(() => {
    const map = new Map<string, InstrumentItem>();
    for (const inst of instrumentsCatalog) {
      const k = normalizeInstrumentDisplayKey(inst.name);
      if (k && !map.has(k)) map.set(k, inst);
    }
    return map;
  }, [instrumentsCatalog]);

  const catalogMatchForDisplayName = (displayName: string) =>
    instrumentCatalogByNormName.get(normalizeInstrumentDisplayKey(displayName));

  const step2Overrides = (formSlice?.step2?.instrumentOverrides ?? {}) as Record<
    string,
    'confirmed' | 'rejected' | 'added'
  >;
  const listedInstruments = Array.from(new Set(step1CulturalContext?.instruments ?? []));
  const crossCase = detectCrossCaseWarning({
    instruments: step1CulturalContext?.instruments ?? [],
    songSignals: [
      item.basicInfo?.genre ?? '',
      step1CulturalContext?.performanceType ?? '',
      step1CulturalContext?.eventType ?? '',
    ],
  });
  const step2DeclaredInstruments = step1CulturalContext?.instruments ?? [];
  const step2MissingFieldKeys =
    currentStep === 2
      ? getMissingStep2FieldKeys(formSlice?.step2, step2DeclaredInstruments)
      : [];
  const step2MissingFields =
    currentStep === 2 ? getMissingStep2Fields(formSlice?.step2, step2DeclaredInstruments) : [];

  const WIZARD_STEP_LABELS = ['Kiểm tra sơ bộ', 'Xác minh chuyên môn', 'Phê duyệt'] as const;

  const instrumentExcludeNames = useMemo(() => {
    const names = new Set<string>();
    for (const n of listedInstruments) names.add(n);
    for (const n of Object.keys(step2Overrides)) names.add(n);
    return Array.from(names);
  }, [listedInstruments, step2Overrides]);

  const tryAddInstrumentOverride = () => {
    const name = newInstrumentOverride.trim();
    if (!name) {
      setInstrumentAddError(null);
      return;
    }
    const norm = normalizeInstrumentDisplayKey(name);
    const isDuplicate =
      listedInstruments.some((n) => normalizeInstrumentDisplayKey(n) === norm) ||
      Object.keys(step2Overrides).some((n) => normalizeInstrumentDisplayKey(n) === norm);
    if (isDuplicate) {
      setInstrumentAddError('Nhạc cụ này đã có trong danh sách khai báo hoặc đã được thêm.');
      return;
    }
    setInstrumentAddError(null);
    onUpdateVerificationForm(2, 'instrumentOverrides', {
      ...step2Overrides,
      [name]: 'added',
    });
    setNewInstrumentOverride('');
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto"
      onClick={onClose}
      role="presentation"
      style={overlayBackdropStyle}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="verification-dialog-title"
        aria-describedby={`verification-step-description-${currentStep}`}
        tabIndex={-1}
        className="rounded-2xl border border-neutral-300/80 bg-surface-panel shadow-2xl backdrop-blur-sm max-w-5xl w-full overflow-hidden flex flex-col min-h-0 transition-all duration-300 pointer-events-auto transform mt-8 outline-none focus:outline-none"
        style={{
          animation: 'slideUp 0.3s ease-out',
          maxHeight: 'calc(100vh - 4rem)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-neutral-200/80 bg-gradient-to-br from-primary-600 to-primary-700">
          <h2 id="verification-dialog-title" className="text-2xl font-bold text-white">
            {stepDef.wizardTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-primary-500/50 transition-colors duration-200 text-white hover:text-white cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-600"
            aria-label="Đóng hộp thoại kiểm duyệt"
          >
            <X className="h-5 w-5" strokeWidth={2.5} aria-hidden />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-6 overscroll-contain">
          <div className="space-y-6">
            <div
              className="rounded-2xl border border-neutral-200/80 shadow-md p-4 sm:p-5 bg-surface-panel"
            >
              <label
                htmlFor={`expert-review-notes-dialog-${submissionId}`}
                className="block text-sm font-semibold text-neutral-900 mb-1"
              >
                Ghi chú chuyên gia
              </label>
              <p
                id={`expert-review-notes-dialog-hint-${submissionId}`}
                className="text-xs text-neutral-600 mb-3 leading-relaxed"
              >
                {EXPERT_API_PHASE2
                  ? 'Nháp lưu trên trình duyệt; sau khi máy chủ ghi nhận phê duyệt/từ chối, nội dung được gửi kèm nhật ký kiểm tra (AuditLog).'
                  : 'Lưu cục bộ theo từng bản thu (localStorage). Sẽ gộp với ghi chú ở bước xác nhận khi bạn phê duyệt hoặc từ chối.'}
              </p>
              <textarea
                id={`expert-review-notes-dialog-${submissionId}`}
                value={expertReviewNotesDraft}
                onChange={(e) => onExpertReviewNotesChange(e.target.value)}
                rows={4}
                maxLength={MODERATION_EXPERT_TEXTAREA_MAX_LENGTH}
                placeholder="Theo dõi ngữ cảnh, nguồn tham chiếu, cảnh báo cho admin…"
                aria-describedby={`expert-review-notes-dialog-hint-${submissionId}`}
                className="w-full rounded-xl border border-neutral-200/90 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus:border-primary-400/60 resize-y min-h-[96px]"
              />
            </div>

            <div
              className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-xl bg-surface-panel"
              role="region"
              aria-labelledby={`verification-media-heading-${submissionId}`}
            >
              <h3
                className="text-lg font-semibold text-neutral-900 mb-4"
                id={`verification-media-heading-${submissionId}`}
              >
                Bản thu
              </h3>
              <WizardMediaBlock
                item={item}
                culturalContextForDisplay={step1CulturalContext ?? item.culturalContext}
              />
            </div>

            <div
              className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-xl bg-surface-panel"
            >
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Thông tin cơ bản</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Tiêu đề:</strong> {item.basicInfo?.title || item.title || 'Không có'}
                </div>
                {item.basicInfo?.artist && (
                  <div>
                    <strong>Nghệ sĩ:</strong> {item.basicInfo.artist}
                  </div>
                )}
                {item.basicInfo?.composer && (
                  <div>
                    <strong>Tác giả/Nhạc sĩ:</strong> {item.basicInfo.composer}
                  </div>
                )}
                {item.basicInfo?.language && (
                  <div>
                    <strong>Ngôn ngữ:</strong> {item.basicInfo.language}
                  </div>
                )}
                {item.basicInfo?.genre && (
                  <div>
                    <strong>Thể loại:</strong> {item.basicInfo.genre}
                  </div>
                )}
                {item.basicInfo?.recordingDate && (
                  <div>
                    <strong>Ngày thu:</strong> {item.basicInfo.recordingDate}
                    {item.basicInfo.dateEstimated && (
                      <span className="text-neutral-500"> (Ước tính)</span>
                    )}
                  </div>
                )}
                {item.basicInfo?.dateNote && (
                  <div>
                    <strong>Ghi chú ngày:</strong> {item.basicInfo.dateNote}
                  </div>
                )}
                {item.basicInfo?.recordingLocation && (
                  <div>
                    <strong>Địa điểm thu:</strong> {item.basicInfo.recordingLocation}
                  </div>
                )}
              </div>
            </div>

            {step1CulturalContext && (
              <div
                className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-xl bg-surface-panel"
              >
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Bối cảnh văn hóa</h3>
                <div className="space-y-2 text-sm">
                  {step1CulturalContext.ethnicity && (
                    <div>
                      <strong>Dân tộc:</strong> {step1CulturalContext.ethnicity}
                    </div>
                  )}
                  {step1CulturalContext.region && (
                    <div>
                      <strong>Vùng:</strong> {step1CulturalContext.region}
                    </div>
                  )}
                  {step1CulturalContext.province && (
                    <div>
                      <strong>Tỉnh/Thành phố:</strong> {step1CulturalContext.province}
                    </div>
                  )}
                  {step1CulturalContext.eventType && (
                    <div>
                      <strong>Loại sự kiện:</strong> {step1CulturalContext.eventType}
                    </div>
                  )}
                  {step1CulturalContext.performanceType && (
                    <div>
                      <strong>Loại biểu diễn:</strong> {step1CulturalContext.performanceType}
                    </div>
                  )}
                  {step1CulturalContext.instruments &&
                    step1CulturalContext.instruments.length > 0 && (
                      <div>
                        <strong>Nhạc cụ:</strong> {step1CulturalContext.instruments.join(', ')}
                      </div>
                    )}
                </div>
              </div>
            )}

            {item.additionalNotes && (
              <div
                className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-xl bg-surface-panel"
              >
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Ghi chú bổ sung</h3>
                <div className="space-y-2 text-sm">
                  {item.additionalNotes.description && (
                    <div>
                      <strong>Mô tả:</strong>
                      <p className="text-neutral-700 mt-1 whitespace-pre-wrap">
                        {item.additionalNotes.description}
                      </p>
                    </div>
                  )}
                  {item.additionalNotes.fieldNotes && (
                    <div>
                      <strong>Ghi chú thực địa:</strong>
                      <p className="text-neutral-700 mt-1 whitespace-pre-wrap">
                        {item.additionalNotes.fieldNotes}
                      </p>
                    </div>
                  )}
                  {item.additionalNotes.transcription && (
                    <div>
                      <strong>Phiên âm:</strong>
                      <p className="text-neutral-700 mt-1 whitespace-pre-wrap">
                        {item.additionalNotes.transcription}
                      </p>
                    </div>
                  )}
                  {item.additionalNotes.hasLyricsFile && (
                    <div>
                      <strong>Có file lời bài hát:</strong> Có
                    </div>
                  )}
                </div>
              </div>
            )}

            {item.adminInfo && (
              <div
                className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-xl bg-surface-panel"
              >
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Thông tin quản trị</h3>
                <div className="space-y-2 text-sm">
                  {item.adminInfo.collector && (
                    <div>
                      <strong>Người thu thập:</strong> {item.adminInfo.collector}
                    </div>
                  )}
                  {item.adminInfo.copyright && (
                    <div>
                      <strong>Bản quyền:</strong> {item.adminInfo.copyright}
                    </div>
                  )}
                  {item.adminInfo.archiveOrg && (
                    <div>
                      <strong>Archive.org:</strong> {item.adminInfo.archiveOrg}
                    </div>
                  )}
                  {item.adminInfo.catalogId && (
                    <div>
                      <strong>Mã catalog:</strong> {item.adminInfo.catalogId}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div
              className="rounded-2xl border border-neutral-200/80 shadow-lg backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-xl bg-surface-panel"
              role="region"
              aria-labelledby={`verification-step-heading-${currentStep}`}
            >
              <div className="mb-4">
                <h3
                  id={`verification-step-heading-${currentStep}`}
                  className="text-base font-semibold text-neutral-900 mb-2"
                >
                  {stepDef.wizardTitle}
                </h3>
                <p
                  id={`verification-step-description-${currentStep}`}
                  className="text-neutral-700 mb-4"
                >
                  {stepDef.description}
                </p>
                <ol
                  className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-2"
                  aria-label={`Tiến độ kiểm duyệt: bước ${currentStep} trong 3`}
                >
                  {[1, 2, 3].map((step) => {
                    const isCompleted = step < currentStep;
                    const isActive = step === currentStep;
                    const isUpcoming = step > currentStep;
                    return (
                      <li
                        key={step}
                        className={`flex flex-1 items-start gap-2 rounded-xl border px-3 py-2.5 transition-colors ${
                          isActive
                            ? 'border-primary-500/80 bg-primary-50 shadow-sm'
                            : isCompleted
                              ? 'border-emerald-200/90 bg-emerald-50/60'
                              : 'border-neutral-200/90 bg-neutral-50/80'
                        }`}
                        aria-current={isActive ? 'step' : undefined}
                      >
                        <span
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            isActive
                              ? 'bg-primary-600 text-white'
                              : isCompleted
                                ? 'bg-emerald-600 text-white'
                                : 'bg-neutral-200 text-neutral-600'
                          }`}
                          aria-hidden
                        >
                          {isCompleted ? <Check className="h-4 w-4" strokeWidth={2.5} /> : step}
                        </span>
                        <div className="min-w-0">
                          <p
                            className={`text-xs font-semibold leading-tight ${
                              isActive
                                ? 'text-primary-800'
                                : isCompleted
                                  ? 'text-emerald-800'
                                  : 'text-neutral-500'
                            }`}
                          >
                            Bước {step}
                          </p>
                          <p
                            className={`text-sm leading-snug ${
                              isActive
                                ? 'font-bold text-primary-900'
                                : isUpcoming
                                  ? 'text-neutral-500'
                                  : 'font-medium text-emerald-900'
                            }`}
                          >
                            {WIZARD_STEP_LABELS[step - 1]}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
                {!isCurrentStepValid && (
                  <div
                    className="mb-4 rounded-lg border border-red-200/90 bg-red-50/90 px-3 py-3"
                    role="alert"
                  >
                    {currentStep === 2 && step2MissingFields.length > 0 ? (
                      <>
                        <p className="text-sm font-medium text-red-800">
                          Bạn cần đánh dấu đủ các tiêu chí bắt buộc trước khi tiếp tục:
                        </p>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
                          {step2MissingFields.map((field) => (
                            <li key={field}>{field}</li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p className="text-sm font-medium text-red-800">
                        Vui lòng hoàn thành tất cả các yêu cầu bắt buộc
                      </p>
                    )}
                  </div>
                )}
              </div>

              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-neutral-800 mb-3">
                    {VERIFICATION_STEPS[0].sectionTitle}{' '}
                    <span className="text-sm text-neutral-500">(Bắt buộc)</span>
                  </h3>
                  <div className="space-y-3">
                    {VERIFICATION_STEPS[0].fields.map((field) => (
                      <div key={field.key} className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          aria-label={field.label}
                          checked={!!(formSlice?.step1 as Record<string, unknown> | undefined)?.[field.key]}
                          onChange={(e) => onUpdateVerificationForm(1, field.key, e.target.checked)}
                          className="mt-1 h-5 w-5 flex-shrink-0 rounded border-neutral-300 accent-primary-600 hover:accent-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 cursor-pointer"
                        />
                        <span className="text-neutral-700">{field.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  {crossCase.warning && (
                    <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2">
                      <p className="flex items-start gap-2 text-xs text-amber-800">
                        <AlertCircle className="mt-0.5 h-4 w-4" />
                        {crossCase.warning}
                      </p>
                    </div>
                  )}
                  <h3 className="font-semibold text-neutral-800 mb-3">
                    {VERIFICATION_STEPS[1].sectionTitle}{' '}
                    <span className="text-sm text-neutral-500">(Bắt buộc)</span>
                  </h3>
                  <div className="space-y-3">
                    {VERIFICATION_STEPS[1].fields.map((field) => {
                      const isMissing = step2MissingFieldKeys.includes(
                        field.key as (typeof step2MissingFieldKeys)[number],
                      );
                      return (
                        <div
                          key={field.key}
                          className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                            isMissing && !isCurrentStepValid
                              ? 'border-amber-300/80 bg-amber-50/50'
                              : 'border-transparent'
                          }`}
                        >
                          <input
                            type="checkbox"
                            aria-label={field.label}
                            checked={
                              !!(formSlice?.step2 as Record<string, unknown> | undefined)?.[field.key]
                            }
                            onChange={(e) =>
                              onUpdateVerificationForm(2, field.key, e.target.checked)
                            }
                            className="mt-1 h-5 w-5 flex-shrink-0 rounded border-neutral-300 accent-primary-600 hover:accent-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 cursor-pointer"
                          />
                          <span
                            className={`text-sm leading-relaxed ${isMissing && !isCurrentStepValid ? 'font-medium text-neutral-900' : 'text-neutral-700'}`}
                          >
                            {field.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="rounded-xl border border-secondary-200/70 bg-gradient-to-br from-surface-panel to-cream-50/50 p-4 shadow-sm">
                    <div className="mb-3 space-y-1">
                      <p className="text-sm font-semibold text-neutral-900">Xác minh nhạc cụ</p>
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        Đối chiếu nhạc cụ khai báo với danh mục hệ thống. Thêm nhạc cụ thiếu bằng cách gõ hoặc
                        chọn gợi ý.
                      </p>
                    </div>
                    {instrumentsLoading && (
                      <p className="mb-2 text-xs font-medium text-neutral-500">Đang tải danh mục nhạc cụ…</p>
                    )}
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Danh sách khai báo
                    </p>
                    {listedInstruments.length > 0 ? (
                      <div className="space-y-2">
                        {listedInstruments.map((instrumentName) => {
                          const status = step2Overrides[instrumentName];
                          const catalogRow = catalogMatchForDisplayName(instrumentName);
                          const descTrimmed = catalogRow?.description?.trim();
                          const subtitle =
                            catalogRow?.category?.trim() ||
                            (descTrimmed && descTrimmed.length > 0
                              ? descTrimmed.length > 120
                                ? `${descTrimmed.slice(0, 120)}…`
                                : descTrimmed
                              : null) ||
                            null;
                          return (
                            <div
                              key={instrumentName}
                              className="flex flex-col gap-3 rounded-xl border border-neutral-200/90 bg-white/90 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-neutral-900">{instrumentName}</p>
                                {subtitle ? (
                                  <p className="mt-0.5 text-xs text-neutral-500 leading-snug">{subtitle}</p>
                                ) : null}
                              </div>
                              <div className="flex shrink-0 flex-wrap gap-2">
                                {(['confirmed', 'rejected'] as const).map((choice) => (
                                  <button
                                    key={choice}
                                    type="button"
                                    onClick={() =>
                                      onUpdateVerificationForm(2, 'instrumentOverrides', {
                                        ...step2Overrides,
                                        [instrumentName]: choice,
                                      })
                                    }
                                    className={`min-h-[40px] rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                                      status === choice
                                        ? choice === 'confirmed'
                                          ? 'bg-emerald-600 text-white shadow-sm'
                                          : 'bg-red-600 text-white shadow-sm'
                                        : 'border border-neutral-200 bg-neutral-50 text-neutral-800 hover:bg-neutral-100'
                                    }`}
                                  >
                                    {choice === 'confirmed' ? 'Xác nhận' : 'Bác bỏ'}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-600">Chưa có nhạc cụ khai báo để xác minh.</p>
                    )}

                    <div className="mt-4 border-t border-neutral-200/80 pt-4 space-y-2">
                      <label
                        htmlFor={`add-instrument-${submissionId}`}
                        className="block text-xs font-semibold text-neutral-800"
                      >
                        Thêm nhạc cụ thiếu
                      </label>
                      <p id={`add-instrument-hint-${submissionId}`} className="text-xs text-neutral-500">
                        Gõ hoặc chọn gợi ý từ danh mục (không bắt buộc trùng chính xác).
                      </p>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                        <div
                          className="min-w-0 flex-1"
                          id={`add-instrument-${submissionId}`}
                          aria-describedby={`add-instrument-hint-${submissionId}`}
                        >
                          <ModerationInstrumentCatalogSelect
                            instruments={instrumentsCatalog}
                            disabled={instrumentsLoading}
                            value={newInstrumentOverride}
                            onChange={(name) => {
                              setNewInstrumentOverride(name);
                              setInstrumentAddError(null);
                            }}
                            excludeNames={instrumentExcludeNames}
                            hasError={Boolean(instrumentAddError)}
                            errorMessage={instrumentAddError ?? undefined}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={tryAddInstrumentOverride}
                          disabled={!newInstrumentOverride.trim()}
                          className="min-h-[44px] shrink-0 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600 disabled:shadow-none"
                        >
                          Thêm nhạc cụ
                        </button>
                      </div>
                    </div>
                    {Object.entries(step2Overrides).some(([, status]) => status === 'added') && (
                      <p className="mt-3 text-xs font-medium text-neutral-600">
                        Đã thêm:{' '}
                        {Object.entries(step2Overrides)
                          .filter(([, status]) => status === 'added')
                          .map(([name]) => name)
                          .join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      {VERIFICATION_STEPS[1].notesLabel}{' '}
                      <span className="text-sm text-neutral-500">(Tùy chọn)</span>
                    </label>
                    <textarea
                      value={formSlice?.step2?.expertNotes || ''}
                      onChange={(e) => onUpdateVerificationForm(2, VERIFICATION_STEPS[1].notesField, e.target.value)}
                      rows={4}
                      maxLength={MODERATION_EXPERT_TEXTAREA_MAX_LENGTH}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus:border-primary-500"
                      placeholder={VERIFICATION_STEPS[1].notesPlaceholder}
                    />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-neutral-800 mb-3">
                    {VERIFICATION_STEPS[2].sectionTitle}{' '}
                    <span className="text-sm text-neutral-500">(Bắt buộc)</span>
                  </h3>
                  <div className="space-y-3">
                    {VERIFICATION_STEPS[2].fields.map((field) => (
                      <div key={field.key} className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          aria-label={field.label}
                          checked={!!(formSlice?.step3 as Record<string, unknown> | undefined)?.[field.key]}
                          onChange={(e) => onUpdateVerificationForm(3, field.key, e.target.checked)}
                          className="mt-1 h-5 w-5 flex-shrink-0 rounded border-neutral-300 accent-primary-600 hover:accent-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 cursor-pointer"
                        />
                        <span className="text-neutral-700">{field.label}</span>
                      </div>
                    ))}

                  </div>
                  <div className="mt-4">
                    <label
                      htmlFor="verification-final-notes"
                      className="block text-sm font-medium text-neutral-700 mb-2"
                    >
                      {VERIFICATION_STEPS[2].notesLabel}{' '}
                      <span className="text-sm text-neutral-500">(Tùy chọn)</span>
                    </label>
                    <textarea
                      id="verification-final-notes"
                      value={formSlice?.step3?.finalNotes || ''}
                      onChange={(e) => onUpdateVerificationForm(3, VERIFICATION_STEPS[2].notesField, e.target.value)}
                      rows={4}
                      maxLength={MODERATION_EXPERT_TEXTAREA_MAX_LENGTH}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus:border-primary-500"
                      placeholder={VERIFICATION_STEPS[2].notesPlaceholder}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-neutral-200 bg-neutral-50/95 p-4 sm:p-6">
          <div className="flex items-center">
            <button
              type="button"
              onClick={onOpenReject}
              aria-label="Từ chối bản thu đang kiểm duyệt"
              className="px-5 py-2.5 rounded-full bg-gradient-to-br from-orange-600 to-orange-700 font-medium text-white shadow-md transition-colors hover:from-orange-500 hover:to-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            >
              Từ chối
            </button>
          </div>
          <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={onPrevStep}
                aria-label={`Quay lại bước ${currentStep - 1}`}
                className="px-5 py-2.5 rounded-full border border-neutral-300/90 bg-white font-medium text-neutral-800 shadow-sm transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                Quay lại (Bước {currentStep - 1})
              </button>
            )}
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={onNextStep}
                disabled={!isCurrentStepValid}
                aria-label={`Chuyển tới bước ${currentStep + 1}`}
                className="px-5 py-2.5 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 font-semibold text-white shadow-md transition-colors hover:from-primary-500 hover:to-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:from-neutral-300 disabled:to-neutral-300 disabled:text-neutral-600 disabled:shadow-none"
              >
                Tiếp tục (Bước {currentStep + 1})
              </button>
            ) : (
              <button
                type="button"
                onClick={onCompleteFinalStep}
                disabled={!allStepsComplete}
                aria-label="Hoàn thành kiểm duyệt và mở xác nhận phê duyệt"
                className="px-5 py-2.5 rounded-full bg-gradient-to-br from-green-600 to-green-700 font-semibold text-white shadow-md transition-colors hover:from-green-500 hover:to-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:from-neutral-300 disabled:to-neutral-300 disabled:text-neutral-600 disabled:shadow-none"
              >
                Hoàn thành kiểm duyệt
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
