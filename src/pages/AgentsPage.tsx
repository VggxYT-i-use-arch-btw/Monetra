import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as api from '../api';
import type { Agent } from '../domain/types';
import { AgentRow } from '../components/AgentRow';
import { PageHeading } from '../components/PageHeading';
import { SegmentedControl } from '../components/SegmentedControl';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { Sheet } from '../components/Sheet';

type SheetState = { kind: 'erro' | 'excluir'; agent: Agent } | null;

function noticeFromState(state: unknown): string {
  if (typeof state !== 'object' || state === null || !('message' in state)) return '';
  return typeof state.message === 'string' ? state.message : '';
}

export function AgentsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filter, setFilter] = useState('Todos');
  const [menuId, setMenuId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let current = true;
    setLoading(true);
    setError(false);
    api.listAgents()
      .then((result) => current && setAgents(result))
      .catch(() => current && setError(true))
      .finally(() => current && setLoading(false));
    return () => { current = false; };
  }, [retry]);

  const shown = agents.filter((agent) => filter === 'Todos'
    || (filter === 'Ativos' && agent.status === 'ativo')
    || (filter === 'Pausados' && agent.status === 'pausado'));

  async function toggleStatus(agent: Agent): Promise<void> {
    await api.setAgentStatus(agent.id, agent.status === 'ativo' ? 'pausado' : 'ativo');
    setMenuId(null);
    setRetry((value) => value + 1);
  }

  async function confirmDelete(): Promise<void> {
    if (!sheet || sheet.kind !== 'excluir') return;
    await api.deleteAgent(sheet.agent.id);
    setSheet(null);
    setMenuId(null);
    setRetry((value) => value + 1);
  }

  return (
    <div className="page standard-page">
      <PageHeading
        title="Meus agentes"
        action={<Link className="button button-outline" to="/agentes/novo">Novo agente</Link>}
      />
      {noticeFromState(location.state) && (
        <p className="inline-notice" role="status">{noticeFromState(location.state)}</p>
      )}
      <SegmentedControl
        items={['Todos', 'Ativos', 'Pausados']}
        value={filter}
        onChange={setFilter}
        label="Filtrar agentes"
      />

      {loading ? <LoadingState label="Carregando agentes" /> : error ? (
        <ErrorState message="Não foi possível carregar os agentes." retry={() => setRetry((value) => value + 1)} />
      ) : shown.length ? (
        <div className="agent-list full-list">
          {shown.map((agent) => (
            <div className="agent-item" data-agent-id={agent.id} key={agent.id}>
              <AgentRow
                agent={agent}
                onError={() => setSheet({ kind: 'erro', agent })}
                onMenu={() => setMenuId((current) => current === agent.id ? null : agent.id)}
              />
              {menuId === agent.id && (
                <div className="agent-menu" role="menu" aria-label={`Opções de ${agent.name}`}>
                  <button role="menuitem" onClick={() => navigate(`/agentes/${agent.id}/editar`)}>Editar</button>
                  <button role="menuitem" onClick={() => void toggleStatus(agent)}>
                    {agent.status === 'ativo' ? 'Pausar' : 'Retomar'}
                  </button>
                  <button role="menuitem" className="destructive" onClick={() => setSheet({ kind: 'excluir', agent })}>
                    Excluir
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={filter === 'Todos' ? 'Nenhum agente por aqui' : `Nenhum agente ${filter.toLocaleLowerCase('pt-BR')}`}
          description="Crie um agente para começar a acompanhar preços."
          action={<Link className="button button-outline" to="/agentes/novo">Criar agente</Link>}
        />
      )}

      {sheet?.kind === 'erro' && (
        <Sheet title="Verificação falhou" onClose={() => setSheet(null)}>
          <p className="sheet-copy">Não foi possível verificar a {sheet.agent.errorStore ?? 'loja'}. Vamos tentar novamente em 30 min.</p>
          <div className="sheet-actions">
            <button className="button button-primary" onClick={() => navigate(`/agentes/${sheet.agent.id}`)}>Ver agente</button>
            <button className="button button-outline" onClick={() => setSheet(null)}>Dispensar</button>
          </div>
        </Sheet>
      )}
      {sheet?.kind === 'excluir' && (
        <Sheet title="Excluir agente?" onClose={() => setSheet(null)}>
          <p className="sheet-copy">Este agente será removido da sua lista.</p>
          <div className="sheet-actions">
            <button className="button button-primary" onClick={() => void confirmDelete()}>Excluir agente</button>
            <button className="button button-outline" onClick={() => setSheet(null)}>Cancelar</button>
          </div>
        </Sheet>
      )}
    </div>
  );
}
