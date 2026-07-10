import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/Button';

export type AppView = 'search' | 'domains' | 'settings';

interface UserAccountMenuProps {
  userLabel: string;
  isAdmin?: boolean;
  currentView?: AppView;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
}

export function UserAccountMenu({
  userLabel,
  isAdmin,
  currentView,
  onNavigate,
  onLogout,
}: UserAccountMenuProps) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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

  function navigate(view: AppView) {
    onNavigate(view);
    setOpen(false);
  }

  function handleLogout() {
    setOpen(false);
    onLogout();
  }

  return (
    <div className="user-account-menu" ref={rootRef}>
      <Button
        type="button"
        variant={theme === 'modern' ? 'outline' : 'default'}
        className="user-account-trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="user-account-label">{userLabel}</span>
        <span className="user-account-chevron" aria-hidden="true">
          ▾
        </span>
      </Button>

      {open && (
        <div className="user-account-dropdown" role="menu" aria-label="Menu compte">
          <button
            type="button"
            role="menuitem"
            className={`user-account-item${currentView === 'domains' ? ' is-active' : ''}`}
            onClick={() => navigate('domains')}
          >
            Mes domaines
          </button>
          {isAdmin && (
            <button
              type="button"
              role="menuitem"
              className={`user-account-item${currentView === 'settings' ? ' is-active' : ''}`}
              onClick={() => navigate('settings')}
            >
              Paramètres
            </button>
          )}
          <div className="user-account-divider" role="separator" />
          <button type="button" role="menuitem" className="user-account-item" onClick={handleLogout}>
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
