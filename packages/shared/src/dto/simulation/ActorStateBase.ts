import type { Transformation } from './Transformation';

export class ActorStateBase {
  guid: string;
  name: string;
  transformation?: Transformation;
  mass?: number;

  static validate(_state: ActorStateBase): _state is ActorStateBase {
    throw new Error('Method not implemented.');
  }
}
