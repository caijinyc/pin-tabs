import { cacheImgBase64ToDB, getCacheImgBase64Map } from '@pages/newtab/util/cache-images';
import { uploadToGist } from '@pages/background/sync';
import { optionsStorage } from '@src/shared/storages/optionsStorage';
import { getGistData } from '@pages/background/api';

export const syncBase64ImageCache = 'syncBase64ImageCache';
export const loadBase64ImageCache = 'loadBase64ImageCache';

export const syncBase64ImageCacheFn = async () => {
  const cacheImgBase64Map = await getCacheImgBase64Map();

  const { syncGistId } = await optionsStorage.get();

  if (!syncGistId) return;

  console.log('syncBase64ImageCacheFn start 🌃🌃🌃');

  const cloudOldData = await getGistData<Record<string, string>>({
    filename: 'cacheImgBase64Map.json',
    gistId: syncGistId,
  });

  const needCacheUrlsReg = optionsStorage.getSnapshot().faviconSyncList.split(',');

  console.log('needCacheUrlsReg', needCacheUrlsReg);

  if (
    Object.keys(cloudOldData).length &&
    Object.keys(cloudOldData).sort().join(',') === Object.keys(cacheImgBase64Map).sort().join(',')
  ) {
    console.log('no need to upload cacheImgBase64Map');
    return;
  }

  const needUpdateData = Object.keys({
    ...cacheImgBase64Map,
    ...cloudOldData,
  }).reduce(
    (acc, key) => {
      if (needCacheUrlsReg.find(reg => key.includes(reg))) {
        acc[key] = cacheImgBase64Map[key];
      }
      return acc;
    },
    {} as Record<string, string>,
  );

  await uploadToGist({
    data: {
      ...needUpdateData,
    },
    gistId: syncGistId,
    filename: 'cacheImgBase64Map.json',
  });

  console.log('syncBase64ImageCacheFn done ✅✅✅');
};

export const loadBase64ImageCacheFn = async () => {
  const { syncGistId } = await optionsStorage.get();

  if (!syncGistId) return;

  console.log('LOAD Base64ImageCacheFn start 🌃🌃🌃');
  const cloudData = await getGistData<Record<string, string>>({
    filename: 'cacheImgBase64Map.json',
    gistId: syncGistId,
  });

  await cacheImgBase64ToDB(cloudData);

  console.log('LOAD Base64ImageCacheFn done ✅✅✅');
};
