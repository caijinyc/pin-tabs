import React from 'react';
import { useStore } from '@pages/newtab/store/store';
import { dialog } from '@pages/newtab/comps/global-dialog';
import { Icon } from '@iconify-icon/react';

export const UploadLocalHistory = () => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={inputRef}
        type={'file'}
        accept={'application/json'}
        className={'hidden'}
        onChange={e => {
          console.log('click', e);
          const file = e.currentTarget.files?.[0];
          // e.currentTarget.value = '';
          if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
              const content = e.target?.result;
              if (content) {
                const data = JSON.parse(content as string);
                const keys = Object.keys(data).sort();
                if (keys.includes('groups') && keys.includes('selectedIndex') && keys.includes('allSpacesMap')) {
                  useStore.setState(old => ({
                    ...old,
                    ...data,
                  }));
                } else {
                  dialog.confirm({
                    title: 'Upload Error',
                    content: 'The file is not a valid backup file',
                    onOk: () => {},
                  });
                }
              }
            };
            reader.readAsText(file);
          }
        }}
      />

      <Icon
        onClick={() => {
          inputRef.current?.click();
        }}
        icon="material-symbols-light:drive-folder-upload"
        width="18"
        height="18"
        className={'text-gray-400 hover:text-gray-900 cursor-pointer'}
      />
    </>
  );
};
