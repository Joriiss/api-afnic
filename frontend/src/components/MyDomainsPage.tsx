import { useEffect, useState } from 'react';
import { fetchMyDomainRegistrations } from '../api/client';
import type { DomainRegistrationItem } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Win98Icon } from './Win98Icon';
import { Panel } from './ui/Panel';
import { Button } from './ui/Button';

interface MyDomainsPageProps {
  refreshKey?: number;
  onSearchDomains?: () => void;
}

function formatDate(value?: string): string {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatRegistrationStatus(status: DomainRegistrationItem['status']): string {
  if (status === 'active') {
    return 'Actif';
  }

  if (status === 'cancelled') {
    return 'Annulé';
  }

  return 'Inconnu';
}

export function MyDomainsPage({ refreshKey = 0, onSearchDomains }: MyDomainsPageProps) {
  const { theme } = useTheme();
  const isModern = theme === 'modern';
  const [domains, setDomains] = useState<DomainRegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function loadDomains() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchMyDomainRegistrations();

        if (!cancelled) {
          setDomains(response.registrations);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Impossible de charger vos domaines');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDomains();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  function toggleReveal(id: string) {
    setRevealedIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  if (loading) {
    return (
      <Panel title="Mes domaines" icon="document" accent className="my-domains-panel">
        <div className="loading-banner">
          {theme === 'win98' ? (
            <Win98Icon name="hourglass" size={24} className="win98-hourglass" />
          ) : (
            <span className="modern-spinner" aria-hidden="true" />
          )}
          Chargement de vos domaines…
        </div>
        {isModern && <p className="my-domains-sync-hint">Vérification du statut auprès du registre…</p>}
      </Panel>
    );
  }

  if (error) {
    return (
      <Panel title="Mes domaines" icon="document" accent className="my-domains-panel">
        <section className="ui-alert ui-alert-error">
          <p>{error}</p>
        </section>
      </Panel>
    );
  }

  if (domains.length === 0) {
    return (
      <Panel title="Mes domaines" icon="document" accent className="my-domains-panel empty-state">
        <h2>Aucun domaine pour le moment</h2>
        <p>
          {theme === 'win98'
            ? 'Les domaines que vous enregistrez apparaîtront ici.'
            : 'Vos noms de domaine réservés apparaîtront ici.'}
        </p>
        {onSearchDomains && (
          <div className="my-domains-empty-action">
            <Button type="button" variant="primary" onClick={onSearchDomains}>
              Rechercher un domaine
            </Button>
          </div>
        )}
      </Panel>
    );
  }

  return (
    <Panel title="Mes domaines" icon="document" accent className="my-domains-panel">
      <div className="panel-header">
        <h2>Vos domaines réservés</h2>
        <p>
          {domains.length} domaine{domains.length > 1 ? 's' : ''} dans votre historique
          {domains.some((item) => item.status === 'active')
            ? ` · ${domains.filter((item) => item.status === 'active').length} actif${domains.filter((item) => item.status === 'active').length > 1 ? 's' : ''}`
            : ''}
          .
        </p>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Domaine</th>
              <th>Statut</th>
              <th>Réservé le</th>
              <th>Expire le</th>
              <th>Durée</th>
              <th>Code de transfert</th>
            </tr>
          </thead>
          <tbody>
            {domains.map((item) => {
              const revealed = revealedIds.has(item.id);
              const isCancelled = item.status === 'cancelled';

              return (
                <tr
                  key={item.id}
                  className={isCancelled ? 'my-domains-row-cancelled' : undefined}
                >
                  <td>
                    <strong>{item.domain}</strong>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        item.status === 'active'
                          ? 'badge-success'
                          : item.status === 'cancelled'
                            ? 'badge-muted'
                            : 'badge-danger'
                      }`}
                    >
                      {formatRegistrationStatus(item.status)}
                    </span>
                  </td>
                  <td>{formatDate(item.registeredAt)}</td>
                  <td>{isCancelled ? '—' : formatDate(item.expirationDate)}</td>
                  <td>
                    {item.durationYears} an{item.durationYears > 1 ? 's' : ''}
                  </td>
                  <td>
                    {isCancelled ? (
                      '—'
                    ) : revealed ? (
                      <code className="win98-auth-info">{item.authInfo}</code>
                    ) : (
                      <Button type="button" variant="compact" onClick={() => toggleReveal(item.id)}>
                        Afficher
                      </Button>
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
