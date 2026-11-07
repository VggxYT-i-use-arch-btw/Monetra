import { createSeedDatabase } from './seed';
import type { Agent, AlertItem, MockDatabase, Settings } from '../domain/types';

const DATA_KEY = 'monetra.data';
const VERSION_KEY = 'monetra.schemaVersion';
const SCHEMA_VERSION = '1';
let memoryDatabase = createSeedDatabase();

function browserStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isAgent(value: unknown): value is Agent {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.name === 'string'
    && Array.isArray(value.productIds)
    && value.productIds.every((id) => typeof id === 'string')
    && ['ativo', 'pausado', 'erro'].includes(String(value.status));
}

function isAlert(value: unknown): value is AlertItem {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.productId === 'string'
    && typeof value.productName === 'string'
    && typeof value.minutesAgo === 'number';
}

function isSettings(value: unknown): value is Settings {
  if (!isRecord(value)) return false;
  const discord = value.discord;
  const email = value.email;
  const telegram = value.telegram;
  return ['Escuro', 'Claro', 'Sistema'].includes(String(value.appearance))
    && isRecord(discord)
    && typeof discord.connected === 'boolean'
    && typeof discord.webhook === 'string'
    && isRecord(email)
    && typeof email.connected === 'boolean'
    && typeof email.value === 'string'
    && isRecord(telegram)
    && typeof telegram.connected === 'boolean'
    && typeof telegram.value === 'string';
}

function isDatabase(value: unknown): value is MockDatabase {
  return isRecord(value)
    && value.schemaVersion === 1
    && Array.isArray(value.agents)
    && value.agents.every(isAgent)
    && Array.isArray(value.alerts)
    && value.alerts.every(isAlert)
    && isSettings(value.settings);
}

function save(database: MockDatabase): void {
  memoryDatabase = structuredClone(database);
  const storage = browserStorage();
  if (!storage) return;

  try {
    storage.setItem(VERSION_KEY, SCHEMA_VERSION);
    storage.setItem(DATA_KEY, JSON.stringify(database));
  } catch {
    // Storage can be disabled or full; the in-memory mock remains usable.
  }
}

function useSeed(): MockDatabase {
  const seed = createSeedDatabase();
  save(seed);
  return seed;
}

export function readDatabase(): MockDatabase {
  const storage = browserStorage();
  if (!storage) return structuredClone(memoryDatabase);

  try {
    const version = storage.getItem(VERSION_KEY);
    const raw = storage.getItem(DATA_KEY);
    if (version !== SCHEMA_VERSION || raw === null) return useSeed();
    const parsed: unknown = JSON.parse(raw);
    return isDatabase(parsed) ? structuredClone(parsed) : useSeed();
  } catch {
    return useSeed();
  }
}

export function writeDatabase(database: MockDatabase): void {
  save(database);
}
