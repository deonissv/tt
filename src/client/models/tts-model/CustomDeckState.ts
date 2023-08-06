export interface CustomDeckState {
    FaceURL: string;
    BackURL: string;
    NumWidth?: number;
    NumHeight?: number;
    BackIsHidden: boolean; //Back of cards becames the hidden card when in a hand
    UniqueBack: boolean; //Each back is a unique card just like the front

}
