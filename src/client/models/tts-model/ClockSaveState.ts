export interface ClockSaveState {
    ClockState: ClockState;
    SecondsPassed: number;
    Paused: boolean;
}

export enum ClockState {
    Active = 0,
    Filling = 1,
    Stopped = 2,
}