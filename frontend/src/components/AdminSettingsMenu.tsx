import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../context/ThemeContext';
import { Win98Window } from './Win98Window';
import { Button } from './ui/Button';

interface AdminSettingsMenuProps {
  isAdmin?: boolean;
  mockMode?: boolean;
  environment: 'sandbox' | 'production';
  environmentLabel: string;
  envSwitchLoading?: boolean;
  onEnvironmentChange?: (environment: 'sandbox' | 'production') => void;
}

function AdminSettingsContent({
  theme,
  setTheme,
  mockMode,
  environment,
  environmentLabel,
  envSwitchLoading,
  onEnvironmentChange,
}: {
  theme: 'modern' | 'win98';
  setTheme: (theme: 'modern' | 'win98') => void;
  mockMode?: boolean;
  environment: 'sandbox' | 'production';
  environmentLabel: string;
  envSwitchLoading?: boolean;
  onEnvironmentChange?: (environment: 'sandbox' | 'production') => void;
}) {
  return (
    <>
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
    </>
  );
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
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
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

  const content = (
    <AdminSettingsContent
      theme={theme}
      setTheme={setTheme}
      mockMode={mockMode}
      environment={environment}
      environmentLabel={environmentLabel}
      envSwitchLoading={envSwitchLoading}
      onEnvironmentChange={onEnvironmentChange}
    />
  );

  let panel: ReactNode = null;

  if (open) {
    if (theme === 'win98') {
      panel = createPortal(
        <div ref={panelRef}>
          <Win98Window
            title="Paramètres administrateur"
            icon="settings"
            floating
            className="admin-settings-window"
            onClose={() => setOpen(false)}
          >
            {content}
          </Win98Window>
        </div>,
        document.body,
      );
    } else {
      panel = (
        <div className="admin-settings-menu" ref={panelRef} role="menu" aria-label="Paramètres administrateur">
          {content}
        </div>
      );
    }
  }

  return (
    <>
      <div className="admin-settings" ref={triggerRef}>
        <Button
          type="button"
          variant="default"
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={() => setOpen((current) => !current)}
        >
          Paramètres
        </Button>
        {theme === 'modern' && panel}
      </div>
      {theme === 'win98' && panel}
    </>
  );
}
