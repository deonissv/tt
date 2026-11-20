import type { Texture } from '@babylonjs/core/Materials/Textures/texture';
import type { MultiMaterial } from '@babylonjs/core/Materials/multiMaterial';
import type { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import { CardMixin, FlatModel } from '@tt/actors';
import { Loader } from '@tt/loader';
import type { CardGrid, CardState } from '@tt/states';
import { AssetsManager } from './AssetsManages';
import { ClientBase } from './ClientBase';

const CARD_VERT_START = 0; //model.subMeshes[0].verticesStart
const CARD_VERT_COUNT = 137; // model.subMeshes[0].verticesCount;

// const frontFaces = [30, 31, 32, 33, 34, 35, 36, 24, 25, 26, 27, 28, 29, 37, 38, 39, 40];
// const backFaces = [88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 85, 86, 87, 80, 81, 82, 83, 84];
const CARD_FACE_INDEX_START = 72;
const CARD_FACE_INDEX_COUNT = 51;

const CARD_BACK_INDEX_START = 240;
const CARD_BACK_INDEX_COUNT = 60;

// card width: 3.2 x 2
export class Card extends CardMixin(ClientBase<CardState>) {
  constructor(state: CardState, model: Mesh, faceTexture: Texture, backTexture: Texture) {
    const cardModel = Card.getCardModel(model, faceTexture, backTexture, state);
    super(state, cardModel);
  }

  static async fromState(state: CardState): Promise<Card | null> {
    const model = await Loader.loadMesh(AssetsManager.CARD_MODEL_URL);

    if (!model) {
      return null;
    }

    const faceTexture = await Loader.loadTexture(state.faceURL);
    const backTexture = await Loader.loadTexture(state.backURL);

    if (!faceTexture || !backTexture) {
      return null;
    }

    return new Card(state, model, faceTexture, backTexture);
  }

  private static setFaceGrid(faceTexture: Texture, grid: CardGrid) {
    const [col, row] = Card.getColRow(grid.sequence, grid.cols);

    const cardWidth = 1 / grid.cols;
    const cardHeight = 1 / grid.rows;

    faceTexture.uOffset = col * cardWidth;
    faceTexture.vOffset = -cardHeight - row * cardHeight;

    faceTexture.uScale = cardWidth;
    faceTexture.vScale = cardHeight;
  }

  static getCardModel(model: Mesh, faceTexture: Texture, backTexture: Texture, grid: CardGrid) {
    Card.setFaceGrid(faceTexture, grid);

    const cardModel = FlatModel(
      model,
      {
        texture: faceTexture,
        vertStart: CARD_VERT_START,
        vertCount: CARD_VERT_COUNT,
        faceIndexStart: CARD_FACE_INDEX_START,
        faceIndexCount: CARD_FACE_INDEX_COUNT,
      },
      {
        texture: backTexture,
        vertStart: CARD_VERT_START,
        vertCount: CARD_VERT_COUNT,
        faceIndexStart: CARD_BACK_INDEX_START,
        faceIndexCount: CARD_BACK_INDEX_COUNT,
      },
    );

    cardModel.scaling.x = 1.6;
    Card.updateWidth(cardModel, faceTexture, grid);
    return cardModel;
  }

  private static updateWidth(model: Mesh, faceTexture: Texture, grid: CardGrid) {
    const material = model.material as MultiMaterial;
    const updateWidth = () => {
      // Ignore an image that finished after another reveal or deck rerender.
      if (
        model.isDisposed() ||
        model.material !== material ||
        (material.subMaterials[1] as StandardMaterial).diffuseTexture !== faceTexture
      )
        return;
      if (grid.faceAspectRatio && Number.isFinite(grid.faceAspectRatio) && grid.faceAspectRatio > 0) {
        model.scaling.x = 1.6 * grid.faceAspectRatio;
        return;
      }
      const { width, height } = faceTexture.getBaseSize();
      if (width > 0 && height > 0) {
        model.scaling.x = 1.6 * (width / grid.cols / (height / grid.rows));
      }
    };

    updateWidth();
    if (!faceTexture.isReady()) faceTexture.onLoadObservable.addOnce(updateWidth);
  }

  static getColRow(sequence: number, cols: number): [number, number] {
    const col = sequence % cols;
    const row = Math.floor(sequence / cols);
    return [col, row];
  }

  /**
   * Rebuilds the card textures after a reveal: a card spawned face-down
   * carried a redacted face until the server says it is public now.
   */
  async rerenderCard(grid: CardGrid): Promise<void> {
    if (
      this.__state.faceURL === grid.faceURL &&
      this.__state.backURL === grid.backURL &&
      this.__state.cols === grid.cols &&
      this.__state.rows === grid.rows &&
      this.__state.sequence === grid.sequence
    )
      return;
    const faceTexture = await Loader.loadTexture(grid.faceURL);
    if (!faceTexture) return;
    if (this.isDisposed()) {
      faceTexture.dispose();
      return;
    }
    const material = this.model.material as MultiMaterial;
    const faceMaterial = material.subMaterials[1] as StandardMaterial;
    const previousFace = faceMaterial.diffuseTexture;
    Card.setFaceGrid(faceTexture, grid);
    faceMaterial.diffuseTexture = faceTexture;
    this.__state = { ...this.__state, ...grid };
    Card.updateWidth(this.model, faceTexture, this.__state);
    if (previousFace !== (material.subMaterials[2] as StandardMaterial).diffuseTexture) previousFace?.dispose();
  }
}
