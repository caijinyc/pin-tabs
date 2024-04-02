import React, { useEffect } from 'react';
import { create } from 'zustand';
import { produce } from 'immer';
import { storeLocalStorage } from '@src/shared/storages/deviceSyncStorage';
import { ARCHIVE_GROUP_ID, DEFAULT_STORE_STATE, NEED_SYNC_KEYS } from '@src/constant';
import { cacheImgBase64ToDB, getCacheImgBase64Map } from '@pages/newtab/util/cache-images';
import { diffMapPickKeys } from '@src/shared/kits';
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

type BrowsersGroupMap = Record<string, BrowserGroupInfo>;

export const getAllBrowserGroups: () => Promise<BrowsersGroupMap> = () =>
  new Promise(resolve => {
    chrome.tabGroups.query({}, function (groups) {
      const res = groups.reduce((acc, item) => {
        acc[item.id] = {
          name: item.title,
          id: item.id,
          color: item.color,
        };
        return acc;
      }, {} as BrowsersGroupMap);

      resolve(res);
    });
  });

export const useAllBrowserGroups = () => {
  const [groupsMap, setGroupsMap] = React.useState<BrowsersGroupMap>({});

  function updateGroups() {
    getAllBrowserGroups().then(val => setGroupsMap(val));
  }

  useEffect(() => {
    updateGroups();

    window.addEventListener('visibilitychange', () => {
      updateGroups();
    });
  }, []);

  return groupsMap;
};

// <script src="https://gist.github.com/caijinyc/c86f6619e8066cd20de9f27ad791d9f0.js"></script>

export type SpaceInfo = {
  name: string;
  groupId?: number;
  tabs: TabInfo[];
  uuid: string;
  disableAutoGroup?: boolean;
};

export type GroupInfo = {
  name: string;
  id: string;
  // TODO 数据结构变更，这里需要支持 Map，可以存储其他数据，例如 group id
  subSpacesIds: string[];
};

export type BrowserGroupInfo = {
  name: string;
  id: number;
  color: string;
};

export type StoreType = {
  selectedGroupId: string;

  allSpacesMap: {
    [key: string]: SpaceInfo;
  };

  groupsSort: string[];
  groupsMap: GroupMap;

  // 每次同步完成后，更新版本号
  version: number;

  alreadyBackupToGist?: boolean;

  redirect?: boolean;
};

export const useStore = create<StoreType>(() => produce(DEFAULT_STORE_STATE, draft => {}));

export const getArchivedSpaces = () => {
  const state = useStore.getState();
  const archiveGroup = state.groupsMap[ARCHIVE_GROUP_ID];
  if (!archiveGroup) {
    return [];
  }

  return archiveGroup.subSpacesIds.map(id => state.allSpacesMap[id]);
};

export const isSpaceArchived = (spaceId: string) => {
  const state = useStore.getState();
  return state.groupsMap[ARCHIVE_GROUP_ID]?.subSpacesIds.includes(spaceId);
};

export const loadStoreFromStorage = () => {
  return Promise.all([storeLocalStorage.get()]).then(([localData]) => {
    const storeData = useStore.getState();

    if (!diffMapPickKeys(localData, storeData, [...NEED_SYNC_KEYS, 'selectedGroupId'])) {
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
  console.log('val', val);
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
