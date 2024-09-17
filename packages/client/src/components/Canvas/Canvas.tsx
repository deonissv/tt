import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { Tuple } from '@babylonjs/core/types';
import { Simulation } from '@client/src/simulation';
import { SimulationRoom } from '@client/src/simulation/SimulationRoom';
import { HUD, ProgressLoader, Spinner, useToast } from '@components';
import { RoomService } from '@services';
import type { RoomwDto } from '@shared/dto/rooms';
import { Loader, Logger, MimeDetector } from '@shared/playground';
import { MimeType } from '@shared/playground/Loader';
import { debounce, getB64URL } from '@shared/utils';
import type { CursorsPld } from '@shared/ws/payloads';
import { useNavigate } from 'react-router-dom';

export const Canvas: React.FC<{ roomCode: string }> = ({ roomCode }): React.ReactNode => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const simulationRoom = useRef<SimulationRoom>();
  const canvas = useRef<HTMLCanvasElement>(null);
  const clientId = useRef<string>('');
  const screenCursors = useRef<CursorsPld>({});
  const simulation = useRef<Simulation>();
  const loaded = useRef(false);
  const room = useRef<RoomwDto>();

  const [downloadProgress, setDownloadProgress] = useState<Tuple<number, 2> | null>(null);

  const [cursor, setCursor] = useState<[number, number]>([0, 0]);
  const [cursors, setCursors] = useState<CursorsPld>({});

  const init = useCallback(async (): Promise<SimulationRoom | null> => {
    RoomService.getRoom(roomCode)
      .then(r => {
        room.current = r;
      })
      .catch(() => addToast(`Failed to get room preview`));

    Loader.registartFileFetcher(async (url: string) => {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();

      const mime = MimeDetector.getMime(arrayBuffer) ?? MimeType.OBJ;
      const b64 = getB64URL(arrayBuffer);

      Logger.log(`Fetched file: ${url}`);
      return { url: b64, mime };
    });

    const sr = await SimulationRoom.init(
      canvas.current!,
      roomCode,
      setCursors,
      setDownloadProgress,
      onRoomClosed,
    ).catch(() => {
      addToast(`Failed to get room preview`);
      navigate('/games');
      return null;
    });

    // import('@babylonjs/inspector').then(inspector => inspector.Inspector.Show(sr.simulation.scene, {}));

    return sr;
  }, [roomCode]);

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

  const onRoomClosed = useCallback(() => {
    addToast('Room has been closed');
    navigate('/games');
  }, [addToast, navigate]);

  const onCloseRoom = useCallback(() => {
    simulationRoom.current?.closeRoom();
    onRoomClosed();
  }, [simulationRoom, onRoomClosed]);

  const onSetPickHeight = useMemo(
    () =>
      debounce((height: number) => {
        simulationRoom.current?.onSetPickHeight(height);
      }, 300),
    [],
  );

  const onSetRotateStep = useMemo(
    () =>
      debounce((step: number) => {
        simulationRoom.current?.onSetRotateStep(step);
      }, 300),
    [],
  );

  useEffect(() => {
    init()
      .then(sr => {
        if (!sr) return;

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

        loaded.current = true;

        if (downloadProgress && downloadProgress[0] !== downloadProgress[1]) {
          addToast(`Failed to load ${downloadProgress[0]}/${downloadProgress[1]} assets. Try to restart the room`);
        }

        return () => {
          canvas.current?.removeEventListener('pointermove', handlePointerMove);
          canvas.current?.removeEventListener('mousemove', handleMouseMove);
          sr.destructor();
        };
      })
      .catch(() => addToast(`Failed to join room`));
  }, []);

  useEffect(() => {
    return () => {
      simulationRoom.current?.destructor();
    };
  }, [simulationRoom]);

  useEffect(() => {
    updateCursors(cursor, cursors, screenCursors);
  }, [updateCursors, cursor, cursors, screenCursors]);

  return (
    <div className="w-full h-screen m-0 p-0 !overflow-hidden">
      <HUD
        onCloseRoom={onCloseRoom}
        room={room.current}
        onSetPickHeight={onSetPickHeight}
        onSetRotateStep={onSetRotateStep}
      />
      <div>
        {Object.entries(screenCursors.current).map(([id, [x, y]]) => (
          <div
            key={id}
            className="w-3 h-3 bg-green-500 fixed pointer-events-none"
            style={{ left: `${x}px`, top: `${y}px`, backgroundColor: `#${id.substring(id.length - 6)}` }}
          ></div>
        ))}
      </div>
      <canvas ref={canvas} className="w-full h-full m-0 p-0 !overflow-hidden !border-none" />
      {!loaded.current && (
        <div className="absolute top-0 left-0 w-full h-full bg-[#33334c] flex justify-center content-center flex-wrap z-10">
          <div className="w-[500px] h-[200px]">
            <Spinner />
            {downloadProgress && (
              <ProgressLoader title={'Starting room'} loaded={downloadProgress[0]} total={downloadProgress[1]} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
