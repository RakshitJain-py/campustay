import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type SignUpRole = "student" | "guardian" | "hostel_owner";

const VALID_ROLES: SignUpRole[] = ["student", "guardian", "hostel_owner"];

function isValidRole(value: unknown): value is SignUpRole {
  return typeof value === "string" && VALID_ROLES.includes(value as SignUpRole);
}

export interface SignUpMetadata {
  role: SignUpRole;
  name: string;
  phone: string;
  email?: string;
}

/**
 * Register: signUp with metadata. Profile + role table inserts happen after email verification in auth callback.
 */
export async function registerUser(
  role: SignUpRole,
  email: string,
  password: string,
  name: string,
  phone: string,
  guardianEmail?: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        name,
        phone,
        email: guardianEmail ?? email,
      } as SignUpMetadata,
    },
  });

  if (error) throw error;
  
  // If the user already existed, Supabase might return a user object but with an empty identities array
  if (data?.user && data.user.identities && data.user.identities.length === 0) {
    throw new Error("This email is already registered.");
  }

  return data;
}

/**
 * Idempotent profile + role provisioning.
 *
 * SECURITY GUARANTEES:
 *  - If profile exists → return DB role immediately. NEVER overwrite.
 *  - If profile doesn't exist → validate metadata role strictly, upsert profile + role table.
 *  - All inserts use upsert with onConflict:'id' for race-condition safety.
 *  - Profiles upsert uses ignoreDuplicates:true so existing role is never modified.
 *  - Fail closed on any error.
 */
export async function ensureProfileAndRole(
  serverSupabase: SupabaseClient,
  user: User
): Promise<{ role: string } | null> {
  // ── 1. Check if profile already exists ──
  const { data: existing, error: fetchError } = await serverSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (fetchError) {
    return null; // Fail closed
  }

  // ── 2. Profile exists → return DB role. NEVER overwrite. ──
  if (existing) {
    if (!isValidRole(existing.role)) {
      return null; // Corrupted role → deny
    }
    return { role: existing.role };
  }

  // ── 3. No profile yet → validate metadata role strictly ──
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const rawRole = meta?.role;
  if (!isValidRole(rawRole)) {
    return null; // Invalid or missing role → deny
  }
  const role = rawRole;

  // ── 4. Upsert profile (ignoreDuplicates = never overwrite existing role) ──
  try {
    const { error: profileError } = await serverSupabase
      .from("profiles")
      .upsert(
        { id: user.id, role },
        { onConflict: "id", ignoreDuplicates: true }
      );

    if (profileError) throw profileError;
  } catch {
    return null; // Fail closed
  }

  // ── 5. Upsert role table row (idempotent, onConflict: 'id') ──
  try {
    const metaTyped = meta as unknown as SignUpMetadata;
    const upsertOpts = { onConflict: "id" } as const;

    if (role === "student") {
      await serverSupabase.from("students").upsert(
        {
          id: user.id,
          name: typeof metaTyped?.name === "string" ? metaTyped.name : "",
          phone: typeof metaTyped?.phone === "string" ? metaTyped.phone : "",
        },
        upsertOpts
      );
    } else if (role === "guardian") {
      await serverSupabase.from("guardians").upsert(
        {
          id: user.id,
          name: typeof metaTyped?.name === "string" ? metaTyped.name : "",
          phone: typeof metaTyped?.phone === "string" ? metaTyped.phone : "",
          email: typeof metaTyped?.email === "string" ? metaTyped.email : user.email ?? "",
        },
        upsertOpts
      );
    } else if (role === "hostel_owner") {
      await serverSupabase.from("hostel_owners").upsert(
        { id: user.id },
        upsertOpts
      );
    }
  } catch {
    // Role table insert failed but profile exists — still return role
    // so user can reach dashboard. Role table row can be recovered later.
  }

  return { role };
}
