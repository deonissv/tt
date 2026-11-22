import { DEMO } from '@tt/demo-saves';
import { ActorType, TileType, type BagState } from '@tt/states';
import { TTSParser } from '../src';
import { baseSave } from './fixtures';

const transform = { posX: 1, posY: 2, posZ: 3, rotX: 0, rotY: 90, rotZ: 180, scaleX: 1, scaleY: 1, scaleZ: 1 };

describe('Zod-validated application conversion', () => {
  beforeEach(() => TTSParser.reset());

  it.each([null, [], 1, {}, { GUID: 7, Name: 'PlayerPawn' }, { GUID: 'pawn', Name: false }].map(input => ({ input })))(
    'rejects malformed object identity without throwing: $input',
    ({ input }) => {
      expect(TTSParser.parseObject(input)).toBeNull();
      expect(TTSParser.errors.length).toBeGreaterThan(0);
      expect(TTSParser.guids).toEqual([]);
    },
  );

  it('converts decimal numeric strings through Zod before degrees-to-radians mapping', () => {
    expect(TTSParser.parseTransform({ ...transform, posX: '1.25', rotY: '9e1', scaleX: '0.5' })).toEqual({
      position: [1.25, 2, 3],
      rotation: [0, Math.PI / 2, Math.PI],
      scale: [0.5, 1, 1],
    });
  });

  it.each([null, true, '', ' ', '12oops'])('does not coerce invalid numeric input %j to a face value', Value => {
    expect(TTSParser.parseRotationValue({ Value, Rotation: { x: 0, y: 0, z: 0 } }, 'dice')).toBeNull();
    expect(TTSParser.errors.some(error => error.includes('dice: Value'))).toBe(true);
  });

  it('keeps zero gravity, zero mass and zero image width scale', () => {
    expect(TTSParser.parse('{"Gravity":"0","ObjectStates":[]}')?.gravity).toBe(0);
    expect(TTSParser.parseActorBase({ GUID: 'pawn', Name: 'PlayerPawn', Rigidbody: { Mass: '0' } })?.mass).toBe(0);
    expect(TTSParser.parseCustomImage({ ImageURL: 'https://example.com/image.png', WidthScale: '0' })?.widthScale).toBe(
      0,
    );
  });

  it('omits invalid optional actor fields and reports their paths without dropping valid fields', () => {
    const source = {
      GUID: 'pawn',
      Name: 'PlayerPawn',
      Transform: { ...transform, posX: 'bad' },
      Rigidbody: { Mass: '2.5' },
      Locked: 'yes',
    };
    const before = structuredClone(source);
    expect(TTSParser.parseObject(source)).toEqual({
      guid: 'pawn',
      name: 'PlayerPawn',
      type: ActorType.PAWN_TOKEN,
      mass: 2.5,
      transformation: { rotation: [0, Math.PI / 2, Math.PI], scale: [1, 1, 1] },
    });
    expect(TTSParser.errors.some(error => error.includes('pawn: Transform.posX'))).toBe(true);
    expect(TTSParser.errors.some(error => error.includes('pawn: Locked'))).toBe(true);
    expect(source).toEqual(before);
    expect(TTSParser.guids).toEqual([]);
  });

  it('validates optional mesh URLs independently while retaining the primary mesh', () => {
    expect(
      TTSParser.parseModel({
        MeshURL: 'https://example.com/mesh.obj',
        DiffuseURL: 12,
        ColliderURL: 'file:///tmp/mesh.obj',
        NormalURL: 'https://example.com/normal.png',
      }),
    ).toEqual({
      meshURL: 'https://example.com/mesh.obj',
      normalURL: 'https://example.com/normal.png',
    });
    expect(TTSParser.errors.some(error => error.includes('DiffuseURL'))).toBe(true);
    expect(TTSParser.errors.some(error => error.includes('ColliderURL'))).toBe(true);
    expect(TTSParser.parseModel({ MeshURL: 'file:///tmp/mesh.obj' })).toBeNull();
  });

  it('imports empty containers and omits absent table and empty optional asset URLs without errors', () => {
    const result = TTSParser.parse(
      JSON.stringify({
        ObjectStates: [
          { GUID: 'bag', Name: 'Bag' },
          { GUID: 'deck', Name: 'DeckCustom', ContainedObjects: [] },
          { GUID: 'model', Name: 'Custom_Model', CustomMesh: { MeshURL: 'https://example.com/m.obj', NormalURL: '' } },
        ],
      }),
    );
    expect(result?.table).toBeUndefined();
    expect(result?.actorStates).toMatchObject([
      { guid: 'bag', containedObjects: [] },
      { guid: 'deck', cards: [] },
      { guid: 'model', model: { meshURL: 'https://example.com/m.obj' } },
    ]);
    expect(TTSParser.errors).toEqual([]);
    expect(TTSParser.parseBag({ GUID: 'bag', Name: 'Bag', ContainedObjects: false })).toBeNull();
  });

  it('retains the spelling of valid URLs in legacy saves', () => {
    const url = 'http://pastebin.com/raw.php?i=VfbP68ia\r';
    expect(TTSParser.parseModel({ MeshURL: url, ColliderURL: url })).toEqual({ meshURL: url, colliderURL: url });
  });

  it('skips malformed children without losing valid siblings', () => {
    const result = TTSParser.parse(
      JSON.stringify({
        ObjectStates: [
          null,
          { GUID: 'bag', Name: 'Bag', ContainedObjects: [false, { GUID: 'pawn', Name: 'PlayerPawn' }] },
        ],
      }),
    );
    expect(result?.actorStates).toEqual([
      {
        type: ActorType.BAG,
        guid: 'bag',
        name: 'Bag',
        containedObjects: [{ type: ActorType.PAWN_TOKEN, guid: 'pawn', name: 'PlayerPawn' }],
      },
    ]);
  });

  it('uses parent deck definitions when a card has no local deck map', () => {
    const source = { ...DEMO.CARD, CustomDeck: undefined };
    const card = TTSParser.parseCard(source, { CustomDeck: DEMO.CARD.CustomDeck });
    expect(card?.faceURL).toBe(TTSParser.parseCard(DEMO.CARD)?.faceURL);
    expect(card).not.toBeNull();
  });

  it('uses a box tile when an old save omits its tile shape', () => {
    expect(
      TTSParser.parseTile({
        GUID: 'tile',
        Name: 'Custom_Tile',
        CustomImage: { ImageURL: 'https://example.com/tile.png' },
      })?.tileType,
    ).toBe(TileType.BOX);
  });

  it('checks die face counts through Zod', () => {
    const values = DEMO.DIE4.RotationValues ?? [];
    expect(values).toHaveLength(4);
    const source = { ...DEMO.DIE4, RotationValues: values.slice(1) };
    expect(TTSParser.parseDieN(source, ActorType.DIE4)).toBeNull();
    expect(TTSParser.errors.some(error => error.includes('RotationValues'))).toBe(true);
  });

  it('converts a valid 1024-container save without recursive schema validation overflow', () => {
    const template = { ...baseSave().ObjectStates[0], Transform: transform };
    let object: Record<string, unknown> = { ...template, GUID: 'pawn', Name: 'PlayerPawn' };
    let bags = 0;
    for (let depth = 4; depth < 1024; depth += 2) {
      object = { ...template, GUID: `bag-${depth}`, Name: 'Bag', ContainedObjects: [object] };
      bags++;
    }
    const result = TTSParser.parse(JSON.stringify({ SaveName: 'deep', ObjectStates: [object] }));
    expect(result).not.toBeNull();
    let actor = result!.actorStates![0];
    for (let index = 0; index < bags; index++) {
      expect(actor.type).toBe(ActorType.BAG);
      actor = (actor as BagState).containedObjects[0];
    }
    expect(actor.guid).toBe('pawn');
    expect(actor.transformation?.position).toEqual([1, 2, 3]);
  });
});
