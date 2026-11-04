import type { NavigateOptions, To } from 'react-router-dom';

// This application uses BrowserRouter, whose navigation is synchronous.
declare module 'react-router' {
  interface NavigateFunction {
    (to: To, options?: NavigateOptions): void;
    (delta: number): void;
  }
}
