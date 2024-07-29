export interface TableState {
  type: TableType;
  url?: string;
}

export type TableType =
  | 'Square'
  | 'Hexagon'
  | 'Octagon'
  | 'Circle'
  | 'Poker'
  | 'Rectangle'
  | 'CircleGlass'
  | 'CustomRectangle'
  | 'CustomSquare'
  | 'None';
