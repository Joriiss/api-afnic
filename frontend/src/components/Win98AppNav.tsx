import type { AppView } from './UserAccountMenu';
import { Button } from './ui/Button';

interface Win98AppNavProps {
  currentView: AppView;
  isAdmin?: boolean;
  onNavigate: (view: AppView) => void;
}

export function Win98AppNav({ currentView, isAdmin, onNavigate }: Win98AppNavProps) {
  return (
    <nav className="win98-app-nav" aria-label="Navigation principale">
      <Button
        type="button"
        variant={currentView === 'search' ? 'primary' : 'default'}
        onClick={() => onNavigate('search')}
      >
        Rechercher
      </Button>
      <Button
        type="button"
        variant={currentView === 'domains' ? 'primary' : 'default'}
        onClick={() => onNavigate('domains')}
      >
        Mes domaines
      </Button>
      {isAdmin && (
        <Button
          type="button"
          variant={currentView === 'settings' ? 'primary' : 'default'}
          onClick={() => onNavigate('settings')}
        >
          Paramètres
        </Button>
      )}
    </nav>
  );
}
