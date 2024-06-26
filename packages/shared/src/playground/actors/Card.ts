import { MultiMaterial } from '@babylonjs/core/Materials/multiMaterial';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import type { Texture } from '@babylonjs/core/Materials/Textures/texture';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import { SubMesh } from '@babylonjs/core/Meshes/subMesh';

import type { CardState } from '../../dto/simulation/ActorState';
import { Loader } from '../Loader';
import { ActorBase } from './ActorBase';

const CARD_MODEL_URL = 'http://localhost:5500/Card_Mesh.obj';

const CARD_MASS = 1;
const CARD_VERT_START = 0; //model.subMeshes[0].verticesStart
const CARD_VERT_COUNT = 137; // model.subMeshes[0].verticesCount;

// const frontFaces = [30, 31, 32, 33, 34, 35, 36, 24, 25, 26, 27, 28, 29, 37, 38, 39, 40];
// const backFaces = [88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 85, 86, 87, 80, 81, 82, 83, 84];
const CARD_FACE_INDEX_START = 72;
const CARD_FACE_INDEX_COUNT = 51;

const CARD_BACK_INDEX_START = 240;
const CARD_BACK_INDEX_COUNT = 60;

export class Card extends ActorBase {
  constructor(state: CardState, model: Mesh, faceTexture: Texture, backTexture: Texture) {
    if (state.grid) {
      const cardWidth = 1 / state.grid.cols;
      const cardHeight = 1 / state.grid.rows;

      faceTexture.uOffset = state.grid.col * cardWidth;
      faceTexture.vOffset = -cardHeight - state.grid.row * cardHeight;

      faceTexture.uScale = cardWidth;
      faceTexture.vScale = cardHeight;
    }

    const mat = new StandardMaterial('material');
    const matFace = new StandardMaterial('face');
    matFace.diffuseTexture = faceTexture;

    const matBack = new StandardMaterial('back');
    matBack.diffuseTexture = backTexture;

    const cardMat = new MultiMaterial('card');
    cardMat.subMaterials.push(mat);
    cardMat.subMaterials.push(matFace);
    cardMat.subMaterials.push(matBack);

    model.name = 'card';

    new SubMesh(1, CARD_VERT_START, CARD_VERT_COUNT, CARD_FACE_INDEX_START, CARD_FACE_INDEX_COUNT, model);
    new SubMesh(2, CARD_VERT_START, CARD_VERT_COUNT, CARD_BACK_INDEX_START, CARD_BACK_INDEX_COUNT, model);
    model.material = cardMat;

    super(state.guid, state.name, model, undefined, state.transformation, CARD_MASS);
  }
  static async fromState(state: CardState): Promise<Card | null> {
    const model = await Loader.loadMesh(CARD_MODEL_URL);

    if (!model) {
      return null;
    }

    const faceTexture = await Loader.loadTexture(state.faceURL);
    const backTexture = await Loader.loadTexture(state.backURL);

    if (!faceTexture || !backTexture) {
      return null;
    }

    model.setEnabled(true);

    return new Card(state, model, faceTexture, backTexture);
  }
}
