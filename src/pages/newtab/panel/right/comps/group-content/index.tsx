import {
  getAllOpenedTabs,
  SpaceInfo,
  TabInfo,
  useAllOpenedTabs,
  useCacheImgBase64,
  useStore,
} from '@pages/newtab/store/store';
import { AddTabToGetPopoverCurrentSpace } from '@pages/newtab/panel/right/comps/add-tab';
import styles from './style.module.scss';
import React, { useEffect } from 'react';
import { Input } from '@chakra-ui/react';
import { produce } from 'immer';
import { Icon } from '@iconify-icon/react';
import { SpaceMoreActions } from './space-actions';
import { removeUrlHash } from '@src/shared/kits';
import { globalToast } from '@pages/newtab/Newtab';
import { getImageBase64 } from '@pages/newtab/util/cache-images';

function updateSpaceName(spaceId: string, val: string) {
  useStore.setState(old => {
    return produce(old, draft => {
      draft.allSpacesMap[spaceId].name = val || '';
    });
  });
}

export const openTab = async ({
  tab,
  space,
  autoActiveOpenedTab = false,
}: {
  tab: TabInfo;
  space: SpaceInfo;
  autoActiveOpenedTab?: boolean;
}) => {
  const allOpenedTabs = await getAllOpenedTabs();
  let activeTab = allOpenedTabs.find(t => {
    if (removeUrlHash(t.url) === removeUrlHash(tab.url)) {
      return true;
    }
    return t.url === tab.url || t.title === tab.title || t.id === tab.id;
  });
  console.log('allOpenedTabs', allOpenedTabs);
  const spaceId = space.uuid;

  if (activeTab && activeTab.pinned) {
    globalToast({
      title: 'Tab already opened & pinned',
      description: 'The tab is already opened',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });

    return;
  }

  // let activeTab: TabInfo;

  const addToGroup = async () => {
    const newTab = activeTab
      ? activeTab
      : await chrome.tabs.create({ url: tab.url, active: false }).then(res => {
          return {
            id: res.id,
            url: res.url,
            title: res.title,
            favIconUrl: res.favIconUrl,
          } as TabInfo;
        });

    const newTabId = newTab.id;

    activeTab = newTab;

    console.log('newTabId', newTabId);

    let groupId: number | undefined = undefined;

    const allGroups = await chrome.tabGroups.query({ windowId: chrome.windows.WINDOW_ID_CURRENT });

    // 先看看当前 space 存储的 groupId 是否有效
    if (space.groupId) {
      await chrome.tabGroups
        .get(space.groupId)
        .then(res => {
          if (res) {
            groupId = res.id;
          }
        })
        .catch(e => {
          console.log('groupId not found', e);
        });
    }

    const nameEqualGroup = allGroups.find(g => g.title === space.name);
    // 如果当前 space 存储的 groupId 无效，再看看是否有同名的 group
    if (nameEqualGroup) {
      groupId = nameEqualGroup?.id;
    }

    const newGroupId = await chrome.tabs.group({
      tabIds: [newTabId],
      groupId: groupId ? groupId : undefined,
    });

    if (space.groupId !== newGroupId) {
      useStore.setState(old => {
        return produce(old, draft => {
          draft.allSpacesMap[spaceId].groupId = newGroupId;
        });
      });
    }

    await chrome.tabGroups
      .update(newGroupId, {
        title: space.name,
      })
      .catch(e => {
        console.log('update group title error', e);
      });
  };

  addToGroup()
    .catch(e => {
      console.error(e);
    })
    .then(() => {
      if (activeTab && autoActiveOpenedTab) {
        // console.log('activeTab', activeTab);
        chrome.tabs.update(activeTab.id, { active: true });
      }
    });
};

function RenderIcon({ tab }: { tab: TabInfo }) {
  const initIconCacheData = useCacheImgBase64(state => state.init);

  const favIconBase64 = useCacheImgBase64(state => {
    if (!tab.favIconUrl?.startsWith('http')) return;

    return state.value[tab.favIconUrl];
  });

  useEffect(() => {
    if (initIconCacheData && tab.favIconUrl?.startsWith('http') && !favIconBase64) {
      getImageBase64(tab.favIconUrl)
        .then(val => {
          useCacheImgBase64.setState(old => {
            return {
              value: {
                ...old.value,
                [tab.favIconUrl]: val,
              },
            };
          });
        })
        .catch(e => {
          console.error('getImageBase64', tab.favIconUrl, e);
        });
    }
  }, [initIconCacheData]);

  return <img src={favIconBase64 || tab.favIconUrl} className={styles.favicon} alt="" />;
}

const TabItem = ({ tab, space }: { tab: TabInfo; space: SpaceInfo }) => {
  const spaceId = space.uuid;
  const [isEdit, setIsEdit] = React.useState(false);

  return (
    <div className={styles.tabListItem} key={tab.id}>
      <div
        className={styles.tabItemWrapper}
        onMouseDown={e => {
          const isMiddleClick = e.button === 1;
          const isLeftClick = e.button === 0;

          if (![isLeftClick, isMiddleClick].some(Boolean)) return;

          if (isEdit) return;

          // get tab active status from tab url
          openTab({ tab, space, autoActiveOpenedTab: isLeftClick });
        }}>
        {tab.url.startsWith('chrome://') || tab.url.startsWith('edge://extensions') ? (
          <Icon inline icon="fluent:extension-16-filled" width={18} height={18} />
        ) : (
          <RenderIcon tab={tab} />
        )}

        {isEdit ? (
          <Input
            size={'xs'}
            autoFocus
            // variant="unstyled"
            placeholder="Unstyled"
            defaultValue={tab.title}
            onBlur={e => {
              setIsEdit(false);
              if (e.target.value) {
                useStore.setState(old => {
                  return produce(old, draft => {
                    draft.allSpacesMap[spaceId].tabs = draft.allSpacesMap[spaceId].tabs.map(t => {
                      if (t.id === tab.id) {
                        t.title = e.target.value;
                      }
                      return t;
                    });
                  });
                });
              }
            }}
          />
        ) : (
          <div className={styles.tabTitle}>{tab.title}</div>
        )}
      </div>

      {isEdit ? null : (
        <div className={styles.tabActions}>
          <Icon
            onClick={() => {
              setIsEdit(true);
            }}
            inline
            icon="lets-icons:edit-duotone-line"
            width={'18px'}
            height={'18px'}
            className={styles.delTab}
          />
          <Icon
            onClick={() => {
              useStore.setState(old => {
                return produce(old, draft => {
                  draft.allSpacesMap[spaceId].tabs = draft.allSpacesMap[spaceId].tabs.filter(t => t.id !== tab.id);
                });
              });
            }}
            inline
            icon="lets-icons:dell-duotone"
            width={'18px'}
            height={'18px'}
            className={styles.delTab}
          />
        </div>
      )}
    </div>
  );
};

export const GroupContent = () => {
  const allSpacesMap = useStore(state => state.allSpacesMap);
  const currentSpaceTabs = useStore(state => state.groups[state.selectedIndex]) || { subSpacesIds: [] };
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
                  size={'sm'}
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

                {<SpaceMoreActions space={space} />}
              </div>

              {tabs.length ? (
                tabs.map(tab => <TabItem {...{ tab, allTabs, space }} key={tab.id} />)
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
