

export const formatNumber = (n: number) =>
  Number.isNaN(n) ? "NaN" : Number.isInteger(n) ? n.toString() : n.toFixed(2);
