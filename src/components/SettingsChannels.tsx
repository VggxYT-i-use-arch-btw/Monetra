import { useEffect, useState } from 'react';
import * as api from '../api';
import type { Channel, Settings } from '../domain/types';
import { SectionHeading } from './SectionHeading';
import { Sheet } from './Sheet';

const webhookPattern = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w.-]+$/;

export function SettingsChannels({
  settings,
  onChange,
}: {
  settings: Settings;
  onChange: (settings: Settings) => void;
}) {
  const [webhook, setWebhook] = useState(settings.discord.webhook);
  const [revealed, setRevealed] = useState(false);
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState<Channel | null>(null);
  const [channelValue, setChannelValue] = useState('');

  useEffect(() => setWebhook(settings.discord.webhook), [settings.discord.webhook]);

  const valid = webhookPattern.test(webhook);
  const changed = webhook !== settings.discord.webhook;

  async function saveWebhook(): Promise<void> {
    const updated = await api.updateSettings({ discord: { webhook } });
    onChange(updated);
    setMessage('Webhook salvo.');
  }

  async function runWebhookTest(): Promise<void> {
    const result = await api.testWebhook(webhook);
    setMessage(result.ok
      ? 'Teste enviado.'
      : result.error ?? 'O teste não foi concluído.');
  }

  function openChannel(target: Channel): void {
    setChannel(target);
    setChannelValue(target === 'E-mail' ? settings.email.value : settings.telegram.value);
  }

  async function saveChannel(): Promise<void> {
    if (!channel || !channelValue.trim()) return;
    onChange(await api.connectChannel(channel, channelValue.trim()));
    setChannel(null);
  }

  async function disconnectChannel(): Promise<void> {
    if (channel === 'E-mail') {
      onChange(await api.updateSettings({ email: { connected: false, value: '' } }));
    } else if (channel === 'Telegram') {
      onChange(await api.updateSettings({ telegram: { connected: false, value: '' } }));
    }
    setChannel(null);
  }

  return (
    <>
      <SectionHeading title="Canais de notificação" />
      <section className="settings-channel-card">
        <div className="channel-status-row">
          <strong>Discord</strong>
          <span className={settings.discord.connected ? 'connected-label' : ''}>
            {settings.discord.connected ? 'Conectado' : 'Não conectado'}
          </span>
        </div>
        {settings.discord.connected && (
          <>
            <div className="webhook-field">
              <label className="sr-only" htmlFor="discord-webhook">Webhook do Discord</label>
              <input
                id="discord-webhook"
                className="text-input mono-input"
                type={revealed ? 'text' : 'password'}
                value={webhook}
                onChange={(event) => { setWebhook(event.target.value); setMessage(''); }}
              />
              <button className="text-button" onClick={() => setRevealed((value) => !value)}>
                {revealed ? 'Ocultar' : 'Revelar'}
              </button>
            </div>
            {webhook && !valid && <p className="inline-error">Informe um webhook válido do Discord.</p>}
            {changed && <button className="button button-outline button-full" disabled={!valid} onClick={() => void saveWebhook()}>Salvar</button>}
            <button className="button button-outline button-full" disabled={!valid} onClick={() => void runWebhookTest()}>Testar webhook</button>
            {message && <p className={message.includes('válido') || message.includes('recusou') ? 'inline-error' : 'inline-notice'} role="status">{message}</p>}
          </>
        )}
        {(['E-mail', 'Telegram'] as const).map((target) => {
          const channelSettings = target === 'E-mail' ? settings.email : settings.telegram;
          return (
            <button className="channel-status-row channel-action-row" key={target} onClick={() => openChannel(target)}>
              <strong>{target}</strong>
              <span className={channelSettings.connected ? 'connected-label' : ''}>
                {channelSettings.connected ? 'Conectado' : 'Não conectado'} ·
              </span>
            </button>
          );
        })}
      </section>

      {channel && (
        <Sheet title={`Conectar ${channel}`} onClose={() => setChannel(null)}>
          <label className="input-label" htmlFor="settings-channel-value">
            {channel === 'E-mail' ? 'Endereço de e-mail' : 'Nome de usuário ou código do Telegram'}
          </label>
          <input
            id="settings-channel-value"
            className="text-input"
            value={channelValue}
            onChange={(event) => setChannelValue(event.target.value)}
            placeholder={channel === 'E-mail' ? 'voce@exemplo.com' : '@seu_usuario'}
          />
          <div className="sheet-actions">
            <button className="button button-primary" disabled={!channelValue.trim()} onClick={() => void saveChannel()}>Conectar</button>
            {(channel === 'E-mail' ? settings.email.connected : settings.telegram.connected)
              && <button className="button button-outline destructive" onClick={() => void disconnectChannel()}>Desconectar</button>}
          </div>
        </Sheet>
      )}
    </>
  );
}
