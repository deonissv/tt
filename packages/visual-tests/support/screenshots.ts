import { expect, type Page } from '@playwright/test';
import { waitForRenderedFrames } from './rendering';
import { screenshotStyle } from './screenshot-style';

export async function canvasClip(page: Page) {
  const box = await page.locator('canvas').boundingBox();
  if (!box || box.width <= 2 || box.height <= 2) throw new Error('Canvas is not visible or too small');
  // Mesa can vary the outermost raster column. Exclude only that one-pixel
  // boundary instead of allowing additional differences inside the scene.
  return { x: box.x + 1, y: box.y + 1, width: box.width - 2, height: box.height - 2 };
}

export async function prepareCanvas(page: Page): Promise<void> {
  await expect(page.locator('div.bg-lightred.shadow-lg')).toHaveCount(0);
  await page.mouse.move(10, 10);
  await waitForRenderedFrames(page);
}

export async function screenshotCanvas(page: Page, target?: string): Promise<Buffer> {
  await prepareCanvas(page);
  return page.screenshot({
    animations: 'disabled',
    clip: await canvasClip(page),
    style: screenshotStyle,
    ...(target ? { path: target } : {}),
  });
}

export async function captureCanvases(pages: Page[]): Promise<Buffer[]> {
  const captures = pages.map(page => screenshotCanvas(page));
  return Promise.all(captures).catch(async error => {
    await Promise.allSettled(captures);
    throw error;
  });
}
