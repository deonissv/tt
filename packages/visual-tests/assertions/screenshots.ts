import { expect, type Page, type Locator } from '@playwright/test';
import { canvasClip, prepareCanvas, screenshotCanvas } from '../support/screenshots';
import { createScreenshotAssertions } from './screenshot-comparisons';

export { assertSnapshotComparisonMode } from './screenshot-comparisons';

export const { expectStoredScreenshot, expectChangedCanvases, expectMatchingCanvases } = createScreenshotAssertions<
  Page,
  Page | Locator
>({
  prepare: prepareCanvas,
  capture: screenshotCanvas,
  clip: canvasClip,
  match: (target, name, options) => expect(target).toHaveScreenshot(name, options),
  changed: (page, name, options, message) => expect(page, message).not.toHaveScreenshot(name, options),
});
