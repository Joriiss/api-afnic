import { Win98Window } from './Win98Window';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function SearchInput({ value, onChange, onSubmit, disabled }: SearchInputProps) {
  return (
    <Win98Window title="Rechercher des domaines" icon="search">
      <div className="panel-header">
        <h2>Recherche manuelle</h2>
        <p>
          Saisissez un ou plusieurs domaines `.fr`, séparés par des virgules, des espaces ou des
          retours à la ligne.
        </p>
      </div>

      <textarea
        className="domain-input"
        rows={6}
        placeholder={'exemple.fr\nmonmarque\nautre-nom.fr'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />

      <button className="win98-button win98-button-primary" onClick={onSubmit} disabled={disabled || !value.trim()}>
        Vérifier les domaines
      </button>
    </Win98Window>
  );
}
