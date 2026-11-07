import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import * as api from '../api';
import { AgentFields, type AgentPicker } from '../components/AgentFields';
import { AgentPickerSheet } from '../components/AgentPickerSheet';
import { PageHeading } from '../components/PageHeading';
import { ErrorState, LoadingState } from '../components/States';
import { Sheet } from '../components/Sheet';
import { buildAgentName, parseBRLInput } from '../domain/parser';
import { interpreterFromRouteState } from '../domain/route-state';
import type { Agent, AgentInput, Category, Settings } from '../domain/types';
import { useAgentChannels } from './useAgentChannels';

function blankDraft(): AgentInput {
  return { name: '', category: '', brands: [], stores: [], frequency: '6 h', channels: [] };
}

function draftFromAgent(agent: Agent): AgentInput {
  return {
    name: agent.name,
    category: agent.category,
    maxPrice: agent.maxPrice,
    brands: [...agent.brands],
    stores: [...agent.stores],
    frequency: agent.frequency,
    channels: [...agent.channels],
  };
}

export function AgentFormPage({ edit = false }: { edit?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const initialRequest = interpreterFromRouteState(location.state);
  const [draft, setDraft] = useState<AgentInput>(() => initialRequest ?? blankDraft());
  const [settings, setSettings] = useState<Settings | null>(null);
  const [picker, setPicker] = useState<AgentPicker | null>(null);
  const [priceValue, setPriceValue] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const channelControls = useAgentChannels(draft, setDraft, settings, setSettings);

  useEffect(() => {
    let current = true;
    setLoading(true);
    setError('');
    const agentRequest = edit && id ? api.getAgent(id) : Promise.resolve(undefined);
    Promise.all([api.getSettings(), agentRequest])
      .then(([storedSettings, agent]) => {
        if (!current) return;
        setSettings(storedSettings);
        if (edit && !agent) setError('Não encontramos este agente.');
        if (agent) setDraft(draftFromAgent(agent));
      })
      .catch(() => current && setError('Não foi possível carregar os dados do formulário.'))
      .finally(() => current && setLoading(false));
    return () => { current = false; };
  }, [edit, id, retry]);

  function updateName(category: Category | '', maxPrice?: number): string {
    return buildAgentName(category, maxPrice);
  }

  function chooseCategory(category: Category): void {
    setDraft((current) => ({
      ...current,
      category,
      name: updateName(category, current.maxPrice),
    }));
    setPicker(null);
  }

  function openPicker(nextPicker: AgentPicker): void {
    if (nextPicker === 'price') {
      setPriceValue(draft.maxPrice === undefined
        ? ''
        : new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(draft.maxPrice));
    }
    setPicker(nextPicker);
  }

  function applyPrice(): void {
    const parsed = parseBRLInput(priceValue);
    if (priceValue.trim() && parsed === undefined) {
      setError('Digite um preço válido.');
      return;
    }
    setDraft((current) => {
      const unchanged = parsed === current.maxPrice;
      const maxPrice = unchanged ? current.maxPrice : parsed;
      return { ...current, maxPrice, name: updateName(current.category, maxPrice) };
    });
    setError('');
    setPicker(null);
  }

  async function submit(): Promise<void> {
    if (!draft.category || draft.stores.length === 0) return;
    setSaving(true);
    setError('');
    try {
      if (edit && id) {
        const updated = await api.updateAgent(id, draft);
        if (!updated) throw new Error('Não encontramos este agente.');
        navigate(`/agentes/${updated.id}`);
      } else {
        const created = await api.createAgent(draft);
        navigate('/agentes/novo/criado', { state: { agent: created } });
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível salvar o agente.');
      setSaving(false);
    }
  }

  if (loading) return <LoadingState label="Carregando formulário" />;
  if (!settings) {
    return error
      ? <div className="page standard-page"><ErrorState message={error} retry={() => setRetry((value) => value + 1)} /></div>
      : <LoadingState label="Carregando ajustes" />;
  }

  return (
    <div className="page form-page">
      <PageHeading title={edit ? 'Editar agente' : 'Novo agente'} back />
      {initialRequest && <p className="form-intro">Revise o que a IA entendeu. Você pode editar qualquer campo.</p>}
      <AgentFields
        draft={draft}
        onPick={openPicker}
        onToggleChannel={channelControls.toggleChannel}
      />
      {error && <p className="inline-error" role="alert">{error}</p>}
      <button
        className="button button-primary button-full form-submit"
        disabled={!draft.category || draft.stores.length === 0 || saving}
        onClick={() => void submit()}
      >
        {saving ? 'Salvando...' : edit ? 'Salvar' : 'Criar agente'}
      </button>
      {picker && (
        <AgentPickerSheet
          picker={picker}
          draft={draft}
          priceValue={priceValue}
          customBrand={customBrand}
          onPriceChange={setPriceValue}
          onCustomBrandChange={setCustomBrand}
          onApplyPrice={applyPrice}
          onCategory={chooseCategory}
          onToggleBrand={(brand) => setDraft((current) => ({
            ...current,
            brands: current.brands.includes(brand)
              ? current.brands.filter((item) => item !== brand)
              : [...current.brands, brand],
          }))}
          onAddBrand={() => {
            const brand = customBrand.trim();
            if (brand && !draft.brands.includes(brand)) {
              setDraft((current) => ({ ...current, brands: [...current.brands, brand] }));
            }
            setCustomBrand('');
          }}
          onToggleStore={(store) => setDraft((current) => ({
            ...current,
            stores: current.stores.includes(store)
              ? current.stores.filter((item) => item !== store)
              : [...current.stores, store],
          }))}
          onFrequency={(frequency) => {
            setDraft((current) => ({ ...current, frequency: frequency as AgentInput['frequency'] }));
          }}
          onClose={() => setPicker(null)}
        />
      )}
      {channelControls.target && (
        <Sheet title={`Conectar ${channelControls.target}`} onClose={() => channelControls.setTarget(null)}>
          <label className="input-label" htmlFor="channel-value">
            {channelControls.target === 'E-mail' ? 'Endereço de e-mail' : 'Nome de usuário ou código do Telegram'}
          </label>
          <input
            id="channel-value"
            className="text-input"
            value={channelControls.value}
            onChange={(event) => channelControls.setValue(event.target.value)}
            placeholder={channelControls.target === 'E-mail' ? 'voce@exemplo.com' : '@seu_usuario'}
          />
          <button className="button button-primary button-full" disabled={!channelControls.value.trim()} onClick={() => void channelControls.connectSelectedChannel()}>
            Conectar
          </button>
        </Sheet>
      )}
    </div>
  );
}
