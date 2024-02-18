import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import 'webextension-polyfill';
import './alarm';

reloadOnUpdate('pages/background');

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate('pages/content/style.scss');

console.log('background loaded 2fsxxxxf');

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
