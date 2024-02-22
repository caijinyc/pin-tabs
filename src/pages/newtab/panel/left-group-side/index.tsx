import { useStore } from '@pages/newtab/store/store';
import styles from '@pages/newtab/style.module.scss';
import { Button } from '@chakra-ui/react';
import { produce } from 'immer';
import { Icon } from '@iconify-icon/react';
import React from 'react';
import cls from 'classnames';
import { Groups } from '@pages/newtab/panel/left-group-side/group';
import { UploadLocalHistory } from '@pages/newtab/panel/left-group-side/bottom';

export const LeftPanel = () => {
  return (
    <div className={cls(styles.leftPanel, 'flex flex-col justify-between')}>
      <div className={styles.leftSpaceWrapper}>
        <Groups />
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
          icon="material-symbols-light:settings"
          width="18"
          height="18"
          onClick={() => {
            // open options page
            chrome.runtime.openOptionsPage();
          }}
          className={'text-gray-400 hover:text-gray-900 cursor-pointer'}
        />

        <Icon
          icon="material-symbols-light:save-rounded"
          width="18"
          height="18"
          onClick={() => {
            chrome.runtime.openOptionsPage();
          }}
          className={'text-gray-400 hover:text-gray-900 cursor-pointer'}
        />
      </div>
    </div>
  );
};
