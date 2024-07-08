import type {
  ActorState,
  ActorStateBase,
  DeckGrid,
  DeckState,
  SimulationStateSave,
  TableState,
  TableType,
  Transformation,
} from '@shared/dto/simulation';
import type { ObjectState } from '@shared/tts-model/ObjectState';
import type { SaveState } from '@shared/tts-model/SaveState';
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
            acc.push(actorState);
          }
          return acc;
        }, []);
      }
      return save;
    } catch (e) {
      this.error = true;
      console.error('Tts parse failed', e);
      return null;
    }
  }

  parseTable = (obj: SaveState): TableState => {
    return {
      type: this.mapTableType(obj.Table),
      url: obj.TableURL,
    };
  };

  mapTableType(type: string): TableType {
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
      case '':
      default:
        return 'Custom';
    }
  }

  parseObject = (objectState: ObjectState): ActorState | null => {
    let actorState: ActorState | null = null;

    actorState = this.parseDeck(objectState) as unknown as ActorState;
    if (actorState) {
      return actorState;
    }

    actorState = this.parseCustomObject(objectState);
    if (actorState) {
      return actorState;
    }

    this.errors.push(objectState.GUID);
    return null;
  };

  parseDeck(objectState: ObjectState): DeckState | null {
    try {
      const cardsGUID = objectState.ContainedObjects.map(o => o.GUID);
      const cards = objectState.DeckIDs.slice(0, cardsGUID.length).map((id, i) => {
        const deckId = +id.toString().slice(0, -2);
        const sequence = +id.toString().slice(-2);
        return {
          cardGUID: cardsGUID[i],
          deckId,
          sequence,
        };
      });

      const deckState: DeckState = {
        ...this.parseActorBase(objectState),
        cards,
        grids: Object.entries(objectState.CustomDeck).reduce<Record<number, DeckGrid>>((acc, [key, d]) => {
          acc[+key] = {
            faceURL: d.FaceURL,
            backURL: d.BackURL,
            cols: d.NumWidth ? +d.NumWidth : 10,
            rows: d.NumHeight ? +d.NumHeight : 7,
          };
          return acc;
        }, {}),
      };

      return deckState;
    } catch (e) {
      return null;
    }
  }

  parseCustomObject(objectState: ObjectState): ActorState | null {
    try {
      const actorState: ActorState = {
        ...this.parseActorBase(objectState),
        model: {
          meshURL: objectState.CustomMesh.MeshURL,
          colliderURL: objectState.CustomMesh.ColliderURL != '' ? objectState.CustomMesh.ColliderURL : undefined,
          diffuseURL: objectState.CustomMesh.DiffuseURL != '' ? objectState.CustomMesh.DiffuseURL : undefined,
          normalURL: objectState.CustomMesh.NormalURL != '' ? objectState.CustomMesh.NormalURL : undefined,
        },
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
            acc.push(actorState);
          }
          return acc;
        }, []);
      }

      return actorState;
    } catch (e) {
      return null;
    }
  }

  parseTransform(transform: TransformState): Transformation {
    return {
      position: [transform.posX, transform.posY, transform.posZ],
      rotation: [transform.rotX, transform.rotY, transform.rotZ].map(degToRad),
      scale: [transform.scaleX, transform.scaleY, transform.scaleZ],
    };
  }

  parseActorBase(objectState: ObjectState): ActorStateBase {
    const actorState: ActorStateBase = {
      name: objectState.Name,
      guid: objectState.GUID,
      transformation: this.parseTransform(objectState.Transform),
    };

    if (objectState?.Rigidbody?.Mass) {
      actorState.mass = objectState?.Rigidbody?.Mass;
    }

    return actorState;
  }
}

export default new TTSParser();
