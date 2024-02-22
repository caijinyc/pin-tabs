import { deviceSyncStorage, storeLocalStorage } from '@src/shared/storages/deviceSyncStorage';
import { commonLocalStorage, optionsStorage } from '@src/shared/storages/optionsStorage';
import { getGistData } from '@pages/newtab/api';
import { StoreType } from '@pages/newtab/store/store';
import dayjs from 'dayjs';
import { Octokit } from 'octokit';

export const syncDataToGist = 'syncDataToGist';
export const syncDataFromOtherDevice = 'syncDataFromOtherDevice';
export const backupToGist = async (data: StoreType) => {
  const syncTag = commonLocalStorage.getSnapshot().deviceId + '-' + dayjs().format('YYYY-MM-DD HH:mm:ss');

  const { gistId } = await optionsStorage.get();

  await uploadToGist(
    {
      ...data,
      syncTag,
    },
    gistId,
  )
    .then(() => {
      console.log('backup success');
    })
    .catch(err => {
      console.error('backup fail', err);
    });
};
export const syncToGist = async (data: StoreType) => {
  const syncTag = commonLocalStorage.getSnapshot().deviceId + '-' + dayjs().format('YYYY-MM-DD HH:mm:ss');
  const { syncGistId } = await optionsStorage.get();
  if (!syncGistId) {
    console.log('syncGistId is empty, skip');
    return;
  }

  return await uploadToGist(
    {
      ...data,
      syncTag,
    },
    syncGistId,
  );
};
export const uploadToGist = async (data: any, gistId: string) => {
  const { token } = await optionsStorage.get();

  if (!token) return;

  const octokit = new Octokit({
    auth: token,
  });

  await octokit.request('PATCH /gists/{gist_id}', {
    gist_id: gistId,
    description: 'An updated gist description',
    files: {
      'backup_data.json': {
        content: JSON.stringify(
          {
            ...data,
          },
          null,
          2,
        ),
      },
    },
    headers: {
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
};
export const syncDataToGistFn = async () => {
  console.log('############## 🔺🔺🔺 start syncDataToGistFn ########');
  const logEnd = () => console.log('############## 🔺🔺🔺 end syncDataToGistFn ########');
  const localStorageData = await storeLocalStorage.get();

  console.log('localStorageData.alreadyBackupToGist', localStorageData.alreadyBackupToGist);
  console.log('localStorageData.version', localStorageData.version);

  if (localStorageData.alreadyBackupToGist) {
    console.log('already synced to gist, skip');
    logEnd();
    return;
  }

  const newVersion = (localStorageData.version || 0) + 1;

  console.log('newVersion', newVersion);

  try {
    await syncToGist({
      ...localStorageData,
      version: newVersion,
    });
    await storeLocalStorage.set({
      version: newVersion,
      alreadyBackupToGist: true,
    });
    await deviceSyncStorage.set({
      lastSyncVersion: newVersion,
    });
    console.log('🔺🔺🔺 SYNC TO GIST SUCCESS ✅✅✅');
  } catch (e) {
    console.log('sync TO gist fail # catch ->', e);
  }

  logEnd();
};
export const syncDataFromOtherDeviceFn = async () => {
  console.log('############## 🔽🔽🔽 start syncDataFromOtherDeviceFn ########');
  const logEnd = () => console.log('############## 🔽🔽🔽 end syncDataFromOtherDeviceFn ########');

  const localData = await storeLocalStorage.get();
  const lastSyncVersion = await deviceSyncStorage.get().then(data => data.lastSyncVersion);

  const { syncGistId, token } = await optionsStorage.get();
  if (!syncGistId || !token) {
    console.log('syncGistId is empty, skip');
    logEnd();
    return;
  }

  console.log('lastSyncVersion', lastSyncVersion);
  console.log('localData.version', localData.version);

  // 如果本地数据的版本号大于云端数据的版本号，那么以本地数据为准
  if ((localData.version || 0) >= (lastSyncVersion || 0)) {
    console.log('localData is newer than gistData, skip');
    logEnd();

    return;
  }

  try {
    const gistData = await getGistData();
    await storeLocalStorage.set({
      ...gistData,
    });
    console.log('🔽🔽🔽 SYNC FROM GIST SUCCESS ✅✅✅');
  } catch (e) {
    console.log('sync FROM gist fail # catch ->', e);
  }

  logEnd();
};
