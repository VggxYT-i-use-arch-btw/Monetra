export const STORE_NAMES = [
  'Magalu',
  'Kabum',
  'Shopee',
  'Mercado Livre',
  'Amazon',
] as const;

export type StoreName = (typeof STORE_NAMES)[number];
export type Category = 'Fones' | 'Cafeteiras' | 'Aspiradores';
export type Frequency = '1 h' | '6 h' | '24 h';
export type Channel = 'Discord' | 'E-mail' | 'Telegram';
export type AgentStatus = 'ativo' | 'pausado' | 'erro';
export type PriceRange = '7 dias' | '30 dias' | '90 dias' | 'Tudo';
export type AlertFilter = 'Todos' | 'Ofertas genuínas' | 'Mínimas históricas';
export type Appearance = 'Escuro' | 'Claro' | 'Sistema';

export interface StoreOffer {
  store: StoreName;
  price: number;
  url: string;
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  trackedDays: number;
  fromPrice?: number;
  offers: StoreOffer[];
  category: Category;
  history: PricePoint[];
}

export interface AgentInput {
  name: string;
  category: Category | '';
  maxPrice?: number;
  brands: string[];
  stores: StoreName[];
  frequency: Frequency;
  channels: Channel[];
}

export interface Agent extends AgentInput {
  id: string;
  category: Category;
  status: AgentStatus;
  productIds: string[];
  checkedLabel: string;
  errorStore?: StoreName;
}

export interface AlertItem {
  id: string;
  productId: string;
  productName: string;
  store: StoreName;
  oldPrice: number;
  newPrice: number;
  discount: number;
  minutesAgo: number;
  age?: string;
  tag?: 'Mínima histórica' | 'Oferta genuína';
  kind: 'genuine' | 'historical';
}

export interface Settings {
  appearance: Appearance;
  discord: { connected: boolean; webhook: string };
  email: { connected: boolean; value: string };
  telegram: { connected: boolean; value: string };
}

export interface Deal {
  productId: string;
  productName: string;
  store: StoreName;
  price: number;
  previousPrice: number;
  discount: number;
  label: string;
}

export interface InterpreterResult extends AgentInput {
  filters: string[];
}

export interface PriceStats {
  min: number;
  median: number;
  max: number;
  average: number;
}

export type VerdictKind = 'insufficient' | 'inflated' | 'genuine' | 'neutral';

export interface Verdict {
  kind: VerdictKind;
  label?: string;
  sentence: string;
  percentage?: number;
}

export interface MockDatabase {
  schemaVersion: 1;
  agents: Agent[];
  alerts: AlertItem[];
  settings: Settings;
}
