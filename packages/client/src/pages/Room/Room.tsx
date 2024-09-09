import { Canvas } from '@components';
import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const Room: React.FC = (): React.ReactNode => {
  const { roomCode } = useParams();
  const navigate = useNavigate();

  const roomCodeGuard = useCallback(() => {
    if (!roomCode) {
      navigate('/not-found');
    }
    return roomCode!;
  }, []);

  return <Canvas roomId={roomCodeGuard()} />;
};
