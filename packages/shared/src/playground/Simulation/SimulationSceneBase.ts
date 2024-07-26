import { Scene } from '@babylonjs/core';
import { ActorBase } from '../actors';

export class SimulationSceneBase extends Scene {
  get actors() {
    return this.rootNodes.reduce((acc, node) => {
      const actorCandidate = node as ActorBase;
      if (actorCandidate && actorCandidate instanceof ActorBase && !actorCandidate.guid.startsWith('#')) {
        acc.push(actorCandidate);
      }
      return acc;
    }, [] as ActorBase[]);
  }
}
