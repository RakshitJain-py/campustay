"use client";

import HeroSection from "@/components/HeroSection";
import FeatureCard from "@/components/FeatureCard";
import Modal from "@/components/Modal";
import ScrollToTop from "@/components/ScrollToTop";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CITIES = ["Delhi", "Noida", "Gurugram", "Ghaziabad", "Faridabad"];

export default function Home() {
  const router = useRouter();
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [featureModal, setFeatureModal] = useState<"guardian" | "reviews" | "verified" | null>(null);

  const handleExploreClick = () => setCityModalOpen(true);
  const handleCitySelect = (city: string) => {
    setCityModalOpen(false);
    router.push(`/featured?city=${encodeURIComponent(city)}`);
  };

  return (
    <div className="min-h-screen bg-background font-sans transition-colors duration-300">
      <main>
        <HeroSection onExploreClick={handleExploreClick} />

        <section
          className="py-24 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-100 dark:opacity-30"
            style={{
              background: "radial-gradient(circle at 80% 20%, rgba(124,58,237,0.05), transparent 60%)",
            }}
          />
          <div className="relative mx-auto max-w-7xl px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Why CampuStay
            </h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              <FeatureCard
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
                heading="GuardianSYNC — Structured Safety, When You Choose It"
                description="Link a guardian only when needed. Enable intelligent oversight that operates quietly in the background — transparent, optional, and designed to preserve independence."
                onClick={() => setFeatureModal("guardian")}
              />
              <FeatureCard
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                }
                heading="Smart Reviews"
                description="Real feedback from students and owners. Compare options and choose with confidence."
                onClick={() => setFeatureModal("reviews")}
              />
              <FeatureCard
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                }
                heading="Verified Listings"
                description="Every stay is checked so you know what you're booking. No surprises, no fake listings."
                onClick={() => setFeatureModal("verified")}
              />
            </div>
          </div>
        </section>

        <section className="bg-background py-24">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              How It Works
            </h2>
            <div className="mx-auto mt-12 flex max-w-4xl flex-col items-center gap-8 sm:flex-row sm:justify-between sm:gap-4">
              <div className="flex flex-1 flex-col items-center text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-lg font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">1</span>
                <p className="mt-3 font-medium text-gray-900 dark:text-gray-100">Search</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Find stays near your campus</p>
              </div>
              <div className="hidden h-0.5 flex-1 bg-gray-200 sm:block dark:bg-gray-800" aria-hidden />
              <div className="flex flex-1 flex-col items-center text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-lg font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">2</span>
                <p className="mt-3 font-medium text-gray-900 dark:text-gray-100">Compare</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Reviews, price, location</p>
              </div>
              <div className="hidden h-0.5 flex-1 bg-gray-200 sm:block dark:bg-gray-800" aria-hidden />
              <div className="flex flex-1 flex-col items-center text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-lg font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">3</span>
                <p className="mt-3 font-medium text-gray-900 dark:text-gray-100">Book</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Reserve your stay</p>
              </div>
              <div className="hidden h-0.5 flex-1 bg-gray-200 sm:block dark:bg-gray-800" aria-hidden />
              <div className="flex flex-1 flex-col items-center text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-lg font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">4</span>
                <p className="mt-3 font-medium text-gray-900 dark:text-gray-100">Move In</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Keys and move-in details</p>
              </div>
            </div>
            <div className="mt-12 text-center">
              <Link
                href="/signup"
                className="inline-flex items-center rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:from-violet-500 dark:to-indigo-500"
              >
                Get started
              </Link>
            </div>
          </div>
        </section>

        <section id="contact" className="border-t border-gray-200 py-24 dark:border-gray-800">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Contact</h2>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Get in touch for support or partnership.
            </p>
          </div>
        </section>
      </main>

      <ScrollToTop />

      <Modal open={cityModalOpen} onClose={() => setCityModalOpen(false)}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Select city</h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Choose a city to explore featured stays.</p>
        <div className="mt-6 flex flex-col gap-2">
          {CITIES.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => handleCitySelect(city)}
              className="rounded-xl border border-gray-200 px-4 py-3 text-left font-medium text-gray-900 transition-all duration-200 hover:bg-violet-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              {city}
            </button>
          ))}
        </div>
      </Modal>

      <Modal open={featureModal !== null} onClose={() => setFeatureModal(null)}>
        {featureModal === "guardian" && (
          <>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">GuardianSYNC — Structured Safety, When You Choose It</h3>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              Link a guardian only when needed. Enable intelligent oversight that operates quietly in the background — transparent, optional, and designed to preserve independence.
            </p>
          </>
        )}
        {featureModal === "reviews" && (
          <>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Smart Reviews</h3>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              Real feedback from students and owners helps you compare options and choose with confidence. Reviews are moderated and tied to verified stays.
            </p>
          </>
        )}
        {featureModal === "verified" && (
          <>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Verified Listings</h3>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              Every stay is checked so you know what you're booking. We verify listing details and owner identity to reduce surprises and fake listings.
            </p>
          </>
        )}
      </Modal>
    </div>
  );
}
