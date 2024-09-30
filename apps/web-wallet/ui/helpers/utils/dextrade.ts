import { DEXTRADE_BASE_URL } from '../constants/common';

export function getUserAvatarUrl(hash: string | undefined) {
  if (!hash) {
    return null;
  }
  return `${DEXTRADE_BASE_URL}/public/avatar/${hash}`;
}
