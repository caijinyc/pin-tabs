import { commonLocalStorage, optionsStorage } from '@src/shared/storages/optionsStorage';
import { Octokit } from 'octokit';
import { storeLocalStorage, deviceSyncStorage } from '@src/shared/storages/deviceSyncStorage';
import { StoreType } from '@pages/newtab/store/store';
import dayjs from 'dayjs';
import { getGistData } from '@pages/newtab/api';

const BACKUP_DATA = 'backupData';
chrome.alarms
  .create(BACKUP_DATA, { periodInMinutes: 5 })
  .then(() => {
    console.log('create backupData alarm success');
  })
  .catch(e => {
    console.log('create alarm fail', e);
  });

const syncDataToGist = 'syncDataToGist';
chrome.alarms
  .create(syncDataToGist, { periodInMinutes: 1 })
  .then(() => {
    console.log(`create ${syncDataToGist} alarm success`);
  })
  .catch(e => {
    console.log(`create ${syncDataToGist} alarm fail`, e);
  });

const syncDataFromOtherDevice = 'syncDataFromOtherDevice';
chrome.alarms
  .create(syncDataFromOtherDevice, { periodInMinutes: 0.5 })
  .then(() => {
    console.log('create saveStoreToSyncStorage alarm success');
  })
  .catch(e => {
    console.log('create saveStoreToSyncStorage alarm fail', e);
  });

chrome.alarms.getAll().then(alarms => {
  if (alarms.find(alarm => alarm.name === 'saveStoreToSyncStorage')) {
    chrome.alarms.clear('saveStoreToSyncStorage').then(() => {
      console.log('clear saveStoreToSyncStorage alarm success');
    });
  }
});

setTimeout(() => {
  chrome.alarms.getAll().then(alarms => {
    console.log('getAll', alarms);
  });
}, 1000);

const backupToGist = async (data: StoreType) => {
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

const syncToGist = async (data: StoreType) => {
  const syncTag = commonLocalStorage.getSnapshot().deviceId + '-' + dayjs().format('YYYY-MM-DD HH:mm:ss');
  const { syncGistId } = await optionsStorage.get();
  if (!syncGistId) {
    console.log('syncGistId is empty, skip');
    return;
  }

  await uploadToGist(
    {
      ...data,
      syncTag,
    },
    syncGistId,
  )
    .then(() => {
      console.log('sync to gist success');
    })
    .catch(err => {
      console.error('sync to gist fail', err);
      throw err;
    });
};

const uploadToGist = async (data: any, gistId: string) => {
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

const syncDataToGistFn = async () => {
  console.log('############## 🔼 start syncDataToGistFn ########');
  const localStorageData = await storeLocalStorage.get();

  console.log('localStorageData.alreadyBackupToGist', localStorageData.alreadyBackupToGist);
  console.log('localStorageData.version', localStorageData.version);

  if (localStorageData.alreadyBackupToGist) {
    console.log('already synced to gist, skip');
    console.log('############## 🔼 end syncDataToGistFn ########');
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
  } catch (e) {
    console.log('sync TO gist fail # catch ->', e);
  }

  console.log('############## 🔼 end syncDataToGistFn ########');
};

const syncDataFromOtherDeviceFn = async () => {
  console.log('############## 🔽 start syncDataFromOtherDeviceFn ########');
  const localData = await storeLocalStorage.get();
  const lastSyncVersion = await deviceSyncStorage.get().then(data => data.lastSyncVersion);

  console.log('lastSyncVersion', lastSyncVersion);
  console.log('localData.version', localData.version);

  // 如果本地数据的版本号大于云端数据的版本号，那么以本地数据为准
  if ((localData.version || 0) >= (lastSyncVersion || 0)) {
    console.log('localData is newer than gistData, skip');
    console.log('############## 🔽 end syncDataFromOtherDeviceFn ########');

    return;
  }

  try {
    const gistData = await getGistData();
    await storeLocalStorage.set({
      ...gistData,
    });
    console.log('sync FROM gist success');
  } catch (e) {
    console.log('sync FROM gist fail # catch ->', e);
  }

  console.log('############## 🔽 end syncDataFromOtherDeviceFn ########');
};

chrome.alarms.onAlarm.addListener(function (alarm) {
  console.log('onAlarm', alarm, alarm.name, alarm.scheduledTime, alarm.periodInMinutes);

  if (alarm.name === BACKUP_DATA) {
    console.log('执行备份操作', dayjs().format('YYYY-MM-DD HH:mm:ss'));
    const startBackup = async () => {
      const localStorageData = await storeLocalStorage.get();
      if (localStorageData.alreadyBackupToGist) {
        console.log('already synced to gist, skip');
        return;
      }

      storeLocalStorage.set({
        ...localStorageData,
        alreadyBackupToGist: true,
      });

      delete localStorageData.alreadyBackupToGist;

      return backupToGist({
        ...localStorageData,
        selectedIndex: 0,
      });
    };

    startBackup()
      .then(() => {
        console.log('backup success');
      })
      .catch(e => {
        console.log('backup fail', e);
      });
  }

  if (alarm.name === syncDataToGist) {
    console.log(`执行 ${syncDataToGist} 操作`, dayjs().format('YYYY-MM-DD HH:mm:ss'));
    syncDataToGistFn();
  }

  if (alarm.name === syncDataFromOtherDevice) {
    console.log(`执行 ${syncDataFromOtherDevice} 操作`, dayjs().format('YYYY-MM-DD HH:mm:ss'));
    syncDataFromOtherDeviceFn();
  }
});
