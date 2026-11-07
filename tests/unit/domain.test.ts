import { describe, expect, it } from 'vitest';
import { seedProducts } from '../../src/api/seed';
import { formatBRL, formatDate } from '../../src/domain/formatting';
import { parseBRLInput, parseRequest } from '../../src/domain/parser';
import { filterHistoryByRange, getHistoryStats } from '../../src/domain/stats';
import { getVerdict } from '../../src/domain/verdicts';
import type { Product } from '../../src/domain/types';

describe('leitura de preços e solicitações', () => {
  it.each([
    ['1500', 1500],
    ['1.500', 1500],
    ['1.500,00', 1500],
    ['até R$ 1.500', 1500],
  ])('interpreta %s como R$ %i', (value, expected) => {
    expect(parseBRLInput(value)).toBe(expected);
  });

  it('extrai categoria, marca, limite e nome atualizado', () => {
    const result = parseRequest('Fone Sony com cancelamento de ruído até R$ 1.500');
    expect(result.category).toBe('Fones');
    expect(result.brands).toEqual(['Sony']);
    expect(result.maxPrice).toBe(1500);
    expect(result.name).toBe('Fones com cancelamento de ruído até R$ 1.500');
  });
});

function testProduct(prices: number[], current: number, fromPrice?: number): Product {
  return {
    id: 'produto-teste',
    name: 'Produto de teste',
    brand: 'Marca',
    category: 'Fones',
    trackedDays: prices.length,
    fromPrice,
    offers: [{ store: 'Magalu', price: current, url: 'https://www.magazineluiza.com.br/produto' }],
    history: prices.map((price, index) => ({ date: `2025-01-${String(index + 1).padStart(2, '0')}`, price })),
  };
}

describe('regras de veredito', () => {
  it('prioriza dados insuficientes mesmo quando as outras regras também se aplicam', () => {
    const result = getVerdict(testProduct(Array(4).fill(100), 80, 500));
    expect(result.kind).toBe('insufficient');
    expect(result.label).toBe('Dados insuficientes');
  });

  it('usa limite estrito de 15% para preço inflado', () => {
    expect(getVerdict(testProduct(Array(14).fill(100), 101, 115)).kind).toBe('neutral');
    expect(getVerdict(testProduct(Array(14).fill(100), 101, 115.01)).kind).toBe('inflated');
  });

  it('considera genuína a oferta no limite de 85% da mediana', () => {
    expect(getVerdict(testProduct(Array(14).fill(100), 85)).kind).toBe('genuine');
    const aboveBoundary = testProduct([80, ...Array(13).fill(100)], 85.01);
    expect(getVerdict(aboveBoundary).kind).toBe('neutral');
  });

  it('marca o mínimo histórico e deixa o caso neutro sem etiqueta', () => {
    expect(getVerdict(testProduct([100, ...Array(13).fill(110)], 100)).kind).toBe('genuine');
    const neutral = getVerdict(testProduct(Array(14).fill(100), 101));
    expect(neutral.kind).toBe('neutral');
    expect(neutral.label).toBeUndefined();
  });
});

describe('formatação e séries', () => {
  it('formata BRL e datas, e protege entradas inválidas', () => {
    expect(formatBRL(1349)).toContain('R$');
    expect(formatBRL(1349)).toContain('1.349,00');
    expect(formatDate('2025-10-14')).toBe('14 de out');
    expect(formatDate('não é data')).toBe('—');
    expect(formatDate(undefined)).toBe('—');
  });

  it('mantém mínimo, mediana e máximo exatos na série Sony', () => {
    const sony = seedProducts.find((product) => product.id === 'sony-wh1000xm5');
    expect(sony).toBeDefined();
    expect(getHistoryStats(sony!.history)).toMatchObject({ min: 1349, median: 1629, max: 1899 });
  });

  it('filtra 7, 30, 90 dias e tudo', () => {
    const now = new Date('2025-04-10T12:00:00');
    const history = Array.from({ length: 100 }, (_, index) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (99 - index));
      return { date: date.toISOString().slice(0, 10), price: index };
    });
    expect(filterHistoryByRange(history, '7 dias', now)).toHaveLength(7);
    expect(filterHistoryByRange(history, '30 dias', now)).toHaveLength(30);
    expect(filterHistoryByRange(history, '90 dias', now)).toHaveLength(90);
    expect(filterHistoryByRange(history, 'Tudo', now)).toHaveLength(100);
  });
});
