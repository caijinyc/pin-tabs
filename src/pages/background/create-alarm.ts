import { loadBase64ImageCache, syncBase64ImageCache } from './alarm-actions/sync-ico-base64-image';
import { loadDataFromOtherDevice, syncDataToGist } from './sync';

const getMinutes = (minutes: number) => minutes * 60 * 1000;
const getSeconds = (seconds: number) => seconds * 1000;

export const createAlarm = () => {
  setTimeout(() => {
    chrome.alarms
      .create(syncDataToGist, { periodInMinutes: 0.25 })
      .then(() => {
        console.log(`create ${syncDataToGist} alarm success`);
      })
      .catch(e => {
        console.log(`create ${syncDataToGist} alarm fail`, e);
      });
  }, getSeconds(10));

  setTimeout(() => {
    chrome.alarms
      .create(syncBase64ImageCache, { periodInMinutes: 5 })
      .then(() => {
        console.log(`create ${syncBase64ImageCache} alarm success`);
      })
      .catch(e => {
        console.log(`create ${syncBase64ImageCache} alarm fail`, e);
      });
  }, getMinutes(2));

  chrome.alarms
    .create(loadBase64ImageCache, { periodInMinutes: 5 })
    .then(() => {
      console.log(`create ${loadBase64ImageCache} alarm success`);
    })
    .catch(e => {
      console.log(`create ${loadBase64ImageCache} alarm fail`, e);
    });

  chrome.alarms
    .create(loadDataFromOtherDevice, { periodInMinutes: 0.25 })
    .then(() => {
      console.log('create saveStoreToSyncStorage alarm success');
    })
    .catch(e => {
      console.log('create saveStoreToSyncStorage alarm fail', e);
    });
};
