import React from 'react';
import { createRoot } from 'react-dom/client';
import Newtab from '@pages/newtab/Newtab';
import '@pages/newtab/index.css';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';
import { createStandaloneToast } from '@chakra-ui/react';
import { initDeviceId } from '@src/shared/storages/optionsStorage';

refreshOnUpdate('pages/newtab');
const { ToastContainer, toast } = createStandaloneToast();

export { toast };

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
