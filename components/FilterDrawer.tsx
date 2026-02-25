"use client";

import { useEffect } from "react";

const BUDGET_OPTIONS = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 12000, 15000];
const SORT_OPTIONS = [
  { value: "best", label: "Best Matches" },
  { value: "relevant", label: "Most Relevant" },
  { value: "trending", label: "Trending" },
  { value: "new", label: "Newly Added" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "distance_asc", label: "Distance: Closest First" },
  { value: "distance_desc", label: "Distance: Farthest First" },
];

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  budgetFrom: string;
  budgetTo: string;
  onBudgetFromChange: (v: string) => void;
  onBudgetToChange: (v: string) => void;
  reviewMin: string;
  onReviewMinChange: (v: string) => void;
  sortValue: string;
  onSortChange: (v: string) => void;
  maxDistance?: string;
  onMaxDistanceChange?: (v: string) => void;
}

export default function FilterDrawer({
  open,
  onClose,
  budgetFrom,
  budgetTo,
  onBudgetFromChange,
  onBudgetToChange,
  reviewMin,
  onReviewMinChange,
  sortValue,
  onSortChange,
  maxDistance,
  onMaxDistanceChange,
}: FilterDrawerProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const fromNum = budgetFrom ? Number(budgetFrom) : 0;
  const toNum = budgetTo ? Number(budgetTo) : 0;
  const budgetError = budgetFrom && budgetTo && fromNum > toNum;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} aria-hidden />
      <aside
        className="fixed right-0 top-0 z-50 h-full w-[360px] max-w-[90%] overflow-y-auto rounded-l-2xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-6 p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Budget (₹/month)</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <select
                value={budgetFrom}
                onChange={(e) => onBudgetFromChange(e.target.value)}
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-violet-500"
              >
                <option value="">From</option>
                {BUDGET_OPTIONS.map((n) => (
                  <option key={n} value={String(n)}>₹{n}</option>
                ))}
              </select>
              <select
                value={budgetTo}
                onChange={(e) => onBudgetToChange(e.target.value)}
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-violet-500"
              >
                <option value="">To</option>
                {BUDGET_OPTIONS.map((n) => (
                  <option key={n} value={String(n)}>₹{n}</option>
                ))}
              </select>
            </div>
            {budgetError && (
              <p className="mt-1 text-sm text-red-600">From must be less than or equal to To.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Minimum rating</label>
            <select
              value={reviewMin}
              onChange={(e) => onReviewMinChange(e.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-violet-500"
            >
              <option value="">Any</option>
              <option value="5">⭐⭐⭐⭐⭐ & up</option>
              <option value="4">⭐⭐⭐⭐ & up</option>
              <option value="3">⭐⭐⭐ & up</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Distance (km)</label>
            <select
              value={maxDistance || ""}
              onChange={(e) => onMaxDistanceChange && onMaxDistanceChange(e.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-violet-500"
            >
              <option value="">Any distance</option>
              <option value="5">Within 5 km</option>
              <option value="10">Within 10 km</option>
              <option value="20">Within 20 km</option>
              <option value="50">Within 50 km</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sort</label>
            <select
              value={sortValue}
              onChange={(e) => onSortChange(e.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-violet-500"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </aside>
    </>
  );
}
