import { STORE_NAMES, type AgentInput, type Category, type InterpreterResult } from './types';

const KNOWN_BRANDS = ['Sony', 'Bose', 'Nespresso', 'Dyson'];

export function parseBRLInput(value: string): number | undefined {
  const match = value.replace(/R\$/gi, '').match(/\d[\d.]*\d|\d(?:,\d{1,2})?/);
  if (!match) return undefined;

  let normalized = match[0];
  if (normalized.includes(',')) {
    normalized = normalized.replace(/\./g, '').replace(',', '.');
  } else if (/^\d{1,3}(\.\d{3})+$/.test(normalized)) {
    normalized = normalized.replace(/\./g, '');
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function priceCapText(value: number): string {
  const price = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
  }).format(value);
  return `R$ ${price}`;
}

export function buildAgentName(category: Category | '', maxPrice?: number): string {
  if (category === 'Fones') {
    return maxPrice
      ? `Fones com cancelamento de ruído até ${priceCapText(maxPrice)}`
      : 'Fones com cancelamento de ruído';
  }
  if (category === 'Cafeteiras') return 'Máquinas de café Nespresso';
  if (category === 'Aspiradores') return 'Aspiradores sem fio';
  return '';
}

function findCategory(text: string): Category | '' {
  if (/fone|headphone|cancelamento de ru[ií]do|[áa]udio/.test(text)) return 'Fones';
  if (/caf[eé]|nespresso|cafeteira|c[aá]psula/.test(text)) return 'Cafeteiras';
  if (/aspirador|vassoura|limpeza/.test(text)) return 'Aspiradores';
  return '';
}

export function parseRequest(text: string): InterpreterResult {
  const normalized = text.toLocaleLowerCase('pt-BR');
  const category = findCategory(normalized);
  const priceMatch = normalized.match(/at[eé]\s*(?:r\$\s*)?([\d.]+(?:,\d{1,2})?)/i);
  const maxPrice = priceMatch ? parseBRLInput(priceMatch[1]) : undefined;
  const brands = KNOWN_BRANDS.filter((brand) =>
    normalized.includes(brand.toLocaleLowerCase('pt-BR')),
  );
  const filters = [
    ...(category ? [category] : []),
    ...(maxPrice ? [`Até ${priceCapText(maxPrice)}`] : []),
    ...brands,
  ];
  const name = buildAgentName(category, maxPrice) || text.trim();
  const input: AgentInput = {
    name,
    category,
    maxPrice,
    brands,
    stores: [...STORE_NAMES],
    frequency: '6 h',
    channels: [],
  };

  return { ...input, filters };
}
