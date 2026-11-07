import { buildAgentName } from '../domain/parser';
import type { Agent, AgentInput, Category } from '../domain/types';
import { seedProducts } from './seed';
import { simulateLatency } from './shared';
import { readDatabase, writeDatabase } from './storage';

function matchingProductIds(input: AgentInput): string[] {
  const selectedBrands = new Set(input.brands.map((brand) => brand.toLocaleLowerCase('pt-BR')));
  return seedProducts
    .filter((product) => product.category === input.category)
    .filter((product) => selectedBrands.size === 0
      || selectedBrands.has(product.brand.toLocaleLowerCase('pt-BR')))
    .filter((product) => {
      const selectedOffers = product.offers.filter((offer) => input.stores.includes(offer.store));
      if (selectedOffers.length === 0) return false;
      const lowest = Math.min(...selectedOffers.map((offer) => offer.price));
      return input.maxPrice === undefined || lowest <= input.maxPrice;
    })
    .map((product) => product.id);
}

function nameFor(input: AgentInput): string {
  return buildAgentName(input.category, input.maxPrice) || input.name.trim();
}

function newId(): string {
  return `agent-${globalThis.crypto.randomUUID()}`;
}

export async function listAgents(): Promise<Agent[]> {
  await simulateLatency();
  return readDatabase().agents;
}

export async function getAgent(id: string): Promise<Agent | undefined> {
  await simulateLatency();
  return readDatabase().agents.find((agent) => agent.id === id);
}

export async function createAgent(input: AgentInput): Promise<Agent> {
  await simulateLatency();
  if (!input.category) throw new Error('Selecione uma categoria para criar o agente.');

  const agent: Agent = {
    ...input,
    name: nameFor(input),
    id: newId(),
    category: input.category,
    status: 'ativo',
    productIds: matchingProductIds(input),
    checkedLabel: 'Verificado há 12 min',
  };
  const database = readDatabase();
  writeDatabase({ ...database, agents: [agent, ...database.agents] });
  return agent;
}

export async function updateAgent(
  id: string,
  patch: Partial<AgentInput>,
): Promise<Agent | undefined> {
  await simulateLatency();
  const database = readDatabase();
  const index = database.agents.findIndex((agent) => agent.id === id);
  if (index < 0) return undefined;

  const current = database.agents[index];
  const category: Category = patch.category || current.category;
  const input: AgentInput = { ...current, ...patch, category };
  const shouldRecompute = patch.category !== undefined
    || patch.brands !== undefined
    || patch.maxPrice !== undefined
    || patch.stores !== undefined;
  const updated: Agent = {
    ...current,
    ...patch,
    category,
    name: nameFor(input),
    productIds: shouldRecompute ? matchingProductIds(input) : current.productIds,
  };
  const agents = [...database.agents];
  agents[index] = updated;
  writeDatabase({ ...database, agents });
  return updated;
}

export async function setAgentStatus(
  id: string,
  status: 'ativo' | 'pausado',
): Promise<Agent | undefined> {
  await simulateLatency();
  const database = readDatabase();
  const agents = database.agents.map((agent) => agent.id === id ? { ...agent, status } : agent);
  const updated = agents.find((agent) => agent.id === id);
  if (updated) writeDatabase({ ...database, agents });
  return updated;
}

export async function deleteAgent(id: string): Promise<void> {
  await simulateLatency();
  const database = readDatabase();
  writeDatabase({ ...database, agents: database.agents.filter((agent) => agent.id !== id) });
}

