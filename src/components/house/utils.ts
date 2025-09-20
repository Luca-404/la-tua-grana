export const highlightMetric = (val: number | null, other: number | null) => {
  if (val === null || other === null) return "";
  if (val >= other) {
    if (val <= 0) {
      return "text-warning font-semibold";
    }
    return "text-gain font-semibold";
  }
  return "text-loss";
};