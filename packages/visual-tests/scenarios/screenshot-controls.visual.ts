import { expect, expectChangedCanvases, expectMatchingCanvases } from '../assertions';
import { test, type Page } from '@playwright/test';
import { captureCanvases } from '../support/screenshots';

const details = { tag: ['@behavior:control'] };

async function drawCanvas(page: Page, x = 600, visible = true, size = 40): Promise<void> {
  await page.setContent('<style>body { margin: 0 }</style><canvas width="1280" height="720"></canvas>');
  await page.locator('canvas').evaluate(
    (element, { x, visible, size }) => {
      const canvas = element as unknown as HTMLCanvasElement;
      const context = canvas.getContext('2d')!;
      context.fillStyle = 'black';
      context.fillRect(0, 0, canvas.width, canvas.height);
      if (visible) {
        context.fillStyle = 'white';
        context.fillRect(x, 300, size, size);
      }
    },
    { x, visible, size },
  );
}

test('canvas comparison rejects a missing 40x40 object', details, async ({ context }, testInfo) => {
  const pages = await Promise.all([context.newPage(), context.newPage()]);
  await drawCanvas(pages[0]);
  await drawCanvas(pages[1], 600, false);
  await expect(expectMatchingCanvases(testInfo, 'missing-object', pages, { timeout: 500 })).rejects.toThrow(
    /toHaveScreenshot/,
  );
});

test('shared stale canvases fail the visible action check', details, async ({ context }, testInfo) => {
  const pages = await Promise.all([context.newPage(), context.newPage()]);
  await Promise.all(pages.map(page => drawCanvas(page)));
  const before = await captureCanvases(pages);
  await expectMatchingCanvases(testInfo, 'same-stale-image', pages);
  await expect(expectChangedCanvases(testInfo, 'movement', pages, before, { timeout: 500 })).rejects.toThrow(
    /did not render movement/,
  );
});

test('small visible movement passes for both canvases', details, async ({ context }, testInfo) => {
  const pages = await Promise.all([context.newPage(), context.newPage()]);
  await Promise.all(pages.map(page => drawCanvas(page, 600, true, 4)));
  const before = await captureCanvases(pages);
  await Promise.all(pages.map(page => drawCanvas(page, 660, true, 4)));
  await expectChangedCanvases(testInfo, 'movement', pages, before);
  await expectMatchingCanvases(testInfo, 'moved-images', pages);
});
