import { useStore } from '@pages/newtab/store/store';

export const StoreHooks = {
  useCurrentGroup: () => {
    return useStore(state => state.groupsMap[state.selectedGroupId]);
  },
};
