import { ChevronRight, Coffee, Headphones, Wind } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatBRL } from '../domain/formatting';
import type { Deal } from '../domain/types';

function DealIcon({ productId }: { productId: string }) {
  if (productId.includes('sony') || productId.includes('bose')) {
    return <Headphones aria-hidden="true" />;
  }
  if (productId.includes('nespresso')) return <Coffee aria-hidden="true" />;
  return <Wind aria-hidden="true" />;
}

export function DealRow({ deal }: { deal: Deal }) {
  return (
    <Link className="deal-row" to={`/produtos/${deal.productId}`}>
      <DealIcon productId={deal.productId} />
      <span className="deal-copy">
        <strong>{deal.productName}</strong>
        <small>{deal.store}</small>
        <b>{formatBRL(deal.price)}</b>
      </span>
      <span className="deal-discount">{deal.discount}% abaixo</span>
      <ChevronRight className="deal-chevron" aria-hidden="true" />
    </Link>
  );
}
