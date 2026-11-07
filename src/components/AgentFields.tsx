import { ChevronRight } from 'lucide-react';
import type { AgentInput, Channel } from '../domain/types';

export type AgentPicker = 'category' | 'price' | 'brands' | 'stores' | 'frequency';

function FieldRow({
  title,
  value,
  onClick,
}: {
  title: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button className="field-row" type="button" onClick={onClick}>
      <span>{title}</span>
      <strong>{value}</strong>
      <ChevronRight aria-hidden="true" />
    </button>
  );
}

function ChannelButton({
  channel,
  selected,
  onClick,
}: {
  channel: Channel;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`channel-toggle${selected ? ' selected' : ''}`}
      type="button"
      aria-pressed={selected}
      onClick={onClick}
    >
      <span>{channel}</span>
      <span className="toggle-switch" aria-hidden="true" />
    </button>
  );
}

export function AgentFields({
  draft,
  onPick,
  onToggleChannel,
}: {
  draft: AgentInput;
  onPick: (picker: AgentPicker) => void;
  onToggleChannel: (channel: Channel) => void;
}) {
  const price = draft.maxPrice === undefined
    ? 'Qualquer preço'
    : `Até R$ ${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(draft.maxPrice)}`;
  const brands = draft.brands.length ? draft.brands.join(', ') : 'Todas as marcas';
  const stores = draft.stores.length === 1
    ? '1 loja selecionada'
    : `${draft.stores.length} lojas selecionadas`;

  return (
    <div className="agent-fields">
      <FieldRow title="Categoria" value={draft.category || 'Selecionar'} onClick={() => onPick('category')} />
      <FieldRow title="Faixa de preço" value={price} onClick={() => onPick('price')} />
      <FieldRow title="Marcas" value={brands} onClick={() => onPick('brands')} />
      <FieldRow title="Lojas" value={stores} onClick={() => onPick('stores')} />
      <FieldRow title="Frequência" value={draft.frequency} onClick={() => onPick('frequency')} />
      <div className="channel-field">
        <h2>Alertar por</h2>
        <div className="channel-options">
          {(['Discord', 'E-mail', 'Telegram'] as const).map((channel) => (
            <ChannelButton
              key={channel}
              channel={channel}
              selected={draft.channels.includes(channel)}
              onClick={() => onToggleChannel(channel)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
