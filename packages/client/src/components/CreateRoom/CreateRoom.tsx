import * as MUI from '@mui/material';
import { useState } from 'react';
import { roomService } from '../../services/room.service';
import { PlaygroundState } from '@tt/shared';

export default () => {
  const [nickname, setNickname] = useState('');

  const pgState: PlaygroundState = {
    actortStates: [
      {
        name: 'Munchkin',
        guid: '1',
        model: {
          meshURL: 'http://wb.yanrishatum.ru/raven81/Munchkin/Accessories/MunchkinFig_v5.obj',
          diffuseURL: 'http://wb.yanrishatum.ru/raven81/Munchkin/Accessories/MunchkinFig_v5.tex.png',
          colliderURL: 'http://wb.yanrishatum.ru/raven81/Munchkin/Accessories/MunchkinFig_v5.compcoll.obj',
        },
      },
    ],
  };

  const onCreateRoom = async () => {
    const roomId = await roomService.createRoom(pgState);
    console.log(roomId);
    const ws = await roomService.connect(roomId);
  };

  return (
    <MUI.Unstable_Grid2 container justifyContent="center">
      <MUI.Unstable_Grid2 xs={6}>
        <MUI.Box className="m-9">
          <input
            type="text"
            placeholder="Enter nickname"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            className="mb-3 w-full p-3 border-2 border-black rounded"
          />
          <MUI.Button variant="contained" color="primary" fullWidth onClick={onCreateRoom}>
            Create Room
          </MUI.Button>
        </MUI.Box>
      </MUI.Unstable_Grid2>
    </MUI.Unstable_Grid2>
  );
};
