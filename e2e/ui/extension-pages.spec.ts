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
});
