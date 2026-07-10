import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/Button';

interface AdminSettingsMenuProps {
  isAdmin?: boolean;
  mockMode?: boolean;
  environment: 'sandbox' | 'production';
  environmentLabel: string;
  envSwitchLoading?: boolean;
  onEnvironmentChange?: (environment: 'sandbox' | 'production') => void;
}

export function AdminSettingsMenu({
  isAdmin,
  mockMode,
  environment,
  environmentLabel,
  envSwitchLoading,
  onEnvironmentChange,
}: AdminSettingsMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-settings" ref={rootRef}>
      <Button
        type="button"
        variant="default"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        Paramètres
      </Button>

      {open && (
        <div className="admin-settings-menu" role="menu" aria-label="Paramètres administrateur">
          <section className="admin-settings-section">
            <h3 className="admin-settings-heading">Interface</h3>
            <p className="admin-settings-hint">Choisissez l&apos;apparence de l&apos;application.</p>
            <div className="admin-settings-options">
              <Button
                type="button"
                variant={theme === 'modern' ? 'primary' : 'default'}
                onClick={() => setTheme('modern')}
              >
                Moderne
              </Button>
              <Button
                type="button"
                variant={theme === 'win98' ? 'primary' : 'default'}
                onClick={() => setTheme('win98')}
              >
                Rétro
              </Button>
            </div>
          </section>

          {!mockMode && onEnvironmentChange && (
            <section className="admin-settings-section">
              <h3 className="admin-settings-heading">Environnement AFNIC</h3>
              <p className="admin-settings-hint">
                Environnement actuel : <strong>{environmentLabel}</strong>
              </p>
              <div className="admin-settings-options">
                <Button
                  type="button"
                  variant={environment === 'sandbox' ? 'primary' : 'default'}
                  disabled={envSwitchLoading || environment === 'sandbox'}
                  onClick={() => onEnvironmentChange('sandbox')}
                >
                  Sandbox
                </Button>
                <Button
                  type="button"
                  variant={environment === 'production' ? 'danger' : 'default'}
                  disabled={envSwitchLoading || environment === 'production'}
                  onClick={() => onEnvironmentChange('production')}
                >
                  Production
                </Button>
              </div>
            </section>
          )}

          {mockMode && (
            <section className="admin-settings-section">
              <h3 className="admin-settings-heading">Environnement AFNIC</h3>
              <p className="admin-settings-hint">Indisponible en mode simulation.</p>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
