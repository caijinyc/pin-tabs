import { useAllBrowserGroups } from '@pages/newtab/store/store';
import React, { useEffect } from 'react';
import { Icon } from '@iconify-icon/react';

const removeGroupTabs = async (groupId: number) => {
  const tabs = await chrome.tabs.query({ groupId });
  return chrome.tabs.remove(tabs.map(t => t.id));
};

export const CurrentGroups = () => {
  const [removedGroups, setRemovedGroups] = React.useState<number[]>([]);
  const [currentActiveGroupId, setCurrentActiveGroupId] = React.useState<number | null>(null);
  const groups = Object.values(useAllBrowserGroups()).filter(
    group => !removedGroups.includes(group.id) && group.id !== currentActiveGroupId && group.name,
  );

  useEffect(() => {
    const updateCurrentActiveGroupId = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const currentActiveTab = tabs[0];
        setCurrentActiveGroupId(currentActiveTab.groupId);
      });
    };

    updateCurrentActiveGroupId();

    chrome.tabs.onActivated.addListener(updateCurrentActiveGroupId);

    return () => {
      chrome.tabs.onActivated.removeListener(updateCurrentActiveGroupId);
    };
  }, []);

  if (!groups.length) return null;

  const maxShowGroups = 6;
  const needShowMoreFlagStrips = groups.length > maxShowGroups;
  const renderGroups = needShowMoreFlagStrips ? groups.slice(0, maxShowGroups) : groups;

  return (
    <div className={'flex h-[24px] items-center'}>
      {renderGroups.map(group => {
        const name = group.name.length > 10 ? group.name.slice(0, 10) + '...' : group.name;
        return (
          <div
            key={group.id}
            className={'ml-1 mr-1  p-1 rounded bg-neutral-700 text-[10px] group inline-flex relative'}>
            <div className="truncate m-w-[36px]">{name}</div>
            <div
              className={'group-hover:block hidden absolute right-1 top-1 bg-neutral-700  cursor-pointer'}
              onClick={() => {
                removeGroupTabs(group.id)
                  .then(() => {
                    setRemovedGroups([...removedGroups, group.id]);
                  })
                  .catch(() => {
                    console.error('removeGroupTabs failed');
                  });
              }}>
              <Icon icon={'fluent:delete-16-filled'} width={'12px'} height={'12px'} inline />
            </div>
          </div>
        );
      })}
      {needShowMoreFlagStrips && (
        <div className={'ml-1  p-1 mr-1 rounded bg-neutral-700 text-[10px] group inline-flex relative'}>
          <div className="truncate m-w-[36px]">...</div>
        </div>
      )}
    </div>
  );
};
