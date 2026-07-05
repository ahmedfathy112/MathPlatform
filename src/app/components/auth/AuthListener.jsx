"use client";

import { useEffect } from "react";
import { createClient } from "../../utils/supabase/client";
import { fetchProfileWithRetry } from "../../utils/supabase/auth-helpers";
import { useAuthStore } from "../../store/useAuthStore";

/**
 * Mount this once near the root of the app (see src/app/layout.jsx).
 * It renders nothing — it just keeps useAuthStore in sync with the real
 * Supabase session, both on first load and whenever the session changes
 * (sign in, sign out, token refresh in another tab, etc.).
 *
 * Uses fetchProfileWithRetry() (maybeSingle + short retries) rather than a
 * raw `.single()` query. `onAuthStateChange` can fire the instant a session
 * exists — e.g. right after signUp() — and a plain `.single()` query throws
 * a 406 ("Cannot coerce the result to a single JSON object") if it runs
 * before the profile row exists. The real fix for that race is creating the
 * profile transactionally via a DB trigger (16_handle_new_user_trigger.sql);
 * the retry here is just a defensive second layer, e.g. for replication lag.
 */
export default function AuthListener() {
  useEffect(() => {
    const supabase = createClient();
    const { setSession, setStatus, clearSession } = useAuthStore.getState();

    async function loadProfile(user) {
      if (!user) {
        clearSession();
        return;
      }

      setStatus("loading");

      const profile = await fetchProfileWithRetry(supabase, user.id);

      if (!profile) {
        // Genuinely no profile after retries (not just a race) — treat as
        // signed out rather than leaving the app in a half-authenticated
        // state with no role/grade_level to work with.
        clearSession();
        return;
      }

      setSession(user, profile);
    }

    // Initial load
    supabase.auth.getUser().then(({ data: { user } }) => loadProfile(user));

    // Keep in sync going forward
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProfile(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
