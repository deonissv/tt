export interface CustomAssetbundleState {
    AssetbundleURL: string;
    AssetbundleSecondaryURL: string;
    MaterialIndex: number; //0 = Plastic, 1 = Wood, 2 = Metal, 3 = Cardboard
    TypeIndex: number; //0 = Generic, 1 = Figurine, 2 = Dice, 3 = Coin, 4 = Board, 5 = Chip, 6 = Bag, 7 = Infinite
    LoopingEffectIndex: number;
}
