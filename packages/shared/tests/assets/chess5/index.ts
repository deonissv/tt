import { CHESS5_OBJ } from './chess5.obj';

export { CHESS5_OBJ };
export const CHESS5 = JSON.stringify(CHESS5_OBJ);

export const CHESS_PAWN_OBJ = CHESS5_OBJ.ObjectStates[0]!;
export const CHESS_PAWN = JSON.stringify(CHESS_PAWN_OBJ);
