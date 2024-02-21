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

const syncStorage = createStorage<StoreType>('store-storage', DEFAULT_STORE_STATE, {
  storageType: StorageType.Sync,
  liveUpdate: true,
});

export const storeSyncStorage: SToreStorage = {
  ...syncStorage,
};

export const storeLocalStorage: SToreStorage = {
  ...localStorage,
};
