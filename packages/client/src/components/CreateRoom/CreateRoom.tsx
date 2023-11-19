import { useState } from 'react';
import * as MUI from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { roomService } from '@services/room.service';
import { PlaygroundStateSave } from '@shared/index';
import { useAppDispatch } from '../../store/store';
import { setNickname as setNickname_ } from '../../store/nickname';

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
    const roomId = await roomService.createRoom(pgStateSave);

    dispatch(setNickname_(nickname));
    localStorage.setItem('tt-nickname', nickname);
    navigate(`/room/${roomId}`);
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

export default CreateRoom;

// read PGState from file
// document.getElementById('game-cfg')!.addEventListener('change', (event: Event) => {
//   const target = event.target! as HTMLInputElement;
//   const file = target.files![0];
//   const reader = new FileReader();

//   reader.readAsText(file);
//   reader.onload = async event => {
//     let result = event.target!.result;
//     if (result instanceof ArrayBuffer) {
//       // TODO check when event.target.result returns ArrayBuffer
//       const enc = new TextDecoder();
//       result = enc.decode(result);
//     }
//     const content: SaveState = JSON.parse(result as string);
//     const models = await parseTTSModes(content);
//     models.forEach(model => {
//       pg.loadModel(model);
//     });
//   };
// });

// const parseTTSModes = async (saveState: SaveState): Promise<Model[]> => {
//   const models: Model[] = [];
//   saveState.ObjectStates.forEach(objectState => {
//     const url = objectState.CustomMesh?.MeshURL;
//     if (url) {
//       models.push({
//         meshURL: url,
//         diffuseURL: objectState.CustomMesh?.DiffuseURL,
//         colliderURL: objectState.CustomMesh?.ColliderURL,
//       });
//     }
//   });
//   return models;
// };
