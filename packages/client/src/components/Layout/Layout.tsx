import Header from '@components/Header';
import { Outlet } from 'react-router-dom';

const Layout: React.FC = (): React.ReactNode => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
};

export default Layout;
