import React from 'react';
import { createRoot } from 'react-dom/client';
import '@pages/popup/index.css';
import Popup from '@pages/popup/Popup';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';
import { applyThemeAppearance, resolveThemeAppearance } from '@src/shared/ui/app-provider';
import { themeStorage } from '@src/shared/storages/theme-storage';
import { markThemeReady } from '@src/shared/ui/theme-bootstrap';

refreshOnUpdate('pages/popup');

async function init() {
  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find #app-container');
  }

  const initialTheme = resolveThemeAppearance(themeStorage.getSnapshot() ?? (await themeStorage.get()));
  applyThemeAppearance(initialTheme);
  markThemeReady();

  const root = createRoot(appContainer);
  root.render(<Popup />);

  // find page status, if it's alread opened, jump to it. else open it

  // chrome.tabs.query({ url }, tabs => {
  //   if (tabs.length > 0) {
  //     chrome.tabs.update(tabs[0].id, { active: true });
  //     return;
  //   } else {
  //     chrome.tabs.create({ url });
  //   }
  // });

  //
  // window.open(`chrome-extension://${chrome.runtime.id}/src/pages/newtab/index.html`);
}

void init();
