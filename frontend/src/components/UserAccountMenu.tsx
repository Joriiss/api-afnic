import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
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
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function updateMenuPosition() {
      const trigger = rootRef.current?.querySelector('.user-account-trigger');

      if (!trigger || theme !== 'win98') {
        return;
      }

      const rect = trigger.getBoundingClientRect();

      setMenuStyle({
        top: rect.bottom + 4,
        left: rect.left,
        minWidth: Math.max(rect.width, 176),
      });
    }

    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (rootRef.current?.contains(target) || dropdownRef.current?.contains(target)) {
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
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, theme]);

  function navigate(view: AppView) {
    onNavigate(view);
    setOpen(false);
  }

  function handleLogout() {
    setOpen(false);
    onLogout();
  }

  const dropdown = (
    <div
      ref={dropdownRef}
      className={`user-account-dropdown${theme === 'win98' ? ' user-account-dropdown-floating' : ''}`}
      style={theme === 'win98' ? menuStyle : undefined}
      role="menu"
      aria-label="Menu compte"
    >
      <button
        type="button"
        role="menuitem"
        className={`user-account-item${currentView === 'search' ? ' is-active' : ''}`}
        onClick={() => navigate('search')}
      >
        {theme === 'win98' ? 'Rechercher' : 'Rechercher un domaine'}
      </button>
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
  );

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

      {open &&
        (theme === 'win98' ? createPortal(dropdown, document.body) : dropdown)}
    </div>
  );
}
