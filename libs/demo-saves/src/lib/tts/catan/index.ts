import { CATAN_OBJ } from './catan.obj';

export const CATAN = {
  OBJ: CATAN_OBJ,
  DECK: CATAN_OBJ.ObjectStates.find(obj => obj.GUID === '162411')!,
  LONGEST_ROAD: CATAN_OBJ.ObjectStates.find(obj => obj.GUID === 'c7db6b')!,
};
