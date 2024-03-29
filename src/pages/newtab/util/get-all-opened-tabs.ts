import { TabInfo } from '@pages/newtab/store/store';
import React, { useEffect } from 'react';

export const getAllOpenedTabs = async (currentWindow?: boolean) => {
  return new Promise<TabInfo[]>(resolve => {
    chrome.tabs.query(
      {
        currentWindow,
      },
      function (tabs) {
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
      },
    );
  });
};

export function useAllOpenedTabs({ currentWindow }: { currentWindow?: boolean } = {}) {
  const [tabs, setActiveTabs] = React.useState<TabInfo[]>([]);

  const getTabs = () => {
    getAllOpenedTabs(currentWindow).then(setActiveTabs);
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
