import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import type { Tuple } from '@babylonjs/core';
import { Simulation } from '@client/src/simulation';
import { SimulationRoom } from '@client/src/simulation/SimulationRoom';
import { Context } from '@client/src/Store';
import type { CursorsPld } from '@shared/ws/payloads';

const Canvas: React.FC<{ roomId: string }> = ({ roomId }): React.ReactNode => {
  const simulationRoom = useRef<SimulationRoom>();
  const canvas = useRef<HTMLCanvasElement>(null);
  const clientId = useRef<string>('');
  const screenCursors = useRef<CursorsPld>({});
  const simulation = useRef<Simulation>();

  const [cursor, setCursor] = useState<[number, number]>([0, 0]);
  const [cursors, setCursors] = useState<CursorsPld>({});
  const [nickname] = useContext(Context).nickname;

  const init = useCallback(async (): Promise<SimulationRoom> => {
    const sr = await SimulationRoom.init(canvas.current!, roomId, nickname, setCursors);

    // import('@babylonjs/inspector').then(inspector => inspector.Inspector.Show(sr.simulation.scene, {}));

    return sr;
  }, [nickname, roomId]);

  const updateCursors = useCallback(
    (cursor: Tuple<number, 2>, cursors: CursorsPld, screenCursors: React.MutableRefObject<CursorsPld>) => {
      const sim = simulation.current;
      if (sim instanceof Simulation) {
        screenCursors.current = Object.entries(cursors).reduce(
          (acc, [id, c]) => {
            const screenCursor = sim.getScreenCursor(c);
            acc[id] = screenCursor;
            return acc;
          },
          {
            [clientId.current]: cursor,
          } as CursorsPld,
        );
      }
    },
    [],
  );

  useEffect(() => {
    init()
      .then(sr => {
        simulationRoom.current = sr;
        clientId.current = sr.clientId;
        simulation.current = sr.simulation;

        const handlePointerMove = () => {
          const screenCursor = [sr.simulation.scene.pointerX, sr.simulation.scene.pointerY] as Tuple<number, 2>;
          setCursor(screenCursor);
        };

        const handleMouseMove = () => {
          setCursor(sr.simulation.rawCursor);
        };

        canvas.current!.addEventListener('pointermove', handlePointerMove);
        canvas.current!.addEventListener('mousemove', handleMouseMove);

        return () => {
          canvas.current?.removeEventListener('pointermove', handlePointerMove);
          canvas.current?.removeEventListener('mousemove', handleMouseMove);
          sr.destructor();
        };
      })
      // eslint-disable-next-line no-console
      .catch(console.error);
  }, []);

  // useEffect(() => {
  //   const canv = canvas.current!;
  //   const handler = () => {
  //     updateCursors(cursor, cursors, screenCursors);
  //   };

  //   canv.addEventListener('scroll', handler);
  //   return () => {
  //     canv.removeEventListener('scroll', handler);
  //   };
  // });

  useEffect(() => {
    return () => {
      simulationRoom.current?.destructor();
    };
  }, [simulationRoom]);

  useEffect(() => {
    updateCursors(cursor, cursors, screenCursors);
  }, [updateCursors, cursor, cursors, screenCursors]);

  return (
    <>
      <div>
        {Object.entries(screenCursors.current).map(([id, [x, y]]) => (
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
