import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api';
import type { Deal } from '../domain/types';
import { DealRow } from '../components/DealRow';
import { PageHeading } from '../components/PageHeading';
import { EmptyState, ErrorState, LoadingState } from '../components/States';

export function OffersPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let current = true;
    setLoading(true);
    api.listDeals()
      .then((result) => current && setDeals(result))
      .catch(() => current && setError(true))
      .finally(() => current && setLoading(false));
    return () => { current = false; };
  }, [retry]);

  return (
    <div className="page standard-page">
      <PageHeading title="Melhores ofertas agora" />
      {loading ? <LoadingState label="Carregando ofertas" /> : error ? (
        <ErrorState message="Não foi possível carregar as ofertas." retry={() => setRetry((value) => value + 1)} />
      ) : deals.length ? (
        <div className="deal-list full-list">
          {deals.map((deal) => <DealRow key={deal.productId} deal={deal} />)}
        </div>
      ) : (
        <EmptyState
          title="Nenhuma oferta disponível"
          description="As ofertas encontradas aparecerão nesta lista."
          action={<Link className="button button-outline" to="/agentes/novo">Criar agente</Link>}
        />
      )}
    </div>
  );
}
