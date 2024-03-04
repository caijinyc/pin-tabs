import fs from 'node:fs';

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

/**
 * After changing, please reload the extension at `chrome://extensions`
 * @type {chrome.runtime.ManifestV3}
 */
const manifest = {
  manifest_version: 3,
  default_locale: 'en',
  /**
   * if you want to support multiple languages, you can use the following reference
   * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization
   */
  name: '__MSG_extensionName__',
  version: packageJson.version,
  description: '__MSG_extensionDescription__',
  permissions: ['storage', 'sidePanel', 'tabs', 'tabGroups', 'history', 'alarms', 'unlimitedStorage', 'system.cpu'],
  host_permissions: ['<all_urls>'],
  key: `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwon6UimSqj2ZXePAF5x+3UkAi7GFkPnfZkNKyocQb0RcEyVqle6EtzEN5nxokqW5gQQwjqlNyxsZ5jgwNYilgBWNpAR45Qj/d5d/ip9U8+7zpitYom7cbXX1u6EoeTT/BzrLukXOOkHH6CnEMLAEiSQhtf8tKjCkl3+ar0BhP9YEV/HkDmKih84IHjnyjClHhJIctNevCAFt/9YdHtncd0Bp+mmHGCbAjSJ68lKiJ4bNHz6MDpQXcRRTESC+DucCf4gfagIjGb1LTm4D/w78lL1E6gtxjySGBaByaUKFMlFsILX8AApAaZI1OoZvucFzYwkIJX0EVK+oz82xOOlNgwIDAQAB`,
  // side_panel: {
  //   default_path: 'src/pages/sidepanel/index.html',
  // },
  options_page: 'src/pages/options/index.html',
  background: {
    service_worker: 'src/pages/background/index.js',
    type: 'module',
  },
  action: {
    default_popup: 'src/pages/popup/index.html',
    default_icon: 'icon-34.png',
  },
  // chrome_url_overrides: {
  //   newtab: 'src/pages/newtab/index.html',
  // },
  icons: {
    128: 'icon-128.png',
  },
  commands: {
    command1: {
      suggested_key: {
        default: 'Ctrl+Shift+G',
        mac: 'Command+Ctrl+G',
      },
      description: 'Collapse all groups, excluding the active tab group',
    },
    command2: {
      suggested_key: {
        default: 'Ctrl+Shift+E',
        mac: 'Command+Ctrl+E',
      },
      description: 'Open bookmarks manage page',
    },
  },
  content_scripts: [
    // {
    //   matches: ['http://*/*', 'https://*/*', '<all_urls>'],
    //   js: ['src/pages/contentInjected/index.js'],
    //   // KEY for cache invalidation
    //   css: ['assets/css/contentStyle<KEY>.chunk.css'],
    // },
    // {
    //   matches: ['http://*/*', 'https://*/*', '<all_urls>'],
    //   js: ['src/pages/contentUI/index.js'],
    // },
  ],
  // devtools_page: 'src/pages/devtools/index.html',
  web_accessible_resources: [
    {
      resources: ['assets/js/*.js', 'assets/css/*.css', 'icon-128.png', 'icon-34.png'],
      matches: ['*://*/*'],
    },
  ],
};

export default manifest;
