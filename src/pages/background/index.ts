import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import 'webextension-polyfill';
import { Octokit } from 'octokit';
import { useStore } from '@pages/newtab/store';
import { optionsStorage } from '@src/shared/storages/optionsStorage';

reloadOnUpdate('pages/background');

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate('pages/content/style.scss');

console.log('background loaded 2fsxxxxf');

chrome.alarms
  .create('backupData', { periodInMinutes: 10 })
  .then(() => {
    console.log('create alarm success');
  })
  .catch(e => {
    console.log('create alarm fail', e);
  });

setTimeout(() => {
  chrome.alarms.getAll().then(alarms => {
    console.log('getAll', alarms);
  });
}, 1000);

const syncToGist = async (data: any) => {
  const { gistId, token } = await optionsStorage.get();

  if (!gistId || !token) return;

  const octokit = new Octokit({
    auth: token,
  });

  await octokit
    .request('PATCH /gists/{gist_id}', {
      gist_id: gistId,
      description: 'An updated gist description',
      files: {
        'backup_data.json': {
          content: JSON.stringify(data, null, 2),
        },
      },
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
    .then(() => {
      console.log('sync success');
    })
    .catch(err => {
      console.error('sync fail', err);
    });
};

chrome.alarms.onAlarm.addListener(function (alarm) {
  console.log('onAlarm', alarm, alarm.name, alarm.scheduledTime, alarm.periodInMinutes);
  if (alarm.name === 'backupData') {
    console.log('执行备份操作');
    chrome.storage.local.get(['cache_tabs_info']).then(val => {
      if (val['cache_tabs_info']) {
        syncToGist(val['cache_tabs_info']);
      }
    });
  }
});

chrome.commands.onCommand.addListener(function (command) {
  if (command === 'command1') {
    // 执行命令1的相关操作
  } else if (command === 'command2') {
    chrome.tabs.query({ currentWindow: true }, function (tabs) {
      const newtab = tabs.find(tab => tab.url && tab.url.includes('/src/pages/newtab/index.html'));

      if (newtab && newtab.active) {
        return;
      } else {
        if (newtab) {
          chrome.tabs.update(newtab.id, { active: true });
        } else {
          chrome.tabs
            .create({
              url: `chrome-extension://${chrome.runtime.id}/src/pages/newtab/index.html`,
              active: true,
            })
            .then(tab => {
              // pin the newtab page & move it to the first position
              chrome.tabs.update(tab.id, { pinned: true });
            });
        }
      }
    });

    // 执行命令2的相关操作
  }
});
