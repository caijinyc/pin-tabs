import { useStorageData } from '@src/shared/storages/base';
import { optionsStorage } from '@src/shared/storages/optionsStorage';
import { Icon } from '@iconify-icon/react';
import { Tooltip } from '@chakra-ui/react';
import { Actions } from '@pages/newtab/store/actions';
import { dialog } from '@pages/newtab/comps/global-dialog';
import React from 'react';

export const LeftPanelBottomActions = () => {
  const { syncGistId, githubUsername } = useStorageData(optionsStorage);

  const iconClassName = 'text-gray-400 hover:text-gray-100 cursor-pointer';

  return (
    <div className={'inline-flex gap-1 pt-2'}>
      <Icon
        icon="material-symbols-light:settings"
        width="18"
        height="18"
        onClick={() => {
          // open options page
          chrome.runtime.openOptionsPage();
        }}
        className={iconClassName}
      />

      <Tooltip label={'Archive projects'}>
        <Icon
          icon="material-symbols:archive"
          width="18"
          height="18"
          onClick={() => {
            Actions.openArchive();
          }}
          className={iconClassName}
        />
      </Tooltip>

      {githubUsername && syncGistId ? (
        <Tooltip label={'Gist backup data'}>
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
            className={iconClassName}
          />
        </Tooltip>
      ) : null}
    </div>
  );
};
