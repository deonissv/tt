import { Inspector } from '@babylonjs/inspector';
import type { ServerBase } from '@server/src/simulation/actors';
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
        onPickItem: async actor => {
          console.log('PICK_ITEM', actor.guid);
          const newActor = await actor?.pickItem();

          sim._pickedActor = newActor;
          //  = newActor;
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/ban-ts-comment
        // @ts-ignore
        onMoveActor: (a: ServerBase, pos) => {
          console.log('onMoveActor', pos);
          a.move(...pos);
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/ban-ts-comment
        // @ts-ignore
        onPickActor: (a: ServerBase) => a.pick('id'),
        // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/ban-ts-comment
        // @ts-ignore
        onReleaseActor: (a: ServerBase) => a.release(),
        // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/ban-ts-comment
        // @ts-ignore
        onRoll: (a: ServerBase) => a.roll(),
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
      type: 'CircleGlass',
    });

    await ServerActorBuilder.buildDie4({
      type: ActorType.DIE4,
      guid: 'die4',
      name: 'die4',
      rotationValues: [
        {
          value: 1,
          rotation: [0, 0, 0],
        },
        {
          value: 2,
          rotation: [0, 0, 90],
        },
        {
          value: 3,
          rotation: [0, 0, 180],
        },
        {
          value: 4,
          rotation: [0, 0, 270],
        },
      ],
    });

    // await ServerActorBuilder.buildCard({
    //   type: ActorType.CARD,
    //   guid: 'card',
    //   name: 'card',
    //   faceURL:
    //     'https://steamusercontent-a.akamaihd.net/ugc/429358847306551738/839B87FAD61C79259B71F7E162385C3090F00810/',
    //   backURL:
    //     'https://steamusercontent-a.akamaihd.net/ugc/429358847306551738/839B87FAD61C79259B71F7E162385C3090F00810/',
    //   rows: 0,
    //   cols: 0,
    //   sequence: 0,
    // });

    // new Card(
    //   {
    //     type: ActorType.CARD,
    //     guid: 'card',
    //     name: 'card',
    //     faceURL:
    //       'https://steamusercontent-a.akamaihd.net/ugc/429358847306551738/839B87FAD61C79259B71F7E162385C3090F00810/',
    //     backURL:
    //       'https://steamusercontent-a.akamaihd.net/ugc/429358847306551738/839B87FAD61C79259B71F7E162385C3090F00810/',
    //   },
    //   CreateBox('box', { width: 2, height: 0.1, depth: 1 }),
    //   new Texture('https://i.imgur.com/1I4Z1Zb.png'),
    //   new Texture('https://i.imgur.com/1I4Z1Zb.png'),
    // );

    // await ServerActorBuilder.buildBag({
    //   guid: 'bag',
    //   name: 'bag',
    //   type: ActorType.BAG,
    //   containedObjects: [],
    // });

    // await ServerActorBuilder.buildDie8({
    //   type: ActorType.DIE8,
    //   guid: 'die12',
    //   name: 'die12',
    //   rotationValues: [
    //     {
    //       value: 1,
    //       rotation: [-33, 0, 90],
    //     },
    //     {
    //       value: 2,
    //       rotation: [-33, 0, 180],
    //     },
    //     {
    //       value: 3,
    //       rotation: [33, 180, -180],
    //     },
    //     {
    //       value: 4,
    //       rotation: [33, 180, 90],
    //     },
    //     {
    //       value: 5,
    //       rotation: [33, 180, -90],
    //     },
    //     {
    //       value: 6,
    //       rotation: [33, 180, 0],
    //     },
    //     {
    //       value: 7,
    //       rotation: [-33, 0, 0],
    //     },
    //     {
    //       value: 8,
    //       rotation: [-33, 0, -90],
    //     },
    //   ],
    // });

    // await ServerActorBuilder.buildDeck({
    //   type: ActorType.DECK,
    //   guid: 'deck',
    //   name: 'deck',
    //   cards: [
    //     {
    //       type: ActorType.CARD,
    //       guid: 'card1',
    //       name: 'card1',
    //       faceURL:
    //         'https://steamusercontent-a.akamaihd.net/ugc/429358847306551738/839B87FAD61C79259B71F7E162385C3090F00810/',
    //       backURL:
    //         'https://steamusercontent-a.akamaihd.net/ugc/429358847306551738/839B87FAD61C79259B71F7E162385C3090F00810/',
    //       rows: 0,
    //       cols: 0,
    //       sequence: 0,
    //     },
    //     {
    //       type: ActorType.CARD,
    //       guid: 'card2',
    //       name: 'card2',
    //       faceURL:
    //         'https://steamusercontent-a.akamaihd.net/ugc/429358847306551738/839B87FAD61C79259B71F7E162385C3090F00810/',
    //       backURL:
    //         'https://steamusercontent-a.akamaihd.net/ugc/429358847306551738/839B87FAD61C79259B71F7E162385C3090F00810/',
    //       rows: 0,
    //       cols: 0,
    //       sequence: 0,
    //     },
    //     {
    //       type: ActorType.CARD,
    //       guid: 'card3',
    //       name: 'card3',
    //       faceURL:
    //         'https://steamusercontent-a.akamaihd.net/ugc/429358847306551738/839B87FAD61C79259B71F7E162385C3090F00810/',
    //       backURL:
    //         'https://steamusercontent-a.akamaihd.net/ugc/429358847306551738/839B87FAD61C79259B71F7E162385C3090F00810/',
    //       rows: 0,
    //       cols: 0,
    //       sequence: 0,
    //     },
    //   ],
    // });

    // new TileStack(
    //   {
    //     type: ActorType.TILE_STACK,
    //     tileType: 0,
    //     faceURL: 'https://i.imgur.com/1I4Z1Zb.png',
    //     guid: 'tileStack',
    //     name: 'tileStack',
    //     size: 5,
    //   },
    //   CreateBox('box', { size: 1 }),
    // );

    // new ServerBase(
    //   { type: ActorType.ACTOR, guid: 'box', name: 'box', transformation: { position: [0, 5, 0] } },
    //   CreateBox('box', { size: 1 }),
    // );

    // new ServerBase(
    //   { type: ActorType.ACTOR, guid: 'box1', name: 'box1', transformation: { position: [5, 5, 0] } },
    //   CreateBox('box', { size: 1 }),
    // );

    // new ServerBase(
    //   { type: ActorType.ACTOR, guid: 'box2', name: 'box2', transformation: { position: [0, 5, 5] } },
    //   CreateBox('box', { size: 1 }),
    // );

    // new ServerBase(
    //   { type: ActorType.ACTOR, guid: 'box3', name: 'box3', transformation: { position: [10, 5, 10] } },
    //   CreateBox('box', { size: 1 }),
    // );

    // new ServerBase(
    //   { type: ActorType.ACTOR, guid: 'box4', name: 'box4', transformation: { position: [10, 5, -10] } },
    //   CreateBox('box', { size: 1 }),
    // );

    // new ServerBase(
    //   { type: ActorType.ACTOR, guid: 'box5', name: 'box5', transformation: { position: [-10, 5, -10] } },
    //   CreateBox('box', { size: 1 }),
    // );

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
