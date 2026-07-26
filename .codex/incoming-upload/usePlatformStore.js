import { create } from "zustand";

/**
 * Tracks the package (academic year) the student is currently viewing, and
 * whether they have active (paid, non-expired) access to it — access is now
 * granted per package, not per subject. `selectedSubject` is kept
 * separately, purely for display/breadcrumb purposes as the student drills
 * into one subject's content within an already-unlocked package; it no
 * longer has anything to do with access control.
 */

const initialState = {
  selectedPackageId: null,
  selectedPackage: null, // full package row: { id, name, grade_level, description, ... }
  subscriptionStatus: null, // 'pending' | 'active' | 'suspended' | 'expired' | null (no row yet)
  subscriptionExpiresAt: null,
  isLoadingSubscription: false,

  selectedSubjectId: null,
  selectedSubject: null, // full subject row: { id, name, description, ... }
};

export const usePlatformStore = create((set) => ({
  ...initialState,

  setSelectedPackage: (pkg) =>
    set({
      selectedPackageId: pkg?.id ?? null,
      selectedPackage: pkg ?? null,
    }),

  setSubscription: (subscription) =>
    set({
      subscriptionStatus: subscription?.status ?? null,
      subscriptionExpiresAt: subscription?.expires_at ?? null,
      isLoadingSubscription: false,
    }),

  setLoadingSubscription: (isLoading) =>
    set({ isLoadingSubscription: isLoading }),

  setSelectedSubject: (subject) =>
    set({
      selectedSubjectId: subject?.id ?? null,
      selectedSubject: subject ?? null,
    }),

  reset: () => set(initialState),
}));

export const selectHasActiveAccess = (state) => {
  if (state.subscriptionStatus !== "active") return false;
  if (!state.subscriptionExpiresAt) return true;
  return new Date(state.subscriptionExpiresAt) > new Date();
};
