import React from 'react';
import { useStore } from '@pages/newtab/store/store';
import { dialog } from '@pages/newtab/comps/global-dialog';
import { Icon } from '@iconify-icon/react';
import { IconButton, Tooltip } from '@chakra-ui/react';

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

      <Tooltip label={'上传备份文件'}>
        <IconButton
          aria-label={'Save'}
          icon={<Icon icon="ic:round-upload-file" width="24" height="24" />}
          onClick={() => {
            inputRef.current?.click();
          }}
        />
      </Tooltip>
    </>
  );
};
