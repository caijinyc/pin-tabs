import React, { useEffect } from 'react';
import { create } from 'zustand';
import { produce } from 'immer';
import { storeLocalStorage } from '@src/shared/storages/deviceSyncStorage';
import { DEFAULT_STORE_STATE, NEED_SYNC_KEYS } from '@src/constant';
import { cacheImgBase64ToDB, getCacheImgBase64Map } from '@pages/newtab/util/cache-images';
import { diffMapPickKeys, uuid } from '@src/shared/kits';
import { openTab } from '@pages/newtab/util/open-tab';

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

type GroupMap = Record<string, GroupInfo>;

export const getAllGroups: () => Promise<GroupMap> = () =>
  new Promise((resolve, reject) => {
    chrome.tabGroups.query({}, function (groups) {
      const res = groups.reduce((acc, item) => {
        acc[item.id] = {
          name: item.title,
          id: item.id,
          color: item.color,
        };
        return acc;
      }, {} as GroupMap);

      resolve(res);
    });
  });

export const useAllGroups = () => {
  const [groupsMap, setGroupsMap] = React.useState<GroupMap>({});

  function updateGroups() {
    getAllGroups().then(val => setGroupsMap(val));
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

export type GroupInfo = {
  name: string;
  id: string;
  // TODO 数据结构变更，这里需要支持 Map，可以存储其他数据，例如 group id
  subSpacesIds: string[];
};

export type StoreType = {
  selectedIndex: number;
  selectedGroupId: string;

  allSpacesMap: {
    [key: string]: SpaceInfo;
  };

  groups: GroupInfo[];

  groupsSort: string[];
  groupsMap: GroupMap;

  archiveSpaces?: GroupInfo;

  // 每次同步完成后，更新版本号
  version: number;

  alreadyBackupToGist?: boolean;

  redirect?: boolean;
};

export const useStore = create<StoreType>(() => produce(DEFAULT_STORE_STATE, draft => {}));

export const loadStoreFromStorage = () => {
  return Promise.all([storeLocalStorage.get()]).then(([localData]) => {
    // console.log('localData', localData);
    // console.log('cloudData', cloudData);

    const storeData = useStore.getState();

    if (!diffMapPickKeys(localData, storeData, [...NEED_SYNC_KEYS, 'selectedIndex', 'selectedGroupId'])) {
      return;
    }

    // get url query params
    const url = new URL(window.location.href);
    const tabId = url.searchParams.get('tabId');
    const spaceId = url.searchParams.get('spaceId');

    useStore.setState(() => {
      return {
        ...localData,
        redirect: Boolean(tabId && spaceId),
        groupsSort: localData.groupsSort ? localData.groupsSort : localData.groups.map(item => item.id),
        groupsMap: localData.groupsMap
          ? localData.groupsMap
          : localData.groups.reduce((acc, item) => {
              return {
                ...acc,
                [item.id]: item,
              };
            }, {} as GroupMap),
        groups: localData.groups.map((group, index) => {
          return {
            id: group.id ? group.id : uuid(),
            ...group,
          };
        }),
      };
    });

    if (tabId && spaceId && localData) {
      const tab = localData.allSpacesMap[spaceId].tabs.find(item => item.id === Number(tabId));
      const space = localData.allSpacesMap[spaceId];

      chrome.tabs.getCurrent().then(currentTab => {
        openTab({
          tab,
          space,
          autoActiveOpenedTab: true,
        });

        if (currentTab) {
          console.log('close current tab');

          setTimeout(() => {
            chrome.tabs.remove(currentTab.id);
          }, 100);
        }
      });
    }
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

export const useCacheImgBase64 = create<{
  value: Record<string, string>;
  init: boolean;
}>(() => ({
  init: false,
  value: {},
}));

const startTimestamp = Date.now();
getCacheImgBase64Map().then(val => {
  console.log('init cached img time', Date.now() - startTimestamp);
  useCacheImgBase64.setState({
    value: val,
    init: true,
  });
});

useCacheImgBase64.subscribe(data => {
  cacheImgBase64ToDB(data.value)
    .then(() => {})
    .catch(() => {
      console.error('cacheImgBase64ToDB error');
    });
});
