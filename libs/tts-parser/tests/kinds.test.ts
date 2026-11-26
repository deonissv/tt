import type { ObjectState } from '@tt/tts-schema';
import { ObjectStateSchema } from '@tt/tts-schema';
import { DEMO } from '@tt/demo-saves';
import { discriminateObjectKind } from '../src';

function obj(name: string, extra: Partial<ObjectState> = {}): ObjectState {
  return {
    GUID: 'test1',
    Name: name,
    Transform: { posX: 0, posY: 1, posZ: 0, rotX: 0, rotY: 0, rotZ: 0, scaleX: 1, scaleY: 1, scaleZ: 1 },
    Nickname: '',
    Description: '',
    GMNotes: '',
    AltLookAngle: { x: 0, y: 0, z: 0 },
    LayoutGroupSortIndex: 0,
    Value: 0,
    Locked: false,
    Grid: true,
    Snap: true,
    IgnoreFoW: false,
    MeasureMovement: false,
    DragSelectable: true,
    Autoraise: true,
    Sticky: true,
    Tooltip: true,
    GridProjection: false,
    XmlUI: '',
    ...extra,
  };
}

describe('discriminateObjectKind', () => {
  it('recognizes a renamed standalone custom card without DeckIDs', () => {
    const card = ObjectStateSchema.parse({ ...DEMO.CARD, Name: 'RenamedThing' });
    expect(card.CardID).toBe(233);
    expect(card.CustomDeck).toBeDefined();
    expect(card).not.toHaveProperty('DeckIDs');

    expect(discriminateObjectKind(card)).toEqual({ kind: 'cardCustom', stack: false, name: 'RenamedThing' });
  });

  it('recognizes a custom card with CardID zero', () => {
    expect(discriminateObjectKind(obj('RenamedThing', { CardID: 0, CustomDeck: {} }))).toMatchObject({
      kind: 'cardCustom',
    });
  });

  it('keeps a renamed single-card deck classified as a deck', () => {
    expect(discriminateObjectKind(obj('RenamedThing', { DeckIDs: [233], CustomDeck: {} }))).toMatchObject({
      kind: 'deckCustom',
    });
  });

  it('classifies the legacy demo custom figurine by its saved name', () => {
    const figurine = DEMO.OBJ.ObjectStates.find(object => object.GUID === 'ca085b');
    expect(figurine).toBeDefined();
    expect(figurine?.Name).toBe('Figurine_Custom');
    expect(figurine).toHaveProperty('CustomImage', expect.any(Object));
    expect(figurine).not.toHaveProperty('CustomFigurine');
    expect(discriminateObjectKind(ObjectStateSchema.parse(figurine))).toMatchObject({ kind: 'customFigurine' });
  });

  it.each([undefined, 1])('recognizes TileStack as a stack with Number %s', number => {
    const extra = number === undefined ? {} : { Number: number };
    expect(discriminateObjectKind(obj('TileStack', extra))).toEqual({
      kind: 'mahjongTileStack',
      stack: true,
      name: 'TileStack',
    });
  });

  it('classifies the demo custom model bag as a bag', () => {
    const bag = DEMO.OBJ.ObjectStates.find(object => object.Name === 'Custom_Model_Bag');
    expect(bag).toBeDefined();
    expect(bag?.CustomMesh).toBeDefined();
    expect(discriminateObjectKind(ObjectStateSchema.parse(bag))).toMatchObject({ kind: 'bag' });
  });

  it.each<[string, string, object]>([
    ['Custom_Model_Bag', 'bag', { CustomMesh: {} }],
    ['Custom_Model_Infinite_Bag', 'infiniteBag', { CustomMesh: {} }],
    ['Custom_Assetbundle_Bag', 'bag', { CustomAssetbundle: {} }],
    ['DeckCustom', 'deckCustom', { CustomDeck: {}, DeckIDs: [], ContainedObjects: [], CustomMesh: {} }],
  ])('preserves %s container kind with rendering blocks', (name, kind, blocks) => {
    expect(discriminateObjectKind(obj(name, blocks as Partial<ObjectState>))).toMatchObject({ kind, name });
  });

  const cases: [string, string, Partial<ObjectState>?][] = [
    // Containers
    ['Deck', 'deck'],
    ['DeckCustom', 'deckCustom'],
    ['Card', 'card'],
    ['Bag', 'bag'],
    ['Infinite_Bag', 'infiniteBag'],
    ['Custom_Model_Infinite_Bag', 'infiniteBag'],
    // Dice
    ['Die_4', 'die'],
    ['Die_6', 'die'],
    ['Die_6_Rounded', 'die'],
    ['Die_20', 'die'],
    // Built-in pieces
    ['Chip_10', 'chip'],
    ['ChipStack', 'chipStack', { Number: 5 }],
    ['Checker_white', 'checker'],
    ['go_game_piece_black', 'goStone'],
    ['backgammon_piece_brown', 'backgammonPiece'],
    ['reversi_chip', 'reversiChip'],
    ['Mahjong_Tile_1', 'mahjongTile'],
    ['Domino_2-4', 'domino'],
    ['PiecePack_Crowns', 'piecepack'],
    ['Chess_Pawn', 'chessPiece'],
    ['PlayerPawn', 'playerPawn'],
    ['Bowl', 'bowl'],
    // Components
    ['Notecard', 'notecard'],
    ['3DText', 'text'],
    ['Digital_Clock', 'clock'],
    ['Counter', 'counter'],
    ['Tablet', 'tablet'],
    ['Calculator', 'calculator'],
    ['MP3_Player', 'musicPlayer'],
    // Triggers and zones
    ['ScriptingTrigger', 'scriptingTrigger'],
    ['RandomizeTrigger', 'randomizeTrigger'],
    ['HandTrigger', 'handTrigger'],
    ['FogOfWarTrigger', 'fogOfWar'],
    ['LayoutZone', 'layoutZone'],
  ];

  it.each(cases)('%s → %s', (name, kind, extra) => {
    expect(discriminateObjectKind(obj(name, extra))).toMatchObject({ kind, name });
  });

  it('discriminates custom content from feature blocks, overriding odd names', () => {
    const deckIds = [10001];
    expect(
      discriminateObjectKind(
        obj('DeckCustom', {
          CustomDeck: { 100: { FaceURL: 'u', BackURL: 'b', BackIsHidden: false, UniqueBack: false } },
          DeckIDs: deckIds,
          ContainedObjects: [],
        }),
      ),
    ).toMatchObject({ kind: 'deckCustom' });
    expect(
      discriminateObjectKind(
        obj('Custom_Tile', {
          CustomImage: {
            ImageURL: 'u',
            ImageSecondaryURL: 'b',
            CustomTile: { Type: 0, Thickness: 1, Stackable: true, Stretch: false },
          },
        }),
      ),
    ).toMatchObject({ kind: 'customTile' });
    expect(
      discriminateObjectKind(
        obj('Custom_Tile', {
          Number: 5,
          CustomImage: {
            ImageURL: 'u',
            ImageSecondaryURL: 'b',
            CustomTile: { Type: 0, Thickness: 1, Stackable: true, Stretch: false },
          },
        }),
      ),
    ).toMatchObject({ kind: 'customTileStack', stack: true });
    expect(
      discriminateObjectKind(
        obj('Custom_Token', {
          CustomImage: {
            ImageURL: 'u',
            ImageSecondaryURL: 'b',
            CustomToken: { Thickness: 1, MergeDistancePixels: 1, Stackable: false },
          },
        }),
      ),
    ).toMatchObject({ kind: 'customToken' });
    expect(
      discriminateObjectKind(
        obj('Custom_Dice', {
          CustomImage: { ImageURL: 'u', ImageSecondaryURL: 'b', CustomDice: { Type: 1 } },
        }),
      ),
    ).toMatchObject({ kind: 'customDice' });
    expect(
      discriminateObjectKind(
        obj('Custom_PDF', {
          CustomPDF: { PDFUrl: 'u', PDFPassword: '', PDFPage: 0, PDFPageOffset: 0 },
        }),
      ),
    ).toMatchObject({ kind: 'customPDF' });
    expect(
      discriminateObjectKind(
        obj('Custom_Model', {
          CustomMesh: {
            MeshURL: 'u',
            DiffuseURL: 'd',
            NormalURL: '',
            ColliderURL: 'c',
            Convex: true,
            MaterialIndex: 0,
            TypeIndex: 0,
          },
        }),
      ),
    ).toMatchObject({ kind: 'customModel' });
    // Custom-content fields identify a renamed deck.
    expect(
      discriminateObjectKind(
        obj('RenamedThing', {
          CustomDeck: { 100: { FaceURL: 'u', BackURL: 'b', BackIsHidden: false, UniqueBack: false } },
          DeckIDs: deckIds,
          ContainedObjects: [],
        }),
      ),
    ).toMatchObject({ kind: 'deckCustom' });
  });

  it('falls back without losing the name', () => {
    expect(discriminateObjectKind(obj('Tileset_Rock'))).toMatchObject({ kind: 'gamePiece', name: 'Tileset_Rock' });
    expect(discriminateObjectKind(obj('SomeModdedThing'))).toMatchObject({ kind: 'builtin', name: 'SomeModdedThing' });
    expect(discriminateObjectKind(obj(''))).toMatchObject({ kind: 'unknown' });
  });
});
