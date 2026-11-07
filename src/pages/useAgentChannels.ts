import { useState, type Dispatch, type SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../api';
import type { AgentInput, Channel, Settings } from '../domain/types';

export function useAgentChannels(
  draft: AgentInput,
  setDraft: Dispatch<SetStateAction<AgentInput>>,
  settings: Settings | null,
  setSettings: Dispatch<SetStateAction<Settings | null>>,
) {
  const navigate = useNavigate();
  const [target, setTarget] = useState<Channel | null>(null);
  const [value, setValue] = useState('');

  function toggleChannel(channel: Channel): void {
    if (draft.channels.includes(channel)) {
      setDraft((current) => ({
        ...current,
        channels: current.channels.filter((item) => item !== channel),
      }));
      return;
    }

    if (channel === 'Discord') {
      if (!settings?.discord.connected) {
        navigate('/ajustes', { state: { message: 'Conecte o Discord antes de ativar este canal.' } });
        return;
      }
      setDraft((current) => ({ ...current, channels: [...current.channels, channel] }));
      return;
    }

    const saved = channel === 'E-mail' ? settings?.email : settings?.telegram;
    if (saved?.connected) {
      setDraft((current) => ({ ...current, channels: [...current.channels, channel] }));
      return;
    }
    setTarget(channel);
    setValue('');
  }

  async function connectSelectedChannel(): Promise<void> {
    if (!target || !value.trim()) return;
    const connected = await api.connectChannel(target, value.trim());
    setSettings(connected);
    setDraft((current) => ({ ...current, channels: [...current.channels, target] }));
    setTarget(null);
  }

  return {
    target,
    value,
    setValue,
    setTarget,
    toggleChannel,
    connectSelectedChannel,
  };
}
