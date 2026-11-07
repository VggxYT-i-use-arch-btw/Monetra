import { filterHistoryByRange, getHistoryStats } from '../domain/stats';
import { getVerdict } from '../domain/verdicts';
import type { Deal, PriceRange, Product } from '../domain/types';
import { cloneProduct, canonicalProductUrl, findProduct, simulateLatency } from './shared';
import { seedProducts } from './seed';

export async function getProduct(id: string): Promise<Product | undefined> {
  await simulateLatency();
  const product = findProduct(id);
  return product ? cloneProduct(product) : undefined;
}

export async function getPriceHistory(
  productId: string,
  range: PriceRange,
): Promise<Product['history']> {
  await simulateLatency();
  const product = findProduct(productId);
  return product
    ? filterHistoryByRange(product.history, range)
    : [];
}

export async function listDeals(): Promise<Deal[]> {
  await simulateLatency();
  return seedProducts
    .filter((product) => product.id === 'sony-wh1000xm5' || product.id === 'dyson-v8-absolute')
    .map((product) => {
      const bestOffer = [...product.offers].sort((left, right) => left.price - right.price)[0];
      const previousPrice = product.fromPrice ?? getHistoryStats(product.history).median;
      return {
        productId: product.id,
        productName: product.name,
        store: bestOffer.store,
        price: bestOffer.price,
        previousPrice,
        discount: Math.round((1 - bestOffer.price / previousPrice) * 100),
        label: getVerdict(product).label ?? '',
      };
    });
}

export function productForStoreUrl(input: string): Product | undefined {
  const target = canonicalProductUrl(input);
  if (!target) return undefined;

  const matches = seedProducts.filter((product) =>
    product.offers.some((offer) => canonicalProductUrl(offer.url) === target),
  );
  return matches.length === 1 ? cloneProduct(matches[0]) : undefined;
}
