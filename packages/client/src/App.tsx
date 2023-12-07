import CreateRoom from './pages/CreateRoom';
import { Route, Routes } from 'react-router-dom';
import JoinRoom from './pages/JoinRoom';
import NotFoundPage from 'client/src/pages/NotFoundPage';
import Room from './pages/Room';
import Layout from '@components/Layout/Layout';
import Signup from './pages/Signup/Signup';
import Login from './pages/Login/Login';

const App = () => {
  return (
    <Routes>
      <Route path="room/:roomId" element={<Room />} />
      <Route element={<Layout />}>
        <Route path="" element={<CreateRoom />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="join" element={<JoinRoom />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default App;
