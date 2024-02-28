import { getAllOpenedTabs, SpaceInfo, TabInfo, useStore } from '@pages/newtab/store/store';
import { removeUrlHash } from '@src/shared/kits';
import { globalToast } from '@pages/newtab/Newtab';
import { produce } from 'immer';

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

    try {
      // move all tabs without group to the last
      allOpenedTabs.forEach(t => {
        if (!t.groupId) {
          chrome.tabs.move(t.id, { index: -1 });
        }
      });
    } catch (e) {
      console.error('move tab error', e);
    }

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
