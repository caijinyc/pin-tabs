import { useStore } from '@pages/newtab/store/store';
import { produce } from 'immer';

export const moveTabToArchive = async (tabId: string) => {
  useStore.setState(old => {
    return produce(old, draft => {
      const tabInfo = draft.allSpacesMap[tabId];

      if (!draft.archiveSpaces) {
        draft.archiveSpaces = {
          spaceIds: [],
        };
      }

      draft.archiveSpaces = {
        ...draft.archiveSpaces,
        spaceIds: [...draft.archiveSpaces.spaceIds, tabId],
      };

      // remove tab from allSpacesMap
      const groupIndex = draft.groups.findIndex(group => group.subSpacesIds.includes(tabId));
      const tabIndex = draft.groups[groupIndex].subSpacesIds.findIndex(id => id === tabId);
      draft.groups[groupIndex].subSpacesIds.splice(tabIndex, 1);
    });
  });
};
