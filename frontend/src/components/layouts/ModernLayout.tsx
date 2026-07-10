import type { ReactNode } from 'react';
import { Badge } from '../ui/Badge';
import { EnvironmentSwitcher } from '../EnvironmentSwitcher';
import { ThemeToggle } from '../ThemeToggle';
import { Button } from '../ui/Button';

interface ModernHeaderProps {
  title?: string;
  subtitle?: string;
  userLabel?: string;
  environmentLabel: string;
  afnicEnvironment: 'sandbox' | 'production';
  mockMode: boolean;
  isAdmin?: boolean;
  envSwitchLoading?: boolean;
  onEnvironmentChange?: (environment: 'sandbox' | 'production') => void;
  onLogout?: () => void;
  showAuthActions?: boolean;
}

export function ModernHeader({
  title = 'AFNIC Domain Check',
  subtitle = 'Vérification et enregistrement de domaines .fr',
  userLabel,
  environmentLabel,
  afnicEnvironment,
  mockMode,
  isAdmin,
  envSwitchLoading,
  onEnvironmentChange,
  onLogout,
  showAuthActions = true,
}: ModernHeaderProps) {
  return (
    <header className="modern-header">
      <div className="modern-header-inner">
        <div className="modern-brand">
          <p className="modern-brand-title">{title}</p>
          <p className="modern-brand-subtitle">{subtitle}</p>
        </div>

        {showAuthActions && (
          <div className="modern-header-actions">
            {!mockMode && (
              <Badge tone={environmentLabel === 'Production' ? 'danger' : 'default'}>
                {environmentLabel}
              </Badge>
            )}
            {mockMode && <Badge tone="warn">Mode simulation</Badge>}
            {isAdmin && <Badge>Admin</Badge>}
            {isAdmin && !mockMode && onEnvironmentChange && (
              <EnvironmentSwitcher
                environment={afnicEnvironment}
                loading={envSwitchLoading}
                onChange={onEnvironmentChange}
              />
            )}
            <ThemeToggle />
            {userLabel && <span className="modern-user">{userLabel}</span>}
            {onLogout && (
              <Button type="button" variant="default" onClick={onLogout}>
                Se déconnecter
              </Button>
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
