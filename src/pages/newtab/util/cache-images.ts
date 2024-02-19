import { openDB } from 'idb';

const dbPromise = openDB('keyval-store', 1, {
  upgrade(db) {
    db.createObjectStore('keyval');
  },
});

export async function get(key) {
  return (await dbPromise).get('keyval', key);
}
export async function set(key, val) {
  return (await dbPromise).put('keyval', val, key);
}
export async function del(key) {
  return (await dbPromise).delete('keyval', key);
}
export async function clear() {
  return (await dbPromise).clear('keyval');
}
export async function keys() {
  return (await dbPromise).getAllKeys('keyval');
}

export const cacheImgBase64ToDB = async (val: Record<string, string>) => {
  const oldMap: Record<string, string> = (await get('imgMap')) || {};

  const newMap = {
    ...oldMap,
    ...val,
  };

  await set('imgMap', newMap);
};

export const getCacheImgBase64Map = async () => {
  return ((await get('imgMap')) || {}) as Record<string, string>;
};

const MAX_WIDTH = 48;

export async function getImageBase64(url: string): Promise<string> {
  // 使用fetch API获取图片
  // create img tag
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.src = url;
    img.style.display = 'none';
    img.onerror = function (e) {
      console.error('img onerror', url, e);
      img.remove();
      reject(e);
    };
    img.onload = function (e) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      let width = img.width;
      let height = img.height;

      if (width > MAX_WIDTH) {
        width = MAX_WIDTH;
        height = img.height * (MAX_WIDTH / img.width);
      }

      // 确保图片尺寸设置正确
      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      try {
        const base64String = canvas.toDataURL('image/png');
        img.remove();
        resolve(base64String);
      } catch (e) {
        console.error('canvas toDataURL error', url, e);
        img.remove();
        reject(e);
      }
    };

    document.body.appendChild(img);
  });
}
