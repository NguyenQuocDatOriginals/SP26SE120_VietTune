import { clsx } from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div
      className={clsx("flex items-center justify-center gap-2", className)}
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm font-medium rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm hover:shadow-md"
      >
        <ChevronLeft className="h-4 w-4" />
        Trước
      </button>

      {getPageNumbers().map((page, index) => {
        const getButtonClass = () => {
          if (page === "...") {
            return "cursor-default bg-transparent text-neutral-400";
          }
          if (page === currentPage) {
            return "bg-primary-600 text-white border border-primary-600 shadow-md";
          }
          return "bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 shadow-sm hover:shadow-md";
        };

        return (
          <button
            key={index}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..."}
            className={clsx(
              "min-w-[40px] px-3 py-2 text-sm font-medium rounded-lg transition-colors",
              getButtonClass()
            )}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm font-medium rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shadow-sm hover:shadow-md"
      >
        Sau
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
