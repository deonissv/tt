import type { Texture } from '@babylonjs/core/Materials/Textures/texture';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';

import { MultiMaterial } from '@babylonjs/core/Materials/multiMaterial';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { SubMesh } from '@babylonjs/core/Meshes/subMesh';
import type { DeckState } from '@shared/dto/simulation';
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

interface Card {
  deckId: number;
  deckNumber: number;
  cardGUID: string;
}

export class Deck extends ActorBase {
  // protected __state: DeckState;
  protected cards: Card[];
  gridTextures: Record<number, [Texture, Texture]>;

  constructor(state: DeckState, model: Mesh, gridTextures: Record<number, [Texture, Texture]>) {
    const cards: Card[] = Object.entries(state.cards).map(([deck, cardGUID]) => {
      const [deckId, deckNumber] = deck.split(':').map(Number);
      return { deckId, deckNumber, cardGUID };
    });

    console.log(cards.length);

    model.scaling.x = cards.length;

    const deckMaterial = new MultiMaterial(`deck-${state.guid}-multimat`);
    const mat = new StandardMaterial(`deck-${state.guid}-base-mat`);
    const matFace = new StandardMaterial(`deck-${state.guid}-face-mat`);
    const matBack = new StandardMaterial(`deck-${state.guid}-back-mat`);

    deckMaterial.subMaterials.push(mat);
    deckMaterial.subMaterials.push(matFace);
    deckMaterial.subMaterials.push(matBack);

    new SubMesh(1, CARD_VERT_START, CARD_VERT_COUNT, CARD_FACE_INDEX_START, CARD_FACE_INDEX_COUNT, model);
    new SubMesh(2, CARD_VERT_START, CARD_VERT_COUNT, CARD_BACK_INDEX_START, CARD_BACK_INDEX_COUNT, model);

    model.material = deckMaterial;
    super(state.guid, state.name, model, undefined, state.transformation, CARD_MASS, undefined, state);
    this.gridTextures = gridTextures;

    // console.assert(ids === Object.keys(state.grids));
    const first = cards.at(0)!;
    const last = cards.at(-1)!;

    matFace.diffuseTexture = this.getFaceTexture(first.deckId, first.deckNumber);
    matBack.diffuseTexture = this.getBackTexture(last.deckId);
  }

  getFaceTexture(deckId: number, number: number): Texture {
    const grid = (this.__state as unknown as DeckState).grids[deckId];

    const faceTexture = this.gridTextures[deckId][0].clone();

    const cardWidth = 1 / grid.cols;
    const cardHeight = 1 / grid.rows;

    faceTexture.uOffset = cardWidth * number;
    faceTexture.vOffset = -cardHeight + cardWidth * number;

    faceTexture.uScale = cardWidth;
    faceTexture.vScale = cardHeight;

    return faceTexture;
  }

  getBackTexture(deckId: number): Texture {
    const backTexture = this.gridTextures[deckId][1].clone();
    return backTexture;
  }

  static async fromState(state: DeckState): Promise<Deck | null> {
    const model = await Loader.loadMesh(CARD_MODEL_URL);

    if (!model) {
      return null;
    }

    const loadedTextures = await Promise.all(
      Object.entries(state.grids).map(async ([id, grid]) => ({
        [id]: [(await Loader.loadTexture(grid.faceURL))!, (await Loader.loadTexture(grid.backURL))!],
      })),
    );
    const gridTextures = loadedTextures.reduce((acc, val) => {
      const [key, value] = Object.entries(val)[0];
      acc[Number(key)] = value;
      return acc;
    }, {}) as Record<number, [Texture, Texture]>;

    // @todo error handling

    model.setEnabled(true);

    return new Deck(state, model, gridTextures);
  }
}
