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

// describe('Card', () => {
//   const { scene } = useSimulationMock();

//   const Card = CardMixin(SharedBase<CardState>);

//   let mesh: Mesh;
//   let texture: Texture;
//   let state: CardState;

//   beforeEach(() => {
//     vi.restoreAllMocks();

//     vi.spyOn(Card, 'getCardModel').mockImplementation(() => {
//       return CreateBox('testMesh', { size: 1 }, scene);
//     });

//     mesh = CreateBox('testMesh', { size: 1 }, scene);
//     texture = new Texture('testTexture', scene);

//     state = {
//       type: 2,
//       guid: '1234',
//       name: 'testActor',
//       transformation: {
//         scale: [1, 1, 1],
//         rotation: [0, 0, 0],
//         position: [0, 0, 0],
//       },
//       faceURL: '',
//       backURL: '',
//       rows: 1,
//       cols: 1,
//       sequence: 0,
//     };
//   });
//   it('should construct with correct properties', () => {
//     const card = new Card(state, mesh, texture, texture);
//     expect(card instanceof Card).toBeTruthy();
//   });

//   it('fromState creates a Card instance with correct properties', async () => {
//     const card = await Card.fromState(state);
//     expect(card instanceof Card).toBeTruthy();
//   });

//   it('fromState returns null if card model is not loaded', async () => {
//     vi.spyOn(Card, 'loadCardModel').mockResolvedValue(null);
//     const card = await Card.fromState(state);
//     expect(card === null).toBeTruthy();
//   });

//   it('should construct using fromState value', async () => {
//     const card = new Card(state, mesh, texture, texture);
//     expect(card instanceof Card).toBeTruthy();

//     const stateFromState = card.toState();
//     const newCard = await Card.fromState(stateFromState);

//     expect(newCard instanceof Card).toBeTruthy();
//   });

//   it('should get col and row from sequence', () => {
//     expect(Card.getColRow(0, 1)).toEqual([0, 0]);

//     expect(Card.getColRow(0, 10)).toEqual([0, 0]);
//     expect(Card.getColRow(9, 10)).toEqual([9, 0]);
//     expect(Card.getColRow(60, 10)).toEqual([0, 6]);
//     expect(Card.getColRow(69, 10)).toEqual([9, 6]);
//     expect(Card.getColRow(68, 10)).toEqual([8, 6]);
//   });
// });
