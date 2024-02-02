import { useAllOpenedTabs, useStore } from '@pages/newtab/store';
import { AddTabToGetPopoverCurrentSpace } from '@pages/newtab/comps/add-tab';
import styles from './style.module.scss';
import React from 'react';
import { Input } from '@chakra-ui/react';
import { produce } from 'immer';
import { Icon } from '@iconify-icon/react';

function updateSpaceName(spaceId: string, val: string) {
  useStore.setState(old => {
    return produce(old, draft => {
      draft.allSpacesMap[spaceId].name = val || '';
    });
  });
}

export const GroupContent = () => {
  const allSpacesMap = useStore(state => state.allSpacesMap);
  const currentSpaceTabs = useStore(state => state.groups[state.selectedIndex]);
  const allTabs = useAllOpenedTabs();

  return (
    <>
      <div className={styles.tabsWrapper}>
        {currentSpaceTabs.subSpacesIds.map(spaceId => {
          const space = allSpacesMap[spaceId];
          const tabs = space.tabs;

          return (
            <div key={spaceId} className={styles.spaceItem}>
              <div className={styles.titleWrapper}>
                <Input
                  style={{
                    width: 200,
                  }}
                  variant="unstyled"
                  placeholder="Unstyled"
                  value={space.name}
                  onBlur={() => {
                    if (!space.name) {
                      updateSpaceName(spaceId, 'New Space');
                    }
                  }}
                  onChange={e => {
                    updateSpaceName(spaceId, e.target.value);
                  }}
                />

                <AddTabToGetPopoverCurrentSpace spaceId={spaceId} />
              </div>

              {tabs.length ? (
                tabs.map(tab => (
                  <div className={styles.tabListItem} key={tab.id}>
                    <div
                      className={styles.tabItemWrapper}
                      onClick={() => {
                        // get tab active status from tab url
                        const activeTab = allTabs.find(t => t.url === tab.url);

                        if (activeTab) {
                          chrome.tabs.update(activeTab.id, { active: true });
                        } else {
                          console.log('ttttttttttt', window, tab);
                          window.open(tab.url);
                          // chrome.tabs.create({ url: tab.url });
                        }
                      }}>
                      <img src={tab.favIconUrl} className={styles.favicon} alt="" />

                      <div className={styles.tabTitle}>{tab.title}</div>
                    </div>

                    <div className={styles.tabActions}>
                      <Icon
                        onClick={() => {
                          useStore.setState(old => {
                            return produce(old, draft => {
                              draft.allSpacesMap[spaceId].tabs = draft.allSpacesMap[spaceId].tabs.filter(
                                t => t.id !== tab.id,
                              );
                            });
                          });
                        }}
                        inline
                        icon="lets-icons:dell-duotone"
                        width={'20px'}
                        height={'20px'}
                        className={styles.delTab}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div>No Pinned Tabs</div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};
