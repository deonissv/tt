import { ActorStateBase } from './ActorStateBase';

export enum Tiles {
  BOX,
  HEX,
  CIRCLE,
  ROUNDED,
}

export class TileState extends ActorStateBase {
  type: Tiles;
  faceURL: string;
  backURL?: string;

  static override validate(state: ActorStateBase): state is TileState {
    return (state as TileState).type !== undefined;
  }
}
