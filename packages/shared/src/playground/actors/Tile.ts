import { type Mesh } from '@babylonjs/core';
import { STATIC_HOST } from '@shared/constants';
import type { TileState } from '@shared/dto/states';
import { TileType } from '@shared/dto/states';
import { Loader } from '../Loader';
import { ActorBase } from './ActorBase';
import type { TextureBounds } from './models';
import { FlatMoodel } from './models';

const HEX_TILE_URL = `${STATIC_HOST}/hex_tile.obj`;
const ROUND_TILE_URL = `${STATIC_HOST}/round_tile.obj`;
const SQUARE_TILE_URL = `${STATIC_HOST}/square_tile.obj`;

const TILE_MASS = 1;

export class Tile extends ActorBase {
  __state: TileState;

  constructor(state: TileState, model: Mesh) {
    super(state.guid, state.name, model, undefined, state.transformation, TILE_MASS, undefined, state);
  }

  static override async fromState(state: TileState): Promise<Tile | null> {
    const tileModel = await Tile.getTileModel(state.tileType, state.faceURL, state.backURL);
    if (!tileModel) {
      return null;
    }

    return new Tile(state, tileModel);
  }

  static async getTileModel(type: TileType, faceURL: string, backURL?: string) {
    switch (type) {
      case TileType.BOX: {
        return Tile.getBoxTileModel(faceURL, backURL);
      }
      case TileType.HEX: {
        return Tile.getHexTileModel(faceURL, backURL);
      }
      case TileType.CIRCLE: {
        return Tile.getCircleTileModel(faceURL, backURL);
      }
      case TileType.ROUNDED: {
        return Tile.getBoxTileModel(faceURL, backURL);
      }
      default: {
        return null;
      }
    }
  }

  static async getBoxTileModel(faceURL: string, backURL?: string) {
    const model = await Loader.loadMesh(SQUARE_TILE_URL);

    if (!model) {
      return null;
    }

    const faceTexture = await Loader.loadTexture(faceURL);
    if (!faceTexture) {
      return null;
    }

    const backTexture = backURL ? await Loader.loadTexture(backURL) : faceTexture;

    const vertStart = 0;
    const vertCount = 24;
    const faceTextureBounds: TextureBounds = {
      texture: faceTexture,
      vertStart,
      vertCount,
      faceIndexStart: 24,
      faceIndexCount: 6,
    };

    const backTextureBounds: TextureBounds = {
      texture: backTexture ?? faceTexture,
      vertStart,
      vertCount,
      faceIndexStart: 30,
      faceIndexCount: 6,
    };

    return FlatMoodel(model, faceTextureBounds, backTextureBounds);
  }

  static async getHexTileModel(faceURL: string, backURL?: string) {
    const model = await Loader.loadMesh(HEX_TILE_URL);

    if (!model) {
      return null;
    }

    const faceTexture = await Loader.loadTexture(faceURL);
    if (!faceTexture) {
      return null;
    }

    const backTexture = backURL ? await Loader.loadTexture(backURL) : faceTexture;

    const vertStart = 0;
    const vertCount = 38;
    const faceTextureBounds: TextureBounds = {
      texture: faceTexture,
      vertStart,
      vertCount,
      faceIndexStart: 36,
      faceIndexCount: 18,
    };

    const backTextureBounds: TextureBounds = {
      texture: backTexture ?? faceTexture,
      vertStart,
      vertCount,
      faceIndexStart: 54,
      faceIndexCount: 18,
    };

    return FlatMoodel(model, faceTextureBounds, backTextureBounds);
  }

  static async getCircleTileModel(faceURL: string, backURL?: string) {
    const model = await Loader.loadMesh(ROUND_TILE_URL);

    if (!model) {
      return null;
    }

    const faceTexture = await Loader.loadTexture(faceURL);
    if (!faceTexture) {
      return null;
    }

    const backTexture = backURL ? await Loader.loadTexture(backURL) : faceTexture;

    const vertStart = 0;
    const vertCount = 132;
    const faceTextureBounds: TextureBounds = {
      texture: faceTexture,
      vertStart,
      vertCount,
      faceIndexStart: 192,
      faceIndexCount: 96,
    };

    const backTextureBounds: TextureBounds = {
      texture: backTexture ?? faceTexture,
      vertStart,
      vertCount,
      faceIndexStart: 288,
      faceIndexCount: 96,
    };

    return FlatMoodel(model, faceTextureBounds, backTextureBounds);
  }
}
