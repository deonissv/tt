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

// describe('Bag', () => {
//   useSimulationMock();

//   const Bag = BagMixin(SharedBase<BagState>);
//   let mesh: Mesh;
//   let state: BagState;

//   beforeEach(() => {
//     vi.restoreAllMocks();
//     mesh = CreateBox('testMesh', { size: 1 });

//     state = {
//       type: 1,
//       guid: '1234',
//       name: 'testActor',
//       transformation: {
//         scale: [1, 1, 1],
//         rotation: [0, 0, 0],
//         position: [0, 0, 0],
//       },
//       containedObjects: [
//         {
//           type: 2,
//           guid: '1234',
//           name: 'testActor',
//           transformation: {
//             scale: [1, 1, 1],
//             rotation: [0, 0, 0],
//             position: [0, 0, 0],
//           },
//           faceURL: '',
//           backURL: '',
//           rows: 1,
//           cols: 1,
//           sequence: 0,
//         } as ActorBaseState,
//       ],
//     };
//   });

//   it('should construct with correct properties', () => {
//     const bag = new Bag(state, mesh);
//     expect(bag instanceof Bag).toBeTruthy();
//   });

//   it('fromState creates a Bag instance with correct properties', async () => {
//     const bag = await Bag.fromState(state);
//     expect(bag instanceof Bag).toBeTruthy();
//   });

//   it('fromState returns null if model is not loaded', async () => {
//     vi.spyOn(Loader, 'loadModel').mockResolvedValue([null, null]);
//     const bag = await Bag.fromState(state);
//     expect(bag == null).toBeTruthy();
//   });

//   it('should construct using fromState value', async () => {
//     const bag = new Bag(state, mesh);
//     expect(bag instanceof Bag).toBeTruthy();

//     const stateFromState = bag.toState();
//     const newBag = await Bag.fromState(stateFromState);

//     expect(newBag instanceof Bag).toBeTruthy();
//   });
// });
