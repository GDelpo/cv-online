
import { test, expect } from '@playwright/test';

test('CV page screenshot', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await expect(page).toHaveTitle(/Guido Delponte/);
  await page.screenshot({ path: 'jules-scratch/verification/screenshot.png', fullPage: true });
});
