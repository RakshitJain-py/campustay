import { ensureProfileAndRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const baseUrl = new URL(request.url).origin;

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/`);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
      return NextResponse.redirect(`${baseUrl}/login?error=auth&detail=${encodeURIComponent(error.message)}`);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("[auth/callback] getUser returned null after code exchange");
      return NextResponse.redirect(`${baseUrl}/login?error=auth&detail=${encodeURIComponent("No user after code exchange")}`);
    }
    if (!user.email_confirmed_at) {
      return NextResponse.redirect(`${baseUrl}/login?error=verify`);
    }

    await ensureProfileAndRole(supabase, user);
    return NextResponse.redirect(`${baseUrl}/login?verified=true`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown callback error";
    console.error("[auth/callback] CAUGHT ERROR:", message);
    return NextResponse.redirect(`${baseUrl}/login?error=auth&detail=${encodeURIComponent(message)}`);
  }
}
