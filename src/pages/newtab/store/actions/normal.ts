import { TabInfo, useStore } from '@pages/newtab/store/store';
import { produce } from 'immer';
import { ARCHIVE_GROUP_ID } from '@src/constant';
import { uuid } from '@src/shared/kits';

export const Actions = {
  openArchive: () => {
    useStore.setState(old => {
      return produce(old, draft => {
        draft.selectedGroupId = ARCHIVE_GROUP_ID;
      });
    });
  },
  addNewGroup: () => {
    useStore.setState(old => {
      return produce(old, draft => {
        const newGroupId = uuid();
        draft.groups.push({
          name: 'Untitled Group',
          id: newGroupId,
          subSpacesIds: [],
        });
        draft.selectedGroupId = draft.groups[draft.groups.length - 1].id;
      });
    });
  },
  deleteSpace: (spaceId: string) => {
    useStore.setState(old => {
      return produce(old, draft => {
        draft.groups.find(group => {
          if (group.subSpacesIds.includes(spaceId)) {
            group.subSpacesIds = group.subSpacesIds.filter(id => id !== spaceId);
            return true;
          }
        });
        delete draft.allSpacesMap[spaceId];
      });
    });
  },
  getCurrentSelectedGroup: () => {
    const state = useStore.getState();
    return state.groups.find(group => group.id === state.selectedGroupId);
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
          draft.selectedGroupId = draft.groupsSort[0];
        }
      });
    });
  },
  addSubSpace: (groupId: string) => {
    useStore.setState(old => {
      return produce(old, draft => {
        const id = uuid();
        draft.groupsMap[groupId].subSpacesIds.push(id);
        draft.allSpacesMap[id] = {
          name: 'Untitled Sub Space',
          tabs: [],
          uuid: id,
        };
      });
    });
  },
};
