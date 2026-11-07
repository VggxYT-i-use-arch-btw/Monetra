import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as api from '../api';
import { PageHeading } from '../components/PageHeading';
import { SegmentedControl } from '../components/SegmentedControl';
import { EmptyState, ErrorState, LoadingState } from '../components/States';
import { formatBRL } from '../domain/formatting';
import type { AlertFilter, AlertItem } from '../domain/types';

const filters: AlertFilter[] = ['Todos', 'Ofertas genuínas', 'Mínimas históricas'];

export function AlertsPage() {
  const [filter, setFilter] = useState<AlertFilter>('Todos');
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let current = true;
    setLoading(true);
    setError(false);
    api.listAlerts(filter)
      .then((result) => current && setAlerts(result))
      .catch(() => current && setError(true))
      .finally(() => current && setLoading(false));
    return () => { current = false; };
  }, [filter, retry]);

  return (
    <div className="page standard-page alerts-page">
      <PageHeading title="Alertas" />
      <SegmentedControl items={filters} value={filter} onChange={(value) => setFilter(value as AlertFilter)} label="Filtrar alertas" />
      {loading ? <LoadingState label="Carregando alertas" /> : error ? (
        <ErrorState message="Não foi possível carregar os alertas." retry={() => setRetry((value) => value + 1)} />
      ) : alerts.length ? (
        <div className="alert-list full-list">
          {alerts.map((alert) => (
            <Link className="alert-row" key={alert.id} to={`/produtos/${alert.productId}`}>
              <strong className="alert-product-name">{alert.productName}</strong>
              <span className="alert-price-change">
                <del>{formatBRL(alert.oldPrice)}</del>
                <span aria-hidden="true">→</span>
                <strong>{formatBRL(alert.newPrice)}</strong>
                <em>-{alert.discount}%</em>
              </span>
              <small>{alert.store} · há {alert.age}</small>
              {alert.tag && <span className="alert-tag">{alert.tag}</span>}
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Ainda não há alertas"
          description="Quando um agente encontrar uma oferta genuína, ela aparecerá aqui."
          icon={<Bell aria-hidden="true" />}
          action={<Link className="button button-outline" to="/agentes/novo">Criar agente</Link>}
        />
      )}
    </div>
  );
}
