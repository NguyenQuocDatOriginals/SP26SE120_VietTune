type ConfidencePillProps = {
  confidence?: number | null;
  className?: string;
  variant?: 'neutral' | 'tiered';
};

function toPercent(confidence: number): number {
  const value = confidence <= 1 ? confidence * 100 : confidence;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function tieredClasses(percent: number): string {
  if (percent >= 90) {
    return 'border-emerald-200/90 bg-emerald-50 text-emerald-800';
  }
  if (percent >= 75) {
    return 'border-amber-200/90 bg-amber-50 text-amber-900';
  }
  return 'border-neutral-200/90 bg-neutral-50 text-neutral-700';
}

export default function ConfidencePill({
  confidence,
  className = '',
  variant = 'neutral',
}: ConfidencePillProps) {
  if (confidence == null || !Number.isFinite(confidence)) {
    return null;
  }

  const percent = toPercent(confidence);
  const sizeClass =
    variant === 'tiered' ? 'px-2 py-0.5 text-xs' : 'px-1.5 py-px text-[11px]';
  const toneClass =
    variant === 'tiered' ? tieredClasses(percent) : 'border-neutral-200/90 bg-neutral-50 text-neutral-700';

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border font-semibold tabular-nums leading-tight ${sizeClass} ${toneClass} ${className}`.trim()}
      aria-label={`Độ tin cậy ${percent} phần trăm`}
    >
      {percent}%
    </span>
  );
}
