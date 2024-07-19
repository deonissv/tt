import { Input } from '@components/Input';
import type React from 'react';

const JoinRoom: React.FC = (): React.ReactNode => {
  return (
    <div className="flex justify-center w-full">
      <div className="bg-light-blue w-2/5 p-11">
        <Input placeholder="Enter nickname" type="text" />
        <Input placeholder="Enter room code" type="text" />
        <button className="bg-blue w-full rounded-full mb-5 px-10 py-3 text-white float-right">Join Room</button>
      </div>
    </div>
  );
};

export default JoinRoom;
