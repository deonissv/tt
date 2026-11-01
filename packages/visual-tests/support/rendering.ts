import { expect, type BrowserContext, type Page } from '@playwright/test';

export async function configureContext(context: BrowserContext, errors: string[]): Promise<void> {
  await context.addInitScript(() => Object.defineProperty(navigator, 'gpu', { value: undefined }));
  context.on('page', page => {
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('requestfailed', request =>
      errors.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`),
    );
  });
  if (['dev', 'headed'].includes(process.env.VISUAL_MODE ?? '')) {
    await context.route('**/favicon.ico', route => route.fulfill({ status: 204 }));
  }
}

export async function waitForClientReady(page: Page): Promise<void> {
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible({ timeout: 120_000 });
  await canvas.click({ trial: true, timeout: 120_000 });
  await expect(page.getByText('Starting room', { exact: true })).toBeHidden({ timeout: 120_000 });
  await waitForRenderedFrames(page);
}

export const waitForRenderedFrames = async (page: Page): Promise<void> => {
  await page.evaluate(async () => {
    for (let frame = 0; frame < 2; frame++) {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    }
  });
};
