import { Simulation } from '@client/src/simulation';
import { useCallback, useEffect, useRef } from 'react';

const Playground: React.FC = (): React.ReactNode => {
  const canvas = useRef<HTMLCanvasElement>(null);

  const init = useCallback(async (): Promise<Simulation> => {
    return await Simulation.init(
      canvas.current!,
      {},
      {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onPickItem: () => {},
      },
    );
  }, [canvas]);

  useEffect(() => {
    init()
      // eslint-disable-next-line no-console
      .catch(console.error);
  }, [init]);

  return <canvas ref={canvas} className="w-full h-full !border-0 !hover:border-0 !foucs:border-0" />;
};

export default Playground;
