import Canvas from '@components/Canvas';
import { useParams } from 'react-router-dom';

const Room: React.FC = (): React.ReactNode => {
  const { roomId } = useParams();

  return <>{roomId ? <Canvas roomId={roomId} /> : <div>Room not found</div>}</>;
};

export default Room;
