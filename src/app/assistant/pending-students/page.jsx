import { redirect } from "next/navigation";

// Pending approvals now live inside /assistant/students (the "Pending
// Approvals" section at the top of that page) rather than as a separate
// route, so this just forwards anyone who still has the old link bookmarked.
export default function PendingStudentsRedirect() {
  redirect("/assistant/students");
}
