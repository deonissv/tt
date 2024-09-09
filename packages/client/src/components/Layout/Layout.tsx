import { Header } from '@components';
import { Outlet } from 'react-router-dom';

export const Layout: React.FC = (): React.ReactNode => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};
