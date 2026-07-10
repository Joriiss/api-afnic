import type { ReactNode } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Win98Window } from '../Win98Window';
import type { Win98IconName } from '../Win98Icon';

interface PanelProps {
  title: string;
  children: ReactNode;
  className?: string;
  icon?: Win98IconName;
  onClose?: () => void;
  accent?: boolean;
}

export function Panel({
  title,
  children,
  className = '',
  icon = 'folder',
  onClose,
  accent = false,
}: PanelProps) {
  const { theme } = useTheme();

  if (theme === 'win98') {
    return (
      <Win98Window title={title} icon={icon} className={className} onClose={onClose}>
        {children}
      </Win98Window>
    );
  }

  const accentClass = accent ? 'ui-panel-accent' : '';

  return (
    <section className={`ui-panel ${accentClass} ${className}`.trim()}>
      <header className="ui-panel-header">
        <h2 className="ui-panel-title">{title}</h2>
      </header>
      <div className="ui-panel-body">{children}</div>
    </section>
  );
}
