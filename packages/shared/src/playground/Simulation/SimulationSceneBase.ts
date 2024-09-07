import { Scene } from '@babylonjs/core/scene';
import { SharedBase } from '../actors/SharedBase';

const GET_GUID_ATTEMPTS = 1000000;
export class SimulationSceneBase extends Scene {
  getUniqueGUID() {
    const guids = this.actors.map(actor => actor.guid);
    if (guids.length > 999999) {
      throw new Error('Cant generate guid: Too many actors');
    }

    for (let i = 0; i < GET_GUID_ATTEMPTS; i++) {
      const candidate = crypto.randomUUID().slice(0, 6);
      if (!guids.includes(candidate)) {
        return candidate;
      }
    }
    throw new Error('Cant generate guid: Too many attempts');
  }

  get actors() {
    return this.rootNodes.reduce((acc, node) => {
      const actorCandidate = node as SharedBase;
      if (actorCandidate && actorCandidate instanceof SharedBase && !actorCandidate.guid.startsWith('#')) {
        acc.push(actorCandidate);
      }
      return acc;
    }, [] as SharedBase[]);
  }
}
