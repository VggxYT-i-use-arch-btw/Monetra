import { formatBRL } from './formatting';
import { getHistoryStats } from './stats';
import type { Product, Verdict } from './types';

export function getVerdict(product: Product): Verdict {
  if (product.trackedDays < 14) {
    return {
      kind: 'insufficient',
      label: 'Dados insuficientes',
      sentence: `Acompanhamos este produto há ${product.trackedDays} dias. Precisamos de pelo menos 14 dias para avaliar promoções.`,
    };
  }

  const stats = getHistoryStats(product.history);
  const current = Math.min(...product.offers.map((offer) => offer.price));

  const inflatedBoundary = stats.average * 1.15;
  const roundingTolerance = Math.max(1e-9, Math.abs(inflatedBoundary) * Number.EPSILON);
  if (product.fromPrice
    && product.fromPrice > inflatedBoundary + roundingTolerance
    && current >= stats.average) {
    const percentage = Math.round((1 - current / product.fromPrice) * 100);
    return {
      kind: 'inflated',
      label: 'Preço inflado antes',
      sentence: `O desconto mostra ${percentage}%, mas a média em 90 dias foi ${formatBRL(stats.average)}.`,
      percentage,
    };
  }

  const percentage = Math.round((1 - current / stats.median) * 100);
  if (current <= stats.min || current <= stats.median * 0.85) {
    return {
      kind: 'genuine',
      label: 'Oferta genuína',
      sentence: `Menor preço em 90 dias e ${percentage}% abaixo da mediana.`,
      percentage,
    };
  }

  return {
    kind: 'neutral',
    sentence: 'Preço dentro da faixa dos últimos 90 dias.',
  };
}
