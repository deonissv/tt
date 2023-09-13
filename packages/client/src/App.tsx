import CreateRoom from './components/CreateRoom';
import { Route, Routes } from 'react-router-dom';
import JoinRoom from './components/JoinRoom';
import Room from './components/Room';
import NotFoundPage from './components/NotFoundPage';

export default () => {
  return (
    <Routes>
      <Route path="" element={<JoinRoom />} />
      <Route path="create" element={<CreateRoom />} />
      <Route path="room/:roomId" element={<Room />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
