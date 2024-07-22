import type { ObjectState } from '@shared/tts-model/ObjectState';
import type { SaveState } from '@shared/tts-model/SaveState';

import type { ActorStateBase, CardState, Transformation } from '@shared/dto/states';
import {
  ActorType,
  type ActorState,
  type BagState,
  type DeckState,
  type Model,
  type SimulationStateSave,
  type TableState,
  type TableType,
  type TileState,
  type TileType,
} from '@shared/dto/states';
import type { TransformState } from '@shared/tts-model/TransformState';
import { degToRad } from '../utils';

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
    if (loweredType.includes('bag')) {
      return ActorType.BAG;
    } else if (loweredType.includes('card')) {
      return ActorType.CARD;
    } else if (loweredType.includes('deck')) {
      return ActorType.DECK;
    } else if (loweredType.includes('tile')) {
      return ActorType.TILE;
    } else if (loweredType.includes('model')) {
      return ActorType.ACTOR;
    } else {
      return null;
    }
  }

  parseObject = (objectState: ObjectState): ActorStateBase | null => {
    try {
      const type = this.mapType(objectState.Name);
      switch (type) {
        case ActorType.BAG:
          return this.parseBag(objectState) as unknown as ActorState;
        case ActorType.CARD:
          return this.parseCard(objectState) as unknown as ActorState;
        case ActorType.TILE:
          return this.parseTile(objectState) as unknown as ActorState;
        case ActorType.DECK:
          return this.parseDeck(objectState) as unknown as ActorState;
        case ActorType.ACTOR:
          return this.parseCustomObject(objectState);
        default:
          return null;
      }
    } catch (e) {
      this.errors.push(objectState.GUID);
      return null;
    }
  };

  parseBag(objectState: ObjectState): BagState | null {
    try {
      const containedObjects = objectState.ContainedObjects.map(o => {
        const actorState = this.parseObject(o);
        if (actorState) {
          return actorState;
        }
        return null;
      });

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

    const tileState: TileState = {
      type: ActorType.TILE,
      ...this.parseActorBase(objectState),
      faceURL,
      tileType: objectState.CustomImage?.CustomTile.Type as unknown as TileType,
    };

    const backURL = TTSParser.parseURL(objectState.CustomImage?.ImageSecondaryURL);
    backURL && (tileState.backURL = backURL);

    return tileState;
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

  static parseURL(url: string | undefined): string | undefined {
    if (!url) return undefined;
    return url !== '' ? url : undefined;
  }
}

export default new TTSParser();
