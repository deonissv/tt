import { RoomService } from '@services/room.service';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Simulation } from '@client/src/simulation';
import type { SimulationStateSave, SimulationStateUpdate } from '@shared/dto/simulation';
import { WS } from '@shared/ws';
import { useAppSelector } from '../../store/store';

const frameRate = 60;

const Canvas: React.FC<{ roomId: string }> = ({ roomId }): React.ReactNode => {
  const ws = useRef<WebSocket>();
  const updateSimStateInterval = useRef<NodeJS.Timeout>();

  const cursor: [number, number] = [0, 0];
  const canvas = useRef<HTMLCanvasElement>(null);
  const [cursors, setCursors] = useState<Record<string, number[]>>({});
  const nickname = useAppSelector(state => state.nickname.nickname);

  const babylonInit = async (simStateSave: SimulationStateSave) => {
    const playground = await Simulation.init(canvas.current, simStateSave);
    return playground;
  };

  const init = useCallback(async (): Promise<[string, Simulation]> => {
    const [_ws, id, simState] = await RoomService.connect(roomId, nickname);
    ws.current = _ws;

    const pg = await babylonInit(simState);

    ws.current.addEventListener('message', event => {
      const message = WS.read(event);

      switch (message.type) {
        case WS.UPDATE: {
          const pgStateUpdate = message.payload;
          pg.update(pgStateUpdate);
          if (pgStateUpdate.cursorPositions) {
            // pg.update(pgStateUpdate);
            setCursors(prev => ({ ...prev, ...pgStateUpdate.cursorPositions }));
          }
          break;
        }
        default:
          break;
      }
    });

    return [id, pg];
  }, [nickname, roomId]);

  const sendUpdate = (simStateUpdate: SimulationStateUpdate) => {
    // ws.current &&
    //   WS.send(ws.current, {
    //     type: WS.UPDATE,
    //     payload: pgStateUpdate,
    //   });
  };

  useEffect(() => {
    init()
      .then(([id]) => {
        canvas.current!.addEventListener('pointermove', event => {
          cursor[0] = event.clientX;
          cursor[1] = event.clientY;
        });

        canvas.current!.addEventListener('onDrag', event => {
          const pgStateUpdate = (event as CustomEvent).detail as SimulationStateUpdate;
          WS.send(ws.current!, {
            type: WS.UPDATE,
            payload: pgStateUpdate,
          });
        });

        updateSimStateInterval.current = setInterval(() => {
          const pgStateUpdate: SimulationStateUpdate = { cursorPositions: { [id]: cursor } };
          sendUpdate(pgStateUpdate);
        }, 1000 / frameRate);
      })
      // eslint-disable-next-line no-console
      .catch(console.error);
  }, []);

  useEffect(() => {
    return () => {
      updateSimStateInterval && clearInterval(updateSimStateInterval.current);
      ws.current?.close();
    };
  }, [ws, updateSimStateInterval]);

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
