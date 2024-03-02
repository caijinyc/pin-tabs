import { loadDataFromOtherDevice, syncDataToGist } from './sync';

export const createAlarm = () => {
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
