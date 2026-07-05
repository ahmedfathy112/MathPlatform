import { NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

const PROTECTED_PREFIXES = ["/dashboard", "/admin", "/assistant"];

export async function middleware(request) {
  const { supabaseResponse, user } = await updateSession(request);

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    path.startsWith(prefix),
  );

  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", path);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico
     * - image/font files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
