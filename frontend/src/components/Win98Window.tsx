import type { ReactNode } from 'react';
import { Win98Icon, type Win98IconName } from './Win98Icon';

interface Win98WindowProps {
  title: string;
  children: ReactNode;
  className?: string;
  icon?: Win98IconName;
  onClose?: () => void;
  floating?: boolean;
}

export function Win98Window({
  title,
  children,
  className = '',
  icon = 'folder',
  onClose,
  floating = false,
}: Win98WindowProps) {
  return (
    <section
      className={`win98-window ${floating ? 'win98-floating-window' : ''} ${className}`.trim()}
    >
      <div className="win98-titlebar">
        <span className="win98-titlebar-icon" aria-hidden="true">
          <Win98Icon name={icon} size={16} />
        </span>
        <span className="win98-titlebar-text">{title}</span>
        <div className="win98-titlebar-buttons">
          <button type="button" className="win98-chrome-btn win98-chrome-btn-min" aria-label="Réduire">
            <span className="win98-chrome-glyph" aria-hidden="true" />
          </button>
          <button type="button" className="win98-chrome-btn win98-chrome-btn-max" aria-label="Agrandir">
            <span className="win98-chrome-glyph" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="win98-chrome-btn win98-chrome-btn-close"
            aria-label="Fermer"
            onClick={onClose}
            disabled={!onClose}
          >
            <span className="win98-chrome-glyph" aria-hidden="true">
              ×
            </span>
          </button>
        </div>
      </div>
      <div className="win98-window-body">{children}</div>
    </section>
  );
}
