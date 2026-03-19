import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

export type ThemeAppearance = 'light' | 'dark';

export const DEFAULT_THEME: ThemeAppearance = 'dark';

export const getNextTheme = (theme: ThemeAppearance): ThemeAppearance => {
  return theme === 'dark' ? 'light' : 'dark';
};

const createMemoryThemeStorage = (): BaseStorage<ThemeAppearance> => {
  let cache: ThemeAppearance = DEFAULT_THEME;
  let listeners: Array<() => void> = [];

  return {
    get: async () => cache,
    set: async valueOrUpdate => {
      if (typeof valueOrUpdate === 'function') {
        cache = await valueOrUpdate(cache);
      } else {
        cache = valueOrUpdate;
      }

      listeners.forEach(listener => listener());
    },
    getSnapshot: () => cache,
    subscribe: listener => {
      listeners = [...listeners, listener];
      return () => {
        listeners = listeners.filter(item => item !== listener);
      };
    },
  };
};

const canUseChromeStorage = typeof chrome !== 'undefined' && Boolean(chrome.storage?.local);

const storage: BaseStorage<ThemeAppearance> = canUseChromeStorage
  ? createStorage<ThemeAppearance>('theme-storage-key', DEFAULT_THEME, {
      storageType: StorageType.Local,
      liveUpdate: true,
    })
  : createMemoryThemeStorage();

export const themeStorage = {
  ...storage,
  setTheme: async (theme: ThemeAppearance) => {
    return storage.set(theme);
  },
  toggle: async () => {
    return storage.set(currentTheme => getNextTheme((currentTheme ?? DEFAULT_THEME) as ThemeAppearance));
  },
};