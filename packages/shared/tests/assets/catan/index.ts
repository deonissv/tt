import { CATAN_OBJ } from './catan.obj';

export { CATAN_OBJ };
export const CANAT_DECK_OBJ = CATAN_OBJ.ObjectStates.find(obj => obj.GUID === '162411')!;
export const CATAN_LONGEST_ROAD_OBJ = CATAN_OBJ.ObjectStates.find(obj => obj.GUID === 'c7db6b')!;
