import { SECOND } from 'dex-helpers';

import getFetchWithThrottle from '../../ui/helpers/utils/fetch/fetch-with-trottle';

const BASE_URL = 'https://blockchain.info';

export class BitcoinInfo {
  fetch;

  constructor() {
    const fetchWithTrottle = getFetchWithThrottle(11 * SECOND, BASE_URL);
    this.fetch = fetchWithTrottle;
  }

  fetchAccount(bitcoinAddress: string) {
    return this.fetch(`${BASE_URL}/rawaddr/${bitcoinAddress}`);
  }
}

export const bitcoinInfo = new BitcoinInfo();
