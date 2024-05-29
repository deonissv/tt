import Actor from '../../actor';
import { ActorState } from '@shared/dto/pg/actorState';

const STATIC_SERVER = 'http:/localhost:5500';

export const RectangleCustomTableBuilder = async () => {
  const state: ActorState = {
    guid: '',
    name: 'Rectangle Custom Table',
    model: {
      meshURL: `${STATIC_SERVER}/GreenFelt_Table.obj`,
    },
    children: [
      {
        guid: '',
        name: 'Rectangle Custom Table - plane',
        model: {
          meshURL: `${STATIC_SERVER}/GreenFelt_Table_Felt.obj`,
        },
      },
      {
        guid: '',
        name: 'Rectangle Custom Table - handles',
        model: {
          meshURL: `${STATIC_SERVER}/GreenFelt_Table_Grid.obj`,
        },
      },
    ],
  };
  const actor = await Actor.fromState(state);

  if (actor) {
    actor.model.isPickable = false;
  }
  return actor;
};
