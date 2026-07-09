import { Win98Icon } from './Win98Icon';
import { Win98Window } from './Win98Window';

interface CsvUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function CsvUpload({ file, onFileChange, onSubmit, disabled }: CsvUploadProps) {
  return (
    <Win98Window title="Explorateur de fichiers CSV" icon="folder">
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
        <Win98Icon name="document" size={32} className="file-dropzone-icon" />
        <span>{file ? file.name : 'Double-cliquez pour choisir un fichier CSV'}</span>
      </label>

      <button className="win98-button win98-button-primary" onClick={onSubmit} disabled={disabled || !file}>
        Ouvrir et vérifier
      </button>
    </Win98Window>
  );
}
