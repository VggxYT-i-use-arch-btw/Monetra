import { STORE_NAMES, type Agent, type AlertItem, type MockDatabase } from '../domain/types';
export { seedProducts } from './products-seed';

export const seedAgents: Agent[] = [
  {
    id: 'agent-fones',
    name: 'Fones com cancelamento de ruído até R$ 1.500',
    category: 'Fones',
    maxPrice: 1500,
    brands: ['Sony', 'Bose'],
    stores: [...STORE_NAMES],
    frequency: '6 h',
    channels: ['Discord'],
    status: 'ativo',
    productIds: ['sony-wh1000xm5', 'bose-qc-ultra', 'sony-wh1000xm4', 'bose-qc45', 'sony-ult-wear'],
    checkedLabel: 'Verificado há 12 min',
  },
  {
    id: 'agent-cafe',
    name: 'Máquinas de café Nespresso',
    category: 'Cafeteiras',
    brands: ['Nespresso'],
    stores: [...STORE_NAMES],
    frequency: '6 h',
    channels: [],
    status: 'pausado',
    productIds: ['nespresso-essenza-mini', 'nespresso-inissia', 'nespresso-vertuo-pop'],
    checkedLabel: 'Verificado há 1 h',
  },
  {
    id: 'agent-aspiradores',
    name: 'Aspiradores sem fio',
    category: 'Aspiradores',
    brands: ['Dyson'],
    stores: [...STORE_NAMES],
    frequency: '6 h',
    channels: [],
    status: 'erro',
    productIds: ['dyson-v8-absolute', 'dyson-v12-detect', 'dyson-v10', 'electrolux-ergorapido'],
    checkedLabel: 'Verificado há 2 h',
    errorStore: 'Shopee',
  },
];

export const seedAlerts: AlertItem[] = [
  {
    id: 'alert-sony-magalu',
    productId: 'sony-wh1000xm5',
    productName: 'Sony WH-1000XM5 Black',
    store: 'Magalu',
    oldPrice: 1499,
    newPrice: 1349,
    discount: 10,
    minutesAgo: 8,
    tag: 'Mínima histórica',
    kind: 'historical',
  },
  {
    id: 'alert-sony-kabum',
    productId: 'sony-wh1000xm5',
    productName: 'Sony WH-1000XM5 Black',
    store: 'Kabum',
    oldPrice: 1549.9,
    newPrice: 1429.9,
    discount: 8,
    minutesAgo: 180,
    tag: 'Oferta genuína',
    kind: 'genuine',
  },
  {
    id: 'alert-nespresso',
    productId: 'nespresso-essenza-mini',
    productName: 'Nespresso Essenza Mini',
    store: 'Kabum',
    oldPrice: 499,
    newPrice: 449,
    discount: 10,
    minutesAgo: 300,
    kind: 'genuine',
  },
];

export const seedSettings = {
  appearance: 'Escuro',
  discord: {
    connected: true,
    webhook: 'https://discord.com/api/webhooks/1234567890/PLACEHOLDER_TOKEN_NOT_REAL',
  },
  email: { connected: false, value: '' },
  telegram: { connected: false, value: '' },
} as const;

export function createSeedDatabase(): MockDatabase {
  return structuredClone({
    schemaVersion: 1,
    agents: seedAgents,
    alerts: seedAlerts,
    settings: seedSettings,
  });
}
