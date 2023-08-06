export const fileToUrl = (file: File, type: string = 'application/octet-stream'): string => {
  const textureBlob = new Blob([file], { type }) as Blob;
  return URL.createObjectURL(textureBlob);
};
