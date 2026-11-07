import { describe, expect, it } from 'vitest';
import { createAgent, deleteAgent, listAgents, updateAgent } from '../../src/api/agents';
import { productForStoreUrl } from '../../src/api/products';
import { getPlanUsage } from '../../src/api/settings';
import { STORE_NAMES, type AgentInput } from '../../src/domain/types';

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void { this.values.set(key, String(value)); }
}

function withBrowserStorage(storage: Storage): () => void {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { localStorage: storage },
  });
  return () => {
    if (previous) Object.defineProperty(globalThis, 'window', previous);
    else Reflect.deleteProperty(globalThis, 'window');
  };
}

describe('API mock e persistência', () => {
  it('recupera dados inválidos, filtra agentes, recalcula produtos e conta uso do plano', async () => {
    const storage = new MemoryStorage();
    const restore = withBrowserStorage(storage);
    storage.setItem('monetra.schemaVersion', '1');
    storage.setItem('monetra.data', '{valor corrompido');

    try {
      expect(await listAgents()).toHaveLength(3);
      const input: AgentInput = {
        name: '',
        category: 'Fones',
        maxPrice: 1500,
        brands: ['Sony'],
        stores: [...STORE_NAMES],
        frequency: '6 h',
        channels: [],
      };
      const created = await createAgent(input);
      expect(created.name).toBe('Fones com cancelamento de ruído até R$ 1.500');
      expect(created.productIds).toEqual(['sony-wh1000xm5', 'sony-ult-wear']);

      const usage = await getPlanUsage();
      expect(usage).toMatchObject({ agents: 4, agentLimit: 3, products: 12, productLimit: 20 });

      const updated = await updateAgent(created.id, {
        category: 'Cafeteiras',
        brands: ['Nespresso'],
      });
      expect(updated?.name).toBe('Máquinas de café Nespresso');
      expect(updated?.productIds).toHaveLength(3);

      await deleteAgent(created.id);
      expect(await listAgents()).toHaveLength(3);
      expect(storage.getItem('monetra.schemaVersion')).toBe('1');
      expect(storage.getItem('monetra.data')).not.toBe('{valor corrompido');
    } finally {
      restore();
    }
  });

  it('só associa um link à oferta com o mesmo endereço de produto', () => {
    expect(productForStoreUrl(
      'https://www.kabum.com.br/produto/sony-wh1000xm5?origem=teste',
    )?.id).toBe('sony-wh1000xm5');
    expect(productForStoreUrl('https://www.kabum.com.br')).toBeUndefined();
    expect(productForStoreUrl('https://www.amazon.com.br/dp/outro-produto')).toBeUndefined();
  });
});
