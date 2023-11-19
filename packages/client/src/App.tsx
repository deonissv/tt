import CreateRoom from './components/CreateRoom';
import { Route, Routes } from 'react-router-dom';
import JoinRoom from './components/JoinRoom';
import Room from '@components/Room';
import NotFoundPage from '@components/NotFoundPage';

const App = () => {
  return (
    <Routes>
      <Route path="" element={<CreateRoom />} />
      <Route path="join" element={<JoinRoom />} />
      <Route path="room/:roomId" element={<Room />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
