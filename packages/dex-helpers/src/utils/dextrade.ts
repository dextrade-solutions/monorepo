import { ServiceBridge } from 'dex-services';
import { AdItem } from '../../types';

export function getUserAvatarUrl(hash: string | undefined) {
  if (!hash) {
    return null;
  }
  return `${ServiceBridge.instance.baseUrl}/public/avatar/${hash}`;
}

export function getAdLimitPerExchange(ad: AdItem) {
  if (
    ad.maximumExchangeAmountCoin2 &&
    ad.maximumExchangeAmountCoin2 < ad.reserveSum
  ) {
    return ad.maximumExchangeAmountCoin2;
  }
  return ad.reserveSum;
}
