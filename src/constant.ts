import { StoreType } from '@pages/newtab/store/store';

export const DEFAULT_STORE_STATE: StoreType = {
  selectedIndex: 0,
  allSpacesMap: {},
  groups: [],
  groupsSort: [],
  selectedGroupId: '',
  groupsMap: {},
  version: 1,
};

export const NEED_SYNC_KEYS: (keyof StoreType)[] = ['allSpacesMap', 'groups', 'groupsMap', 'groupsSort'];
export const ARCHIVE_GROUP_ID = '__archive';
