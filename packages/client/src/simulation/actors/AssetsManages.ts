import { STATIC_HOST } from '@client/src/config';
import { AssetManagerProxy } from '@tt/builtin-actors';

export const AssetsManager = AssetManagerProxy(STATIC_HOST);
