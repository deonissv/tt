import { Outlet, createBrowserRouter } from 'react-router-dom';

import { Layout, RequireAuth } from '@components';

import { CreateGame, GamesList, JoinRoom, Login, NotFoundPage, Profile, Room, Saves, Signup } from '../pages';
import { RouteErrorBoundary } from './RouteErrorBoundary';

export const router = createBrowserRouter([
  {
    path: '/room/:roomCode',
    element: (
      <RequireAuth>
        <Room />
      </RequireAuth>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    element: <Layout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      {
        element: (
          <RequireAuth>
            <Outlet />
          </RequireAuth>
        ),
        children: [
          { index: true, element: <GamesList /> },
          { path: 'profile', element: <Profile /> },
          { path: 'join', element: <JoinRoom /> },
          { path: 'saves', element: <Saves /> },
          {
            path: 'games',
            children: [
              { index: true, element: <GamesList /> },
              { path: 'new', element: <CreateGame /> },
              { path: ':gameCode', element: <CreateGame /> },
            ],
          },
          // Deliberate fallback change, documented in the refactor notes: the
          // previous tree declared two sibling `*` routes where GamesList
          // always won and NotFoundPage never rendered (characterized in
          // packages/client/tests/routes.test.ts). Unknown paths now show the
          // not-found page, with its own acceptance case in the visual suite.
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
