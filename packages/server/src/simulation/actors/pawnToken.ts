import type { ActorBaseState, PawnTokenState } from '@tt/states';
import { Loader } from '@shared/playground';
import { AssetsManager } from './assets-manager';
import { ServerBase } from './serverBase';

export class PawnToken extends ServerBase<ActorBaseState> {
  static async fromState(state: PawnTokenState): Promise<PawnToken | null> {
    const model = await Loader.loadMesh(AssetsManager.PAWN_TOKEN_MODEL.meshURL);

    if (!model) {
      return null;
    }

    return new this(state, model);
  }
}
