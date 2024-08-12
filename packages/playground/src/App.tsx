import { CreateBox } from '@babylonjs/core';
import { Inspector } from '@babylonjs/inspector';
import { ServerBase } from '@server/src/simulation/actors';
import { ServerActorBuilder } from '@server/src/simulation/serverActorBuilder';
import { ActorType } from '@shared/dto/states';
import { Logger } from '@shared/playground';
import { useCallback, useEffect, useRef } from 'react';
import { Simulation } from './simulation';

Logger.register(console);

const App = () => {
  const canvas = useRef<HTMLCanvasElement>(null);

  const init = useCallback(async (): Promise<Simulation> => {
    const sim = await Simulation.init(
      canvas.current!,
      {},
      {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onPickItem: () => {},
        // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/ban-ts-comment
        // @ts-ignore
        onMoveActor: (a: ServerBase, pos) => {
          console.log(pos);
          a.move(...pos);
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/ban-ts-comment
        // @ts-ignore
        onPickActor: (a: ServerBase) => a.pick(),
        // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/ban-ts-comment
        // @ts-ignore
        onReleaseActor: (a: ServerBase) => a.release(),
      },
    );

    await Simulation.prototype.initPhysics.call(sim);

    // const ground = new ServerBase(
    //   { type: ActorType.ACTOR, guid: 'ground', name: 'ground' },
    //   CreateBox('ground', { width: 200, height: 0.1, depth: 200 }),
    // );
    // ground.physicsBody?.setMotionType(PhysicsMotionType.ANIMATED);
    // ground.pickable = false;
    // ground.__model.isVisible = true;

    await ServerActorBuilder.buildTable({
      type: 'Poker',
    });

    new ServerBase(
      { type: ActorType.ACTOR, guid: 'box', name: 'box', transformation: { position: [0, 5, 0] } },
      CreateBox('box', { size: 1 }),
    );

    new ServerBase(
      { type: ActorType.ACTOR, guid: 'box1', name: 'box1', transformation: { position: [5, 5, 0] } },
      CreateBox('box', { size: 1 }),
    );

    new ServerBase(
      { type: ActorType.ACTOR, guid: 'box2', name: 'box2', transformation: { position: [0, 5, 5] } },
      CreateBox('box', { size: 1 }),
    );

    new ServerBase(
      { type: ActorType.ACTOR, guid: 'box3', name: 'box3', transformation: { position: [10, 5, 10] } },
      CreateBox('box', { size: 1 }),
    );

    new ServerBase(
      { type: ActorType.ACTOR, guid: 'box4', name: 'box4', transformation: { position: [10, 5, -10] } },
      CreateBox('box', { size: 1 }),
    );

    new ServerBase(
      { type: ActorType.ACTOR, guid: 'box5', name: 'box5', transformation: { position: [-10, 5, -10] } },
      CreateBox('box', { size: 1 }),
    );

    Inspector.Show(sim.scene, {});

    return sim;
  }, [canvas]);

  useEffect(() => {
    init()
      // eslint-disable-next-line no-console
      .catch(console.error);
  }, [init]);

  return <canvas ref={canvas} className="w-full h-full !border-0 !hover:border-0 !foucs:border-0" />;
};

export default App;
