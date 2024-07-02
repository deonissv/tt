export interface TableState {
  type: TableType;
  url?: string;
}

export type TableType = 'Circle' | 'Rectangle' | 'Hexagon' | 'Octagon' | 'Custom' | 'Glass' | 'Poker' | 'RPG';
