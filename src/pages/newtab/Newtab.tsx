import React, { useEffect } from 'react';
import styles from './style.module.scss';
import '@pages/newtab/index.css';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import { ChakraProvider, ColorModeScript, createStandaloneToast, extendTheme, ThemeConfig } from '@chakra-ui/react';
import { loadStoreFromStorage, useIsPopupStore, useStore } from '@pages/newtab/store/store';
import { LeftPanel } from '@pages/newtab/panel/left-group-side';
import { RightContentPanel } from '@pages/newtab/panel/right';
import { GlobalDialog } from '@pages/newtab/comps/global-dialog';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useSaveStoreDataToStorage } from '@pages/newtab/util/use-save-store-data-to-storage';
import theme from '@pages/newtab/theme';

const { ToastContainer, toast } = createStandaloneToast();
export const globalToast = toast;

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
  const redirectMode = useStore(state => state.redirect);

  if (props.isPopup && !useIsPopupStore.getState()) {
    useIsPopupStore.setState(true);
  }

  useSaveStoreDataToStorage();
  useLoadStoreData();
  return (
    <div className="App">
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />

      {redirectMode ? null : (
        <ChakraProvider theme={theme}>
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
