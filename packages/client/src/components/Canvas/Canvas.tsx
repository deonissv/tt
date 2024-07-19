import { useCallback, useEffect, useRef, useState } from 'react';

import { SimulationRoom } from '@client/src/simulation/SimulationRoom';
import { useAppSelector } from '../../store/store';

const Canvas: React.FC<{ roomId: string }> = ({ roomId }): React.ReactNode => {
  const simulationRoom = useRef<SimulationRoom>();
  const cursor = useRef<[number, number]>([0, 0]);
  const canvas = useRef<HTMLCanvasElement>(null);

  const [cursors, setCursors] = useState<Record<string, number[]>>({});
  const nickname = useAppSelector(state => state.nickname.nickname);

  const init = useCallback(async (): Promise<SimulationRoom> => {
    return await SimulationRoom.init(canvas.current!, roomId, nickname, cursor, setCursors);
  }, [cursor, nickname, roomId]);

  useEffect(() => {
    init()
      .then(sr => {
        simulationRoom.current = sr;
        canvas.current!.addEventListener('pointermove', event => {
          cursor.current[0] = event.clientX;
          cursor.current[1] = event.clientY;
        });
      })
      // eslint-disable-next-line no-console
      .catch(console.error);
  }, [init]);

  useEffect(() => {
    return () => {
      simulationRoom.current?.destructor();
    };
  }, [simulationRoom]);

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
