import type { ImportMetaEnv } from './vite-env';
const env = import.meta.env as unknown as ImportMetaEnv;

export const API_HOST: string = env.VITE_API_HOST;
export const STATIC_HOST: string = env.VITE_STATIC_HOST;
export const ENDPOINT = `${API_HOST}/api/v1/`;
