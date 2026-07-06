export const GRADE_LABELS = {
  prep_1: "أولى إعدادي",
  prep_2: "ثانية إعدادي",
  prep_3: "ثالثة إعدادي",
  secondary_1: "أولى ثانوي",
  secondary_2: "ثانية ثانوي",
  secondary_3: "ثالثة ثانوي",
};

export function formatDateTime(isoString: string | null | undefined) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleString("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatDate(isoString: string | null | undefined) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleDateString("ar-EG", {
    dateStyle: "medium",
  });
}
