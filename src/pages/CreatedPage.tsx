import { Check } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { isAgent } from '../domain/route-state';
import type { Agent } from '../domain/types';

function agentFromState(state: unknown): Agent | undefined {
  if (typeof state !== 'object' || state === null || !('agent' in state)) return undefined;
  return isAgent(state.agent) ? state.agent : undefined;
}

export function CreatedPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const agent = agentFromState(location.state);

  if (!agent) {
    return (
      <Navigate
        to="/agentes"
        replace
        state={{ message: 'Não encontramos os dados do agente criado. Confira sua lista de agentes.' }}
      />
    );
  }

  const channels = agent.channels.length ? agent.channels.join(', ') : 'Nenhum canal';

  return (
    <main className="page created-page">
      <span className="created-check"><Check aria-hidden="true" /></span>
      <h1>Agente criado</h1>
      <p className="created-copy">
        Verificamos {agent.stores.length} lojas a cada {agent.frequency}. Você recebe um alerta quando aparecer uma oferta real.
      </p>
      <div className="summary-list">
        <div><span>Lojas</span><strong>{agent.stores.length}</strong></div>
        <div><span>Frequência</span><strong>{agent.frequency}</strong></div>
        <div><span>Alertas</span><strong>{channels}</strong></div>
      </div>
      <button className="button button-primary button-full" onClick={() => navigate(`/agentes/${agent.id}`)}>Ver agente</button>
      <Link className="button button-outline button-full" to="/">Voltar ao início</Link>
    </main>
  );
}
