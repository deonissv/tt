import type { Texture } from '@babylonjs/core';
import type { TileState } from '@tt/states';
import { TileType } from '@tt/states';
import { Loader } from '@shared/playground';
import { FlatMoodel, type TextureBounds } from '@shared/playground/actors/models';
import { TileMixin } from '@shared/playground/actors/TileMixin';
import { AssetsManager } from './AssetsManages';
import { ClientBase } from './ClientBase';

export class Tile extends TileMixin(ClientBase) {
  static async fromState(state: TileState): Promise<Tile | null> {
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
    const model = await Loader.loadMesh(AssetsManager.getTileMesh(TileType.BOX));

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
    const model = await Loader.loadMesh(AssetsManager.getTileMesh(TileType.HEX));

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
    const model = await Loader.loadMesh(AssetsManager.getTileMesh(TileType.CIRCLE));

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
}
