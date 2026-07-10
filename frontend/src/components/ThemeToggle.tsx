import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/Button';

export function ThemeToggle() {
  const { theme, toggleTheme, canUseRetro } = useTheme();

  if (!canUseRetro) {
    return null;
  }

  return (
    <Button type="button" variant="default" onClick={toggleTheme}>
      {theme === 'modern' ? 'Interface rétro' : 'Interface moderne'}
    </Button>
  );
}
