import type { ObjectState } from '@shared/tts-model/ObjectState';

import type { Tuple } from '@babylonjs/core/types';
import type {
  ActorBaseState,
  CardState,
  DeckState,
  DieBaseState,
  DieNState,
  DieType,
  Model,
  RotationValue,
  TableType,
  Transformation,
} from '@shared/dto/states';
import {
  ActorMapper,
  ActorType,
  DieMapper,
  type ActorState,
  type BagState,
  type SimulationStateSave,
  type TableState,
  type TileState,
  type TileType,
} from '@shared/dto/states';
import type { UnknownActorState } from '@shared/dto/states/actor/ActorUnion';
import type { CustomImage } from '@shared/dto/states/actor/FlatActorState';
import type { TileStackState } from '@shared/dto/states/actor/Stack';
import { hasProperty, isObject, isTuple } from '@shared/guards';
import type { CustomImageState } from '@shared/tts-model/CustomImageState';
import type { CustomMeshState } from '@shared/tts-model/CustomMeshState';
import type { TransformState } from '@shared/tts-model/TransformState';
import type { DeepPartial, Defined, OptionalAllBut } from '@shared/types';
import { degToRad } from '@shared/utils';
import { ParserBase } from './ParserBase';

type MinimalObjectState = OptionalAllBut<ObjectState, ['GUID', 'Name']>;

export class TTSParserC extends ParserBase {
  parse(tts: string): SimulationStateSave | null {
    try {
      const obj = JSON.parse(tts) as unknown;
      const save: SimulationStateSave = {
        leftHandedSystem: true,
      };

      if (!this.isObject(obj, 'ERROR 1')) return null;
      if (!this.hasProperty(obj, 'ObjectStates', 'ERROR 2')) return null;
      if (!this.isArray(obj.ObjectStates, 'ERROR 3')) return null;

      if (hasProperty(obj, 'Gravity')) {
        const candidate = this.parseNumber(obj.Gravity);
        if (candidate) Object.assign(save, { gravity: candidate * 9.8 });
      }

      const candidate = this.parseTable(obj);
      if (candidate) save.table = candidate;

      save.actorStates = obj.ObjectStates.reduce<Defined<SimulationStateSave['actorStates']>>((acc, o) => {
        const actorState = this.parseObject(o);
        if (actorState) {
          acc.push(actorState);
        }
        return acc;
      }, []);

      return save;
    } catch {
      this.errors.push('TTS_PARSE');
      return null;
    }
  }

  parseObject = (objectState: unknown): UnknownActorState | null => {
    if (!this.isObject(objectState, 'ERROR 4')) return null;
    if (!this.hasProperty(objectState, 'GUID', 'ERROR 5')) return null;
    if (!this.isPropertyString(objectState, 'GUID', 'ERROR 6')) return null;
    if (!this.hasProperty(objectState, 'Name', 'ERROR 7')) return null;
    if (!this.isPropertyString(objectState, 'Name', 'ERROR 8')) return null;

    this.guids.push(objectState.GUID);

    const type = this.mapType(objectState.Name);
    this.assert(type !== null, `Failed to parse object type ${this.guid}`);

    const parsedObject = this.parseUnknownActorState(objectState);

    this.guids.pop();
    return parsedObject;
  };

