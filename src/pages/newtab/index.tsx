import React from 'react';
import { createRoot } from 'react-dom/client';
import Newtab from '@pages/newtab/Newtab';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';
import { createStandaloneToast } from '@chakra-ui/react';
import { initDeviceId } from '@src/shared/storages/optionsStorage';

refreshOnUpdate('pages/newtab');
const { ToastContainer, toast } = createStandaloneToast();

export { toast };

if (localStorage.getItem('chakra-ui-color-mode') === 'light') {
  localStorage.setItem('chakra-ui-color-mode', 'dark');
}

function init() {
  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find #app-container');
  }

  const root = createRoot(appContainer);

  root.render(
    <>
      <Newtab />
      <ToastContainer />
    </>,
  );
}

initDeviceId();

init();
