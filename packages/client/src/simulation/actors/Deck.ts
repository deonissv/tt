import type { Texture } from '@babylonjs/core/Materials/Textures/texture';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { CardGrid, DeckState } from '@tt/states';
import { Loader } from '@shared/playground';
import { DeckMixin } from '@shared/playground/actors/DeckMixin';
import { AssetsManager } from './AssetsManages';
import { Card } from './Card';
import { ClientBase } from './ClientBase';

export class Deck extends DeckMixin(ClientBase) {
  constructor(state: DeckState, model: Mesh, faceTexture: Texture, backTexture: Texture) {
    const items = state.cards;

    super(state, model);

    this.items = items;
    this.renderDeck(faceTexture, backTexture);
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

  renderDeck(faceTexture: Texture, backTexture: Texture, grid?: CardGrid) {
    if (this.items.length === 0) {
      this.setEnabled(false);
    }

    if (!grid) {
      grid = this.items.at(-1)!;
    }
    const cardModel = Card.getCardModel(this.model, faceTexture, backTexture, grid);
    this.__model = cardModel;

    this.model.scaling.y = this.size;
  }

  async rerenderDeck(grid: CardGrid, size: number) {
    this._size = size;

    const faceTexture = await Loader.loadTexture(grid.faceURL);
    const backTexture = await Loader.loadTexture(grid.backURL);

    if (!faceTexture || !backTexture) {
      return;
    }
    this.renderDeck(faceTexture, backTexture, grid);
  }
}
