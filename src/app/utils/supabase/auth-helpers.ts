import { SupabaseClient } from "@supabase/supabase-js";
const SYNTHETIC_EMAIL_DOMAIN = "yourdomain.local";

export function phoneToSyntheticEmail(
  phone: string | number | null | undefined,
) {
  const digitsOnly = String(phone ?? "").replace(/\D/g, "");
  return `${digitsOnly}@${SYNTHETIC_EMAIL_DOMAIN}`;
}

export const GRADE_UI_TO_ENUM = {
  first: "secondary_1",
  second: "secondary_2",
  third: "secondary_3",
  first_prep: "prep_1",
  second_prep: "prep_2",
  third_prep: "prep_3",
};

export async function fetchProfileWithRetry(
  supabase: SupabaseClient,
  userId: string,
  { attempts = 3, delayMs = 350 }: { attempts?: number; delayMs?: number } = {},
) {
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
