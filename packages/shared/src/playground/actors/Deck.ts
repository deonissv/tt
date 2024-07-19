import type { Texture } from '@babylonjs/core/Materials/Textures/texture';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';

import type { CardState, DeckGrid, DeckState } from '@shared/dto/simulation';
import { Loader } from '../Loader';
import { ActorBase } from './ActorBase';
import { Card } from './Card';

const CARD_MASS = 1;

type CardCtorParams = ConstructorParameters<typeof Card>;

export class Deck extends ActorBase {
  __state: DeckState;
  cards: CardCtorParams[];
  gridTextures: Record<number, [Texture, Texture]>;

  constructor(state: DeckState, model: Mesh, gridTextures: Record<number, [Texture, Texture]>) {
    const cards: CardCtorParams[] = state.cards.map(({ cardGUID, deckId, sequence }) => {
      const faceTexture = gridTextures[deckId][0];
      const backTexture = gridTextures[deckId][1];
      const cols = state.grids[deckId].cols;
      const rows = state.grids[deckId].rows;
      return [
        {
          guid: cardGUID,
          name: '',
          faceURL: state.grids[deckId].faceURL,
          backURL: state.grids[deckId].backURL,
          grid: {
            cols,
            rows,
            sequence,
          },
        },
        model,
        faceTexture,
        backTexture,
      ] as CardCtorParams;
    });

    super(state.guid, state.name, model, undefined, state.transformation, CARD_MASS * cards.length, undefined, state);
    this.gridTextures = gridTextures;
    this.cards = cards;

    this.renderDeck();
  }

  get size() {
    return this.cards.length;
  }

  renderDeck() {
    if (this.cards.length === 0) {
      this.setEnabled(false);
    }

    const faceTexture = this.cards.at(0)![2].clone();
    const backTexture = this.cards.at(-1)![3];

    const cardModel = Card.getCardModel(this.model, faceTexture, backTexture, this.cards.at(0)![0].grid);
    this.__model = cardModel;
    this.model.scaling.x = this.size;
  }

  static async fromState(state: DeckState): Promise<Deck | null> {
    const model = await Card.loadCardModel();

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

  override toState() {
    const deckGrids = new Map<string, CardState[]>();
    this.cards.map(([card]) => {
      const deckGrid: DeckGrid = {
        faceURL: card.faceURL,
        backURL: card.backURL,
        cols: card.grid!.cols,
        rows: card.grid!.rows,
      };

      const key = JSON.stringify(deckGrid);
      if (!deckGrids.has(key)) {
        deckGrids.set(key, [card]);
      } else {
        deckGrids.get(key)!.push(card);
      }
    });

    const deckGridsArray = Array.from(deckGrids.entries());
    const newGrids = Array.from(deckGridsArray).reduce(
      (acc, [key, _cards], i) => {
        const grid = JSON.parse(key) as DeckGrid;
        acc[i] = grid;
        return acc;
      },
      {} as DeckState['grids'],
    );

    const newCards: DeckState['cards'] = deckGridsArray
      .map(([_key, cards], i) => {
        return cards.map(card => ({
          cardGUID: card.guid,
          deckId: i,
          sequence: card.grid!.sequence,
        }));
      })
      .flat();

    return {
      ...super.toState(),
      cards: newCards,
      grids: newGrids,
    };
  }

  async pickCard() {
    this.model.scaling.x -= 1;

    if (this.size < 1) {
      return;
    }
    const isFipped = false;
    const card = isFipped ? this.cards.pop()! : this.cards.shift()!;

    const state = {
      ...card[0],
      transformation: {
        ...card[0].transformation,
        position: [this.position.x + 1, this.position.y, this.position.z],
      },
    };

    const model = await Card.loadCardModel();
    if (!model) {
      // eslint-disable-next-line no-console
      console.error('Failed to load card model');
      return;
    }
    model.setEnabled(true);

    new Card(state, model, card[2].clone(), card[3].clone());
    this.renderDeck();
  }
}
