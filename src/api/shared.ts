import { seedProducts } from './seed';
import type { Product } from '../domain/types';

export async function simulateLatency(): Promise<void> {
  const delay = 200 + Math.floor(Math.random() * 401);
  await new Promise<void>((resolve) => setTimeout(resolve, delay));
}

export function findProduct(id: string): Product | undefined {
  return seedProducts.find((product) => product.id === id);
}

export function cloneProduct(product: Product): Product {
  return structuredClone(product);
}

export function canonicalProductUrl(input: string): string | undefined {
  try {
    const url = new URL(input);
    url.search = '';
    url.hash = '';
    url.pathname = url.pathname.replace(/\/+$/, '') || '/';
    return `${url.origin.toLowerCase()}${url.pathname.toLowerCase()}`;
  } catch {
    return undefined;
  }
}
