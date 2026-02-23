"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";

const ROLE_LABEL: Record<string, string> = {
  student: "Student",
  guardian: "Guardian",
  hostel_owner: "Hostel Owner",
};

interface ProfileDropdownProps {
  user: User;
  role: string;
  name?: string;
  onClose?: () => void;
}

export default function ProfileDropdown({
  user,
  role,
  name,
  onClose,
}: ProfileDropdownProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    onClose?.();
    router.push("/");
    router.refresh();
  };

  // Safely grab the initial for the avatar, fallback to "U" if unavailable
  const initial =
    (name || user?.email || "U").charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full p-1 transition-all duration-200 hover:ring-2 hover:ring-violet-500/30 focus:outline-none focus:ring-2 focus:ring-violet-500"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <span className="hidden text-sm font-medium text-gray-700 sm:inline dark:text-gray-300 ml-2">
          Profile
        </span>
        <div className="flex w-9 h-9 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 shadow-sm">
          <span className="text-sm font-semibold text-white">
            {initial}
          </span>
        </div>
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right rounded-xl border border-gray-200 bg-white py-2 shadow-lg transition-all duration-200 dark:border-gray-800 dark:bg-gray-950"
            role="menu"
          >
            <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
              <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                {name ?? "User"}
              </p>
              <Link href="/profile" onClick={() => setOpen(false)} className="block truncate text-sm text-gray-500 hover:underline dark:text-gray-400">
                {user.email}
              </Link>
              <p className="mt-1 text-xs font-semibold text-violet-600 dark:text-violet-400">
                {ROLE_LABEL[role] ?? role}
              </p>
            </div>
            <div className="py-1">
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-violet-400"
              >
                Profile Settings
              </Link>
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-violet-400"
              >
                Home
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 dark:text-gray-300 dark:hover:bg-red-950/30 dark:hover:text-red-400"
              >
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
