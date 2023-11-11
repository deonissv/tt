import { useRef, useEffect, useCallback, useState } from 'react';
import Playground from '../../playground';
import { roomService } from '@services/room.service';

import { PlaygroundStateSave, PlaygroundStateUpdate, WS } from '@shared/index';
import { useAppSelector } from 'client/src/store/store';

let ws: WebSocket;

const Canvas: React.FC<{ roomId: string }> = ({ roomId }) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [cursors, setCursors] = useState<WS.CursorsUpdate>({});
  const nickname = useAppSelector(state => state.root.nickname);

  const babylonInit = async (pgStateSave: PlaygroundStateSave) => {
    const playground = await Playground.init(canvas.current!, pgStateSave);
    // await playground.test();
    return playground;
  };

  const init = useCallback(async () => {
    const [_ws, , pgState] = await roomService.connect(roomId, nickname);
    ws = _ws;

    const pg = await babylonInit(pgState);

    ws.addEventListener('message', event => {
      const message = WS.read(event);

      switch (message.type) {
        case WS.UPDATE:
          pg.update(message.payload as PlaygroundStateUpdate);
          break;
        case WS.CURSOR:
          setCursors(prev => ({ ...prev, ...(message.payload as WS.CursorsUpdate) }));
          break;
        default:
          break;
      }
    });
  }, [nickname, roomId]);

  const sendCursor = (x: number, y: number) => {
    WS.send(ws, { type: WS.CURSOR, payload: { x, y } });
  };

  useEffect(() => {
    init()
      .then(() => {
        canvas.current!.addEventListener('pointermove', event => {
          sendCursor(event.clientX, event.clientY);
        });

        canvas.current!.addEventListener(WS.ACTOR_UPDATE, e => {
          const event = e as WS.PGUpdate;
          WS.send(ws, {
            type: WS.UPDATE,
            payload: event.detail,
          });
        });
      })
      .catch(console.error);
  }, [init]);

  return (
    <>
      <div>
        {Object.entries(cursors).map(([id, { x, y }]) => (
          <div
            key={id}
            className="w-3 h-3 bg-green-500 absolute pointer-events-none"
            style={{ left: `${x}px`, top: `${y}px`, backgroundColor: `#${id.substring(id.length - 6)}` }}
          ></div>
        ))}
      </div>
      <canvas ref={canvas} className="w-full h-full !border-0 !hover:border-0 !foucs:border-0" />
    </>
  );
};

export default Canvas;
