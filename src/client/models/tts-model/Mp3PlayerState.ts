export interface Mp3PlayerState {
    songTitle: string;
    genre: string;
    volume: number;
    isPlaying: boolean;
    loopOne: boolean;
    menuTitle: string;
    menu: Menus;
}

export enum Menus {
    GENRES
}