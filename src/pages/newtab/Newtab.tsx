import React, { useEffect } from 'react';
import styles from './style.module.scss';
import '@pages/newtab/index.css';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import { ChakraProvider, createStandaloneToast } from '@chakra-ui/react';
import { loadStoreFromStorage, useIsPopupStore, useStore } from '@pages/newtab/store/store';
import { LeftPanel } from '@pages/newtab/panel/left-group-side';
import { RightContentPanel } from '@pages/newtab/panel/right';
import { GlobalDialog } from '@pages/newtab/comps/global-dialog';
import { storeLocalStorage } from '@src/shared/storages/deviceSyncStorage';
import { diffMapPickKeys } from '@src/shared/kits';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const { ToastContainer, toast } = createStandaloneToast();
export const globalToast = toast;

const useSaveStoreDataToStorage = () => {
  useEffect(() => {
    useStore.subscribe((state, prevState) => {
      storeLocalStorage.get().then(data => {
        let alreadySyncedToGist = data.alreadyBackupToGist;

        // 只有allSpacesMap和groups发生变化时，才需要同步到gist
        if (diffMapPickKeys(state, prevState, ['allSpacesMap', 'groups'])) {
          console.log('need to sync to gist: true');
          alreadySyncedToGist = false;
        }

        console.log('store changed & local storage updated');
        console.log('alreadySyncedToGist:', alreadySyncedToGist);
        storeLocalStorage.set({
          ...useStore.getState(),
          alreadyBackupToGist: alreadySyncedToGist,
        });
      });
    });
  }, []);
};

// 每次切换到前台时，都尝试从 storage 中加载数据（防止 cloud 更新，但是本地被未同步到 store 中）
function useLoadStoreData() {
  useEffect(() => {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        loadStoreFromStorage();
      }
    });

    window.addEventListener('focus', function () {
      console.log('窗口获得焦点');
      // 执行窗口获得焦点时的操作
      loadStoreFromStorage();
    });
  }, []);
}

const NewTab = (props: { isPopup?: boolean }) => {
  const selectedIndex = useStore(state => state.selectedIndex);
  const redirectMode = useStore(state => state.redirect);

  if (props.isPopup && !useIsPopupStore.getState()) {
    useIsPopupStore.setState(true);
  }

  useSaveStoreDataToStorage();
  useLoadStoreData();

  return (
    <div className="App">
      {redirectMode ? null : (
        <ChakraProvider>
          <GlobalDialog />
          <ToastContainer />

          <DndProvider backend={HTML5Backend}>
            <div className={styles.wrapper}>
              <LeftPanel />
              <RightContentPanel />
            </div>
          </DndProvider>
        </ChakraProvider>
      )}
    </div>
  );
};

export default withErrorBoundary(withSuspense(NewTab, <div> Loading ... </div>), <div> Error Occur </div>);
