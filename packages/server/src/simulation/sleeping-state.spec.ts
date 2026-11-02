import { CreateBox, CreatePlane, Logger } from '@babylonjs/core';
import { ActorType, type CardState } from '@tt/states';
import { initHavok } from '../utils';
import { ServerBase } from './actors/serverBase';
import { Simulation } from './simulation';

let simulation: Simulation;

beforeAll(async () => {
  Logger.LogLevels = 0;
  await initHavok();
});

beforeEach(() => {
  simulation = new Simulation({ gravity: 4.9 });
  simulation.initPhysics(4.9);
  vi.spyOn(simulation.engine, 'getDeltaTime').mockReturnValue(1000 / 60);
  const felt = CreatePlane('felt', { width: 56.24, height: 36.33 }, simulation.scene);
  felt.rotation.x = Math.PI / 2;
  felt.position.y = 0.85;
  const table = new ServerBase({ type: ActorType.ACTOR, guid: '#felt', name: '#felt' }, felt);
  table.lock();
});

afterEach(() => {
  simulation.engine.dispose();
  vi.restoreAllMocks();
});

function card(sleeping?: boolean, y = 0.8486167788505554): ServerBase<CardState> {
  const state: CardState = {
    type: ActorType.CARD,
    guid: 'saved-card',
    name: 'saved-card',
    faceURL: '',
    backURL: '',
    cols: 10,
    rows: 7,
    sequence: 7,
    transformation: {
      scale: [1.25768793, 1, 1.25768793],
      position: [8.993063926696777, y, 5.222645282745361],
      rotation: [-0.003524586255626609, 0.0010362771567424287, 0.00009460074582909024],
    },
  };
  if (sleeping !== undefined) Object.assign(state, { sleeping });
  return new ServerBase(state, CreateBox('card', { width: 2.000078, height: 0.010206, depth: 3.200662 }));
}

function render(frames = 240) {
  for (let frame = 0; frame < frames; frame++) simulation.scene.render();
}

it('restores a sleeping card at its saved contact pose without dropping it through the felt', () => {
  const actor = card(true);
  const saved = actor.transformation;
  render();
  expect(actor.transformation).toEqual(saved);
  expect(simulation.toState().actorStates?.[0]).toMatchObject({ sleeping: true });
});

it('wakes a restored card when picked and saves its current activation state', () => {
  const actor = card(true);
  render();
  actor.pick('player', 2);
  render(60);
  expect(actor.position.y).toBeGreaterThan(1);
  expect(simulation.toState().actorStates?.[0]).toMatchObject({ sleeping: false });
});

it('keeps gravity active for legacy saves without a sleeping state', () => {
  const actor = card(undefined, 2);
  render(60);
  expect(actor.position.y).toBeLessThan(1);
});
