import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as api from '../api';
import { PageHeading } from '../components/PageHeading';
import { SectionHeading } from '../components/SectionHeading';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { Sheet } from '../components/Sheet';
import { formatBRL } from '../domain/formatting';
import { getVerdict } from '../domain/verdicts';
import type { Agent, Product } from '../domain/types';

interface AgentDetail {
  agent: Agent;
  products: Product[];
}

export function AgentDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<AgentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let current = true;
    setLoading(true);
    setError('');
    api.getAgent(id)
      .then(async (agent) => {
        if (!agent) return undefined;
        const products = await Promise.all(agent.productIds.map((productId) => api.getProduct(productId)));
        return { agent, products: products.filter((product): product is Product => product !== undefined) };
      })
      .then((result) => {
        if (!current) return;
        if (!result) setError('Não encontramos este agente.');
        else setDetail(result);
      })
      .catch(() => current && setError('Não foi possível carregar os dados deste agente.'))
      .finally(() => current && setLoading(false));
    return () => { current = false; };
  }, [id, retry]);

  async function changeStatus(): Promise<void> {
    if (!detail) return;
    await api.setAgentStatus(detail.agent.id, detail.agent.status === 'ativo' ? 'pausado' : 'ativo');
    setRetry((value) => value + 1);
  }

  async function removeAgent(): Promise<void> {
    if (!detail) return;
    await api.deleteAgent(detail.agent.id);
    navigate('/agentes');
  }

  if (loading) return <LoadingState label="Carregando agente" />;
  if (error || !detail) {
    return <div className="page standard-page"><ErrorState message={error || 'Não encontramos este agente.'} retry={() => setRetry((value) => value + 1)} /></div>;
  }

  const { agent, products } = detail;
  return (
    <div className="page standard-page detail-page">
      <PageHeading title={agent.name} back />
      <p className="detail-status"><span className={`status-badge status-${agent.status}`}>
        {agent.status === 'ativo' ? 'Ativo' : agent.status === 'pausado' ? 'Pausado' : 'Erro'}
      </span> · {agent.checkedLabel}</p>
      <div className="summary-list summary-grid">
        <div><span>Frequência</span><strong>{agent.frequency}</strong></div>
        <div><span>Lojas</span><strong>{agent.stores.length}</strong></div>
        <div><span>Alertas</span><strong>{agent.channels.length ? agent.channels.join(', ') : 'Nenhum'}</strong></div>
      </div>
      <div className="button-row">
        <Link className="button button-outline" to={`/agentes/${agent.id}/editar`}>Editar</Link>
        <button className="button button-outline" onClick={() => void changeStatus()}>
          {agent.status === 'ativo' ? 'Pausar' : 'Retomar'}
        </button>
        <button className="button button-outline destructive" onClick={() => setConfirmDelete(true)}>Excluir</button>
      </div>
      <SectionHeading title={`Produtos monitorados (${agent.productIds.length})`} />
      {products.length ? (
        <div className="product-list">
          {products.map((product) => {
            const lowest = [...product.offers].sort((a, b) => a.price - b.price)[0];
            const verdict = getVerdict(product);
            return (
              <Link className="product-row" key={product.id} to={`/produtos/${product.id}`}>
                <span><strong>{product.name}</strong>{verdict.label && <small className={`verdict-label verdict-${verdict.kind}`}>{verdict.label}</small>}</span>
                <b>{formatBRL(lowest.price)}</b>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState title="Nenhum produto encontrado" description="Edite os filtros para ampliar este monitoramento." />
      )}
      {confirmDelete && (
        <Sheet title="Excluir agente?" onClose={() => setConfirmDelete(false)}>
          <p className="sheet-copy">Este agente será removido da sua lista.</p>
          <div className="sheet-actions">
            <button className="button button-primary" onClick={() => void removeAgent()}>Excluir agente</button>
            <button className="button button-outline" onClick={() => setConfirmDelete(false)}>Cancelar</button>
          </div>
        </Sheet>
      )}
    </div>
  );
}
