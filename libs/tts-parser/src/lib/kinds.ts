import type { ObjectState } from '@tt/tts-schema';

/**
 * Built-in and custom object kinds, identified by `Name` and custom-content fields.
 * Unrecognized names fall back to `builtin` or `unknown`. The result keeps the original name.
 */
export type TtsObjectKind =
  // Containers
  | 'bag'
  | 'infiniteBag'
  | 'deck'
  | 'deckCustom'
  | 'card'
  | 'cardCustom'
  // Built-in game pieces
  | 'die'
  | 'chip'
  | 'chipStack'
  | 'checker'
  | 'checkerStack'
  | 'goStone'
  | 'backgammonPiece'
  | 'reversiChip'
  | 'mahjongTile'
  | 'mahjongTileStack'
  | 'domino'
  | 'dominoStack'
  | 'piecepack'
  | 'chessPiece'
  | 'figurine'
  | 'rpgFigurine'
  | 'playerPawn'
  | 'gamePiece'
  // Custom content
  | 'customModel'
  | 'customBoard'
  | 'customTile'
  | 'customTileStack'
  | 'customToken'
  | 'customTokenStack'
  | 'customDice'
  | 'customJigsawPuzzle'
  | 'customAssetbundle'
  | 'customPDF'
  | 'customFigurine'
  // Components and tools
  | 'clock'
  | 'counter'
  | 'tablet'
  | 'calculator'
  | 'notecard'
  | 'text'
  | 'musicPlayer'
  | 'scriptingTrigger'
  | 'randomizeTrigger'
  | 'handTrigger'
  | 'fogOfWar'
  | 'layoutZone'
  | 'snapPoint'
  // Environment
  | 'table'
  | 'sky'
  | 'surface'
  | 'block'
  | 'bowl'
  // Fallbacks
  | 'builtin'
  | 'unknown';

export interface TtsObjectKindResult {
  kind: TtsObjectKind;
  /** True for the *_Stack variants and stacks expressed through `Number`. */
  stack: boolean;
  /** The object's original internal name. */
  name: string;
}

const DIE_FACES: ReadonlyMap<string, number> = new Map([
  ['Die_4', 4],
  ['Die_6', 6],
  ['Die_6_Rounded', 6],
  ['Die_8', 8],
  ['Die_10', 10],
  ['Die_12', 12],
  ['Die_20', 20],
]);

const NAME_KINDS: Readonly<Record<string, TtsObjectKind>> = {
  Deck: 'deck',
  DeckCustom: 'deckCustom',
  Card: 'card',
  CardCustom: 'cardCustom',
  Bag: 'bag',
  Infinite_Bag: 'infiniteBag',
  Custom_Model_Bag: 'bag',
  Custom_Model_Infinite_Bag: 'infiniteBag',
  Custom_Assetbundle_Bag: 'bag',
  ChipStack: 'chipStack',
  CheckerStack: 'checkerStack',
  TileStack: 'mahjongTileStack',
  Figurine_Custom: 'customFigurine',
  Notecard: 'notecard',
  '3DText': 'text',
  Digital_Clock: 'clock',
  Clock: 'clock',
  Counter: 'counter',
  Tablet: 'tablet',
  Calculator: 'calculator',
  MP3_Player: 'musicPlayer',
  MusicPlayer: 'musicPlayer',
  ScriptingTrigger: 'scriptingTrigger',
  RandomizeTrigger: 'randomizeTrigger',
  HandTrigger: 'handTrigger',
  FogOfWarTrigger: 'fogOfWar',
  FogOfWarRevealer: 'fogOfWar',
  LayoutZone: 'layoutZone',
  PlayerPawn: 'playerPawn',
  Bowl: 'bowl',
  Quarter: 'gamePiece',
};

