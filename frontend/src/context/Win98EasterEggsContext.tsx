import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import portraitImage from '../assets/2214063.webp';
import { Win98Icon, type Win98IconName } from '../components/Win98Icon';
import { Win98Minesweeper } from '../components/Win98Minesweeper';
import { Win98Window } from '../components/Win98Window';

export type Win98DesktopVariant = 'loading' | 'login' | 'main';

export type FolderItem = {
  name: string;
  icon: Win98IconName;
  type: 'image' | 'text' | 'game';
  content?: string;
};

export const FOLDER_ITEMS: FolderItem[] = [
  {
    name: 'photo_profil.bmp',
    icon: 'image',
    type: 'image',
  },
  {
    name: 'Démineur.exe',
    icon: 'minesweeper',
    type: 'game',
  },
  {
    name: 'NOTES.TXT',
    icon: 'text-file',
    type: 'text',
    content:
      'Mémo interne AFNIC — 14/03/1998\n\n' +
      '- Ne pas oublier de vérifier les domaines avant 17h\n' +
      '- Réunion registrar mardi\n' +
      '- Mot de passe extranet : ████████████\n\n' +
      'PS : si tu lis ça, tu fouilles trop dans Mes documents.',
  },
  {
    name: 'desktop.ini',
    icon: 'settings',
    type: 'text',
    content: '[.ShellClassInfo]\nIconFile=shell32.dll\nIconIndex=3\nInfoTip=Documents personnels',
  },
];

type Win98EasterEggsContextValue = {
  variant: Win98DesktopVariant;
  easterEggsEnabled: boolean;
  openFolder: () => void;
  openMinesweeper: () => void;
  openHelp: () => void;
  openRun: () => void;
  openSearch: () => void;
  openSettings: () => void;
  focusMainApp: () => void;
};

const Win98EasterEggsContext = createContext<Win98EasterEggsContextValue | null>(null);

export function useWin98EasterEggs() {
  const context = useContext(Win98EasterEggsContext);
  if (!context) {
    throw new Error('useWin98EasterEggs must be used within Win98EasterEggsProvider');
  }
  return context;
}

export function useWin98EasterEggsOptional() {
  return useContext(Win98EasterEggsContext);
}

interface Win98EasterEggsProviderProps {
  variant: Win98DesktopVariant;
  children: ReactNode;
}

