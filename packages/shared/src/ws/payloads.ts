import type { Tuple } from '@babylonjs/core/types';
import type { UnknownActorState } from '@shared/dto/states/actor/ActorUnion';

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

export interface MoveServerActorPld {
  guid: string;
  position: Tuple<number, 2>;
}

export type CursorsPld = Record<string, Tuple<number, 2>>;

export interface DropActorPld {
  guid: string;
  position: Tuple<number, 3>;
}

export interface SpawnActorPld {
  state: UnknownActorState;
}
