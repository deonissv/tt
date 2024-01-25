import { AccessTokenDto } from '@shared/dto/auth/access-token';

export const fileToUrl = (file: File, type = 'application/octet-stream'): string => {
  const textureBlob = new Blob([file], { type });
  return URL.createObjectURL(textureBlob);
};

export const saveAccessToken = (tokenDto: AccessTokenDto): void => {
  document.cookie = `access_token=${tokenDto.access_token}`;
};

export const getAccessToken = (): string | undefined => {
  return document.cookie.split('=')[1];
};

export const resetAccessToken = (): void => {
  document.cookie = 'access_token' + '=; Max-Age=0';
};
