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

  if (alarm.name === loadDataFromOtherDevice) {
    console.log(`执行 ${loadDataFromOtherDevice} 操作`, dayjs().format('YYYY-MM-DD HH:mm:ss'));
    loadDataFromOtherDeviceFn();
  }
});
