vi.mock('@tt/loader', async () => {
  const { LoaderMock } = await import('./mocks/LoaderMock');
  return {
    Loader: LoaderMock,
  };
});

describe('mock', () => {
  it('passes', () => {
    expect(true).toBeTruthy();
  });
});

// describe('TileStack', () => {
//   useSimulationMock();

//   const TileStack = TileStackMixin(SharedBase<TileStackState>);

//   let mesh: Mesh;
//   let state: TileStackState;

//   beforeEach(() => {
//     vi.restoreAllMocks();

//     mesh = CreateBox('testMesh', { size: 1 });

//     state = {
//       guid: '51d35d',
//       name: 'Custom_Tile_Stack',
//       transformation: {
//         position: [-4.740222, 0.91, 6.6680603],
//         rotation: [-2.115622e-6, 179.9947, 2.31118474e-6].map(degToRad) as Tuple<number, 3>,
//         scale: [0.692878, 1.0, 0.692878],
//       },
//       type: ActorType.TILE_STACK,
//       tileType: 2,
//       faceURL: 'http://i.imgur.com/vURavdX.jpg',
//       backURL: 'http://i.imgur.com/vURavdX.jpg',
//       size: 10,
//     };
//   });
//   it('should construct with correct properties', () => {
//     const tileStack = new TileStack(state, mesh);
//     expect(tileStack.size).toBe(10);
//     expect(tileStack.model.scaling.y).toBe(10);
//   });

//   it('pickItem creates tile and adjusts model scaling', async () => {
//     const deck = new TileStack(state, mesh);
//     await deck.pickItem();
//     expect(deck.size).toBe(9);
//     expect(deck.model.scaling.y).toBeLessThan(11);
//   });

//   it('fromState creates a Deck instance with correct properties', async () => {
//     const tileStack = await TileStack.fromState(state);
//     expect(tileStack instanceof TileStack).toBeTruthy();

//     expect(tileStack!.size).toBe(10);
//   });

//   it('fromState returns null if tile model is not loaded', async () => {
//     vi.spyOn(Loader, 'loadMesh').mockResolvedValue(null);
//     const tileStack = await TileStack.fromState(state);
//     expect(tileStack === null).toBeTruthy();
//   });

//   it('should construct using fromState value', async () => {
//     const tileStack = new TileStack(state, mesh);
//     expect(tileStack instanceof TileStack).toBeTruthy();
//     expect(tileStack.size).toBe(10);

//     await tileStack.pickItem();
//     const stateFromState = tileStack.toState();
//     const newTileStack = await TileStack.fromState(stateFromState);

//     expect(newTileStack instanceof TileStack).toBeTruthy();
//     expect(newTileStack!.size).toBe(9);
//   });
// });
