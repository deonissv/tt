import { StandardMaterial } from '@babylonjs/core';
import type { ActorBaseState, PawnTokenState } from '@shared/dto/states';
import { Loader } from '@shared/playground';
import { AssetsManager } from './AssetsManages';
import { ClientBase } from './ClientBase';

export class PawnToken extends ClientBase<ActorBaseState> {
  static async fromState(state: PawnTokenState): Promise<PawnToken | null> {
    const model = await Loader.loadMesh(AssetsManager.PAWN_TOKEN_MODEL.meshURL);

    if (!model) {
      return null;
    }

    const material = new StandardMaterial('pawn-token-material');
    model.material = material;

    return new this(state, model);
  }
}
