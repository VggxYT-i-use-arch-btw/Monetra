import type { ReactNode } from 'react';
import { CircleAlert, LoaderCircle } from 'lucide-react';

export function LoadingState({ label = 'Carregando dados' }: { label?: string }) {
  return (
    <div className="loading-state" role="status" aria-label={label}>
      <LoaderCircle aria-hidden="true" className="spin" />
      <span>{label}...</span>
    </div>
  );
}

export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div className="state-card error-state" role="alert">
      <CircleAlert aria-hidden="true" />
      <p>{message}</p>
      {retry && <button className="button button-outline" onClick={retry}>Tentar novamente</button>}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="state-card empty-state">
      {icon ?? <span className="empty-mark" aria-hidden="true">—</span>}
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}
