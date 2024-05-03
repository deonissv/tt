import axios from 'axios';
import { LOADER_URL } from '../config';

export const modelLoaderService = {
  async load(url: string): Promise<File> {
    const response = await axios.get(LOADER_URL, {
      params: {
        url,
      },
      responseType: 'arraybuffer',
    });
    const blob = new Blob([response.data]);
    const file = new File([blob], 'Stanford.obj', { type: getFileMime(response.data) });
    return file;
  },
};

interface Mime {
  mime: string;
  pattern: (number | undefined)[];
}

const imageMimes: Mime[] = [
  {
    mime: 'image/png',
    pattern: [0x89, 0x50, 0x4e, 0x47],
  },
  {
    mime: 'image/jpeg',
    pattern: [0xff, 0xd8, 0xff],
  },
  {
    mime: 'image/gif',
    pattern: [0x47, 0x49, 0x46, 0x38],
  },
  {
    mime: 'image/webp',
    pattern: [0x52, 0x49, 0x46, 0x46, undefined, undefined, undefined, undefined, 0x57, 0x45, 0x42, 0x50, 0x56, 0x50],
  },
  // You can expand this list @see https://mimesniff.spec.whatwg.org/#matching-an-image-type-pattern
];

function isMime(bytes: Uint8Array, mime: Mime): boolean {
  return mime.pattern.every((p, i) => !p || bytes[i] === p);
}

function getFileMime(arrayBuffer: ArrayBuffer): string {
  const numBytesNeeded = Math.max(...imageMimes.map(m => m.pattern.length));
  const blob = arrayBuffer.slice(0, numBytesNeeded); // Read the needed bytes of the file
  const bytes = new Uint8Array(blob);

  for (const mime of imageMimes) {
    if (isMime(bytes, mime)) {
      return mime.mime;
    }
  }

  return '';
}
