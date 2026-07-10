import { useEffect, useState } from 'react';
import {
  checkDomains,
  checkDomainsFromCsv,
  fetchAuthStatus,
  fetchHealth,
  login,
  logout,
  register,
  registerDomain,
  setAfnicEnvironment,
} from './api/client';
import { CsvUpload } from './components/CsvUpload';
import { EnvironmentSwitcher } from './components/EnvironmentSwitcher';
import { LoginForm } from './components/LoginForm';
import {
  ModernCenteredPage,
  ModernHeader,
  ModernPage,
} from './components/layouts/ModernLayout';
import { RegisterForm } from './components/RegisterForm';
import { ResultsTable } from './components/ResultsTable';
import { SearchInput } from './components/SearchInput';
import { ThemeToggle } from './components/ThemeToggle';
import { Badge } from './components/ui/Badge';
import { Button } from './components/ui/Button';
import { Panel } from './components/ui/Panel';
import { Win98DesktopIcons } from './components/Win98DesktopIcons';
import { Win98Icon } from './components/Win98Icon';
import { Win98Marquee } from './components/Win98Marquee';
import { Win98Taskbar } from './components/Win98Taskbar';
import { Win98Window } from './components/Win98Window';
import { Win98EasterEggsProvider } from './context/Win98EasterEggsContext';
import { useTheme } from './context/ThemeContext';
import type {
  AuthStatusResponse,
  DomainCheckMeta,
  DomainCheckResult,
  DomainRegisterResponse,
  RegisterRequest,
} from './types';
import { downloadCsv, exportResultsToCsv } from './utils/results';
import './App.css';
import './modern.css';

