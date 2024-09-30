import { ServiceBridge } from 'dex-services';

export function getUserAvatarUrl(hash: string | undefined) {
  if (!hash) {
    return null;
  }
  return `${ServiceBridge.instance.baseUrl}/public/avatar/${hash}`;
}
