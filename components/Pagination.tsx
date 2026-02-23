"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const safeCurrent = Math.max(1, Math.min(currentPage, totalPages || 1));
  const safeTotal = Math.max(1, totalPages);

  const pages: number[] = [];
  const half = 1;
  for (let i = Math.max(1, safeCurrent - half); i <= Math.min(safeTotal, safeCurrent + half); i++) {
    pages.push(i);
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClick = (page: number) => {
    onPageChange(page);
    scrollToTop();
  };

  return (
    <nav className="flex items-center justify-center gap-2 py-8" aria-label="Pagination">
      <button
        type="button"
        onClick={() => handleClick(1)}
        disabled={safeCurrent <= 1}
        className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        aria-label="First page"
      >
        &laquo;
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => handleClick(p)}
          className={`rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
            p === safeCurrent
              ? "bg-violet-600 text-white"
              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        onClick={() => handleClick(safeTotal)}
        disabled={safeCurrent >= safeTotal}
        className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        aria-label="Last page"
      >
        &raquo;
      </button>
    </nav>
  );
}
