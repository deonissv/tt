import type { Texture } from '@babylonjs/core/Materials/Textures/texture';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Loader } from '@tt/loader';
import type { CardGrid, DeckState } from '@tt/states';
import { AssetsManager } from './AssetsManages';
import { Card } from './Card';
import { ClientBase } from './ClientBase';

export class Deck extends ClientBase<DeckState> {
  constructor(state: DeckState, model: Mesh, faceTexture: Texture, backTexture: Texture) {
    super(state, model);
    this.renderDeck(faceTexture, backTexture, state.cards.at(-1)!, state.cards.length);
  }

  static async fromState(state: DeckState): Promise<Deck | null> {
    const model = await Loader.loadMesh(AssetsManager.CARD_MODEL_URL);

    if (!model) {
      return null;
    }

    const faceTexture = await Loader.loadTexture(state.cards.at(-1)!.faceURL);
    const backTexture = await Loader.loadTexture(state.cards.at(0)!.backURL);

    if (!faceTexture || !backTexture) {
      return null;
    }

    return new Deck(state, model, faceTexture, backTexture);
  }

  renderDeck(faceTexture: Texture, backTexture: Texture, grid: CardGrid, size: number) {
    this.setEnabled(size > 0);
    const cardModel = Card.getCardModel(this.model, faceTexture, backTexture, grid);
    this.__model = cardModel;
    this.model.scaling.y = size;
  }

  async rerenderDeck(grid: CardGrid, size: number) {
    const faceTexture = await Loader.loadTexture(grid.faceURL);
    const backTexture = await Loader.loadTexture(grid.backURL);

    if (!faceTexture || !backTexture) {
      return;
    }
    this.renderDeck(faceTexture, backTexture, grid, size);
  }
}
