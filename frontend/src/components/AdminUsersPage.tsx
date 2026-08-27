import { useEffect, useState } from 'react';
import { deleteAdminUser, fetchAdminUsers, setAdminUserPrivilege } from '../api/client';
import type { AdminUserItem } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Win98Icon } from './Win98Icon';
import { Panel } from './ui/Panel';
import { Button } from './ui/Button';

interface AdminUsersPageProps {
  currentUserEmail?: string;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function displayName(user: AdminUserItem): string {
  if (user.firstName) {
    return `${user.firstName} ${user.contactName}`.trim();
  }

  return user.organizationName || user.contactName || user.email;
}

export function AdminUsersPage({ currentUserEmail }: AdminUsersPageProps) {
  const { theme } = useTheme();
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  async function loadUsers() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchAdminUsers();
      setUsers(response.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  async function handleToggleAdmin(user: AdminUserItem) {
    setBusyUserId(user.id);
    setError(null);

    try {
      const updated = await setAdminUserPrivilege(user.id, !user.isAdmin);
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de modifier les droits');
    } finally {
      setBusyUserId(null);
    }
  }

  async function handleDelete(user: AdminUserItem) {
    const label = displayName(user);
    const confirmed = window.confirm(
      `Supprimer le compte de ${label} (${user.email}) ?\nSes domaines enregistrés dans l'historique seront aussi supprimés.`,
    );

    if (!confirmed) {
      return;
    }

    setBusyUserId(user.id);
    setError(null);

    try {
      await deleteAdminUser(user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de supprimer l'utilisateur");
    } finally {
      setBusyUserId(null);
    }
  }

  if (loading) {
    return (
      <Panel title="Utilisateurs" icon="document" accent className="admin-users-panel">
        <div className="loading-banner">
          {theme === 'win98' ? (
            <Win98Icon name="hourglass" size={24} className="win98-hourglass" />
          ) : (
            <span className="modern-spinner" aria-hidden="true" />
          )}
          Chargement des utilisateurs…
        </div>
      </Panel>
    );
  }

  return (
    <Panel title="Utilisateurs" icon="document" accent className="admin-users-panel">
      <div className="panel-header">
        <h2>Comptes clients</h2>
        <p>
          {users.length} utilisateur{users.length > 1 ? 's' : ''} · gérez les droits admin et les
          suppressions.
        </p>
      </div>

      {error && (
        <section className="ui-alert ui-alert-error">
          <p>{error}</p>
        </section>
      )}

      {users.length === 0 ? (
        <p>Aucun utilisateur pour le moment.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>E-mail</th>
                <th>Type</th>
                <th>Inscrit le</th>
                <th>Rôle</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isSelf = user.email === currentUserEmail;
                const busy = busyUserId === user.id;

                return (
                  <tr key={user.id}>
                    <td>
                      <strong>{displayName(user)}</strong>
                      {user.protectedByConfig && (
                        <span className="badge badge-muted admin-users-protected">Protégé</span>
                      )}
                    </td>
                    <td>{user.email}</td>
                    <td>{user.contactKind === 'moral' ? 'Organisation' : 'Particulier'}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <span className={`badge ${user.isAdmin ? 'badge-success' : 'badge-muted'}`}>
                        {user.isAdmin ? 'Admin' : 'Client'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-users-actions">
                        <Button
                          type="button"
                          variant="compact"
                          disabled={
                            busy ||
                            (user.isAdmin && (isSelf || user.protectedByConfig))
                          }
                          onClick={() => void handleToggleAdmin(user)}
                          title={
                            user.protectedByConfig && user.isAdmin
                              ? 'Protégé par ADMIN_EMAILS'
                              : isSelf && user.isAdmin
                                ? 'Vous ne pouvez pas retirer vos propres droits'
                                : undefined
                          }
                        >
                          {user.isAdmin ? 'Retirer admin' : 'Rendre admin'}
                        </Button>
                        <Button
                          type="button"
                          variant="compact"
                          disabled={busy || isSelf || user.protectedByConfig}
                          onClick={() => void handleDelete(user)}
                          title={
                            isSelf
                              ? 'Vous ne pouvez pas supprimer votre compte'
                              : user.protectedByConfig
                                ? 'Protégé par ADMIN_EMAILS'
                                : undefined
                          }
                        >
                          Supprimer
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
