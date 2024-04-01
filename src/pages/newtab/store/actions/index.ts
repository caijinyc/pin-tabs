import { TabInfo, useStore } from '@pages/newtab/store/store';
import { produce } from 'immer';
import { ARCHIVE_GROUP_ID } from '@src/constant';
import { uuid } from '@src/shared/kits';
import { globalToast } from '@pages/newtab/Newtab';

export const Actions = {
  selectGroup: (groupId: string) => {
    useStore.setState(() => {
      return {
        selectedGroupId: groupId,
      };
    });
  },
  openArchive: () => {
    useStore.setState(old => {
      return produce(old, draft => {
        draft.selectedGroupId = ARCHIVE_GROUP_ID;
      });
    });
  },
  addNewGroup: () => {
    const newGroupId = uuid();
    useStore.setState(old => {
      return produce(old, draft => {
        // const newSpaceId = Actions.addSubSpace(newGroupId);
        draft.groupsMap[newGroupId] = {
          name: 'Untitled Space',
          id: newGroupId,
          subSpacesIds: [],
        };
        draft.groupsSort.push(newGroupId);
        draft.selectedGroupId = newGroupId;
      });
    });

    // auto add a space
    Actions.addSubSpace(newGroupId);
  },
  deleteSpace: (spaceId: string) => {
    useStore.setState(old => {
      return produce(old, draft => {
        Object.values(draft.groupsMap).forEach(group => {
          if (group.subSpacesIds.includes(spaceId)) {
            group.subSpacesIds = group.subSpacesIds.filter(id => id !== spaceId);
          }
        });
        delete draft.allSpacesMap[spaceId];
      });
    });
  },
  addTabToSpace: (spaceId: string, tab: TabInfo) => {
    const state = useStore.getState();

    if (state.allSpacesMap[spaceId].tabs.find(item => item.id === tab.id)) {
      Actions.removeTabFromSpace(spaceId, tab);
      return;
    }

    useStore.setState(old => {
      return produce(old, draft => {
        draft.allSpacesMap[spaceId].tabs.push(tab);
      });
    });
  },
  addGroupAllTabsToSpace: (tabs: TabInfo[], spaceId: string) => {
    const state = useStore.getState();
    const thisSpaceAllTabs = state.allSpacesMap[spaceId].tabs;

    const filteredTabs = tabs.filter(
      tab => !thisSpaceAllTabs.find(item => item.id === tab.id || item.url === tab.url || item.title === tab.title),
    );

    useStore.setState(old => {
      return produce(old, draft => {
        draft.allSpacesMap[spaceId].tabs.push(...filteredTabs);
      });
    });
  },
  removeTabFromSpace: (id: string, tab: TabInfo) => {
    useStore.setState(old => {
      return produce(old, draft => {
        const oldTabs = draft.allSpacesMap[id].tabs;
        draft.allSpacesMap[id].tabs = oldTabs.filter(t => t.id !== tab.id);
      });
    });
  },
  removeGroup: (groupId: string) => {
    useStore.setState(old => {
      return produce(old, draft => {
        // remove space
        const group = draft.groupsMap[groupId];
        group.subSpacesIds.forEach(spaceId => {
          delete draft.allSpacesMap[spaceId];
        });
        delete draft.groupsMap[groupId];
        draft.groupsSort = draft.groupsSort.filter(id => id !== groupId);

        if (draft.selectedGroupId === groupId) {
          draft.selectedGroupId = draft.groupsSort[draft.groupsSort.length - 1];
        }
      });
    });
  },
  addSubSpace: (groupId: string) => {
    const id = uuid();
    useStore.setState(old => {
      return produce(old, draft => {
        draft.groupsMap[groupId].subSpacesIds.push(id);
        draft.allSpacesMap[id] = {
          name: 'Untitled Project',
          tabs: [],
          uuid: id,
        };
      });
    });
    return id;
  },
  moveSpaceToOtherGroup: (spaceId: string, newGroupId: string) => {
    useStore.setState(old => {
      return produce(old, draft => {
        const oldGroup = Object.values(draft.groupsMap).find(group => group.subSpacesIds.includes(spaceId));
        oldGroup.subSpacesIds = oldGroup.subSpacesIds.filter(id => id !== spaceId);
        draft.groupsMap[newGroupId].subSpacesIds.push(spaceId);
      });
    });
  },
  changeGroupName: (groupId: string, name: string) => {
    if (!name) {
      globalToast({
        title: 'Error',
        description: 'Name cannot be empty.',
        status: 'error',
        duration: 1000,
      });
      return;
    }
    useStore.setState(old => {
      return produce(old, draft => {
        draft.groupsMap[groupId].name = name;
      });
    });
  },
};
