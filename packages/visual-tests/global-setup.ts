import type { FullConfig } from '@playwright/test';
import type { VisualEnvironment } from './setup/environment.mjs';

export default async function globalSetup(config: FullConfig): Promise<() => Promise<void>> {
  const { setupEnvironment } = await import('./setup/environment.mjs');
  return setupEnvironment(config.metadata.visual as VisualEnvironment);
}
