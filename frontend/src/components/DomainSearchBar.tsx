import { useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Win98Icon } from './Win98Icon';
import { Panel } from './ui/Panel';
import { Button } from './ui/Button';

interface DomainSearchBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  csvFile: File | null;
  onCsvFileChange: (file: File | null) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function DomainSearchBar({
  searchValue,
  onSearchChange,
  csvFile,
  onCsvFileChange,
  onSubmit,
  disabled,
}: DomainSearchBarProps) {
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasText = Boolean(searchValue.trim());
  const hasFile = Boolean(csvFile);
  const canSubmit = !disabled && (hasText || hasFile);

  function handleSearchChange(value: string) {
    onSearchChange(value);

    if (value.trim() && csvFile) {
      onCsvFileChange(null);
    }
  }

  function handleFileChange(file: File | null) {
    onCsvFileChange(file);

    if (file) {
      onSearchChange('');
    }
  }

  function handleAttachClick() {
    fileInputRef.current?.click();
  }

  function handleClearFile() {
    onCsvFileChange(null);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey && canSubmit) {
      event.preventDefault();
      onSubmit();
    }
  }

  const panelTitle = theme === 'win98' ? 'Rechercher des domaines' : 'Recherche';

  return (
    <Panel title={panelTitle} icon="search" accent className="domain-search-panel">
      <div className="panel-header">
        <h2>{theme === 'win98' ? 'Vérifier la disponibilité' : 'Quel nom souhaitez-vous ?'}</h2>
        <p>
          {theme === 'win98'
            ? 'Saisissez un ou plusieurs domaines `.fr`, ou joignez un fichier CSV (colonne `domain` ou première colonne).'
            : 'Entrez un ou plusieurs noms (séparés par une virgule), ou importez une liste de noms.'}
        </p>
      </div>

      <div className="domain-search-bar">
        <div className="domain-search-row">
          <input
            type="text"
            className="domain-search-input"
            placeholder={theme === 'win98' ? 'exemple.fr, monmarque, autre-nom.fr' : 'monentreprise, monsite.fr'}
            value={searchValue}
            onChange={(event) => handleSearchChange(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || hasFile}
            aria-label="Noms de domaine à vérifier"
          />

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="domain-search-file-input"
            disabled={disabled}
            onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
          />

          <Button
            type="button"
            variant={theme === 'win98' ? 'default' : 'outline'}
            className="domain-search-attach"
            disabled={disabled || hasText}
            onClick={handleAttachClick}
            title={theme === 'win98' ? 'Joindre un fichier CSV' : 'Importer une liste de noms'}
          >
            {theme === 'win98' ? (
              <>
                <Win98Icon name="document" size={16} />
                <span>CSV</span>
              </>
            ) : (
              'Importer une liste'
            )}
          </Button>

          <Button
            type="button"
            variant="primary"
            className="domain-search-submit"
            disabled={!canSubmit}
            onClick={onSubmit}
          >
            {theme === 'win98' ? 'Vérifier' : 'Rechercher'}
          </Button>
        </div>

        {csvFile && (
          <div className="domain-search-file-chip">
            {theme === 'win98' && <Win98Icon name="document" size={16} />}
            <span className="domain-search-file-name">{csvFile.name}</span>
            <button
              type="button"
              className="domain-search-file-remove"
              onClick={handleClearFile}
              disabled={disabled}
              aria-label={`Retirer ${csvFile.name}`}
            >
              ×
            </button>
          </div>
        )}
      </div>
    </Panel>
  );
}
