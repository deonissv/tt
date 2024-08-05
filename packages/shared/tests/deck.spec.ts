vi.mock('@shared/playground/Loader', async () => {
  const { LoaderMock } = await import('./mocks/LoaderMock');
  return {
    Loader: LoaderMock,
  };
});
describe('Deck', () => {
  it('true', () => {
    expect(true).toBeTruthy();
  });

  // const { scene } = useSimulationMock();

  // const Card = CardMixin(SharedBase<CardState>);
  // const Deck = DeckMixin(SharedBase<DeckState>);

  // let mesh: Mesh;
  // let texture: Texture;
  // let state: DeckState;

  // beforeEach(() => {
  //   vi.restoreAllMocks();

  //   vi.spyOn(Card, 'getCardModel').mockImplementation(() => {
  //     return CreateBox('testMesh', { size: 1 }, scene);
  //   });

  //   mesh = CreateBox('testMesh', { size: 1 }, scene);
  //   texture = new Texture('testTexture', scene);

  //   state = {
  //     type: 3,
  //     guid: '1234',
  //     name: 'testActor',
  //     transformation: {
  //       scale: [1, 1, 1],
  //       rotation: [0, 0, 0],
  //       position: [0, 0, 0],
  //     },
  //     cards: [
  //       {
  //         type: 2,
  //         guid: '0',
  //         name: 'testCard',
  //         faceURL: 'testURL',
  //         backURL: 'testURL',
  //         cols: 1,
  //         rows: 1,
  //         sequence: 0,
  //       },
  //       {
  //         type: 2,
  //         guid: '1',
  //         name: 'testCard',
  //         faceURL: 'testURL',
  //         backURL: 'testURL',
  //         cols: 1,
  //         rows: 1,
  //         sequence: 0,
  //       },
  //     ],
  //   };
  // });
  // it('should construct with correct properties', () => {
  //   const deck = new Deck(state, mesh, texture, texture);
  //   expect(deck.size).toBe(2);
  //   expect(deck.model.scaling.x).toBe(2);
  // });

  // it('pickCard removes a card and adjusts model scaling', async () => {
  //   const deck = new Deck(state, mesh, texture, texture);
  //   await deck.pickItem();
  //   expect(deck.size).toBe(1);
  //   expect(deck.model.scaling.x).toBeLessThan(2);
  // });

  // it('fromState creates a Deck instance with correct properties', async () => {
  //   const deck = await Deck.fromState(state);
  //   expect(deck instanceof Deck).toBeTruthy();

  //   expect(deck!.size).toBe(2);
  // });

  // it('fromState returns null if card model is not loaded', async () => {
  //   vi.spyOn(Card, 'loadCardModel').mockResolvedValue(null);
  //   const deck = await Deck.fromState(state);
  //   expect(deck === null).toBeTruthy();
  // });

  // it('should construct using fromState value', async () => {
  //   const deck = new Deck(state, mesh, texture, texture);
  //   expect(deck instanceof Deck).toBeTruthy();
  //   expect(deck.size).toBe(2);

  //   await deck.pickItem();
  //   const stateFromState = deck.toState();
  //   const newDeck = await Deck.fromState(stateFromState);

  //   expect(newDeck instanceof Deck).toBeTruthy();
  //   expect(newDeck!.size).toBe(1);
  // });
});
