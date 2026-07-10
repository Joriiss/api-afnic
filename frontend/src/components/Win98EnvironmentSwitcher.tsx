interface Win98EnvironmentSwitcherProps {
  environment: 'sandbox' | 'production';
  loading?: boolean;
  onChange: (environment: 'sandbox' | 'production') => void;
}

export function Win98EnvironmentSwitcher({
  environment,
  loading,
  onChange,
}: Win98EnvironmentSwitcherProps) {
  return (
    <div className="win98-env-switcher">
      <span className="win98-env-switcher-label">Admin AFNIC :</span>
      <button
        type="button"
        className={`win98-button win98-button-compact ${environment === 'sandbox' ? 'win98-button-primary' : ''}`}
        disabled={loading || environment === 'sandbox'}
        onClick={() => onChange('sandbox')}
      >
        Sandbox
      </button>
      <button
        type="button"
        className={`win98-button win98-button-compact ${environment === 'production' ? 'win98-button-primary win98-button-danger' : ''}`}
        disabled={loading || environment === 'production'}
        onClick={() => onChange('production')}
      >
        Production
      </button>
    </div>
  );
}
