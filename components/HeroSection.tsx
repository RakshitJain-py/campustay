"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface HeroSectionProps {
  onExploreClick?: () => void;
}

export default function HeroSection({ onExploreClick }: HeroSectionProps) {
  const [listHref, setListHref] = useState("/signup?role=hostel_owner");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.role === "hostel_owner") {
        setListHref("/dashboard/owner/new");
      }
    })();
  }, []);

  return (
    <section
      className="relative mx-auto max-w-7xl px-6 py-24"
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-100 dark:opacity-30"
        style={{
          background: "radial-gradient(circle at 60% 40%, rgba(124,58,237,0.08), transparent 55%)",
        }}
      />
      <div className="relative flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
          Find Your Perfect Student Stay Near Campus
        </h1>
        <p className="max-w-xl text-lg text-gray-600 dark:text-gray-400">
          Safe, verified stays and smart reviews — so you can focus on what
          matters. Your next home is a few clicks away.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          {onExploreClick ? (
            <button
              type="button"
              onClick={onExploreClick}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:from-indigo-500 dark:to-violet-500"
            >
              Explore Stays
            </button>
          ) : (
            <Link
              href="/featured"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:from-indigo-500 dark:to-violet-500"
            >
              Explore Stays
            </Link>
          )}
          <Link
            href={listHref}
            className="inline-flex items-center justify-center rounded-full border border-violet-600 px-8 py-3 font-semibold text-violet-600 transition-all duration-200 hover:bg-violet-600 hover:text-white dark:border-violet-500 dark:text-violet-400 dark:hover:bg-violet-600 dark:hover:text-white"
          >
            List Your Property
          </Link>
        </div>
      </div>
    </section>
  );
}
