import { useStore } from '@pages/newtab/store/store';
import styles from '@pages/newtab/style.module.scss';
import { Button } from '@chakra-ui/react';
import { produce } from 'immer';
import { Icon } from '@iconify-icon/react';
import React from 'react';
import cls from 'classnames';
import { Groups } from '@pages/newtab/panel/left-group-side/group';
import { UploadLocalHistory } from '@pages/options/upload-local-history';
import { uuid } from '@src/shared/kits';
import { optionsStorage } from '@src/shared/storages/optionsStorage';
import { dialog } from '@pages/newtab/comps/global-dialog';

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
                    id: uuid(),
                    subSpacesIds: [],
                  });
                  draft.selectedIndex = draft.groups.length - 1;
                });
              });
            }}>
            Add Group
          </Button>
        </div>
      </div>

      <div>
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

        <Icon
          onClick={() => {
            const { syncGistId, githubUsername } = optionsStorage.getSnapshot();
            if (!syncGistId || !githubUsername) {
              dialog.confirm({
                title: 'Upload Error',
                content: 'Please set sync gist id and github username in options page first',
                onOk: () => {},
              });
              return;
            } else {
              window.open(`https://gist.github.com/${githubUsername}/${syncGistId}`, '_blank');
            }
          }}
          icon="mdi:github"
          width="18"
          height="18"
          className={'text-gray-400 hover:text-gray-900 cursor-pointer'}
        />
      </div>
    </div>
  );
};
