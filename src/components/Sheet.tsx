import { X } from 'lucide-react';
import type { ReactNode } from 'react';

export function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="sheet-scrim" onMouseDown={onClose}>
      <section
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="sheet-heading">
          <h2 id="sheet-title">{title}</h2>
          <button className="icon-button" aria-label="Fechar" onClick={onClose}>
            <X aria-hidden="true" />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
