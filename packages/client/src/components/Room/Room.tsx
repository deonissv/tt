import { useParams } from 'react-router-dom';

export default () => {
  const { roomId } = useParams();

  return <div>Room {roomId}</div>;
};
