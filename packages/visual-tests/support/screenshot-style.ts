import fs from 'node:fs';
import path from 'node:path';

export const screenshotStylePath = path.resolve(__dirname, 'screenshots.css');
export const screenshotStyle = fs.readFileSync(screenshotStylePath, 'utf8');
