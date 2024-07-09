import { MultiMaterial } from '@babylonjs/core/Materials/multiMaterial';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import type { Texture } from '@babylonjs/core/Materials/Textures/texture';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import { SubMesh } from '@babylonjs/core/Meshes/subMesh';

import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { CardGrid, CardState } from '@shared/dto/simulation';
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
    const cardModel = Card.getCardModel(model, faceTexture, backTexture, state.grid);
    super(state.guid, state.name, cardModel, undefined, state.transformation, CARD_MASS);
  }

  static getCardModel(model: Mesh, faceTexture: Texture, backTexture: Texture, grid?: CardGrid) {
    if (grid) {
      const [col, row] = Card.getColRow(grid.sequence, grid.cols, grid.rows);

      const cardWidth = 1 / grid.cols;
      const cardHeight = 1 / grid.rows;

      faceTexture.uOffset = col * cardWidth;
      faceTexture.vOffset = -cardHeight - row * cardHeight;

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
    return model;
  }

  static getColRow(sequence: number, cols: number, rows: number): [number, number] {
    const col = Math.floor(sequence / cols);
    const row = sequence % rows;
    return [col, row];
  }

  static async loadCardModel(): Promise<Mesh | null> {
    const mesh = await Loader.loadMesh(CARD_MODEL_URL);
    if (!mesh) {
      return null;
    }
    mesh.rotation.y = Math.PI / 2;
    mesh.rotation.z = Math.PI / 2;

    mesh.scaling = new Vector3(2, 2.093, 1.77);
    return mesh;
  }

  static async fromState(state: CardState): Promise<Card | null> {
    const model = await Card.loadCardModel();

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
