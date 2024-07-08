import { MUNCHKIN_DECK_OBJ } from '@assets/munchkin';
import TTSParser from '@client/src/TTSParser/TTSParser';
import { degToRad } from '@client/src/utils';
import type { DeckState } from '@shared/dto/simulation';
import type { ObjectState } from '@shared/tts-model/ObjectState';
import { describe, expect, it } from 'vitest';

describe('TTSParser - parseDeck', () => {
  it('should correctly parse a deck  with all properties', () => {
    const expected: DeckState = {
      guid: '482ca1',
      name: 'Deck',
      transformation: {
        position: [6.120835, 2.00653052, -4.454175],
        rotation: [8.95195e-9, 179.8918, 180.0].map(degToRad),
        scale: [1, 1, 1],
      },
      cards: [
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 16,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 10,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 32,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 50,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 44,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 7,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 4,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 30,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 30,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 17,
        },
        {
          cardGUID: 'c51e8e',
          deckId: 23,
          sequence: 9,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 7,
        },
        {
          cardGUID: 'a16267',
          deckId: 13,
          sequence: 22,
        },
        {
          cardGUID: 'f238ce',
          deckId: 33,
          sequence: 13,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 23,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 31,
        },
        {
          cardGUID: '108f8f',
          deckId: 23,
          sequence: 2,
        },
        {
          cardGUID: '6bd80e',
          deckId: 9,
          sequence: 5,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 0,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 1,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 21,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 27,
        },
        {
          cardGUID: '6bd80e',
          deckId: 9,
          sequence: 6,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 0,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 26,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 0,
        },
        {
          cardGUID: '69b3ec',
          deckId: 33,
          sequence: 21,
        },
        {
          cardGUID: '4b9e84',
          deckId: 22,
          sequence: 2,
        },
        {
          cardGUID: '13ea9f',
          deckId: 40,
          sequence: 41,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 16,
        },
        {
          cardGUID: '4cf0d4',
          deckId: 40,
          sequence: 53,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 12,
        },
        {
          cardGUID: 'a16267',
          deckId: 13,
          sequence: 27,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 20,
        },
        {
          cardGUID: '6005ac',
          deckId: 33,
          sequence: 16,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 54,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 23,
        },
        {
          cardGUID: 'a36d8c',
          deckId: 35,
          sequence: 1,
        },
        {
          cardGUID: 'a16267',
          deckId: 13,
          sequence: 18,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 13,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 16,
        },
        {
          cardGUID: '69b3ec',
          deckId: 33,
          sequence: 6,
        },
        {
          cardGUID: 'c51e8e',
          deckId: 23,
          sequence: 7,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 7,
        },
        {
          cardGUID: '6429e8',
          deckId: 34,
          sequence: 18,
        },
        {
          cardGUID: 'c51e8e',
          deckId: 23,
          sequence: 0,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 40,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 19,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 26,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 34,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 20,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 28,
        },
        {
          cardGUID: '98000f',
          deckId: 9,
          sequence: 17,
        },
        {
          cardGUID: '97f323',
          deckId: 9,
          sequence: 15,
        },
        {
          cardGUID: 'a36d8c',
          deckId: 35,
          sequence: 2,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 29,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 6,
        },
        {
          cardGUID: '924a17',
          deckId: 23,
          sequence: 10,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 17,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 8,
        },
        {
          cardGUID: 'cdd105',
          deckId: 16,
          sequence: 10,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 24,
        },
        {
          cardGUID: '8cfd7b',
          deckId: 12,
          sequence: 34,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 29,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 6,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 29,
        },
        {
          cardGUID: '193422',
          deckId: 40,
          sequence: 23,
        },
        {
          cardGUID: 'a5d6fc',
          deckId: 33,
          sequence: 23,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 16,
        },
        {
          cardGUID: 'a16267',
          deckId: 13,
          sequence: 31,
        },
        {
          cardGUID: 'a16267',
          deckId: 13,
          sequence: 25,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 28,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 27,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 34,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 32,
        },
        {
          cardGUID: '69b3ec',
          deckId: 33,
          sequence: 20,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 3,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 16,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 49,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 28,
        },
        {
          cardGUID: 'cdd105',
          deckId: 16,
          sequence: 1,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 6,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 13,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 15,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 3,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 24,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 9,
        },
        {
          cardGUID: '6bd80e',
          deckId: 9,
          sequence: 9,
        },
        {
          cardGUID: 'a16267',
          deckId: 13,
          sequence: 29,
        },
        {
          cardGUID: '69b3ec',
          deckId: 33,
          sequence: 15,
        },
        {
          cardGUID: '69b3ec',
          deckId: 33,
          sequence: 27,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 9,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 10,
        },
        {
          cardGUID: 'a16267',
          deckId: 13,
          sequence: 32,
        },
        {
          cardGUID: 'cdd105',
          deckId: 16,
          sequence: 2,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 1,
        },
        {
          cardGUID: 'b0baa5',
          deckId: 34,
          sequence: 27,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 9,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 25,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 10,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 36,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 14,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 21,
        },
        {
          cardGUID: 'c51e8e',
          deckId: 23,
          sequence: 12,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 17,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 6,
        },
        {
          cardGUID: 'abfcde',
          deckId: 9,
          sequence: 1,
        },
        {
          cardGUID: '69b3ec',
          deckId: 33,
          sequence: 7,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 25,
        },
        {
          cardGUID: 'a16267',
          deckId: 13,
          sequence: 26,
        },
        {
          cardGUID: '69b3ec',
          deckId: 33,
          sequence: 10,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 7,
        },
        {
          cardGUID: '69b3ec',
          deckId: 33,
          sequence: 18,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 29,
        },
        {
          cardGUID: '64f6bc',
          deckId: 22,
          sequence: 26,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 25,
        },
        {
          cardGUID: '69b3ec',
          deckId: 33,
          sequence: 25,
        },
        {
          cardGUID: 'a16267',
          deckId: 13,
          sequence: 2,
        },
        {
          cardGUID: '69b3ec',
          deckId: 33,
          sequence: 32,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 11,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 32,
        },
        {
          cardGUID: '04edb0',
          deckId: 13,
          sequence: 30,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 30,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 30,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 1,
        },
        {
          cardGUID: '69b3ec',
          deckId: 33,
          sequence: 2,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 19,
        },
        {
          cardGUID: 'a16267',
          deckId: 13,
          sequence: 16,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 51,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 19,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 1,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 26,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 31,
        },
        {
          cardGUID: 'a16267',
          deckId: 13,
          sequence: 15,
        },
        {
          cardGUID: '04261a',
          deckId: 9,
          sequence: 2,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 2,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 27,
        },
        {
          cardGUID: 'a16267',
          deckId: 13,
          sequence: 12,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 3,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 14,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 35,
        },
        {
          cardGUID: '7b4a64',
          deckId: 13,
          sequence: 4,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 33,
        },
        {
          cardGUID: '6ca136',
          deckId: 40,
          sequence: 33,
        },
        {
          cardGUID: '69b3ec',
          deckId: 33,
          sequence: 11,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 0,
        },
        {
          cardGUID: '69b3ec',
          deckId: 33,
          sequence: 9,
        },
        {
          cardGUID: '69b3ec',
          deckId: 33,
          sequence: 22,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 9,
        },
        {
          cardGUID: '69b3ec',
          deckId: 33,
          sequence: 8,
        },
        {
          cardGUID: 'cdd105',
          deckId: 16,
          sequence: 11,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 1,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 2,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 8,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 19,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 0,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 38,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 20,
        },
        {
          cardGUID: '83432e',
          deckId: 22,
          sequence: 18,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 43,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 25,
        },
        {
          cardGUID: 'cfd525',
          deckId: 13,
          sequence: 34,
        },
        {
          cardGUID: '7aa497',
          deckId: 9,
          sequence: 21,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 9,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 27,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 2,
        },
        {
          cardGUID: 'a4ee26',
          deckId: 23,
          sequence: 17,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 5,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 52,
        },
        {
          cardGUID: '43239b',
          deckId: 12,
          sequence: 3,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 29,
        },
        {
          cardGUID: '6bd80e',
          deckId: 9,
          sequence: 11,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 47,
        },

        {
          cardGUID: 'c51e8e',
          deckId: 23,
          sequence: 14,
        },
        {
          cardGUID: 'a16267',
          deckId: 13,
          sequence: 6,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 25,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 28,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 33,
        },
        {
          cardGUID: '526d90',
          deckId: 13,
          sequence: 24,
        },
        {
          cardGUID: 'a16267',
          deckId: 13,
          sequence: 11,
        },
        {
          cardGUID: 'cdd105',
          deckId: 16,
          sequence: 7,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 7,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 46,
        },
        {
          cardGUID: 'a16267',
          deckId: 13,
          sequence: 28,
        },
        {
          cardGUID: '69b3ec',
          deckId: 33,
          sequence: 24,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 33,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 18,
        },
        {
          cardGUID: 'a16267',
          deckId: 13,
          sequence: 21,
        },
        {
          cardGUID: 'a16267',
          deckId: 13,
          sequence: 17,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 7,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 14,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 14,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 11,
        },
        {
          cardGUID: 'a16267',
          deckId: 13,
          sequence: 8,
        },
        {
          cardGUID: 'ccd266',
          deckId: 9,
          sequence: 20,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 23,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 32,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 10,
        },
        {
          cardGUID: '367973',
          deckId: 9,
          sequence: 16,
        },
        {
          cardGUID: '361fdd',
          deckId: 13,
          sequence: 1,
        },
        {
          cardGUID: 'c51e8e',
          deckId: 23,
          sequence: 3,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 18,
        },
        {
          cardGUID: 'a16267',
          deckId: 13,
          sequence: 0,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 14,
        },
        {
          cardGUID: '9609db',
          deckId: 9,
          sequence: 19,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 20,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 12,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 24,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 12,
        },
        {
          cardGUID: 'fd451f',
          deckId: 13,
          sequence: 5,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 34,
        },
        {
          cardGUID: 'a16267',
          deckId: 13,
          sequence: 7,
        },
        {
          cardGUID: 'cdd105',
          deckId: 16,
          sequence: 8,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 14,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 6,
        },
        {
          cardGUID: 'c51e8e',
          deckId: 23,
          sequence: 16,
        },
        {
          cardGUID: '097900',
          deckId: 15,
          sequence: 13,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 5,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 45,
        },
        {
          cardGUID: 'a16267',
          deckId: 13,
          sequence: 23,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 1,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 4,
        },
        {
          cardGUID: '69b3ec',
          deckId: 33,
          sequence: 26,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 29,
        },
        {
          cardGUID: 'c749f0',
          deckId: 40,
          sequence: 48,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 10,
        },
        {
          cardGUID: '25fbf1',
          deckId: 33,
          sequence: 29,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 15,
        },
        {
          cardGUID: '6c3d76',
          deckId: 15,
          sequence: 34,
        },
        {
          cardGUID: 'c51e8e',
          deckId: 23,
          sequence: 11,
        },
        {
          cardGUID: '81ced0',
          deckId: 9,
          sequence: 0,
        },
        {
          cardGUID: 'c51e8e',
          deckId: 23,
          sequence: 8,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 11,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 24,
        },
        {
          cardGUID: '956f1e',
          deckId: 23,
          sequence: 15,
        },
        {
          cardGUID: '69b3ec',
          deckId: 33,
          sequence: 34,
        },
        {
          cardGUID: 'd47a21',
          deckId: 23,
          sequence: 5,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 3,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 3,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 4,
        },
        {
          cardGUID: '6bd80e',
          deckId: 9,
          sequence: 7,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 5,
        },
        {
          cardGUID: '79736e',
          deckId: 13,
          sequence: 20,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 9,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 4,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 33,
        },
        {
          cardGUID: 'a16267',
          deckId: 13,
          sequence: 14,
        },
        {
          cardGUID: '6bd80e',
          deckId: 9,
          sequence: 12,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 16,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 18,
        },
        {
          cardGUID: 'e60c7e',
          deckId: 9,
          sequence: 14,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 11,
        },
        {
          cardGUID: 'bb1b07',
          deckId: 16,
          sequence: 4,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 42,
        },
        {
          cardGUID: 'a16267',
          deckId: 13,
          sequence: 33,
        },
        {
          cardGUID: '55aed0',
          deckId: 33,
          sequence: 5,
        },
        {
          cardGUID: 'ffd568',
          deckId: 9,
          sequence: 18,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 17,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 22,
        },
        {
          cardGUID: '69b3ec',
          deckId: 33,
          sequence: 28,
        },
        {
          cardGUID: 'c36c57',
          deckId: 40,
          sequence: 30,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 17,
        },
        {
          cardGUID: 'c51e8e',
          deckId: 23,
          sequence: 13,
        },
        {
          cardGUID: '69b3ec',
          deckId: 33,
          sequence: 4,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 5,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 4,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 5,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 39,
        },
        {
          cardGUID: '6bd80e',
          deckId: 9,
          sequence: 3,
        },
        {
          cardGUID: 'a16267',
          deckId: 13,
          sequence: 13,
        },
        {
          cardGUID: '69b3ec',
          deckId: 33,
          sequence: 30,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 11,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 34,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 28,
        },
        {
          cardGUID: '69b3ec',
          deckId: 33,
          sequence: 33,
        },
        {
          cardGUID: 'a36d8c',
          deckId: 35,
          sequence: 0,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 21,
        },
        {
          cardGUID: '79f54f',
          deckId: 40,
          sequence: 37,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 22,
        },
        {
          cardGUID: 'a16267',
          deckId: 13,
          sequence: 3,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 22,
        },
        {
          cardGUID: '6c88c2',
          deckId: 16,
          sequence: 5,
        },
        {
          cardGUID: 'a16267',
          deckId: 13,
          sequence: 10,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 8,
        },
        {
          cardGUID: '42caf6',
          deckId: 15,
          sequence: 21,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 11,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 30,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 19,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 13,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 21,
        },
        {
          cardGUID: '69b3ec',
          deckId: 33,
          sequence: 31,
        },
        {
          cardGUID: '69b3ec',
          deckId: 33,
          sequence: 19,
        },
        {
          cardGUID: 'f9bd56',
          deckId: 12,
          sequence: 15,
        },
        {
          cardGUID: 'cdd105',
          deckId: 16,
          sequence: 9,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 20,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 33,
        },
        {
          cardGUID: '74c72e',
          deckId: 12,
          sequence: 22,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 15,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 24,
        },
        {
          cardGUID: '69b3ec',
          deckId: 33,
          sequence: 3,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 24,
        },
        {
          cardGUID: '6bd80e',
          deckId: 9,
          sequence: 8,
        },
        {
          cardGUID: 'cdd105',
          deckId: 16,
          sequence: 0,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 17,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 32,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 31,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 22,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 2,
        },
        {
          cardGUID: '69b3ec',
          deckId: 33,
          sequence: 17,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 19,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 5,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 4,
        },
        {
          cardGUID: 'fa59c3',
          deckId: 9,
          sequence: 13,
        },
        {
          cardGUID: 'c6a5bc',
          deckId: 33,
          sequence: 0,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 31,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 13,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 23,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 31,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 28,
        },
        {
          cardGUID: '6bd80e',
          deckId: 9,
          sequence: 4,
        },
        {
          cardGUID: 'a71e88',
          deckId: 16,
          sequence: 6,
        },
        {
          cardGUID: '69b3ec',
          deckId: 33,
          sequence: 14,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 32,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 13,
        },
        {
          cardGUID: '3cf525',
          deckId: 21,
          sequence: 26,
        },
        {
          cardGUID: 'a16267',
          deckId: 13,
          sequence: 19,
        },
        {
          cardGUID: 'c51e8e',
          deckId: 23,
          sequence: 1,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 8,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 25,
        },
        {
          cardGUID: 'ad6299',
          deckId: 21,
          sequence: 20,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 0,
        },
        {
          cardGUID: 'c825ee',
          deckId: 40,
          sequence: 2,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 12,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 8,
        },
        {
          cardGUID: 'c51e8e',
          deckId: 23,
          sequence: 6,
        },
        {
          cardGUID: '6bd80e',
          deckId: 9,
          sequence: 10,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 12,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 15,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 10,
        },
        {
          cardGUID: '69b3ec',
          deckId: 33,
          sequence: 1,
        },
        {
          cardGUID: 'a16267',
          deckId: 13,
          sequence: 9,
        },
        {
          cardGUID: 'a78e46',
          deckId: 12,
          sequence: 23,
        },
        {
          cardGUID: 'cdd105',
          deckId: 16,
          sequence: 3,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 6,
        },
        {
          cardGUID: '80e30c',
          deckId: 22,
          sequence: 21,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 18,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 12,
        },
        {
          cardGUID: 'c51e8e',
          deckId: 23,
          sequence: 4,
        },
        {
          cardGUID: '3a22f4',
          deckId: 15,
          sequence: 26,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 15,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 8,
        },
        {
          cardGUID: '4f1685',
          deckId: 40,
          sequence: 27,
        },
        {
          cardGUID: 'e143ba',
          deckId: 21,
          sequence: 31,
        },
        {
          cardGUID: 'ba8db0',
          deckId: 34,
          sequence: 22,
        },
      ],
      grids: {
        21: {
          faceURL:
            'http://cloud-3.steamusercontent.com/ugc/429358847306551738/839B87FAD61C79259B71F7E162385C3090F00810/',
          backURL:
            'http://cloud-3.steamusercontent.com/ugc/469890611693556064/39BC8E10FAA97149A7BF6A8AC1E783A7E022A6C3/',
          cols: 10,
          rows: 7,
        },
        12: {
          faceURL:
            'http://cloud-3.steamusercontent.com/ugc/469890611715972460/DE1BAB63C2982153E12D26B560270B75589F863D/',
          backURL:
            'http://cloud-3.steamusercontent.com/ugc/469890611693556064/39BC8E10FAA97149A7BF6A8AC1E783A7E022A6C3/',
          cols: 10,
          rows: 7,
        },
        40: {
          faceURL:
            'http://cloud-3.steamusercontent.com/ugc/429359427599445381/F99C8443C812D774D7799DCEC5FE2EDABF9E66E9/',
          backURL:
            'http://cloud-3.steamusercontent.com/ugc/469890611693556064/39BC8E10FAA97149A7BF6A8AC1E783A7E022A6C3/',
          cols: 10,
          rows: 7,
        },
        34: {
          faceURL:
            'http://cloud-3.steamusercontent.com/ugc/429358847330075776/3086749A024D0D181342B5E641BD8AAE6D58A45F/',
          backURL:
            'http://cloud-3.steamusercontent.com/ugc/469890611693556064/39BC8E10FAA97149A7BF6A8AC1E783A7E022A6C3/',
          cols: 10,
          rows: 7,
        },
        22: {
          faceURL:
            'http://cloud-3.steamusercontent.com/ugc/429358847306572374/9A65B90295EDD4D38B2B8B85B18C4B8F16B89A12/',
          backURL:
            'http://cloud-3.steamusercontent.com/ugc/469890611693556064/39BC8E10FAA97149A7BF6A8AC1E783A7E022A6C3/',
          cols: 10,
          rows: 7,
        },
        23: {
          faceURL:
            'http://cloud-3.steamusercontent.com/ugc/429358847306596064/2A5CB34CB4BCDD079356AC6A7607C790133E8408/',
          backURL:
            'http://cloud-3.steamusercontent.com/ugc/469890611693556064/39BC8E10FAA97149A7BF6A8AC1E783A7E022A6C3/',
          cols: 10,
          rows: 7,
        },
        13: {
          faceURL:
            'http://cloud-3.steamusercontent.com/ugc/469890611716020811/3890BA43F586AA4DED4041ED172D9EC2475F2D84/',
          backURL:
            'http://cloud-3.steamusercontent.com/ugc/469890611693556064/39BC8E10FAA97149A7BF6A8AC1E783A7E022A6C3/',
          cols: 10,
          rows: 7,
        },
        33: {
          faceURL:
            'http://cloud-3.steamusercontent.com/ugc/429358847330067228/4E01331B0B9645DC563600309F32A6B29AF0CA08/',
          backURL:
            'http://cloud-3.steamusercontent.com/ugc/469890611693556064/39BC8E10FAA97149A7BF6A8AC1E783A7E022A6C3/',
          cols: 10,
          rows: 7,
        },
        15: {
          faceURL:
            'http://cloud-3.steamusercontent.com/ugc/469890611716048593/59582B4E0E4F1D8C3819D8BA1216F5E654BC862B/',
          backURL:
            'http://cloud-3.steamusercontent.com/ugc/469890611693556064/39BC8E10FAA97149A7BF6A8AC1E783A7E022A6C3/',
          cols: 10,
          rows: 7,
        },
        9: {
          faceURL:
            'http://cloud-3.steamusercontent.com/ugc/469890611693542667/FC40DF03381360D4824628BAABFB15C9FCAA2EE4/',
          backURL:
            'http://cloud-3.steamusercontent.com/ugc/469890611693556064/39BC8E10FAA97149A7BF6A8AC1E783A7E022A6C3/',
          cols: 10,
          rows: 7,
        },
        35: {
          faceURL:
            'http://cloud-3.steamusercontent.com/ugc/429358847330083340/893CEB10D2AF998E1C03049A56CD7AB66DC3AAF8/',
          backURL:
            'http://cloud-3.steamusercontent.com/ugc/469890611693556064/39BC8E10FAA97149A7BF6A8AC1E783A7E022A6C3/',
          cols: 10,
          rows: 7,
        },
        16: {
          faceURL:
            'http://cloud-3.steamusercontent.com/ugc/469890611716054364/F6E96F204BCC4BD14792C132CA51A7BD1D2423DC/',
          backURL:
            'http://cloud-3.steamusercontent.com/ugc/469890611693556064/39BC8E10FAA97149A7BF6A8AC1E783A7E022A6C3/',
          cols: 10,
          rows: 7,
        },
      },
    };

    const parsed = TTSParser.parseDeck(MUNCHKIN_DECK_OBJ as unknown as ObjectState);
    expect(parsed?.guid).toStrictEqual(expected.guid);
    expect(parsed?.name).toStrictEqual(expected.name);
    expect(parsed?.mass).toStrictEqual(expected.mass);
    expect(parsed?.transformation).toStrictEqual(expected.transformation);
    expect(parsed?.grids).toStrictEqual(expected.grids);
    expect(parsed?.cards).toStrictEqual(expected?.cards);
  });

  it('should return null for incorrect or malformed deck objects', () => {
    expect(TTSParser.parseDeck({} as unknown as ObjectState)).toBeNull();
  });
});
