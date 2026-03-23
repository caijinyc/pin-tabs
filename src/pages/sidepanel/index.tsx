import React from 'react';
import { createRoot } from 'react-dom/client';
import '@pages/sidepanel/index.css';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';
import SidePanel from '@pages/sidepanel/SidePanel';
import { applyThemeAppearance, resolveThemeAppearance } from '@src/shared/ui/app-provider';
import { themeStorage } from '@src/shared/storages/theme-storage';

refreshOnUpdate('pages/sidepanel');

function init() {
  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find #app-container');
  }
  
  applyThemeAppearance(resolveThemeAppearance(themeStorage.getSnapshot()));
  
  const root = createRoot(appContainer);
  root.render(<SidePanel />);
}

init();
