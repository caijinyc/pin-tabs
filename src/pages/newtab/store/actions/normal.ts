import { useStore } from '@pages/newtab/store/store';
import { produce } from 'immer';
import { SELECTED_INDEX_IS_ARCHIVE } from '@src/constant';
import { uuid } from '@src/shared/kits';

export const Actions = {
  openArchive: () => {
    useStore.setState(old => {
      return produce(old, draft => {
        draft.selectedIndex = SELECTED_INDEX_IS_ARCHIVE;
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
  }
};
