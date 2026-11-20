import type { Quaternion } from '@babylonjs/core';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import { CardMixin } from '@tt/actors';
import { Loader } from '@tt/loader';
import type { CardState } from '@tt/states';
import type { Constructor } from '@tt/utils';
import { imageSize } from 'image-size';
import { AssetsManager } from './assets-manager';
import { ServerBase } from './serverBase';

const faceDimensions = new WeakMap<object, { width: number; height: number }>();
const FACE_METADATA_TIMEOUT_MS = 5_000;

async function getFaceAspectRatio(state: CardState): Promise<number | undefined> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const face = await Promise.race([
      Loader.fetchFile(state.faceURL),
      new Promise<null>(resolve => {
        timeout = setTimeout(() => resolve(null), FACE_METADATA_TIMEOUT_MS);
      }),
    ]);
    if (!face) return undefined;
    let dimensions = faceDimensions.get(face);
    if (!dimensions) {
      dimensions = imageSize(Buffer.from(face.url.slice(face.url.indexOf(',') + 1), 'base64'));
      faceDimensions.set(face, dimensions);
    }
    const ratio = dimensions.width / state.cols / (dimensions.height / state.rows);
    return Number.isFinite(ratio) && ratio > 0 ? ratio : undefined;
  } catch {
    // Missing image metadata must not prevent the card's mesh from spawning.
    return undefined;
  } finally {
    clearTimeout(timeout);
  }
}

class CardBase extends ServerBase<CardState> {
  constructor(state: CardState, model: Mesh) {
    super(state, model);
  }
}

export class Card extends CardMixin<Constructor<ServerBase<CardState>>>(CardBase) {
  getPickRotation(): Quaternion {
    return this.absoluteRotationQuaternion;
  }

  static async fromState(state: CardState): Promise<Card | null> {
    const model = await Loader.loadMesh(AssetsManager.CARD_MODEL_URL);

    if (!model) {
      return null;
    }

    const faceAspectRatio = await getFaceAspectRatio(state);
    return new this({ ...state, faceAspectRatio }, model);
  }
}
