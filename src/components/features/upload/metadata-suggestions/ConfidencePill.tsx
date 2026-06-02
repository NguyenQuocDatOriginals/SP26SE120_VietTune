type ConfidencePillProps = {
  confidence?: number | null;
  className?: string;
};

function toPercent(confidence: number): number {
  const value = confidence <= 1 ? confidence * 100 : confidence;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export default function ConfidencePill({ confidence, className = '' }: ConfidencePillProps) {
  if (confidence == null || !Number.isFinite(confidence)) {
    return null;
  }

  const percent = toPercent(confidence);

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border border-neutral-200/90 bg-neutral-50 px-1.5 py-px text-[11px] font-semibold tabular-nums leading-tight text-neutral-700 ${className}`.trim()}
      aria-label={`Độ tin cậy ${percent} phần trăm`}
    >
      {percent}%
    </span>
  );
}
