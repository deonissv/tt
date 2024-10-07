import { AssetManagerProxy } from '@tt/builtin-actors';

const staticHost = process.env.VITE_STATIC_HOST ?? 'http://localhost:8080';
export const AssetsManager = AssetManagerProxy(staticHost);
