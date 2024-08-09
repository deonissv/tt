import type { Texture } from '@babylonjs/core';
import { STATIC_HOST } from '@shared/constants';
import type { TileState } from '@shared/dto/states';
import { TileType } from '@shared/dto/states';
import type { Constructor } from '@shared/types';
import { Loader } from '../Loader';
import type { SharedBase } from './SharedBase';
import type { TextureBounds } from './models';
import { FlatMoodel } from './models';

const HEX_TILE_URL = `${STATIC_HOST}/hex_tile.obj`;
const ROUND_TILE_URL = `${STATIC_HOST}/round_tile.obj`;
const SQUARE_TILE_URL = `${STATIC_HOST}/square_tile.obj`;

export const TileMixin = <T extends Constructor<SharedBase<TileState>>>(Base: T) => {
  return class Tile extends Base {
    static async fromState<T extends Tile>(this: Constructor<T>, state: TileState): Promise<T | null> {
      const tileModel = await Tile.getTileModel(state.tileType, state.faceURL, state.backURL);
      if (!tileModel) {
        return null;
      }

      return new this(state, tileModel);
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

    static getTextureBounds(
      texture: Texture | null,
      vertStart: number,
      vertCount: number,
      faceIndexStart: number,
      faceIndexCount: number,
    ): TextureBounds | undefined {
      if (!texture) return undefined;
      return {
        texture,
        vertStart,
        vertCount,
        faceIndexStart,
        faceIndexCount,
      };
    }

    static async getBoxTileModel(faceURL: string, backURL?: string) {
      const model = await Loader.loadMesh(SQUARE_TILE_URL);

      if (!model) {
        return null;
      }

      const faceTexture = await Loader.loadTexture(faceURL);
      const backTexture = backURL ? await Loader.loadTexture(backURL) : faceTexture;

      const vertStart = 0;
      const vertCount = 24;

      const faceTextureBounds = Tile.getTextureBounds(faceTexture, vertStart, vertCount, 24, 6);
      const backTextureBounds = Tile.getTextureBounds(backTexture, vertStart, vertCount, 30, 6);

      return FlatMoodel(model, faceTextureBounds, backTextureBounds);
    }

    static async getHexTileModel(faceURL: string, backURL?: string) {
      const model = await Loader.loadMesh(HEX_TILE_URL);

      if (!model) {
        return null;
      }

      const faceTexture = await Loader.loadTexture(faceURL);
      const backTexture = backURL ? await Loader.loadTexture(backURL) : faceTexture;

      const vertStart = 0;
      const vertCount = 38;
      const faceTextureBounds = Tile.getTextureBounds(faceTexture, vertStart, vertCount, 36, 18);
      const backTextureBounds = Tile.getTextureBounds(backTexture, vertStart, vertCount, 54, 18);

      return FlatMoodel(model, faceTextureBounds, backTextureBounds);
    }

    static async getCircleTileModel(faceURL: string, backURL?: string) {
      const model = await Loader.loadMesh(ROUND_TILE_URL);

      if (!model) {
        return null;
      }

      const faceTexture = await Loader.loadTexture(faceURL);
      const backTexture = backURL ? await Loader.loadTexture(backURL) : faceTexture;

      const vertStart = 0;
      const vertCount = 132;
      const faceTextureBounds = Tile.getTextureBounds(faceTexture, vertStart, vertCount, 192, 96);
      const backTextureBounds = Tile.getTextureBounds(backTexture, vertStart, vertCount, 288, 96);

      return FlatMoodel(model, faceTextureBounds, backTextureBounds);
    }
  };
};
