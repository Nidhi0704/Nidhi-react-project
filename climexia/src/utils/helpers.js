export function fmtP(p) {
  if (p >= 10000000) return '₹' + Math.round(p / 10000000) + 'Cr';
  if (p >= 100000) return '₹' + Math.round(p / 100000) + 'L';
  if (p >= 1000) return '₹' + p.toLocaleString('en-IN');
  return p > 0 ? '₹' + p : 'Quote';
}