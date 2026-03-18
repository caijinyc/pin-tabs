import React from 'react';
import { createRoot } from 'react-dom/client';
import Newtab from '@pages/newtab/Newtab';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';
import { initDeviceId } from '@src/shared/storages/optionsStorage';

refreshOnUpdate('pages/newtab');

function init() {
  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find #app-container');
  }

  const root = createRoot(appContainer);
  root.render(<Newtab />);
}

initDeviceId();

init();
