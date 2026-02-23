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
      return NextResponse.redirect(`${baseUrl}/login?error=auth`);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(`${baseUrl}/login?error=auth`);
    }
    if (!user.email_confirmed_at) {
      return NextResponse.redirect(`${baseUrl}/login?error=verify`);
    }

    await ensureProfileAndRole(supabase, user);
    return NextResponse.redirect(`${baseUrl}/login?verified=true`);
  } catch {
    return NextResponse.redirect(`${baseUrl}/login?error=auth`);
  }
}
