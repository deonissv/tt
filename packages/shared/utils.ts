import * as crypto from 'crypto';

function getRandomString(): string {
  return crypto.randomUUID().replace('-', '');
}

export { getRandomString };
