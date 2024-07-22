import type { ActorStateBase } from '@shared/dto/states';

export interface Containable {
  items: ActorStateBase[];

  get size(): number;
  pickItem(): void;
}

export const isContainable = (object: any): object is Containable => {
  return (
    'items' in object &&
    'size' in object &&
    'pickItem' in object &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    typeof object.size === 'number' &&
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    typeof object.pickItem === 'function'
  );
};
