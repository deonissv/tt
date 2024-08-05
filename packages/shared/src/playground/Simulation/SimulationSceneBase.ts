import { Scene } from '@babylonjs/core';
import { SharedBase } from '../actors/SharedBase';

export class SimulationSceneBase extends Scene {
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
