import { TTSParserC } from '@client/src/TTSParser';

describe('TTSParser - parseTransform', () => {
  let parser: TTSParserC;

  beforeEach(() => {
    parser = new TTSParserC();
  });

  it('should correctly parse a standard transformation object', () => {
    const transform = {
      posX: 10,
      posY: 20,
      posZ: 30,
      rotX: 45,
      rotY: 90,
      rotZ: 180,
      scaleX: 1,
      scaleY: 1,
      scaleZ: 1,
    };
    const expected = {
      position: [10, 20, 30],
      rotation: [45, 90, 180].map(deg => (deg * Math.PI) / 180),
      scale: [1, 1, 1],
    };
    expect(parser.parseTransform(transform)).toEqual(expected);
  });

  it('should handle negative values for position and rotation', () => {
    const transform = {
      posX: -10,
      posY: -20,
      posZ: -30,
      rotX: -45,
      rotY: -90,
      rotZ: -180,
      scaleX: 1,
      scaleY: 1,
      scaleZ: 1,
    };
    const expected = {
      position: [-10, -20, -30],
      rotation: [-45, -90, -180].map(deg => (deg * Math.PI) / 180),
      scale: [1, 1, 1],
    };
    expect(parser.parseTransform(transform)).toEqual(expected);
  });

  it('should correctly handle zero values', () => {
    const transform = {
      posX: 0,
      posY: 0,
      posZ: 0,
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      scaleX: 1,
      scaleY: 1,
      scaleZ: 1,
    };
    const expected = {
      position: [0, 0, 0],
      rotation: [0, 0, 0].map(deg => (deg * Math.PI) / 180),
      scale: [1, 1, 1],
    };
    expect(parser.parseTransform(transform)).toEqual(expected);
  });
});
