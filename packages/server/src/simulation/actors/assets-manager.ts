import { AssetManager as AssetManagerC } from '@shared/assets';

const staticHost = process.env.VITE_STATIC_HOST ?? 'http://localhost:8080';
export const AssetsManager = AssetManagerC(staticHost);
