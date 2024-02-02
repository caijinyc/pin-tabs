import { useAllOpenedTabs, useStore } from '@pages/newtab/store';
import { AddTabToGetPopoverCurrentSpace } from '@pages/newtab/comps/add-tab';
import styles from './style.module.scss';
import React from 'react';
import { Input, Popover, PopoverContent, PopoverTrigger } from '@chakra-ui/react';
import { produce } from 'immer';
import { Icon } from '@iconify-icon/react';
import { dialog, TransitionExample } from '@pages/newtab/comps/global-dialog';

function updateSpaceName(spaceId: string, val: string) {
  useStore.setState(old => {
    return produce(old, draft => {
      draft.allSpacesMap[spaceId].name = val || '';
    });
  });
}

const SpaceMoreActions = ({ spaceId }: { spaceId: string }) => {
  const currentSpaceTabs = useStore(state => state.groups[state.selectedIndex]);

  const actionsList = [
    {
      name: 'DEL SPACE',
      icon: 'carbon:edit',
      action: () => {
        dialog.confirm({
          title: 'Confirm',
          content: 'Are you sure to delete this space?',
          onOk: () => {
            useStore.setState(old => {
              return produce(old, draft => {
                draft.groups[draft.selectedIndex].subSpacesIds = draft.groups[draft.selectedIndex].subSpacesIds.filter(
                  id => id !== spaceId,
                );
                delete draft.allSpacesMap[spaceId];
              });
            });
          },
        });
      },
    },
    {
      name: 'MOVE UP',
      icon: 'mdi:arrow-up',
      action: () => {
        if (currentSpaceTabs.subSpacesIds[0] === spaceId) {
          return;
        }

        useStore.setState(old => {
          return produce(old, draft => {
            const index = draft.groups[draft.selectedIndex].subSpacesIds.findIndex(id => id === spaceId);
            const temp = draft.groups[draft.selectedIndex].subSpacesIds[index];
            draft.groups[draft.selectedIndex].subSpacesIds[index] =
              draft.groups[draft.selectedIndex].subSpacesIds[index - 1];
            draft.groups[draft.selectedIndex].subSpacesIds[index - 1] = temp;
          });
        });
      },
    },
    {
      name: 'MOVE DOWN',
      icon: 'mdi:arrow-down',
      action: () => {
        if (currentSpaceTabs.subSpacesIds[currentSpaceTabs.subSpacesIds.length - 1] === spaceId) {
          return;
        }
        useStore.setState(old => {
          return produce(old, draft => {
            const index = draft.groups[draft.selectedIndex].subSpacesIds.findIndex(id => id === spaceId);
            const temp = draft.groups[draft.selectedIndex].subSpacesIds[index];
            draft.groups[draft.selectedIndex].subSpacesIds[index] =
              draft.groups[draft.selectedIndex].subSpacesIds[index + 1];
            draft.groups[draft.selectedIndex].subSpacesIds[index + 1] = temp;
          });
        });
      },
    },
  ];

  return (
    <Popover placement={'bottom-start'} matchWidth={true}>
      <PopoverTrigger>
        <div className={styles.moreActionIcon}>
          <Icon icon="material-symbols:more-horiz" width="18" height="18" inline />
        </div>
      </PopoverTrigger>

      <PopoverContent className={styles.spaceMoreActionWrapper} width={150}>
        {actionsList.map(item => (
          <div
            key={item.name}
            onClick={() => {
              item.action();
            }}>
            <Icon icon={item.icon} width="18" height="18" inline />
            <div>{item.name}</div>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
};

export const GroupContent = () => {
  const allSpacesMap = useStore(state => state.allSpacesMap);
  const currentSpaceTabs = useStore(state => state.groups[state.selectedIndex]);
  const allTabs = useAllOpenedTabs();

  return (
    <>
      <TransitionExample />
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

                {<SpaceMoreActions spaceId={spaceId} />}
              </div>

              {tabs.length ? (
                tabs.map(tab => (
                  <div className={styles.tabListItem} key={tab.id}>
                    <div
                      className={styles.tabItemWrapper}
                      onClick={() => {
                        // get tab active status from tab url
                        const activeTab = allTabs.find(t => t.url === tab.url);

                        const addToGroup = async () => {
                          const newTabId = activeTab
                            ? activeTab.id
                            : await chrome.tabs.create({ url: tab.url }).then(res => res.id);

                          const newGroupId = await chrome.tabs.group({
                            tabIds: [newTabId],
                            groupId: space.groupId ? space.groupId : undefined,
                          });

                          if (!space.groupId) {
                            useStore.setState(old => {
                              return produce(old, draft => {
                                draft.allSpacesMap[spaceId].groupId = newGroupId;
                              });
                            });
                          }

                          await chrome.tabGroups.update(newGroupId, {
                            title: space.name,
                          });
                        };

                        addToGroup();

                        if (activeTab) {
                          chrome.tabs.update(activeTab.id, { active: true });
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
