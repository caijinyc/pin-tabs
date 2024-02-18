import { StoreType } from '@pages/newtab/store';

export const DEFAULT_STORE_STATE: StoreType = {
  selectedIndex: 0,
  allSpacesMap: {},

  groups: [
    {
      name: 'DEV MODE',
      subSpacesIds: [],
    },
    {
      name: 'REPORT',
      subSpacesIds: [],
    },
    {
      name: 'PLANNING',
      subSpacesIds: [],
    },
  ],

  lastSyncTime: 0,
};
