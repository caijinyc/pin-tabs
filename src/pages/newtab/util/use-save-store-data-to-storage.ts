import { useEffect } from 'react';
import { useStore } from '@pages/newtab/store/store';
import { storeLocalStorage } from '@src/shared/storages/deviceSyncStorage';
import { diffMapPickKeys } from '@src/shared/kits';
import { NEED_SYNC_KEYS } from '@src/constant';

export const useSaveStoreDataToStorage = () => {
  useEffect(() => {
    useStore.subscribe((state, prevState) => {
      storeLocalStorage.get().then(data => {
        let alreadySyncedToGist = data.alreadyBackupToGist;

        // 只有allSpacesMap和groups发生变化时，才需要同步到gist
        if (diffMapPickKeys(state, prevState, NEED_SYNC_KEYS) && Object.keys(prevState).length > 0) {
          console.log('need to sync to gist: true');
          alreadySyncedToGist = false;
        }

        console.log('store changed & local storage updated');
        console.log('alreadySyncedToGist:', alreadySyncedToGist);
        storeLocalStorage.set({
          ...state,
          // 因为本地数据的 version 只有 localStorage 的是最准的，所以这里直接取 localStorage 的 version
          // 否则可能出现 store 中的低版本 覆盖 localStorage 中的高版本 version 问题
          version: storeLocalStorage.getSnapshot().version,
          alreadyBackupToGist: alreadySyncedToGist,
        });
      });
    });
  }, []);
};
