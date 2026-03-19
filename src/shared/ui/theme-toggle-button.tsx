import { Button } from '@chakra-ui/react';
import { useSyncExternalStore } from 'react';
import { DEFAULT_THEME, getNextTheme, themeStorage } from '@src/shared/storages/theme-storage';

export function ThemeToggleButton() {
  const currentTheme =
    useSyncExternalStore(themeStorage.subscribe, () => themeStorage.getSnapshot(), () => DEFAULT_THEME) ?? DEFAULT_THEME;
  const nextTheme = getNextTheme(currentTheme);

  return (
    <Button
      size="sm"
      type="button"
      variant="outline"
      onClick={() => {
        void themeStorage.setTheme(nextTheme);
      }}>
      {`Use ${nextTheme} theme`}
    </Button>
  );
}
