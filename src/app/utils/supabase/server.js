import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for use inside Server Components, Route Handlers, and
 * Server Actions. Must be created fresh on every request (never module-level
 * singleton) because it's bound to that request's cookies.
 *
 * NOTE: `cookies()` is async in Next.js 15+. If your project is on Next.js
 * <15, remove the `await` below (`const cookieStore = cookies();`).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions (see src/utils/supabase/middleware.ts).
          }
        },
      },
    },
  );
}
