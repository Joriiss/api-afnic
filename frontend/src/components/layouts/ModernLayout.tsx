import type { ReactNode } from 'react';
import { Badge } from '../ui/Badge';
import { UserAccountMenu, type AppView } from '../UserAccountMenu';

interface ModernHeaderProps {
  title?: string;
  subtitle?: string;
  userLabel?: string;
  mockMode: boolean;
  isAdmin?: boolean;
  currentView?: AppView;
  onNavigate?: (view: AppView) => void;
  onLogout?: () => void;
  showAuthActions?: boolean;
}

export function ModernHeader({
  title = 'Studio 218',
  subtitle = 'Noms de domaine .fr',
  userLabel,
  mockMode,
  isAdmin,
  currentView,
  onNavigate,
  onLogout,
  showAuthActions = true,
}: ModernHeaderProps) {
  return (
    <header className="modern-header">
      <div className="modern-header-inner">
        <button
          type="button"
          className="modern-brand modern-brand-button"
          onClick={() => onNavigate?.('search')}
          disabled={!onNavigate}
        >
          <p className="modern-brand-title">{title}</p>
          <p className="modern-brand-subtitle">{subtitle}</p>
        </button>

        {showAuthActions && (
          <div className="modern-header-actions">
            {mockMode && <Badge tone="warn">Démonstration</Badge>}
            {isAdmin && <Badge>Admin</Badge>}
            {userLabel && onNavigate && onLogout && (
              <UserAccountMenu
                userLabel={userLabel}
                isAdmin={isAdmin}
                currentView={currentView}
                onNavigate={onNavigate}
                onLogout={onLogout}
              />
            )}
          </div>
        )}
      </div>
    </header>
  );
}

interface ModernPageProps {
  children: ReactNode;
  header?: ReactNode;
}

export function ModernPage({ children, header }: ModernPageProps) {
  return (
    <div className="modern-app">
      {header}
      <main className="modern-main">{children}</main>
    </div>
  );
}

export function ModernCenteredPage({ children }: { children: ReactNode }) {
  return <div className="modern-center-page">{children}</div>;
}
