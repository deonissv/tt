// https://www.digipres.org/formats/mime-types/
// https://gist.github.com/hiaux0/a26b964f69955d7d3c2907b1e48788f7

export enum MimeType {
  BMP = 'image/bmp',
  GIF = 'image/gif',
  PNG = 'image/png',
  JPG = 'image/jpg',
  SVG = 'image/svg+xml',
  TIF = 'image/tif',
  TIFF = 'image/tiff',
  ICO = 'image/vnd.microsoft.icon',
  TXT = 'text/plain',
  HTML = 'text/html',
  WEBP = 'image/webp',
  OBJ = 'model/obj',
}

export const MimePictures = [
  MimeType.BMP,
  MimeType.GIF,
  MimeType.ICO,
  MimeType.PNG,
  MimeType.JPG,
  MimeType.SVG,
  MimeType.TIF,
  MimeType.TIFF,
  MimeType.WEBP,
];
