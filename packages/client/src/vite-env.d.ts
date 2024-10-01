/// <reference types="vite/client" />

export interface ImportMetaEnv {
  readonly VITE_STATIC_HOST: string;
  readonly VITE_API_HOST: string;
}

export interface ImportMeta {
  readonly env: ImportMetaEnv;
}
