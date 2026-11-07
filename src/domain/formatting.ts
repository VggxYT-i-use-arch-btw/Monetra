const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function formatBRL(value: number): string {
  return Number.isFinite(value) ? brlFormatter.format(value) : '—';
}

export function formatDate(value: string | Date | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';

  const date = value instanceof Date
    ? value
    : /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T12:00:00`)
      : new Date(value);

  if (!Number.isFinite(date.getTime())) return '—';

  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
  }).format(date).replace(/\.$/, '');
}

export function formatRelativeMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h`;
}
