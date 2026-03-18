import { expect, test as base, chromium, type BrowserContext, type ServiceWorker } from '@playwright/test';
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionPath = path.resolve(__dirname, '../../dist');

type ExtensionFixtures = {
  context: BrowserContext;
  extensionId: string;
  serviceWorker: ServiceWorker;
  extensionUrl: (relativePath: string) => string;
};

export const test = base.extend<ExtensionFixtures>({
  context: async ({ browserName: _browserName }, use) => {
    const userDataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pintabs-e2e-'));
    const context = await chromium.launchPersistentContext(userDataDir, {
      args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
      channel: 'chromium',
      headless: false,
    });

    try {
      await use(context);
    } finally {
      await context.close();
      await fs.rm(userDataDir, { recursive: true, force: true });
    }
  },
  serviceWorker: async ({ context }, use) => {
    let [serviceWorker] = context.serviceWorkers();
    if (!serviceWorker) {
      serviceWorker = await context.waitForEvent('serviceworker');
    }
    await use(serviceWorker);
  },
  extensionId: async ({ serviceWorker }, use) => {
    const extensionId = new URL(serviceWorker.url()).host;
    await use(extensionId);
  },
  extensionUrl: async ({ extensionId }, use) => {
    await use(relativePath => `chrome-extension://${extensionId}/${relativePath}`);
  },
});

export { expect };
