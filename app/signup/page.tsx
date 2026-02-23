"use client";

import { registerUser, type SignUpRole } from "@/lib/auth";
import Link from "next/link";
import { useState } from "react";
import RoleCard from "@/components/RoleCard";

const ROLES: { id: SignUpRole; label: string }[] = [
  { id: "student", label: "Student" },
  { id: "guardian", label: "Guardian" },
  { id: "hostel_owner", label: "Hostel Owner" },
];

export default function SignUpPage() {
  const [step, setStep] = useState<"role" | "form">("role");
  const [role, setRole] = useState<SignUpRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleRoleSelect = (r: SignUpRole) => {
    setRole(r);
    setStep("form");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setError("");
    setLoading(true);
    try {
      await registerUser(
        role,
        email,
        password,
        name,
        phone,
        role === "guardian" ? guardianEmail || email : undefined
      );
      setDone(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign up failed";
      const isDuplicate =
        typeof message === "string" &&
        (message.toLowerCase().includes("already registered") ||
          message.toLowerCase().includes("already exists") ||
          message.toLowerCase().includes("user already"));
      setError(
        isDuplicate
          ? "This email is already registered. Please log in or use a different email."
          : message
      );
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-md">
          <h2 className="text-xl font-bold text-zinc-900">
            Check your email
          </h2>
          <p className="mt-3 text-zinc-600">
            We sent a verification link to <strong>{email}</strong>. Click it to
            activate your account, then log in.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-lg bg-violet-600 px-4 py-2.5 font-medium text-white transition-all duration-200 hover:scale-105 hover:bg-violet-700"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  if (step === "role") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Create your CampuStay account
        </h1>
        <p className="mt-2 text-zinc-600">Choose your account type</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {ROLES.map((r) => (
            <RoleCard
              key={r.id}
              label={r.label}
              selected={role === r.id}
              onSelect={() => handleRoleSelect(r.id)}
            />
          ))}
        </div>
        <p className="mt-8 text-sm text-zinc-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-violet-600 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[480px] px-4 py-12">
      <button
        type="button"
        onClick={() => setStep("role")}
        className="text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      >
        ← Change role
      </button>
      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-8 shadow-md transition-colors duration-300 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Sign up as {ROLES.find((r) => r.id === role)?.label}
        </h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
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
          {role === "guardian" && (
            <div>
              <label
                htmlFor="guardianEmail"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Guardian email (for profile)
              </label>
              <input
                id="guardianEmail"
                type="email"
                value={guardianEmail}
                onChange={(e) => setGuardianEmail(e.target.value)}
                placeholder={email || "Same as login email"}
                className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 transition-all duration-200 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder-gray-500"
              />
            </div>
          )}
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 transition-all duration-200 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder-gray-500"
            />
          </div>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 transition-all duration-200 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder-gray-500"
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 transition-all duration-200 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder-gray-500"
            />
          </div>
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
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-violet-600 hover:underline dark:text-violet-400"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
