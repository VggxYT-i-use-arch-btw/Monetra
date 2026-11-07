import type { Agent, InterpreterResult } from './types';

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isInterpreterResult(value: unknown): value is InterpreterResult {
  return record(value)
    && typeof value.name === 'string'
    && (value.category === '' || value.category === 'Fones'
      || value.category === 'Cafeteiras' || value.category === 'Aspiradores')
    && Array.isArray(value.brands)
    && Array.isArray(value.stores)
    && Array.isArray(value.channels)
    && Array.isArray(value.filters)
    && typeof value.frequency === 'string';
}

export function interpreterFromRouteState(state: unknown): InterpreterResult | undefined {
  if (!record(state) || !('request' in state)) return undefined;
  return isInterpreterResult(state.request) ? state.request : undefined;
}

export function isAgent(value: unknown): value is Agent {
  return record(value)
    && typeof value.id === 'string'
    && typeof value.name === 'string'
    && ['Fones', 'Cafeteiras', 'Aspiradores'].includes(String(value.category))
    && ['ativo', 'pausado', 'erro'].includes(String(value.status))
    && Array.isArray(value.stores)
    && Array.isArray(value.channels)
    && Array.isArray(value.productIds)
    && typeof value.frequency === 'string';
}
