import { createStorage, StorageType } from '@src/shared/storages/base';

type Values = {
  alreadyAutoOpenSettingModalGroupIdMap: Record<string, boolean>;
};

const storage = createStorage<Values>(
  'common-storage-key',
  {
    alreadyAutoOpenSettingModalGroupIdMap: {},
  },
  {
    storageType: StorageType.Local,
    liveUpdate: true,
  },
);

export const commonLocalStorage = {
  ...storage,
  set: async (value: Partial<Values> | ((old: Values) => Partial<Values>)) => {
    if (typeof value === 'function') {
      const oldValue = storage.getSnapshot();
      return storage.set({
        ...oldValue,
        ...value(oldValue),
      });
    } else {
      return localStorage.set({
        ...localStorage.getSnapshot(),
        ...value,
      });
    }
  },
};
