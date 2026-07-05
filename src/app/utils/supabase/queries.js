/**
 * Computes the "effective" subscription status, treating a stale 'active'
 * row (status not yet flipped to 'expired' by a cron job) as expired once
 * its expires_at has passed. Mirrors the same logic the RLS helper
 * has_active_subscription() applies server-side.
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
 * Fetches every subject matching the student's grade level, each merged
 * with that student's subscription row (if any). A subject the student has
 * never subscribed to comes back with `status: null` and `subscriptionId:
 * null` rather than being omitted, so the UI can still show a "subscribe"
 * call to action for it.
 */
export async function fetchSubjectsWithSubscriptions(supabase, profile) {
  if (!profile?.id) {
    return { subjects: [], error: "لم يتم العثور على بيانات الطالب." };
  }

  const [{ data: subjectRows, error: subjectsError }, { data: subscriptionRows, error: subsError }] =
    await Promise.all([
      supabase
        .from("subjects")
        .select("id, name, description, grade_level, price_egp, is_active")
        .eq("grade_level", profile.grade_level)
        .eq("is_active", true)
        .order("name"),
      supabase
        .from("subscriptions")
        .select("subject_id, status, expires_at")
        .eq("student_id", profile.id),
    ]);

  if (subjectsError || subsError) {
    return {
      subjects: [],
      error: "تعذر تحميل المواد الدراسية. حاول مرة أخرى.",
    };
  }

  const subscriptionBySubjectId = new Map(
    (subscriptionRows ?? []).map((row) => [row.subject_id, row]),
  );

  const subjects = (subjectRows ?? []).map((subject) => {
    const subscription = subscriptionBySubjectId.get(subject.id) ?? null;
    return {
      ...subject,
      status: getEffectiveStatus(subscription),
      expiresAt: subscription?.expires_at ?? null,
    };
  });

  return { subjects, error: null };
}
