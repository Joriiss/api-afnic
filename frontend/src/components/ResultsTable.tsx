import type { DomainCheckMeta, DomainCheckResult } from '../types';
import { formatAvailability, humanizeReason } from '../utils/results';
import { Win98Icon } from './Win98Icon';
import { Win98Window } from './Win98Window';

interface ResultsTableProps {
  results: DomainCheckResult[];
  meta?: DomainCheckMeta;
  loading?: boolean;
  onExport: () => void;
  onClear: () => void;
}

export function ResultsTable({ results, meta, loading, onExport, onClear }: ResultsTableProps) {
  if (!loading && results.length === 0) {
    return (
      <Win98Window title="Résultats" icon="spreadsheet" className="results-panel empty-state">
        <h2>Aucun résultat pour le moment</h2>
        <p>Lancez une recherche ou importez un CSV pour afficher la disponibilité des domaines.</p>
        <p className="win98-empty-hint">Astuce : Appuyez sur F1 pour l&apos;aide (non implémentée).</p>
      </Win98Window>
    );
  }

  return (
    <Win98Window title="Résultats — Feuille de calcul" icon="spreadsheet" className="results-panel">
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
          <button className="win98-button" onClick={onExport} disabled={results.length === 0}>
            Exporter CSV
          </button>
          <button className="win98-button" onClick={onClear} disabled={results.length === 0}>
            Effacer tout
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-banner">
          <Win98Icon name="hourglass" size={24} className="win98-hourglass" />
          Vérification des domaines en cours… Ne pas éteindre l&apos;ordinateur.
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
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Win98Window>
  );
}
