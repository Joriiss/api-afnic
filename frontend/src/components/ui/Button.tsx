import type { ButtonHTMLAttributes } from 'react';
import { useTheme } from '../../context/ThemeContext';

type ButtonVariant = 'default' | 'primary' | 'outline' | 'danger' | 'compact';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant = 'default', className = '', ...props }: ButtonProps) {
  const { theme } = useTheme();

  if (theme === 'win98') {
    const win98Variant =
      variant === 'primary'
        ? 'win98-button-primary'
        : variant === 'danger'
          ? 'win98-button-danger'
          : variant === 'compact'
            ? 'win98-button-compact'
            : '';

    return <button className={`win98-button ${win98Variant} ${className}`.trim()} {...props} />;
  }

  const modernVariant = variant === 'default' ? '' : `ui-button-${variant}`;

  return (
    <button className={`ui-button ${modernVariant} ${className}`.trim()} {...props} />
  );
}
