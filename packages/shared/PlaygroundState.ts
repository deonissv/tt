export interface PlaygroundStateSave {
  leftHandedSystem?: boolean; // default: false | If true, the Y axis will be inverted, and the Z axis will be inverted
  gravity?: number; // default: -9.81

  actorStates: ActorState[]; // Objects on the table
}

export interface ActorState {
  name: string;
  guid: string;
  model: Model;

  transformation?: Transformation;
  mass?: number; // default: 1
}

export interface Transformation {
  scale?: number[]; // default: Vector3.One
  rotation?: number[]; // default: Vector3.Zero
  position?: number[]; // default: Vector3.Zero
}

export interface Model {
  // @TODO extend https://doc.babylonjs.com/typedoc/classes/BABYLON.Material
  meshURL: string;
  colliderURL?: string; // default: meshURL

  diffuseURL?: string;
  ambientURL?: string;
  specularURL?: string;
  emissiveURL?: string;
  reflectionURL?: string;
  normalURL?: string; // BABYLON.StandardMaterial().bumpTexture;
  opacityURL?: string;
  lightmapURL?: string;
}

export interface PlaygroundStateUpdate {
  leftHandedSystem?: boolean;
  gravity?: number;

  actortStates?: ActorStateUpdate[];
}

export interface ActorStateUpdate {
  guid: string;
  transformation?: Transformation;
  mass?: number;
}

export class PlaygroundState {
  leftHandedSystem: boolean;
  gravity: number;
  actorStates: Map<string, ActorState>;
  updated: string[];

  constructor(save: PlaygroundStateSave) {
    this.leftHandedSystem = save.leftHandedSystem ?? false;
    this.gravity = save.gravity ?? -9.81;
    this.actorStates = new Map(save.actorStates.map(actorState => [actorState.guid, actorState]));
    this.updated = [];
  }

  applyUpdate(pgUpdate: PlaygroundStateUpdate) {
    const actorUpdates = pgUpdate.actortStates ?? [];
    actorUpdates.forEach(actorUpdate => {
      const actorState = this.actorStates.get(actorUpdate.guid);
      if (actorState) {
        actorState.transformation = actorUpdate.transformation;
        actorState.mass = actorUpdate.mass ?? actorState.mass;
        this.updated.push(actorState.guid);
      }
    });
  }

  getUpdate(): PlaygroundStateUpdate {
    const actorUpdates = this.updated.map(guid => {
      const actorState = this.actorStates.get(guid)!;
      return {
        guid: actorState.guid,
        transformation: actorState.transformation ?? {},
        mass: actorState.mass,
      };
    });

    this.updated = [];
    return {
      actortStates: actorUpdates,
    };
  }

  save(): PlaygroundStateSave {
    return {
      leftHandedSystem: this.leftHandedSystem,
      gravity: this.gravity,
      actorStates: Array.from(this.actorStates.values()),
    };
  }
}
