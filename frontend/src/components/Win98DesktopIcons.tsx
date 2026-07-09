import { useWin98EasterEggs } from '../context/Win98EasterEggsContext';
import { Win98Icon, type Win98IconName } from './Win98Icon';

function DesktopIcon({ icon, label }: { icon: Win98IconName; label: string }) {
  return (
    <div className="win98-desktop-icon">
      <span className="win98-desktop-icon-img">
        <Win98Icon name={icon} size={32} />
      </span>
      <span>{label}</span>
    </div>
  );
}

export function Win98DesktopIcons() {
  const { variant, easterEggsEnabled, openFolder } = useWin98EasterEggs();

  return (
    <div className="win98-desktop-icons">
      {variant === 'loading' && (
        <>
          <DesktopIcon icon="computer" label="Mon PC" />
          <DesktopIcon icon="internet" label="Internet" />
        </>
      )}

      {variant === 'login' && (
        <>
          <DesktopIcon icon="key" label="Connexion" />
          <div className="win98-desktop-icon win98-desktop-icon-blink">
            <span className="win98-desktop-icon-img">
              <Win98Icon name="construction" size={32} />
            </span>
            <span>En construction</span>
          </div>
        </>
      )}

      {variant === 'main' && (
        <>
          <DesktopIcon icon="document" label="domaines.csv" />
          <DesktopIcon icon="envelope" label="Outlook" />
          <DesktopIcon icon="cdrom" label="AFNIC CD-ROM" />
        </>
      )}

      {easterEggsEnabled && (
        <button
          type="button"
          className="win98-desktop-icon win98-desktop-icon-interactive"
          onDoubleClick={openFolder}
          title="Double-cliquez pour ouvrir"
        >
          <span className="win98-desktop-icon-img">
            <Win98Icon name="folder" size={32} />
          </span>
          <span>Mes documents</span>
        </button>
      )}
    </div>
  );
}
