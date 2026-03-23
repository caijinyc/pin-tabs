import React from 'react';
import { createRoot } from 'react-dom/client';
import Options from '@pages/options/Options';
import '@pages/options/index.css';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';
import { applyThemeAppearance, resolveThemeAppearance } from '@src/shared/ui/app-provider';
import { themeStorage } from '@src/shared/storages/theme-storage';

refreshOnUpdate('pages/options');

function init() {
  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find #app-container');
  }
  
  applyThemeAppearance(resolveThemeAppearance(themeStorage.getSnapshot()));
  
  const root = createRoot(appContainer);
  root.render(<Options />);
}

init();
