import { useTheme } from '../context/ThemeContext';
import { Win98Icon } from './Win98Icon';
import { Panel } from './ui/Panel';
import { Button } from './ui/Button';

interface CsvUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function CsvUpload({ file, onFileChange, onSubmit, disabled }: CsvUploadProps) {
  const { theme } = useTheme();

  return (
    <Panel title={theme === 'win98' ? 'Explorateur de fichiers CSV' : 'Import CSV'} icon="folder">
      <div className="panel-header">
        <h2>Importer un CSV</h2>
        <p>
          Importez un fichier CSV avec une colonne `domain`, ou placez les domaines dans la première
          colonne.
        </p>
      </div>

      <label className="file-dropzone">
        <input
          type="file"
          accept=".csv,text/csv"
          disabled={disabled}
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        />
        {theme === 'win98' && <Win98Icon name="document" size={32} className="file-dropzone-icon" />}
        <span>
          {file
            ? file.name
            : theme === 'win98'
              ? 'Double-cliquez pour choisir un fichier CSV'
              : 'Cliquez pour choisir un fichier CSV'}
        </span>
      </label>

      <Button variant="primary" onClick={onSubmit} disabled={disabled || !file}>
        {theme === 'win98' ? 'Ouvrir et vérifier' : 'Vérifier le CSV'}
      </Button>
    </Panel>
  );
}
