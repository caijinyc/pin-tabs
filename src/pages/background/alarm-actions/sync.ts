import { deviceSyncStorage, storeLocalStorage } from '@src/shared/storages/deviceSyncStorage';
import { commonLocalStorage, optionsStorage } from '@src/shared/storages/optionsStorage';
import { getGistData } from '@pages/background/api';
import { StoreType } from '@pages/newtab/store/store';
import dayjs from 'dayjs';
import { Octokit } from 'octokit';
import { createAlarm } from '@pages/background/create-alarm';

/**
 * 同步实现逻辑：
 *
 * 同步到远端：
 * 1. useStore.subscribe 判断数据更新
 * 2. 如果数据更新，判断是否需要同步
 * 3. 如果需要同步，设置 alreadyBackupToGist 为 false
 * 4. alarm 定时任务检查 alreadyBackupToGist，如果为 false，version + 1，然后同步到 gist
 *    4.1 version 更新点：useStore, localStorage, cloudStore
 *    4.2 其他设备根据 cloudStore 的 version 来判断是否需要同步
 *
 * 从远端下载：
 * 1. alarm 定时任务检查 cloudStore 的 version
 * 2. 如果 cloudStore 的 version 大于 localStorage 的 version，下载 gist 数据
 * 3. 将下载的数据同步到 localStorage
 * 4. 用户使用时，会先从 localStorage 加载数据到 store 中
 * 5. localStorage 数据更新后，version 和远端对齐
 */

export const syncDataToGist = 'syncDataToGist';
export const loadDataFromOtherDevice = 'loadDataFromOtherDeviceFn';

const BACKUP_FILE_NAME = 'backup_data.json';
const SYNC_FILE_NAME = 'sync_data.json';

export const uploadToGist = async ({ data, gistId, filename }: { data: any; gistId: string; filename: string }) => {
  const { token } = await optionsStorage.get();

  if (!token) return;

  const octokit = new Octokit({
    auth: token,
  });

  await octokit.request('PATCH /gists/{gist_id}', {
    gist_id: gistId,
    description: 'An updated gist description',
    files: {
      [filename]: {
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

export const backupToGist = async (data: StoreType) => {
  const syncTag = commonLocalStorage.getSnapshot().deviceId + '-' + dayjs().format('YYYY-MM-DD HH:mm:ss');

  const { gistId } = await optionsStorage.get();

  await uploadToGist({
    data: {
      ...data,
      syncTag,
    },
    filename: BACKUP_FILE_NAME,
    gistId: gistId,
  })
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
    console.log('syncGistId is empty, skip⏭️⏭️⏭️');
    return;
  }

  return await uploadToGist({
    data: {
      ...data,
      syncTag,
    },
    filename: SYNC_FILE_NAME,
    gistId: syncGistId,
  });
};
export const uploadDataToGistFn = async () => {
  console.log('%c############## 🔺🔺🔺 start syncDataToGistFn ########', 'color: blue');
  const logEnd = () => console.log('%c############## 🔺🔺🔺 end syncDataToGistFn ########', 'color: blue');
  const localStorageData = await storeLocalStorage.get();

  console.log('🔺localStorageData.alreadyBackupToGist', localStorageData.alreadyBackupToGist);
  console.log('🔺localStorageData.version', localStorageData.version);

  if (localStorageData.alreadyBackupToGist) {
    console.log('🔺already synced to gist, skip⏭️⏭️⏭️');
    logEnd();
    return;
  }

  const localStoreVersion = localStorageData.version || 0;
  const lastSyncVersion = (await deviceSyncStorage.get().then(data => data.lastSyncVersion)) || 0;

  const newVersion = (localStoreVersion > lastSyncVersion ? localStoreVersion : lastSyncVersion) + 1;

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
    console.log('🔺sync TO gist fail # catch ->', e);
  }

  logEnd();
};

export const loadDataFromOtherDeviceFn = async () => {
  console.log('%c############## 🔽🔽🔽 start loadDataFromOtherDeviceFn ########', 'color: red');
  const logEnd = () => console.log('%c############## 🔽🔽🔽 end loadDataFromOtherDeviceFn ########', 'color: red');

  const localData = await storeLocalStorage.get();
  const lastSyncVersion = await deviceSyncStorage.get().then(data => data.lastSyncVersion);

  const { syncGistId, token } = await optionsStorage.get();
  if (!syncGistId || !token) {
    console.log('🔽syncGistId is empty, skip⏭️⏭️⏭️');
    logEnd();
    return;
  }

  console.log('🔽syncData.lastSyncVersion', lastSyncVersion);
  console.log('🔽localData.version', localData.version);

  // 如果本地数据的版本号大于云端数据的版本号，那么以本地数据为准
  if ((localData.version || 0) >= (lastSyncVersion || 0)) {
    console.log('🔽localData is newer than gistData, skip⏭️⏭️⏭️');
    logEnd();

    return;
  }

  try {
    const gistData = await getGistData({ filename: SYNC_FILE_NAME, gistId: syncGistId });
    const newVersion = lastSyncVersion > (gistData.version || -1) ? lastSyncVersion : gistData.version;
    await storeLocalStorage.set({
      ...gistData,
      version: newVersion,
      alreadyBackupToGist: true,
    });
    console.log('🔽🔽🔽 SYNC FROM GIST SUCCESS ✅✅✅');
  } catch (e) {
    console.log('🔽sync FROM gist fail # catch ->', e);
  }

  logEnd();
};
