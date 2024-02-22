import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';
import { StoreType } from '@pages/newtab/store/store';
import { DEFAULT_STORE_STATE } from '@src/constant';

type SToreStorage = BaseStorage<StoreType> & {
  // toggle: () => Promise<void>;
};

const localStorage = createStorage<StoreType>('store-storage', DEFAULT_STORE_STATE, {
  storageType: StorageType.Local,
  liveUpdate: true,
});

type StoreSyncStorage = {
  lastSyncVersion: number;
  lastSyncDeviceId: string;
};
const syncStorage = createStorage<StoreSyncStorage>(
  'sync-store-storage',
  {
    lastSyncVersion: 0,
    lastSyncDeviceId: '',
  },
  {
    storageType: StorageType.Sync,
    liveUpdate: true,
  },
);

export const deviceSyncStorage = {
  ...syncStorage,
  set: async (value: Partial<StoreSyncStorage>) => {
    return syncStorage.set({
      ...syncStorage.getSnapshot(),
      ...value,
    });
  },
};

export const storeLocalStorage = {
  ...localStorage,
  set: async (value: Partial<StoreType>) => {
    return localStorage.set({
      ...localStorage.getSnapshot(),
      ...value,
    });
  },
};
