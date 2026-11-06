import { matchRoutes, type RouteObject } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

// Characterization of the pre-migration route tree declared in
// packages/client/src/App.tsx with <Routes>/<Route> components, mirrored here
// as plain route objects. Matching only depends on the path structure, so the
// elements are omitted and identified by `id` instead. The two sibling
// splat routes below reproduce the `*` -> GamesList and `*` -> NotFoundPage
// pair verbatim; this test records which one actually wins.
const currentTree: RouteObject[] = [
  { path: 'room/:roomCode', id: 'room' },
  {
    id: 'layout',
    children: [
      { path: 'login', id: 'login' },
      { path: 'signup', id: 'signup' },
      {
        id: 'protected',
        children: [
          { path: 'profile', id: 'profile' },
          { path: 'join', id: 'join' },
          { path: 'saves', id: 'saves' },
          {
            path: 'games',
            id: 'games',
            children: [
              { index: true, id: 'games-index' },
              { path: 'new', id: 'games-new' },
              { path: ':gameCode', id: 'games-edit' },
            ],
          },
          { path: '*', id: 'fallback-games' },
          { path: '*', id: 'fallback-not-found' },
        ],
      },
    ],
  },
];

// The data router configuration declared in packages/client/src/router/router.tsx,
// mirrored as plain route objects. Matching depends only on the path structure.
const dataRouterTree: RouteObject[] = [
  { path: '/room/:roomCode', id: 'room' },
  {
    id: 'layout',
    children: [
      { path: 'login', id: 'login' },
      { path: 'signup', id: 'signup' },
      {
        id: 'protected',
        children: [
          { index: true, id: 'games-index-root' },
          { path: 'profile', id: 'profile' },
          { path: 'join', id: 'join' },
          { path: 'saves', id: 'saves' },
          {
            path: 'games',
            id: 'games',
            children: [
              { index: true, id: 'games-index' },
              { path: 'new', id: 'games-new' },
              { path: ':gameCode', id: 'games-edit' },
            ],
          },
          { path: '*', id: 'fallback-not-found' },
        ],
      },
    ],
  },
];

describe.each([
  {
    name: 'characterized current route tree (App.tsx before the data router migration)',
    tree: currentTree,
    rootId: 'fallback-games',
    fallbackId: 'fallback-games',
  },
  {
    name: 'data router route tree (router/router.tsx after the migration)',
    tree: dataRouterTree,
    rootId: 'games-index-root',
    fallbackId: 'fallback-not-found',
  },
])('$name', ({ tree, rootId, fallbackId }) => {
  const matchedIds = (pathname: string): string[] =>
    matchRoutes(tree, pathname)?.map(({ route }) => route.id ?? '') ?? [];

  it('sends the root to the header layout, protected content, and the games list', () => {
    expect(matchedIds('/')).toEqual(['layout', 'protected', rootId]);
  });

  it('ranks the static /games/new route above :gameCode', () => {
    expect(matchedIds('/games/new')).toEqual(['layout', 'protected', 'games', 'games-new']);
  });

  it('maps /games/:gameCode to the edit route with the parameter preserved', () => {
    const matches = matchRoutes(tree, '/games/abc123');
    expect(matches?.map(({ route }) => route.id)).toEqual(['layout', 'protected', 'games', 'games-edit']);
    expect(matches?.at(-1)?.params.gameCode).toBe('abc123');
  });

  it('renders the room route outside the header layout with its parameter', () => {
    const matches = matchRoutes(tree, '/room/room-code');
    expect(matches?.map(({ route }) => route.id)).toEqual(['room']);
    expect(matches?.at(-1)?.params.roomCode).toBe('room-code');
  });

  it('keeps public pages outside the protected boundary', () => {
    expect(matchedIds('/login')).toEqual(['layout', 'login']);
    expect(matchedIds('/signup')).toEqual(['layout', 'signup']);
  });

  it('keeps protected pages inside the protected boundary', () => {
    expect(matchedIds('/profile')).toEqual(['layout', 'protected', 'profile']);
    expect(matchedIds('/join')).toEqual(['layout', 'protected', 'join']);
    expect(matchedIds('/saves')).toEqual(['layout', 'protected', 'saves']);
  });

  it('resolves unknown paths to the characterized fallback', () => {
    expect(matchedIds('/not-found')).toEqual(['layout', 'protected', fallbackId]);
    expect(matchedIds('/some/unknown/path')).toEqual(['layout', 'protected', fallbackId]);
  });

  it('falls back to the protected boundary for room URLs without a room code', () => {
    expect(matchedIds('/room/')).toEqual(['layout', 'protected', fallbackId]);
  });
});
