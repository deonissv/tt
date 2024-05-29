import { PRECISION_EPSILON } from '.';
import { WebSocket } from 'ws';

export function floatCompare(a: number, b: number, epsilon = PRECISION_EPSILON): boolean {
  return Math.abs(a - b) < epsilon;
}

export async function wsConnect(url: string, protocol?: string | string[]): Promise<WebSocket> {
  const ws = new WebSocket(url, protocol);
  return new Promise((resolve, reject) => {
    ws.onopen = () => {
      resolve(ws);
    };
    ws.onerror = err => {
      reject(err);
    };
  });
}

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

export function getFileMime(arrayBuffer: ArrayBuffer): string {
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
