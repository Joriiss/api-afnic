import type { ReactNode } from 'react';
import { useTheme } from '../../context/ThemeContext';

type BadgeTone = 'default' | 'danger' | 'warn';

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

export function Badge({ children, tone = 'default', className = '' }: BadgeProps) {
  const { theme } = useTheme();

  if (theme === 'win98') {
    const toneClass =
      tone === 'danger'
        ? 'win98-status-badge-danger'
        : tone === 'warn'
          ? 'win98-status-badge-warn'
          : '';

    return <span className={`win98-status-badge ${toneClass} ${className}`.trim()}>{children}</span>;
  }

  return <span className={`ui-badge ui-badge-${tone} ${className}`.trim()}>{children}</span>;
}
