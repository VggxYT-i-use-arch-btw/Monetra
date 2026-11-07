import type { Category, Product, StoreName } from '../domain/types';

const STORE_ROOTS: Record<StoreName, string> = {
  Magalu: 'https://www.magazineluiza.com.br',
  Kabum: 'https://www.kabum.com.br',
  Shopee: 'https://shopee.com.br',
  'Mercado Livre': 'https://www.mercadolivre.com.br',
  Amazon: 'https://www.amazon.com.br',
};

function offerUrl(store: StoreName, id: string): string {
  const paths: Record<StoreName, string> = {
    Magalu: `/produto/${id}`,
    Kabum: `/produto/${id}`,
    Shopee: `/product/${id}`,
    'Mercado Livre': `/produto/${id}`,
    Amazon: `/dp/${id}`,
  };
  return `${STORE_ROOTS[store]}${paths[store]}`;
}

function offer(store: StoreName, productId: string, price: number) {
  return { store, price, url: offerUrl(store, productId) };
}

function datesFor(prices: number[]) {
  return prices.map((price, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - (prices.length - index - 1));
    return { date: date.toISOString().slice(0, 10), price };
  });
}

function sonyHistory() {
  const aboveMedian = Array.from({ length: 43 }, (_, index) =>
    Math.round(1830 - index * 4.5 + Math.sin(index * 0.51) * 24),
  );
  const belowMedian = Array.from({ length: 43 }, (_, index) =>
    Math.round(1628 - index * 5.7 + Math.sin(index * 0.47) * 13),
  );
  return datesFor([1899, ...aboveMedian, 1629, 1629, ...belowMedian, 1349]);
}

function flatHistory(price: number, days: number) {
  const values = Array.from({ length: days }, (_, index) =>
    Math.round(price * (1.04 - (index / Math.max(1, days - 1)) * 0.04)),
  );
  values[values.length - 1] = price;
  return datesFor(values);
}

function extraProduct(
  id: string,
  name: string,
  brand: string,
  category: Category,
  store: StoreName,
  price: number,
): Product {
  return {
    id,
    name,
    brand,
    category,
    trackedDays: 35,
    offers: [offer(store, id, price)],
    history: flatHistory(price, 35),
  };
}

const sony: Product = {
  id: 'sony-wh1000xm5',
  name: 'Sony WH-1000XM5 Black',
  brand: 'Sony',
  category: 'Fones',
  trackedDays: 90,
  offers: [
    offer('Magalu', 'sony-wh1000xm5', 1349),
    offer('Kabum', 'sony-wh1000xm5', 1429.9),
    offer('Shopee', 'sony-wh1000xm5', 1459),
    offer('Mercado Livre', 'sony-wh1000xm5', 1499),
    offer('Amazon', 'sony-wh1000xm5', 1549.9),
  ],
  history: sonyHistory(),
};

const dyson: Product = {
  id: 'dyson-v8-absolute',
  name: 'Dyson V8 Absolute',
  brand: 'Dyson',
  category: 'Aspiradores',
  trackedDays: 90,
  fromPrice: 3499,
  offers: [offer('Amazon', 'dyson-v8-absolute', 2899), offer('Magalu', 'dyson-v8-absolute', 2949)],
  history: datesFor([3499, ...Array.from({ length: 88 }, () => 2781), 2899]),
};

const nespresso: Product = {
  id: 'nespresso-essenza-mini',
  name: 'Nespresso Essenza Mini',
  brand: 'Nespresso',
  category: 'Cafeteiras',
  trackedDays: 4,
  offers: [offer('Kabum', 'nespresso-essenza-mini', 449)],
  history: datesFor([499, 479, 469, 449]),
};

export const seedProducts: Product[] = [
  sony,
  dyson,
  nespresso,
  extraProduct('bose-qc-ultra', 'Bose QuietComfort Ultra', 'Bose', 'Fones', 'Amazon', 2299),
  extraProduct('sony-wh1000xm4', 'Sony WH-1000XM4', 'Sony', 'Fones', 'Kabum', 1899),
  extraProduct('bose-qc45', 'Bose QuietComfort 45', 'Bose', 'Fones', 'Magalu', 1799),
  extraProduct('sony-ult-wear', 'Sony ULT Wear', 'Sony', 'Fones', 'Shopee', 999),
  extraProduct('nespresso-inissia', 'Nespresso Inissia', 'Nespresso', 'Cafeteiras', 'Amazon', 599),
  extraProduct('nespresso-vertuo-pop', 'Nespresso Vertuo Pop', 'Nespresso', 'Cafeteiras', 'Magalu', 699),
  extraProduct('dyson-v12-detect', 'Dyson V12 Detect Slim', 'Dyson', 'Aspiradores', 'Amazon', 4299),
  extraProduct('dyson-v10', 'Dyson Cyclone V10', 'Dyson', 'Aspiradores', 'Kabum', 3499),
  extraProduct('electrolux-ergorapido', 'Electrolux Ergorapido', 'Electrolux', 'Aspiradores', 'Magalu', 899),
];

