import type { AccessTokenDto } from '@shared/dto/auth';

export const fileToUrl = (file: File, type = 'application/octet-stream'): string => {
  const textureBlob = new Blob([file], { type });
  return URL.createObjectURL(textureBlob);
};

export const saveAccessToken = (tokenDto: AccessTokenDto): void => {
  window.localStorage.setItem('access_token', tokenDto.access_token);
};

export const getAccessToken = (): string | null => {
  return window.localStorage.getItem('access_token');
};

export const resetAccessToken = (): void => {
  window.localStorage.removeItem('access_token');
};

export const degToRad = (deg: number): number => deg * (Math.PI / 180);
