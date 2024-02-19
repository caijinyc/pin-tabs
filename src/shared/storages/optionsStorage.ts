import { createStorage, StorageType } from '@src/shared/storages/base';

type OptionsType = {
  gistId: string;
  token: string;
};

const storage = createStorage<OptionsType>(
  'options-storage-key',
  {
    gistId: '',
    token: '',
  },
  {
    storageType: StorageType.Sync,
    liveUpdate: true,
  },
);

export const optionsStorage = {
  ...storage,
};
