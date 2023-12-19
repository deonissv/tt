import * as crypto from 'crypto';

function getRandomString(): string {
  return crypto.randomBytes(16).toString('hex');
}

export { getRandomString };
