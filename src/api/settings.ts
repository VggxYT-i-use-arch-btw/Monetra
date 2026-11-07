import { formatRelativeMinutes } from '../domain/formatting';
import type { AlertFilter, AlertItem, Channel, Settings } from '../domain/types';
import { simulateLatency } from './shared';
import { readDatabase, writeDatabase } from './storage';

export type SettingsPatch = {
  appearance?: Settings['appearance'];
  discord?: Partial<Settings['discord']>;
  email?: Partial<Settings['email']>;
  telegram?: Partial<Settings['telegram']>;
};

export interface PlanUsage {
  agents: number;
  agentLimit: number;
  products: number;
  productLimit: number;
}

export async function listAlerts(filter: AlertFilter = 'Todos'): Promise<AlertItem[]> {
  await simulateLatency();
  const alerts = readDatabase().alerts.map((alert) => ({
    ...alert,
    age: formatRelativeMinutes(alert.minutesAgo),
  }));

  if (filter === 'Mínimas históricas') return alerts.filter((alert) => alert.kind === 'historical');
  if (filter === 'Ofertas genuínas') return alerts.filter((alert) => alert.kind === 'genuine');
  return alerts;
}

export async function getSettings(): Promise<Settings> {
  await simulateLatency();
  return readDatabase().settings;
}

export async function updateSettings(patch: SettingsPatch): Promise<Settings> {
  await simulateLatency();
  const database = readDatabase();
  const settings: Settings = {
    ...database.settings,
    ...patch,
    discord: { ...database.settings.discord, ...patch.discord },
    email: { ...database.settings.email, ...patch.email },
    telegram: { ...database.settings.telegram, ...patch.telegram },
  };
  writeDatabase({ ...database, settings });
  return settings;
}

export async function connectChannel(channel: Channel, value: string): Promise<Settings> {
  if (channel === 'Discord') {
    return updateSettings({ discord: { connected: true, webhook: value } });
  }
  if (channel === 'E-mail') {
    return updateSettings({ email: { connected: true, value } });
  }
  return updateSettings({ telegram: { connected: true, value } });
}

export async function testWebhook(url: string): Promise<{ ok: boolean; error?: string }> {
  await simulateLatency();
  const valid = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w.-]+$/.test(url);
  if (!valid) return { ok: false, error: 'Informe um webhook válido do Discord.' };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Teste de conexão do Monetra.' }),
    });
    return response.ok
      ? { ok: true }
      : { ok: false, error: 'O Discord recusou o teste. Confira o webhook e tente novamente.' };
  } catch {
    return {
      ok: false,
      error: 'O navegador não conseguiu enviar o teste. O teste real será feito pelo backend.',
    };
  }
}

export async function getPlanUsage(): Promise<PlanUsage> {
  await simulateLatency();
  const agents = readDatabase().agents;
  const productIds = new Set(agents.flatMap((agent) => agent.productIds));
  return {
    agents: agents.length,
    agentLimit: 3,
    products: productIds.size,
    productLimit: 20,
  };
}
