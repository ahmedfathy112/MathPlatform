/**
 * Computes the "effective" subscription status, treating a stale 'active'
 * row (status not yet flipped to 'expired' by a cron job) as expired once
 * its expires_at has passed. Mirrors the same logic the RLS helper
 * has_active_subscription() applies server-side. Works the same regardless
 * of what the subscription points at (package now, subject previously).
 */
export function getEffectiveStatus(subscription) {
  if (!subscription) return null;
  if (subscription.status === "active") {
    const isPastExpiry =
      subscription.expires_at && new Date(subscription.expires_at) <= new Date();
    return isPastExpiry ? "expired" : "active";
  }
  return subscription.status;
}

/**
 * Fetches every package matching the student's grade level, each merged
 * with that student's subscription row (if any). A package the student has
 * never subscribed to comes back with `status: null` rather than being
 * omitted, so the UI can still show a "subscribe" call to action for it.
 *
 * This replaces the old fetchSubjectsWithSubscriptions() — packages are now
 * the purchasable unit (an academic year), not individual subjects.
 */
export async function fetchPackagesWithSubscriptions(supabase, profile) {
  if (!profile?.id) {
    return { packages: [], error: "لم يتم العثور على بيانات الطالب." };
  }

  const [{ data: packageRows, error: packagesError }, { data: subscriptionRows, error: subsError }] =
    await Promise.all([
      supabase
        .from("packages")
        .select("id, name, description, grade_level, price_egp, is_active")
        .eq("grade_level", profile.grade_level)
        .eq("is_active", true)
        .order("name"),
      supabase
        .from("subscriptions")
        .select("package_id, status, expires_at")
        .eq("student_id", profile.id),
    ]);

  if (packagesError || subsError) {
    return {
      packages: [],
      error: "تعذر تحميل الباقات الدراسية. حاول مرة أخرى.",
    };
  }

  const subscriptionByPackageId = new Map(
    (subscriptionRows ?? []).map((row) => [row.package_id, row]),
  );

  const packages = (packageRows ?? []).map((pkg) => {
    const subscription = subscriptionByPackageId.get(pkg.id) ?? null;
    return {
      ...pkg,
      status: getEffectiveStatus(subscription),
      expiresAt: subscription?.expires_at ?? null,
    };
  });

  return { packages, error: null };
}

/**
 * Fetches the subjects that belong to a specific package — the "grid of
 * Subject Cards" a student sees after opening a package they're subscribed
 * to. Only active subjects are returned.
 */
export async function fetchSubjectsForPackage(supabase, packageId) {
  const { data, error } = await supabase
    .from("subjects")
    .select("id, name, description, is_active")
    .eq("package_id", packageId)
    .eq("is_active", true)
    .order("name");

  if (error) {
    return { subjects: [], error: "تعذر تحميل مواد الباقة. حاول مرة أخرى." };
  }

  return { subjects: data ?? [], error: null };
}
