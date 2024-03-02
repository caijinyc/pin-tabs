import { storeLocalStorage } from '@src/shared/storages/deviceSyncStorage';
import dayjs from 'dayjs';
import {
  backupToGist,
  loadDataFromOtherDevice,
  loadDataFromOtherDeviceFn,
  syncDataToGist,
  syncDataToGistFn,
} from '@pages/background/sync';
import { createAlarm } from '@pages/background/create-alarm';

export const BACKUP_DATA = 'backupData';

createAlarm();

// TODO fix dev mode
if (process.env.NODE_ENV === 'development') {
  console.log('dev mode, skip');
}

// TODO dev mode 不执行
loadDataFromOtherDeviceFn();

chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name === syncDataToGist) {
    console.log(`执行 ${syncDataToGist} 操作`, dayjs().format('YYYY-MM-DD HH:mm:ss'));
    syncDataToGistFn();
  }

  if (alarm.name === loadDataFromOtherDevice) {
    console.log(`执行 ${loadDataFromOtherDevice} 操作`, dayjs().format('YYYY-MM-DD HH:mm:ss'));
    loadDataFromOtherDeviceFn();
  }
});
