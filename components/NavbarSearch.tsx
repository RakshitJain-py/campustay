"use client";

import { searchColleges } from "@/lib/colleges";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const DEBOUNCE_MS = 250;

export default function NavbarSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const results = (debouncedQuery.trim().length >= 1
    ? searchColleges(debouncedQuery)
    : []) as string[];

  const showDropdown = open && focused && query.trim().length >= 1;

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("popstate", close);
    return () => window.removeEventListener("popstate", close);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToSearch = useCallback(
    (q: string) => {
      const trimmed = (q || query || "").trim();
      setOpen(false);
      setQuery("");
      setFocused(false);
      if (trimmed) router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    },
    [query, router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      goToSearch(query);
    }
  };

  return (
    <div ref={ref} className="relative w-full max-w-[500px] transition-all duration-300 ease-out focus-within:max-w-full lg:focus-within:max-w-[650px]">
      <div className="relative">
        <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="search"
          placeholder="Search by college or area…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setFocused(true);
            if (query.trim()) setOpen(true);
          }}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-full border border-gray-300 bg-white py-2.5 pl-12 pr-5 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-violet-500"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
        />
      </div>
      {showDropdown && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-y-auto rounded-xl border border-border bg-card shadow-lg"
          role="listbox"
        >
          {Array.isArray(results) && results.length > 0 ? (
            results.slice(0, 20).map((name) => (
              <button
                key={name}
                type="button"
                role="option"
                className="w-full px-4 py-3 text-left text-sm text-foreground transition-all duration-200 hover:bg-muted"
                onClick={() => goToSearch(name)}
              >
                {name}
              </button>
            ))
          ) : (
            <div className="px-4 py-4 text-sm text-foreground/60">
              <p className="font-medium">No exact match found.</p>
              <p className="mt-1">Try searching by area or nearby college.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
