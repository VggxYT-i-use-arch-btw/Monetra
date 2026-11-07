import { useEffect, useState, type ReactNode } from 'react';
import { Bell, Bot, Home, PanelLeftClose, PanelLeftOpen, Settings, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import * as api from '../api';

const tabs: { path: string; label: string; icon: LucideIcon }[] = [
  { path: '/', label: 'Início', icon: Home },
  { path: '/agentes', label: 'Agentes', icon: Bot },
  { path: '/alertas', label: 'Alertas', icon: Bell },
  { path: '/ajustes', label: 'Ajustes', icon: Settings },
];

function isActive(path: string, current: string): boolean {
  return path === '/' ? current === '/' : current.startsWith(path);
}

function applyTheme(appearance: string): void {
  const light = appearance === 'Claro'
    || (appearance === 'Sistema' && window.matchMedia('(prefers-color-scheme: light)').matches);
  document.documentElement.dataset.theme = light ? 'light' : 'dark';
}

function NavLinks({ onSelect }: { onSelect?: () => void }) {
  const { pathname } = useLocation();
  return (
    <>
      {tabs.map(({ path, label, icon: Icon }) => (
        <Link
          key={path}
          to={path}
          onClick={onSelect}
          className={isActive(path, pathname) ? 'nav-link active' : 'nav-link'}
          aria-current={isActive(path, pathname) ? 'page' : undefined}
        >
          <Icon aria-hidden="true" />
          <span>{label}</span>
        </Link>
      ))}
    </>
  );
}

export function AppLayout({
  children,
  drawerOpen,
  closeDrawer,
}: {
  children: ReactNode;
  drawerOpen: boolean;
  closeDrawer: () => void;
}) {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const minimal = /^\/agentes\/novo(?:\/criado)?$/.test(pathname)
    || /^\/agentes\/[^/]+(?:\/editar)?$/.test(pathname)
    || /^\/produtos\/[^/]+$/.test(pathname);

  useEffect(() => {
    void api.getSettings().then((settings) => applyTheme(settings.appearance));
  }, []);

  return (
    <div className={`app-shell${minimal ? ' app-shell-minimal' : ''}${collapsed ? ' sidebar-collapsed' : ''}`}>
      <aside className="sidebar" aria-label="Navegação principal">
        <Link to="/" className="brand-mark" aria-label="Monetra início">
          <span className="brand-symbol">M</span>
          {!collapsed && <span className="brand-name">Monetra<small>by Boreas</small></span>}
        </Link>
        <nav className="side-nav"><NavLinks /></nav>
        <button
          className="collapse-button"
          aria-label={collapsed ? 'Expandir navegação' : 'Recolher navegação'}
          onClick={() => setCollapsed((value) => !value)}
        >
          {collapsed ? <PanelLeftOpen aria-hidden="true" /> : <PanelLeftClose aria-hidden="true" />}
          {!collapsed && <span>Recolher navegação</span>}
        </button>
      </aside>

      <main className="app-main">{children}</main>

      <nav className="bottom-nav" aria-label="Navegação principal">
        <NavLinks />
      </nav>

      {drawerOpen && (
        <div className="drawer-scrim" onMouseDown={closeDrawer}>
          <section className="mobile-drawer" aria-label="Menu" onMouseDown={(event) => event.stopPropagation()}>
            <header className="drawer-heading">
              <span className="brand-name">Monetra<small>by Boreas</small></span>
              <button className="icon-button" aria-label="Fechar menu" onClick={closeDrawer}>
                <X aria-hidden="true" />
              </button>
            </header>
            <nav className="drawer-nav"><NavLinks onSelect={closeDrawer} /></nav>
          </section>
        </div>
      )}
    </div>
  );
}
