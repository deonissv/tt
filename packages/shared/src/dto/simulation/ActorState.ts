import type { OpnitalAllBut } from '@shared/utils';
import type { ActorModel } from './ActorModel';
import { ActorStateBase } from './ActorStateBase';

export class ActorState extends ActorStateBase {
  model: ActorModel;

  colorDiffuse?: number[]; // default: [1, 1, 1]
  children?: ActorState[];

  static override validate(state: ActorStateBase): state is ActorState {
    return (state as ActorState).model.meshURL !== undefined;
  }
}

export type ActorStateUpdate = OpnitalAllBut<ActorState, 'guid'>;
