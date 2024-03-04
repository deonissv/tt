import Canvas from '@components/Canvas';
import { useParams } from 'react-router-dom';

const Room: React.FC = (): React.ReactNode => {
  const { roomCode } = useParams();

  return <>{roomCode ? <Canvas roomId={roomCode} /> : <div>Room not found</div>}</>;
};

export default Room;
