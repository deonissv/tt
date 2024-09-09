import { Login } from '@client/src/pages';
import type { IProps } from '@components';
import { AuthService } from '@services';
import { useCallback } from 'react';

export const RequireAuth: React.FC<IProps> = ({ children }) => {
  const authorized = AuthService.authorized();
  const forceUpdate = useCallback(() => {
    window.location.reload();
  }, []);

  if (!authorized) {
    return <Login onLogin={forceUpdate} />;
  }
  return children;
};
