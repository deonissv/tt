import { CHESS5_OBJ } from '@assets/chess5';
import { MUNCHKIN_OBJ } from '@assets/munchkin';
import { TTSParser } from '@client/src/TTSParser';
import type { TableState } from '@shared/dto/simulation';
import type { SaveState } from '@shared/tts-model/SaveState';
import { describe, expect, it } from 'vitest';

describe('TTSParser.parseTable', () => {
  it('should return custom table from munchkin save state', () => {
    expect(TTSParser.parseTable(MUNCHKIN_OBJ as unknown as SaveState)).toEqual({
      type: 'Custom',
      url: 'https://i.imgur.com/Bl4bI9M.jpg',
    });
  });

  it('should return none table', () => {
    expect(
      TTSParser.parseTable({
        Table: '',
        TableURL: '',
      } as unknown as SaveState),
    ).toEqual({
      type: 'None',
    });
  });

  it('should return custom table from chass5 save state', () => {
    expect(TTSParser.parseTable(CHESS5_OBJ as unknown as SaveState)).toEqual({
      type: 'Glass',
    } as TableState);
  });

  describe('should map', () => {
    const tableURL = 'http://example.com/table';

    it('should return Circle table type', () => {
      const saveState = { Table: 'Table_Circular', TableURL: tableURL } as SaveState;
      const result = TTSParser.parseTable(saveState);
      expect(result).toEqual({ type: 'Circle', url: tableURL });
    });

    it('should return Glass table type', () => {
      const saveState = { Table: 'Table_Glass', TableURL: tableURL } as SaveState;
      const result = TTSParser.parseTable(saveState);
      expect(result).toEqual({ type: 'Glass', url: tableURL });
    });

    it('should return Hexagon table type', () => {
      const saveState = { Table: 'Table_Hexagon', TableURL: tableURL } as SaveState;
      const result = TTSParser.parseTable(saveState);
      expect(result).toEqual({ type: 'Hexagon', url: tableURL });
    });

    it('should return Octagon table type', () => {
      const saveState = { Table: 'Table_Octagon', TableURL: tableURL } as SaveState;
      const result = TTSParser.parseTable(saveState);
      expect(result).toEqual({ type: 'Octagon', url: tableURL });
    });

    it('should return Poker table type', () => {
      const saveState = { Table: 'Table_Poker', TableURL: tableURL } as SaveState;
      const result = TTSParser.parseTable(saveState);
      expect(result).toEqual({ type: 'Poker', url: tableURL });
    });

    it('should return RPG table type', () => {
      const saveState = { Table: 'Table_RPG', TableURL: tableURL } as SaveState;
      const result = TTSParser.parseTable(saveState);
      expect(result).toEqual({ type: 'RPG', url: tableURL });
    });

    it('should return Custom table type for Table_Custom', () => {
      const saveState = { Table: 'Table_Custom', TableURL: tableURL } as SaveState;
      const result = TTSParser.parseTable(saveState);
      expect(result).toEqual({ type: 'Custom', url: tableURL });
    });

    it('should return Custom table type for empty string', () => {
      const saveState = { Table: '', TableURL: tableURL } as SaveState;
      const result = TTSParser.parseTable(saveState);
      expect(result).toEqual({ type: 'Custom', url: tableURL });
    });

    it('should return Custom table type for unknown table type', () => {
      const saveState = { Table: 'Unknown_Table_Type', TableURL: tableURL } as SaveState;
      const result = TTSParser.parseTable(saveState);
      expect(result).toEqual({ type: 'Custom', url: tableURL });
    });
  });
});
