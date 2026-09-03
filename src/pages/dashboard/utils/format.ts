import { convertFileSize } from '@/utils';

export const formatCompactNumber = (value?: number | null) => {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return '0';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  const trim = (v: number) =>
    v
      .toFixed(v >= 10 ? 1 : 2)
      .replace(/\.0+$/, '')
      .replace(/(\.\d*[1-9])0+$/, '$1');

  if (abs >= 1e9) return `${sign}${trim(abs / 1e9)}B`;
  if (abs >= 1e6) return `${sign}${trim(abs / 1e6)}M`;
  if (abs >= 1e3) return `${sign}${trim(abs / 1e3)}K`;
  return `${sign}${Math.round(abs)}`;
};

export const formatPercent = (value?: number | null, digits = 0) => {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return '0%';
  return `${n.toFixed(digits)}%`;
};

export const bytesToGb = (bytes?: number | null) => {
  const n = Number(bytes || 0);
  if (!n) return 0;
  return n / 1024 ** 3;
};

export const formatGbPair = (used?: number | null, total?: number | null) => {
  const usedGb = bytesToGb(used);
  const totalGb = bytesToGb(total);
  if (!totalGb && !usedGb) {
    return convertFileSize(Number(used || 0)) || '0';
  }
  return `${Math.round(usedGb)} / ${Math.round(totalGb)} GB`;
};

export const sumHistory = (
  list?: Array<{ timestamp?: number; value?: number }>
) => {
  return (list || []).reduce((sum, item) => sum + Number(item?.value || 0), 0);
};

export const historyValues = (
  list?: Array<{ timestamp?: number; value?: number }>
) => (list || []).map((item) => Number(item?.value || 0));

export const filterHistoryByHours = <
  T extends { timestamp?: number; value?: number }
>(
  list: T[] | undefined,
  hours: number
) => {
  const rows = list || [];
  if (!rows.length || hours <= 0) return rows;
  const latest = Math.max(...rows.map((item) => Number(item.timestamp || 0)));
  if (!latest) return rows;
  const from = latest - hours * 3600;
  return rows.filter((item) => Number(item.timestamp || 0) >= from);
};
