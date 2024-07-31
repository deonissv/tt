import { CHESS5 } from '@assets/chess5';
import { MUNCHKIN } from '@assets/munchkin';
import { TTSParserC } from '@client/src/TTSParser';
import type { TableState } from '@shared/dto/states';
import type { SaveState } from '@shared/tts-model/SaveState';

describe('TTSParser - parseTable', () => {
  let parser: TTSParserC;

  beforeEach(() => {
    parser = new TTSParserC();
  });

  it('should return custom table from munchkin save state', () => {
    expect(parser.parseTable(MUNCHKIN.OBJ as unknown as SaveState)).toEqual({
      type: 'CustomRectangle',
      url: 'https://i.imgur.com/Bl4bI9M.jpg',
    } as TableState);
  });

  it('should return none table', () => {
    expect(
      parser.parseTable({
        Table: '',
        TableURL: '',
      } as unknown as SaveState),
    ).toEqual(null);
  });

  it('should return custom table from chass5 save state', () => {
    expect(parser.parseTable(CHESS5.OBJ as unknown as SaveState)).toEqual({
      type: 'CircleGlass',
    } as TableState);
  });

  describe('Table type mapper', () => {
    const tableURL = 'http://example.com/table';

    it('should return Circle table type', () => {
      const saveState = { Table: 'Table_Circular', TableURL: tableURL } as SaveState;
      const result = parser.parseTable(saveState);
      expect(result).toEqual({ type: 'Circle', url: tableURL } as TableState);
    });

    it('should return Glass table type', () => {
      const saveState = { Table: 'Table_Glass', TableURL: tableURL } as SaveState;
      const result = parser.parseTable(saveState);
      expect(result).toEqual({ type: 'CircleGlass', url: tableURL } as TableState);
    });

    it('should return Hexagon table type', () => {
      const saveState = { Table: 'Table_Hexagon', TableURL: tableURL } as SaveState;
      const result = parser.parseTable(saveState);
      expect(result).toEqual({ type: 'Hexagon', url: tableURL } as TableState);
    });

    it('should return Octagon table type', () => {
      const saveState = { Table: 'Table_Octagon', TableURL: tableURL } as SaveState;
      const result = parser.parseTable(saveState);
      expect(result).toEqual({ type: 'Octagon', url: tableURL } as TableState);
    });

    it('should return Poker table type', () => {
      const saveState = { Table: 'Table_Poker', TableURL: tableURL } as SaveState;
      const result = parser.parseTable(saveState);
      expect(result).toEqual({ type: 'Poker', url: tableURL } as TableState);
    });

    it('should return RPG table type', () => {
      const saveState = { Table: 'Table_RPG', TableURL: tableURL } as SaveState;
      const result = parser.parseTable(saveState);
      expect(result).toEqual({ type: 'Rectangle', url: tableURL } as TableState);
    });

    it('should return Custom table type for Table_Custom', () => {
      const saveState = { Table: 'Table_Custom', TableURL: tableURL } as SaveState;
      const result = parser.parseTable(saveState);
      expect(result).toEqual({ type: 'CustomRectangle', url: tableURL } as TableState);
    });

    it('should return Custom table type for unknown table type', () => {
      const saveState = { Table: 'Unknown_Table_Type', TableURL: tableURL } as SaveState;
      const result = parser.parseTable(saveState);
      expect(result).toEqual(null);
    });
  });
});
