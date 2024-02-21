import { commonLocalStorage, optionsStorage } from '@src/shared/storages/optionsStorage';
import { Octokit } from 'octokit';
import { storeLocalStorage, storeSyncStorage } from '@src/shared/storages/storeSyncStorage';
import { StoreType, useStore } from '@pages/newtab/store/store';
import dayjs from 'dayjs';

const BACKUP_DATA = 'backupData';
chrome.alarms
  .create(BACKUP_DATA, { periodInMinutes: 1 })
  .then(() => {
    console.log('create backupData alarm success');
  })
  .catch(e => {
    console.log('create alarm fail', e);
  });

// chrome.alarms
//   .create('saveStoreToSyncStorage', { periodInMinutes: 1 })
//   .then(() => {
//     console.log('create saveStoreToSyncStorage alarm success');
//   })
//   .catch(e => {
//     console.log('create saveStoreToSyncStorage alarm fail', e);
//   });

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

const syncToGist = async (data: StoreType) => {
  const { gistId, token } = await optionsStorage.get();

  if (!gistId || !token) return;

  const octokit = new Octokit({
    auth: token,
  });

  const deviceId = (await commonLocalStorage.get().then(data => data.deviceId)) || 'unknown';

  await octokit
    .request('PATCH /gists/{gist_id}', {
      gist_id: gistId,
      description: 'An updated gist description',
      files: {
        'backup_data.json': {
          content: JSON.stringify(
            {
              ...data,
              deviceId,
            },
            null,
            2,
          ),
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

  if (alarm.name === BACKUP_DATA) {
    console.log('执行备份操作', dayjs().format('YYYY-MM-DD HH:mm:ss'));
    const startBackup = async () => {
      const localStorageData = await storeLocalStorage.get();
      if (localStorageData.alreadySyncedToGist) {
        console.log('already synced to gist, skip');
        return;
      }

      storeLocalStorage.set({
        ...localStorageData,
        alreadySyncedToGist: true,
      });

      delete localStorageData.alreadySyncedToGist;

      return syncToGist({
        ...localStorageData,
        selectedIndex: 0,
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
    console.log('执行 saveStoreToSyncStorage 操作', dayjs().format('YYYY-MM-DD HH:mm:ss'));
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
