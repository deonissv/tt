import { useRef, useEffect, useCallback, useState } from 'react';
import Playground from '../../playground';
import { roomService } from '@services/room.service';

import { PlaygroundStateSave, PlaygroundStateUpdate, WS } from '@shared/index';
import { useAppSelector } from '../../store/store';

const frameRate = 60;

const Canvas: React.FC<{ roomId: string }> = ({ roomId }): React.ReactNode => {
  const cursor: [number, number] = [0, 0];
  const canvas = useRef<HTMLCanvasElement>(null);
  const [cursors, setCursors] = useState<Record<string, number[]>>({});
  const nickname = useAppSelector(state => state.nickname.nickname);

  const babylonInit = async (pgStateSave: PlaygroundStateSave, ws: WebSocket) => {
    const playground = await Playground.init(canvas.current!, pgStateSave, ws);
    return playground;
  };

  const init = useCallback(async (): Promise<[WebSocket, string, Playground]> => {
    const [ws, id, pgState] = await roomService.connect(roomId, nickname);

    const pg = await babylonInit(pgState, ws);

    ws.addEventListener('message', event => {
      const message = WS.read(event);

      switch (message.type) {
        case WS.UPDATE: {
          const pgStateUpdate = message.payload;
          pg.update(pgStateUpdate);
          if (pgStateUpdate.cursorPositions) {
            pg.update(pgStateUpdate);
            setCursors(prev => ({ ...prev, ...pgStateUpdate.cursorPositions }));
          }
          break;
        }
        default:
          break;
      }
    });

    return [ws, id, pg];
  }, [nickname, roomId]);

  const sendUpdate = (ws: WebSocket, pgStateUpdate: PlaygroundStateUpdate) => {
    WS.send(ws, {
      type: WS.UPDATE,
      payload: pgStateUpdate,
    });
  };

  useEffect(() => {
    init()
      .then(([ws_, id]) => {
        canvas.current!.addEventListener('pointermove', event => {
          cursor[0] = event.clientX;
          cursor[1] = event.clientY;
        });

        console.log('setInterval');
        setInterval(() => {
          const pgStateUpdate: PlaygroundStateUpdate = { cursorPositions: { [id]: cursor } };
          sendUpdate(ws_, pgStateUpdate);
        }, 1000 / frameRate);
      })
      .catch(console.error);
  }, []);

  return (
    <>
      <div>
        {Object.entries(cursors).map(([id, [x, y]]) => (
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
