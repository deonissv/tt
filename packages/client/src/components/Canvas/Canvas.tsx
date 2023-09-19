import { useRef, useEffect, useCallback, useState } from 'react';
import Playground from '../../playground';
import { roomService } from '../../services/room.service';

import { PlaygroundState, WS } from '@shared/index';

const NICKNAME = 'zxc';

const Canvas: React.FC<{ roomId: string }> = ({ roomId }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [cursors, setCursors] = useState<{ [key: string]: { x: number; y: number } }>({});

  let ws: WebSocket;

  const babylonInit = async (playgroundState: PlaygroundState) => {
    const playground = await Playground.init(canvas.current as HTMLCanvasElement);
    await playground.test();
    await playground.loadModel(playgroundState.actortStates[0].model);
    return playground;
  };

  const init = useCallback(async () => {
    const [_ws, _id, pgState] = await roomService.connect(roomId, NICKNAME);
    ws = _ws;

    await babylonInit(pgState);

    ws.addEventListener('message', event => {
      const message = WS.read(event);

      switch (message.type) {
        case WS.UPDATE:
          break;
        case WS.CURSOR:
          setCursors(prev => ({ ...prev, ...message.payload }));
          break;
        default:
          break;
      }
    });
  }, []);

  const sendCursor = (x: number, y: number) => {
    WS.send(ws, { type: WS.CURSOR, payload: { x, y } });
  };

  useEffect(() => {
    init()
      .then(() => {
        document.addEventListener('mousemove', event => {
          sendCursor(event.clientX, event.clientY);
        });
      })
      .catch(console.error);
  }, [init]);

  return (
    <>
      {Object.entries(cursors).map(([id, { x, y }]) => (
        <div
          key={id}
          className="w-3 h-3 bg-green-500 absolute"
          style={{ left: `${x}px`, top: `${y}px`, backgroundColor: `#${id.substring(id.length - 6)}` }}
        ></div>
      ))}
      <canvas ref={canvas} className="w-full h-full !border-0 !hover:border-0 !foucs:border-0" />
    </>
  );
};

export default Canvas;
