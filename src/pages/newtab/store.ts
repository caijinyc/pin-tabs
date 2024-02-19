import React, { useEffect } from 'react';
import { create } from 'zustand';
import { produce } from 'immer';
import { storeLocalStorage, storeSyncStorage } from '@src/shared/storages/storeSyncStorage';
import { DEFAULT_STORE_STATE } from '@src/constant';

export type TabInfo = {
  id: number;
  title: string;
  url: string;
  favIconUrl: string;

  customTitle?: string;
  active?: boolean;
  groupId?: number;
  pinned?: boolean;
};

export const useAllGroups = () => {
  const [groupsMap, setGroupsMap] = React.useState<Record<string, { name: string; id: number; color: string }>>({});

  function updateGroups() {
    chrome.tabGroups.query({}, function (groups) {
      setGroupsMap(
        groups
          .map(group => {
            return {
              name: group.title,
              id: group.id,
              color: group.color,
            };
          })
          .reduce((acc, item) => {
            acc[item.id] = item;
            return acc;
          }, {}),
      );
    });
  }

  useEffect(() => {
    updateGroups();

    window.addEventListener('visibilitychange', () => {
      updateGroups();
    });
  }, []);

  return groupsMap;
};

export const getAllOpenedTabs = async () => {
  return new Promise<TabInfo[]>((resolve, reject) => {
    chrome.tabs.query({}, function (tabs) {
      resolve(
        tabs
          .map(tab => {
            return {
              id: tab.id,
              title: tab.title,
              url: tab.url,
              favIconUrl: tab.favIconUrl,
              active: tab.active,
              groupId: tab.groupId > 0 ? tab.groupId : undefined,
              pinned: tab.pinned,
            };
          })
          .filter(item => {
            if (item?.url.startsWith('edge://newtab')) return false;

            return (
              item.url &&
              (item.url.startsWith('http') || item.url.startsWith('chrome-extension') || item.url.startsWith('edge'))
            );
          }),
      );
    });
  });
};

export function useAllOpenedTabs() {
  const [tabs, setActiveTabs] = React.useState<TabInfo[]>([]);

  const getTabs = () => {
    getAllOpenedTabs().then(setActiveTabs);
  };

  useEffect(() => {
    getTabs();
    window.addEventListener('visibilitychange', () => {
      getTabs();
    });

    window.addEventListener('onfocus', () => {
      getTabs();
    });
  }, []);

  return tabs;
}

// <script src="https://gist.github.com/caijinyc/c86f6619e8066cd20de9f27ad791d9f0.js"></script>

// export const useHistoryTabsFromHistoryApi = () => {
//   const [historyTabs, setHistoryTabs] = React.useState<TabInfo[]>([]);
//
//   useEffect(() => {
//     chrome.history.search(
//       {
//         text: '',
//         maxResults: 10,
//       },
//       function (historyItems) {
//         // setHistoryTabs(
//         //   historyItems
//         //     .map(item => {
//         //       return {
//         //         id: item.id,
//         //         title: item.title,
//         //         url: item.url,
//         //         favIconUrl: '',
//         //       };
//         //     })
//         //     .filter(item => {
//         //       return item.url && item.url.startsWith('http');
//         //     }),
//         // );
//       },
//     );
//   }, []);
//
//   return historyTabs;
// };

export type SpaceInfo = {
  name: string;
  groupId?: number;
  tabs: TabInfo[];
  uuid: string;
};

export type StoreType = {
  selectedIndex: number;

  allSpacesMap: {
    [key: string]: SpaceInfo;
  };

  groups: {
    name: string;
    // TODO 数据结构变更，这里需要支持 Map，可以存储其他数据，例如 group id
    subSpacesIds: string[];
  }[];

  lastSyncTime: number;
  alreadySyncedToGist?: boolean;
};

export const useStore = create<StoreType>(() => produce(DEFAULT_STORE_STATE, draft => {}));

export const loadStoreFromStorage = () => {
  return Promise.all([storeLocalStorage.get(), storeSyncStorage.get()]).then(([localData, cloudData]) => {
    // console.log('localData', localData);
    // console.log('cloudData', cloudData);

    return useStore.setState(localData);

    // if (localData.lastSyncTime > cloudData.lastSyncTime) {
    //   console.log('init local data');
    //   return useStore.setState(localData);
    // } else {
    //   console.log('init cloud data');
    //   return useStore.setState(cloudData);
    // }
  });
};

loadStoreFromStorage();

export const addPageToCurrentSpace = (id: string, tab: TabInfo) => {
  const state = useStore.getState();

  if (state.allSpacesMap[id].tabs.find(item => item.id === tab.id)) {
    removePageFromCurrentSpace(id, tab);
    return;
  }

  useStore.setState(old => {
    return produce(old, draft => {
      draft.allSpacesMap[id].tabs.push(tab);
    });
  });
};

export const removePageFromCurrentSpace = (id: string, tab: TabInfo) => {
  useStore.setState(old => {
    return produce(old, draft => {
      const oldTabs = draft.allSpacesMap[id].tabs;
      draft.allSpacesMap[id].tabs = oldTabs.filter(t => t.id !== tab.id);
    });
  });
};

export const useIsPopupStore = create<boolean>(() => false);

export const isPopupStore = useIsPopupStore.getState();
