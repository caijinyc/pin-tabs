import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

type OptionsType = {
  gistId: string;
  token: string;
};

const storage = createStorage<OptionsType>(
  'theme-storage-key',
  {
    gistId: '',
    token: '',
  },
  {
    storageType: StorageType.Local,
    liveUpdate: true,
  },
);

export const optionsStorage = {
  ...storage,
};
