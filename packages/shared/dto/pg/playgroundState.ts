import { ActorState, ActorStateUpdate } from './actorState';

export interface PlaygroundStateBase {
  leftHandedSystem?: boolean; // default: false | If true, the Y axis will be inverted, and the Z axis will be inverted
  gravity?: number; // default: -9.81
  table?: Table;
}

export interface PlaygroundState extends PlaygroundStateBase {
  actorStates: ActorState[];
  cursorPositions: CursorPositions;
}

export interface PlaygroundStateSave extends PlaygroundStateBase {
  actorStates?: ActorState[]; // Objects on the table
}

export interface PlaygroundStateUpdate {
  leftHandedSystem?: boolean;
  gravity?: number;

  actorStates?: ActorStateUpdate[];
  cursorPositions?: CursorPositions;
}

export interface Table {
  type: TableType;
  url?: string;
}

export type TableType = 'Circle' | 'Rectangle' | 'Hexagon' | 'Octagon' | 'Custom';
export type CursorPositions = Record<string, number[]>;

// export class PlaygroundState {
//   leftHandedSystem: boolean;
//   gravity: number;
//   actorStates: Map<string, ActorState>;
//   updated: string[];

//   constructor(save: PlaygroundStateSave) {
//     this.leftHandedSystem = save.leftHandedSystem ?? false;
//     this.gravity = save.gravity ?? -9.81;
//     this.actorStates = new Map((save?.actorStates ?? []).map(actorState => [actorState.guid, actorState]));
//     this.updated = [];
//   }

//   applyUpdate(pgUpdate: PlaygroundStateDelta) {
//     const actorUpdates = pgUpdate.actorStates ?? [];
//     actorUpdates.forEach(actorUpdate => {
//       const actorState = this.actorStates.get(actorUpdate.guid);
//       if (actorState) {
//         actorState.transformation = actorUpdate.transformation;
//         actorState.mass = actorUpdate.mass ?? actorState.mass;
//         this.updated.push(actorState.guid);
//       }
//     });
//   }

//   getUpdate(): PlaygroundStateDelta {
//     const actorUpdates = this.updated.map(guid => {
//       const actorState = this.actorStates.get(guid)!;
//       return {
//         guid: actorState.guid,
//         transformation: actorState.transformation ?? {},
//         mass: actorState.mass,
//       };
//     });

//     this.updated = [];
//     return {
//       actorStates: actorUpdates,
//     };
//   }

//   save(): PlaygroundStateSave {
//     return {
//       leftHandedSystem: this.leftHandedSystem,
//       gravity: this.gravity,
//       actorStates: Array.from(this.actorStates.values()),
//     };
//   }
// }
