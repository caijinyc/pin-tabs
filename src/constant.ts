import { StoreType } from '@pages/newtab/store/store';

export const DEFAULT_STORE_STATE: StoreType = {
  selectedIndex: 0,
  allSpacesMap: {},

  groups: [],

  lastSyncTime: 0,
  version: 1,
};
