export const fileToUrl = (file: File, type = 'application/octet-stream'): string => {
  const textureBlob = new Blob([file], { type });
  return URL.createObjectURL(textureBlob);
};
