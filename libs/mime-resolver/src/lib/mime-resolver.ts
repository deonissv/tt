import { MimePictures, MimeType } from './mime-types';

// const WhiteSpaces = [
//   0x20, // ' '
//   0x0c, // '\f'
//   0x0a, // '\n'
//   0x0d, // '\r'
//   0x09, // '\t'
//   0x0b, // '\v'
// ] as const;

type MimeBytePattern = (number | undefined)[];

interface MimePattern {
  mime: MimeType;
  readonly pattern: MimeBytePattern;
}

export class MimeResolver {
  static MimePatternMap: MimePattern[] = [
    // List from @see https://mimesniff.spec.whatwg.org/#matching-an-image-type-pattern
    {
      mime: MimeType.PNG,
      pattern: [0x89, 0x50, 0x4e, 0x47],
    },
    {
      mime: MimeType.JPG,
      pattern: [0xff, 0xd8, 0xff],
    },
    {
      mime: MimeType.GIF,
      pattern: [0x47, 0x49, 0x46, 0x38],
    },
    {
      mime: MimeType.WEBP,
      pattern: [0x52, 0x49, 0x46, 0x46, undefined, undefined, undefined, undefined, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50],
    },
    // {
    //   mime: MimeType.HTML,
    //   pattern: [0x3c, 0x21], // '<!'
    // },
  ];

  private static numBytesNeeded = Math.max(...this.MimePatternMap.map(m => m.pattern.length));

  static matchPattern(bytes: Uint8Array, pattern: MimeBytePattern): boolean {
    return pattern.every((p, i) => !p || bytes[i] === p);
  }

  static isHtml(arrayBuffer: Uint8Array): boolean {
    const trimmed = arrayBuffer.toString().trim();
    return trimmed.startsWith('<!') || trimmed.startsWith('<html');
  }

  static isMime(bytes: Uint8Array, mime: MimePattern): boolean {
    switch (mime.mime) {
      case MimeType.HTML:
        return this.isHtml(bytes);
      default:
        return this.matchPattern(bytes, mime.pattern);
    }
  }

  static getMime(arrayBuffer: ArrayBuffer): MimeType | undefined {
    const blob = arrayBuffer.slice(0, this.numBytesNeeded);
    const bytes = new Uint8Array(blob);
    return this.MimePatternMap.find(mime => this.isMime(bytes, mime))?.mime;
  }

  static isImage(mime: MimeType): boolean {
    return MimePictures.includes(mime);
  }
}
