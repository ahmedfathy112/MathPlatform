import { create } from "zustand";

/**
 * Tracks which subject the student is currently viewing, and whether they
 * have active (paid, non-expired) access to it. A student can be 'active'
 * in one subject and 'pending'/'expired' in another, so this is scoped to
 * a single subject at a time rather than being a global flag.
 */

const initialState = {
  selectedSubjectId: null,
  selectedSubject: null, // full subject row: { id, name, grade_level, description, ... }
  subscriptionStatus: null, // 'pending' | 'active' | 'suspended' | 'expired' | null (no row yet)
  subscriptionExpiresAt: null,
  isLoadingSubscription: false,
};

export const usePlatformStore = create((set) => ({
  ...initialState,

  setSelectedSubject: (subject) =>
    set({
      selectedSubjectId: subject?.id ?? null,
      selectedSubject: subject ?? null,
    }),

  setSubscription: (subscription) =>
    set({
      subscriptionStatus: subscription?.status ?? null,
      subscriptionExpiresAt: subscription?.expires_at ?? null,
      isLoadingSubscription: false,
    }),

  setLoadingSubscription: (isLoading) =>
    set({ isLoadingSubscription: isLoading }),

  reset: () => set(initialState),
}));

export const selectHasActiveAccess = (state) => {
  if (state.subscriptionStatus !== "active") return false;
  if (!state.subscriptionExpiresAt) return true;
  return new Date(state.subscriptionExpiresAt) > new Date();
};
