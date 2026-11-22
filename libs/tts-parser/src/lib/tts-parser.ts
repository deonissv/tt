import type { z } from 'zod';
import { isUnknownObject } from '@tt/utils';
import type {
  ActorBaseState,
  ActorMap,
  CardState,
  CustomImage,
  DeckState,
  DieActorType,
  DieBaseState,
  DieState,
  Model,
  PawnTokenState,
  RotationValue,
  TableType,
  TileStackState,
  Transformation,
  UnknownActorState,
} from '@tt/states';
import {
  ActorType,
  DieFacesNumber,
  type ActorState,
  type BagState,
  type SimulationStateSave,
  type TableState,
  type TileState,
} from '@tt/states';
import { createImportSchemas } from './import-schemas';
import { isInfiniteBagName } from './infinite-bag';
import { decodeSaveInput } from './input';
import { getFormatWarnings } from './parse';
import type { TtsParseWarning } from './types';

type ActorBase = Omit<ActorBaseState, 'type'>;

export class TTSParser {
  static errors: string[] = [];
  static guids: string[] = [];
  static formatWarnings: TtsParseWarning[] = [];
  private static readonly schemas = createImportSchemas(issues => this.report(issues));

  static get isErrored(): boolean {
    return this.errors.length > 0;
  }
  static get guid(): string | undefined {
    return this.guids.at(-1);
  }
  static reset(): void {
    this.errors = [];
    this.guids = [];
    this.formatWarnings = [];
  }

  private static report(issues: z.core.$ZodIssue[], guid = this.guid): void {
    for (const issue of issues) {
      const path = issue.path
        .map((key, index) => (typeof key === 'number' ? `[${key}]` : `${index ? '.' : ''}${String(key)}`))
        .join('');
      this.errors.push(`${guid ? `${guid}: ` : ''}${path ? `${path}: ` : ''}${issue.message}`);
    }
  }

  private static read<T extends z.ZodType>(schema: T, value: unknown, guid = this.guid): z.output<T> | null {
    const result = schema.safeParse(value, { jitless: true });
    if (result.success) return result.data;
    this.report(result.error.issues, guid);
    return null;
  }

  /** Import simulation state. Set formatWarnings to also check the full TTS document. */
  static parse(tts: string, options: { formatWarnings?: boolean } = {}): SimulationStateSave | null {
    try {
      this.formatWarnings = [];
      const decoded = decodeSaveInput(tts);
      if (!decoded.ok) {
        this.errors.push('TTS_PARSE', decoded.error);
        return null;
      }
      const root = decoded.save;
      if (options.formatWarnings) this.formatWarnings = getFormatWarnings(root);
      const actorStates: UnknownActorState[] = [];
      const save: SimulationStateSave = { leftHandedSystem: true, actorStates };
      const gravity = this.read(this.schemas.gravity, root.Gravity);
      if (gravity != null) save.gravity = gravity * 9.8;
      if (root.Table !== undefined) {
        const table = this.parseTable(root);
        if (table) save.table = table;
      }
      for (const object of root.ObjectStates) {
        const actor = this.parseObject(object);
        if (actor) actorStates.push(actor);
      }
      return save;
    } catch {
      this.errors.push('TTS_PARSE');
      return null;
    }
  }

  static parseObject(objectState: unknown): UnknownActorState | null {
    return this.importActor(objectState);
  }

  static parseUnknownActorState(objectState: unknown): UnknownActorState | null {
    return this.parseObject(objectState);
  }

