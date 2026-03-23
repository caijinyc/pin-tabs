import type { ThemeAppearance } from '@src/shared/storages/theme-storage';

export const THEME_STORAGE_KEY = 'theme-storage-key';

export const THEME_BACKGROUNDS: Record<ThemeAppearance, string> = {
  light: '#f6f8fb',
  dark: '#1e1e1e',
};

export function parseThemeAppearance(value: unknown): ThemeAppearance | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(trimmedValue);
    if (parsedValue === 'light' || parsedValue === 'dark') {
      return parsedValue;
    }
  } catch {
    // Ignore malformed JSON and fall back to plain string parsing.
  }

  const normalizedValue = trimmedValue.replace(/["']/g, '');
  return normalizedValue === 'light' || normalizedValue === 'dark' ? normalizedValue : null;
}

export function resolveBootstrapTheme(
  cachedTheme: unknown,
  storedTheme: unknown,
): ThemeAppearance | null {
  return parseThemeAppearance(cachedTheme) ?? parseThemeAppearance(storedTheme);
}

export function cacheThemeAppearance(theme: ThemeAppearance) {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function markThemeReady() {
  document.documentElement.dataset.themeReady = 'true';

  if (document.body) {
    document.body.dataset.themeReady = 'true';
  }
}
