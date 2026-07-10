import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type UiTheme = 'modern' | 'win98';

const STORAGE_KEY = 'afnic-ui-theme';

interface ThemeContextValue {
  theme: UiTheme;
  setTheme: (theme: UiTheme) => void;
  toggleTheme: () => void;
  canUseRetro: boolean;
  setCanUseRetro: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): UiTheme {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'win98' ? 'win98' : 'modern';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<UiTheme>(() => {
    const initial = readStoredTheme();
    document.documentElement.dataset.theme = initial;
    return initial;
  });
  const [canUseRetro, setCanUseRetro] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (!canUseRetro && theme === 'win98') {
      setThemeState('modern');
      localStorage.setItem(STORAGE_KEY, 'modern');
    }
  }, [canUseRetro, theme]);

  const setTheme = useCallback(
    (next: UiTheme) => {
      if (next === 'win98' && !canUseRetro) {
        return;
      }

      setThemeState(next);
      localStorage.setItem(STORAGE_KEY, next);
    },
    [canUseRetro],
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'modern' ? 'win98' : 'modern');
  }, [setTheme, theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      canUseRetro,
      setCanUseRetro,
    }),
    [theme, setTheme, toggleTheme, canUseRetro],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}
