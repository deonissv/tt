import { hasProperty, isObject } from '@shared/guards';

export interface Containable {
  get size(): number;
  pickItem(clientId: string, pickHeight: number): void;
  shuffle(): void;
}

export const isContainable = (object: any): object is Containable => {
  return (
    isObject(object) &&
    hasProperty(object, 'size') &&
    typeof object.size === 'number' &&
    hasProperty(object, 'pickItem') &&
    typeof object.pickItem === 'function'
    // hasProperty(object, 'shuffle') &&
    // typeof object.shuffle === 'function'
  );
};
