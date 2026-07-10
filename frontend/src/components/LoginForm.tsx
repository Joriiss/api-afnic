import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Panel } from './ui/Panel';
import { Button } from './ui/Button';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSwitchToRegister: () => void;
  loading?: boolean;
  error?: string | null;
  mockMode?: boolean;
}

export function LoginForm({ onLogin, onSwitchToRegister, loading, error, mockMode }: LoginFormProps) {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    await onLogin(email, password);
  }

  return (
    <Panel title="Connexion" icon="key" className="login-panel">
      <div className="panel-header">
        <h2>Connexion</h2>
        <fieldset className="win98-fieldset">
          <legend>{theme === 'win98' ? 'Accès client' : 'Connexion'}</legend>
          <p>
            {theme === 'win98'
              ? 'Connectez-vous pour vérifier la disponibilité des domaines `.fr`.'
              : 'Connectez-vous pour rechercher et réserver vos noms de domaine.'}
          </p>
          {mockMode && (
            <p className="login-hint">
              {theme === 'win98'
                ? "Mode simulation : l'inscription crée un contact fictif et les vérifications sont simulées."
                : 'Mode démonstration : les résultats sont fictifs et aucun domaine réel ne sera réservé.'}
            </p>
          )}
        </fieldset>
      </div>

      <form className="login-form" onSubmit={(event) => void handleSubmit(event)}>
        <label className="field">
          <span>E-mail</span>
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
          <span>Mot de passe</span>
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
          <Button variant="primary" type="submit" disabled={loading || !email || !password}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </Button>
          <Button type="button" variant="outline" disabled={loading} onClick={onSwitchToRegister}>
            Créer un compte
          </Button>
        </div>
      </form>
    </Panel>
  );
}
