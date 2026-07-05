/**
 * Supabase Auth requires an email or phone identifier for password auth.
 * Since students register with a local Egyptian phone number rather than
 * a real email, we map phone -> a synthetic, non-deliverable email address
 * and use that as the Auth identifier under the hood. The `profiles.phone`
 * column remains the source of truth for display/contact purposes.
 *
 * IMPORTANT: replace "yourdomain.local" with your actual project domain
 * before going to production (it just needs to be a domain you control /
 * that will never receive real mail, since Supabase never sends email here).
 */
const SYNTHETIC_EMAIL_DOMAIN = "yourdomain.local";

export function phoneToSyntheticEmail(phone) {
  const digitsOnly = String(phone ?? "").replace(/\D/g, "");
  return `${digitsOnly}@${SYNTHETIC_EMAIL_DOMAIN}`;
}

/**
 * Maps the UI's grade dropdown values to the `grade_level` enum defined in
 * the database schema (00_extensions_and_enums.sql). The register form only
 * offers secondary grades today; extend both places together if prep grades
 * get added to the UI.
 */
export const GRADE_UI_TO_ENUM = {
  first: "secondary_1",
  second: "secondary_2",
  third: "secondary_3",
};

/**
 * Fetches a profile row with a couple of short retries. Uses `.maybeSingle()`
 * (never throws on zero rows) rather than `.single()` (throws a 406 —
 * "Cannot coerce the result to a single JSON object" — if the row isn't
 * there yet). The retries are a defensive cushion for replication lag, not
 * a substitute for creating the row transactionally in the first place
 * (see 16_handle_new_user_trigger.sql).
 */
export async function fetchProfileWithRetry(supabase, userId, { attempts = 3, delayMs = 350 } = {}) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, full_name, phone, role, grade_level, is_banned")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Failed to load profile:", error.message);
      return null;
    }

    if (profile) {
      return profile;
    }

    if (attempt < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return null;
}
