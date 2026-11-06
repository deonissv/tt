import type { Browser, Page } from '@playwright/test';

import { expect, test } from '../test';
import { configureContext } from '../support/rendering';

test.use({ fixtureVariant: 'default', guestMode: 'none', waitForRoom: false });

// Anonymous visitors come from a fresh browser context; the suite never
// touches browser authentication storage directly.
const openAnonymousPage = async (browser: Browser, baseURL: string, browserErrors: string[]): Promise<Page> => {
  const context = await browser.newContext({ baseURL });
  await configureContext(context, browserErrors);
  return context.newPage();
};

const loginForm = (page: Page) => page.getByPlaceholder('Email', { exact: true });

// The harness keeps one room per test through its automatic roomReady fixture,
// so an authenticated saves page always renders exactly one room card whose
// primary action is labeled Create (a games list card would say Play).
const savesRoomCard = (page: Page) => page.getByRole('button', { name: 'Create', exact: true });

test.describe('client routing and authentication through the data router', () => {
  test(
    'protected URLs render the login form in place for anonymous visitors',
    { tag: ['@behavior:routing'] },
    async ({ browser, baseURL, browserErrors }) => {
      const page = await openAnonymousPage(browser, baseURL!, browserErrors);
      try {
        await page.goto('/saves', { waitUntil: 'commit' });
        await expect(loginForm(page), 'the login form replaces the protected page').toBeVisible();
        await expect(page).toHaveURL(/\/saves\/?$/);
        await expect(
          page.getByRole('button', { name: 'Join Room' }),
          'protected pages keep the header layout',
        ).toBeVisible();

        await page.goto('/room/00000000-0000-0000-0000-000000000000', { waitUntil: 'commit' });
        await expect(loginForm(page), 'the room route also renders the login form in place').toBeVisible();
        await expect(
          page.getByRole('button', { name: 'Join Room' }),
          'the room route renders outside the header layout',
        ).toHaveCount(0);
      } finally {
        await page.context().close();
      }
    },
  );

  test(
    'a successful login on a protected URL returns to the requested page',
    { tag: ['@behavior:routing', '@behavior:auth'] },
    async ({ browser, baseURL, browserErrors, dataset }) => {
      const page = await openAnonymousPage(browser, baseURL!, browserErrors);
      try {
        await page.goto('/saves', { waitUntil: 'commit' });
        await loginForm(page).fill(dataset.authorLogin.email);
        await page.getByPlaceholder('Password', { exact: true }).fill(dataset.authorLogin.password);
        await page.getByRole('button', { name: 'Login', exact: true }).click();

        // The protected-page login flow reloads in place after authenticating.
        await expect(page).toHaveURL(/\/saves\/?$/);
        await expect(savesRoomCard(page), 'the requested page renders after the reload').toBeVisible();
        await expect(loginForm(page)).toHaveCount(0);
      } finally {
        await page.context().close();
      }
    },
  );

  test(
    '/games/new matches the creation route while /games/:gameCode matches the edit route',
    { tag: ['@behavior:routing'] },
    async ({ player, dataset }) => {
      const { page } = player;

      await page.goto('/games/new', { waitUntil: 'commit' });
      await expect(page.getByRole('heading', { name: 'Add game' })).toBeVisible();

      await page.goto(`/games/${dataset.gameCode}`, { waitUntil: 'commit' });
      await expect(page.getByRole('heading', { name: 'Modify game' })).toBeVisible();
    },
  );

  test(
    'unknown paths render the not-found page with a working way back',
    { tag: ['@behavior:routing'] },
    async ({ player }) => {
      const { page } = player;

      for (const path of ['/not-found', '/some/unknown/path']) {
        await page.goto(path, { waitUntil: 'commit' });
        await expect(page.getByText('Oops! Page not found')).toBeVisible();
        await page.getByRole('button', { name: 'Back' }).click();
        await expect(page).toHaveURL(/\/games\/?$/);
      }
    },
  );

  test(
    'the root path shows the games list for authenticated visitors',
    { tag: ['@behavior:routing'] },
    async ({ player }) => {
      const { page } = player;

      await page.goto('/', { waitUntil: 'commit' });
      await expect(page.getByText('New', { exact: true }), 'the games list renders at the root').toBeVisible();
      await expect(loginForm(page)).toHaveCount(0);
    },
  );

  test(
    'logout keeps protected content inaccessible and updates the header',
    { tag: ['@behavior:routing', '@behavior:auth'] },
    async ({ player }) => {
      const { page } = player;

      await page.goto('/profile', { waitUntil: 'commit' });
      await page.getByRole('button', { name: 'Logout' }).click();
      await expect(page).toHaveURL(/\/games\/?$/);
      await expect(loginForm(page), 'logout immediately replaces protected content with login').toBeVisible();
      await expect(page.getByText('New', { exact: true }), 'the games list must not render after logout').toHaveCount(
        0,
      );

      await page.getByRole('button', { name: 'Saves', exact: true }).click();
      await expect(page).toHaveURL(/\/saves\/?$/);
      await expect(loginForm(page), 'SPA navigation stays protected after logout').toBeVisible();
      await expect(savesRoomCard(page)).toHaveCount(0);

      await page.getByRole('button', { name: 'Profile', exact: true }).click();
      await expect(page).toHaveURL(/\/login\/?$/);
      await expect(loginForm(page), 'the header sends a logged-out visitor to login').toBeVisible();
    },
  );

  test(
    'expired sessions cannot reach protected content through SPA navigation or history',
    { tag: ['@behavior:routing', '@behavior:auth'] },
    async ({ player }) => {
      const { page } = player;

      await page.goto('/profile', { waitUntil: 'commit' });
      await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();

      // Expire the session without changing authentication storage or reloading.
      await page.clock.setFixedTime(new Date('2100-01-01T00:00:00Z'));
      await page.getByRole('button', { name: 'Saves', exact: true }).click();
      await expect(page).toHaveURL(/\/saves\/?$/);
      await expect(loginForm(page), 'navigation rechecks the expired session').toBeVisible();
      await expect(savesRoomCard(page)).toHaveCount(0);

      await page.goBack();
      await expect(page).toHaveURL(/\/profile\/?$/);
      await expect(loginForm(page), 'history navigation also rechecks the expired session').toBeVisible();
      await expect(page.getByRole('button', { name: 'Logout' })).toHaveCount(0);
    },
  );

  test('refresh and browser history work across SPA routes', { tag: ['@behavior:routing'] }, async ({ player }) => {
    const { page } = player;

    await page.goto('/saves', { waitUntil: 'commit' });
    await page.reload({ waitUntil: 'commit' });
    await expect(savesRoomCard(page), 'a direct refresh keeps the route').toBeVisible();

    await page.getByRole('button', { name: 'Join Room' }).click();
    await expect(page).toHaveURL(/\/join\/?$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/saves\/?$/);
    await page.goForward();
    await expect(page).toHaveURL(/\/join\/?$/);
  });

  test(
    'a controlled route failure renders the error boundary and recovers',
    { tag: ['@behavior:routing'] },
    async ({ player, browserErrors }) => {
      const { page } = player;

      // Every access-token read fails until the test releases the failure.
      // A failure that fires only once is not enough: React retries a failed
      // concurrent render, so RequireAuth would recover on its own and the
      // route error boundary would never engage. RequireAuth reads the token
      // while rendering, so the next protected-route render fails inside the
      // route tree until the release below.
      await page.addInitScript(() => {
        const nativeGetItem = Object.getOwnPropertyDescriptor(Storage.prototype, 'getItem')?.value as (
          this: Storage,
          key: string,
        ) => string | null;
        Storage.prototype.getItem = function (this: Storage, key: string) {
          const trackedWindow = window as unknown as { __routeFailureRecovered?: boolean };
          if (key === 'access_token' && !trackedWindow.__routeFailureRecovered) {
            throw new Error('Controlled route failure');
          }
          return nativeGetItem.call(this, key);
        };
      });
      await page.reload({ waitUntil: 'commit' });

      await expect(page.getByText('Something went wrong'), 'the route error boundary renders').toBeVisible();
      await expect(page.getByText('Controlled route failure'), 'error details must not leak into the UI').toHaveCount(
        0,
      );

      await page.evaluate(() => {
        (window as unknown as { __routeFailureRecovered?: boolean }).__routeFailureRecovered = true;
      });
      await page.getByRole('button', { name: 'Back to games' }).click();
      await expect(page).toHaveURL(/\/games\/?$/);
      await expect(
        page.getByRole('button', { name: 'Join Room' }),
        'the application recovers to a working route',
      ).toBeVisible();

      // The controlled failure intentionally surfaces as page errors and as
      // React Router's own render-error logging; both carry the marker text.
      // They are the expected signature of this test, not unexpected browser
      // errors, so they are removed from the collected browser errors.
      for (let index = browserErrors.length - 1; index >= 0; index -= 1) {
        if (browserErrors[index].includes('Controlled route failure')) browserErrors.splice(index, 1);
      }
    },
  );
});