const NAME_PREFIX_KINDS: readonly (readonly [string, TtsObjectKind])[] = [
  ['Chip_', 'chip'],
  ['Checker_', 'checker'],
  ['go_game_piece_', 'goStone'],
  ['go_game_bowl', 'bowl'],
  ['backgammon_piece_', 'backgammonPiece'],
  ['reversi_chip', 'reversiChip'],
  ['Mahjong_', 'mahjongTile'],
  ['Domino_', 'domino'],
  ['PiecePack_', 'piecepack'],
  ['Chess_', 'chessPiece'],
  ['Figurine_', 'figurine'],
  ['RPG_', 'rpgFigurine'],
  ['Table_', 'table'],
  ['Sky_', 'sky'],
  ['Surface', 'surface'],
  ['Block', 'block'],
  ['Tileset_', 'gamePiece'],
  ['Custom_Tile_Stack', 'customTileStack'],
  ['Custom_Token_Stack', 'customTokenStack'],
  ['Custom_Tile', 'customTile'],
  ['Custom_Token', 'customToken'],
  ['Custom_Dice', 'customDice'],
  ['Custom_Jigsaw', 'customJigsawPuzzle'],
  ['Custom_Board', 'customBoard'],
  ['Custom_Model', 'customModel'],
  ['Custom_Assetbundle', 'customAssetbundle'],
  ['Custom_PDF', 'customPDF'],
  ['DeckCustom', 'deckCustom'],
  ['CardCustom', 'cardCustom'],
  ['Die_', 'die'],
];

/** Identify an object kind without changing the object. */
export function discriminateObjectKind(object: ObjectState): TtsObjectKindResult {
  const name = typeof object.Name === 'string' ? object.Name : '';
  const stack = isStack(object, name);
  const exact = Object.prototype.hasOwnProperty.call(NAME_KINDS, name) ? NAME_KINDS[name] : undefined;

  // Container rendering blocks describe their appearance, not their kind.
  if (exact === 'bag' || exact === 'infiniteBag' || exact === 'deck' || exact === 'deckCustom') {
    return { kind: exact, stack, name };
  }

  // Custom-content fields take precedence over names changed by mods.
  if (object.CustomDeck && object.DeckIDs) {
    return { kind: name === 'CardCustom' || looksLikeSingleCard(object) ? 'cardCustom' : 'deckCustom', stack, name };
  }
  if (object.CustomPDF) return { kind: 'customPDF', stack, name };
  if (object.CustomAssetbundle) return { kind: 'customAssetbundle', stack, name };
  if (object.CustomFigurine) return { kind: 'customFigurine', stack, name };
  if (object.CustomImage?.CustomJigsawPuzzle) return { kind: 'customJigsawPuzzle', stack, name };
  if (object.CustomImage?.CustomDice) return { kind: 'customDice', stack, name };
  if (object.CustomImage?.CustomTile) return { kind: stack ? 'customTileStack' : 'customTile', stack, name };
  if (object.CustomImage?.CustomToken) return { kind: stack ? 'customTokenStack' : 'customToken', stack, name };
  if (object.CustomMesh) return { kind: name.includes('Board') ? 'customBoard' : 'customModel', stack, name };

  if (exact) return { kind: exact, stack, name };

  const faces = DIE_FACES.get(name);
  if (faces !== undefined) return { kind: 'die', stack, name };

  for (const [prefix, kind] of NAME_PREFIX_KINDS) {
    if (name.startsWith(prefix)) return { kind, stack, name };
  }

  // Treat renamed containers without deck metadata as bags.
  if (object.ContainedObjects && !object.DeckIDs) return { kind: 'bag', stack, name };

  if (name.length > 0) return { kind: 'builtin', stack, name };
  return { kind: 'unknown', stack, name };
}

function looksLikeSingleCard(object: ObjectState): boolean {
  return object.ContainedObjects === undefined && object.DeckIDs?.length === 1;
}

function isStack(object: ObjectState, name: string): boolean {
  if (name.endsWith('_Stack') || name === 'ChipStack' || name === 'CheckerStack' || name === 'TileStack') return true;
  return typeof object.Number === 'number' && object.Number > 1;
}
