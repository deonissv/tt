// import CreateRoom from './components/CreateRoom';
// import { Route, Routes } from 'react-router-dom';
// import JoinRoom from './components/JoinRoom';
// import Room from '@components/Room';
// import NotFoundPage from '@components/NotFoundPage';

// const App = () => {
//   return (
//     <Routes>
//       <Route path="" element={<CreateRoom />} />
//       <Route path="join" element={<JoinRoom />} />
//       <Route path="room/:roomId" element={<Room />} />
//       <Route path="*" element={<NotFoundPage />} />
//     </Routes>
//   );
// };

// export default App;

import { useCallback, useEffect, useRef } from 'react';
import { PlaygroundStateSave } from '@shared/PlaygroundState';
import Playground from './playground';

const pgStateSave: PlaygroundStateSave = {
  actorStates: [
    // {
    //   name: 'Munchkin',
    //   guid: '1',
    //   transformation: {
    //     position: [3, 1, 3],
    //   },
    //   mass: 1,
    //   model: {
    //     meshURL: 'http://wb.yanrishatum.ru/raven81/Munchkin/Accessories/MunchkinFig_v5.obj',
    //     diffuseURL: 'http://wb.yanrishatum.ru/raven81/Munchkin/Accessories/MunchkinFig_v5.tex.png',
    //     colliderURL: 'http://wb.yanrishatum.ru/raven81/Munchkin/Accessories/MunchkinFig_v5.compcoll.obj',
    //   },
    // },
    {
      name: 'Munchkin',
      guid: '2',
      transformation: {
        position: [0, 1.076237, 0],
        rotation: [0, 0, 0],
        // scale: [0.7749998, 0.7749998, 0.7749998],
        // scale: [0.5, 0.5, 0.5],
      },
      mass: 1,
      model: {
        meshURL: 'http://wb.yanrishatum.ru/raven81/Munchkin/Accessories/MunchkinFig_v5.obj',
        diffuseURL: 'http://wb.yanrishatum.ru/raven81/Munchkin/Accessories/MunchkinFig_v5.tex.png',
        colliderURL: 'http://wb.yanrishatum.ru/raven81/Munchkin/Accessories/MunchkinFig_v5.compcoll.obj',
      },
    },
  ],
};

const App = () => {
  const canvas = useRef<HTMLCanvasElement>(null);

  const init = useCallback(async () => {
    await Playground.init(canvas.current!, pgStateSave);
  }, []);

  useEffect(() => {
    init().catch(console.error);
  }, [init]);

  return <canvas ref={canvas} className="w-full h-full !border-0 !hover:border-0 !foucs:border-0" />;
};

export default App;
