import React, { useEffect } from 'react';
import { create } from 'zustand';
import { createStandaloneToast } from '@chakra-ui/react';
import { toast } from '@pages/newtab/index';
import { immer } from 'zustand/middleware/immer';
import { produce } from 'immer';
import { ReactComponent } from '*.svg';

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

  console.log('vttttt', tabs);

  useEffect(() => {
    getTabs();
    return () =>
      window.addEventListener('focus', () => {
        getTabs();
      });
  }, []);
  return tabs;
}

export const useStore = create<{
  orderIds: string[];
  selectedId: string;

  allSpaces: {
    [key: string]: {
      name: string;
      tabs: TabInfo[];
    };
  };

  spaces: {
    name: string;
    subSpacesIds: string[];
  }[];
}>(() => ({
  orderIds: ['1', '2', '3'],
  selectedId: '1',
  allSpaces: {},

  spaces: [
    {
      name: 'DEV MODE',
      subSpacesIds: ['1', '2', '3'],
    },
  ],
}));

// export const addPageToSpace = (spaceId: string, tab: TabInfo) => {
//   useStore.setState(old => {
//     old.spaces[spaceId].tabs.push(tab);
//     return old;
//   });
// };

export const addPageToCurrentSpace = (subId: string, tab: TabInfo) => {
  const state = useStore.getState();

  if (state.spaces[state.selectedId].subSpaces[subId].tabs.includes(tab)) {
    removePageFromCurrentSpace(subId, tab);
    return;
  }

  useStore.setState(old => {
    return produce(old, draft => {
      draft.spaces[old.selectedId].subSpaces[subId].tabs.push(tab);
    });
  });
};

export const removePageFromCurrentSpace = (subId: string, tab: TabInfo) => {
  useStore.setState(old => {
    return produce(old, draft => {
      const oldTabs = draft.spaces[old.selectedId].subSpaces[subId].tabs;
      draft.spaces[old.selectedId].subSpaces[subId].tabs = oldTabs.filter(t => t.id !== tab.id);
    });
  });
};
