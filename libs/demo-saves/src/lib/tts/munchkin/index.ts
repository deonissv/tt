import { MUNCHKIN_OBJ } from './munchkin.obj';

export const MUNCHKIN = {
  OBJ: MUNCHKIN_OBJ,
  DECK: MUNCHKIN_OBJ.ObjectStates.find(obj => obj.GUID === '482ca1')!,
};
