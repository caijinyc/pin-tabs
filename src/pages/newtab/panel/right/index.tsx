import { IconButton, Input, InputGroup, InputLeftElement, useToast } from '@chakra-ui/react';
import { isSpaceArchived, SpaceInfo, TabInfo, useStore } from '@pages/newtab/store/store';
import styles from '@pages/newtab/style.module.scss';
import { GroupContent } from '@pages/newtab/panel/right/comps/group-content';
import React, { useEffect } from 'react';
import { Actions } from '@pages/newtab/store/actions';
import { dialog } from '@pages/newtab/comps/global-dialog';
import { Icon } from '@iconify-icon/react';
import { useForm } from 'react-hook-form';
import { SpaceItem } from '@pages/newtab/panel/right/comps/group-content/space-item';
import { create } from 'zustand';
import { openTab } from '@pages/newtab/util/open-tab';
import { lowerMultiIncludes } from '@pages/newtab/util/common';

export const useSelectedSearchedTabIndex = create<{
  index: number;
  tab?: TabInfo & { space: SpaceInfo };
}>(() => ({
  index: -1,
}));

export const useFilterSpace = create<{
  searchSpaceName: string;
  resetForm?: () => void;
}>((set, get) => ({
  searchSpaceName: '',
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
  const toast = useToast();
  const { register, handleSubmit, watch, setValue } = useForm<{
    searchSpaceName: string;
  }>({
    defaultValues: {
      searchSpaceName: undefined,
    },
  });
  const searchSpaceName = watch('searchSpaceName');
  useEffect(() => {
    useSelectedSearchedTabIndex.setState({
      index: -1,
    });
    useFilterSpace.setState({
      searchSpaceName,
      resetForm: () => {
        setValue('searchSpaceName', '');
      },
    });
  }, [searchSpaceName]);
  // TODO 优化性能
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
    <div className={styles.rightPanel}>
      <InputGroup size={'xs'}>
        <InputLeftElement pointerEvents="none">
          <Icon icon="octicon:search-16" width="12px" height="12px" className={'ml-1 text-gray-400'} />
        </InputLeftElement>
        <Input
          borderColor={'gray.600'}
          focusBorderColor={'gray.600'}
          size={'xs'}
          autoFocus={true}
          className={'mb-2 max-w-[618px]'}
          {...register('searchSpaceName')}
          onKeyDown={e => {
            // key down selectedSearchedTabIndex++
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              const i = Math.min(searchedTabs.length - 1, useSelectedSearchedTabIndex.getState().index + 1);
              useSelectedSearchedTabIndex.setState({
                index: i,
                tab: searchedTabs[i],
              });
            }
            // key up selectedSearchedTabIndex--
            if (e.key === 'ArrowUp') {
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
          <div className={'pb-4'}>
            <IconButton
              aria-label="Add SubSpace"
              icon={<Icon icon="material-symbols:add" width={'16'} height={'16'} />}
              size={'xs'}
              onClick={() => {
                Actions.addSubSpace(useStore.getState().selectedGroupId);
              }}></IconButton>

            {/*{<GroupSetting />}*/}

            <IconButton
              aria-label="Del Group"
              icon={<Icon icon="lets-icons:del-alt-fill" width={'16'} height={'16'} />}
              // colorScheme="red"
              size={'xs'}
              ml={2}
              onClick={() => {
                const state = useStore.getState();
                if (state.groupsSort.length === 1) {
                  toast({
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
                  title: 'Delete Group',
                  content: 'Are you sure to delete this group?',
                  onOk: () => {
                    Actions.removeGroup(state.selectedGroupId);
                  },
                });
              }}>
              DEL
            </IconButton>
          </div>
        </>
      )}
    </div>
  );
};
