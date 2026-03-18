import { expect, test } from '../fixtures/extension';

test.describe('extension storage flow', () => {
  test('options form persists the GitHub username', async ({ context, extensionUrl }) => {
    const page = await context.newPage();

    await page.goto(extensionUrl('src/pages/options/index.html'));

    const githubUsernameInput = page.locator('input[name="githubUsername"]');
    const value = `jin-e2e-${Date.now()}`;

    await githubUsernameInput.fill(value);
    await page.waitForTimeout(300);
    await page.reload();

    await expect(githubUsernameInput).toHaveValue(value);
  });
});
