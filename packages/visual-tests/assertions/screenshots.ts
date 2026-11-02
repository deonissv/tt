import fs from 'node:fs';
import path from 'node:path';
import {
  expect,
  type Locator,
  type Page,
  type PageAssertionsToHaveScreenshotOptions,
  type TestInfo,
} from '@playwright/test';
import { canvasClip, prepareCanvas, screenshotCanvas } from '../support/screenshots';

export function assertSnapshotComparisonMode(testInfo: TestInfo): void {
  // The native UI defaults to Missing and overrides the CLI's None setting.
  // Existing references still compare strictly in either mode.
  if (!['none', 'missing'].includes(testInfo.config.updateSnapshots)) {
    throw new Error(
      'Visual comparisons require --update-snapshots=none or --update-snapshots=missing. ' +
        'In UI Testing Options, set Update snapshots to None or Missing. Update only @behavior:render baselines.',
    );
  }
}

export async function expectStoredScreenshot(
  testInfo: TestInfo,
  target: Page | Locator,
  name: string,
  options?: PageAssertionsToHaveScreenshotOptions,
): Promise<void> {
  // Missing is safe for existing images, but must not create new committed
  // baselines just because a developer ran a test in a fresh UI session.
  if (testInfo.config.updateSnapshots === 'missing' && !fs.existsSync(testInfo.snapshotPath(name))) {
    throw new Error(`Missing visual baseline: ${name}. Create and review it with npm run test:visual:update.`);
  }
  await expect(target).toHaveScreenshot(name, options);
}

// Agreement between players cannot detect a shared stale renderer. Every player
// must also show a visible change from its own image captured before the action.
export async function expectChangedCanvases(
  testInfo: TestInfo,
  label: string,
  pages: Page[],
  before: Buffer[],
  { timeout }: { timeout?: number } = {},
): Promise<void> {
  if (pages.length === 0 || before.length !== pages.length) throw new Error('Each player requires a before image');
  const references = pages.map((_, index) =>
    testInfo.snapshotPath(`__runtime__-${testInfo.testId}-${label}-before-${index + 1}.png`),
  );
  try {
    for (const [index, reference] of references.entries()) {
      fs.mkdirSync(path.dirname(reference), { recursive: true });
      fs.writeFileSync(reference, new Uint8Array(before[index]));
    }
    const comparisons = pages.map(async (page, index) => {
      await prepareCanvas(page);
      return expect(page, `client ${index + 1} did not render ${label}`).not.toHaveScreenshot(
        path.basename(references[index]),
        // A real small actor can move fewer than the 100 pixels allowed for
        // scene equality. Require an independent minimum of visible change.
        { clip: await canvasClip(page), maxDiffPixels: 10, timeout },
      );
    });
    await Promise.all(comparisons).catch(async error => {
      await Promise.allSettled(comparisons);
      throw error;
    });
  } finally {
    for (const reference of references) fs.rmSync(reference, { force: true });
  }
}

// Random outcomes have no fixed golden image. Compare both players against the
// author's rendered result using Playwright's normal screenshot matcher.
export async function expectMatchingCanvases(
  testInfo: TestInfo,
  label: string,
  pages: Page[],
  { timeout }: { timeout?: number } = {},
): Promise<void> {
  if (pages.length < 2) throw new Error('Screenshot comparison requires at least two players');
  assertSnapshotComparisonMode(testInfo);
  const name = `__runtime__-${testInfo.testId}-${label}.png`;
  const reference = testInfo.snapshotPath(name);
  fs.mkdirSync(path.dirname(reference), { recursive: true });
  try {
    // Physics can settle before the rendered clients catch up. Capture and
    // compare as one attempt so a later shared update cannot stale the reference.
    // expect().toPass() would discard an attempt still running at the deadline
    // and replace the real mismatch with its own timeout, so retry inline.
    const deadline = Date.now() + (timeout ?? 30_000);
    for (;;) {
      try {
        await screenshotCanvas(pages[0], reference);
        const comparisons = pages.map(async page => {
          await prepareCanvas(page);
          return expect(page).toHaveScreenshot(name, {
            clip: await canvasClip(page),
            timeout: Math.min(timeout ?? 30_000, 5_000),
          });
        });
        await Promise.all(comparisons).catch(async error => {
          // Finish every matcher before replacing the reference on a retry.
          await Promise.allSettled(comparisons);
          throw error;
        });
        break;
      } catch (error) {
        if (Date.now() >= deadline) throw error;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  } finally {
    fs.rmSync(reference, { force: true });
  }
}
