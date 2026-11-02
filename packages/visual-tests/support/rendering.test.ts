import { EventEmitter } from 'node:events';
import type { BrowserContext } from '@playwright/test';
import { expect, it, vi } from 'vitest';
import { configureContext } from './rendering';

function context() {
  const events = new EventEmitter();
  const scripts: (() => void)[] = [];
  return {
    events,
    scripts,
    context: Object.assign(events, {
      addInitScript: (script: () => void) => {
        scripts.push(script);
        return Promise.resolve();
      },
    }) as unknown as BrowserContext,
  };
}

it('selects the WebGL browser platform without replacing native animation scheduling', async () => {
  const fixture = context();
  await configureContext(fixture.context, []);
  const frame = vi.fn();
  const cancel = vi.fn();
  const window = { requestAnimationFrame: frame, cancelAnimationFrame: cancel };
  const navigator = { gpu: {} };
  vi.stubGlobal('navigator', navigator);
  vi.stubGlobal('window', window);
  try {
    for (const script of fixture.scripts) script();
  } finally {
    vi.unstubAllGlobals();
  }
  expect(navigator.gpu).toBeUndefined();
  expect(window.requestAnimationFrame).toBe(frame);
  expect(window.cancelAnimationFrame).toBe(cancel);
});

it('records public browser errors and failed requests while ignoring ordinary console messages', async () => {
  const fixture = context();
  const errors: string[] = [];
  await configureContext(fixture.context, errors);
  const page = new EventEmitter();
  fixture.events.emit('page', page);
  page.emit('pageerror', new Error('Unhandled scene error'));
  page.emit('console', { type: () => 'log', text: () => 'ordinary output' });
  page.emit('console', { type: () => 'error', text: () => 'Missing texture' });
  page.emit('requestfailed', {
    method: () => 'GET',
    url: () => 'http://assets/missing.png',
    failure: () => ({ errorText: 'Failed' }),
  });
  expect(errors).toEqual(['Unhandled scene error', 'Missing texture', 'GET http://assets/missing.png: Failed']);
});
