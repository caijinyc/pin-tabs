import { IconButton, Input, InputGroup } from '@chakra-ui/react';
import { isSpaceArchived, SpaceInfo, TabInfo, useStore } from '@pages/newtab/store/store';
import styles from '@pages/newtab/style.module.scss';
import { GroupContent } from '@pages/newtab/panel/right/comps/group-content';
import React, { useEffect, useRef } from 'react';
import { Actions } from '@pages/newtab/store/actions';
import { dialog } from '@pages/newtab/comps/global-dialog';
import { Icon } from '@iconify-icon/react';
import { spaceContentMaxWidth, SpaceItem } from '@pages/newtab/panel/right/comps/group-content/space-item';
import { create } from 'zustand';
import { openTab } from '@pages/newtab/util/open-tab';
import { lowerMultiIncludes } from '@pages/newtab/util/common';
import { debounce } from 'lodash';
import { CurrentGroups } from '@pages/newtab/panel/right/comps/current-group';
import { cls } from '@src/shared/kits';
import { globalToast } from '@src/shared/ui/toast';

export const useSelectedSearchedTabIndex = create<{
  index: number;
  tab?: TabInfo & { space: SpaceInfo };
}>(() => ({
  index: -1,
}));

export const useFilterSpace = create<{
  searchSpaceName: string;
  resetForm?: () => void;
}>((set) => ({
  searchSpaceName: '',
  resetForm: () => {
    set({
      searchSpaceName: '',
    });
  },
}));

export const useIsSearching = () => Boolean(useFilterSpace(state => state.searchSpaceName));

export const scrollToSpace = (spaceId: string) => {
  useFilterSpace.getState().resetForm?.();
  const groupId = Object.values(useStore.getState().groupsMap).find(group => group.subSpacesIds.includes(spaceId)).id;
  Actions.selectGroup(groupId);
  setTimeout(() => {
    useSelectedSearchedTabIndex.setState({
      index: -1,
      tab: undefined,
    });

    const spaceDom = document.getElementById(spaceId);
    spaceDom.scrollIntoView({
      block: 'center',
    });

    // highlight the space 2s, add animation & add animation class
    spaceDom.classList.add('bg-blue-950');
    setTimeout(() => {
      spaceDom.classList.remove('bg-blue-950');
    }, 1000);
  }, 50);
};