export function Win98EasterEggsProvider({ variant, children }: Win98EasterEggsProviderProps) {
  const [showFolder, setShowFolder] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [showMinesweeper, setShowMinesweeper] = useState(false);
  const [textPreview, setTextPreview] = useState<FolderItem | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showRun, setShowRun] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const easterEggsEnabled = variant === 'login' || variant === 'main';

  function handleFolderItemOpen(item: FolderItem) {
    if (item.type === 'image') {
      setShowPhoto(true);
      return;
    }

    if (item.type === 'game') {
      setShowMinesweeper(true);
      return;
    }

    setTextPreview(item);
  }

  function focusMainApp() {
    document.querySelector('.win98-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const value = useMemo<Win98EasterEggsContextValue>(
    () => ({
      variant,
      easterEggsEnabled,
      openFolder: () => setShowFolder(true),
      openMinesweeper: () => setShowMinesweeper(true),
      openHelp: () => setShowHelp(true),
      openRun: () => setShowRun(true),
      openSearch: () => setShowSearch(true),
      openSettings: () => setShowSettings(true),
      focusMainApp,
    }),
    [variant, easterEggsEnabled],
  );

  return (
    <Win98EasterEggsContext.Provider value={value}>
      {children}

      {showFolder && (
        <Win98Window
          floating
          title="Mes documents"
          icon="folder"
          className="win98-folder-window"
          onClose={() => setShowFolder(false)}
        >
          <div className="win98-explorer-toolbar">
            <span>Fichier</span>
            <span>Édition</span>
            <span>Affichage</span>
            <span>?</span>
          </div>
          <div className="win98-explorer-address">
            <span>Adresse</span>
            <code>C:\Mes documents</code>
          </div>
          <div className="win98-folder-contents">
            {FOLDER_ITEMS.map((item) => (
              <button
                key={item.name}
                type="button"
                className="win98-folder-item"
                onDoubleClick={() => handleFolderItemOpen(item)}
                title="Double-cliquez pour ouvrir"
              >
                {item.type === 'image' ? (
                  <img className="win98-folder-item-thumb" src={portraitImage} alt="" />
                ) : (
                  <Win98Icon name={item.icon} size={32} className="win98-folder-item-icon" />
                )}
                <span>{item.name}</span>
              </button>
            ))}
          </div>
          <div className="win98-form-actions">
            <button className="win98-button win98-button-primary" type="button" onClick={() => setShowFolder(false)}>
              Fermer
            </button>
          </div>
        </Win98Window>
      )}

      {showPhoto && (
        <Win98Window
          floating
          title="photo_profil.bmp — Aperçu"
          icon="image"
          className="win98-photo-viewer"
          onClose={() => setShowPhoto(false)}
        >
          <div className="win98-photo-viewer-body">
            <img className="win98-photo-viewer-img" src={portraitImage} alt="photo_profil.bmp" />
          </div>
          <div className="win98-form-actions">
            <button className="win98-button win98-button-primary" type="button" onClick={() => setShowPhoto(false)}>
              OK
            </button>
          </div>
        </Win98Window>
      )}

      {showMinesweeper && (
        <Win98Window
          floating
          title="Démineur"
          icon="minesweeper"
          className="win98-minesweeper-window"
          onClose={() => setShowMinesweeper(false)}
        >
          <Win98Minesweeper />
          <div className="win98-form-actions">
            <button className="win98-button win98-button-primary" type="button" onClick={() => setShowMinesweeper(false)}>
              Fermer
            </button>
          </div>
        </Win98Window>
      )}

      {textPreview && (
        <Win98Window
          floating
          title={textPreview.name}
          icon={textPreview.icon}
          className="win98-text-viewer"
          onClose={() => setTextPreview(null)}
        >
          <pre className="win98-text-viewer-body">{textPreview.content}</pre>
          <div className="win98-form-actions">
            <button className="win98-button win98-button-primary" type="button" onClick={() => setTextPreview(null)}>
              OK
            </button>
          </div>
        </Win98Window>
      )}

      {showHelp && (
        <Win98Window floating title="Aide sur AFNIC Check 98" icon="window" className="win98-start-dialog" onClose={() => setShowHelp(false)}>
          <div className="win98-message-box">
            <Win98Icon name="window" size={32} />
            <div>
              <p>
                <strong>AFNIC Check 98</strong> — version 1.0 (shareware)
              </p>
              <p>
                Utilisez le menu Démarrer ou le bureau pour lancer les programmes. Vérifiez vos domaines `.fr` via
                l&apos;API Phoenix AFNIC.
              </p>
              <p className="win98-dialog-fine-print">© 1998 AFNIC. Tous droits réservés.</p>
            </div>
          </div>
          <div className="win98-form-actions">
            <button className="win98-button win98-button-primary" type="button" onClick={() => setShowHelp(false)}>
              OK
            </button>
          </div>
        </Win98Window>
      )}

      {showRun && (
        <Win98Window floating title="Exécuter" icon="computer" className="win98-start-dialog" onClose={() => setShowRun(false)}>
          <p className="win98-dialog-label">Tapez le nom d&apos;un programme, d&apos;un dossier ou d&apos;un document, puis cliquez sur OK.</p>
          <label className="win98-run-field">
            <span>Ouvrir :</span>
            <input type="text" defaultValue="C:\Program Files\AFNIC\check.exe" />
          </label>
          <div className="win98-form-actions">
            <button className="win98-button win98-button-primary" type="button" onClick={() => setShowRun(false)}>
              OK
            </button>
            <button className="win98-button" type="button" onClick={() => setShowRun(false)}>
              Annuler
            </button>
          </div>
        </Win98Window>
      )}

      {showSearch && (
        <Win98Window floating title="Rechercher" icon="search" className="win98-start-dialog" onClose={() => setShowSearch(false)}>
          <label className="win98-run-field">
            <span>Nom :</span>
            <input type="text" placeholder="*.fr" />
          </label>
          <label className="win98-run-field">
            <span>Rechercher dans :</span>
            <select defaultValue="documents">
              <option value="documents">Mes documents</option>
              <option value="c">Disque local (C:)</option>
              <option value="afnic">AFNIC CD-ROM (D:)</option>
            </select>
          </label>
          <div className="win98-form-actions">
            <button className="win98-button win98-button-primary" type="button" onClick={() => setShowSearch(false)}>
              Rechercher
            </button>
            <button className="win98-button" type="button" onClick={() => setShowSearch(false)}>
              Annuler
            </button>
          </div>
        </Win98Window>
      )}

      {showSettings && (
        <Win98Window
          floating
          title="Panneau de configuration"
          icon="settings"
          className="win98-start-dialog"
          onClose={() => setShowSettings(false)}
        >
          <div className="win98-settings-list">
            <button type="button" className="win98-settings-item" onClick={() => setShowSettings(false)}>
              <Win98Icon name="computer" size={32} />
              <span>Système</span>
            </button>
            <button type="button" className="win98-settings-item" onClick={() => setShowSettings(false)}>
              <Win98Icon name="user" size={32} />
              <span>Mot de passe</span>
            </button>
            <button type="button" className="win98-settings-item" onClick={() => setShowSettings(false)}>
              <Win98Icon name="internet" size={32} />
              <span>Réseau AFNIC</span>
            </button>
            <button type="button" className="win98-settings-item" onClick={() => setShowSettings(false)}>
              <Win98Icon name="window" size={32} />
              <span>Écran</span>
            </button>
          </div>
          <p className="win98-dialog-fine-print">Résolution recommandée : 800×600, 256 couleurs.</p>
          <div className="win98-form-actions">
            <button className="win98-button win98-button-primary" type="button" onClick={() => setShowSettings(false)}>
              OK
            </button>
          </div>
        </Win98Window>
      )}
    </Win98EasterEggsContext.Provider>
  );
}
