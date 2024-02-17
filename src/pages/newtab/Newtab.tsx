import React, { useEffect } from 'react';
import styles from './style.module.scss';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import { ChakraProvider } from '@chakra-ui/react';
import { useIsPopupStore, useStore } from '@pages/newtab/store';
import { LeftPanel } from '@pages/newtab/panel/left-group-side';
import { RightContentPanel } from '@pages/newtab/panel/right';
import { GlobalDialog } from '@pages/newtab/comps/global-dialog';

const useCacheData = () => {
  useEffect(() => {
    // every ten minutes save data as a backup version,
    const interval = setInterval(
      () => {
        // get last backup data
        chrome.storage.local.get(['cache_tabs_info_backup']).then(val => {
          if (val['cache_tabs_info_backup']) {
            const newBackup = [...val['cache_tabs_info_backup'], useStore.getState()];
            chrome.storage.local.set({ cache_tabs_info_backup: newBackup });
          } else {
            chrome.storage.local.set({ cache_tabs_info_backup: [useStore.getState()] });
          }
        });
      },
      1000 * 60 * 10,
    );

    return () => {
      clearInterval(interval);
    };
  }, []);
};

const NewTab = (props: { isPopup?: boolean }) => {
  const selectedIndex = useStore(state => state.selectedIndex);

  if (props.isPopup && !useIsPopupStore.getState()) {
    useIsPopupStore.setState(true);
  }

  useEffect(() => {
    console.log('useStore.getState()', useStore.getState());

    useStore.subscribe(() => {
      console.log('state change');
      chrome.storage.local.set({ cache_tabs_info: useStore.getState() }).then(() => {});
    });
  }, []);

  useCacheData();

  // useEffect(() => {
  //   let oneDayAgo = new Date().getTime() - 24 * 60 * 60 * 1000;
  //
  //   chrome.history.search(
  //     {
  //       text: '', // 空字符串表示不过滤，获取所有历史记录
  //       startTime: oneDayAgo,
  //     },
  //     function (historyItems) {
  //       // historyItems是一个包含历史记录的数组
  //       for (var i = 0; i < historyItems.length; ++i) {
  //         console.log(historyItems[i]); // 输出历史记录的URL
  //       }
  //     },
  //   );
  // }, []);

  return (
    <div className="App">
      <ChakraProvider>
        <GlobalDialog />

        <div className={styles.wrapper}>
          {/*left groups list*/}
          <LeftPanel />
          <RightContentPanel />
        </div>
      </ChakraProvider>
    </div>
  );
};

export default withErrorBoundary(withSuspense(NewTab, <div> Loading ... </div>), <div> Error Occur </div>);
