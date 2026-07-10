import type { DomainCheckMeta, DomainCheckResult } from '../types';
import { formatAvailability, humanizeReason } from '../utils/results';
import { useTheme } from '../context/ThemeContext';
import { Win98Icon } from './Win98Icon';
import { Panel } from './ui/Panel';
import { Button } from './ui/Button';

interface ResultsTableProps {
  results: DomainCheckResult[];
  meta?: DomainCheckMeta;
  loading?: boolean;
  registeringDomain?: string | null;
  onRegister: (domain: string) => Promise<void>;
  onExport: () => void;
  onClear: () => void;
}

export function ResultsTable({
  results,
  meta,
  loading,
  registeringDomain,
  onRegister,
  onExport,
  onClear,
}: ResultsTableProps) {
  const { theme } = useTheme();

  if (!loading && results.length === 0) {
    return (
      <Panel
        title="Résultats"
        icon="spreadsheet"
        className="results-panel empty-state"
      >
        <h2>Aucun résultat pour le moment</h2>
        <p>Lancez une recherche ou importez un CSV pour afficher la disponibilité des domaines.</p>
        {theme === 'win98' && (
          <p className="win98-empty-hint">Astuce : Appuyez sur F1 pour l&apos;aide (non implémentée).</p>
        )}
      </Panel>
    );
  }

  return (
    <Panel
      title={theme === 'win98' ? 'Résultats — Feuille de calcul' : 'Résultats'}
      icon="spreadsheet"
      className="results-panel"
    >
      <div className="panel-header results-header">
        <div>
          <h2>Résultats</h2>
          {meta && (
            <p>
              {meta.checked} vérifié{meta.checked > 1 ? 's' : ''} sur {meta.requested}
              {meta.invalid > 0
                ? ` · ${meta.invalid} invalide${meta.invalid > 1 ? 's' : ''}`
                : ''}
              {meta.failed > 0 ? ` · ${meta.failed} en échec` : ''}
            </p>
          )}
        </div>

        <div className="results-actions">
          <Button onClick={onExport} disabled={results.length === 0}>
            Exporter CSV
          </Button>
          <Button onClick={onClear} disabled={results.length === 0}>
            Effacer tout
          </Button>
        </div>
      </div>

      {loading && (
        <div className="loading-banner">
          {theme === 'win98' ? (
            <Win98Icon name="hourglass" size={24} className="win98-hourglass" />
          ) : (
            <span className="modern-spinner" aria-hidden="true" />
          )}
          {theme === 'win98'
            ? 'Vérification des domaines en cours… Ne pas éteindre l&apos;ordinateur.'
            : 'Vérification des domaines en cours…'}
        </div>
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Domaine</th>
              <th>Disponible</th>
              <th>Raison</th>
              <th>Ligne</th>
              <th>Erreur</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => {
              const canRegister = result.available === true && !result.error;
              const isRegistering = registeringDomain === result.name;

              return (
                <tr key={`${result.name}-${result.sourceRow ?? 'na'}`}>
                  <td>{result.name}</td>
                  <td>
                    <span
                      className={`badge ${result.available ? 'badge-success' : result.available === false ? 'badge-danger' : 'badge-muted'}`}
                    >
                      {formatAvailability(result.available)}
                    </span>
                  </td>
                  <td>{humanizeReason(result.reason)}</td>
                  <td>{result.sourceRow ?? '—'}</td>
                  <td>{result.error ?? '—'}</td>
                  <td>
                    {canRegister ? (
                      <Button
                        type="button"
                        variant="compact"
                        disabled={Boolean(registeringDomain)}
                        onClick={() => void onRegister(result.name)}
                        title={`Enregistrer ${result.name} via l'API AFNIC`}
                      >
                        {isRegistering ? 'Enregistrement…' : 'Enregistrer'}
                      </Button>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
