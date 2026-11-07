import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Bell, Menu, Plus, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import * as api from '../api';
import { parseRequest } from '../domain/parser';
import type { Agent, Deal } from '../domain/types';
import { AgentRow } from '../components/AgentRow';
import { DealRow } from '../components/DealRow';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { SectionHeading } from '../components/SectionHeading';

const productNotFound = 'Não encontramos esse produto. Tente descrever o que você procura.';

export function HomePage({ onOpenMenu }: { onOpenMenu: () => void }) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [request, setRequest] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [filters, setFilters] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let current = true;
    setLoading(true);
    setLoadError(false);
    Promise.all([api.listAgents(), api.listDeals()])
      .then(([agentRows, dealRows]) => {
        if (!current) return;
        setAgents(agentRows);
        setDeals(dealRows);
      })
      .catch(() => current && setLoadError(true))
      .finally(() => current && setLoading(false));
    return () => { current = false; };
  }, [retry]);

  async function submitRequest(): Promise<void> {
    const text = request.trim();
    if (!text) {
      inputRef.current?.focus();
      return;
    }

    setBusy(true);
    setMessage('');
    if (/^https?:\/\//i.test(text)) {
      try {
        await new Promise<void>((resolve) => setTimeout(resolve, 350));
        const product = api.productForStoreUrl(text);
        if (product) navigate(`/produtos/${product.id}`);
        else setMessage(productNotFound);
      } catch {
        setMessage(productNotFound);
      } finally {
        setBusy(false);
      }
      return;
    }

    setFilters(parseRequest(text).filters);
    try {
      const parsed = await api.interpretRequest(text);
      navigate('/agentes/novo', { state: { request: parsed } });
    } catch {
      setMessage('Não foi possível entender a solicitação. Tente novamente.');
    } finally {
      setBusy(false);
    }
  }

  const activeAgents = agents.filter((agent) => agent.status === 'ativo' || agent.status === 'erro');

  return (
    <div className="page home-page">
      <header className="mobile-topbar">
        <button className="icon-button" aria-label="Abrir menu" onClick={onOpenMenu}>
          <Menu aria-hidden="true" />
        </button>
        <Link className="brand-name" to="/">Monetra<small>by Boreas</small></Link>
        <Link className="icon-button" to="/alertas" aria-label="Abrir alertas">
          <Bell aria-hidden="true" />
        </Link>
      </header>

      <section className="home-intro">
        <h1>O que você quer monitorar hoje?</h1>
      </section>

      <section className="request-panel" aria-label="Criar monitoramento">
        <Search aria-hidden="true" className="request-search-icon" />
        <textarea
          ref={inputRef}
          value={request}
          onChange={(event) => setRequest(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void submitRequest();
            }
          }}
          rows={2}
          aria-label="Produto ou descrição para monitorar"
          placeholder="Cole o link de um produto ou descreva o que você procura..."
        />
        <div className="request-actions">
          <button
            className="round-button button-outline"
            aria-label="Novo agente"
            onClick={() => navigate('/agentes/novo')}
          >
            <Plus aria-hidden="true" />
          </button>
          <button
            className="round-button button-primary"
            aria-label="Enviar solicitação"
            onClick={() => void submitRequest()}
          >
            <ArrowUp aria-hidden="true" />
          </button>
        </div>
      </section>

      {busy && (
        <div className="request-progress" role="status">
          <span>{/^https?:\/\//i.test(request.trim()) ? 'Buscando produto...' : 'Entendendo sua solicitação...'}</span>
          <div className="progress-track"><span /></div>
          {filters.map((filter) => <span className="filter-chip" key={filter}>{filter}</span>)}
        </div>
      )}
      {message && <p className="inline-error" role="alert">{message}</p>}

      <div className={`home-columns${busy ? ' is-dimmed' : ''}`}>
        <section className="home-section">
          <SectionHeading title="Agentes ativos" action={<Link to="/agentes">Ver todos</Link>} />
          {loading ? <LoadingState label="Carregando agentes" /> : loadError ? (
            <ErrorState message="Não foi possível carregar os agentes." retry={() => setRetry((value) => value + 1)} />
          ) : activeAgents.length ? (
            <div className="agent-list compact-list">
              {activeAgents.slice(0, 3).map((agent) => <AgentRow key={agent.id} agent={agent} compact />)}
            </div>
          ) : (
            <EmptyState
              title="Você ainda não tem agentes"
              description="Crie um monitoramento para acompanhar os preços que importam."
              action={<Link className="button button-outline" to="/agentes/novo">Criar agente</Link>}
            />
          )}
        </section>

        <section className="home-section">
          <SectionHeading title="Melhores ofertas agora" action={<Link to="/ofertas">Ver todas</Link>} />
          {loading ? <LoadingState label="Carregando ofertas" /> : loadError ? (
            <ErrorState message="Não foi possível carregar as ofertas." retry={() => setRetry((value) => value + 1)} />
          ) : deals.length ? (
            <div className="deal-list compact-list">
              {deals.slice(0, 3).map((deal) => <DealRow key={deal.productId} deal={deal} />)}
            </div>
          ) : (
            <EmptyState title="Nenhuma oferta disponível" description="Novas ofertas aparecerão aqui quando forem encontradas." />
          )}
        </section>
      </div>
    </div>
  );
}
