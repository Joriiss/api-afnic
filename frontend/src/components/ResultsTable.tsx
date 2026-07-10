import { useEffect, useMemo, useState } from 'react';
import type { DomainCheckMeta, DomainCheckResult } from '../types';
import { formatAvailability, humanizeReason } from '../utils/results';
import { useTheme } from '../context/ThemeContext';
import { Win98Icon } from './Win98Icon';
import { Panel } from './ui/Panel';
import { Button } from './ui/Button';

type AvailabilityFilter = 'all' | 'available' | 'unavailable';

interface ResultsTableProps {
  results: DomainCheckResult[];
  meta?: DomainCheckMeta;
  loading?: boolean;
  registeringDomains: string[];
  onRegisterDomains: (domains: string[]) => Promise<void>;
  onExport: () => void;
  onClear: () => void;
}

function isRegistrable(result: DomainCheckResult): boolean {
  return result.available === true && !result.error;
}

function matchesFilter(result: DomainCheckResult, filter: AvailabilityFilter): boolean {
  if (filter === 'all') {
    return true;
  }

  if (filter === 'available') {
    return result.available === true;
  }

  return result.available === false;
}

export function ResultsTable({
  results,
  meta,
  loading,
  registeringDomains,
  onRegisterDomains,
  onExport,
  onClear,
}: ResultsTableProps) {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<AvailabilityFilter>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const isRegistering = registeringDomains.length > 0;

  useEffect(() => {
    setSelected(new Set());
    setFilter('all');
  }, [results]);

  const filteredResults = useMemo(
    () => results.filter((result) => matchesFilter(result, filter)),
    [results, filter],
  );

  const registrableInView = useMemo(
    () => filteredResults.filter(isRegistrable),
    [filteredResults],
  );

  const allRegistrableSelected =
    registrableInView.length > 0 && registrableInView.every((result) => selected.has(result.name));

  function toggleSelected(domain: string) {
    setSelected((current) => {
      const next = new Set(current);

      if (next.has(domain)) {
        next.delete(domain);
      } else {
        next.add(domain);
      }

      return next;
    });
  }

  function toggleSelectAllInView() {
    if (allRegistrableSelected) {
      setSelected((current) => {
        const next = new Set(current);
        registrableInView.forEach((result) => next.delete(result.name));
        return next;
      });
      return;
    }

    setSelected((current) => {
      const next = new Set(current);
      registrableInView.forEach((result) => next.add(result.name));
      return next;
    });
  }

  async function handleBulkRegister() {
    const domains = registrableInView
      .map((result) => result.name)
      .filter((name) => selected.has(name));

    if (domains.length === 0) {
      return;
    }

    await onRegisterDomains(domains);
    setSelected(new Set());
  }

  if (!loading && results.length === 0) {
    return (
      <Panel title="Résultats" icon="spreadsheet" className="results-panel empty-state" accent>
        <h2>Aucun résultat pour le moment</h2>
        <p>
          {theme === 'win98'
            ? 'Lancez une recherche ou importez un CSV pour afficher la disponibilité des domaines.'
            : "Recherchez un nom de domaine pour voir s'il est disponible."}
        </p>
        {theme === 'win98' && (
          <p className="win98-empty-hint">Astuce : Appuyez sur F1 pour l&apos;aide (non implémentée).</p>
        )}
      </Panel>
    );
  }

  const selectedCount = registrableInView.filter((result) => selected.has(result.name)).length;
  const isModern = theme === 'modern';

  return (
    <Panel
      title={theme === 'win98' ? 'Résultats — Feuille de calcul' : 'Résultats'}
      icon="spreadsheet"
      className="results-panel"
      accent
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
              {filteredResults.length !== results.length
                ? ` · ${filteredResults.length} affiché${filteredResults.length > 1 ? 's' : ''}`
                : ''}
            </p>
          )}
        </div>

        <div className="results-actions">
          {selectedCount > 0 && (
            <Button
              variant="primary"
              disabled={isRegistering}
              onClick={() => void handleBulkRegister()}
            >
              {isRegistering
                ? `Réservation… (${registeringDomains.length})`
                : isModern
                  ? `Réserver la sélection (${selectedCount})`
                  : `Enregistrer la sélection (${selectedCount})`}
            </Button>
          )}
          <Button onClick={onExport} disabled={results.length === 0}>
            {isModern ? 'Télécharger la liste' : 'Exporter CSV'}
          </Button>
          <Button onClick={onClear} disabled={results.length === 0}>
            {isModern ? 'Nouvelle recherche' : 'Effacer tout'}
          </Button>
        </div>
      </div>

      <div className="results-filters" role="group" aria-label="Filtrer par disponibilité">
        <span className="results-filters-label">Afficher :</span>
        <Button
          type="button"
          variant={filter === 'all' ? 'primary' : 'outline'}
          className="results-filter-btn"
          onClick={() => setFilter('all')}
        >
          Tous
        </Button>
        <Button
          type="button"
          variant={filter === 'available' ? 'primary' : 'outline'}
          className="results-filter-btn"
          onClick={() => setFilter('available')}
        >
          {isModern ? 'Libres' : 'Disponibles'}
        </Button>
        <Button
          type="button"
          variant={filter === 'unavailable' ? 'primary' : 'outline'}
          className="results-filter-btn"
          onClick={() => setFilter('unavailable')}
        >
          {isModern ? 'Déjà pris' : 'Indisponibles'}
        </Button>
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
            : 'Recherche en cours…'}
        </div>
      )}

      {!loading && filteredResults.length === 0 && (
        <p className="results-empty-filter">Aucun résultat pour ce filtre.</p>
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th className="results-select-col">
                <input
                  type="checkbox"
                  className="results-checkbox"
                  checked={allRegistrableSelected && registrableInView.length > 0}
                  disabled={isRegistering || registrableInView.length === 0}
                  onChange={toggleSelectAllInView}
                  aria-label="Sélectionner tous les domaines disponibles affichés"
                />
              </th>
              <th>Domaine</th>
              <th>{isModern ? 'Statut' : 'Disponible'}</th>
              <th>{isModern ? 'Détail' : 'Raison'}</th>
              {!isModern && <th>Ligne</th>}
              {!isModern && <th>Erreur</th>}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((result) => {
              const canRegister = isRegistrable(result);
              const isRowRegistering = registeringDomains.includes(result.name);
              const isChecked = selected.has(result.name);

              return (
                <tr key={`${result.name}-${result.sourceRow ?? 'na'}`}>
                  <td className="results-select-col">
                    {canRegister ? (
                      <input
                        type="checkbox"
                        className="results-checkbox"
                        checked={isChecked}
                        disabled={isRegistering}
                        onChange={() => toggleSelected(result.name)}
                        aria-label={`Sélectionner ${result.name}`}
                      />
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{result.name}</td>
                  <td>
                    <span
                      className={`badge ${result.available ? 'badge-success' : result.available === false ? 'badge-danger' : 'badge-muted'}`}
                    >
                      {formatAvailability(result.available, isModern)}
                    </span>
                  </td>
                  <td>{humanizeReason(result.reason)}</td>
                  {!isModern && <td>{result.sourceRow ?? '—'}</td>}
                  {!isModern && <td>{result.error ?? '—'}</td>}
                  <td>
                    {canRegister ? (
                      <Button
                        type="button"
                        variant="compact"
                        disabled={isRegistering}
                        onClick={() => void onRegisterDomains([result.name])}
                        title={
                          isModern
                            ? `Réserver ${result.name}`
                            : `Enregistrer ${result.name} via l'API AFNIC`
                        }
                      >
                        {isRowRegistering
                          ? isModern
                            ? 'Réservation…'
                            : 'Enregistrement…'
                          : isModern
                            ? 'Réserver'
                            : 'Enregistrer'}
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
