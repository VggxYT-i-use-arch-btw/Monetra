import { Coffee, Headphones, MoreHorizontal, Wind } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Agent } from '../domain/types';

const statusText = {
  ativo: 'Ativo',
  pausado: 'Pausado',
  erro: 'Erro',
} as const;

function CategoryIcon({ category }: { category: Agent['category'] }) {
  if (category === 'Fones') return <Headphones aria-hidden="true" />;
  if (category === 'Cafeteiras') return <Coffee aria-hidden="true" />;
  return <Wind aria-hidden="true" />;
}

function AgentCopy({ agent, compact }: { agent: Agent; compact: boolean }) {
  return (
    <span className="row-copy">
      <strong>{agent.name}</strong>
      {compact ? (
        <small>{agent.checkedLabel}</small>
      ) : (
        <span className="row-details">
          <small>{agent.productIds.length} produtos · <b className={`row-status-text status-${agent.status}`}>{statusText[agent.status]}</b></small>
          <small>{agent.checkedLabel}</small>
        </span>
      )}
    </span>
  );
}

export function AgentRow({
  agent,
  compact = false,
  onMenu,
  onError,
}: {
  agent: Agent;
  compact?: boolean;
  onMenu?: () => void;
  onError?: () => void;
}) {
  const destination = `/agentes/${agent.id}`;
  const label = statusText[agent.status];

  return (
    <article className={`agent-row${compact ? ' compact' : ''}`}>
      {agent.status === 'erro' && onError ? (
        <button className="row-main row-open" onClick={onError}>
          <CategoryIcon category={agent.category} />
          <AgentCopy agent={agent} compact={compact} />
        </button>
      ) : (
        <Link className="row-main" to={destination}>
          <CategoryIcon category={agent.category} />
          <AgentCopy agent={agent} compact={compact} />
        </Link>
      )}
      <span className={`status-badge status-${agent.status}`}>{label}</span>
      {onMenu && (
        <button className="icon-button row-menu" aria-label={`Opções de ${agent.name}`} onClick={onMenu}>
          <MoreHorizontal aria-hidden="true" />
        </button>
      )}
    </article>
  );
}
