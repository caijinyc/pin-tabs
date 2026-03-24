import { expect, test } from '../fixtures/extension';

test.describe('extension page smoke', () => {
  test('options page renders the settings form', async ({ context, extensionUrl }) => {
    const page = await context.newPage();

    await page.goto(extensionUrl('src/pages/options/index.html'));

    await expect(page.getByText('GitHub Username')).toBeVisible();
    await expect(page.locator('input[name="githubUsername"]')).toBeVisible();
  });

  test('newtab page renders the project workspace', async ({ context, extensionUrl }) => {
    const page = await context.newPage();

    await page.goto(extensionUrl('src/pages/newtab/index.html'));

    await expect(page.getByText('Spaces')).toBeVisible();
    await expect(page.locator('input[placeholder="Search"]')).toHaveCount(0);
    await expect(page.locator('input')).toBeVisible();
  });

  test('theme preference persists across extension pages', async ({ context, extensionUrl }) => {
    const optionsPage = await context.newPage();

    await optionsPage.goto(extensionUrl('src/pages/options/index.html'));
    await optionsPage.getByRole('button', { name: 'Use light theme' }).click();

    await expect.poll(async () => optionsPage.locator('html').getAttribute('data-theme')).toBe('light');

    const newtabPage = await context.newPage();
    await newtabPage.goto(extensionUrl('src/pages/newtab/index.html'));

    await expect.poll(async () => newtabPage.locator('html').getAttribute('data-theme')).toBe('light');
    await expect(newtabPage.getByRole('button', { name: 'Use dark theme' })).toBeVisible();
  });

  test('newtab does not switch through dark when light theme cache is missing', async ({ context, extensionUrl }) => {
    const optionsPage = await context.newPage();

    await optionsPage.goto(extensionUrl('src/pages/options/index.html'));
    await optionsPage.getByRole('button', { name: 'Use light theme' }).click();
    await expect.poll(async () => optionsPage.locator('html').getAttribute('data-theme')).toBe('light');

    const newtabPage = await context.newPage();

    await newtabPage.addInitScript(() => {
      const transitions: Array<string | null> = [];
      const html = document.documentElement;
      const samples: Array<{
        label: string;
        htmlBackground: string;
        bodyBackground: string | null;
      }> = [];

      const recordTransition = () => {
        transitions.push(html.getAttribute('data-theme'));
      };

      const recordSample = (label: string) => {
        samples.push({
          label,
          htmlBackground: getComputedStyle(html).backgroundColor,
          bodyBackground: document.body ? getComputedStyle(document.body).backgroundColor : null,
        });
      };

      recordTransition();
      recordSample('init');

      new MutationObserver(recordTransition).observe(html, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });

      let frameCount = 0;
      const collectFrameSamples = () => {
        recordSample(`raf-${frameCount}`);
        frameCount += 1;
        if (frameCount < 12) {
          requestAnimationFrame(collectFrameSamples);
        }
      };

      requestAnimationFrame(collectFrameSamples);
      document.addEventListener('DOMContentLoaded', () => recordSample('domcontentloaded'));
      window.addEventListener('load', () => recordSample('load'));

      localStorage.removeItem('theme-storage-key');

      (
        window as typeof window & {
          __themeTransitions?: Array<string | null>;
          __themeBackgroundSamples?: Array<{
            label: string;
            htmlBackground: string;
            bodyBackground: string | null;
          }>;
        }
      ).__themeTransitions = transitions;
      (
        window as typeof window & {
          __themeBackgroundSamples?: Array<{
            label: string;
            htmlBackground: string;
            bodyBackground: string | null;
          }>;
        }
      ).__themeBackgroundSamples = samples;
    });

    await newtabPage.goto(extensionUrl('src/pages/newtab/index.html'));

    await expect.poll(async () => newtabPage.locator('html').getAttribute('data-theme')).toBe('light');

    const themeTransitions = await newtabPage.evaluate(() => {
      return (
        (
          window as typeof window & {
            __themeTransitions?: Array<string | null>;
          }
        ).__themeTransitions ?? []
      );
    });
    const backgroundSamples = await newtabPage.evaluate(() => {
      return (
        (
          window as typeof window & {
            __themeBackgroundSamples?: Array<{
              label: string;
              htmlBackground: string;
              bodyBackground: string | null;
            }>;
          }
        ).__themeBackgroundSamples ?? []
      );
    });

    expect(themeTransitions).not.toContain('dark');
    expect(backgroundSamples).not.toContainEqual(
      expect.objectContaining({
        bodyBackground: 'rgb(30, 30, 30)',
      }),
    );
  });

  test('popup resolves the persisted light theme before marking bootstrap ready', async ({ context, extensionUrl }) => {
    const optionsPage = await context.newPage();

    await optionsPage.goto(extensionUrl('src/pages/options/index.html'));
    await optionsPage.getByRole('button', { name: 'Use light theme' }).click();
    await expect.poll(async () => optionsPage.locator('html').getAttribute('data-theme')).toBe('light');

    const popupPage = await context.newPage();
    await popupPage.addInitScript(() => {
      localStorage.removeItem('theme-storage-key');
    });

    await popupPage.goto(extensionUrl('src/pages/popup/index.html'));

    await expect.poll(async () => popupPage.locator('html').getAttribute('data-theme')).toBe('light');
    await expect.poll(async () => popupPage.locator('html').getAttribute('data-theme-ready')).toBe('true');
    await expect(popupPage.getByRole('button', { name: 'Use dark theme' })).toBeVisible();
  });
});
