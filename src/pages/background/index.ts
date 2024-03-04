import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import 'webextension-polyfill';
import './alarm';
import { getAllGroups } from '@pages/newtab/store/store';

reloadOnUpdate('pages/background');

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate('pages/content/style.scss');

console.log('background loaded 2fsxxxxf');

chrome.commands.onCommand.addListener(function (command) {
  if (command === 'command1') {
    // collapse all groups, exclude the active tab's group
    chrome.tabs.query({ currentWindow: true }, function (tabs) {
      const activeTab = tabs.find(tab => tab.active);
      const activeGroupId = activeTab?.groupId;
      if (activeGroupId) {
        chrome.tabGroups.query({}, function (groups) {
          groups.forEach(group => {
            if (group.id !== activeGroupId) {
              chrome.tabGroups.update(group.id, { collapsed: true });
            }
          });
        });
      }
    });
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
  }
});
