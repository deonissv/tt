import { SpecialObjects } from '@shared/specialObjects';
import { RectangleCustomTableBuilder } from './tables/rectangleCustom';

export const SpecialObjcetsBuilder: SpecialObjects = {
  tables: {
    async rectangleCustom() {
      return await RectangleCustomTableBuilder();
    },
  },
};
