import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { HomePage } from './pages/HomePage';
import { OffersPage } from './pages/OffersPage';
import { AgentsPage } from './pages/AgentsPage';
import { AgentFormPage } from './pages/AgentFormPage';
import { CreatedPage } from './pages/CreatedPage';
import { AgentDetailPage } from './pages/AgentDetailPage';
import { ProductPage } from './pages/ProductPage';
import { AlertsPage } from './pages/AlertsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <AppLayout drawerOpen={drawerOpen} closeDrawer={() => setDrawerOpen(false)}>
      <Routes>
        <Route path="/" element={<HomePage onOpenMenu={() => setDrawerOpen(true)} />} />
        <Route path="/ofertas" element={<OffersPage />} />
        <Route path="/agentes" element={<AgentsPage />} />
        <Route path="/agentes/novo" element={<AgentFormPage />} />
        <Route path="/agentes/novo/criado" element={<CreatedPage />} />
        <Route path="/agentes/:id/editar" element={<AgentFormPage edit />} />
        <Route path="/agentes/:id" element={<AgentDetailPage />} />
        <Route path="/produtos/:id" element={<ProductPage />} />
        <Route path="/alertas" element={<AlertsPage />} />
        <Route path="/ajustes" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}
