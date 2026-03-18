import { beforeEach, describe, expect, test } from 'vitest';
import { applyThemeAppearance, resolveThemeAppearance } from '@src/shared/ui/app-provider';
import { DEFAULT_THEME, getNextTheme } from '@src/shared/storages/theme-storage';

describe('app theme helpers', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    document.body.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = '';
  });

  test('falls back to the default theme before storage hydration finishes', () => {
    expect(resolveThemeAppearance(null)).toBe(DEFAULT_THEME);
    expect(resolveThemeAppearance('light')).toBe('light');
  });

  test('applies the theme appearance to the current document', () => {
    applyThemeAppearance('light');

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(document.body.dataset.theme).toBe('light');
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  test('toggles between dark and light themes', () => {
    expect(getNextTheme('dark')).toBe('light');
    expect(getNextTheme('light')).toBe('dark');
  });
});
