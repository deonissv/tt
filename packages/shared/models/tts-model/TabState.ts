import { ColourState } from './ColourState';

export interface TabState {
  title: string;
  body: string;
  color: string;
  visibleColor: ColourState;
  id: number;
}
