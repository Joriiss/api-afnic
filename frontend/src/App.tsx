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
import { DomainSearchBar } from './components/DomainSearchBar';
import { MyDomainsPage } from './components/MyDomainsPage';
import { SettingsPage } from './components/SettingsPage';
import { UserAccountMenu, type AppView } from './components/UserAccountMenu';
import { Win98AppNav } from './components/Win98AppNav';
import { LoginForm } from './components/LoginForm';
import {
  ModernCenteredPage,
  ModernHeader,
  ModernPage,
} from './components/layouts/ModernLayout';
import { RegisterForm } from './components/RegisterForm';
import { ResultsTable } from './components/ResultsTable';
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
  results,
  onDismiss,
}: {
  results: DomainRegisterResponse[];
  onDismiss: () => void;
}) {
  const { theme } = useTheme();
  const isBulk = results.length > 1;
  const isModern = theme === 'modern';

  const content = isModern ? (
    <div>
      {isBulk ? (
        <p>
          <strong>{results.length}</strong> domaines ont été réservés avec succès.
        </p>
      ) : (
        <p>
          <strong>{results[0]?.domain}</strong> est maintenant réservé à votre nom.
        </p>
      )}

      {isBulk ? (
        <div className="register-success-list">
          {results.map((item) => (
            <div key={item.domain} className="register-success-item">
              <p>
                <strong>{item.domain}</strong>
              </p>
              <p>
                Code de transfert : <code className="win98-auth-info">{item.authInfo}</code>
              </p>
            </div>
          ))}
        </div>
      ) : (
        results[0] && (
          <p>
            Conservez ce code de transfert en lieu sûr :{' '}
            <code className="win98-auth-info">{results[0].authInfo}</code>
          </p>
        )
      )}

      <p className="register-success-meta">
        Durée de réservation : {results[0]?.durationYears} an
        {(results[0]?.durationYears ?? 0) > 1 ? 's' : ''}.
      </p>
    </div>
  ) : (
    <div>
      {isBulk ? (
        <p>
          <strong>{results.length}</strong> domaines enregistrés ({results[0]?.environment}).
        </p>
      ) : (
        <p>
          <strong>{results[0]?.domain}</strong> a été enregistré ({results[0]?.environment}).
        </p>
      )}

      {isBulk ? (
        <div className="register-success-list">
          {results.map((item) => (
            <div key={item.domain} className="register-success-item">
              <p>
                <strong>{item.domain}</strong>
              </p>
              <p>
                Auth-Info : <code className="win98-auth-info">{item.authInfo}</code>
              </p>
            </div>
          ))}
        </div>
      ) : (
        results[0] && (
          <>
            <p>
              Titulaire : <code>{results[0].registrantClientId}</code>
            </p>
            <p>
              Contacts admin/tech : <code>{results[0].adminContactClientId}</code>
            </p>
            <p>
              Durée : {results[0].durationYears} an{results[0].durationYears > 1 ? 's' : ''}
            </p>
            <p>
              Auth-Info (conservez ce mot de passe de transfert) :{' '}
              <code className="win98-auth-info">{results[0].authInfo}</code>
            </p>
          </>
        )
      )}

      {isBulk && results[0] && (
        <p className="register-success-meta">
          Titulaire : <code>{results[0].registrantClientId}</code> · Contacts admin/tech :{' '}
          <code>{results[0].adminContactClientId}</code> · Durée : {results[0].durationYears} an
          {results[0].durationYears > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );

  if (theme === 'win98') {
    return (
      <Win98Window
        title={isBulk ? 'Domaines enregistrés' : 'Domaine enregistré'}
        icon="document"
        className="win98-success-window"
      >
        <div className="win98-message-box">
          <Win98Icon name="document" size={32} />
          {content}
        </div>
        <Button variant="primary" type="button" onClick={onDismiss}>
          OK
        </Button>
      </Win98Window>
    );
  }

  return (
    <section className="ui-alert ui-alert-success">
      {content}
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
  const [registeringDomains, setRegisteringDomains] = useState<string[]>([]);
  const [registerSuccess, setRegisterSuccess] = useState<DomainRegisterResponse[]>([]);
  const [appView, setAppView] = useState<AppView>('search');
  const [domainsRefreshKey, setDomainsRefreshKey] = useState(0);

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
          'Le service est momentanément indisponible. Réessayez dans quelques instants.',
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
      setAppView('search');
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
          current ? { ...current, authenticated: false, email: undefined, contactName: undefined, firstName: undefined } : current,
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function handleDomainSearchSubmit() {
    if (csvFile) {
      void runCheck(() => checkDomainsFromCsv(csvFile));
      return;
    }

    const names = splitSearchInput(searchValue);

    if (names.length === 0) {
      return;
    }

    void runCheck(() => checkDomains(names));
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

  async function handleRegisterDomains(domains: string[]) {
    if (domains.length === 0) {
      return;
    }

    setRegisteringDomains(domains);
    setError(null);

    const successes: DomainRegisterResponse[] = [];
    const failures: string[] = [];

    for (const domain of domains) {
      try {
        const response = await registerDomain(domain);
        successes.push(response);
        setResults((current) =>
          current.map((result) =>
            result.name.toLowerCase() === domain.toLowerCase()
              ? { ...result, available: false, reason: 'IN_USE' }
              : result,
          ),
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Échec de l'enregistrement";
        failures.push(`${domain} : ${message}`);
      }
    }

    if (successes.length > 0) {
      setRegisterSuccess(successes);
      setDomainsRefreshKey((current) => current + 1);
    }

    if (failures.length > 0) {
      setError(failures.join(' · '));
    }

    setRegisteringDomains([]);
  }

  const userLabel =
    authStatus?.firstName ?? authStatus?.contactName ?? authStatus?.email ?? 'Mon compte';

  const searchWorkspace = (
    <>
      {registerSuccess.length > 0 && (
        <RegisterSuccessAlert results={registerSuccess} onDismiss={() => setRegisterSuccess([])} />
      )}

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      <section className={theme === 'win98' ? 'win98-search-section' : 'modern-search-section'}>
        <DomainSearchBar
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          csvFile={csvFile}
          onCsvFileChange={setCsvFile}
          onSubmit={handleDomainSearchSubmit}
          disabled={loading}
        />
      </section>

      <ResultsTable
        results={results}
        meta={meta}
        loading={loading}
        registeringDomains={registeringDomains}
        onRegisterDomains={handleRegisterDomains}
        onExport={handleExport}
        onClear={handleClear}
      />
    </>
  );

  function renderAuthenticatedContent() {
    if (appView === 'domains') {
      return (
        <MyDomainsPage
          refreshKey={domainsRefreshKey}
          onSearchDomains={() => setAppView('search')}
        />
      );
    }

    if (appView === 'settings') {
      return (
        <SettingsPage
          mockMode={mockMode}
          environment={afnicEnvironment}
          environmentLabel={environmentLabel}
          envSwitchLoading={envSwitchLoading}
          onEnvironmentChange={(environment) => void handleEnvironmentChange(environment)}
          onClose={() => setAppView('search')}
        />
      );
    }

    return (
      <>
        <section className="modern-hero-band modern-hero">
          <h1>Trouvez votre nom de domaine</h1>
          <p>Saisissez un nom, vérifiez s&apos;il est libre et réservez-le en quelques clics.</p>
        </section>
        {searchWorkspace}
      </>
    );
  }

  const win98HeroTitle =
    appView === 'domains'
      ? 'Mes domaines'
      : appView === 'settings'
        ? 'Paramètres administrateur'
        : 'Vérification de disponibilité';

  const win98HeroCopy =
    appView === 'domains'
      ? 'Consultez les domaines enregistrés sur votre compte.'
      : appView === 'settings'
        ? 'Configuration réservée aux administrateurs.'
        : "Vérifiez si des noms de domaine `.fr` sont disponibles à l'enregistrement via l'API AFNIC Phoenix.";

  const win98MainContent =
    appView === 'domains' ? (
      <MyDomainsPage refreshKey={domainsRefreshKey} onSearchDomains={() => setAppView('search')} />
    ) : appView === 'settings' ? (
      <SettingsPage
        mockMode={mockMode}
        environment={afnicEnvironment}
        environmentLabel={environmentLabel}
        envSwitchLoading={envSwitchLoading}
        onEnvironmentChange={(environment) => void handleEnvironmentChange(environment)}
        onClose={() => setAppView('search')}
      />
    ) : (
      searchWorkspace
    );

  if (authLoading) {
    if (theme === 'modern') {
      return (
        <ModernCenteredPage>
          <Panel title="Chargement">
            <div className="modern-loading">
              <span className="modern-spinner" aria-hidden="true" />
              <span>Chargement…</span>
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
              <Win98Window title="Registrar Studio218 — Chargement…" icon="hourglass" className="win98-window-centered">
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
              mockMode={mockMode}
              isAdmin={authStatus?.isAdmin}
            />
          }
        >
          <div className="modern-auth-stack">
            <section className="modern-hero-band modern-hero">
              <h1>Réservez votre domaine .fr</h1>
              <p>
                Créez un compte pour vérifier si un nom est disponible et le réserver en ligne avec
                Studio 218.
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
                <Win98Window title="Bienvenue sur Registrar Studio218" icon="window">
                  <Win98Marquee text="Bienvenue sur Registrar Studio218 — Le meilleur logiciel de vérification de domaines .fr de 1998 !!!" />
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
            userLabel={userLabel}
            mockMode={mockMode}
            isAdmin={authStatus?.isAdmin}
            currentView={appView}
            onNavigate={setAppView}
            onLogout={() => void handleLogout()}
          />
        }
      >
        {renderAuthenticatedContent()}
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
              <Win98Window title="Registrar Studio218 v1.0 (Shareware)" icon="internet">
                <div className="win98-hero-layout">
                  <div className="win98-hero-actions">
                    {mockMode && <Badge tone="warn">Mode simulation</Badge>}
                    <Win98AppNav
                      currentView={appView}
                      isAdmin={authStatus?.isAdmin}
                      onNavigate={setAppView}
                    />
                    <UserAccountMenu
                      userLabel={userLabel}
                      isAdmin={authStatus?.isAdmin}
                      currentView={appView}
                      onNavigate={setAppView}
                      onLogout={() => void handleLogout()}
                    />
                  </div>

                  <Win98Marquee
                    text={
                      authStatus?.email
                        ? `Client connecté : ${authStatus.contactName ?? authStatus.email} (${authStatus.afnicClientId ?? 'contact'})`
                        : 'Vérification de domaines .fr'
                    }
                  />
                  <h1 className="win98-hero-title">{win98HeroTitle}</h1>
                  <p className="win98-hero-copy">{win98HeroCopy}</p>
                </div>
              </Win98Window>
            </header>
            {win98MainContent}
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
