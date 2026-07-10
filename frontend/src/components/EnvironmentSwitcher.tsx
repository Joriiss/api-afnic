import { Button } from './ui/Button';

interface EnvironmentSwitcherProps {
  environment: 'sandbox' | 'production';
  loading?: boolean;
  onChange: (environment: 'sandbox' | 'production') => void;
}

export function EnvironmentSwitcher({ environment, loading, onChange }: EnvironmentSwitcherProps) {
  return (
    <div className="env-switcher">
      <span className="env-switcher-label">Environnement AFNIC</span>
      <Button
        type="button"
        variant={environment === 'sandbox' ? 'primary' : 'default'}
        disabled={loading || environment === 'sandbox'}
        onClick={() => onChange('sandbox')}
      >
        Sandbox
      </Button>
      <Button
        type="button"
        variant={environment === 'production' ? 'danger' : 'default'}
        disabled={loading || environment === 'production'}
        onClick={() => onChange('production')}
      >
        Production
      </Button>
    </div>
  );
}
