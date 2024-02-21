import { getAllOpenedTabs, SpaceInfo, TabInfo, useAllOpenedTabs, useStore } from '@pages/newtab/store/store';
import { AddTabToGetPopoverCurrentSpace } from '@pages/newtab/panel/right/comps/add-tab';
import styles from './style.module.scss';
import React from 'react';
import { Input } from '@chakra-ui/react';
import { produce } from 'immer';
import { SpaceMoreActions } from './space-actions';
import { cls, removeUrlHash } from '@src/shared/kits';
import { globalToast } from '@pages/newtab/Newtab';
import { TabItem } from '@pages/newtab/panel/right/comps/group-content/tab-item';
import { useDrag } from 'react-dnd';
import { DRAG_TYPE } from '@pages/newtab/panel/left-group-side';
import { Icon } from '@iconify-icon/react';

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

export type DropItem = {
  spaceId: string;
};

const SpaceItem = ({ space }: { space: SpaceInfo }) => {
  const spaceId = space.uuid;
  const tabs = space.tabs;
  const allTabs = useAllOpenedTabs();

  const [{ opacity, dragging }, drag, preview] = useDrag(() => {
    const dropProps: DropItem = {
      spaceId,
    };
    return {
      type: DRAG_TYPE,
      item: dropProps,
      collect: monitor => ({
        opacity: monitor.isDragging() ? 0.4 : 1,
        dragging: monitor.isDragging(),
      }),
    };
  }, [spaceId]);

  return (
    <div key={spaceId} className={styles.spaceItem}>
      <div className={styles.titleWrapper}>
        <div
          ref={preview}
          className={cls('flex items-center', {
            ['opacity-40']: dragging,
          })}>
          <div ref={drag} className={'cursor-move mr-1'}>
            <Icon inline icon="akar-icons:drag-vertical" />
          </div>

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
        </div>

        <AddTabToGetPopoverCurrentSpace spaceId={spaceId} />

        {<SpaceMoreActions space={space} />}
      </div>

      {tabs.length ? tabs.map(tab => <TabItem {...{ tab, allTabs, space }} key={tab.id} />) : <div>No Pinned Tabs</div>}
    </div>
  );
};

export const GroupContent = () => {
  const allSpacesMap = useStore(state => state.allSpacesMap);
  const currentSpaceTabs = useStore(state => state.groups[state.selectedIndex]) || { subSpacesIds: [] };

  return (
    <>
      <div className={styles.tabsWrapper}>
        {currentSpaceTabs.subSpacesIds.map(spaceId => {
          const space = allSpacesMap[spaceId];
          return <SpaceItem space={space} key={spaceId} />;
        })}
      </div>
    </>
  );
};
