import path from 'node:path';
import { defineConfig } from '@playwright/test';
import canonical from '../playwright.config';

export default defineConfig({
  ...canonical,
  testDir: __dirname,
  testMatch: '**/*.prepare.ts',
  globalSetup: path.resolve(__dirname, '../global-setup.ts'),
  fullyParallel: false,
  workers: 1,
  timeout: 15 * 60_000,
  outputDir: path.resolve(__dirname, '../../../test-results/visual/target-preparation'),
  reporter: [['list']],
  updateSnapshots: 'none',
  projects: [{ name: 'prepare-targets' }],
});
