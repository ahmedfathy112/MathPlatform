"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useAuthStore,
  selectAuthStatus,
  selectRole,
} from "../../store/useAuthStore";

const ROLE_HOME_ROUTES = {
  teacher: "/admin",
  assistant: "/assistant",
  student: "/dashboard",
};

export default function RequireRole({ allow, children }) {
  const router = useRouter();
  const status = useAuthStore(selectAuthStatus);
  const role = useAuthStore(selectRole);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (role && !allow.includes(role)) {
      router.replace(ROLE_HOME_ROUTES[role] ?? "/login");
    }
  }, [status, role, allow, router]);

  if (status === "authenticated" && role && !allow.includes(role)) {
    return null;
  }

  return children;
}
