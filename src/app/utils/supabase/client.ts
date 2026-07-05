import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use inside Client Components ("use client").
 * Safe to call multiple times — createBrowserClient reuses the underlying
 * connection, but we still only want one instance per module in practice,
 * so most call sites should do: const supabase = createClient();
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
