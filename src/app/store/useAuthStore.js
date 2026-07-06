import { create } from "zustand";

/**
 * @typedef {"teacher" | "assistant" | "student"} UserRole
 * @typedef {"idle" | "loading" | "authenticated" | "unauthenticated"} AuthStatus
 */

const initialState = {
  user: null, // the raw Supabase auth user object
  profile: null, // the matching row from `profiles` (full_name, role, grade_level, is_banned, ...)
  role: null, // convenience mirror of profile.role
  status: "idle",
};

export const useAuthStore = create((set) => ({
  ...initialState,

  /** Called once we have both the auth user and their `profiles` row. */
  setSession: (user, profile) =>
    set({
      user,
      profile,
      role: profile?.role ?? null,
      status: user ? "authenticated" : "unauthenticated",
    }),

  setStatus: (status) => set({ status }),

  /** Clears everything on sign-out. */
  clearSession: () => set({ ...initialState, status: "unauthenticated" }),
}));

// Convenience selectors — keep components from re-rendering on unrelated
// slices of the store (e.g. a component that only needs `role` won't
// re-render when `profile.full_name` changes).
export const selectUser = (state) => state.user;
export const selectProfile = (state) => state.profile;
export const selectRole = (state) => state.role;
export const selectAuthStatus = (state) => state.status;
export const selectIsStaff = (state) =>
  state.role === "teacher" || state.role === "assistant";
