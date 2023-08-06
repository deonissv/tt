export interface TurnsState {
    Enable: boolean;
    Type: TurnType;
    TurnOrder: string[];
    Reverse: boolean;
    SkipEmpty: boolean;
    DisableInteractions: boolean;
    PassTurns: boolean;
    TurnColor: string;

}

export enum TurnType {
    Auto, Custom //Auto = turn order is based on positioning of hands on around table, Custom = turn order is based on an user color list
}