  private static importActor(objectState: unknown): UnknownActorState | null;
  private static importActor<T extends ActorType>(
    objectState: unknown,
    type: T,
    parentDeck?: Record<string, unknown>,
  ): ActorMap[T] | null;
  private static importActor(
    objectState: unknown,
    type?: ActorType,
    parentDeck?: Record<string, unknown>,
  ): UnknownActorState | null {
    const guid = isUnknownObject(objectState) ? objectState.GUID : undefined;
    if (typeof guid === 'string') this.guids.push(guid);
    try {
      const base = this.parseActorBase(objectState);
      if (!base) return null;
      const actorType = type ?? this.mapType(base.name);
      switch (actorType) {
        case ActorType.BAG:
          return this.convertBag(objectState, base);
        case ActorType.CARD:
          return this.convertCard(objectState, base, parentDeck);
        case ActorType.DECK:
          return this.convertDeck(objectState, base);
        case ActorType.TILE:
        case ActorType.TILE_STACK: {
          const tile = this.read(this.schemas.tile, objectState);
          if (!tile) return null;
          if (actorType === ActorType.TILE) return { ...base, ...tile.CustomImage, type: actorType };
          const stack = this.read(this.schemas.tileStack, objectState);
          return stack ? { ...base, ...tile.CustomImage, type: actorType, size: stack.Number } : null;
        }
        case ActorType.DIE6ROUND:
        case ActorType.DIE4:
        case ActorType.DIE6:
        case ActorType.DIE8:
        case ActorType.DIE10:
        case ActorType.DIE12:
        case ActorType.DIE20:
          return this.convertDie(objectState, base, actorType);
        case ActorType.ACTOR:
          return this.convertCustomObject(objectState, base);
        case ActorType.PAWN_TOKEN:
          return { ...base, type: actorType };
        default:
          this.errors.push(`${base.guid}: Unsupported actor type ${base.name}`);
          return null;
      }
    } finally {
      if (typeof guid === 'string') this.guids.pop();
    }
  }

  static parseBuiltInActorState(objectState: unknown, type: ActorType.PAWN_TOKEN): PawnTokenState | null {
    return this.importActor(objectState, type);
  }

  static parseActorBase(objectState: unknown): ActorBase | null {
    return this.read(this.schemas.base, objectState);
  }
  static parseModel(modelState: unknown): Model | null {
    return this.read(this.schemas.model, modelState);
  }
  static parseTransform(transform: unknown): Transformation | null {
    return this.read(this.schemas.transform, transform) ?? null;
  }
  static parseCustomImage(image: unknown): CustomImage | null {
    return this.read(this.schemas.image, image);
  }

  static parseTable(table: unknown): TableState | null {
    const data = this.read(this.schemas.table, table);
    if (data?.Table === undefined) return null;
    const type = this.mapTableType(data.Table);
    return type === null ? null : { type, ...(data.TableURL !== undefined ? { url: data.TableURL } : {}) };
  }

  static mapTableType(type: string): TableType | null {
    // https://kb.tabletopsimulator.com/host-guides/tables/
    switch (type) {
      case 'Table_Circular':
        return 'Circle';
      case 'Table_Glass':
        return 'CircleGlass';
      case 'Table_Hexagon':
        return 'Hexagon';
      case 'Table_Octagon':
        return 'Octagon';
      case 'Table_Poker':
        return 'Poker';
      case 'Table_RPG':
        return 'Rectangle';
      case 'Table_Custom':
        return 'CustomRectangle';
      case 'Table_Custom_Square':
        return 'CustomSquare';
      case 'Table_Square':
        return 'Square';
    }
    return null;
  }

  static mapType(type: string): ActorType | null {
    const loweredType = type.toLowerCase();

    const stack = loweredType.includes('stack');

    const pattern = {
      bag: ActorType.BAG,
      card: ActorType.CARD,
      deck: ActorType.DECK,
      tile: ActorType.TILE,
      die_6_rounded: ActorType.DIE6ROUND,
      die_4: ActorType.DIE4,
      die_6: ActorType.DIE6,
      die_8: ActorType.DIE8,
      die_10: ActorType.DIE10,
      die_12: ActorType.DIE12,
      die_20: ActorType.DIE20,
      model: ActorType.ACTOR,
      playerpawn: ActorType.PAWN_TOKEN,
    };

    for (const [p, v] of Object.entries(pattern)) {
      if (loweredType.includes(p)) {
        if (stack) {
          if (v === ActorType.TILE) {
            return ActorType.TILE_STACK;
          }
        }
        return v;
      }
    }
    return null;
  }

  static parseBag(objectState: unknown): BagState | null {
    return this.importActor(objectState, ActorType.BAG);
  }

