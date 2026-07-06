import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

/**
 * Refreshes the Supabase auth session on every request and mirrors any
 * updated cookies onto the outgoing response. Without this, sessions can
 * silently expire in Server Components since they can only read cookies,
 * not write them (see the catch block in utils/supabase/server.ts).
 *
 * Called from the root `middleware.ts`.
 */
export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not remove: this call revalidates the session and must run before
  // any other logic that depends on auth state.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabaseResponse, user };
}
