import type { ReactNode } from 'react';

export function SectionHeading({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      <span className="dot-leader" aria-hidden="true" />
      {action && <div className="section-action">{action}</div>}
    </div>
  );
}
