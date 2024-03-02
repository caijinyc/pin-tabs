import { StoreType } from '@pages/newtab/store/store';

export const DEFAULT_STORE_STATE: StoreType = {
  selectedIndex: 0,
  allSpacesMap: {},
  groups: [],
  version: 1,
};

export const NEED_SYNC_KEYS: (keyof StoreType)[] = ['allSpacesMap', 'groups', "archiveSpaces"];
export const SELECTED_INDEX_IS_ARCHIVE = -99999999;
