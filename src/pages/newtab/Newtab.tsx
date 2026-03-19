import { useEffect } from 'react';
import styles from './style.module.scss';
import '@pages/newtab/index.css';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import { loadStoreFromStorage, useIsPopupStore, useStore } from '@pages/newtab/store/store';
import { LeftPanel } from '@pages/newtab/panel/left-group-side';
import { RightContentPanel } from '@pages/newtab/panel/right';
import { GlobalDialog } from '@pages/newtab/comps/global-dialog';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useSaveStoreDataToStorage } from '@pages/newtab/util/use-save-store-data-to-storage';
import { AppProvider, useThemeAppearance } from '@src/shared/ui/app-provider';
import { ToastViewport, globalToast } from '@src/shared/ui/toast';
import { ThemeToggleButton } from '@src/shared/ui/theme-toggle-button';
import { Theme } from '@chakra-ui/react';

export { globalToast };

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
  const themeAppearance = useThemeAppearance();

  if (props.isPopup && !useIsPopupStore.getState()) {
    useIsPopupStore.setState(true);
  }

  useSaveStoreDataToStorage();
  useLoadStoreData();
  return (
    <div className="App">
      {redirectMode ? null : (
        <AppProvider>
          <Theme appearance={themeAppearance} minH="100vh">
            <GlobalDialog />
            <ToastViewport />

            <div className={'fixed right-4 bottom-4 z-[10000]'}>
              <ThemeToggleButton />
            </div>

            <DndProvider backend={HTML5Backend}>
              <div className={styles.wrapper}>
                <LeftPanel />
                <RightContentPanel />
              </div>
            </DndProvider>
          </Theme>
        </AppProvider>
      )}
    </div>
  );
};

export default withErrorBoundary(withSuspense(NewTab, <div> Loading ... </div>), <div> Error Occur </div>);
