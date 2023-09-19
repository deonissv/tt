import { useParams } from 'react-router-dom';
import Canvas from '../Canvas';

export default () => {
  const { roomId } = useParams();

  return <>{roomId ? <Canvas roomId={roomId!} /> : <div>Room not found</div>}</>;
};
