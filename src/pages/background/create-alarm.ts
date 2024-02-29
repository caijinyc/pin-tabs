import { loadDataFromOtherDevice, syncDataToGist } from './sync';
import { BACKUP_DATA } from './alarm';

export const createAlarm = () => {
  chrome.alarms
    .create(BACKUP_DATA, { periodInMinutes: 5 })
    .then(() => {
      console.log('create backupData alarm success');
    })
    .catch(e => {
      console.log('create alarm fail', e);
    });

  setTimeout(() => {
    chrome.alarms
      .create(syncDataToGist, { periodInMinutes: 1 })
      .then(() => {
        console.log(`create ${syncDataToGist} alarm success`);
      })
      .catch(e => {
        console.log(`create ${syncDataToGist} alarm fail`, e);
      });
  }, 10000);

  chrome.alarms
    .create(loadDataFromOtherDevice, { periodInMinutes: 0.5 })
    .then(() => {
      console.log('create saveStoreToSyncStorage alarm success');
    })
    .catch(e => {
      console.log('create saveStoreToSyncStorage alarm fail', e);
    });
};
