import type { Tuple } from '@babylonjs/core/types';
import type { UnknownActorState } from '@shared/dto/states/actor/ActorUnion';
import type { CardGrid } from '@shared/dto/states/actor/CardState';

export interface DownloadProgressPld {
  loaded: number;
  total: number;
  succeded: number;
  failed: number;
}

export interface MoveClientActorPld {
  guid: string;
  position: Tuple<number, 3>;
}

export interface RotateClientActorPld {
  guid: string;
  position: Tuple<number, 3>;
}

export interface MoveServerActorPld {
  guid: string;
  position: Tuple<number, 2>;
}

export type CursorsPld = Record<string, Tuple<number, 2>>;

export interface DropActorPld {
  guid: string;
  position: Tuple<number, 3>;
}

export interface SpawnPickedActorPld {
  clientId: string;
  state: UnknownActorState;
}

export interface RerenderDeckPld {
  guid: string;
  grid: CardGrid;
  size: number;
}
