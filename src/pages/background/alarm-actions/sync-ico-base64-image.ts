import { cacheImgBase64ToDB, getCacheImgBase64Map } from '@pages/newtab/util/cache-images';
import { uploadToGist } from '@pages/background/alarm-actions/sync';
import { optionsStorage } from '@src/shared/storages/optionsStorage';
import { getGistData } from '@pages/background/api';
import { storeLocalStorage } from '@src/shared/storages/deviceSyncStorage';
import { TabInfo } from '@pages/newtab/store/store';

export const syncBase64ImageCache = 'syncBase64ImageCache';
export const loadBase64ImageCache = 'loadBase64ImageCache';

export const uploadBase64ImageCacheFn = async () => {
  const cacheImgBase64Map = await getCacheImgBase64Map();

  const { syncGistId } = await optionsStorage.get();

  if (!syncGistId) return;

  console.log('%csyncBase64ImageCacheFn start 🌃🌃🌃', 'color: #1890ff');

  const cloudOldData = await getGistData<Record<string, string>>({
    filename: 'cacheImgBase64Map.json',
    gistId: syncGistId,
  });

  const needCacheUrlsReg = optionsStorage.getSnapshot().faviconSyncList.split(',');

  const allTabs = Object.values(storeLocalStorage.getSnapshot().allSpacesMap || {}).reduce((acc, space) => {
    acc.push(...space.tabs);
    return acc;
  }, [] as TabInfo[]);

  let needUploadFavIconUrls: string[] = allTabs
    .filter(
      tab => tab.favIconUrl && needCacheUrlsReg.find(reg => tab.favIconUrl.includes(reg) || tab.url.includes(reg)),
    )
    .map(tab => tab.favIconUrl);

  // 去重
  needUploadFavIconUrls = Array.from(new Set(needUploadFavIconUrls));

  const finalNeedUploadUrls = Object.keys({
    ...cacheImgBase64Map,
    ...cloudOldData,
  }).reduce(
    (acc, key) => {
      // favicon / tab.url 匹配成功则缓存
      if (needCacheUrlsReg.find(reg => key.includes(reg)) || needUploadFavIconUrls.includes(key)) {
        acc[key] = cacheImgBase64Map[key];
      }
      return acc;
    },
    {} as Record<string, string>,
  );

  console.log('needUpdateData', finalNeedUploadUrls);

  if (
    Object.keys(cloudOldData).length &&
    Object.keys(cloudOldData).sort().join(',') === Object.keys(finalNeedUploadUrls).sort().join(',')
  ) {
    console.log('%cno need to upload cacheImgBase64Map', 'color: #1890ff');
    return;
  }

  await uploadToGist({
    data: {
      ...finalNeedUploadUrls,
    },
    gistId: syncGistId,
    filename: 'cacheImgBase64Map.json',
  });

  console.log('%csyncBase64ImageCacheFn done ✅✅✅', 'color: #1890ff');
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
