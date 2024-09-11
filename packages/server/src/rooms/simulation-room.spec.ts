import { PROXY_PREFIX } from '@shared/constants';
import { SimulationRoom } from './simulation-room';

describe('SimulationRoom - patchStateURLs', () => {
  it('should prefix URLs in a string', () => {
    const input = 'http://example.com/image.png';
    const expected = PROXY_PREFIX + input;
    expect(SimulationRoom.patchStateURLs(input)).toEqual(expected);
  });

  it('should prefix URLs in an array', () => {
    const input = ['http://example.com/image1.png', 'http://example.com/image2.png'];
    const expected = input.map(url => PROXY_PREFIX + url);
    expect(SimulationRoom.patchStateURLs(input)).toEqual(expected);
  });

  it('should prefix URLs in an object', () => {
    const input = { image: 'http://example.com/image.png' };
    const expected = { image: PROXY_PREFIX + input.image };
    expect(SimulationRoom.patchStateURLs(input)).toEqual(expected);
  });

  it('should prefix URLs in nested objects', () => {
    const input = { nested: { image: 'http://example.com/image.png' } };
    const expected = { nested: { image: PROXY_PREFIX + input.nested.image } };
    expect(SimulationRoom.patchStateURLs(input)).toEqual(expected);
  });

  it('should not prefix URLs that are not strings', () => {
    const input = 123;
    expect(SimulationRoom.patchStateURLs(input)).toEqual(input);
  });

  it('should not prefix URLs that do not start with http', () => {
    const input = 'image.png';
    expect(SimulationRoom.patchStateURLs(input)).toEqual(input);
  });

  it('should not prefix URLs that are already prefixed', () => {
    const input = PROXY_PREFIX + 'image.png';
    expect(SimulationRoom.patchStateURLs(input)).toEqual(input);
  });

  it('should prefix URLs in complex objects', () => {
    const input = {
      str: 'http://example.com/image.png',
      preffed: PROXY_PREFIX + 'http://example.com/image.png',
      arr: [
        'http://example.com/image1.png',
        'http://example.com/image2.png',
        PROXY_PREFIX + 'http://example.com/image3.png',
      ],
      nested: { image: 'http://example.com/image.png' },
    };
    const expected = {
      str: PROXY_PREFIX + 'http://example.com/image.png',
      preffed: PROXY_PREFIX + 'http://example.com/image.png',
      arr: [
        PROXY_PREFIX + 'http://example.com/image1.png',
        PROXY_PREFIX + 'http://example.com/image2.png',
        PROXY_PREFIX + 'http://example.com/image3.png',
      ],
      nested: { image: PROXY_PREFIX + 'http://example.com/image.png' },
    };
    expect(SimulationRoom.patchStateURLs(input)).toEqual(expected);
  });
});
