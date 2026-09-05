export function formatEstimatedCost(
  amount?: number | string | null,
  currency?: string | null
): string {
  const value = Number(amount);
  if (!Number.isFinite(value)) {
    return '—';
  }
  return `${value.toFixed(6)} ${currency || ''}`.trim();
}
