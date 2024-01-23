import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { roomService } from '@services/room.service';
import { PlaygroundStateSave } from '@shared/index';
import { useAppDispatch } from '../../store/store';
import { setNickname as setNickname_ } from '../../store/nickname';
import { Input } from '@components/Input';

const CreateRoom = () => {
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const pgStateSave: PlaygroundStateSave = {
    actorStates: [
      {
        name: 'Munchkin',
        guid: '1',
        transformation: {
          position: [0, 50, 0],
        },
        mass: 1,
        model: {
          meshURL: 'http://localhost:5500/munch.obj',
        },
      },
      {
        name: 'Munchkin',
        guid: '2',
        transformation: {
          position: [0, 50, 4],
        },
        mass: 1,
        model: {
          meshURL: 'http://localhost:5500/munch.obj',
        },
      },
    ],
  };

  const onCreateRoom = async () => {
    const roomId = await roomService.createRoom({
      playground: pgStateSave,
    });

    dispatch(setNickname_(nickname));
    localStorage.setItem('tt-nickname', nickname);
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="flex justify-center w-full">
      <div className="bg-light-blue w-2/5 p-11">
        <Input placeholder="Enter nickname" type="text" value={nickname} onChange={e => setNickname(e.target.value)} />
        <button className="bg-blue w-full rounded-full mb-5 px-10 py-3 text-white float-right" onClick={onCreateRoom}>
          Create Room
        </button>
        <button className="bg-blue w-full rounded-full px-10 py-3 text-white float-right">*load json*</button>
      </div>
    </div>
  );
};

export default CreateRoom;
