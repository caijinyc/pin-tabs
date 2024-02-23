import React, { useEffect } from 'react';
import { create } from 'zustand';
import { produce } from 'immer';
import { storeLocalStorage } from '@src/shared/storages/deviceSyncStorage';
import { DEFAULT_STORE_STATE } from '@src/constant';
import { cacheImgBase64ToDB, getCacheImgBase64Map } from '@pages/newtab/util/cache-images';
import { diffMapPickKeys, uuid } from '@src/shared/kits';

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

type GroupItem = { name: string; id: number; color: string };
type GroupMap = Record<string, GroupItem>;

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

  allSpacesMap: {
    [key: string]: SpaceInfo;
  };

  groups: GroupInfo[];

  archiveSpaces?: {
    spaceIds: string[];
  };

  // 每次同步完成后，更新版本号
  version: number;

  alreadyBackupToGist?: boolean;
};

export const useStore = create<StoreType>(() => produce(DEFAULT_STORE_STATE, draft => {}));

// getGistData().then(res => {
//   console.log('getGistData', JSON.parse(res.data.files['backup_data.json'].content));
//   // console.log('getGistData', data.files['backup_data.json'].content);
// });

console.log(
  'chrome.permissions',
  chrome.permissions.getAll().then(res => console.log(res)),
);

export const loadStoreFromStorage = () => {
  return Promise.all([storeLocalStorage.get()]).then(([localData]) => {
    // console.log('localData', localData);
    // console.log('cloudData', cloudData);

    const storeData = useStore.getState();

    if (!diffMapPickKeys(localData, storeData, ['groups', 'selectedIndex', 'allSpacesMap'])) {
      return;
    }

    return useStore.setState(() => {
      return {
        ...localData,
        groups: localData.groups.map((group, index) => {
          return {
            id: group.id ? group.id : uuid(),
            ...group,
          };
        }),
      };
    });

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
