import { Loader } from '@tt/loader';
import { containerSize } from '@tt/rules';
import type { ActorBaseState, BagState } from '@tt/states';
import { shuffle as shuffleItems, UUIDv4 } from '@tt/utils';
import { releaseSlot, reserveSlot, restoreSlot, spawnDrawnItem } from '../behaviors/container';
import { AssetsManager } from './assets-manager';
import { ServerBase } from './serverBase';

function refreshGUIDs(
  state: ActorBaseState & {
    children?: ActorBaseState[];
    containedObjects?: ActorBaseState[];
    cards?: ActorBaseState[];
  },
): void {
  // Nested templates may become live actors later, so copy their identities too.
  state.guid = UUIDv4();
  state.children?.forEach(refreshGUIDs);
  state.containedObjects?.forEach(refreshGUIDs);
  state.cards?.forEach(refreshGUIDs);
}

export class Bag extends ServerBase<BagState> {
  get size(): number {
    return containerSize(this.toState()) ?? 0;
  }

  async pickItem(clientId: string, pickHeight: number): Promise<ServerBase | null> {
    const state = this.toState();
    if (state.containedObjects.length < 1) return null;
    const child = structuredClone(state.containedObjects.at(-1)!);
    if (state.infinite) {
      refreshGUIDs(child);
      return spawnDrawnItem(this, child, clientId, pickHeight);
    }
    const slot = reserveSlot(this, state.containedObjects.length, true);
    this.updateState({ guid: state.guid, containedObjects: structuredClone(state.containedObjects.slice(0, -1)) });
    try {
      return await spawnDrawnItem(this, child, clientId, pickHeight, () => {
        const containedObjects = [...this.toState().containedObjects];
        containedObjects.splice(restoreSlot(slot), 0, child);
        this.updateState({ guid: this.guid, containedObjects });
      });
    } finally {
      releaseSlot(this, slot);
    }
  }

  static async fromState(state: BagState): Promise<Bag | null> {
    const colliderURL = state.model
      ? (state.model.colliderURL ?? state.model.meshURL)
      : AssetsManager.BAG_MODEL.colliderURL;

    const model = await Loader.loadMesh(colliderURL);

    if (!model) {
      return null;
    }

    return new this(state, model);
  }

  shuffle() {
    const containedObjects = structuredClone(this.toState().containedObjects);
    shuffleItems(containedObjects);
    this.updateState({ guid: this.guid, containedObjects });
  }
}
