import type { ReactNode } from 'react';
import { Win98Icon, type Win98IconName } from './Win98Icon';

interface Win98WindowProps {
  title: string;
  children: ReactNode;
  className?: string;
  icon?: Win98IconName;
  onClose?: () => void;
}

export function Win98Window({
  title,
  children,
  className = '',
  icon = 'folder',
  onClose,
}: Win98WindowProps) {
  return (
    <section className={`win98-window ${className}`.trim()}>
      <div className="win98-titlebar">
        <span className="win98-titlebar-icon" aria-hidden="true">
          <Win98Icon name={icon} size={16} />
        </span>
        <span className="win98-titlebar-text">{title}</span>
        <div className="win98-titlebar-buttons">
          <button type="button" className="win98-chrome-btn" aria-label="Réduire">
            _
          </button>
          <button type="button" className="win98-chrome-btn" aria-label="Agrandir">
            □
          </button>
          <button
            type="button"
            className="win98-chrome-btn win98-chrome-btn-close"
            aria-label="Fermer"
            onClick={onClose}
            disabled={!onClose}
          >
            ×
          </button>
        </div>
      </div>
      <div className="win98-window-body">{children}</div>
    </section>
  );
}
