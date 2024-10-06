import type { ActorState } from '@tt/states';
import { Logger, SharedBase } from '@shared/playground';
import { ActorMixin } from '@shared/playground/actors/ActorMixin';
import { ServerBase } from './serverBase';

export class Actor extends ActorMixin(ServerBase<ActorState>) {
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
