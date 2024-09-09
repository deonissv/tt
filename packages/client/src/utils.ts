import type { AccessTokenDto } from '@shared/dto/auth';
import { hasProperty, isObject } from '@shared/guards';

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

export const getErrorMsg = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (isObject(error)) {
    if (hasProperty(error, 'message')) return JSON.stringify(error.message);
    if (hasProperty(error, 'error')) return JSON.stringify(error.error);
    if (hasProperty(error, 'name')) return JSON.stringify(error.name);
  }
  return JSON.stringify(error);
};
