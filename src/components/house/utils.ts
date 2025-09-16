export const highlightMetric = (val: number, other: number) => {
  if (val >= other) {
    if (val <= 0) {
      return "text-warning font-semibold";
    }
    return "text-gain font-semibold";
  }
  return "text-loss";
};
