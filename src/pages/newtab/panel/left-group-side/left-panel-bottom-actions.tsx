import { useStorageData } from '@src/shared/storages/base';
import { optionsStorage } from '@src/shared/storages/optionsStorage';
import { Icon } from '@iconify-icon/react';
import { Actions } from '@pages/newtab/store/actions';
import { dialog } from '@pages/newtab/comps/global-dialog';
import React from 'react';
import { SimpleTooltip } from '@src/shared/ui/simple-tooltip';

export const LeftPanelBottomActions = () => {
  const options = useStorageData(optionsStorage);
  const syncGistId = options?.syncGistId;
  const githubUsername = options?.githubUsername;

  const iconClassName = 'text-app-text-muted hover:text-app-text cursor-pointer transition-colors';

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

      <SimpleTooltip label={'Archive projects'}>
        <Icon
          icon="material-symbols:archive"
          width="18"
          height="18"
          onClick={() => {
            Actions.openArchive();
          }}
          className={iconClassName}
        />
      </SimpleTooltip>

      {githubUsername && syncGistId ? (
        <SimpleTooltip label={'Gist backup data'}>
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
        </SimpleTooltip>
      ) : null}
    </div>
  );
};
