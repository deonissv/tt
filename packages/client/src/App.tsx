import { Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { Layout, RequireAuth, ToastProvider } from './components';

import { CreateGame, GamesList, JoinRoom, Login, NotFoundPage, Profile, Room, Saves, Signup } from './pages';
import { StoreProvider } from './Store';

export const App = () => {
  const navigate = useNavigate();

  const onLogin = () => {
    navigate('/games');
  };

  return (
    <StoreProvider>
      <ToastProvider>
        <Routes>
          <Route path="room/:roomCode" element={RequireAuth({ children: <Room /> })} />
          <Route element={<Layout />}>
            <Route path="login" element={<Login onLogin={onLogin} />} />
            <Route path="signup" element={<Signup />} />
            <Route element={RequireAuth({ children: <Outlet /> })}>
              <Route path="profile" element={<Profile />} />
              <Route path="join" element={<JoinRoom />} />
              <Route path="saves" element={<Saves />} />
              <Route path="games">
                <Route index element={<GamesList />} />
                <Route path="new" element={<CreateGame />} />
                <Route path=":gameCode" element={<CreateGame />} />
              </Route>
              <Route path="*" element={<GamesList />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>
        </Routes>
      </ToastProvider>
    </StoreProvider>
  );
};
