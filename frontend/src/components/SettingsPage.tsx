import { AdminSettingsContent } from './AdminSettingsMenu';
import { Panel } from './ui/Panel';
import { useTheme } from '../context/ThemeContext';
import { Win98Window } from './Win98Window';

interface SettingsPageProps {
  mockMode: boolean;
  environment: 'sandbox' | 'production';
  environmentLabel: string;
  envSwitchLoading?: boolean;
  onEnvironmentChange?: (environment: 'sandbox' | 'production') => void;
  onClose?: () => void;
}

export function SettingsPage({
  mockMode,
  environment,
  environmentLabel,
  envSwitchLoading,
  onEnvironmentChange,
  onClose,
}: SettingsPageProps) {
  const { theme, setTheme } = useTheme();

  const content = (
    <AdminSettingsContent
      theme={theme}
      setTheme={setTheme}
      mockMode={mockMode}
      environment={environment}
      environmentLabel={environmentLabel}
      envSwitchLoading={envSwitchLoading}
      onEnvironmentChange={onEnvironmentChange}
    />
  );

  if (theme === 'win98') {
    return (
      <Win98Window
        title="Paramètres administrateur"
        icon="settings"
        className="settings-page-window"
        onClose={onClose}
      >
        {content}
      </Win98Window>
    );
  }

  return (
    <Panel title="Paramètres" icon="settings" accent className="settings-page-panel">
      {content}
    </Panel>
  );
}
