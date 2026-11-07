import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export function PageHeading({
  title,
  back = false,
  action,
}: {
  title: string;
  back?: boolean;
  action?: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <header className="page-heading">
      {back && (
        <button
          className="icon-button back-button"
          aria-label="Voltar"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft aria-hidden="true" />
        </button>
      )}
      <h1>{title}</h1>
      {action && <div className="page-action">{action}</div>}
    </header>
  );
}
