import { useEffect, useState } from 'react';
import {
  checkDomains,
  checkDomainsFromCsv,
  fetchAuthStatus,
  fetchHealth,
  login,
  logout,
} from './api/client';
import { CsvUpload } from './components/CsvUpload';
import { LoginForm } from './components/LoginForm';
import { ResultsTable } from './components/ResultsTable';
import { SearchInput } from './components/SearchInput';
import { Win98DesktopIcons } from './components/Win98DesktopIcons';
import { Win98Icon } from './components/Win98Icon';
import { Win98Marquee } from './components/Win98Marquee';
import { Win98Taskbar } from './components/Win98Taskbar';
import { Win98Window } from './components/Win98Window';
import { Win98EasterEggsProvider } from './context/Win98EasterEggsContext';
import type { AuthStatusResponse, DomainCheckMeta, DomainCheckResult } from './types';
import { downloadCsv, exportResultsToCsv } from './utils/results';
import './App.css';

function splitSearchInput(value: string): string[] {
  return value
    .split(/[\n,;\s]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export default function App() {
  const [searchValue, setSearchValue] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [results, setResults] = useState<DomainCheckResult[]>([]);
  const [meta, setMeta] = useState<DomainCheckMeta | undefined>();
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatusResponse | null>(null);
  const [mockMode, setMockMode] = useState(false);
  const [environmentLabel, setEnvironmentLabel] = useState('Sandbox');
  const [tokenUrl, setTokenUrl] = useState('');

  useEffect(() => {
    async function loadInitialState() {
      try {
        const [health, status] = await Promise.all([fetchHealth(), fetchAuthStatus()]);
        setMockMode(health.mockAfnic);
        setEnvironmentLabel(health.environmentLabel);
        setTokenUrl(health.keycloakTokenUrl);
        setAuthStatus(status);
      } catch {
        setError(
          'Le serveur backend est inaccessible. Lancez-le avec npm run dev depuis la racine du projet.',
        );
      } finally {
        setAuthLoading(false);
      }
    }

    void loadInitialState();
  }, []);

  const isAuthenticated = Boolean(mockMode || authStatus?.authenticated);

  async function handleLogin(username: string, password: string) {
    setLoginLoading(true);
    setLoginError(null);

    try {
      const status = await login(username, password);
      setAuthStatus(status);
      setError(null);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Échec de la connexion');
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
      setAuthStatus({ authenticated: false, mockAfnic: mockMode });
      setResults([]);
      setMeta(undefined);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de la déconnexion');
    }
  }

  async function runCheck(action: () => Promise<{ results: DomainCheckResult[]; meta: DomainCheckMeta }>) {
    setLoading(true);
    setError(null);

    try {
      const response = await action();
      setResults(response.results);
      setMeta(response.meta);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Échec de la vérification des domaines';
      setError(message);

      if (/auth/i.test(message)) {
        setAuthStatus((current) =>
          current ? { ...current, authenticated: false, username: undefined } : current,
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit() {
    const names = splitSearchInput(searchValue);
    if (names.length === 0) {
      return;
    }

    void runCheck(() => checkDomains(names));
  }

  function handleCsvSubmit() {
    if (!csvFile) {
      return;
    }

    void runCheck(() => checkDomainsFromCsv(csvFile));
  }

  function handleExport() {
    const csv = exportResultsToCsv(results);
    downloadCsv('resultats-disponibilite-domaines.csv', csv);
  }

  function handleClear() {
    setResults([]);
    setMeta(undefined);
    setError(null);
  }

  if (authLoading) {
    return (
      <Win98EasterEggsProvider variant="loading">
        <div className="win98-desktop">
          <Win98DesktopIcons />

          <div className="win98-workspace">
            <div className="win98-workspace-inner">
              <Win98Window title="AFNIC Check — Chargement…" icon="hourglass" className="win98-window-centered">
                <div className="win98-message-box">
                  <Win98Icon name="hourglass" size={32} className="win98-hourglass" />
                  <p>Patientez pendant l&apos;initialisation du système…</p>
                </div>
              </Win98Window>
            </div>
          </div>

          <Win98Taskbar />
        </div>
      </Win98EasterEggsProvider>
    );
  }

  if (!isAuthenticated) {
    return (
      <Win98EasterEggsProvider variant="login">
        <div className="win98-desktop">
          <Win98DesktopIcons />

          <div className="win98-workspace">
            <div className="win98-workspace-inner">
              <header className="win98-hero win98-hero-centered">
                <Win98Window title="Bienvenue sur AFNIC Check 98" icon="window">
                  <Win98Marquee text="Bienvenue sur AFNIC Check 98 — Le meilleur logiciel de vérification de domaines .fr de 1998 !!!" />
                  <h1 className="win98-hero-title">Vérification de disponibilité</h1>
                  <p className="win98-hero-copy">
                    Connectez-vous avec vos identifiants AFNIC pour vérifier la disponibilité des domaines
                    `.fr`.
                  </p>
                  <p className="win98-best-viewed">Meilleure résolution : 800×600 — 256 couleurs</p>
                </Win98Window>
              </header>

              <LoginForm
                onLogin={handleLogin}
                loading={loginLoading}
                error={loginError}
                environmentLabel={environmentLabel}
                tokenUrl={tokenUrl}
                mockMode={mockMode}
              />
            </div>
          </div>

          <Win98Taskbar environmentLabel={environmentLabel} mockMode={mockMode} />
        </div>
      </Win98EasterEggsProvider>
    );
  }

  return (
    <Win98EasterEggsProvider variant="main">
      <div className="win98-desktop">
        <Win98DesktopIcons />

      <div className="win98-workspace">
        <div className="win98-workspace-inner">
          <header className="win98-hero">
            <Win98Window title="AFNIC Domain Checker v1.0 (Shareware)" icon="internet">
              <div className="win98-hero-layout">
                <div className="win98-hero-actions">
                  {!mockMode && (
                    <span
                      className={`win98-status-badge ${environmentLabel === 'Production' ? 'win98-status-badge-danger' : ''}`}
                    >
                      {environmentLabel}
                    </span>
                  )}
                  {mockMode && <span className="win98-status-badge win98-status-badge-warn">Mode simulation</span>}
                  {!mockMode && (
                    <button className="win98-button" type="button" onClick={() => void handleLogout()}>
                      Se déconnecter
                    </button>
                  )}
                </div>

                <Win98Marquee
                  text={
                    authStatus?.username
                      ? `Utilisateur connecté : ${authStatus.username} — Bonne vérification de domaines !!!`
                      : 'Mode simulation actif — Vérification de domaines .fr'
                  }
                />
                <h1 className="win98-hero-title">Vérification de disponibilité</h1>
                <p className="win98-hero-copy">
                  Vérifiez si des noms de domaine `.fr` sont disponibles à l&apos;enregistrement via
                  l&apos;API AFNIC Phoenix.
                </p>
              </div>
            </Win98Window>
          </header>

          {error && (
            <Win98Window title="Erreur système" icon="warning" className="win98-error-window">
              <div className="win98-message-box win98-message-box-error">
                <Win98Icon name="error" size={32} />
                <p>{error}</p>
              </div>
              <button className="win98-button win98-button-primary" type="button" onClick={() => setError(null)}>
                OK
              </button>
            </Win98Window>
          )}

          <main className="win98-content-grid">
            <SearchInput
              value={searchValue}
              onChange={setSearchValue}
              onSubmit={handleSearchSubmit}
              disabled={loading}
            />
            <CsvUpload
              file={csvFile}
              onFileChange={setCsvFile}
              onSubmit={handleCsvSubmit}
              disabled={loading}
            />
          </main>

          <ResultsTable
            results={results}
            meta={meta}
            loading={loading}
            onExport={handleExport}
            onClear={handleClear}
          />
        </div>
      </div>

      <Win98Taskbar
        username={authStatus?.username}
        environmentLabel={environmentLabel}
        mockMode={mockMode}
        onLogout={() => void handleLogout()}
        isAuthenticated
      />
      </div>
    </Win98EasterEggsProvider>
  );
}
