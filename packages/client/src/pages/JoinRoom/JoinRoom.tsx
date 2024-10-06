import { Button, Input } from '@components';
import { isUUIDv4 } from '@tt/utils';
import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const JoinRoom: React.FC = (): React.ReactNode => {
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();

  const onJoinRoom = () => {
    if (isUUIDv4(roomCode)) {
      navigate(`/room/${roomCode}`);
    }
  };

  return (
    <div className="flex justify-center w-full">
      <div className="bg-light-blue w-[1000px] p-11">
        <Input
          placeholder="Enter room code"
          type="text"
          value={roomCode}
          onChange={e => setRoomCode((e.target as HTMLInputElement).value)}
          valitaion={value => value === undefined || value === '' || (typeof value === 'string' && isUUIDv4(value))}
        />
        <Button className="w-full" onClick={onJoinRoom}>
          <p className="font-bold uppercase tracking-wide text-sm">Join Room</p>
        </Button>
      </div>
    </div>
  );
};
