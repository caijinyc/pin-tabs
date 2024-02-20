import { createStorage, StorageType } from '@src/shared/storages/base';

type Values = Record<string, string>;

const storage = createStorage<Values>(
  'cache-favicon-storage-key',
  {},
  {
    storageType: StorageType.Local,
    liveUpdate: true,
  },
);

export const cacheFaviconImgStorage = {
  ...storage,
};
