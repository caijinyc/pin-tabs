import { useStore } from '@pages/newtab/store/store';
import { produce } from 'immer';

export const moveSpaceToOtherGroup = (spaceId: string, groupId: string) => {
  useStore.setState(old => {
    return produce(old, draft => {
      const oldGroupIndex = draft.groups.findIndex(group => group.subSpacesIds.includes(spaceId));
      draft.groups[oldGroupIndex].subSpacesIds = draft.groups[oldGroupIndex].subSpacesIds.filter(id => id !== spaceId);
      draft.groups.forEach(group => {
        if (group.id === groupId) {
          group.subSpacesIds.push(spaceId);
        }
      })
    });
  });
};
