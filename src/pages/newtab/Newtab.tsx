import React from 'react';
import styles from './style.module.scss';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import { Button, ChakraProvider } from '@chakra-ui/react';
import { cls } from '@src/shared/kits';
import { useAllOpenedTabs, useStore } from '@pages/newtab/store';
import { AddTabToGetPopoverCurrentSpace } from '@pages/newtab/comps/addTab';

const NewTab = () => {
  const tabs = useAllOpenedTabs();
  const spaces = useStore(state => state.spaces);
  const selectedId = useStore(state => state.selectedId);

  const currentSpaceTabs = useStore(state => state.spaces[state.selectedId]);

  const orderIds = useStore(state => state.orderIds);
  const [modalVisible, setModalVisible] = React.useState(false);

  return (
    <div className="App">
      <ChakraProvider>
        <div className={styles.wrapper}>
          {/*left spaces list*/}
          <div className={styles.leftPanel}>
            1231231
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
            <AddTabToGetPopoverCurrentSpace />

            <div className={styles.tabsWrapper}>
              {currentSpaceTabs.map(tab => {
                return (
                  <div className={styles.tabListItem} key={tab.id}>
                    <img src={tab.favIconUrl} className={styles.favicon} alt="" />
                    {tab.title}
                  </div>
                );
              })}
            </div>

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
