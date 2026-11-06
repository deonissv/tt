import type { IProps } from '@components';
import { AuthService } from '@services';
import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Login } from '../../pages';

export const RequireAuth: React.FC<IProps> = ({ children }) => {
  // The data router keeps this guard mounted between protected routes.
  // Subscribe to navigation so authorization is checked for each location.
  useLocation();
  const authorized = AuthService.authorized();
  const forceUpdate = useCallback(() => {
    window.location.reload();
  }, []);

  if (!authorized) {
    return <Login onLogin={forceUpdate} />;
  }
  return children;
};
