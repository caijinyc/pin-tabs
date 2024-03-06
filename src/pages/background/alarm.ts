import dayjs from 'dayjs';

import {
  loadDataFromOtherDevice,
  loadDataFromOtherDeviceFn,
  syncDataToGist,
  uploadDataToGistFn,
} from '@pages/background/sync';

import { createAlarm } from '@pages/background/create-alarm';

import {
  loadBase64ImageCache,
  loadBase64ImageCacheFn,
  syncBase64ImageCache,
  uploadBase64ImageCacheFn,
} from '@pages/background/alarm-actions/sync-ico-base64-image';

export const BACKUP_DATA = 'backupData';

createAlarm();

// TODO fix dev mode
if (process.env.NODE_ENV === 'development') {
  console.log('dev mode, skip');
}

// TODO dev mode 不执行
loadDataFromOtherDeviceFn();
// syncBase64ImageCacheFn();
loadBase64ImageCacheFn();

chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name === syncDataToGist) {
    console.log(`执行 ${syncDataToGist} 操作`, dayjs().format('YYYY-MM-DD HH:mm:ss'));
    uploadDataToGistFn();
  }

  if (alarm.name === loadDataFromOtherDevice) {
    console.log(`执行 ${loadDataFromOtherDevice} 操作`, dayjs().format('YYYY-MM-DD HH:mm:ss'));
    loadDataFromOtherDeviceFn();
  }

  if (alarm.name === syncBase64ImageCache) {
    console.log(`执行 ${syncBase64ImageCache} 操作`, dayjs().format('YYYY-MM-DD HH:mm:ss'));
    uploadBase64ImageCacheFn();
  }
  if (alarm.name === loadBase64ImageCache) {
    console.log(`执行 ${loadBase64ImageCache} 操作`, dayjs().format('YYYY-MM-DD HH:mm:ss'));
    loadBase64ImageCacheFn();
  }
});
