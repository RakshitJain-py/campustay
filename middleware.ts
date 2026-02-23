import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Routes that require authentication + verified email */
const PROTECTED_PREFIXES = ["/dashboard", "/profile"];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always refresh session cookies
  let supabase;
  let user;
  let response;

  try {
    const session = await updateSession(request);
    supabase = session.supabase;
    user = session.user;
    response = session.response;
  } catch {
    return NextResponse.next({ request });
  }

  // If route is not protected, just continue
  if (!isProtectedRoute(pathname)) {
    return response;
  }

  // 1. No authenticated user → redirect to login
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Email not verified → hard block
  if (!user.email_confirmed_at) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL("/login?error=verify", request.url)
    );
  }

  // 3. Allow through — page-level role logic handles rendering
  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};