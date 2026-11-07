import { useState } from 'react';
import { SectionHeading } from './SectionHeading';
import { Sheet } from './Sheet';
import type { PlanUsage } from '../api';

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const width = Math.min(100, limit > 0 ? (used / limit) * 100 : 0);
  return (
    <div className="usage-meter">
      <div><span>{label}</span><strong>{used} de {limit}</strong></div>
      <div className="usage-track"><span style={{ width: `${width}%` }} /></div>
    </div>
  );
}

export function PlanSection({ usage }: { usage: PlanUsage }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="plan-section">
      <SectionHeading title="Plano" />
      <h2 className="plan-name">Plano gratuito</h2>
      <UsageBar label="Agentes" used={usage.agents} limit={usage.agentLimit} />
      <UsageBar label="Produtos monitorados" used={usage.products} limit={usage.productLimit} />
      <button className="button button-outline button-full" onClick={() => setOpen(true)}>Ver planos</button>
      {open && (
        <Sheet title="Planos" onClose={() => setOpen(false)}>
          <div className="plan-option current-plan">
            <div><strong>Gratuito</strong><small>Plano atual</small></div>
            <span>Atual</span>
          </div>
          <div className="plan-option">
            <div><strong>Pro</strong><small>Mais agentes e produtos</small></div>
            <button className="button button-outline" disabled>Em breve</button>
          </div>
        </Sheet>
      )}
    </section>
  );
}
