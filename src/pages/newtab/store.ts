import React, { useEffect } from 'react';
import { create } from 'zustand';
import { produce } from 'immer';

export type TabInfo = {
  id: number;
  title: string;
  url: string;
  favIconUrl: string;
};

export function useAllOpenedTabs() {
  const [tabs, setActiveTabs] = React.useState<TabInfo[]>([]);

  const getTabs = () => {
    chrome.tabs.query({}, function (tabs) {
      setActiveTabs(
        tabs
          .map(tab => {
            return {
              id: tab.id,
              title: tab.title,
              url: tab.url,
              favIconUrl: tab.favIconUrl,
            };
          })
          .filter(item => {
            return item.url && item.url.startsWith('http');
          }),
      );
    });
  };

  useEffect(() => {
    getTabs();
    window.addEventListener('visibilitychange', val => {
      console.log('vvvvvvvvlll', val);
      getTabs();

      chrome.storage.local.set({ cache_tabs_info: useStore.getState() }).then(() => {
        console.log('Value is set');
      });
    });
    window.addEventListener('onfocus', () => {
      console.log('onfocus');
      getTabs();
    });
    //     return () =>
    // ;
  }, []);
  return tabs;
}

export const useStore = create<{
  selectedIndex: number;

  allSpacesMap: {
    [key: string]: {
      name: string;
      tabs: TabInfo[];
    };
  };

  groups: {
    name: string;
    // TODO 数据结构变更，这里需要支持 Map，可以存储其他数据，例如 group id
    subSpacesIds: string[];
  }[];
}>(() => ({
  selectedIndex: 0,
  allSpacesMap: {
    1: {
      name: 'Monorepo',
      tabs: [],
    },
  },

  groups: [
    {
      name: 'DEV MODE',
      subSpacesIds: [],
    },
    {
      name: 'REPORT',
      subSpacesIds: [],
    },
    {
      name: 'PLANNING',
      subSpacesIds: [],
    },
  ],
}));

// export const addPageToSpace = (spaceId: string, tab: TabInfo) => {
//   useStore.setState(old => {
//     old.spaces[spaceId].tabs.push(tab);
//     return old;
//   });
// };

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
