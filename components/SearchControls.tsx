"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouterWithLoading } from "@/hooks/useRouterWithLoading";
import FilterDrawer from "./FilterDrawer";

export default function SearchControls() {
    const router = useRouterWithLoading();
    const searchParams = useSearchParams();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const q = searchParams ? searchParams.get("q") || "" : "";
    const verifiedOnly = searchParams?.get("verified") === "true";
    const sortBy = searchParams?.get("sort") || "created_at_desc";
    const minRating = searchParams?.get("min_rating") || "";
    const minPrice = searchParams?.get("min_price") || "";
    const maxPrice = searchParams?.get("max_price") || "";
    const maxDistance = searchParams?.get("max_distance") || "";

    const updateFilters = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams?.toString() || "");
        // Always reset to page 1 on filter change
        params.set("page", "1");

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === "") {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });

        router.push(`/search?${params.toString()}`, { scroll: false });
    };

    return (
        <>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <label className="flex cursor-pointer items-center gap-3">
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={verifiedOnly}
                                onChange={(e) => updateFilters({ verified: e.target.checked ? "true" : null })}
                            />
                            <div className={`block h-6 w-10 rounded-full transition-colors ${verifiedOnly ? 'bg-violet-600' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
                            <div className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${verifiedOnly ? 'translate-x-4' : ''}`}></div>
                        </div>
                        <span className="text-sm font-medium text-foreground">Verified Only</span>
                    </label>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={sortBy}
                        onChange={(e) => updateFilters({ sort: e.target.value })}
                        className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    >
                        <option value="created_at_desc">Newest First</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="rating_desc">Highest Rated</option>
                        <option value="distance_asc">Distance: Closest</option>
                    </select>

                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="flex items-center gap-2 rounded-xl bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filters
                        {(minRating || minPrice || maxPrice || maxDistance) && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] text-white">
                                {[minRating, minPrice, maxPrice, maxDistance].filter(Boolean).length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <FilterDrawer
                open={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                budgetFrom={minPrice}
                budgetTo={maxPrice}
                onBudgetFromChange={(v) => updateFilters({ min_price: v })}
                onBudgetToChange={(v) => updateFilters({ max_price: v })}
                reviewMin={minRating}
                onReviewMinChange={(v) => updateFilters({ min_rating: v })}
                sortValue={sortBy}
                onSortChange={(v) => updateFilters({ sort: v })}
                maxDistance={maxDistance}
                onMaxDistanceChange={(v) => updateFilters({ max_distance: v })}
            />
        </>
    );
}
