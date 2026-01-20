import { clsx } from "clsx";

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
      className={clsx("flex items-center justify-center space-x-2", className)}
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-full text-secondary-700 hover:bg-gray-50 hover:border-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Trước
      </button>

      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === "number" && onPageChange(page)}
          disabled={page === "..."}
          className={clsx(
            "px-3 py-2 text-sm font-medium rounded-full transition-all",
            page === currentPage
              ? "bg-primary-600 text-white shadow-md"
              : "bg-white border border-gray-200 text-secondary-700 hover:bg-gray-50 hover:border-primary-200",
            page === "..." && "cursor-default opacity-50"
          )}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-full text-secondary-700 hover:bg-gray-50 hover:border-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Sau
      </button>
    </div>
  );
}
