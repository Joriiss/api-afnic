import { useState } from 'react';
import { Win98Window } from './Win98Window';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSwitchToRegister: () => void;
  loading?: boolean;
  error?: string | null;
  mockMode?: boolean;
}

export function LoginForm({ onLogin, onSwitchToRegister, loading, error, mockMode }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await onLogin(email, password);
  }

  return (
    <Win98Window title="Connexion client" icon="key" className="login-panel">
      <div className="panel-header">
        <h2>Connexion</h2>
        <fieldset className="win98-fieldset">
          <legend>Accès client</legend>
          <p>Connectez-vous pour vérifier la disponibilité des domaines `.fr`.</p>
          {mockMode && (
            <p className="login-hint">
              Mode simulation : l&apos;inscription crée un contact fictif et les vérifications sont simulées.
            </p>
          )}
        </fieldset>
      </div>

      <form className="login-form" onSubmit={(event) => void handleSubmit(event)}>
        <label className="field">
          <span>E-mail :</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={loading}
            placeholder="vous@exemple.fr"
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
          <button className="win98-button win98-button-primary" type="submit" disabled={loading || !email || !password}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
          <button className="win98-button" type="button" disabled={loading} onClick={onSwitchToRegister}>
            Créer un compte
          </button>
        </div>
      </form>
    </Win98Window>
  );
}
