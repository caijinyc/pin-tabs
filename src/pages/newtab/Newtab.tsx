import React, { useEffect } from 'react';
import styles from './style.module.scss';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import { ChakraProvider, createStandaloneToast } from '@chakra-ui/react';
import { loadStoreFromStorage, useIsPopupStore, useStore } from '@pages/newtab/store';
import { LeftPanel } from '@pages/newtab/panel/left-group-side';
import { RightContentPanel } from '@pages/newtab/panel/right';
import { GlobalDialog } from '@pages/newtab/comps/global-dialog';
import { storeLocalStorage } from '@src/shared/storages/storeSyncStorage';

const { ToastContainer, toast } = createStandaloneToast();
export const globalToast = toast;

const useSaveStoreDataToStorage = () => {
  useEffect(() => {
    useStore.subscribe(() => {
      console.log('store changed & local storage updated');
      storeLocalStorage.set({
        ...useStore.getState(),
        alreadySyncedToGist: false,
        lastSyncTime: Date.now(),
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

  if (props.isPopup && !useIsPopupStore.getState()) {
    useIsPopupStore.setState(true);
  }

  useSaveStoreDataToStorage();
  useLoadStoreData();

  return (
    <div className="App">
      <ChakraProvider>
        <GlobalDialog />
        <ToastContainer />

        <div className={styles.wrapper}>
          <LeftPanel />
          <RightContentPanel />
        </div>
      </ChakraProvider>
    </div>
  );
};

export default withErrorBoundary(withSuspense(NewTab, <div> Loading ... </div>), <div> Error Occur </div>);
