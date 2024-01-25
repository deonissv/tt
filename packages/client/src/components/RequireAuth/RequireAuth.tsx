import IProps from '@components/IProps';
import { AuthService } from '../../services/auth.service';
import Login from 'client/src/pages/Login/Login';
import { FC, useCallback, useState } from 'react';

const RequireAuth: FC<IProps> = ({ children }) => {
  const authorized = AuthService.authorized();
  // const [, updateState] = useState({});
  // const forceUpdate = useCallback(() => updateState({}), []);
  const forceUpdate = useCallback(() => {
    window.location.reload();
  }, []);

  if (!authorized) {
    return <Login onLogin={forceUpdate} />;
  }
  return children;
};

export default RequireAuth;
