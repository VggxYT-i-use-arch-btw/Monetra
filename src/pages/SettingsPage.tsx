import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import * as api from '../api';
import { PageHeading } from '../components/PageHeading';
import { PlanSection } from '../components/PlanSection';
import { SegmentedControl } from '../components/SegmentedControl';
import { SettingsChannels } from '../components/SettingsChannels';
import { ErrorState, LoadingState } from '../components/States';
import { SectionHeading } from '../components/SectionHeading';
import type { Appearance, Settings } from '../domain/types';

function messageFromState(state: unknown): string {
  if (typeof state !== 'object' || state === null || !('message' in state)) return '';
  return typeof state.message === 'string' ? state.message : '';
}

export function SettingsPage() {
  const location = useLocation();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [usage, setUsage] = useState<api.PlanUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let current = true;
    setLoading(true);
    setError(false);
    Promise.all([api.getSettings(), api.getPlanUsage()])
      .then(([storedSettings, planUsage]) => {
        if (!current) return;
        setSettings(storedSettings);
        setUsage(planUsage);
      })
      .catch(() => current && setError(true))
      .finally(() => current && setLoading(false));
    return () => { current = false; };
  }, [retry]);

  async function changeAppearance(value: string): Promise<void> {
    const appearance = value as Appearance;
    const updated = await api.updateSettings({ appearance });
    setSettings(updated);
    const light = appearance === 'Claro'
      || (appearance === 'Sistema' && window.matchMedia('(prefers-color-scheme: light)').matches);
    document.documentElement.dataset.theme = light ? 'light' : 'dark';
  }

  if (loading) return <LoadingState label="Carregando ajustes" />;
  if (error || !settings || !usage) {
    return <div className="page standard-page"><ErrorState message="Não foi possível carregar os ajustes." retry={() => setRetry((value) => value + 1)} /></div>;
  }

  return (
    <div className="page standard-page settings-page">
      <PageHeading title="Ajustes" />
      {messageFromState(location.state) && (
        <p className="inline-notice" role="status">{messageFromState(location.state)}</p>
      )}
      <SettingsChannels settings={settings} onChange={setSettings} />
      <section className="appearance-section">
        <SectionHeading title="Aparência" />
        <SegmentedControl
          items={['Escuro', 'Claro', 'Sistema']}
          value={settings.appearance}
          onChange={(value) => void changeAppearance(value)}
          label="Aparência"
        />
      </section>
      <PlanSection usage={usage} />
    </div>
  );
}
