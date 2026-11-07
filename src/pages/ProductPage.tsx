import { useEffect, useState } from 'react';
import { Share2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import * as api from '../api';
import { PageHeading } from '../components/PageHeading';
import { PriceChart } from '../components/PriceChart';
import { SectionHeading } from '../components/SectionHeading';
import { SegmentedControl } from '../components/SegmentedControl';
import { ErrorState, LoadingState } from '../components/States';
import { formatBRL } from '../domain/formatting';
import { getHistoryStats } from '../domain/stats';
import { getVerdict } from '../domain/verdicts';
import { STORE_HOME_URLS } from '../domain/store-links';
import type { PricePoint, PriceRange, Product } from '../domain/types';

interface ProductView {
  product: Product;
  history: PricePoint[];
}

const ranges: PriceRange[] = ['7 dias', '30 dias', '90 dias', 'Tudo'];

export function ProductPage() {
  const { id = '' } = useParams();
  const [range, setRange] = useState<PriceRange>('30 dias');
  const [view, setView] = useState<ProductView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [toast, setToast] = useState('');

  useEffect(() => {
    let current = true;
    setLoading(true);
    setError('');
    Promise.all([api.getProduct(id), api.getPriceHistory(id, range)])
      .then(([product, history]) => {
        if (!current) return;
        if (!product) setError('Não encontramos este produto.');
        else setView({ product, history });
      })
      .catch(() => current && setError('Não foi possível carregar o produto e seu histórico.'))
      .finally(() => current && setLoading(false));
    return () => { current = false; };
  }, [id, range, retry]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function shareProduct(): Promise<void> {
    if (!view) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: view.product.name, url: window.location.href });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setToast('Link copiado');
      } else {
        setToast('Não foi possível copiar o link.');
      }
    } catch {
      setToast('Não foi possível compartilhar o link.');
    }
  }

  if (loading) return <LoadingState label="Carregando produto e histórico" />;
  if (error || !view) {
    return <div className="page standard-page"><ErrorState message={error || 'Não encontramos este produto.'} retry={() => setRetry((value) => value + 1)} /></div>;
  }

  const { product, history } = view;
  const stats = getHistoryStats(product.history);
  const verdict = getVerdict(product);
  const offers = [...product.offers].sort((left, right) => left.price - right.price);

  return (
    <div className="page product-page">
      <PageHeading
        title={product.name}
        back
        action={<button className="icon-button" aria-label="Compartilhar produto" onClick={() => void shareProduct()}><Share2 /></button>}
      />
      <section className="product-price-block">
        <div className="product-price-line">
          <strong className="product-price">{formatBRL(offers[0].price)}</strong>
          {product.fromPrice !== undefined && <del>{formatBRL(product.fromPrice)}</del>}
        </div>
        <span>{offers[0].store}</span>
      </section>
      {verdict.label && <span className={`verdict-label verdict-${verdict.kind}`}>{verdict.label}</span>}
      <p className="verdict-copy">{verdict.sentence}</p>

      <div className="price-stats">
        {[
          { label: 'Menor em 90 dias', value: stats.min },
          { label: 'Mediana', value: stats.median },
          { label: 'Maior', value: stats.max },
        ].map((stat) => (
          <div key={stat.label}><small>{stat.label}</small><strong>{formatBRL(stat.value)}</strong></div>
        ))}
      </div>

      <SegmentedControl
        items={ranges}
        value={range}
        onChange={(value) => setRange(value as PriceRange)}
        label="Período do histórico"
      />
      <PriceChart
        points={history}
        productName={product.name}
        trackedDays={product.trackedDays}
        fromPrice={product.fromPrice}
      />

      <SectionHeading title="Preços por loja" action={<span className="verified-label">Verificado há 12 min</span>} />
      <div className="store-list">
        {offers.map((offer, index) => (
          <div className="store-row" key={offer.store}>
            <div className="store-copy">
              <strong>{offer.store}</strong>
              {index === 0 && <small className="lowest-label">Menor preço</small>}
            </div>
            <strong className="store-price">{formatBRL(offer.price)}</strong>
            <a className={index === 0 ? 'button button-primary store-link' : 'store-text-link'} href={STORE_HOME_URLS[offer.store]} target="_blank" rel="noopener noreferrer">
              {index === 0 ? 'Ir para a loja' : 'Abrir loja'}
            </a>
          </div>
        ))}
      </div>
      {toast && <div className="toast-message" role="status">{toast}</div>}
    </div>
  );
}
