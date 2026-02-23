"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import ProfileDropdown from "./ProfileDropdown";
import NavbarSearch from "./NavbarSearch";
import DarkModeToggle from "./DarkModeToggle";

const DASHBOARD_BY_ROLE: Record<string, string> = {
  student: "/dashboard/student",
  guardian: "/dashboard/guardian",
  hostel_owner: "/dashboard/owner",
};

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [dashboardHref, setDashboardHref] = useState("/dashboard/student");
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const loadProfile = async (uid: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", uid)
      .single();
    const r = profile?.role as string | undefined;
    if (r) {
      setRole(r);
      setDashboardHref(DASHBOARD_BY_ROLE[r] ?? "/dashboard/student");
      if (r === "student") {
        const { data: row } = await supabase
          .from("students")
          .select("name")
          .eq("id", uid)
          .single();
        if (row?.name) setUserName(row.name);
      } else if (r === "guardian") {
        const { data: row } = await supabase
          .from("guardians")
          .select("name")
          .eq("id", uid)
          .single();
        if (row?.name) setUserName(row.name);
      }
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ?? null);
      if (user) loadProfile(user.id);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setRole("");
        setUserName("");
        setDashboardHref("/dashboard/student");
      }
    });
    return () => subscription.unsubscribe();
  }, []);



  const navLinks = (
    <>
      <Link
        href="/"
        onClick={() => setMenuOpen(false)}
        className="group relative rounded-lg px-4 py-2 text-base font-medium text-gray-700 transition-all duration-200 hover:bg-violet-50 hover:text-violet-600 dark:text-gray-300 dark:hover:bg-violet-900/30 dark:hover:text-violet-400"
      >
        Home
        <span className="absolute bottom-1 left-4 right-4 h-[2px] scale-x-0 rounded-full bg-violet-600 transition-transform duration-300 ease-out group-hover:scale-x-100 dark:bg-violet-400" />
      </Link>
      <Link
        href="/#contact"
        onClick={() => setMenuOpen(false)}
        className="group relative rounded-lg px-4 py-2 text-base font-medium text-gray-700 transition-all duration-200 hover:bg-violet-50 hover:text-violet-600 dark:text-gray-300 dark:hover:bg-violet-900/30 dark:hover:text-violet-400"
      >
        Contact
        <span className="absolute bottom-1 left-4 right-4 h-[2px] scale-x-0 rounded-full bg-violet-600 transition-transform duration-300 ease-out group-hover:scale-x-100 dark:bg-violet-400" />
      </Link>
      <Link
        href="/dashboard"
        onClick={() => setMenuOpen(false)}
        className="group relative rounded-lg px-4 py-2 text-base font-medium text-gray-700 transition-all duration-200 hover:bg-violet-50 hover:text-violet-600 dark:text-gray-300 dark:hover:bg-violet-900/30 dark:hover:text-violet-400"
      >
        Dashboard
        <span className="absolute bottom-1 left-4 right-4 h-[2px] scale-x-0 rounded-full bg-violet-600 transition-transform duration-300 ease-out group-hover:scale-x-100 dark:bg-violet-400" />
      </Link>


      {user ? (
        <ProfileDropdown
          user={user}
          role={role}
          name={userName || undefined}
          onClose={() => setMenuOpen(false)}
        />
      ) : (
        <>
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="rounded-lg px-4 py-2 text-base font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            Login
          </Link>
          <Link
            href="/signup"
            onClick={() => setMenuOpen(false)}
            className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 text-base font-medium text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:from-violet-500 dark:to-indigo-500"
          >
            Sign Up
          </Link>
        </>
      )}
    </>
  );

  return (
    <header
      id="navbar-search"
      className="sticky top-0 z-10 h-20 border-b border-gray-200 bg-white/90 backdrop-blur-xl transition-colors duration-300 dark:border-gray-800 dark:bg-gray-950"
    >
      {/* Radial glow for logo area inside the header */}
      <div
        className="pointer-events-none absolute inset-0 hidden opacity-50 dark:opacity-20 md:block"
        style={{ background: "radial-gradient(circle at left, rgba(124,58,237,0.08), transparent 60%)" }}
      />

      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-6 relative">
        <div className="flex items-center gap-4 flex-shrink-0">
          <DarkModeToggle />
          <Link href="/" className="group flex flex-col transition hover:opacity-90">
            <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-3xl font-semibold tracking-tight text-transparent dark:from-violet-400 dark:to-indigo-400">
              CampuStay
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Smart Living for Smarter Cities</span>
          </Link>
        </div>

        <div className="hidden flex-1 justify-center md:flex">
          <NavbarSearch />
        </div>

        <nav className="hidden items-center gap-2 md:flex">{navLinks}</nav>

        <div className="flex items-center gap-3 md:hidden">
          <DarkModeToggle />
          {!user && (
            <>
              <Link href="/login" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm"
              >
                Sign Up
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            aria-expanded={menuOpen}
            aria-label="Menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-gray-200 bg-white px-6 py-4 md:hidden dark:border-gray-800 dark:bg-gray-950">
          <div className="flex flex-col gap-1">
            <Link href="/" onClick={() => setMenuOpen(false)} className="py-2 text-base font-medium text-gray-700 dark:text-gray-300">
              Home
            </Link>
            <Link href="/#contact" onClick={() => setMenuOpen(false)} className="py-2 text-base font-medium text-gray-700 dark:text-gray-300">
              Contact
            </Link>
            <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="py-2 text-base font-medium text-gray-700 dark:text-gray-300">
              Dashboard
            </Link>

            {user ? (
              <div className="py-2">
                <ProfileDropdown user={user} role={role} name={userName || undefined} onClose={() => setMenuOpen(false)} />
              </div>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="py-2 text-base font-medium text-gray-700 dark:text-gray-300">
                  Login
                </Link>
                <Link href="/signup" onClick={() => setMenuOpen(false)} className="py-2 text-base font-medium text-violet-600 dark:text-violet-400">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}


    </header>
  );
}
