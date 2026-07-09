import { useEffect, useRef, useState } from 'react';
import { useWin98EasterEggsOptional } from '../context/Win98EasterEggsContext';
import { Win98Icon } from './Win98Icon';
import { Win98Window } from './Win98Window';

interface Win98StartMenuProps {
  open: boolean;
  onClose: () => void;
  onLogout?: () => void;
  isAuthenticated?: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
}

type SubmenuId = 'programs' | 'settings' | null;

export function Win98StartMenu({ open, onClose, onLogout, isAuthenticated, anchorRef }: Win98StartMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const easterEggs = useWin98EasterEggsOptional();
  const [activeSubmenu, setActiveSubmenu] = useState<SubmenuId>(null);
  const [showShutdown, setShowShutdown] = useState(false);

  useEffect(() => {
    if (!open) {
      setActiveSubmenu(null);
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (!anchorRef.current?.contains(target)) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose, anchorRef]);

  function runAction(action: () => void) {
    action();
    onClose();
  }

  const shutdownDialog = showShutdown ? (
    <Win98Window
      floating
      title="Arrêter Windows"
      icon="warning"
      className="win98-start-dialog win98-shutdown-dialog"
      onClose={() => setShowShutdown(false)}
    >
      <div className="win98-message-box">
        <Win98Icon name="warning" size={32} />
        <p>Quitter Windows maintenant ?</p>
      </div>
      <p className="win98-shutdown-hint">
        Il est maintenant plus sûr d&apos;éteindre votre ordinateur et de partir travailler.
      </p>
      <div className="win98-form-actions">
        <button className="win98-button" type="button" onClick={() => setShowShutdown(false)}>
          Arrêter
        </button>
        <button
          className="win98-button"
          type="button"
          onClick={() => {
            setShowShutdown(false);
            window.location.reload();
          }}
        >
          Redémarrer
        </button>
        {isAuthenticated && onLogout && (
          <button
            className="win98-button win98-button-primary"
            type="button"
            onClick={() => {
              setShowShutdown(false);
              onLogout();
            }}
          >
            Se déconnecter
          </button>
        )}
        <button className="win98-button" type="button" onClick={() => setShowShutdown(false)}>
          Annuler
        </button>
      </div>
    </Win98Window>
  ) : null;

  if (!open) {
    return shutdownDialog;
  }

  return (
    <>
      <div ref={menuRef} className="win98-start-menu" role="menu" aria-label="Menu Démarrer">
        <div className="win98-start-menu-banner" aria-hidden="true">
          <span className="win98-start-menu-banner-text">Windows 98</span>
        </div>

        <div
          className="win98-start-menu-items"
          onMouseLeave={() => setActiveSubmenu(null)}
        >
          <div
            className="win98-start-menu-item win98-start-menu-item-has-submenu"
            onMouseEnter={() => setActiveSubmenu('programs')}
          >
            <Win98Icon name="folder" size={16} />
            <span>Programmes</span>
            <span className="win98-start-menu-arrow">▶</span>
            {activeSubmenu === 'programs' && (
              <div className="win98-start-submenu">
                <button
                  type="button"
                  className="win98-start-submenu-item"
                  onClick={() =>
                    runAction(() => {
                      easterEggs?.focusMainApp();
                    })
                  }
                >
                  <Win98Icon name="internet" size={16} />
                  AFNIC Domain Checker
                </button>
                <button
                  type="button"
                  className="win98-start-submenu-item"
                  disabled={!easterEggs?.easterEggsEnabled}
                  onClick={() =>
                    runAction(() => {
                      easterEggs?.openMinesweeper();
                    })
                  }
                >
                  <Win98Icon name="minesweeper" size={16} />
                  Démineur
                </button>
                <div className="win98-start-menu-separator" />
                <button
                  type="button"
                  className="win98-start-submenu-item"
                  disabled={!easterEggs?.easterEggsEnabled}
                  onClick={() =>
                    runAction(() => {
                      easterEggs?.openFolder();
                    })
                  }
                >
                  <Win98Icon name="folder" size={16} />
                  Explorateur
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="win98-start-menu-item"
            disabled={!easterEggs?.easterEggsEnabled}
            onClick={() =>
              runAction(() => {
                easterEggs?.openFolder();
              })
            }
          >
            <Win98Icon name="document" size={16} />
            <span>Documents</span>
          </button>

          <div
            className="win98-start-menu-item win98-start-menu-item-has-submenu"
            onMouseEnter={() => setActiveSubmenu('settings')}
          >
            <Win98Icon name="settings" size={16} />
            <span>Paramètres</span>
            <span className="win98-start-menu-arrow">▶</span>
            {activeSubmenu === 'settings' && (
              <div className="win98-start-submenu">
                <button
                  type="button"
                  className="win98-start-submenu-item"
                  onClick={() =>
                    runAction(() => {
                      easterEggs?.openSettings();
                    })
                  }
                >
                  <Win98Icon name="settings" size={16} />
                  Panneau de configuration
                </button>
                <button type="button" className="win98-start-submenu-item" onClick={onClose}>
                  <Win98Icon name="window" size={16} />
                  Barre des tâches…
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="win98-start-menu-item"
            onClick={() =>
              runAction(() => {
                easterEggs?.openSearch();
              })
            }
          >
            <Win98Icon name="search" size={16} />
            <span>Rechercher…</span>
          </button>

          <button
            type="button"
            className="win98-start-menu-item"
            onClick={() =>
              runAction(() => {
                easterEggs?.openHelp();
              })
            }
          >
            <Win98Icon name="window" size={16} />
            <span>Aide</span>
          </button>

          <button
            type="button"
            className="win98-start-menu-item"
            onClick={() =>
              runAction(() => {
                easterEggs?.openRun();
              })
            }
          >
            <Win98Icon name="computer" size={16} />
            <span>Exécuter…</span>
          </button>

          <div className="win98-start-menu-separator" />

          <button
            type="button"
            className="win98-start-menu-item win98-start-menu-shutdown"
            onClick={() => {
              onClose();
              setShowShutdown(true);
            }}
          >
            <Win98Icon name="warning" size={16} />
            <span>Arrêter…</span>
          </button>
        </div>
      </div>

      {shutdownDialog}
    </>
  );
}
