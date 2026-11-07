import type { PricePoint, PriceRange, PriceStats } from './types';

export function getHistoryStats(history: PricePoint[]): PriceStats {
  const values = history.map((point) => point.price).filter(Number.isFinite).sort((a, b) => a - b);
  if (values.length === 0) return { min: 0, median: 0, max: 0, average: 0 };

  const middle = Math.floor(values.length / 2);
  const median = values.length % 2 === 0
    ? (values[middle - 1] + values[middle]) / 2
    : values[middle];

  return {
    min: values[0],
    median,
    max: values[values.length - 1],
    average: values.reduce((sum, value) => sum + value, 0) / values.length,
  };
}

function parsePointDate(value: string): Date | undefined {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00`)
    : new Date(value);
  return Number.isFinite(date.getTime()) ? date : undefined;
}

export function filterHistoryByRange(
  history: PricePoint[],
  range: PriceRange,
  now = new Date(),
): PricePoint[] {
  if (range === 'Tudo') return history;

  const days = range === '7 dias' ? 7 : range === '30 dias' ? 30 : 90;
  const cutoff = new Date(now);
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (days - 1));
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  return history.filter((point) => {
    const date = parsePointDate(point.date);
    return date !== undefined && date >= cutoff && date <= endOfToday;
  });
}
