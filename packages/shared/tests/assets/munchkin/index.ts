import { MUNCHKIN_OBJ } from './munchkin.obj';

export { MUNCHKIN_OBJ };
export const MUNCHKIN = JSON.stringify(MUNCHKIN_OBJ);

export const MUNCHKIN_DECK_OBJ = MUNCHKIN_OBJ.ObjectStates.find(obj => obj.GUID === '482ca1')!;
export const MUNCHKIN_DECK = JSON.stringify(MUNCHKIN_DECK_OBJ);
