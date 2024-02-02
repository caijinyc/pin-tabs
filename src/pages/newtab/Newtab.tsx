import React, { useEffect } from 'react';
import styles from './style.module.scss';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import { Button, ChakraProvider } from '@chakra-ui/react';
import { cls, uuid } from '@src/shared/kits';
import { useStore } from '@pages/newtab/store';
import { GroupContent } from '@pages/newtab/comps/group-content';
import { produce } from 'immer';

const NewTab = () => {
  const groups = useStore(state => state.groups);
  const selectedIndex = useStore(state => state.selectedIndex);

  useEffect(() => {
    chrome.storage.local.get(['cache_tabs_info']).then(val => {
      if (val['cache_tabs_info']) {
        useStore.setState(() => val['cache_tabs_info'] || {});
      }
    });
  }, []);

  return (
    <div className="App">
      <ChakraProvider>
        <div className={styles.wrapper}>
          {/*left groups list*/}
          <div className={styles.leftPanel}>
            {/*<h1 className={styles.leftTitle}>SAVING TABS</h1>*/}
            {/*<div className={styles.search}></div>*/}
            <div className={styles.leftSpaceWrapper}>
              {groups.map((item, index) => {
                return (
                  <div
                    className={cls(styles.leftSpaceItem, { [styles.leftSpaceItemActive]: selectedIndex === index })}
                    key={item.name}
                    style={{
                      marginBottom: 8,
                    }}
                    onClick={() => {
                      useStore.setState(() => {
                        return {
                          selectedIndex: index,
                        };
                      });
                    }}>
                    {groups[index].name}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.rightPanel}>
            <GroupContent />

            <div>
              <Button
                size={'sm'}
                onClick={() => {
                  useStore.setState(old => {
                    return produce(old, draft => {
                      const id = uuid();
                      draft.groups[selectedIndex].subSpacesIds.push(id);
                      draft.allSpacesMap[id] = {
                        name: 'Untitled Sub Space',
                        tabs: [],
                      };
                    });
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
