export interface CustomImageState {
  ImageURL: string;
  ImageSecondaryURL: string;
  WidthScale: number; //Holds the scaled size of the object based on the image dimensions
  CustomDice: CustomDiceState;
  CustomToken: CustomTokenState;
  CustomJigsawPuzzle: CustomJigsawPuzzleState;
  CustomTile: CustomTileState;
}

export interface CustomDiceState {
  Type: DiceType;
}

export enum DiceType {
  D4,
  D6,
  D8,
  D10,
  D12,
  D20,
}

export interface CustomTokenState {
  Thickness: number;
  MergeDistancePixels: number;
  Stackable: boolean;
}

export interface CustomJigsawPuzzleState {
  NumPuzzlePieces: number;
  ImageOnBoard: boolean;
}

export interface CustomTileState {
  Type: TileType; //0 = Box, 1 = Hex, 2 = Circle, 3 = Rounded
  Thickness: number;
  Stackable: boolean;
  Stretch: boolean;
}

export enum TileType {
  Box = 0,
  Hex = 1,
  Circle = 2,
  Rounded = 3,
}
