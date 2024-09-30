import { Aml } from 'dex-services/aml';
import { Exchange } from 'dex-services/exchange';
import { Kyc } from 'dex-services/kyc';

import { DEXTRADE_BASE_URL } from '../helpers/constants';

class DextradeService {
  aml;

  kyc;

  trade;

  customFetch = fetch;

  constructor() {
    const commonOpts = {
      baseUrl: DEXTRADE_BASE_URL,
      customFetch: (...args) => this.customFetch(...args),
    };
    this.aml = new Aml(commonOpts);
    this.kyc = new Kyc(commonOpts);
    this.trade = new Exchange(commonOpts);
  }
}

const instance = new DextradeService();

export default instance;