function splitSearchInput(value: string): string[] {
  return value
    .split(/[\n,;\s]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function RegisterSuccessAlert({
  data,
  onDismiss,
}: {
  data: DomainRegisterResponse;
  onDismiss: () => void;
}) {
  const { theme } = useTheme();

  if (theme === 'win98') {
    return (
      <Win98Window title="Domaine enregistré" icon="document" className="win98-success-window">
        <div className="win98-message-box">
          <Win98Icon name="document" size={32} />
          <div>
            <p>
              <strong>{data.domain}</strong> a été enregistré ({data.environment}).
            </p>
            <p>
              Titulaire : <code>{data.registrantClientId}</code>
            </p>
            <p>
              Contacts admin/tech : <code>{data.adminContactClientId}</code>
            </p>
            <p>
              Durée : {data.durationYears} an{data.durationYears > 1 ? 's' : ''}
            </p>
            <p>
              Auth-Info (conservez ce mot de passe de transfert) :{' '}
              <code className="win98-auth-info">{data.authInfo}</code>
            </p>
          </div>
        </div>
        <Button variant="primary" type="button" onClick={onDismiss}>
          OK
        </Button>
      </Win98Window>
    );
  }

  return (
    <section className="ui-alert ui-alert-success">
      <p>
        <strong>{data.domain}</strong> a été enregistré ({data.environment}).
      </p>
      <p>
        Titulaire : <code>{data.registrantClientId}</code>
      </p>
      <p>
        Contacts admin/tech : <code>{data.adminContactClientId}</code>
      </p>
      <p>
        Durée : {data.durationYears} an{data.durationYears > 1 ? 's' : ''}
      </p>
      <p>
        Auth-Info (conservez ce mot de passe de transfert) :{' '}
        <code className="win98-auth-info">{data.authInfo}</code>
      </p>
      <div className="ui-alert-actions">
        <Button variant="primary" type="button" onClick={onDismiss}>
          Fermer
        </Button>
      </div>
    </section>
  );
}

function ErrorAlert({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  const { theme } = useTheme();

  if (theme === 'win98') {
    return (
      <Win98Window title="Erreur système" icon="warning" className="win98-error-window">
        <div className="win98-message-box win98-message-box-error">
          <Win98Icon name="error" size={32} />
          <p>{message}</p>
        </div>
        <Button variant="primary" type="button" onClick={onDismiss}>
          OK
        </Button>
      </Win98Window>
    );
  }

  return (
    <section className="ui-alert ui-alert-error">
      <p>{message}</p>
      <div className="ui-alert-actions">
        <Button variant="primary" type="button" onClick={onDismiss}>
          Fermer
        </Button>
      </div>
    </section>
  );
}

export default function App() {
  const { theme, setCanUseRetro } = useTheme();
  const [searchValue, setSearchValue] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [results, setResults] = useState<DomainCheckResult[]>([]);
  const [meta, setMeta] = useState<DomainCheckMeta | undefined>();
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('register');
  const [error, setError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatusResponse | null>(null);
  const [mockMode, setMockMode] = useState(false);
  const [envSwitchLoading, setEnvSwitchLoading] = useState(false);
  const [registeringDomain, setRegisteringDomain] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<DomainRegisterResponse | null>(null);

  const environmentLabel = authStatus?.environmentLabel ?? 'Sandbox';
  const afnicEnvironment = authStatus?.environment ?? 'sandbox';

  useEffect(() => {
    setCanUseRetro(Boolean(authStatus?.isAdmin));
  }, [authStatus?.isAdmin, setCanUseRetro]);

  useEffect(() => {
    async function loadInitialState() {
      try {
        const [health, status] = await Promise.all([fetchHealth(), fetchAuthStatus()]);
        setMockMode(health.mockAfnic);
        setAuthStatus(status);
      } catch {
        setError(
          'Le serveur backend est inaccessible. Lancez-le avec `docker compose up -d app`, puis ouvrez http://localhost:5173 ou http://localhost:3001.',
        );
      } finally {
        setAuthLoading(false);
      }
    }

    void loadInitialState();
  }, []);

  const isAuthenticated = Boolean(authStatus?.authenticated);

  function applyAuthResponse(response: AuthStatusResponse) {
    setAuthStatus(response);
  }

  async function handleLogin(email: string, password: string) {
    setLoginLoading(true);
    setLoginError(null);

    try {
      const response = await login(email, password);
      applyAuthResponse(response);
      setError(null);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Échec de la connexion');
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegister(payload: RegisterRequest) {
    setRegisterLoading(true);
    setRegisterError(null);

    try {
      const response = await register(payload);
      applyAuthResponse(response);
      setError(null);
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : 'Échec de l’inscription');
    } finally {
      setRegisterLoading(false);
    }
  }

  async function handleEnvironmentChange(environment: 'sandbox' | 'production') {
    setEnvSwitchLoading(true);
    setError(null);

    try {
      const response = await setAfnicEnvironment(environment);
      applyAuthResponse(response);
      setResults([]);
      setMeta(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de changer d’environnement');
    } finally {
      setEnvSwitchLoading(false);
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

      if (/connexion|auth/i.test(message)) {
        setAuthStatus((current) =>
          current ? { ...current, authenticated: false, email: undefined, contactName: undefined } : current,
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

  async function handleRegisterDomain(domain: string) {
    setRegisteringDomain(domain);
    setError(null);

    try {
      const response = await registerDomain(domain);
      setRegisterSuccess(response);
      setResults((current) =>
        current.map((result) =>
          result.name.toLowerCase() === domain.toLowerCase()
            ? { ...result, available: false, reason: 'IN_USE' }
            : result,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'enregistrement du domaine");
    } finally {
      setRegisteringDomain(null);
    }
  }

  const workspace = (
    <>
      {registerSuccess && (
        <RegisterSuccessAlert data={registerSuccess} onDismiss={() => setRegisterSuccess(null)} />
      )}

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      <main className={theme === 'win98' ? 'win98-content-grid' : 'modern-content-grid'}>
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
        registeringDomain={registeringDomain}
        onRegister={handleRegisterDomain}
        onExport={handleExport}
        onClear={handleClear}
      />
    </>
  );

  if (authLoading) {
    if (theme === 'modern') {
      return (
        <ModernCenteredPage>
          <Panel title="Chargement">
            <div className="modern-loading">
              <span className="modern-spinner" aria-hidden="true" />
              <span>Initialisation de l&apos;application…</span>
            </div>
          </Panel>
        </ModernCenteredPage>
      );
    }

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
    const authForm =
      authView === 'login' ? (
        <LoginForm
          onLogin={handleLogin}
          onSwitchToRegister={() => {
            setAuthView('register');
            setLoginError(null);
          }}
          loading={loginLoading}
          error={loginError}
          mockMode={mockMode}
        />
      ) : (
        <RegisterForm
          onRegister={handleRegister}
          onSwitchToLogin={() => {
            setAuthView('login');
            setRegisterError(null);
          }}
          loading={registerLoading}
          error={registerError}
          mockMode={mockMode}
        />
      );

    if (theme === 'modern') {
      return (
        <ModernPage
          header={
            <ModernHeader
              showAuthActions={false}
              environmentLabel={environmentLabel}
              afnicEnvironment={afnicEnvironment}
              mockMode={mockMode}
              isAdmin={authStatus?.isAdmin}
            />
          }
        >
          <div className="modern-auth-stack">
            <section className="modern-hero">
              <h1>Vérification de disponibilité</h1>
              <p>
                Créez un compte client pour vérifier la disponibilité des domaines `.fr`. Vos
                informations sont enregistrées comme contact AFNIC.
              </p>
            </section>
            {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
            {authForm}
          </div>
        </ModernPage>
      );
    }

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
                    Créez un compte client pour vérifier la disponibilité des domaines `.fr`. Vos informations
                    sont enregistrées comme contact AFNIC.
                  </p>
                  <p className="win98-best-viewed">Meilleure résolution : 800×600 — 256 couleurs</p>
                </Win98Window>
              </header>
              {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
              {authForm}
            </div>
          </div>
          <Win98Taskbar environmentLabel={environmentLabel} mockMode={mockMode} />
        </div>
      </Win98EasterEggsProvider>
    );
  }

  if (theme === 'modern') {
    return (
      <ModernPage
        header={
          <ModernHeader
            userLabel={authStatus?.contactName ?? authStatus?.email}
            environmentLabel={environmentLabel}
            afnicEnvironment={afnicEnvironment}
            mockMode={mockMode}
            isAdmin={authStatus?.isAdmin}
            envSwitchLoading={envSwitchLoading}
            onEnvironmentChange={(environment) => void handleEnvironmentChange(environment)}
            onLogout={() => void handleLogout()}
          />
        }
      >
        <section className="modern-hero">
          <h1>Vérification de disponibilité</h1>
          <p>
            Vérifiez si des noms de domaine `.fr` sont disponibles à l&apos;enregistrement via
            l&apos;API AFNIC Phoenix.
          </p>
          {authStatus?.afnicClientId && (
            <p>
              Contact AFNIC : <code>{authStatus.afnicClientId}</code>
            </p>
          )}
        </section>
        {workspace}
      </ModernPage>
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
                      <Badge tone={environmentLabel === 'Production' ? 'danger' : 'default'}>
                        {environmentLabel}
                      </Badge>
                    )}
                    {authStatus?.isAdmin && !mockMode && (
                      <EnvironmentSwitcher
                        environment={afnicEnvironment}
                        loading={envSwitchLoading}
                        onChange={(environment) => void handleEnvironmentChange(environment)}
                      />
                    )}
                    {mockMode && <Badge tone="warn">Mode simulation</Badge>}
                    {authStatus?.isAdmin && <Badge>Admin</Badge>}
                    <ThemeToggle />
                    <Button type="button" onClick={() => void handleLogout()}>
                      Se déconnecter
                    </Button>
                  </div>

                  <Win98Marquee
                    text={
                      authStatus?.email
                        ? `Client connecté : ${authStatus.contactName ?? authStatus.email} (${authStatus.afnicClientId ?? 'contact'})`
                        : 'Vérification de domaines .fr'
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
            {workspace}
          </div>
        </div>
        <Win98Taskbar
          username={authStatus?.contactName ?? authStatus?.email}
          environmentLabel={environmentLabel}
          mockMode={mockMode}
          onLogout={() => void handleLogout()}
          isAuthenticated
        />
      </div>
    </Win98EasterEggsProvider>
  );
}
