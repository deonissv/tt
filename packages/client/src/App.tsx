import { RouterProvider } from 'react-router-dom';

import { ToastProvider } from './components';
import { router } from './router';
import { StoreProvider } from './Store';

// StoreProvider and ToastProvider sit outside the data router so their state
// survives every navigation, matching the pre-migration placement around the
// route tree.
export const App = (): React.ReactNode => {
  return (
    <StoreProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </StoreProvider>
  );
};
