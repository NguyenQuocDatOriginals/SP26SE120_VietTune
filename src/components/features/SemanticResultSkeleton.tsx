import { cn } from '@/utils/helpers';

function SkeletonRow({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-2xl border border-secondary-200/50 bg-white/70 p-5 shadow-sm',
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="h-6 w-3/4 max-w-md rounded-lg bg-neutral-200/80" />
          <div className="flex flex-wrap gap-2">
            <div className="h-8 w-28 rounded-xl bg-neutral-200/70" />
            <div className="h-8 w-32 rounded-xl bg-neutral-200/70" />
            <div className="h-8 w-24 rounded-xl bg-neutral-200/70 max-sm:hidden" />
          </div>
        </div>
        <div className="flex gap-2 sm:flex-col sm:w-28">
          <div className="h-10 flex-1 rounded-xl bg-neutral-200/80 sm:flex-none" />
          <div className="h-10 flex-1 rounded-xl bg-neutral-200/60 sm:flex-none" />
        </div>
      </div>
    </div>
  );
}

export type SemanticResultSkeletonProps = {
  rows?: number;
  className?: string;
};

export default function SemanticResultSkeleton({ rows = 4, className }: SemanticResultSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)} aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}
