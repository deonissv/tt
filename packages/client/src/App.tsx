import Layout from '@components/Layout/Layout';
import RequireAuth from '@components/RequireAuth/RequireAuth';
import { Logger } from '@shared/playground';
import NotFoundPage from 'client/src/pages/NotFoundPage';
import { Route, Routes } from 'react-router-dom';
import { CreateGame } from './pages/CreateGame/CreateGame';
import CreateRoom from './pages/CreateRoom';
import JoinRoom from './pages/JoinRoom';
import Login from './pages/Login/Login';
import Profile from './pages/Profile/Profile';
import Room from './pages/Room';
import Signup from './pages/Signup/Signup';

Logger.register(console);

const App = () => {
  const protectedRoutes = [
    {
      path: 'room/:roomCode',
      element: <Room />,
    },
    {
      path: 'join',
      element: <JoinRoom />,
    },
    {
      path: 'new',
      element: <CreateGame />,
    },
    {
      path: 'profile',
      element: <Profile />,
    },
    {
      path: '',
      element: <CreateRoom />,
    },
  ];

  return (
    <Routes>
      <Route path="room/:roomCode" element={<Room />} />
      <Route element={<Layout />}>
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="profile" element={<Profile />} />
        {protectedRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={<RequireAuth>{element}</RequireAuth>} />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default App;
