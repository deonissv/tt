import { CATAN_OBJ } from './catan.obj';

export { CATAN_OBJ };
export const CATAN = JSON.stringify(CATAN_OBJ);

export const CANAT_DECK_OBJ = CATAN_OBJ.ObjectStates.find(obj => obj.GUID === '162411')!;
export const CANAT_DECK = JSON.stringify(CANAT_DECK_OBJ);
