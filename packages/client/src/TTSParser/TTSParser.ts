import type { ObjectState } from '@shared/tts-model/ObjectState';
import type { SaveState } from '@shared/tts-model/SaveState';

import type {
  ActorStateBase,
  CardState,
  DeckState,
  DieBaseState,
  Model,
  RotationValue,
  TableType,
  Transformation,
} from '@shared/dto/states';
import {
  ActorType,
  type ActorState,
  type BagState,
  type SimulationStateSave,
  type TableState,
  type TileState,
  type TileType,
} from '@shared/dto/states';
import type { CustomImage } from '@shared/dto/states/actor/FlatActorState';
import type { TileStackState } from '@shared/dto/states/actor/Stack';
import { hasProperty, isNumber, isObject, isString, isTuple } from '@shared/guards';
import type { TransformState } from '@shared/tts-model/TransformState';
import type { OpnitalAllBut } from '@shared/types';
import { degToRad } from '@shared/utils';
import { ActorMapper, DieMapper, type DieNState, type DieType } from '../../../shared/src/dto/states/actor/DieState';

type MinimalObjectState = OpnitalAllBut<ObjectState, 'GUID'>;

class TTSParser {
  error = false;
  errors: string[] = [];

  parse(tts: string): SimulationStateSave | null {
    try {
      const obj = JSON.parse(tts) as SaveState;
      const save: SimulationStateSave = {};

      save.gravity = obj.Gravity;
      save.leftHandedSystem = true;

      save.table = this.parseTable(obj);

      if (obj.ObjectStates && Array.isArray(obj.ObjectStates)) {
        save.actorStates = obj.ObjectStates.reduce<ActorState[]>((acc, o) => {
          const actorState = this.parseObject(o);
          if (actorState) {
            acc.push(actorState as ActorState);
          }
          return acc;
        }, []);
      } else {
        return null;
      }
      return save;
    } catch (e) {
      this.error = true;
      // eslint-disable-next-line no-console
      console.error('Tts parse failed', e);
      return null;
    }
  }

  parseActorBase(objectState: ObjectState): Omit<ActorStateBase, 'type'> {
    const actorState: Omit<ActorStateBase, 'type'> = {
      name: objectState.Name,
      guid: objectState.GUID,
      transformation: this.parseTransform(objectState.Transform),
    };

    if (objectState?.Rigidbody?.Mass) {
      actorState.mass = objectState?.Rigidbody?.Mass;
    }

    return actorState;
  }

  parseModel(objectState: ObjectState): Model | undefined {
    const meshURL = TTSParser.parseURL(objectState?.CustomMesh?.MeshURL);

    if (!meshURL) {
      this.errors.push(objectState.GUID);
      return undefined;
    }

    const model: Model = {
      meshURL: meshURL,
    };

    model.colliderURL ||= TTSParser.parseURL(objectState?.CustomMesh?.ColliderURL);
    model.diffuseURL ||= TTSParser.parseURL(objectState?.CustomMesh?.DiffuseURL);
    model.normalURL ||= TTSParser.parseURL(objectState?.CustomMesh?.NormalURL);

    return model;
  }

  parseTransform(transform: TransformState): Transformation {
    return {
      position: [transform.posX, transform.posY, transform.posZ],
      rotation: [transform.rotX, transform.rotY, transform.rotZ].map(degToRad),
      scale: [transform.scaleX, transform.scaleY, transform.scaleZ],
    };
  }

  parseCustomImage(objectState: ObjectState): CustomImage | null {
    const faceURL = TTSParser.parseURL(objectState.CustomImage?.ImageURL);
    if (!faceURL) {
      this.errors.push(objectState.GUID);
      return null;
    }

    const flatActorState: CustomImage = {
      faceURL,
    };

    const backURL = TTSParser.parseURL(objectState.CustomImage?.ImageSecondaryURL);
    backURL && (flatActorState.backURL = backURL);

    const widthScale = TTSParser.parseNumber(objectState.CustomImage?.WidthScale);
    widthScale && (flatActorState.widthScale = widthScale);

    return flatActorState;
  }

  parseObject = (objectState: MinimalObjectState): ActorStateBase | null => {
    try {
      if (!hasProperty(objectState, 'Name')) {
        this.errors.push(objectState.GUID);
        return null;
      }

      if (typeof objectState.Name !== 'string') {
        this.errors.push(objectState.GUID);
        return null;
      }

      const type = this.mapType(objectState.Name);
      if (type === null) {
        this.errors.push(objectState.GUID);
        return null;
      }

      switch (type) {
        case ActorType.BAG:
          return this.parseBag(objectState as ObjectState) as unknown as ActorState;
        case ActorType.CARD:
          return this.parseCard(objectState as ObjectState) as unknown as ActorState;
        case ActorType.TILE:
          return this.parseTile(objectState as ObjectState) as unknown as ActorState;
        case ActorType.TILE_STACK:
          return this.parseTileStack(objectState as ObjectState) as unknown as ActorState;
        case ActorType.DECK:
          return this.parseDeck(objectState as ObjectState) as unknown as ActorState;
        case ActorType.DIE4:
        case ActorType.DIE6:
        case ActorType.DIE8:
        case ActorType.DIE10:
        case ActorType.DIE12:
        case ActorType.DIE20:
          return this.parseDieN(objectState as ObjectState, ActorMapper[type]) as unknown as ActorState;
        case ActorType.ACTOR:
          return this.parseCustomObject(objectState as ObjectState) as unknown as ActorState;
        default:
          return null;
      }
    } catch (e) {
      this.errors.push(objectState.GUID);
      return null;
    }
  };

