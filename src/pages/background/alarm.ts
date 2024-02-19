import { optionsStorage } from '@src/shared/storages/optionsStorage';
import { Octokit } from 'octokit';
import { storeLocalStorage, storeSyncStorage } from '@src/shared/storages/storeSyncStorage';
import { StoreType, useStore } from '@pages/newtab/store';

chrome.alarms
  .create('backupData', { periodInMinutes: 10 })
  .then(() => {
    console.log('create backupData alarm success');
  })
  .catch(e => {
    console.log('create alarm fail', e);
  });

chrome.alarms
  .create('saveStoreToSyncStorage', { periodInMinutes: 1 })
  .then(() => {
    console.log('create saveStoreToSyncStorage alarm success');
  })
  .catch(e => {
    console.log('create saveStoreToSyncStorage alarm fail', e);
  });

setTimeout(() => {
  chrome.alarms.getAll().then(alarms => {
    console.log('getAll', alarms);
  });
}, 1000);

const syncToGist = async (data: StoreType) => {
  const { gistId, token } = await optionsStorage.get();

  if (!gistId || !token) return;

  const octokit = new Octokit({
    auth: token,
  });

  await octokit
    .request('PATCH /gists/{gist_id}', {
      gist_id: gistId,
      description: 'An updated gist description',
      files: {
        'backup_data.json': {
          content: JSON.stringify(data, null, 2),
        },
      },
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
    .then(() => {
      console.log('sync success');
    })
    .catch(err => {
      console.error('sync fail', err);
    });
};

chrome.alarms.onAlarm.addListener(function (alarm) {
  console.log('onAlarm', alarm, alarm.name, alarm.scheduledTime, alarm.periodInMinutes);

  if (alarm.name === 'backupData') {
    console.log('执行备份操作');
    const startBackup = async () => {
      const localStorageData = await storeLocalStorage.get();
      if (localStorageData.alreadySyncedToGist) return;

      storeLocalStorage.set({
        ...localStorageData,
        alreadySyncedToGist: true,
      });

      delete localStorageData.alreadySyncedToGist;

      return syncToGist({
        ...localStorageData,
        lastSyncTime: Date.now(),
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

  if (alarm.name === 'saveStoreToSyncStorage') {
    console.log('执行 saveStoreToSyncStorage 操作');
    const startSync = async () => {
      const localStorageData = await storeLocalStorage.get();
      return storeSyncStorage.set({
        ...localStorageData,
        lastSyncTime: Date.now(),
      });
    };

    startSync()
      .then(() => {
        console.log('alarm period sync success');
      })
      .catch(e => {
        console.log('alarm period sync fail', e);
      });
  }
});