  private static convertBag(objectState: unknown, base: ActorBase): BagState | null {
    const data = this.read(this.schemas.bag, objectState);
    if (!data) return null;
    const containedObjects: UnknownActorState[] = [];
    for (const child of data.ContainedObjects) {
      const actor = this.parseObject(child);
      if (actor) containedObjects.push(actor);
    }
    return {
      type: ActorType.BAG,
      ...base,
      containedObjects,
      ...(isInfiniteBagName(base.name) ? { infinite: true } : {}),
      ...(data.CustomMesh ? { model: data.CustomMesh } : {}),
    };
  }

  static parseCard(objectState: unknown, deck?: unknown): CardState | null {
    const parent = isUnknownObject(deck) && isUnknownObject(deck.CustomDeck) ? deck.CustomDeck : undefined;
    return this.importActor(objectState, ActorType.CARD, parent);
  }

  private static convertCard(
    objectState: unknown,
    base: ActorBase,
    parentDeck?: Record<string, unknown>,
  ): CardState | null {
    const data = this.read(this.schemas.card, objectState);
    if (!data) return null;
    const deckId = Math.floor(data.CardID / 100);
    const ownGrid = data.CustomDeck?.[deckId];
    const grid = this.read(this.schemas.deckGrid, ownGrid ?? parentDeck?.[deckId]);
    if (!grid) return null;
    return {
      type: ActorType.CARD,
      ...base,
      faceURL: grid.FaceURL,
      backURL: grid.BackURL,
      cols: grid.NumWidth ?? 1,
      rows: grid.NumHeight ?? 1,
      sequence: data.CardID % 100,
    };
  }

  static parseDeck(objectState: unknown): DeckState | null {
    return this.importActor(objectState, ActorType.DECK);
  }

  private static convertDeck(objectState: unknown, base: ActorBase): DeckState | null {
    const data = this.read(this.schemas.deck, objectState);
    if (!data) return null;
    const cards: CardState[] = [];
    for (const child of data.ContainedObjects) {
      const card = this.importActor(child, ActorType.CARD, data.CustomDeck);
      if (card) cards.push(card);
    }
    return { type: ActorType.DECK, ...base, cards };
  }

  static parseTile(objectState: unknown): TileState | null {
    return this.importActor(objectState, ActorType.TILE);
  }

  static parseTileStack(objectState: unknown): TileStackState | null {
    return this.importActor(objectState, ActorType.TILE_STACK);
  }

  static parseCustomObject(objectState: unknown): ActorState | null {
    return this.importActor(objectState, ActorType.ACTOR);
  }

  private static convertCustomObject(objectState: unknown, base: ActorBase): ActorState | null {
    const data = this.read(this.schemas.actor, objectState);
    if (!data) return null;
    const actor: ActorState = { type: ActorType.ACTOR, ...base, model: data.CustomMesh };
    if (data.ChildObjects !== undefined) {
      actor.children = [];
      for (const child of data.ChildObjects) {
        const converted = this.parseObject(child);
        if (converted) actor.children.push(converted as ActorState);
      }
    }
    return actor;
  }

  static parseDieN(objectState: unknown, dieType: DieActorType): DieState | null {
    return this.importActor(objectState, dieType);
  }

  private static convertDie(objectState: unknown, base: ActorBase, dieType: DieActorType): DieState | null {
    const schema = this.schemas.rotationValues.extend({
      RotationValues: this.schemas.rotationValues.shape.RotationValues.length(DieFacesNumber[dieType]),
    });
    const data = this.read(schema, objectState);
    if (!data) return null;
    // Zod enforces the face count; TypeScript cannot infer a tuple from a dynamic .length().
    return { ...base, type: dieType, rotationValues: data.RotationValues } as DieState;
  }

  static parseDieBase(objectState: unknown): Omit<DieBaseState, 'type'> | null {
    const rotationValues = this.parseRotationValues(objectState);
    if (!rotationValues) return null;
    const base = this.parseActorBase(objectState);
    return base ? { ...base, rotationValues } : null;
  }

  static parseRotationValues(objectState: unknown): RotationValue[] | null {
    return this.read(this.schemas.rotationValues, objectState)?.RotationValues ?? null;
  }

  static parseRotationValue(rotationValue: unknown, guid: string): RotationValue | null {
    return this.read(this.schemas.rotation, rotationValue, guid);
  }
}
