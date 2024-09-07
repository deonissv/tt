import Login from '@client/src/pages/Login/Login';
import type IProps from '@components/IProps';
import { AuthService } from '@services/auth.service';
import type { FC } from 'react';
import { useCallback } from 'react';

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
