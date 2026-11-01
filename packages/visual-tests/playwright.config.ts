import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import type { VisualEnvironment } from './setup/environment.mjs';
import { screenshotStylePath } from './support/screenshot-style';

const repositoryRoot = path.resolve(__dirname, '../..');

const mode = process.env.VISUAL_MODE ?? 'canonical';
if (!['canonical', 'ui', 'dev', 'headed'].includes(mode)) throw new Error(`Unknown visual mode: ${mode}`);
const isDev = mode === 'dev';
const isHeaded = mode === 'headed';
const attached = isDev || isHeaded;
const appOrigin = attached ? 'http://127.0.0.1:5500' : 'http://web:8080';
const baseURL = process.env.VISUAL_BASE_URL ?? appOrigin;
const apiURL = attached ? (process.env.VISUAL_API_URL ?? 'http://127.0.0.1:8080') : undefined;
const assetURL = process.env.VISUAL_ASSET_URL ?? apiURL ?? baseURL;
const projectSuffix =
  process.env.GITHUB_RUN_ID ?? (attached ? `${mode}-browser` : mode === 'canonical' ? 'local' : mode);
const environment: VisualEnvironment = {
  mode,
  baseURL,
  apiURL,
  assetURL,
  projectName: process.env.COMPOSE_PROJECT_NAME ?? `tt-visual-${projectSuffix.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
};
const updateSnapshots = !isDev && process.env.UPDATE_VISUAL_BASELINES === '1' ? 'all' : 'none';
const artifactPhase = (process.env.VISUAL_ARTIFACT_PHASE ?? mode).replaceAll(/[^a-zA-Z0-9_-]/g, '-');
const configuredSlowMo = Number(process.env.VISUAL_SLOW_MO ?? 0);
const slowMo = Number.isFinite(configuredSlowMo) && configuredSlowMo >= 0 ? configuredSlowMo : 0;

export default defineConfig({
  metadata: { visual: environment },
  globalSetup: './global-setup.ts',
  testDir: '.',
  testMatch: '**/*.visual.ts',
  fullyParallel: true,
  forbidOnly: true,
  workers: 1,
  retries: 0,
  timeout: 180_000,
  expect: {
    timeout: 30_000,
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixels: 100,
      scale: 'css',
      stylePath: screenshotStylePath,
    },
  },
  use: {
    ...devices['Desktop Chrome'],
    baseURL,
    browserName: 'chromium',
    channel: 'chromium',
    colorScheme: 'dark',
    deviceScaleFactor: 1,
    headless: !isHeaded,
    locale: 'en-US',
    timezoneId: 'Europe/Warsaw',
    screenshot: 'only-on-failure',
    trace: 'off',
    video: 'off',
    viewport: { width: 1280, height: 720 },
    launchOptions: {
      args: [
        '--enable-webgl',
        '--ignore-gpu-blocklist',
        '--use-gl=angle',
        isHeaded ? '--use-angle=swiftshader' : '--use-angle=vulkan',
        '--enable-unsafe-swiftshader',
        ...(!isHeaded ? ['--enable-gpu'] : []),
      ],
      slowMo,
    },
  },
  outputDir: path.join(repositoryRoot, 'test-results/visual', artifactPhase),
  snapshotPathTemplate: '{testDir}/baselines/{testFilePath}/{arg}{ext}',
  updateSnapshots,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: path.join(repositoryRoot, 'playwright-report/visual', artifactPhase) }],
    ['junit', { outputFile: path.join(repositoryRoot, 'test-results/visual', artifactPhase, 'results.xml') }],
  ],
  projects: [
    {
      name: 'chromium-webgl',
      testIgnore: '**/persistence.visual.ts',
      // A whole-app restart must wait for all independently seeded rooms,
      // including after a failed WebGL case. A teardown project also runs alone.
      teardown: mode === 'canonical' && updateSnapshots === 'none' ? 'persistence' : undefined,
    },
    ...(mode === 'canonical' && updateSnapshots === 'none'
      ? [
          {
            name: 'persistence',
            testMatch: '**/persistence.visual.ts',
            snapshotPathTemplate: '{testDir}/../../test-results/persistence/{testName}/{arg}{ext}',
          },
        ]
      : []),
  ],
});
