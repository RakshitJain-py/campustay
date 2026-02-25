"use client";

import { useSearchParams } from "next/navigation";
import { useRouterWithLoading } from "@/hooks/useRouterWithLoading";

interface PaginationProps {
  totalPages: number;
}

export default function Pagination({ totalPages }: PaginationProps) {
  const router = useRouterWithLoading();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams?.get("page") || "1");

  const safeCurrent = Math.max(1, Math.min(currentPage || 1, totalPages || 1));
  const safeTotal = Math.max(1, totalPages);

  const pages: number[] = [];
  const half = 1;
  for (let i = Math.max(1, safeCurrent - half); i <= Math.min(safeTotal, safeCurrent + half); i++) {
    pages.push(i);
  }

  const handleClick = (page: number) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
    // Smooth scroll to top of results container ideally, but window top works
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (safeTotal <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-2 py-8" aria-label="Pagination">
      <button
        type="button"
        onClick={() => handleClick(1)}
        disabled={safeCurrent <= 1}
        className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        aria-label="First page"
      >
        &laquo;
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => handleClick(p)}
          className={`rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${p === safeCurrent
            ? "bg-violet-600 text-white border-violet-600"
            : "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        onClick={() => handleClick(safeTotal)}
        disabled={safeCurrent >= safeTotal}
        className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        aria-label="Last page"
      >
        &raquo;
      </button>
    </nav>
  );
}
