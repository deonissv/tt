import { CHESS5, MUNCHKIN } from '@tt/demo-saves';
import { TTSParser } from '../src';

describe('TTSParser - parseTable', () => {
  beforeEach(() => {
    TTSParser.reset();
  });

  it('should return custom table from munchkin save state', () => {
    expect(TTSParser.parseTable(MUNCHKIN.OBJ)).toEqual({
      type: 'CustomRectangle',
      url: 'https://i.imgur.com/Bl4bI9M.jpg',
    });
  });

  it('should return none table', () => {
    expect(
      TTSParser.parseTable({
        Table: '',
        TableURL: '',
      }),
    ).toEqual(null);
  });

  it('should return custom table from chass5 save state', () => {
    expect(TTSParser.parseTable(CHESS5.OBJ)).toEqual({
      type: 'CircleGlass',
    });
  });

  describe('Table type mapper', () => {
    const tableURL = 'http://example.com/table';

    it('should return Circle table type', () => {
      const saveState = { Table: 'Table_Circular', TableURL: tableURL };
      const result = TTSParser.parseTable(saveState);
      expect(result).toEqual({ type: 'Circle', url: tableURL });
    });

    it('should return Glass table type', () => {
      const saveState = { Table: 'Table_Glass', TableURL: tableURL };
      const result = TTSParser.parseTable(saveState);
      expect(result).toEqual({ type: 'CircleGlass', url: tableURL });
    });

    it('should return Hexagon table type', () => {
      const saveState = { Table: 'Table_Hexagon', TableURL: tableURL };
      const result = TTSParser.parseTable(saveState);
      expect(result).toEqual({ type: 'Hexagon', url: tableURL });
    });

    it('should return Octagon table type', () => {
      const saveState = { Table: 'Table_Octagon', TableURL: tableURL };
      const result = TTSParser.parseTable(saveState);
      expect(result).toEqual({ type: 'Octagon', url: tableURL });
    });

    it('should return Poker table type', () => {
      const saveState = { Table: 'Table_Poker', TableURL: tableURL };
      const result = TTSParser.parseTable(saveState);
      expect(result).toEqual({ type: 'Poker', url: tableURL });
    });

    it('should return RPG table type', () => {
      const saveState = { Table: 'Table_RPG', TableURL: tableURL };
      const result = TTSParser.parseTable(saveState);
      expect(result).toEqual({ type: 'Rectangle', url: tableURL });
    });

    it('should return Custom table type for Table_Custom', () => {
      const saveState = { Table: 'Table_Custom', TableURL: tableURL };
      const result = TTSParser.parseTable(saveState);
      expect(result).toEqual({ type: 'CustomRectangle', url: tableURL });
    });

    it('should return Custom table type for unknown table type', () => {
      const saveState = { Table: 'Unknown_Table_Type', TableURL: tableURL };
      const result = TTSParser.parseTable(saveState);
      expect(result).toEqual(null);
    });
  });
});