export const RightContentPanel = () => {
  const searchSpaceName = useFilterSpace(state => state.searchSpaceName);

  useEffect(() => {
    useSelectedSearchedTabIndex.setState({
      index: -1,
    });
  }, [searchSpaceName]);

  const debounceUpdateSearchSpaceName = useRef(
    debounce((val: string) => {
      useFilterSpace.setState({
        searchSpaceName: val,
      });
    }, 100),
  );

  const allSpacesMap = useStore(state => state.allSpacesMap);
  const spaceList = Object.values(allSpacesMap);
  const sortedSpaceList = spaceList.sort((a, b) => {
    const getOpenCountSum = (space: SpaceInfo) => {
      return space.tabs.reduce((acc, tab) => {
        return acc + (tab.openCount || 0);
      }, 0);
    };
    return getOpenCountSum(b) - getOpenCountSum(a);
  });
  const searchedSpaceList = sortedSpaceList.filter(
    space =>
      (lowerMultiIncludes(searchSpaceName, space.name) ||
        space.tabs.some(tab => lowerMultiIncludes(searchSpaceName, tab.title, tab.url))) &&
      !isSpaceArchived(space.uuid),
  );
  const searchedTabs = searchedSpaceList
    .map(searchedSpaceList => searchedSpaceList.tabs.map(tab => ({ ...tab, space: searchedSpaceList })))
    .flat()
    .filter(tab => lowerMultiIncludes(searchSpaceName, tab.title, tab.url, tab.space.name));

  return (
    <div className={cls(styles.rightPanel, 'relative')}>
      <div className={`flex justify-between items-center mb-3 ${spaceContentMaxWidth}`}>
        <InputGroup className="w-[300px]" startElement={<Icon icon="octicon:search-16" width="14px" height="14px" className={'ml-2 text-app-text-muted'} />}>
          <Input
            borderColor={'var(--app-border)'}
            _hover={{ borderColor: 'var(--app-text-muted)' }}
            _focus={{ borderColor: 'var(--app-text)', boxShadow: 'none' }}
            size={'sm'}
            borderRadius="md"
            placeholder="Search spaces or tabs..."
            onChange={e => {
              debounceUpdateSearchSpaceName.current(e.target.value);
            }}
            autoFocus={true}
            className={`w-full bg-app-surface text-app-text transition-colors`}
            onKeyDown={e => {
              // key down selectedSearchedTabIndex++
              if (e.key === 'ArrowDown' || (['n', 'j'].includes(e.key) && e.ctrlKey)) {
                e.preventDefault();
                const i = Math.min(searchedTabs.length - 1, useSelectedSearchedTabIndex.getState().index + 1);
                useSelectedSearchedTabIndex.setState({
                  index: i,
                  tab: searchedTabs[i],
                });
              }
              // key up selectedSearchedTabIndex--
              if (e.key === 'ArrowUp' || (['p', 'k'].includes(e.key) && e.ctrlKey)) {
                e.preventDefault();
                const i = Math.max(0, useSelectedSearchedTabIndex.getState().index - 1);
                useSelectedSearchedTabIndex.setState({
                  index: i,
                  tab: searchedTabs[i],
                });
              }
              // key enter open selectedSearchedTabIndex tab
              if (e.key === 'Enter') {
                openTab({
                  tab: useSelectedSearchedTabIndex.getState().tab,
                  space: useSelectedSearchedTabIndex.getState().tab.space,
                  autoActiveOpenedTab: !e.metaKey,
                });
              }
              // key arrow right double click selected current group & tab
              if (e.key === 'ArrowRight' && e.metaKey) {
                scrollToSpace(useSelectedSearchedTabIndex.getState().tab.space.uuid);
              }
            }}
          />
        </InputGroup>
        <div>
          <CurrentGroups />
        </div>
      </div>

      {/*<GroupContent />*/}
      {searchSpaceName ? (
        <div>
          {searchedSpaceList.map((space, i) => {
            return <SpaceItem key={space.uuid} space={space} index={i} searchText={searchSpaceName} />;
          })}
        </div>
      ) : (
        <>
          <GroupContent />
          <div className={'pt-4 pb-8 flex gap-3'}>
            <IconButton
              aria-label="Add SubSpace"
              size={'sm'}
              variant="surface"
              onClick={() => {
                Actions.addSubSpace(useStore.getState().selectedGroupId);
              }}>
              <Icon icon="material-symbols:add" width={'18'} height={'18'} />
              Add Project
            </IconButton>

            {/*{<GroupSetting />}*/}

            <IconButton
              aria-label="Del Group"
              colorPalette="red"
              variant="ghost"
              size={'sm'}
              onClick={() => {
                const state = useStore.getState();
                if (state.groupsSort.length === 1) {
                  globalToast({
                    title: 'Must have at least one group.',
                    status: 'error',
                    isClosable: true,
                  });

                  return;
                }

                if (
                  state.groupsMap[state.selectedGroupId].subSpacesIds
                    .map(id => state.allSpacesMap[id].tabs.length)
                    .filter(len => len > 0).length === 0
                ) {
                  Actions.removeGroup(state.selectedGroupId);
                  return;
                }

                dialog.confirm({
                  title: 'Delete Project',
                  content: 'Are you sure to delete this project?',
                  onOk: () => {
                    Actions.removeGroup(state.selectedGroupId);
                  },
                });
              }}>
              <Icon icon="lets-icons:del-alt-fill" width={'16'} height={'16'} />
              DEL
            </IconButton>
          </div>
        </>
      )}
      {/*<div className={'fixed bottom-0 left-[154px]'}>*/}
      {/*  <CurrentGroups/>*/}
      {/*</div>*/}
    </div>
  );
};