  parseTable = (obj: SaveState): TableState => {
    const tableState: TableState = {
      type: this.mapTableType(obj.Table),
    };

    tableState.url ||= TTSParser.parseURL(obj.TableURL);

    return tableState;
  };

  mapTableType(type: string): TableType {
    // https://kb.tabletopsimulator.com/host-guides/tables/
    switch (type) {
      case 'Table_Circular':
        return 'Circle';
      case 'Table_Glass':
        return 'Glass';
      case 'Table_Hexagon':
        return 'Hexagon';
      case 'Table_Octagon':
        return 'Octagon';
      case 'Table_Poker':
        return 'Poker';
      case 'Table_RPG':
        return 'RPG';
      case 'Table_Custom':
        return 'Custom';
      case '':
      default:
        return 'None';
    }
  }

  mapType(type: string): ActorType | null {
    const loweredType = type.toLowerCase();

    const stack = loweredType.includes('stack');

    const pattern = {
      bag: ActorType.BAG,
      card: ActorType.CARD,
      deck: ActorType.DECK,
      tile: ActorType.TILE,
      die_4: ActorType.DIE4,
      die_6: ActorType.DIE6,
      die_8: ActorType.DIE8,
      die_10: ActorType.DIE10,
      die_12: ActorType.DIE12,
      die_20: ActorType.DIE20,
      model: ActorType.ACTOR,
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

  parseBag(objectState: ObjectState): BagState | null {
    try {
      const containedObjects = objectState.ContainedObjects.map(o => this.parseObject(o));

      const model = this.parseModel(objectState);

      const bagState: BagState = {
        type: ActorType.BAG,
        ...this.parseActorBase(objectState),
        containedObjects: containedObjects.filter((o): o is ActorState => o !== null),
      };

      model && (bagState.model = model);

      return bagState;
    } catch (e) {
      return null;
    }
  }

  parseCard(objectState: ObjectState, deck?: ObjectState): CardState | null {
    const cardID = objectState.CardID;
    if (!cardID) {
      this.errors.push(objectState.GUID);
      return null;
    }

    const deckId = +cardID.toString().slice(0, -2);
    const sequence = +cardID.toString().slice(-2);
    if (!deckId || !sequence) {
      this.errors.push(objectState.GUID);
      return null;
    }

    const customDeckObj = objectState.CustomDeck?.[deckId] ?? deck?.CustomDeck?.[deckId];
    if (!customDeckObj) {
      this.errors.push(objectState.GUID);
      return null;
    }

    const faceURL = TTSParser.parseURL(customDeckObj.FaceURL);
    if (!faceURL) {
      this.errors.push(objectState.GUID);
      return null;
    }

    const backURL = TTSParser.parseURL(customDeckObj.BackURL);
    if (!backURL) {
      this.errors.push(objectState.GUID);
      return null;
    }

    const cols = customDeckObj.NumWidth ? +customDeckObj.NumWidth : 1;
    const rows = customDeckObj.NumHeight ? +customDeckObj.NumHeight : 1;

    const cardState: CardState = {
      type: ActorType.CARD,
      ...this.parseActorBase(objectState),
      faceURL,
      backURL,
      cols,
      rows,
      sequence,
    };

    return cardState;
  }

  parseDeck(objectState: ObjectState): DeckState | null {
    if (!Array.isArray(objectState.ContainedObjects)) {
      this.errors.push(objectState.GUID);
      return null;
    }

    const cards = objectState.ContainedObjects.reduce<CardState[]>((acc, o) => {
      const cardState = this.parseCard(o, objectState);
      if (cardState) {
        acc.push(cardState);
      }
      return acc;
    }, []);

    if (cards.length === 0) {
      this.errors.push(objectState.GUID);
      return null;
    }

    return {
      type: ActorType.DECK,

      ...this.parseActorBase(objectState),
      cards,
    };
  }

  parseTile(objectState: ObjectState): TileState | null {
    const faceURL = TTSParser.parseURL(objectState.CustomImage?.ImageURL);
    if (!faceURL) {
      this.errors.push(objectState.GUID);
      return null;
    }

    const customImage = this.parseCustomImage(objectState);
    if (!customImage) {
      this.errors.push(objectState.GUID);
      return null;
    }

    const tileState: TileState = {
      type: ActorType.TILE,
      ...this.parseActorBase(objectState),
      ...customImage,
      tileType: objectState.CustomImage?.CustomTile.Type as unknown as TileType,
    };

    return tileState;
  }

  parseTileStack(objectState: ObjectState): TileStackState | null {
    const tileState = this.parseTile(objectState);
    if (!tileState) {
      this.errors.push(objectState.GUID);
      return null;
    }

    const size = TTSParser.parseNumber(objectState?.Number);
    if (!size) {
      this.errors.push(objectState.GUID);
      return null;
    }

    return {
      ...tileState,
      type: ActorType.TILE_STACK,
      size,
    };
  }

  parseCustomObject(objectState: ObjectState): ActorState | null {
    try {
      const model = this.parseModel(objectState);
      if (!model) {
        return null;
      }

      const actorState: ActorState = {
        type: ActorType.ACTOR,
        ...this.parseActorBase(objectState),
        model,
      };

      if (objectState?.ColorDiffuse) {
        actorState.colorDiffuse = [objectState.ColorDiffuse.r, objectState.ColorDiffuse.g, objectState.ColorDiffuse.b];
        if (objectState.ColorDiffuse.a && objectState.ColorDiffuse.a !== 1) {
          actorState.colorDiffuse.push(objectState.ColorDiffuse.a);
        }
      }

      if (objectState?.ChildObjects) {
        actorState.children = objectState.ChildObjects.reduce<ActorState[]>((acc, o) => {
          const actorState = this.parseObject(o);
          if (actorState) {
            acc.push(actorState as ActorState);
          }
          return acc;
        }, []);
      }

      return actorState;
    } catch (e) {
      return null;
    }
  }

  parseDieN<N extends DieType>(objectState: ObjectState, dieType: N): DieNState<N> | null {
    const rotationValues = this.parseRotatioValues(objectState);
    if (!rotationValues) {
      this.errors.push(objectState.GUID);
      return null;
    }

    if (!isTuple(rotationValues, dieType)) {
      this.errors.push(objectState.GUID);
      return null;
    }

    return {
      ...this.parseActorBase(objectState),
      type: DieMapper[dieType],
      rotationValues,
    };
  }

  parseDieBase(objectState: ObjectState): Omit<DieBaseState, 'type'> | null {
    const rotationValues = this.parseRotatioValues(objectState);
    if (!rotationValues) {
      this.errors.push(objectState.GUID);
      return null;
    }

    const dieState = {
      ...this.parseActorBase(objectState),
      rotationValues,
    };

    return dieState;
  }

  parseRotatioValues(objectState: ObjectState): RotationValue[] | null {
    if (!Object.hasOwnProperty.call(objectState, 'RotationValues')) {
      this.errors.push(objectState.GUID);
      return null;
    }

    if (!Array.isArray(objectState.RotationValues)) {
      this.errors.push(objectState.GUID);
      return null;
    }

    const rotationValues = new Array<RotationValue>();
    for (const rotationValue of objectState.RotationValues) {
      const parsedRotationValue = this.parseRotationValue(rotationValue, objectState.GUID);
      if (!parsedRotationValue) {
        this.errors.push(objectState.GUID);
        return null;
      }
      rotationValues.push(parsedRotationValue);
    }

    return rotationValues;
  }

  parseRotationValue(rotationValue: unknown, guid: string): RotationValue | null {
    if (!isObject(rotationValue)) {
      this.errors.push(guid);
      return null;
    }

    if (!hasProperty(rotationValue, 'Rotation')) {
      this.errors.push(guid);
      return null;
    }

    if (!hasProperty(rotationValue, 'Value')) {
      this.errors.push(guid);
      return null;
    }

    const value = TTSParser.parseNumber(rotationValue.Value);
    if (!value) {
      this.errors.push(guid);
      return null;
    }

    if (!isObject(rotationValue.Rotation)) {
      this.errors.push(guid);
      return null;
    }

    if (
      !hasProperty(rotationValue.Rotation, 'x') ||
      !hasProperty(rotationValue.Rotation, 'y') ||
      !hasProperty(rotationValue.Rotation, 'z')
    ) {
      this.errors.push(guid);
      return null;
    }

    const rotation: number[] = [];
    for (const r of ['x', 'y', 'z'] as const) {
      const candidate = TTSParser.parseNumber(rotationValue.Rotation[r]);
      if (candidate === null) {
        this.errors.push(guid);
        return null;
      }
      rotation.push(candidate);
    }
    if (!isTuple(rotation, 3)) {
      this.errors.push(guid);
      return null;
    }

    return { rotation, value };
  }

  static parseURL(url: string | undefined): string | undefined {
    if (!url) return undefined;
    return url !== '' ? url : undefined;
  }

  static parseNumber(value: unknown): number | null {
    if (isNumber(value)) return value;
    if (isString(value)) {
      const candidate = parseInt(value);
      if (!isNaN(candidate)) return candidate;
    }
    return null;
  }
}

export default new TTSParser();
