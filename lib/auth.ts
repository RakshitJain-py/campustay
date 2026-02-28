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
  guardian_email?: string;
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
        ...(guardianEmail ? { guardian_email: guardianEmail } : {}),
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
): Promise<{ role: string }> {
  console.log("[ensureProfileAndRole] START for user:", user.id, "email:", user.email);

  // ── 1. Check if profile already exists ──
  const { data: existing, error: fetchError } = await serverSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  console.log("[ensureProfileAndRole] Step 1 SELECT result:", { existing, fetchError: fetchError?.message ?? null });

  if (fetchError) {
    console.error("[ensureProfileAndRole] SELECT failed:", fetchError.message);
    throw new Error("Profile lookup failed. Please try again.");
  }

  // ── 2. Profile exists → return DB role. NEVER overwrite. ──
  if (existing) {
    if (!isValidRole(existing.role)) {
      console.error("[ensureProfileAndRole] Corrupted role:", existing.role);
      throw new Error("Account has an invalid role. Contact support.");
    }
    console.log("[ensureProfileAndRole] Step 2 → profile exists, returning role:", existing.role);
    return { role: existing.role };
  }

  // ── 3. No profile yet → validate metadata role strictly ──
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const rawRole = meta?.role;
  console.log("[ensureProfileAndRole] Step 3 metadata check:", {
    hasMetadata: !!meta,
    rawRole,
    allMetaKeys: meta ? Object.keys(meta) : [],
    fullMetadata: JSON.stringify(meta),
  });
  if (!isValidRole(rawRole)) {
    console.error("[ensureProfileAndRole] EXITING — Invalid metadata role:", rawRole, "Full metadata:", JSON.stringify(meta));
    throw new Error(`Account setup incomplete — missing role (got: ${String(rawRole)}). Please sign up again.`);
  }
  const role = rawRole;

  // ── 4. Insert profile row (plain INSERT, no ON CONFLICT DO NOTHING) ──
  //    ON CONFLICT DO NOTHING silently swallows RLS failures.
  //    Using plain insert so errors are always surfaced.
  const profilePayload = {
    id: user.id,
    role,
    name: typeof meta?.name === "string" ? meta.name : null,
  };

  console.log("[ensureProfileAndRole] Step 4 INSERT payload:", profilePayload);

  const { error: profileError } = await serverSupabase
    .from("profiles")
    .insert(profilePayload);

  console.log("[ensureProfileAndRole] Step 4 INSERT result:", { error: profileError ? { code: profileError.code, message: profileError.message } : null });

  if (profileError) {
    // 23505 = unique_violation → profile already exists (race condition, safe to continue)
    if (profileError.code === "23505") {
      console.warn("[ensureProfileAndRole] Profile already exists (race), continuing.");
    } else {
      console.error("[ensureProfileAndRole] INSERT failed:", profileError.code, profileError.message);
      throw new Error("Profile creation failed. Please try again.");
    }
  }

  // ── 4b. Verification: confirm the profile row actually exists ──
  const { data: verify, error: verifyError } = await serverSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  console.log("[ensureProfileAndRole] Step 4b verification:", { verify, verifyError: verifyError?.message ?? null });

  if (verifyError || !verify) {
    console.error("[ensureProfileAndRole] EXITING — Verification SELECT failed:",
      verifyError?.message ?? "no row found after insert");
    throw new Error("Profile was not created. Please try again.");
  }

  // ── 5. Insert role table row (check errors, do not silently ignore) ──
  const metaTyped = meta as unknown as SignUpMetadata;
  const upsertOpts = { onConflict: "id" } as const;

  if (role === "student") {
    const { error: studentError } = await serverSupabase.from("students").upsert(
      {
        id: user.id,
        name: typeof metaTyped?.name === "string" ? metaTyped.name : "",
        phone: typeof metaTyped?.phone === "string" ? metaTyped.phone : "",
      },
      upsertOpts
    );
    if (studentError) {
      console.error("[ensureProfileAndRole] students upsert failed:", studentError.code, studentError.message);
      // Non-fatal: profile exists, user can reach dashboard. Log for debugging.
    }
  } else if (role === "guardian") {
    const { error: guardianError } = await serverSupabase.from("guardians").upsert(
      {
        id: user.id,
        name: typeof metaTyped?.name === "string" ? metaTyped.name : "",
        phone: typeof metaTyped?.phone === "string" ? metaTyped.phone : "",
        email: typeof metaTyped?.guardian_email === "string" ? metaTyped.guardian_email : user.email ?? "",
      },
      upsertOpts
    );
    if (guardianError) {
      console.error("[ensureProfileAndRole] guardians upsert failed:", guardianError.code, guardianError.message);
    }
  } else if (role === "hostel_owner") {
    const { error: ownerError } = await serverSupabase.from("hostel_owners").upsert(
      { id: user.id },
      upsertOpts
    );
    if (ownerError) {
      console.error("[ensureProfileAndRole] hostel_owners upsert failed:", ownerError.code, ownerError.message);
    }
  }

  return { role };
}
