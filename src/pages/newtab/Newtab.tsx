import React, { useEffect } from 'react';
import styles from './style.module.scss';
import useStorage from '@src/shared/hooks/useStorage';
import exampleThemeStorage from '@src/shared/storages/exampleThemeStorage';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import { create } from 'zustand';
import { Button } from '@chakra-ui/react';

type TabInfo = {
  id: number;
  title: string;
  url: string;
  favIconUrl: string;
};

function useAllOpendTabs() {
  const [tabs, setActiveTabs] = React.useState<TabInfo[]>([]);

  const getTabs = () => {
    chrome.tabs.query({}, function (tabs) {
      setActiveTabs(
        tabs
          .map(tab => {
            return {
              id: tab.id,
              title: tab.title,
              url: tab.url,
              favIconUrl: tab.favIconUrl,
            };
          })
          .filter(item => {
            return item.url && item.url.startsWith('http');
          }),
      );
    });
  };

  console.log('vttttt', tabs);

  useEffect(() => {
    getTabs();
    return () =>
      window.addEventListener('focus', () => {
        getTabs();
      });
  }, []);
  return tabs;
}

const useStore = create<{
  spaces: Record<string, TabInfo>;
}>(() => ({
  spaces: {},
}));

const NewTab = () => {
  // const theme = useStorage(exampleThemeStorage);
  const tabs = useAllOpendTabs();
  const spaces = useStore(state => state.spaces);

  return (
    <div className="App">
      {tabs.map(tab => {
        return (
          <div className={styles.tabListItem} key={tab.id}>
            <img src={tab.favIconUrl} className={styles.favicon} alt="" />
            {tab.title}
          </div>
        );
      })}

      <div>
        <Button
          onClick={() => {
            // useStore.setState(state => {
            //   state.spaces['123'] = {
            //     id: 123,
            //     title: '123',
            //     url: '123',
            //     favIconUrl: '123',
            //   };
            // });
          }}>
          Add
        </Button>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(NewTab, <div> Loading ... </div>), <div> Error Occur </div>);
