import { BaseStorage, createStorage, StorageType } from '@src/shared/storages/base';

type OptionsType = {
  gistId: string;
  token: string;
  syncGistId: string;
  backupGistId: string;
  githubUsername: string;
  faviconSyncList: string;
};

const storage = createStorage<OptionsType>(
  'options-storage-key',
  {
    gistId: '',
    token: '',
    syncGistId: '',
    backupGistId: '',
    githubUsername: '',
    faviconSyncList: '',
  },
  {
    storageType: StorageType.Sync,
    liveUpdate: true,
  },
);

export const optionsStorage = {
  ...storage,
  set: (value: Partial<OptionsType>) => {
    return storage.set({
      ...storage.getSnapshot(),
      ...value,
    });
  },
};

export type CommonLocalType = {
  deviceId: string;
};

export const commonLocalStorage = createStorage<CommonLocalType>(
  'commonLocalStorage-key',
  {
    deviceId: '',
  },
  {
    storageType: StorageType.Local,
    liveUpdate: true,
  },
);

export const initDeviceId = () => {
  commonLocalStorage.get().then(data => {
    if (!data.deviceId) {
      chrome.system.cpu.getInfo(info => {
        commonLocalStorage.set({ deviceId: info.modelName + '-' + Date.now().toString() });
      });
    }
  });
};
