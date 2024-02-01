import React, { useEffect } from 'react';
import styles from './style.module.scss';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import { create } from 'zustand';
import { Button, ChakraProvider, Input } from '@chakra-ui/react';
import { cls } from '@src/shared/kits';

type TabInfo = {
  id: number;
  title: string;
  url: string;
  favIconUrl: string;
};

function useAllOpenedTabs() {
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
  orderIds: string[];
  selectedId: string;
  spaces: Record<
    string,
    {
      name: string;
      tabs: TabInfo[];
    }
  >;
}>(() => ({
  orderIds: ['1', '2', '3'],
  selectedId: '1',
  spaces: {
    '1': {
      name: 'DEV MODE',
      tabs: [],
    },
    '2': {
      name: 'REPORT',
      tabs: [],
    },
    '3': {
      name: 'PLAN',
      tabs: [],
    },
  },
}));

const NewTab = () => {
  const tabs = useAllOpenedTabs();
  const spaces = useStore(state => state.spaces);
  const selectedId = useStore(state => state.selectedId);
  const orderIds = useStore(state => state.orderIds);
  console.log('spaces', spaces);

  return (
    <div className="App">
      <ChakraProvider>
        <div className={styles.wrapper}>
          {/*left spaces list*/}
          <div className={styles.leftPanel}>
            {/*<h1 className={styles.leftTitle}>SAVING TABS</h1>*/}
            {/*<div className={styles.search}></div>*/}
            <div className={styles.leftSpaceWrapper}>
              {orderIds.map(id => {
                return (
                  <div
                    className={cls(styles.leftSpaceItem, { [styles.leftSpaceItemActive]: selectedId === id })}
                    // size={'sm'}
                    key={id}
                    style={{
                      marginBottom: 8,
                    }}
                    onClick={() => {
                      useStore.setState(() => {
                        return {
                          selectedId: id,
                        };
                      });
                    }}>
                    {spaces[id].name}
                  </div>
                );
              })}
            </div>
          </div>
          <div className={styles.rightPanel}>
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
                size={'sm'}
                onClick={() => {
                  useStore.setState(() => {
                    return {
                      spaces: {
                        ...spaces,
                        [Math.random()]: {
                          id: 123,
                          title: '123',
                          url: '123',
                          favIconUrl: '123',
                        },
                      },
                    };
                  });
                }}>
                Add Sub Space
              </Button>
            </div>
          </div>
        </div>
      </ChakraProvider>
    </div>
  );
};

export default withErrorBoundary(withSuspense(NewTab, <div> Loading ... </div>), <div> Error Occur </div>);
