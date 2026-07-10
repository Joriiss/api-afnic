import { useRef, useState } from 'react';
import { Win98Icon } from './Win98Icon';
import { Win98StartMenu } from './Win98StartMenu';

interface Win98TaskbarProps {
  username?: string;
  environmentLabel?: string;
  mockMode?: boolean;
  onLogout?: () => void;
  isAuthenticated?: boolean;
}

export function Win98Taskbar({
  username,
  environmentLabel,
  mockMode,
  onLogout,
  isAuthenticated,
}: Win98TaskbarProps) {
  const [startOpen, setStartOpen] = useState(false);
  const startWrapRef = useRef<HTMLDivElement>(null);
  const clock = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  function toggleStart() {
    setStartOpen((current) => !current);
  }

  return (
    <footer className="win98-taskbar">
      <div className="win98-start-wrap" ref={startWrapRef}>
        <button
          type="button"
          className={`win98-start-btn ${startOpen ? 'win98-start-btn-active' : ''}`}
          onClick={toggleStart}
          aria-expanded={startOpen}
          aria-haspopup="menu"
        >
          <Win98Icon name="windows-flag" size={16} className="win98-start-icon" />
          Démarrer
        </button>

        <Win98StartMenu
          open={startOpen}
          onClose={() => setStartOpen(false)}
          onLogout={onLogout}
          isAuthenticated={isAuthenticated}
          anchorRef={startWrapRef}
        />
      </div>

      <div className="win98-taskbar-apps">
        <span className="win98-taskbar-app win98-taskbar-app-active">Registrar Studio218.exe</span>
        {mockMode && <span className="win98-taskbar-app">Simulateur.exe</span>}
      </div>

      <div className="win98-taskbar-tray">
        {username && (
          <span className="win98-tray-item">
            <Win98Icon name="user" size={14} />
            {username}
          </span>
        )}
        {environmentLabel && !mockMode && (
          <span className="win98-tray-item">
            <Win98Icon
              name={environmentLabel === 'Production' ? 'status-error' : 'status-ok'}
              size={14}
            />
            AFNIC
          </span>
        )}
        <span className="win98-tray-clock">{clock}</span>
      </div>
    </footer>
  );
}
