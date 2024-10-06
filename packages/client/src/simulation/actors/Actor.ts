import { ActorMixin, SharedBase } from '@tt/actors';
import { Logger } from '@tt/logger';
import type { ActorState } from '@tt/states';
import { ClientBase } from './ClientBase';

export class Actor extends ActorMixin(ClientBase<ActorState>) {
  static async fromState(actorState: ActorState): Promise<Actor | null> {
    const modelMesh = await SharedBase.modelFromState(actorState);
    if (!modelMesh) {
      Logger.log('Failed to load model mesh');
      return null;
    }
    const colliderMesh = (await SharedBase.colliderFromState(actorState)) ?? undefined;
    return new Actor(actorState, modelMesh, colliderMesh);
  }
}
