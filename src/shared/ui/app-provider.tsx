import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { useEffect, useSyncExternalStore } from 'react';
import type { PropsWithChildren } from 'react';
import { DEFAULT_THEME, ThemeAppearance, themeStorage } from '@src/shared/storages/theme-storage';
import {
  cacheThemeAppearance,
  resolveBootstrapTheme,
  THEME_BACKGROUNDS,
} from '@src/shared/ui/theme-bootstrap';
import './app-theme.css';

export function resolveThemeAppearance(theme: ThemeAppearance | null | undefined): ThemeAppearance {
  return theme ?? DEFAULT_THEME;
}

export function applyThemeAppearance(theme: ThemeAppearance) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.documentElement.style.background = THEME_BACKGROUNDS[theme];

  if (document.body) {
    document.body.dataset.theme = theme;
  }
}

export function useThemeAppearance() {
  return (
    useSyncExternalStore(themeStorage.subscribe, () => themeStorage.getSnapshot(), () => DEFAULT_THEME) ?? DEFAULT_THEME
  );
}

export function AppProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    const applyCurrentTheme = () => {
      const nextTheme = resolveBootstrapTheme(themeStorage.getSnapshot(), document.documentElement.dataset.theme);
      applyThemeAppearance(resolveThemeAppearance(nextTheme));
    };

    applyCurrentTheme();

    const unsubscribe = themeStorage.subscribe(() => {
      applyCurrentTheme();
    });

    void themeStorage.get().then(theme => {
      cacheThemeAppearance(theme);
      applyThemeAppearance(resolveThemeAppearance(theme));
    });

    return unsubscribe;
  }, []);

  return <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>;
}