  parseUnknownActorState(objectState: MinimalObjectState): UnknownActorState | null {
    const type = this.mapType(objectState.Name);
    if (type === null) {
      this.errors.push(objectState.GUID);
      return null;
    }

    switch (type) {
      case ActorType.BAG:
        return this.parseBag(objectState as ObjectState);
      case ActorType.CARD:
        return this.parseCard(objectState as ObjectState);
      case ActorType.TILE:
        return this.parseTile(objectState as ObjectState);
      case ActorType.TILE_STACK:
        return this.parseTileStack(objectState as ObjectState);
      case ActorType.DECK:
        return this.parseDeck(objectState as ObjectState);
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
  }

  parseActorBase(objectState: MinimalObjectState): Omit<ActorBaseState, 'type'> | null {
    const actorState: Omit<ActorBaseState, 'type'> = {
      guid: objectState.GUID,
      name: objectState.Name,
    };

    if (this.hasProperty(objectState, 'Transform')) {
      if (this.isObject(objectState.Transform, 'ERROR 9')) {
        const transformation = this.parseTransform(objectState.Transform);
        if (transformation !== null) {
          actorState.transformation = transformation;
        }
      }
    }

    if (this.hasProperty(objectState, 'Rigidbody') && this.isObject(objectState.Rigidbody, 'ERROR 10')) {
      if (this.hasProperty(objectState.Rigidbody, 'Mass')) {
        const mass = this.parseNumber(objectState.Rigidbody.Mass);
        if (mass !== null) {
          actorState.mass = mass;
        }
      }
    }

    return actorState;
  }

  parseModel(modelState: DeepPartial<CustomMeshState>): Model | null {
    if (!this.hasProperty(modelState, 'MeshURL', this.errorsText.MODEL.MESH.NO_URL)) return null;
    if (!this.isPropertyString(modelState, 'MeshURL', this.errorsText.MODEL.MESH.URL_INVALID)) return null;
    if (!this.isURL(modelState.MeshURL, this.errorsText.MODEL.MESH.URL_INVALID)) return null;

    const model: Model = {
      meshURL: modelState.MeshURL,
    };

    if (
      this.hasProperty(modelState, 'ColliderURL') &&
      this.isPropertyString(modelState, 'ColliderURL', this.errorsText.MODEL.COLLDER.URL_NOT_STRING) &&
      this.isURL(modelState.ColliderURL, this.errorsText.MODEL.COLLDER.URL_INVALID)
    ) {
      model.colliderURL = modelState.ColliderURL;
    }

    if (
      this.hasProperty(modelState, 'DiffuseURL') &&
      this.isPropertyString(modelState, 'DiffuseURL', this.errorsText.MODEL.DIFFUSE.URL_NOT_STRING) &&
      this.isURL(modelState.DiffuseURL, this.errorsText.MODEL.DIFFUSE.URL_INVALID)
    ) {
      model.diffuseURL = modelState.DiffuseURL;
    }

    if (
      this.hasProperty(modelState, 'NormalURL') &&
      this.isPropertyString(modelState, 'NormalURL', this.errorsText.MODEL.NORMAL.URL_NOT_STRING) &&
      this.isURL(modelState.NormalURL, this.errorsText.MODEL.NORMAL.URL_INVALID)
    ) {
      model.normalURL = modelState.NormalURL;
    }

    return model;
  }

  parseTransform(transform: DeepPartial<TransformState>): Transformation | null {
    const transformState: Transformation = {};

    if (!this.hasProperty(transform, 'posX', this.errorsText.TRANSFORM.NO_POS_X)) return null;
    if (!this.hasProperty(transform, 'posY', this.errorsText.TRANSFORM.NO_POS_Y)) return null;
    if (!this.hasProperty(transform, 'posZ', this.errorsText.TRANSFORM.NO_POS_Z)) return null;

    const posX = this.parseNumber(transform.posX);
    const posY = this.parseNumber(transform.posY);
    const posZ = this.parseNumber(transform.posZ);
    if (posX !== null && posY !== null && posZ !== null) {
      transformState.position = [posX, posY, posZ];
    }

    if (!this.hasProperty(transform, 'rotX', this.errorsText.TRANSFORM.NO_ROT_X)) return null;
    if (!this.hasProperty(transform, 'rotY', this.errorsText.TRANSFORM.NO_ROT_Y)) return null;
    if (!this.hasProperty(transform, 'rotZ', this.errorsText.TRANSFORM.NO_ROT_Z)) return null;

    const rotX = this.parseNumber(transform.rotX);
    const rotY = this.parseNumber(transform.rotY);
    const rotZ = this.parseNumber(transform.rotZ);
    if (rotX !== null && rotY !== null && rotZ !== null) {
      transformState.rotation = [rotX, rotY, rotZ].map(degToRad) as Tuple<number, 3>;
    }

    if (!this.hasProperty(transform, 'scaleX', this.errorsText.TRANSFORM.NO_SCALE_X)) return null;
    if (!this.hasProperty(transform, 'scaleY', this.errorsText.TRANSFORM.NO_SCALE_Y)) return null;
    if (!this.hasProperty(transform, 'scaleZ', this.errorsText.TRANSFORM.NO_SCALE_Z)) return null;

    const scaleX = this.parseNumber(transform.scaleX);
    const scaleY = this.parseNumber(transform.scaleY);
    const scaleZ = this.parseNumber(transform.scaleZ);
    if (scaleX !== null && scaleY !== null && scaleZ !== null) {
      transformState.scale = [scaleX, scaleY, scaleZ];
    }

    return transformState;
  }

  parseCustomImage(customImage: DeepPartial<CustomImageState>): CustomImage | null {
    if (!this.hasProperty(customImage, 'ImageURL', this.errorsText.CUSTOM_IMAGE.IMAGE_URL.NO_PROPERTY)) return null;
    if (!this.isPropertyString(customImage, 'ImageURL', this.errorsText.CUSTOM_IMAGE.IMAGE_URL.NOT_STRING)) return null;
    if (!this.isURL(customImage.ImageURL, this.errorsText.CUSTOM_IMAGE.IMAGE_URL.INVALID)) return null;

    const flatActorState: CustomImage = {
      faceURL: customImage.ImageURL,
    };

    if (
      this.hasProperty(customImage, 'ImageSecondaryURL') &&
      this.isPropertyString(customImage, 'ImageSecondaryURL', this.errorsText.CUSTOM_IMAGE.SECONDARY_URL.NOT_STRING) &&
      this.isURL(customImage.ImageSecondaryURL, this.errorsText.CUSTOM_IMAGE.SECONDARY_URL.INVALID)
    ) {
      flatActorState.backURL = customImage.ImageSecondaryURL;
    }

    if (this.hasProperty(customImage, 'WidthScale')) {
      const widthScale = this.parseNumber(customImage.WidthScale);
      if (widthScale !== null) flatActorState.widthScale = widthScale;
    }

    return flatActorState;
  }

  parseTable = (tableObj: object): TableState | null => {
    if (!this.hasProperty(tableObj, 'Table', this.errorsText.TALBE.NO_TYPE_PROPERTY)) return null;
    if (!this.isPropertyString(tableObj, 'Table', this.errorsText.TALBE.TYPE_PROPERTY_NOT_STRING)) return null;

    const type = this.mapTableType(tableObj.Table);
    if (type === null) return null;

    const tableState: TableState = { type };

    if (hasProperty(tableObj, 'TableURL')) {
      if (
        this.isPropertyString(tableObj, 'TableURL', this.errorsText.TALBE.TABLE_URL_NOT_STRING) &&
        this.isURL(tableObj.TableURL, this.errorsText.TALBE.TABLE_URL_INVALID)
      ) {
        tableState.url = tableObj.TableURL;
      }
    }

    return tableState;
  };

  mapTableType(type: string): TableType | null {
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

  parseBag(objectState: MinimalObjectState): BagState | null {
    const actorBase = this.parseActorBase(objectState);
    if (!actorBase) return null;

    if (!this.hasProperty(objectState, 'ContainedObjects', 'ERROR 11')) return null;
    if (!this.isArray(objectState.ContainedObjects, 'ERROR 12')) return null;

    const containedObjects = objectState.ContainedObjects.map(o => this.parseObject(o));

    const model = this.parseModel(objectState);

    const bagState: BagState = {
      type: ActorType.BAG,
      ...actorBase,
      containedObjects: containedObjects.filter((o): o is ActorState => o !== null),
    };

    if (model) bagState.model = model;

    return bagState;
  }

  parseCard(objectState: MinimalObjectState, deck?: MinimalObjectState): CardState | null {
    const actorBase = this.parseActorBase(objectState);
    if (!actorBase) return null;

    const cardID = objectState.CardID;
    if (!cardID) {
      this.errors.push(objectState.GUID);
      return null;
    }

    // if (!this.hasProperty(objectState, 'CustomDeck', 'ERROR 12')) return null;
    // if (!this.isObject(objectState.CustomDeck, 'ERROR 13')) return null;

    const deckId = +cardID.toString().slice(0, -2);
    const sequence = +cardID.toString().slice(-2);
    if (!deckId || !sequence) {
      this.errors.push(objectState.GUID);
      return null;
    }

    const customDeckObj = objectState.CustomDeck?.[deckId] ?? deck?.CustomDeck?.[deckId]; // @todo validate
    if (!this.isObject(customDeckObj, 'ERROR 14')) return null;

    if (!this.hasProperty(customDeckObj, 'FaceURL', 'ERROR 15')) return null;
    if (!this.isString(customDeckObj.FaceURL, 'ERROR 16')) return null;
    if (!this.isURL(customDeckObj.FaceURL, 'ERROR 17')) return null;

    if (!this.hasProperty(customDeckObj, 'BackURL', 'ERROR 18')) return null;
    if (!this.isString(customDeckObj.BackURL, 'ERROR 19')) return null;
    if (!this.isURL(customDeckObj.BackURL, 'ERROR 20')) return null;

    const cols = customDeckObj.NumWidth ? +customDeckObj.NumWidth : 1;
    const rows = customDeckObj.NumHeight ? +customDeckObj.NumHeight : 1;

    const cardState: CardState = {
      type: ActorType.CARD,
      ...actorBase,
      faceURL: customDeckObj.FaceURL,
      backURL: customDeckObj.BackURL,
      cols,
      rows,
      sequence,
    };

    return cardState;
  }

  parseDeck(objectState: MinimalObjectState): DeckState | null {
    const actorBase = this.parseActorBase(objectState);
    if (!actorBase) return null;

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
      ...actorBase,
      cards,
    };
  }

  parseTile(objectState: MinimalObjectState): TileState | null {
    const actorBase = this.parseActorBase(objectState);
    if (!actorBase) return null;

    if (!this.hasProperty(objectState, 'CustomImage', this.errorsText.TILE.CUSTOM_IMAGE.NO_PROPERTY)) return null;
    if (!this.isObject(objectState.CustomImage, this.errorsText.TILE.CUSTOM_IMAGE.NOT_OBJECT)) return null;

    const customImage = this.parseCustomImage(objectState.CustomImage);
    if (!customImage) return null;

    const tileState: TileState = {
      type: ActorType.TILE,
      ...actorBase,
      ...customImage,
      tileType: objectState.CustomImage?.CustomTile.Type as unknown as TileType,
    };

    return tileState;
  }

  parseTileStack(objectState: MinimalObjectState): TileStackState | null {
    const tileState = this.parseTile(objectState);
    if (!tileState) {
      this.errors.push(objectState.GUID);
      return null;
    }

    const size = this.parseNumber(objectState?.Number);
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

  parseCustomObject(objectState: MinimalObjectState): ActorState | null {
    if (!this.hasProperty(objectState, 'CustomMesh', this.errorsText.ACTOR.CUSTOM_MESH.NO_PROPERTY)) return null;
    if (!this.isObject(objectState.CustomMesh, this.errorsText.ACTOR.CUSTOM_MESH.NOT_OBJECT)) return null;

    const model = this.parseModel(objectState.CustomMesh);
    if (!model) {
      return null;
    }

    const actorBase = this.parseActorBase(objectState);
    if (!actorBase) return null;

    const actorState: ActorState = {
      type: ActorType.ACTOR,
      ...actorBase,
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
  }

  parseDieN<N extends DieType>(objectState: ObjectState, dieType: N): DieNState<N> | null {
    const actorBase = this.parseActorBase(objectState);
    if (!actorBase) return null;

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
      ...actorBase,
      type: DieMapper[dieType],
      rotationValues,
    };
  }

  parseDieBase(objectState: ObjectState): Omit<DieBaseState, 'type'> | null {
    const actorBase = this.parseActorBase(objectState);
    if (!actorBase) return null;

    const rotationValues = this.parseRotatioValues(objectState);
    if (!rotationValues) {
      this.errors.push(objectState.GUID);
      return null;
    }

    const dieState = {
      ...actorBase,
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

    const value = this.parseNumber(rotationValue.Value);
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
      const candidate = this.parseNumber(rotationValue.Rotation[r]);
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
}

export const TTSParser = new TTSParserC();
