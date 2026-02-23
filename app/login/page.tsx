"use client";

import { supabase } from "@/lib/supabase";
import { ensureProfileAndRole } from "@/lib/auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const VERIFY_MESSAGE =
  "Please verify your email before signing in. Check your inbox for the confirmation link.";
const SUCCESS_VERIFIED =
  "Email verified successfully. Please log in to continue.";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const err = searchParams.get("error");
    const verified = searchParams.get("verified");
    if (verified === "true") {
      setSuccessMessage(SUCCESS_VERIFIED);
      setError("");
    } else if (err === "verify") {
      setError(VERIFY_MESSAGE);
      setSuccessMessage("");
    } else if (err === "auth") {
      setError("Authentication failed. Please try again or sign up.");
      setSuccessMessage("");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) throw signInError;
      if (!data?.user) throw new Error("User not found");

      // 🔒 Email verification enforcement
      if (!data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        setError(VERIFY_MESSAGE);
        return;
      }

      // 🔥 Ensure profile + role row exists (idempotent)
      await ensureProfileAndRole(supabase, data.user);

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-md transition-colors duration-300 dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Welcome back to CampuStay
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Sign in to access your account.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 transition-all duration-200 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder-gray-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 transition-all duration-200 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder-gray-500"
            />
          </div>

          {successMessage && (
            <div className="rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 dark:from-violet-500 dark:to-indigo-500"
          >
            {loading ? "Signing in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-violet-600 hover:underline dark:text-violet-400"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}