import { StoreType } from '@pages/newtab/store/store';

export const DEFAULT_STORE_STATE: StoreType = {
  allSpacesMap: {},
  groupsSort: [],
  selectedGroupId: '',
  groupsMap: {},
  version: 1,
};

export const NEED_SYNC_KEYS: (keyof StoreType)[] = ['allSpacesMap', 'groupsMap', 'groupsSort'];
export const ARCHIVE_GROUP_ID = '__archive';

export const SPACE_TO_GROUP_DRAG_TYPE = 'move_space_to_other_group';
export const SPACE_SORT_DRAG_TYPE = 'sort_space';
export const GroupSortItemTypes = {
  CARD: 'card',
};
