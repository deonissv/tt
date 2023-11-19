import { useParams } from 'react-router-dom';
import Canvas from '../Canvas';

const Room = () => {
  const { roomId } = useParams();

  return <>{roomId ? <Canvas roomId={roomId} /> : <div>Room not found</div>}</>;
};

export default Room;
