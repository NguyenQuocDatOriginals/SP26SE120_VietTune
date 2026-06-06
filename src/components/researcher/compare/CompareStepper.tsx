import { Check } from 'lucide-react';

import type { CompareWizardStep } from '@/features/researcher/researcherPortalTypes';

const STEPS: { step: CompareWizardStep; label: string }[] = [
  { step: 1, label: 'Bộ lọc' },
  { step: 2, label: 'Chọn bản' },
  { step: 3, label: 'So sánh' },
];

export interface CompareStepperProps {
  currentStep: CompareWizardStep;
  onStepClick: (step: CompareWizardStep) => void;
}

export default function CompareStepper({ currentStep, onStepClick }: CompareStepperProps) {
  return (
    <nav aria-label="Tiến trình so sánh" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 sm:gap-4">
        {STEPS.map(({ step, label }, idx) => {
          const isDone = step < currentStep;
          const isCurrent = step === currentStep;
          const canClick = isDone;

          return (
            <li key={step} className="flex items-center gap-2 sm:gap-4">
              {idx > 0 && (
                <span
                  className={`hidden sm:block w-8 h-px ${isDone || isCurrent ? 'bg-primary-400' : 'bg-neutral-200'}`}
                  aria-hidden
                />
              )}
              <button
                type="button"
                onClick={() => canClick && onStepClick(step)}
                disabled={!canClick}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                  isCurrent
                    ? 'bg-primary-100 text-primary-800 ring-2 ring-primary-300'
                    : isDone
                      ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 cursor-pointer'
                      : 'bg-neutral-100 text-neutral-400 cursor-default'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                    isCurrent
                      ? 'bg-primary-600 text-white'
                      : isDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-neutral-300 text-neutral-600'
                  }`}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : step}
                </span>
                <span>{label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
