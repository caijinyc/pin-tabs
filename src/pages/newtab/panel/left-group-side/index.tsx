import { useStore } from '@pages/newtab/store/store';
import styles from '@pages/newtab/style.module.scss';
import { Button } from '@chakra-ui/react';
import { produce } from 'immer';
import { Icon } from '@iconify-icon/react';
import React from 'react';
import cls from 'classnames';
import { getGistData } from '@pages/newtab/api';
import { dialog } from '@pages/newtab/comps/global-dialog';

const UploadLocalHistory = () => {
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
        icon="ic:round-drive-folder-upload"
        width="24"
        height="24"
        className={'text-gray-400 hover:text-gray-900 cursor-pointer'}
      />
    </>
  );
};

export const LeftPanel = () => {
  const groups = useStore(state => state.groups);
  const selectedIndex = useStore(state => state.selectedIndex);

  return (
    <div className={cls(styles.leftPanel, 'flex flex-col justify-between')}>
      {/*<h1 className={styles.leftTitle}>SAVING TABS</h1>*/}
      {/*<div className={styles.search}></div>*/}
      <div className={styles.leftSpaceWrapper}>
        {groups.map((item, index) => {
          return (
            <>
              <div
                className={cls(
                  styles.leftSpaceItem,
                  { [styles.leftSpaceItemActive]: selectedIndex === index },
                  'group',
                )}
                key={item.name}
                onClick={() => {
                  useStore.setState(() => {
                    return {
                      selectedIndex: index,
                    };
                  });
                }}>
                <div>{groups[index].name}</div>

                {/*<div className={'hidden group-hover:block absolute right-0 top-0 z-10 text-gray-500'}>*/}
                {/*  <Icon icon="ri:more-2-fill" width="16" height="16" />*/}
                {/*</div>*/}

                {/*<Icon*/}
                {/*    onClick={() => {*/}
                {/*      // setIsEdit(true);*/}
                {/*    }}*/}
                {/*    inline*/}
                {/*    icon="lets-icons:edit-duotone-line"*/}
                {/*    width={'20px'}*/}
                {/*    height={'20px'}*/}
                {/*    className={styles.delTab}*/}
                {/*/>*/}
              </div>
            </>
          );
        })}
        <div>
          <Button
            className={'mt-1'}
            size={'xs'}
            onClick={() => {
              useStore.setState(old => {
                return produce(old, draft => {
                  draft.groups.push({
                    name: 'Untitled Group',
                    subSpacesIds: [],
                  });
                });
              });
            }}>
            Add Group
          </Button>
        </div>
      </div>

      <div>
        <UploadLocalHistory />

        {/*<Icon*/}
        {/*  icon="uim:history"*/}
        {/*  width="24"*/}
        {/*  height="24"*/}
        {/*  onClick={() => {*/}
        {/*    getGistData();*/}
        {/*  }}*/}
        {/*  className={'text-gray-400 hover:text-gray-900 cursor-pointer'}*/}
        {/*/>*/}

        <Icon
          icon="lets-icons:setting-fill"
          width="24"
          height="24"
          onClick={() => {
            // open options page
            chrome.runtime.openOptionsPage();
          }}
          className={'text-gray-400 hover:text-gray-900 cursor-pointer'}
        />

        <Icon
          icon="solar:archive-minimalistic-bold-duotone"
          width="24"
          height="24"
          onClick={() => {
            chrome.runtime.openOptionsPage();
          }}
          className={'text-gray-400 hover:text-gray-900 cursor-pointer'}
        />
      </div>
    </div>
  );
};
