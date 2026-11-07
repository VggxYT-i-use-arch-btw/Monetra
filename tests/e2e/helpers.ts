import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, type Page } from '@playwright/test';

export async function visitRoute(page: Page, route: string): Promise<void> {
  await page.goto(`/#${route}`);
  await expect(page.locator('#root')).not.toBeEmpty();
  await expect(page.locator('.loading-state')).toHaveCount(0);
}

export async function saveViewportScreenshot(page: Page, name: string): Promise<void> {
  const directory = resolve(process.cwd(), 'artifacts', 'screenshots');
  mkdirSync(directory, { recursive: true });
  await page.screenshot({ path: resolve(directory, name), animations: 'disabled' });
}
