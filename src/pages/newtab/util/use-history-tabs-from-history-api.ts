import React, { useEffect } from 'react';
import { TabInfo } from '@pages/newtab/store/store';

export const useHistoryTabsFromHistoryApi = () => {
  const [historyTabs, setHistoryTabs] = React.useState<TabInfo[]>([]);

  useEffect(() => {
    chrome.history.search(
      {
        text: '',
        maxResults: 10,
      },
      function (historyItems) {
        setHistoryTabs(
          historyItems
            .map(item => {
              return {
                id: Number(item.id),
                title: item.title || '',
                url: item.url || '',
                favIconUrl: '',
              };
            })
            .filter(item => {
              return item.url && item.url.startsWith('http');
            }),
        );
      },
    );
  }, []);

  return historyTabs;
};
