import { describe, expect, test } from 'vitest';
import { parseThemeAppearance, resolveBootstrapTheme } from '@src/shared/ui/theme-bootstrap';

describe('theme bootstrap helpers', () => {
  test('parses persisted theme values from cache safely', () => {
    expect(parseThemeAppearance('light')).toBe('light');
    expect(parseThemeAppearance('"dark"')).toBe('dark');
    expect(parseThemeAppearance("'light'")).toBe('light');
    expect(parseThemeAppearance('system')).toBeNull();
    expect(parseThemeAppearance(null)).toBeNull();
  });

  test('prefers the stored theme over a hardcoded fallback when cache is missing', () => {
    expect(resolveBootstrapTheme(null, 'light')).toBe('light');
    expect(resolveBootstrapTheme(undefined, '"dark"')).toBe('dark');
    expect(resolveBootstrapTheme(null, null)).toBeNull();
  });
});
