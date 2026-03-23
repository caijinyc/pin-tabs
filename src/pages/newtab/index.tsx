import React from 'react';
import { createRoot } from 'react-dom/client';
import Newtab from '@pages/newtab/Newtab';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';
import { initDeviceId } from '@src/shared/storages/optionsStorage';
import { applyThemeAppearance, resolveThemeAppearance } from '@src/shared/ui/app-provider';
import { themeStorage } from '@src/shared/storages/theme-storage';
import { markThemeReady } from '@src/shared/ui/theme-bootstrap';

refreshOnUpdate('pages/newtab');

async function init() {
  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find #app-container');
  }

  const initialTheme = resolveThemeAppearance(themeStorage.getSnapshot() ?? (await themeStorage.get()));
  applyThemeAppearance(initialTheme);
  markThemeReady();

  const root = createRoot(appContainer);
  root.render(<Newtab />);
}

initDeviceId();

void init();
