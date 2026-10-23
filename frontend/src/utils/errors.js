export function apiError(err, fallback = 'Something went wrong. Please try again.') {
  const detail = err?.response?.data?.detail;
  if (typeof detail === 'string' && detail.trim()) return detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item?.msg || item?.message || String(item)).join(' ');
  }
  if (detail && typeof detail === 'object' && detail.message) return detail.message;
  return err?.message || fallback;
}
