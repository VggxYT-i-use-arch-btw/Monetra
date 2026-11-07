import { parseRequest } from '../domain/parser';
import type { InterpreterResult } from '../domain/types';
import { listAgents, getAgent, createAgent, updateAgent, setAgentStatus, deleteAgent } from './agents';
import { getProduct, getPriceHistory, listDeals, productForStoreUrl } from './products';
import { connectChannel, getPlanUsage, getSettings, listAlerts, testWebhook, updateSettings } from './settings';
import { readDatabase } from './storage';
import { simulateLatency } from './shared';

export async function interpretRequest(text: string): Promise<InterpreterResult> {
  await simulateLatency();
  const result = parseRequest(text);
  const settings = readDatabase().settings;
  return {
    ...result,
    channels: settings.discord.connected ? ['Discord'] : [],
  };
}

export {
  listAgents,
  getAgent,
  createAgent,
  updateAgent,
  setAgentStatus,
  deleteAgent,
  getProduct,
  getPriceHistory,
  listDeals,
  listAlerts,
  getSettings,
  updateSettings,
  testWebhook,
  connectChannel,
  getPlanUsage,
  productForStoreUrl,
};

export type { SettingsPatch, PlanUsage } from './settings';
export { STORE_NAMES as stores } from '../domain/types';
export const categories = ['Fones', 'Cafeteiras', 'Aspiradores'] as const;
export const frequencies = ['1 h', '6 h', '24 h'] as const;
