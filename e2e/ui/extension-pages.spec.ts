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
});
