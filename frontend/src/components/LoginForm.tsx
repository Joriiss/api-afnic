import { useState } from 'react';
import { Win98Window } from './Win98Window';

interface LoginFormProps {
  onLogin: (username: string, password: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  environmentLabel?: string;
  tokenUrl?: string;
  mockMode?: boolean;
}

export function LoginForm({
  onLogin,
  loading,
  error,
  environmentLabel,
  tokenUrl,
  mockMode,
}: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await onLogin(username, password);
  }

  return (
    <Win98Window title="Connexion réseau AFNIC" icon="key" className="login-panel">
      <div className="panel-header">
        <h2>Connexion AFNIC</h2>
        <fieldset className="win98-fieldset">
          <legend>Paramètres de connexion</legend>
          <p>
            Saisissez vos identifiants AFNIC pour l&apos;environnement{' '}
            <strong>{environmentLabel ?? 'configuré'}</strong>.
          </p>
          <p className="login-hint">
            {mockMode
              ? 'Mode simulation actif : la connexion n’appelle pas AFNIC et permet de tester l’interface.'
              : environmentLabel === 'Production'
                ? 'Utilisez en général les mêmes identifiants que pour extranet.nic.fr.'
                : 'Les identifiants sandbox peuvent être différents de ceux de extranet.nic.fr.'}{' '}
            {!mockMode && (
              <>
                Client OAuth : <code>registrars-api-client</code>.
              </>
            )}
          </p>
          {tokenUrl && (
            <p className="login-meta">
              Endpoint : <code>{tokenUrl}</code>
            </p>
          )}
        </fieldset>
      </div>

      <form className="login-form" onSubmit={(event) => void handleSubmit(event)}>
        <label className="field">
          <span>Identifiant :</span>
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={loading}
            placeholder="votre.identifiant.afnic"
          />
        </label>

        <label className="field">
          <span>Mot de passe :</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={loading}
            placeholder="********"
          />
        </label>

        {error && (
          <div className="inline-error">
            <strong>Erreur :</strong> {error}
          </div>
        )}

        <div className="win98-form-actions">
          <button className="win98-button win98-button-primary" type="submit" disabled={loading || !username || !password}>
            {loading ? 'Connexion…' : 'OK'}
          </button>
          <button className="win98-button" type="button" disabled={loading}>
            Annuler
          </button>
          <button className="win98-button" type="button" disabled={loading}>
            Aide
          </button>
        </div>
      </form>
    </Win98Window>
  );
}
